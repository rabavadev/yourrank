import type { Update } from "grammy/types";
import { query, withTransaction } from "../../../shared/db.js";
import { logProviderEvent } from "../../../shared/provider-events.js";
import { PLANS, type PlanTier } from "./plans.js";
import { computeProratedExpiry } from "../../../shared/plans.js";
import { setWebhook } from "./telegram.js";

// ------------------------------------------------------------------
// Telegram Stars billing.
//
// Flow:
//   1. Dashboard calls createStarsInvoice(uid, plan) -> invoice link.
//   2. User pays inside any Telegram client (currency XTR, no card).
//   3. Telegram sends pre_checkout_query -> we approve it.
//   4. Telegram sends message.successful_payment -> we record the
//      payment, upsert a 30-day subscription, and bump users.plan.
//
// Requires a PLATFORM bot (your bot, not a streamer's):
//   PLATFORM_BOT_TOKEN           — from @BotFather
//   PLATFORM_WEBHOOK_SECRET      — any random string; webhook is
//                                  /billing/hook/<secret>
// Set the webhook once with: POST /api/billing/setup (admin key).
// ------------------------------------------------------------------

const API = "https://api.telegram.org";
const MS_PER_DAY = 86_400_000;

function platformToken(): string {
  const t = process.env.PLATFORM_BOT_TOKEN;
  if (!t) throw new Error("PLATFORM_BOT_TOKEN is not configured");
  return t;
}

async function tg<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/bot${platformToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(`telegram ${method}: ${json.description}`);
  return json.result;
}

export function billingEnabled(): boolean {
  return Boolean(process.env.PLATFORM_BOT_TOKEN && process.env.PLATFORM_WEBHOOK_SECRET);
}

/** Create a Stars invoice link the user can open from the dashboard. */
export async function createStarsInvoice(userId: string, tier: PlanTier): Promise<string> {
  const plan = PLANS[tier];
  if (!plan || plan.starsPrice <= 0) throw new Error("plan not purchasable");
  return tg<string>("createInvoiceLink", {
    title: `${plan.label} plan — 30 days`,
    description: `Casino Bot Platform ${plan.label}: up to ${plan.maxBots} bots, ${plan.maxOffers} offers, broadcasts + postback tracking.`,
    payload: `${userId}:${tier}`,
    currency: "XTR",                       // Telegram Stars
    prices: [{ label: `${plan.label} / 30 days`, amount: plan.starsPrice }],
  });
}

/** Point the platform bot's webhook at this deployment. */
export async function setupBillingWebhook(publicBaseUrl: string): Promise<void> {
  const secret = process.env.PLATFORM_WEBHOOK_SECRET!;
  const token = platformToken();
  await setWebhook(token, `${publicBaseUrl}/billing/hook/${secret}`, secret, {
    dropPendingUpdates: false, // Don't drop billing updates
    allowedUpdates: ["message", "pre_checkout_query"],
  });
}

/** Handle updates arriving on the platform bot's webhook. */
export async function handleBillingUpdate(update: Update): Promise<void> {
  // 1) Approve checkout (must answer within 10s or the payment fails).
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    const payloadParts = String(q.invoice_payload || "").split(":");
    const payloadOk = payloadParts.length === 2 && /^[0-9a-f-]{36}$/.test(payloadParts[0]);
    const tier = (payloadOk ? payloadParts[1] : undefined) as PlanTier | undefined;
    const plan = tier ? PLANS[tier] : undefined;
    const valid =
      payloadOk &&
      Boolean(plan) &&
      q.currency === "XTR" &&
      Number(q.total_amount) === plan!.starsPrice;

    await tg("answerPreCheckoutQuery", {
      pre_checkout_query_id: q.id,
      ok: valid,
      ...(valid ? {} : { error_message: "Invalid purchase payload or amount. Please retry from the dashboard." }),
    });
    return;
  }

  // 2) Record successful payment + activate the plan.
  const sp = update.message?.successful_payment;
  if (sp) {
    // Re-validate the payload here too — pre_checkout runs on a different
    // update, and we must never trust that the two came from the same client
    // state. Guards a malformed/hostile payload before we touch the DB.
    const parts = String(sp.invoice_payload || "").split(":");
    if (parts.length !== 2) return;
    const [userId, tier] = parts as [string, PlanTier];
    if (!/^[0-9a-f-]{36}$/.test(userId) || !PLANS[tier]) return;

    const plan = PLANS[tier];
    if (sp.currency !== "XTR" || Number(sp.total_amount) !== plan.starsPrice) {
      console.error(`[billing] Stars payment mismatch: user=${userId} tier=${tier} currency=${sp.currency} amount=${sp.total_amount} expected=${plan.starsPrice}`);
      return;
    }

    const chargeId = sp.telegram_payment_charge_id;

    // Record + activate atomically. Either the subscription row, the payment
    // ledger row, and the plan bump ALL land, or none do — no more half-paid
    // users with no subscription (or vice-versa) on a mid-write failure.
    //
    // Idempotent: Telegram retries the webhook until it gets a 200, so the
    // same successful_payment can arrive more than once. We dedupe on the
    // payment charge id (stored in tx_ref) and no-op on a repeat.
    const activated = await withTransaction(async (tx) => {
      // Record the callback first; a duplicate charge id is a no-op before we
      // touch mutable state.
      const eventInserted = await logProviderEvent(tx, {
        provider: "telegram_stars",
        provider_reference: chargeId,
        event_kind: "successful_payment",
        status: "finished",
        tx_ref: chargeId,
        payload_json: sp,
      });
      if (!eventInserted) return { activated: false };

      const dup = await tx.one<{ id: string }>(
        `SELECT id FROM payments WHERE provider = 'telegram_stars' AND tx_ref = $1`,
        [chargeId]
      );
      if (dup) return { activated: false }; // already processed this exact payment

      // H-23: fetch current plan/expiry and compute a prorated expiry. The user
      // pays the full target-plan Stars price for 30 days; any remaining value of
      // the current paid plan is converted into extra days at the target rate.
      const userRow = await tx.one<{ plan: string; plan_expires_at: string | null }>(
        `SELECT plan, plan_expires_at FROM users WHERE id = $1 FOR UPDATE`,
        [userId]
      );
      const prices: Record<string, number> = {};
      for (const t of Object.keys(PLANS) as PlanTier[]) prices[t] = PLANS[t].starsPrice;
      const expiresMs = computeProratedExpiry({
        nowMs: Date.now(),
        currentPlan: userRow?.plan ?? "free",
        currentExpiryMs: userRow?.plan_expires_at ? new Date(userRow.plan_expires_at).getTime() : null,
        targetPlan: tier,
        periodDays: 30,
        prices,
        maxExtensionDays: 365,
      });
      const expiresIso = new Date(expiresMs).toISOString();

      const sub = await tx.one<{ id: string }>(
        `INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end)
         VALUES ($1, $2, 'active', 'telegram_stars', $3::timestamptz)
         RETURNING id`,
        [userId, tier, expiresIso]
      );
      await tx.query(
        `INSERT INTO payments (user_id, subscription_id, provider, amount, currency, tx_ref, status, plan_tier)
         VALUES ($1, $2, 'telegram_stars', $3, 'XTR', $4, 'finished', $5)`,
        [userId, sub!.id, plan.starsPrice, chargeId, tier]
      );
      await tx.query(
        `UPDATE users SET plan = $1, plan_expires_at = to_timestamp($2 / 1000.0), updated_at = now() WHERE id = $3`,
        [tier, expiresMs, userId]
      );
      return { activated: true, expiresMs };
    });

    // Only confirm to the user when we actually activated (not on a dup replay).
    const chatId = update.message?.chat.id;
    const expiresMs = activated?.expiresMs;
    if (chatId && expiresMs) {
      const days = Math.max(1, Math.round((expiresMs - Date.now()) / MS_PER_DAY));
      await tg("sendMessage", {
        chat_id: chatId,
        text: `✅ ${plan.label} plan active for ${days} day${days === 1 ? "" : "s"}. Enjoy!`,
      }).catch((err) => { console.error("[billing]: sendMessage confirmation failed", err); });
    }
  }
}

/** Downgrade users whose latest subscription has expired. Run nightly. */
export async function downgradeExpired(): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE users u SET plan = 'free', updated_at = now()
      WHERE u.plan <> 'free'
        AND (u.plan_expires_at IS NULL OR u.plan_expires_at <= now())
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
           WHERE s.user_id = u.id AND s.status = 'active'
             AND s.current_period_end > now()
        )
      RETURNING u.id`
  );
  return rows.length;
}
