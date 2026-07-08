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

## S M Action Items
1. Upgrade CF account to Workers Paid (KV write quota)
2. Enable Supabase PITR + run restore drill
3. Set SENTRY_DSN secret in all 3 Workers
4. Enable Cloudflare Turnstile for auth endpoints
5. Create public status page
6. Set MONITOR_SLUG and MONITOR_PB_KEY secrets
7. Review and deploy: `RL_BACKEND=do` after monitoring
