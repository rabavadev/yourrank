import { one, query } from "./db.js";

// ------------------------------------------------------------------
// Plan definitions + gating. users.plan is the source of truth;
// the billing webhook upgrades it, the nightly job downgrades
// expired subscriptions back to free.
// ------------------------------------------------------------------

export type PlanTier = "free" | "pro" | "agency";

export interface PlanDef {
  tier: PlanTier;
  label: string;
  maxBots: number;
  maxOffers: number;
  broadcasts: boolean;
  postbacks: boolean;
  /** Price per 30 days in Telegram Stars (XTR). 0 = not purchasable. */
  starsPrice: number;
}

export const PLANS: Record<PlanTier, PlanDef> = {
  free:   { tier: "free",   label: "Free",   maxBots: 1,  maxOffers: 3,   broadcasts: false, postbacks: false, starsPrice: 0 },
  pro:    { tier: "pro",    label: "Pro",    maxBots: 3,  maxOffers: 50,  broadcasts: true,  postbacks: true,  starsPrice: 1250 },
  agency: { tier: "agency", label: "Agency", maxBots: 25, maxOffers: 999, broadcasts: true,  postbacks: true,  starsPrice: 4500 },
};

export async function getUserPlan(userId: string): Promise<PlanDef> {
  const row = await one<{ plan: PlanTier }>(`SELECT plan FROM users WHERE id = $1`, [userId]);
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
  fn: (tx: import("./db.js").Tx) => Promise<R>
): Promise<{ error: string } | { result: R }> {
  const { withTransaction } = await import("./db.js");
  // Two stable int4 keys from userId + kind. Postgres pg_advisory_xact_lock
  // takes bigint; we pack (userIdHashHi, kindHashLo) into a stable pair.
  const kindId = kind === "bots" ? 1 : 2;
  const key = await stableHashInt64(userId + ":" + kindId);
  return withTransaction(async (tx) => {
    // Acquire the transaction-scoped advisory lock — same userId+kind always
    // maps to the same key, serializing concurrent create attempts per user.
    await tx.query(`SELECT pg_advisory_xact_lock($1)`, [key]);
    const plan = await getUserPlan(userId);
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
  // First 8 bytes -> int64 as a string (avoids JS BigInt/serialization quirks).
  const lo = view.getUint32(0, false);
  const hi = view.getUint32(4, false);
  return String((BigInt(hi) << 32n) | BigInt(lo));
}
