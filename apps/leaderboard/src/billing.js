// Billing: NOWPayments (crypto) + manual activation. Plan logic lives here.
import { json, bad, ok, uuid, requireUser, safeEqual } from "./auth.js";
import { query, one } from "./db.js";

export const PLAN_LIMITS = { free: 10, pro: 50 };
export const PRO_DAYS = 31;
export const priceUsd = (env) => Number(env.PRO_PRICE_USD || 29);

// A user is effectively Pro only while active and unexpired.
// plan_expires_at is epoch-ms (see currentUser); NULL/0/falsy = no expiry.
export function effectivePlan(user) {
  if (!user || user.status === "suspended") return "free";
  if (user.plan === "pro" && (!user.plan_expires_at || Number(user.plan_expires_at) > Date.now())) return "pro";
  return "free";
}

export async function activatePro(env, userId, days = PRO_DAYS) {
  // plan_expires_at is TIMESTAMPTZ (NULL = lifetime / no expiry). Read it as
  // epoch-ms so the extend-from-current-expiry math matches the old behaviour.
  const u = await one(
    "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at FROM users WHERE id=$1",
    [userId]
  );
  if (!u) return false;
  // Extend from current expiry if still Pro, otherwise from now. days<=0 => lifetime (no expiry).
  if (days > 0) {
    const base = (u.plan === "pro" && Number(u.plan_expires_at) > Date.now()) ? Number(u.plan_expires_at) : Date.now();
    const expiresMs = base + days * 86400000;
    // to_timestamp() takes seconds; convert ms -> s.
    await query("UPDATE users SET plan='pro', plan_expires_at=to_timestamp($1 / 1000.0), updated_at=now() WHERE id=$2", [expiresMs, userId]);
    await query("INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end) VALUES ($1, $2, 'active', 'nowpayments', to_timestamp($3 / 1000.0))", [userId, 'pro', expiresMs]);
  } else {
    // Lifetime: no expiry.
    await query("UPDATE users SET plan='pro', plan_expires_at=NULL, updated_at=now() WHERE id=$1", [userId]);
  }
  return true;
}

// POST /api/billing/checkout — create a NOWPayments invoice, return its hosted URL.
export async function handleCheckout(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (!env.NOWPAYMENTS_API_KEY) return bad("Payments aren't configured yet. Contact support.", 503);
  const origin = new URL(request.url).origin;
  // The NOWPayments order_id is our external correlation key. The payments row's
  // own id is now a Postgres UUID, so we stash the order_id in tx_ref and look it
  // up there in the IPN (previously the order_id WAS the row id).
  const orderId = `rk_${uuid()}`;
  const price = priceUsd(env);
  await query(
    "INSERT INTO payments (user_id,provider,amount,currency,status,tx_ref) VALUES ($1,$2,$3,$4,$5,$6)",
    [user.id, "nowpayments", price, "USD", "created", orderId]
  );
  let inv = null;
  try {
    const r = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": env.NOWPAYMENTS_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        price_amount: price,
        price_currency: "usd",
        order_id: orderId,
        order_description: `RankUp Pro — ${PRO_DAYS} days`,
        ipn_callback_url: `${origin}/api/billing/ipn`,
        success_url: `${origin}/dashboard?upgraded=1`,
        cancel_url: `${origin}/dashboard`,
      }),
    });
    inv = await r.json().catch(() => null);
    if (!r.ok || !inv || !inv.invoice_url) inv = null;
  } catch { inv = null; }
  if (!inv) {
    await query("UPDATE payments SET status='failed', updated_at=now() WHERE tx_ref=$1", [orderId]);
    return bad("Couldn't start the payment. Try again in a minute or contact support.", 502);
  }
  await query("UPDATE payments SET invoice_id=$1, status='waiting', updated_at=now() WHERE tx_ref=$2",
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
  // Look up by tx_ref (the NOWPayments order_id we stored at checkout).
  const pay = await one("SELECT id, user_id, status FROM payments WHERE tx_ref=$1", [orderId]);
  if (!pay) return bad("unknown order", 404);

  // payload_json is JSONB now — store the parsed body object, not the raw string.
  await query("UPDATE payments SET status=$1, payload_json=$2::jsonb, updated_at=now() WHERE id=$3",
    [status, JSON.stringify(body), pay.id]);

  // Activate exactly once, on the first transition into a paid-equivalent
  // state. NOWPayments emits several terminal "paid" statuses: `finished` is
  // the canonical one, but some currencies/setups settle at `confirmed` and
  // never advance. Treating only `finished` as activation caused a money leak
  // — a user who paid and ended at `confirmed` stayed on Free. Fix: activate on
  // the first of {confirmed, finished} we see, but only if we haven't already
  // activated (guarded by pay.status so a replay can't double-activate).
  const PAID = ["confirmed", "finished"];
  if (PAID.includes(status) && !PAID.includes(pay.status)) {
    await activatePro(env, pay.user_id, PRO_DAYS);
  }
  return ok();
}
