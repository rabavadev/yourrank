// Billing: NOWPayments (crypto) + manual activation. Plan logic lives here.
import { json, bad, ok, uuid, requireUser, safeEqual } from "./auth.js";
import { query, one, exec, getSql } from "./db.js";

// 4-tier plan limits (player caps per plan)
export const PLAN_LIMITS = { free: 10, starter: 25, pro: 9999, agency: 9999 };
// Max boards per plan
export const BOARD_LIMITS = { free: 1, starter: 1, pro: 3, agency: 99 };
// Prices in USD per 31-day billing period
export const PLAN_PRICES = { free: 0, starter: 12, pro: 29, agency: 79 };
// Display names and feature lists for the landing page pricing table
export const PLAN_META = {
  free: {
    name: "Free", price: "$0", period: "",
    highlight: false,
    features: [
      "1 leaderboard",
      "Up to 10 players",
      "YourRank badge on your page",
      "Basic analytics (7 days)",
      "Live countdown & auto-sort",
    ],
    cta: "Start free",
  },
  starter: {
    name: "Starter", price: "$12", period: "/mo",
    highlight: false,
    features: [
      "1 leaderboard",
      "Up to 25 players",
      "No YourRank badge",
      "Full analytics (30 days)",
      "CSV import",
      "Custom referral code",
    ],
    cta: "Start",
  },
  pro: {
    name: "Pro", price: "$29", period: "/mo",
    highlight: true,
    features: [
      "Up to 3 leaderboards",
      "Unlimited players",
      "No YourRank badge",
      "Custom domain",
      "OBS overlay widget",
      "Discord webhooks",
      "Telegram notifications",
      "Priority support",
    ],
    cta: "Go Pro",
  },
  agency: {
    name: "Agency", price: "$79", period: "/mo",
    highlight: false,
    features: [
      "Unlimited leaderboards",
      "Unlimited players",
      "White-label branding",
      "API access",
      "Everything in Pro",
      "Dedicated support",
    ],
    cta: "Contact us",
  },
};

export const PRO_DAYS = 31;

// priceUsd returns the price for the given plan tier (or the env override for pro).
export function priceUsd(env, plan = "pro") {
  if (plan === "pro") return Number(env.PRO_PRICE_USD || PLAN_PRICES.pro);
  return PLAN_PRICES[plan] ?? PLAN_PRICES.pro;
}

// A user's effective plan. Plans: free < starter < pro < agency.
export function effectivePlan(user) {
  if (!user || user.status === "suspended") return "free";
  const plan = String(user.plan || "free").toLowerCase();
  const expired = user.plan_expires_at && Number(user.plan_expires_at) > 0 && Number(user.plan_expires_at) <= Date.now();
  if (expired) return "free";
  if (["agency", "pro", "starter"].includes(plan)) return plan;
  return "free";
}

export async function activatePlan(env, userId, plan, days = PRO_DAYS, { provider, amountUsd } = {}) {
  // Extend plan subscription for the given number of days.
  // Wrapped in a transaction so that the user update, subscription insert, and
  // optional payment ledger insert are all atomic.
  return getSql().begin(async (tx) => {
    const uRows = await tx.unsafe(
      "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at FROM users WHERE id=$1",
      [userId]
    );
    const u = uRows[0];
    if (!u) return false;
    if (days > 0) {
      const base = (["pro", "starter", "agency"].includes(u.plan) && Number(u.plan_expires_at) > Date.now()) ? Number(u.plan_expires_at) : Date.now();
      const expiresMs = base + days * 86400000;
      await tx.unsafe("UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3", [plan, expiresMs, userId]);
      await tx.unsafe("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', $3, to_timestamp($4 / 1000.0))", [userId, plan, provider || 'nowpayments', expiresMs]);
    } else {
      // Lifetime: no expiry.
      await tx.unsafe("UPDATE users SET plan=$1, plan_expires_at=NULL, updated_at=now() WHERE id=$2", [plan, userId]);
      await tx.unsafe("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'manual', $3::timestamptz)", [userId, plan, '2099-12-31T23:59:59Z']);
    }
    if (provider) {
      await tx.unsafe(
        "INSERT INTO payments (user_id,provider,amount,currency,status) VALUES ($1,$2,$3,$4,$5)",
        [userId, provider, Number(amountUsd) || 0, "USD", "manual"]
      );
    }
    return true;
  });
}

// Backwards compat alias
export const activatePro = (env, userId, days, opts) => activatePlan(env, userId, 'pro', days, opts);

// POST /api/billing/checkout — create a NOWPayments invoice, return its hosted URL.
export async function handleCheckout(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (!env.NOWPAYMENTS_API_KEY) return bad("Payments aren't configured yet. Contact support.", 503);
  const origin = new URL(request.url).origin;
  // Determine which plan to upgrade to (default: next tier up)
  const current = effectivePlan(user);
  const tiers = ["free", "starter", "pro", "agency"];
  const currentIdx = tiers.indexOf(current);
  const targetPlan = currentIdx >= 0 && currentIdx < tiers.length - 1 ? tiers[currentIdx + 1] : "pro";
  const price = priceUsd(env, targetPlan);
  const orderId = `rk_${uuid()}`;
  await exec(
    "INSERT INTO payments (user_id,provider,amount,currency,status,tx_ref) VALUES ($1,$2,$3,$4,$5,$6)",
    [user.id, "nowpayments", price, "USD", "created", orderId]
  );
  let inv = null;
  try {
    const r = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": env.NOWPAYMENTS_API_KEY, "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        price_amount: price,
        price_currency: "usd",
        order_id: orderId,
        order_description: `YourRank ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} — ${PRO_DAYS} days`,
        ipn_callback_url: `${origin}/api/billing/ipn`,
        success_url: `${origin}/dashboard?upgraded=1`,
        cancel_url: `${origin}/dashboard`,
      }),
    });
    inv = await r.json().catch(() => null);
    if (!r.ok || !inv || !inv.invoice_url) inv = null;
  } catch { inv = null; }
  if (!inv) {
    await exec("UPDATE payments SET status='failed', updated_at=now() WHERE tx_ref=$1", [orderId]);
    return bad("Couldn't start the payment. Try again in a minute or contact support.", 502);
  }
  await exec("UPDATE payments SET invoice_id=$1, status='waiting', updated_at=now() WHERE tx_ref=$2",
    [String(inv.id || ""), orderId]);
  return ok({ url: inv.invoice_url });
}

// Recursively sort object keys — NOWPayments signs the key-sorted JSON body.
function sortObj(v) {
  if (Array.isArray(v)) return v.map(sortObj);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortObj(v[k]);
    return out;
  }
  return v;
}

async function hmacSha512Hex(secret, msg) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// POST /api/billing/ipn — NOWPayments calls this on every payment status change.
export async function handleIpn(request, env) {
  if (!env.NOWPAYMENTS_IPN_SECRET) return bad("not configured", 503);
  const raw = await request.text();
  let body;
  try { body = JSON.parse(raw); } catch { return bad("bad body"); }
  const sig = request.headers.get("x-nowpayments-sig") || "";
  const expected = await hmacSha512Hex(env.NOWPAYMENTS_IPN_SECRET, JSON.stringify(sortObj(body)));
  if (!sig || !safeEqual(sig, expected)) return bad("bad signature", 401);

  const orderId = String(body.order_id || "");
  const status = String(body.payment_status || "");

  const result = await getSql().begin(async (tx) => {
    const payRows = await tx.unsafe(
      "SELECT id, user_id, status, amount FROM payments WHERE tx_ref=$1 FOR UPDATE",
      [orderId]
    );
    const pay = payRows[0];
    if (!pay) return { code: 404, msg: "unknown order" };

    await tx.unsafe(
      "UPDATE payments SET status=$1, payload_json=$2::jsonb, updated_at=now() WHERE id=$3",
      [status, JSON.stringify(body), pay.id]
    );

    const PAID = ["confirmed", "finished"];
    if (PAID.includes(status) && !PAID.includes(pay.status)) {
      const uRows = await tx.unsafe(
        "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at FROM users WHERE id=$1 FOR UPDATE",
        [pay.user_id]
      );
      const u = uRows[0];
      if (u) {
        // Determine target plan from payment amount
        const amt = Number(pay.amount) || 0;
        let targetPlan = "pro";
        if (amt >= PLAN_PRICES.agency - 1) targetPlan = "agency";
        else if (amt >= PLAN_PRICES.pro - 1) targetPlan = "pro";
        else if (amt >= PLAN_PRICES.starter - 1) targetPlan = "starter";

        if (PRO_DAYS > 0) {
          const base = (["pro", "starter", "agency"].includes(u.plan) && Number(u.plan_expires_at) > Date.now()) ? Number(u.plan_expires_at) : Date.now();
          const expiresMs = base + PRO_DAYS * 86400000;
          await tx.unsafe(
            "UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3",
            [targetPlan, expiresMs, pay.user_id]
          );
          await tx.unsafe(
            "INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'nowpayments', to_timestamp($3 / 1000.0))",
            [pay.user_id, targetPlan, expiresMs]
          );
        } else {
          await tx.unsafe(
            "UPDATE users SET plan=$1, plan_expires_at=NULL, updated_at=now() WHERE id=$2",
            [targetPlan, pay.user_id]
          );
        }
      }
    }

    return { code: 200 };
  });

  if (result.code === 404) return bad(result.msg, 404);
  return ok();
}
