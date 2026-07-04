"use strict";
// ------------------------------------------------------------------
// Single source of truth for plan tiers, limits, prices, and features.
// Both the bot Worker and the leaderboard Worker import from here.
// ------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_PLANS = exports.PLAN_META = exports.PLAN_PRICES = exports.BOARD_LIMITS = exports.PLAN_LIMITS = void 0;
// ---- Leaderboard plan limits ----
/** Max players per plan */
exports.PLAN_LIMITS = {
    free: 10, starter: 25, pro: 9999, agency: 9999,
};
/** Max boards per plan */
exports.BOARD_LIMITS = {
    free: 1, starter: 1, pro: 3, agency: 99,
};
/** Prices in USD per 31-day billing period */
exports.PLAN_PRICES = {
    free: 0, starter: 12, pro: 29, agency: 79,
};
// ---- Plan metadata for landing-page pricing table ----
exports.PLAN_META = {
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
exports.BOT_PLANS = {
    free: { tier: "free", label: "Free", maxBots: 1, maxOffers: 3, broadcasts: false, postbacks: false, starsPrice: 0 },
    starter: { tier: "starter", label: "Starter", maxBots: 2, maxOffers: 25, broadcasts: false, postbacks: false, starsPrice: 0 },
    pro: { tier: "pro", label: "Pro", maxBots: 3, maxOffers: 50, broadcasts: true, postbacks: true, starsPrice: 2900 },
    agency: { tier: "agency", label: "Agency", maxBots: 25, maxOffers: 999, broadcasts: true, postbacks: true, starsPrice: 7900 },
};
