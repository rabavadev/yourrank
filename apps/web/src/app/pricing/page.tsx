import { Fragment } from "react";
import type { Metadata } from "next";
import {
  BOARD_LIMITS,
  BOT_PLANS,
  CREDITS_REWARD_LIMITS,
  CREDITS_SHOP_LIMITS,
  PLAN_LIMITS,
  PLAN_PRICES,
  type PlanTier,
} from "@yourrank/shared/plans";
import { MagneticCursor } from "../../components/home/magnetic-cursor";
import { MarketingShell } from "../../components/site-shell";

export const metadata: Metadata = {
  title: "Pricing · YourRank",
  description:
    "YourRank suite pricing: Free, Starter, Pro and Agency plans for leaderboards, Telegram bot, and viewer rewards & shop.",
  alternates: { canonical: "https://yourrank.site/pricing" },
};

const TIERS = ["free", "starter", "pro", "agency"] as const;

const n = (value: number) => value.toLocaleString("en-US");

function price(tier: PlanTier) {
  return PLAN_PRICES[tier] === 0 ? "$0" : `$${PLAN_PRICES[tier]}`;
}

function botLimits(tier: PlanTier) {
  return BOT_PLANS[tier === "starter" ? "free" : tier];
}

const TIER_CONTENT: Record<
  PlanTier,
  { audience: string; features: string[]; cta: { label: string; href: string } }
> = {
  free: {
    audience: "For trying YourRank",
    features: [
      `${BOARD_LIMITS.free} leaderboard`,
      `Up to ${PLAN_LIMITS.free} players`,
      `${botLimits("free").maxBots} Telegram bot`,
      `Up to ${botLimits("free").maxOffers} tracked offers`,
      `Up to ${CREDITS_REWARD_LIMITS.free} credit rules`,
      `Up to ${CREDITS_SHOP_LIMITS.free} shop items`,
      "YourRank badge on your page",
      "Basic analytics (7 days)",
    ],
    cta: { label: "Start free", href: "/signup?plan=free" },
  },
  starter: {
    audience: "For growing streamers",
    features: [
      `${BOARD_LIMITS.starter} leaderboard`,
      `Up to ${PLAN_LIMITS.starter} players`,
      `${botLimits("starter").maxBots} Telegram bot`,
      `Up to ${botLimits("starter").maxOffers} tracked offers`,
      `Up to ${CREDITS_REWARD_LIMITS.starter} credit rules`,
      `Up to ${CREDITS_SHOP_LIMITS.starter} shop items`,
      "No YourRank badge",
      "Full analytics (30 days)",
      "CSV import",
    ],
    cta: { label: "Choose Starter", href: "/signup?plan=starter" },
  },
  pro: {
    audience: "For serious creators",
    features: [
      `Up to ${BOARD_LIMITS.pro} leaderboards`,
      `Up to ${n(PLAN_LIMITS.pro)} players`,
      `Up to ${botLimits("pro").maxBots} Telegram bots`,
      `Up to ${botLimits("pro").maxOffers} tracked offers`,
      `Up to ${CREDITS_REWARD_LIMITS.pro} credit rules`,
      `Up to ${CREDITS_SHOP_LIMITS.pro} shop items`,
      "Custom domain",
      "OBS overlay widget",
      "Discord webhooks",
      "Signed score API",
      "Priority support",
    ],
    cta: { label: "Go Pro", href: "/signup?plan=pro" },
  },
  agency: {
    audience: "For teams & networks",
    features: [
      `Up to ${BOARD_LIMITS.agency} leaderboards`,
      `Up to ${n(PLAN_LIMITS.agency)} players per board`,
      `Up to ${botLimits("agency").maxBots} Telegram bots`,
      `Up to ${botLimits("agency").maxOffers} tracked offers`,
      `Up to ${CREDITS_REWARD_LIMITS.agency} credit rules`,
      `Up to ${CREDITS_SHOP_LIMITS.agency} shop items`,
      "White-label branding",
      "Everything in Pro",
      "Dedicated support",
    ],
    cta: { label: "Contact us", href: "/help/support?area=billing" },
  },
};

const CHECK = "✓";
const DASH = "—";

const COMPARISON: Array<{
  section: string;
  rows: Array<{ label: string; values: [string, string, string, string] }>;
}> = [
  {
    section: "Leaderboards & contests",
    rows: [
      {
        label: "Active leaderboards",
        values: [`${BOARD_LIMITS.free} board`, `${BOARD_LIMITS.starter} board`, `${BOARD_LIMITS.pro} boards`, `${BOARD_LIMITS.agency} boards`],
      },
      {
        label: "Players & scores per board",
        values: [`Up to ${PLAN_LIMITS.free}`, `Up to ${PLAN_LIMITS.starter}`, `Up to ${n(PLAN_LIMITS.pro)}`, `Up to ${n(PLAN_LIMITS.agency)}`],
      },
      { label: "Live countdown & auto-sort", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Custom domain (CNAME)", values: [DASH, DASH, CHECK, CHECK] },
      { label: "OBS overlay streaming widget", values: [DASH, DASH, CHECK, CHECK] },
      { label: "YourRank branding badge", values: ["Required", "Removed", "Removed", "White-label"] },
    ],
  },
  {
    section: "Telegram community bots",
    rows: [
      {
        label: "Connected Telegram bots",
        values: [`${botLimits("free").maxBots} bot`, `${botLimits("starter").maxBots} bot`, `${botLimits("pro").maxBots} bots`, `${botLimits("agency").maxBots} bots`],
      },
      {
        label: "Tracked sponsor offers",
        values: [`Up to ${botLimits("free").maxOffers}`, `Up to ${botLimits("starter").maxOffers}`, `Up to ${botLimits("pro").maxOffers}`, `Up to ${botLimits("agency").maxOffers}`],
      },
      { label: "Custom chat commands", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Broadcasts & alerts", values: [DASH, DASH, CHECK, CHECK] },
    ],
  },
  {
    section: "Viewer rewards & shop",
    rows: [
      {
        label: "Credit rules & multipliers",
        values: [`Up to ${CREDITS_REWARD_LIMITS.free}`, `Up to ${CREDITS_REWARD_LIMITS.starter}`, `Up to ${CREDITS_REWARD_LIMITS.pro}`, `Up to ${CREDITS_REWARD_LIMITS.agency}`],
      },
      {
        label: "Shop catalog items",
        values: [`Up to ${CREDITS_SHOP_LIMITS.free}`, `Up to ${CREDITS_SHOP_LIMITS.starter}`, `Up to ${CREDITS_SHOP_LIMITS.pro}`, `Up to ${CREDITS_SHOP_LIMITS.agency}`],
      },
      { label: "Kick & Discord viewer login", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Automated fulfillment ledger", values: [DASH, CHECK, CHECK, CHECK] },
    ],
  },
  {
    section: "Analytics, security & APIs",
    rows: [
      { label: "Analytics data retention", values: ["7 days", "30 days", "Unlimited", "Unlimited"] },
      { label: "Signed score & postback API", values: [DASH, DASH, CHECK, CHECK] },
      { label: "Public read API", values: [CHECK, CHECK, CHECK, CHECK] },
      { label: "Discord webhooks", values: [DASH, DASH, CHECK, CHECK] },
      { label: "CSV player import & export", values: [DASH, CHECK, CHECK, CHECK] },
      { label: "Support level", values: ["Community", "Standard", "Priority", "Dedicated"] },
    ],
  },
];

const BILLING_FAQ = [
  {
    q: "Do plans auto-renew?",
    a: "No. Each payment gives you 30 days of access. When it expires, your page drops back to the Free plan — you can renew manually whenever you're ready.",
  },
  {
    q: "Is there a free trial?",
    a: "Two ways: the Free plan never expires — use it as long as you like — and you can start a 7-day free Pro trial from your Plan & billing settings to test every Pro feature before you pay.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Paid plans are billed in crypto (BTC, ETH, USDT and 100+ more) through NOWPayments. Card checkout is not available yet.",
  },
  {
    q: "Do you offer refunds?",
    a: "Paid periods keep working until the end of the 30 days and are not partially refunded. Crypto and lifetime purchases are non-refundable. See our refund policy.",
  },
  {
    q: "Do viewers need to pay?",
    a: "No. Viewers log in with Kick or Discord for free and spend credits they earn from channel-point redemptions. Streamers control the rewards and shop.",
  },
];

export default function PricingPage() {
  return (
    <MagneticCursor>
      <MarketingShell>
        <section className="px-6 pb-16 pt-32 sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-devin-primary">Pricing</p>
            <h1 className="mt-4 max-w-[16ch] text-[clamp(2.75rem,6.5vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.035em] text-devin-ink">
              Start free. Upgrade when a product is pulling weight.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-devin-ink-soft">
              Every plan covers all three products — leaderboards, the Telegram bot, and rewards &amp; shop — with
              product-specific limits. Paid plans are 30-day access periods billed in crypto, with no auto-renewal.
            </p>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-[16px] border border-devin-line bg-devin-line sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => {
              const content = TIER_CONTENT[tier];
              const highlight = tier === "pro";
              return (
                <article
                  key={tier}
                  className={`flex flex-col bg-white p-7 ${highlight ? "relative outline outline-1 -outline-offset-1 outline-devin-primary" : ""}`}
                >
                  {highlight && (
                    <span className="mb-5 self-start rounded-full bg-devin-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white">
                      Most popular
                    </span>
                  )}
                  <h2 className="text-lg font-medium capitalize text-devin-ink">{tier}</h2>
                  <p className="mt-3 text-4xl font-medium tracking-[-0.02em] text-devin-ink">
                    {price(tier)}
                    <span className="ml-1 text-sm font-normal text-devin-ink-soft">
                      {tier === "free" ? "forever" : "/30 days"}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-devin-ink-soft">{content.audience}</p>
                  <ul className="mt-6 grid flex-1 content-start gap-2.5 border-t border-devin-line pt-6 text-sm text-devin-ink">
                    {content.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5">
                        <span aria-hidden="true" className="text-devin-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={content.cta.href}
                    data-magnetic
                    className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-[2px] px-4 py-2.5 text-sm font-medium transition-colors ${
                      highlight
                        ? "bg-devin-primary text-white hover:bg-devin-primary-hover"
                        : "border border-devin-line text-devin-ink hover:border-devin-ink/40"
                    }`}
                  >
                    {content.cta.label}
                  </a>
                </article>
              );
            })}
          </div>
          <div className="mx-auto mt-6 flex max-w-6xl flex-col items-start justify-between gap-4 rounded-[16px] border border-devin-line bg-devin-secondary/35 px-7 py-6 sm:flex-row sm:items-center">
            <p className="text-sm text-devin-ink">
              <span className="font-medium">Prefer to pay once?</span> Lifetime Pro — every Pro feature, no monthly
              bills. <span className="font-mono">$149 one-time.</span>
            </p>
            <a
              href="/signup?plan=lifetime"
              data-magnetic
              className="inline-flex min-h-11 items-center rounded-[2px] bg-devin-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Get Lifetime Pro
            </a>
          </div>
          <p className="mx-auto mt-5 max-w-6xl font-mono text-[10px] uppercase tracking-[0.1em] text-devin-ink-soft">
            7-day Pro trial · No card required · No automatic renewal · Cancel anytime
          </p>
        </section>

        <section className="border-y border-devin-line bg-devin-secondary/35 px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-devin-ink sm:text-4xl">
              Compare plans in detail.
            </h2>
            <div className="mt-10 overflow-x-auto rounded-[16px] border border-devin-line bg-white" role="region" aria-label="Plan comparison" tabIndex={0}>
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-devin-line text-left">
                    <th scope="col" className="px-5 py-4 font-medium text-devin-ink">Features &amp; limits</th>
                    {TIERS.map((tier) => (
                      <th key={tier} scope="col" className={`px-5 py-4 capitalize ${tier === "pro" ? "bg-devin-secondary/45" : ""}`}>
                        <span className="block font-medium text-devin-ink">{tier}</span>
                        <span className="block font-mono text-[11px] font-normal text-devin-ink-soft">
                          {price(tier)}{tier === "free" ? " forever" : " / 30d"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((group) => (
                    <Fragment key={group.section}>
                      <tr className="border-b border-devin-line bg-devin-secondary/25">
                        <th scope="colgroup" colSpan={5} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-devin-ink-soft">
                          {group.section}
                        </th>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row.label} className="border-b border-devin-line last:border-b-0">
                          <th scope="row" className="px-5 py-3.5 text-left font-normal text-devin-ink">{row.label}</th>
                          {row.values.map((value, index) => (
                            <td key={TIERS[index]} className={`px-5 py-3.5 text-devin-ink-soft ${TIERS[index] === "pro" ? "bg-devin-secondary/45 text-devin-ink" : ""}`}>
                              {value === CHECK ? <span className="text-devin-primary">{CHECK}</span> : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className="text-3xl font-medium tracking-[-0.02em] text-devin-ink sm:text-4xl">Billing questions.</h2>
              <a href="/faq" className="text-sm font-medium text-devin-ink underline decoration-devin-line underline-offset-4 hover:decoration-devin-primary">
                Product questions → FAQ
              </a>
            </div>
            <dl className="mt-10 border-t border-devin-line">
              {BILLING_FAQ.map((item) => (
                <div key={item.q} className="grid gap-3 border-b border-devin-line py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                  <dt className="text-lg font-medium text-devin-ink">{item.q}</dt>
                  <dd className="max-w-xl text-[15px] leading-relaxed text-devin-ink-soft">
                    {item.q === "Do you offer refunds?" ? (
                      <>
                        Paid periods keep working until the end of the 30 days and are not partially refunded. Crypto
                        and lifetime purchases are non-refundable. See{" "}
                        <a href="/refund" className="text-devin-ink underline decoration-devin-line underline-offset-4 hover:decoration-devin-primary">
                          our refund policy
                        </a>
                        .
                      </>
                    ) : (
                      item.a
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-14 flex justify-center">
              <a
                href="/signup"
                data-magnetic
                className="inline-flex min-h-12 items-center rounded-[2px] bg-devin-primary px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-devin-primary-hover"
              >
                Create your free page
              </a>
            </div>
          </div>
        </section>
      </MarketingShell>
    </MagneticCursor>
  );
}
