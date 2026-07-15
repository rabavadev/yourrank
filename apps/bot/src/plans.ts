import { one } from "../../../shared/db.js";
import { BOT_PLANS } from "../../../shared/plans.js";
import type { BotPlanDef, PlanTier } from "../../../shared/plans.js";

// Re-export for consumers that import from this module.
export type { BotPlanDef, PlanTier } from "../../../shared/plans.js";
export const PLANS = BOT_PLANS;

export async function getUserPlan(userId: string): Promise<BotPlanDef> {
  const row = await one<{ plan: PlanTier; plan_expires_at: string | null }>(
    `SELECT plan, plan_expires_at FROM users WHERE id = $1`, [userId]
  );
  // BIZ-001: If the plan has expired, downgrade to free immediately instead of
  // waiting for the nightly cron. This closes the ~24h window where expired
  // users could still access premium features.
  if (row?.plan && row.plan !== "free" && row.plan_expires_at) {
    const expiresAt = new Date(row.plan_expires_at).getTime();
    if (expiresAt <= Date.now()) {
      return PLANS.free;
    }
  }
  return PLANS[row?.plan ?? "free"] ?? PLANS.free;
}

/** Returns an error string if the user is at their plan limit, else null. */
export async function checkLimit(
  userId: string,
  kind: "bots" | "offers"
): Promise<string | null> {
  const plan = await getUserPlan(userId);
  const table = kind === "bots" ? "bots" : "offers";
  const max = kind === "bots" ? plan.maxBots : plan.maxOffers;
  const row = await one<{ n: number }>(
    `SELECT count(*)::int AS n FROM ${table} WHERE owner_id = $1` +
      (kind === "bots" ? ` AND status <> 'revoked'` : ``),
    [userId]
  );
  if ((row?.n ?? 0) >= max) {
    return `Your ${plan.label} plan allows ${max} ${kind}. Upgrade to add more.`;
  }
  return null;
}

/** Returns an error string if the feature is not in the user's plan, else null. */
export async function checkFeature(
  userId: string,
  feature: "broadcasts" | "postbacks"
): Promise<string | null> {
  const plan = await getUserPlan(userId);
  if (!plan[feature]) {
    return `${feature === "broadcasts" ? "Broadcasts" : "Postback tracking"} requires the Pro plan.`;
  }
  return null;
}

/**
 * Run the plan-limit check + the caller's INSERT atomically, holding a
 * per-(user,kind) Postgres advisory lock so two concurrent requests can't
 * both pass the count check and both insert (TOCTOU quota bypass).
 *
 * `kind` + `userId` are hashed into two int4 lock keys. The lock is
 * transaction-scoped: we run the count + the insert inside one transaction,
 * so the lock is held for exactly the duration of that unit and released on
 * commit/rollback. Failure (INSERT throws) propagates and rolls back.
 *
 * Returns { error } if over limit, otherwise { result } = await fn(tx).
 */
export async function withPlanLimit<R>(
  userId: string,
  kind: "bots" | "offers",
  fn: (tx: import("../../../shared/db.js").Tx) => Promise<R>
): Promise<{ error: string } | { result: R }> {
  const { withTransaction } = await import("../../../shared/db.js");
  // Two stable int4 keys from userId + kind. Postgres pg_advisory_xact_lock
  // takes bigint; we pack (userIdHashHi, kindHashLo) into a stable pair.
  const kindId = kind === "bots" ? 1 : 2;
  const key = await stableHashInt64(userId + ":" + kindId);
  return withTransaction(async (tx) => {
    // Acquire the transaction-scoped advisory lock — same userId+kind always
    // maps to the same key, serializing concurrent create attempts per user.
    await tx.query(`SELECT pg_advisory_xact_lock($1)`, [key]);
    // CRITICAL: read the plan on THIS transaction's connection (tx.one), not via
    // the module-level one(). The db pool is max:1 and begin() holds the only
    // connection; a module-level query would queue for that same connection and
    // deadlock (circular wait) — permanently hanging every create endpoint.
    const planRow = await tx.one<{ plan: PlanTier; plan_expires_at: string | null }>(
      `SELECT plan, plan_expires_at FROM users WHERE id = $1`, [userId]
    );
    // BIZ-001: Check plan expiry inside the transaction too.
    let planTier: PlanTier = planRow?.plan ?? "free";
    if (planTier !== "free" && planRow?.plan_expires_at) {
      if (new Date(planRow.plan_expires_at).getTime() <= Date.now()) {
        planTier = "free";
      }
    }
    const plan = PLANS[planTier] ?? PLANS.free;
    const table = kind === "bots" ? "bots" : "offers";
    const max = kind === "bots" ? plan.maxBots : plan.maxOffers;
    const row = await tx.one<{ n: number }>(
      `SELECT count(*)::int AS n FROM ${table} WHERE owner_id = $1` +
        (kind === "bots" ? ` AND status <> 'revoked'` : ``),
      [userId]
    );
    if ((row?.n ?? 0) >= max) {
      return { error: `Your ${plan.label} plan allows ${max} ${kind}. Upgrade to add more.` };
    }
    const result = await fn(tx);
    return { result };
  });
}

/** Fold a string into a stable int64 for advisory-lock keying (non-crypto). */
async function stableHashInt64(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  const view = new DataView(buf);
  // First 8 bytes -> signed int64 as a string (avoids JS BigInt/serialization quirks).
  // Mask the high bit to guarantee the result fits in PostgreSQL's signed bigint
  // range (max 2^63 - 1). Without this, values >= 2^63 overflow and pg rejects them
  // with "value is out of range for type bigint" (error 22003).
  const lo = view.getUint32(0, false);
  const hi = view.getUint32(4, false) & 0x7FFFFFFF;
  return String((BigInt(hi) << 32n) | BigInt(lo));
}
