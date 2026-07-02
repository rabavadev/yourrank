import { one } from "./db.js";

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
