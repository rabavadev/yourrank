# YourRank — Product positioning decision

**Date:** 2026-08-09  
**Decision maker:** Product owner  
**Chosen positioning:** Option B — Suite pour streamers  
**Status:** Approved, ready for implementation

## Decision

YourRank is a **suite of three independent products for streamers and communities**:

1. **Leaderboards** — create and publish ranked boards, edit players/prizes, share a public page.
2. **Telegram** — connect a bot, broadcast messages, manage offers and commands.
3. **Rewards & Shop** — connect a Kick channel, map rewards to credits, run a viewer shop with redemptions.

These products live under one account and share authentication, plan/billing, and a unified shell, but each has its own overview, navigation, analytics, and settings.

## Why Option B

- The dashboard already exposes Leaderboard, Bot, and Rewards as top-level sections with near-equal weight.
- Each product has distinct concepts, workflows, and analytics.
- Treating them as a suite makes the navigation honest, scales with future products, and avoids forcing Leaderboard to carry unrelated functionality.

## Product roles

### Leaderboards
- Primary product for ranking players, editing boards, and sharing public pages.
- Contains: Overview, Editor, Boards, Analytics, Settings.
- Analytics covers only leaderboard metrics (views, clicks, copies, referrers).

### Telegram
- Communication/automation product connected to the streamer's channel.
- Contains: Overview, Bots, Offers, Commands, Broadcasts, (optional) Analytics, Settings.

### Rewards & Shop
- Engagement product tied to the streamer's Kick channel.
- Contains: Overview, Kick connection, Reward mappings, Shop, Viewers, Redemptions, Analytics, Settings.
- The unit is `credits`; the relation to Kick is a `reward mapping`; a purchase request is a `redemption`.

## Analytics scope

- Analytics is **per product**.
- Leaderboards → Leaderboards → Analytics.
- Rewards & Shop → Rewards & Shop → Analytics.
- Telegram → Telegram → Analytics, only if Telegram-specific reports exist.
- There is **no global Insights** hub at this stage.

## Account and settings

- **Account** is global and contains: Profile, Security, Connected accounts, Plan & billing, Integrations, Data & privacy.
- **Settings** inside each product contains only local configuration for that product.
- Sensible actions (key reveal/rotation, postback management, billing, sessions, export, account deletion) have exactly one canonical UI, located in Account or the relevant product Settings.

## Consequences

- Marketing, pricing, FAQ, and onboarding must present the three products as part of the same suite.
- The global navigation must expose Leaderboards, Telegram, Rewards & Shop, and Account.
- Each product has its own sidebar sub-navigation.
- No functionality is removed; only its location and hierarchy change.
