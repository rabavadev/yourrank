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
    name: "Agency", price: "$79", period: "/30 days",
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

// ---- Bot plan definitions (Telegram Stars pricing) ----
// Stars prices match USD pricing to ensure pricing parity across channels.

export interface BotPlanDef {
  tier: PlanTier;
  label: string;
  maxBots: number;
  maxOffers: number;
  broadcasts: boolean;
  postbacks: boolean;
  /** Price per 30 days in Telegram Stars (XTR). 0 = not purchasable. */
  starsPrice: number;
}

export const BOT_PLANS: Record<PlanTier, BotPlanDef> = {
  free:   { tier: "free",   label: "Free",   maxBots: 1,  maxOffers: 3,   broadcasts: false, postbacks: false, starsPrice: 0 },
  starter:{ tier: "starter",label: "Starter", maxBots: 2,  maxOffers: 25,  broadcasts: false, postbacks: false, starsPrice: 0 },
  pro:    { tier: "pro",    label: "Pro",    maxBots: 3,  maxOffers: 50,  broadcasts: true,  postbacks: true,  starsPrice: 2900 },
  agency: { tier: "agency", label: "Agency", maxBots: 25, maxOffers: 999, broadcasts: true,  postbacks: true,  starsPrice: 7900 },
};

// ── Pure helper functions (no DB dependency) ──────────────────────────────

/** Price in USD for a given plan (supports PRO_PRICE_USD env override). */
export function priceUsd(env: Record<string, string | undefined>, plan?: string): number {
  plan = plan || "pro";
  if (plan === "pro") return Number(env.PRO_PRICE_USD || PLAN_PRICES.pro);
  return (PLAN_PRICES as Record<string, number>)[plan] ?? PLAN_PRICES.pro;
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
