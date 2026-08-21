// ------------------------------------------------------------------
// Single source of truth for plan tiers, limits, prices, and features.
// Both the bot Worker and the leaderboard Worker import from here.
// ------------------------------------------------------------------

export type PlanTier = "free" | "starter" | "pro" | "agency";

// ---- Leaderboard plan limits ----

/** Max players per plan */
export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 10, starter: 25, pro: 9999, agency: 9999,
};

/** Max boards per plan */
export const BOARD_LIMITS: Record<PlanTier, number> = {
  free: 1, starter: 1, pro: 3, agency: 99,
};

/** Max active Kick reward-to-credit mappings per site. */
export const CREDITS_REWARD_LIMITS: Record<PlanTier, number> = {
  free: 3, starter: 10, pro: 50, agency: 999,
};

/** Max active shop items per site. */
export const CREDITS_SHOP_LIMITS: Record<PlanTier, number> = {
  free: 5, starter: 25, pro: 100, agency: 999,
};

/** Max concurrent pending redemptions per site. */
export const CREDITS_PENDING_REDEMPTIONS_LIMITS: Record<PlanTier, number> = {
  free: 20, starter: 100, pro: 500, agency: 9999,
};

/** Max fulfilled redemptions in a rolling 30-day window per site. */
export const CREDITS_REDEMPTIONS_PER_30D_LIMITS: Record<PlanTier, number> = {
  free: 50, starter: 300, pro: 2000, agency: 99999,
};

/** Max new site viewers (rolling 30-day) per site. */
export const CREDITS_VIEWERS_PER_30D_LIMITS: Record<PlanTier, number> = {
  free: 200, starter: 1500, pro: 10000, agency: 999999,
};

/** Prices in USD per 30-day access period (no auto-renewal) */
export const PLAN_PRICES: Record<PlanTier, number> = {
  free: 0, starter: 12, pro: 29, agency: 79,
};

// ---- Plan metadata for landing-page pricing table ----

export const PLAN_META: Record<PlanTier, {
  name: string; price: string; period: string;
  highlight: boolean; features: string[]; cta: string;
}> = {
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
    name: "Starter", price: "$12", period: "/30 days",
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
    name: "Pro", price: "$29", period: "/30 days",
    highlight: true,
    features: [
      "Up to 3 leaderboards",
      "Up to 9,999 players",
      "No YourRank badge",
      "Custom domain",
      "OBS overlay widget",
      "Discord notifications",
      "Telegram notifications",
      "Automatic score updates",
      "Priority support",
    ],
    cta: "Go Pro",
  },
  agency: {
    name: "Agency", price: "$79", period: "/30 days",
    highlight: false,
    features: [
      "Up to 99 leaderboards",
      "Up to 9,999 players per board",
      "White-label branding",
      "Automatic score updates",
      "Everything in Pro",
      "Dedicated support",
    ],
    cta: "Contact us",
  },
};

// ---- Bot plan definitions ----

export interface BotPlanDef {
  tier: BotPlanTier;
  label: string;
  maxBots: number;
  maxOffers: number;
  broadcasts: boolean;
  postbacks: boolean;
  /** Price per 30 days in USD. 0 = free. */
  priceUsd: number;
}

/**
 * Bot plan tiers. "starter" is deliberately excluded: it offered nothing over
 * "free" (broadcasts/postbacks both disabled). Legacy users rows with
 * plan = 'starter' fall back to the free tier at lookup time.
 */
export type BotPlanTier = Exclude<PlanTier, "starter">; // "free" | "pro" | "agency"

export const BOT_PLANS: Record<BotPlanTier, BotPlanDef> = {
  free:   { tier: "free",   label: "Free",   maxBots: 1,  maxOffers: 3,   broadcasts: false, postbacks: false, priceUsd: PLAN_PRICES.free },
  pro:    { tier: "pro",    label: "Pro",    maxBots: 3,  maxOffers: 50,  broadcasts: true,  postbacks: true,  priceUsd: PLAN_PRICES.pro },
  agency: { tier: "agency", label: "Agency", maxBots: 25, maxOffers: 999, broadcasts: true,  postbacks: true,  priceUsd: PLAN_PRICES.agency },
};

// ── Pure helper functions (no DB dependency) ──────────────────────────────

/** Price in USD for a given plan (supports PRO_PRICE_USD env override). */
export function priceUsd(env: Record<string, string | undefined>, plan?: string): number {
  plan = plan || "pro";
  if (plan === "pro") return Number(env.PRO_PRICE_USD || PLAN_PRICES.pro);
  return (PLAN_PRICES as Record<string, number>)[plan] ?? PLAN_PRICES.pro;
}

export const PLAN_TIERS: PlanTier[] = ["free", "starter", "pro", "agency"];

export function tierIndex(tier: PlanTier | string): number {
  return PLAN_TIERS.indexOf(tier as PlanTier);
}

const MS_PER_DAY = 86_400_000;

/**
 * Compute a new expiry timestamp that credits the remaining value of the current
 * paid plan when upgrading to a higher-priced tier.
 *
 * The caller charges the full target-plan price for `periodDays`. Any unused value
 * of the current paid plan is converted into extra days at the target plan's
 * daily rate and added to the new period. The result is capped at
 * `maxExtensionDays` from `nowMs` to prevent abuse from repeated payments.
 *
 * If the target tier is not an upgrade, the current paid expiry is preserved and
 * the new `periodDays` are added from that point, ensuring the user does not lose
 * time they already paid for.
 */
export function computeProratedExpiry(args: {
  nowMs: number;
  currentPlan: PlanTier | string;
  currentExpiryMs?: number | string | null;
  targetPlan: PlanTier;
  periodDays: number;
  prices: Record<string, number>;
  maxExtensionDays: number;
}): number {
  const { nowMs, currentPlan, currentExpiryMs, targetPlan, periodDays, prices, maxExtensionDays } = args;
  const targetPrice = Number(prices[targetPlan]) || 0;
  const targetDaily = targetPrice / periodDays;
  const currentPlanStr = String(currentPlan || "free").toLowerCase();
  const currentIsPaid = ["starter", "pro", "agency"].includes(currentPlanStr);

  let baseMs = nowMs;
  let creditMs = 0;

  if (currentIsPaid && currentExpiryMs && Number(currentExpiryMs) > nowMs) {
    const currentIndex = tierIndex(currentPlanStr);
    const targetIndex = tierIndex(targetPlan);
    const remainingMs = Number(currentExpiryMs) - nowMs;

    if (targetIndex > currentIndex) {
      // Upgrade: credit remaining value at the current tier's daily rate,
      // converted to days at the (more expensive) target tier's daily rate.
      const currentPrice = Number(prices[currentPlanStr]) || 0;
      const currentDaily = currentPrice / periodDays;
      if (currentDaily > 0 && targetDaily > 0) {
        const creditDays = (remainingMs / MS_PER_DAY) * (currentDaily / targetDaily);
        creditMs = Math.round(creditDays * MS_PER_DAY);
      }
    } else {
      // Same tier or downgrade: do not consume remaining paid time.
      baseMs = Number(currentExpiryMs);
    }
  }

  const maxMs = nowMs + maxExtensionDays * MS_PER_DAY;
  if (targetDaily <= 0) {
    return Math.min(Math.max(baseMs, nowMs), maxMs);
  }
  return Math.min(baseMs + periodDays * MS_PER_DAY + creditMs, maxMs);
}

/** A user's effective plan, considering suspension and expiry. */
export function effectivePlan(user: { plan?: string; status?: string; plan_expires_at?: number | null } | null | undefined): PlanTier | "free" {
  if (!user || user.status === "suspended") return "free";
  const plan = String(user.plan || "free").toLowerCase();
  // NULL plan_expires_at is treated as expired to prevent accidental permanent grants
  const expired = user.plan_expires_at == null || Number(user.plan_expires_at) <= Date.now();
  if (expired) return "free";
  if (["agency", "pro", "starter"].includes(plan)) return plan as PlanTier;
  return "free";
}
