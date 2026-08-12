# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user, confirmed by the codebase: a **casino streamer** who operates their own channel and runs
a hosted public leaderboard plus one or more Telegram bots from a single account. They authenticate
with email and password, may link a Kick channel, and work in a dashboard that assumes the board is
already live.

[Inferred, needs confirmation] The account model supports multiple boards (Pro: 3, Agency: 99) and a
board switcher, so an agency or manager running boards for several streamers is a real secondary
audience. The plan tier named **Agency** is the evidence; no user statement confirms it.

Secondary users that the product treats as first-class, all confirmed in code:

- **Board viewer** — a member of the streamer's audience. Has its own session type, separate from the
  operator's, with Kick and Discord OAuth, a credit balance, a shop, and redemption history.
- **Telegram subscriber** — a person interacting with a connected bot. Identified by Telegram data,
  not a YourRank account.
- **Admin** — a YourRank staff account gated behind `is_admin` plus mandatory TOTP.

## Product Purpose

One account that runs both halves of a casino streamer's audience operation: a hosted, editable public
leaderboard at `yourrank.site/<slug>` (or a custom domain on paid plans), and a multi-tenant Telegram
bot engine delivering promo codes, tracked referral links, and click/conversion analytics. Success for
the operator is a board that is published, current, and generating tracked clicks; success for a viewer
is earning credits and redeeming a reward.

## Positioning

[Inferred, needs confirmation] The mechanism a neighbouring product could not truthfully copy is the
**closed loop between the public leaderboard and the reward economy**: viewer identity (Kick/Discord
OAuth), credit rules earned against channel activity, a shop, and redemption fulfilment all sit behind
the same board the audience already watches, with Telegram distribution attached to the same account.
Competitors are assumed to do one half — a leaderboard page, or a promo bot — not both against one
viewer identity.

This is currently stated nowhere in the interface. The user has not yet confirmed it, so no design work
may present it as a claim.

## Operating Context

The operator works between live-stream tasks: change the prize, adjust players, check whether a viewer
redeemed something, publish. That implies short sessions, glanceable state, and frequent second-screen
or narrow-window use. Uptime and correctness matter during a stream, not after it.

## Capabilities and Constraints

- Two Cloudflare Workers (leaderboard at the zone root, bot at `/bot`, `/hook`, `/r`, `/pb`) share one
  `yr_session` cookie and one Supabase Postgres `users` table. A queue consumer drains analytics
  events; without it, dashboard analytics silently starve.
- Four leaderboard plans — Free, Starter, Pro, Agency — gate players, boards, reward mappings, shop
  items, redemptions, new viewers, custom domain, OBS overlay, webhooks, and watermark removal. The bot
  deliberately has no Starter tier and treats legacy Starter users as Free.
- Access is 30-day and non-auto-renewing; payment goes through NOWPayments.
- The public leaderboard is a branded surface: paid plans remove the YourRank watermark and can serve
  the operator's own logo and accent colour, so the public page must be able to disappear behind
  someone else's brand.
- Vocabulary is currently inconsistent and this is a known product debt, not a style preference: one
  object is called *leaderboard*, *board*, and internally *site*; the dashboard's CREDITS group contains
  Credit rules, Shop, Redemptions, Viewers and Credit activity. *Audience* remains the name of a
  Telegram subscriber population in the bot; the leaderboard dashboard now uses Viewers for its board
  viewer population. Resolving the remaining reward/prize nouns is a later product decision.

## Brand Commitments

The name **YourRank** and the domain `yourrank.site` are in production and binding. The product already
draws a deliberate line between YourRank's own chrome and the operator's brand on the public page; that
split must be preserved.

[Inferred, needs confirmation] No logo file, typeface, or palette has been declared binding by the
user. The incumbent implementation (Inter, a `#5b5bf5` indigo action colour, six overlapping token
layers) is treated as evidence of the current state, not as a commitment.

## Evidence on Hand

- Live, working implementation of every surface named above, at commit `3301b70`.
- A hands-on verification pass of the audited surfaces in a real browser, with console capture:
  `/home/ubuntu/yourrank-reverification-3301b70.md`.
- A design critique with detector and browser evidence: `.impeccable/critique/`.
- No customer testimonials, usage numbers, revenue figures, press, or case studies exist in the
  repository. Design work must not fabricate any. The reviews and pricing pages are product surfaces,
  not evidence of adoption.

## Product Principles

1. **The operator's daily job is three actions, not a tour.** Change the prize, change the players,
   check a redemption. Anything that lengthens those paths is a regression.
2. **One noun per concept, everywhere the user can see.** Internal names may differ; user-facing ones
   may not.
3. **The public board belongs to the streamer, not to YourRank.** Our chrome yields to their brand.
4. **State must be honest.** "No data", "not connected", and "this failed" are three different messages
   and must never look alike, because a missed redemption costs the operator money and trust.
5. **It has to work during a stream.** Narrow windows, second screens, and quick glances are the normal
   case, not an edge case.

## Accessibility & Inclusion

No standard has been declared by the user. [Inferred] The viewer-facing board is a public marketing
surface for the operator, so WCAG AA text contrast (4.5:1) and an 11px minimum for functional text are
treated as the working floor. The current public board violates both extensively, which is recorded as
a defect rather than as an established constraint.

## Compliance — open, needs a human answer

The codebase ships `/responsible`, `/terms`, `/privacy`, `/cookies`, `/refund` and a Compliance section
in dashboard settings, so gambling-adjacent obligations are clearly anticipated. Nothing in the
repository states which jurisdictions apply, whether an age gate is required, or what affiliate
disclosure is owed. Design work must preserve the existing legal surfaces and must not invent, reword,
or remove compliance copy until the operator answers this.
