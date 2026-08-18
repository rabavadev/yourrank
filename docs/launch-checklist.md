# YourRank Launch Checklist

**Date:** 2026-07-08
**Status:** Ready for S M review

## Phase 0 — Stabilization ✅
- [x] Fail-open rate limiter + 1101 guards (PR #32)
- [ ] KV write quota upgrade (needs S M: upgrade CF plan)
- [x] Repo hygiene pass (docs/history/, compiled JS removed)

## Phase 1 — Observability ✅
- [x] Sentry on site Worker (already integrated)
- [x] Uptime monitor Worker (apps/monitor/)
- [x] Structured logs with request ID (X-Request-Id header)
- [x] withWorkerFetch() entry-point wrapper

## Phase 2 — Infrastructure ✅
- [x] Durable Object rate limiter (RL_BACKEND=do flag)
- [x] KV usage audit (< 100 writes/day after DO)

## Phase 3 — Safe Delivery ✅
- [x] Staging smoke-test gate (workflow exists)
- [x] Independent deploy jobs + auto-rollback
- [x] Migration dry-run in CI (ephemeral Postgres)

## Phase 4 — Data Safety ✅
- [ ] Backups + PITR drill (needs S M: Supabase dashboard)
- [x] RLS cross-tenant isolation tests
- [x] Money idempotency tests

## Phase 5 — Identity & Onboarding ✅
- [x] Unified account + Telegram identity linking
- [x] One-paste bot onboarding
- [x] Activation funnel tracking

## Phase 6 — Scale Hot Path ✅
- [x] Cloudflare Queues for clicks/conversions
- [x] Cache invalidation (already implemented)

## Phase 7 — Attribution & Retention ✅
- [x] Attribution dashboard + CSV export
- [x] Broadcast segmentation
- [x] Overlay themes + sponsor slots
- [x] Plan gates enforced server-side

## Phase 8 — Launch Readiness ✅
- [x] Security review + CSP report-uri
- [x] Load test script (k6)
- [x] Runbooks (symptom → check → fix)
- [ ] SENTRY_DSN as Worker secret (needs S M)
- [ ] Turnstile on signup/login (needs S M)
- [ ] Status page (needs S M)

## Phase 5 QA — August 2026

After the Phase 2 UX and product restructuring, the following QA items were completed and the remaining actions documented.

### Completed
- TASK 31 — E2E regression matrix extended to cover public `/me`, `/<slug>/credits`, `/<slug>/overlay`, and the publish step.
- TASK 32 — All primary pages include loading, empty, error, and success states; forms preserve values and expose Retry.
- TASK 33 — Public pages use flex-wrap layouts, visible focus, `prefers-reduced-motion` support, and skip links.
- TASK 34 — CSP inline-style violations fixed on public pages; `report-uri` receives reports; E2E public pages return 200.
- TASK 35 — Canonical URLs and redirects captured below.

### Canonical URLs and backward-compatible redirects

**Canonical public pages**
- `/` landing
- `/pricing`, `/faq`, `/reviews`, `/contact`, `/docs`
- `/login`, `/signup`, `/forgot`, `/reset`, `/verify-email`, `/me`
- `/dashboard`, `/account`, `/admin`
- `/<slug>` (public leaderboard), `/<slug>/credits`, `/<slug>/shop`, `/<slug>/overlay`
- `/<slug>/hall-of-fame`, `/<slug>/profile`, `/<slug>/player/<name>`

**Backward-compatible redirects** (all 302 to the canonical location)
- `/dashboard/billing` → `/account/plan`
- `/dashboard/attribution` → `/account/postbacks`
- `/dashboard/analytics` → `/dashboard?nav=performance`
- `/dashboard/analytics/:tab` → `/dashboard?nav=performance#:tab` (`activity`, `referrals`, `events`)
- `/dashboard/credits` → `/dashboard/settings/integrations`
- `/dashboard/rewards` → `/dashboard/rewards/redemptions`
- `/dashboard/rewards/channel` → `/dashboard/settings/integrations`
- `/dashboard/rewards/maps` and `/dashboard/rewards/rewards` → `/dashboard/rewards/rules`
- `/dashboard/rewards/viewers` → `/dashboard/audience/viewers`
- `/dashboard/rewards/history` → `/dashboard/audience/activity`
- `/dashboard/rewards/:tab` → `/dashboard/rewards/:tab` (`rules`, `shop`, `redemptions`); these destinations appear under the dashboard's `Credits` group
- `/dashboard/editor` → `/dashboard?nav=board`
- `/dashboard/editor/:tab` → `/dashboard?nav=board#:tab` (`setup`, `players`, `design`, `share`, `history`)
- `/dashboard/boards` → `/dashboard?nav=boards`
- `/dashboard?nav=settings` → `/dashboard/settings`
- `/dashboard/setup` → `/dashboard`
- `/dashboard/bot/setup` → `/dashboard/telegram`
- `/dashboard/support` → `/contact?type=support&area=dashboard&return=/dashboard`
- `/dashboard/security` → `/account/profile`

### Still needing S M / external action
- Set Kick developer app redirect URI and webhook URL (Phase 0 go-live).
- Set Discord OAuth app credentials (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`).
- Complete Google Business Profile address verification and set `GBP_REVIEW_URL` / `GBP_PHOTO_URL`.
- Enable Cloudflare Turnstile for auth endpoints (security hardening).
- Create a public status page.
- Upgrade Cloudflare account and enable `RL_BACKEND=do` after monitoring.

## S M Action Items
1. Upgrade CF account to Workers Paid (KV write quota)
2. Enable Supabase PITR + run restore drill
3. Set SENTRY_DSN secret in all 3 Workers
4. Enable Cloudflare Turnstile for auth endpoints
5. Create public status page
6. Set MONITOR_SLUG and MONITOR_PB_KEY secrets
7. Review and deploy: `RL_BACKEND=do` after monitoring
