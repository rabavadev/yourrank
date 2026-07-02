import type { Update } from "grammy/types";
import { one, query, withTransaction } from "./db.js";
import { PLANS, type PlanTier } from "./plans.js";

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
  await tg("setWebhook", {
    url: `${publicBaseUrl}/billing/hook/${secret}`,
    secret_token: secret,
    allowed_updates: ["message", "pre_checkout_query"],
  });
}

/** Handle updates arriving on the platform bot's webhook. */
export async function handleBillingUpdate(update: Update): Promise<void> {
  // 1) Approve checkout (must answer within 10s or the payment fails).
  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    const valid = /^[0-9a-f-]{36}:(pro|agency)$/.test(q.invoice_payload);
    await tg("answerPreCheckoutQuery", {
      pre_checkout_query_id: q.id,
      ok: valid,
      ...(valid ? {} : { error_message: "Invalid purchase payload. Please retry from the dashboard." }),
    });
    return;
  }

  // 2) Record successful payment + activate the plan.
  const sp = update.message?.successful_payment;
  if (sp) {
    // Re-validate the payload here too — pre_checkout runs on a different
    // update, and we must never trust that the two came from the same client
    // state. Guards a malformed/hostile payload before we touch the DB.
    const parts = sp.invoice_payload.split(":");
    if (parts.length !== 2) return;
    const [userId, tier] = parts as [string, PlanTier];
    if (!/^[0-9a-f-]{36}$/.test(userId) || !PLANS[tier]) return;

    const chargeId = sp.telegram_payment_charge_id;

    // Record + activate atomically. Either the subscription row, the payment
    // ledger row, and the plan bump ALL land, or none do — no more half-paid
    // users with no subscription (or vice-versa) on a mid-write failure.
    //
    // Idempotent: Telegram retries the webhook until it gets a 200, so the
    // same successful_payment can arrive more than once. We dedupe on the
    // payment charge id (stored in tx_ref) and no-op on a repeat.
    const activated = await withTransaction(async (tx) => {
      const dup = await tx.one<{ id: string }>(
        `SELECT id FROM payments WHERE provider = 'telegram_stars' AND tx_ref = $1`,
        [chargeId]
      );
      if (dup) return false; // already processed this exact payment

      const sub = await tx.one<{ id: string }>(
        `INSERT INTO subscriptions (user_id, plan, status, provider, current_period_end)
         VALUES ($1, $2, 'active', 'telegram_stars', now() + interval '30 days')
         RETURNING id`,
        [userId, tier]
      );
      await tx.query(
        `INSERT INTO payments (user_id, subscription_id, provider, amount, currency, tx_ref, status)
         VALUES ($1, $2, 'telegram_stars', $3, 'XTR', $4, 'finished')`,
        [userId, sub!.id, sp.total_amount, chargeId]
      );
      await tx.query(`UPDATE users SET plan = $1, updated_at = now() WHERE id = $2`, [tier, userId]);
      return true;
    });

    // Only confirm to the user when we actually activated (not on a dup replay).
    const chatId = update.message?.chat.id;
    if (chatId && activated) {
      await tg("sendMessage", {
        chat_id: chatId,
        text: `✅ ${PLANS[tier].label} plan active for 30 days. Enjoy!`,
      }).catch(() => {});
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
