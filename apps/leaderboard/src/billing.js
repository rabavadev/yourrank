// Billing: NOWPayments (crypto) + manual activation. Plan logic lives here.
import { json, bad, ok, uuid, requireUser, safeEqual } from "./auth.js";
import { exec, withTransaction } from "../../../shared/db.js";

// Plan definitions imported from shared source of truth.
// Re-exported here for backward compatibility with any local imports.
import { PLAN_LIMITS as _PL, BOARD_LIMITS as _BL, PLAN_PRICES as _PP, PLAN_META as _PM } from "../../../shared/plans.js";
export const PLAN_LIMITS = _PL;
export const BOARD_LIMITS = _BL;
export const PLAN_PRICES = _PP;
export const PLAN_META = _PM;

export const PRO_DAYS = 30;

// QUALITY-007: Named timing constants (no magic numbers)
const MS_PER_DAY = 86_400_000;               // 24 * 60 * 60 * 1000
const MAX_SUBSCRIPTION_EXTENSION_DAYS = 365;  // Cap subscription stacking to 1 year

// priceUsd returns the price for the given plan tier (or the env override for pro).
// priceUsd and effectivePlan are pure functions in shared/plans.js (no DB dependency).
// Re-exported here for backward compatibility.
import { priceUsd as _priceUsd, effectivePlan as _effectivePlan } from "../../../shared/plans.js";
export const priceUsd = _priceUsd;
export const effectivePlan = _effectivePlan;

export async function activatePlan(env, userId, plan, days = PRO_DAYS, { provider, amountUsd } = {}) {
  // Extend plan subscription for the given number of days.
  // Wrapped in a transaction so that the user update, subscription insert, and
  // optional payment ledger insert are all atomic.
  return withTransaction(async (tx) => {
    const uRows = await tx.unsafe(
      "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at FROM users WHERE id=$1",
      [userId]
    );
    const u = uRows[0];
    if (!u) return false;
    if (days > 0) {
      const base = (["pro", "starter", "agency"].includes(u.plan) && Number(u.plan_expires_at) > Date.now()) ? Number(u.plan_expires_at) : Date.now();
      let expiresMs = base + days * MS_PER_DAY;
              // PROD-005-v8: Cap subscription extension to MAX_SUBSCRIPTION_EXTENSION_DAYS from now.
              // Prevents unlimited stacking from repeated payments or bot abuse.
              const maxExpiry = Date.now() + MAX_SUBSCRIPTION_EXTENSION_DAYS * MS_PER_DAY;
      if (expiresMs > maxExpiry) expiresMs = maxExpiry;
      await tx.unsafe("UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3", [plan, expiresMs, userId]);
      await tx.unsafe("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', $3, to_timestamp($4 / 1000.0))", [userId, plan, provider || 'nowpayments', expiresMs]);
    } else {
      // Lifetime: use far-future date instead of NULL for plan_expires_at
      const lifetimeExpiry = new Date('2099-12-31T23:59:59Z').getTime();
      await tx.unsafe("UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3", [plan, lifetimeExpiry, userId]);
      await tx.unsafe("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'manual', $3::timestamptz)", [userId, plan, '2099-12-31T23:59:59Z']);
    }
    if (provider) {
      await tx.unsafe(
        "INSERT INTO payments (user_id,provider,amount,currency,status,plan_tier) VALUES ($1,$2,$3,$4,$5,$6)",
        [userId, provider, Number(amountUsd) || 0, "USD", "manual", plan]
      );
    }
    return true;
  });
}

// Backwards compat alias
export const activatePro = (env, userId, days, opts) => activatePlan(env, userId, 'pro', days, opts);

// Shared helper: create a NOWPayments invoice and return the parsed response (or null on failure).
async function createNowPaymentsInvoice(env, { price, orderId, description, origin }) {
  try {
    const r = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": env.NOWPAYMENTS_API_KEY, "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        price_amount: price,
        price_currency: "usd",
        order_id: orderId,
        order_description: description,
        ipn_callback_url: `${origin}/api/billing/ipn`,
        success_url: `${origin}/dashboard?upgraded=1`,
        cancel_url: `${origin}/dashboard`,
      }),
    });
    const inv = await r.json().catch(() => null);
    if (!r.ok || !inv || !inv.invoice_url) return null;
    return inv;
  } catch { return null; }
}

// POST /api/billing/checkout — create a NOWPayments invoice, return its hosted URL.
export async function handleCheckout(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (!env.NOWPAYMENTS_API_KEY) return bad("Payments aren't configured yet. Contact support.", 503);
    const origin = new URL(request.url).origin;
    // Determine which plan to upgrade to (default: next tier up)
    const current = effectivePlan(user);
    if (current === "agency") return bad("You're already on the highest plan (Agency).", 400);
    const tiers = ["free", "starter", "pro", "agency"];
    const currentIdx = tiers.indexOf(current);
    const targetPlan = currentIdx >= 0 && currentIdx < tiers.length - 1 ? tiers[currentIdx + 1] : "pro";
    const price = priceUsd(env, targetPlan);
    const orderId = `rk_${uuid()}`;
    await exec(
      "INSERT INTO payments (user_id,provider,amount,currency,status,tx_ref,plan_tier) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [user.id, "nowpayments", price, "USD", "created", orderId, targetPlan]
    );
    const inv = await createNowPaymentsInvoice(env, {
      price,
      orderId,
      description: `YourRank ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} — 30 days`,
      origin,
    });
    if (!inv) {
      await exec("UPDATE payments SET status='failed', updated_at=now() WHERE tx_ref=$1", [orderId]);
      return bad("Couldn't start the payment. Try again in a minute or contact support.", 502);
    }
    await exec("UPDATE payments SET invoice_id=$1, status='waiting', updated_at=now() WHERE tx_ref=$2",
      [String(inv.id || ""), orderId]);
    return ok({ url: inv.invoice_url });
  } catch (e) {
    console.error("[billing] checkout error:", e);
    return json({ ok: false, error: "Payment processing failed. Please try again or contact support." }, 500);
  }
}

// POST /api/billing/checkout-lifetime — create a NOWPayments invoice for $149 lifetime Pro.
export async function handleCheckoutLifetime(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (!env.NOWPAYMENTS_API_KEY) return bad("Payments aren't configured yet. Contact support.", 503);
    const current = effectivePlan(user);
    if (current === "agency") return bad("You're already on the Agency plan.", 400);
    const origin = new URL(request.url).origin;
    const price = 149;
    const orderId = `rk_lt_${uuid()}`;
    await exec(
      "INSERT INTO payments (user_id,provider,amount,currency,status,tx_ref,plan_tier) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [user.id, "nowpayments", price, "USD", "created", orderId, "pro"]
    );
    const inv = await createNowPaymentsInvoice(env, {
      price,
      orderId,
      description: "YourRank Lifetime Pro — pay once, use forever",
      origin,
    });
    if (!inv) {
      await exec("UPDATE payments SET status='failed', updated_at=now() WHERE tx_ref=$1", [orderId]);
      return bad("Couldn't start the payment. Try again in a minute or contact support.", 502);
    }
    await exec("UPDATE payments SET invoice_id=$1, status='waiting', updated_at=now() WHERE tx_ref=$2",
      [String(inv.id || ""), orderId]);
    return ok({ url: inv.invoice_url });
  } catch (e) {
    console.error("[billing] checkout error:", e);
    return json({ ok: false, error: "Payment processing failed. Please try again or contact support." }, 500);
  }
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

  await withTransaction(async (tx) => {
    const payRows = await tx.unsafe(
      "SELECT id, user_id, status, amount, plan_tier FROM payments WHERE tx_ref=$1 FOR UPDATE",
      [orderId]
    );
    const pay = payRows[0];
    if (!pay) return { code: 200 }; // Return 200 to prevent order-id enumeration

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
        // Use actual paid amount from IPN body for validation
        const actuallyPaid = Number(body.actually_paid) || Number(body.pay_amount) || 0;
        const expectedAmount = Number(pay.amount) || 0;

        // Determine target plan: prefer plan_tier column, fall back to amount-based lookup for legacy rows
        let targetPlan = pay.plan_tier;
        if (!targetPlan) {
          // Legacy fallback: reverse-engineer from expected amount (not actual paid)
          const amt = expectedAmount;
          if (amt >= PLAN_PRICES.agency - 1) targetPlan = "agency";
          else if (amt >= PLAN_PRICES.pro - 1) targetPlan = "pro";
          else if (amt >= PLAN_PRICES.starter - 1) targetPlan = "starter";
          else targetPlan = "pro";
        }

        // Validate that the actual paid amount meets the minimum threshold for the tier
        // Allow small rounding differences (within 1%) but reject significant underpayments
        const tierPrice = orderId.startsWith("rk_lt_") ? 149 : (PLAN_PRICES[targetPlan] || PLAN_PRICES.pro);
        const minAccepted = tierPrice * 0.99; // Allow 1% rounding tolerance
        if (actuallyPaid < minAccepted) {
          // Underpayment: don't grant the tier, just record the payment status
          console.warn(`[IPN] Underpayment for order ${orderId}: paid ${actuallyPaid}, expected ${tierPrice} for ${targetPlan}`);
          return { code: 200 };
        }

        // Lifetime payment ($149): activate Pro with far-future expiry
        if (orderId.startsWith("rk_lt_")) {
          const lifetimeExpiry = new Date('2099-12-31T23:59:59Z').getTime();
          await tx.unsafe(
            "UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3",
            ["pro", lifetimeExpiry, pay.user_id]
          );
          await tx.unsafe(
            "INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'nowpayments_lifetime', $3::timestamptz)",
            [pay.user_id, "pro", "2099-12-31T23:59:59Z"]
          );
        } else if (PRO_DAYS > 0) {
          const base = (["pro", "starter", "agency"].includes(u.plan) && Number(u.plan_expires_at) > Date.now()) ? Number(u.plan_expires_at) : Date.now();
          let expiresMs = base + PRO_DAYS * MS_PER_DAY;
                      // PROD-005-v8: Cap subscription extension to MAX_SUBSCRIPTION_EXTENSION_DAYS from now
                      const maxExpiry = Date.now() + MAX_SUBSCRIPTION_EXTENSION_DAYS * MS_PER_DAY;
          if (expiresMs > maxExpiry) expiresMs = maxExpiry;
          await tx.unsafe(
            "UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3",
            [targetPlan, expiresMs, pay.user_id]
          );
          await tx.unsafe(
            "INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'nowpayments', to_timestamp($3 / 1000.0))",
            [pay.user_id, targetPlan, expiresMs]
          );
        } else {
          // PRO_DAYS = 0 shouldn't happen, but if it does, use far-future date instead of NULL
          const lifetimeExpiry = new Date('2099-12-31T23:59:59Z').getTime();
          await tx.unsafe(
            "UPDATE users SET plan=$1, plan_expires_at=to_timestamp($2 / 1000.0), updated_at=now() WHERE id=$3",
            [targetPlan, lifetimeExpiry, pay.user_id]
          );
        }
      }
    }

    return { code: 200 };
  });

  return ok();
}

// Cancel the current paid subscription and downgrade to Free.
// Sets plan to 'free' and expiry to now, so effectivePlan returns free immediately.
export async function handleCancel(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  try {
    await exec("UPDATE users SET plan=$1, plan_expires_at=now(), updated_at=now() WHERE id=$2", ["free", user.id]);
    await exec("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'cancelled', 'manual', now())", [user.id, user.plan || "free"]);
    return ok({ message: "Subscription cancelled. You have been downgraded to Free." });
  } catch (err) {
    console.error("[handleCancel] failed:", err);
    return bad("Could not cancel subscription. Please try again or contact support.", 500);
  }
}
