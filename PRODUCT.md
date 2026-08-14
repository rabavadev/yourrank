# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Streamers and creator operators who need to launch and run community experiences without coding or hosting infrastructure.
- Agencies and creator networks managing multiple streamer sites and higher-volume integrations.
- Viewers who visit streamer sites, follow standings, earn credits, play games, and redeem rewards.
- Telegram subscribers who receive messages, use commands, and follow tracked offers.

## Product Purpose

YourRank is a suite of three peer products under one operator account:

1. **Sites** — branded public streamer destinations containing home content, leaderboards, games, offers, and viewer account access.
2. **Telegram** — bots, replies and commands, tracked offers, subscribers, and broadcast messages.
3. **Credits & Shop** — Kick-connected earning rules, viewer balances, shop inventory, games, redemptions, and fulfilment.

Success means an operator can activate the product they need quickly, publish or connect it confidently, and understand the resulting audience activity and conversions. Viewers should be able to move from discovery to participation to reward without losing context.

## Positioning

YourRank connects a branded public community destination, Telegram communication, viewer rewards, and conversion attribution in one account. Its distinctive mechanism is the closed engagement loop: attract viewers, give them reasons to participate, bring them back through Telegram and credits, and measure the resulting actions.

## Operating Context

- Operators often work during live streams in low-light, multi-screen environments and need fast, interruption-safe workflows.
- Sites are selected explicitly; credits, games, redemptions, and public content are site-scoped.
- Operators publish sites, update rankings, connect Telegram bots, configure offers, process redemptions, and monitor outcomes.
- Public sites run both at `yourrank.site/<slug>` and on custom domains.
- Streamer accounts, viewer accounts, leaderboard player records, and Telegram subscriber relationships are distinct identities.

## Capabilities and Constraints

- The product is a Cloudflare Workers monorepo with separate Leaderboard and Bot Workers sharing Postgres-backed sessions, plans, and one origin.
- Existing external and compatibility routes must remain functional when visible navigation or terminology changes.
- Public anonymous HTML may be cached; viewer-specific data must not leak into cached responses.
- Credits and rewards are entertainment features. YourRank does not take bets or pay prizes.
- Plan entitlements are shared across products, but displayed limits must come from the canonical plan model rather than duplicated marketing copy.
- Background queues process analytics, conversions, notifications, and some fulfilment work; the UI must distinguish queued, processing, and completed states.
- Open product decision: the current payment implementation and older billing documentation disagree about recurring access, Telegram Stars, crypto checkout, and lifetime grants. Redesign work must not invent billing terms before that is reconciled.
- Open operational decision: account and viewer export infrastructure exists, but deployment bindings are not confirmed.

## Brand Commitments

- Product name: YourRank.
- Approved product architecture: Sites, Telegram, and Credits & Shop are peer products under one account.
- Voice is direct, operational, and understandable to non-technical streamers. Product copy names the user-visible outcome, not infrastructure.
- The product must remain explicit that it is for entertainment and community engagement, not gambling custody or prize payment.

## Evidence on Hand

- Approved suite positioning: `docs/product-positioning.md`.
- Current route and Worker architecture: `ARCHITECTURE.md`, `apps/leaderboard/src`, and `apps/bot/src`.
- Current dashboard reference captures: `docs/design/dashboard-v3/`.
- Demonstration data and route: `apps/leaderboard/src/demo-data.js` and `/demo`.
- Journey evidence: `e2e/src/smoke.test.ts` and focused Worker tests.
- No verified customer testimonials, adoption metrics, conversion benchmarks, or customer logos are present. Marketing must not fabricate them.

## Product Principles

1. **Launch the goal, not the software.** Ask what the operator wants to accomplish and reveal only the setup needed for that outcome.
2. **One suite, clear local context.** Global product switching, account, and help stay consistent; site- or bot-specific context remains unmistakable.
3. **State must be truthful.** Never label queued work as sent, permanent chrome as live, or unavailable integrations as active.
4. **Close every loop.** Creation flows surface the created link or result, editing flows show the outcome, and every destination provides an obvious next step or return path.
5. **Protect momentum.** Preserve drafts, attach errors to the right control, use smart defaults, and put upgrades or recovery at the point of need.

## Accessibility & Inclusion

Target WCAG 2.2 AA for customer-facing and operator interfaces. All essential workflows must support keyboard navigation, visible focus, reduced motion, 44px touch targets where practical, semantic status announcements, high-contrast text and controls, and responsive use down to small mobile screens.
