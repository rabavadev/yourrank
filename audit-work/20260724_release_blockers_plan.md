## Release Blockers Execution Plan

### Goal

Land the highest-risk fixes in a forward-only sequence that restores safe deployability first, then data correctness, then operational guardrails.

### Recommended Order

1. P0 database security and migration integrity
2. P0 conversion double-count race
3. P1 dashboard/archive and account-deletion integrity
4. P1 staging, rollback, and CI hardening

### Track 1: Database Security And Migration Integrity

Scope:
- Add a new forward-only migration that revokes unsafe default privileges from `anon` and `authenticated`.
- Add explicit RLS enablement plus `service_role`-only policies for currently exposed tables.
- Remove migration nondeterminism by replacing the duplicate-timestamp referral migration with a uniquely versioned file and deleting the `schema_migrations` mutation block.
- Decide whether to remove the orphaned `rls_auto_enable()` helper or properly register it; do not rely on it either way.

Critical files:
- `supabase/migrations/00000000000000_baseline.sql`
- `supabase/migrations/20260715140000_admin_mfa_stepup.sql`
- `supabase/migrations/20260715160000_postback_keys.sql`
- `supabase/migrations/20260717000002_onboarding_emails.sql`
- `supabase/migrations/20260718000001_referral_system.sql`
- `supabase/migrations/20260718000002_analytics_v2.sql`
- `supabase/migrations/README.md`

Implementation notes:
- Keep the fix forward-only; do not edit migration history tables from a migration.
- Before renaming/replacing the duplicate migration, inspect live `supabase_migrations.schema_migrations` in staging/production so the repo fix matches deployment reality.
- Include CI validation for duplicate migration versions and forbidden writes to `supabase_migrations.schema_migrations`.

### Track 2: Conversion Race

Scope:
- Refactor conversion recording so leaderboard projection only runs when the conversion insert actually wins.

Critical files:
- `shared/conversions.ts`
- `shared/db.ts`
- `supabase/migrations/20260705000002_conversions_idempotency_index.sql`
- `apps/bot/src/__tests__/bot-engine.test.ts`
- `apps/leaderboard/src/__tests__/idempotency.test.js`

Implementation notes:
- Replace the read-then-insert flow with `INSERT ... ON CONFLICT DO NOTHING RETURNING`.
- Gate the player projection on returned inserted rows, ideally via a single CTE.
- Remove the transaction-local pre-read if the unique index and insert result become authoritative.

### Track 3: Dashboard And Deletion Integrity

Scope:
- Eliminate stale-read archive behavior.
- Fix account deletion so it is atomic, does not report false failure after success, and clears the auth cookie.
- Restore optimistic concurrency data needed by the dashboard.

Critical files:
- `apps/leaderboard/src/site.js`
- `apps/leaderboard/src/auth.js`
- `apps/leaderboard/src/handlers/sites.js`
- `apps/leaderboard/src/handlers/quick-add.js`
- `shared/session.ts`
- `apps/leaderboard/src/__tests__/auth.test.js`
- `apps/leaderboard/src/__tests__/dashboard-quick-actions.test.js`
- `apps/leaderboard/src/__tests__/sites-handlers.test.js`

Implementation notes:
- Move archive snapshot reads inside the authoritative transaction.
- Wrap account deletion in `withTransaction()`, remove redundant post-delete session teardown if cascade already covers it, and clear the session cookie on success.
- Return top-level `updatedAt` from `/api/site`.
- Defer a full quick-add redesign until after the P0 items unless the existing save path blocks the archive/concurrency fix.

### Track 4: Staging, Rollback, And CI Hardening

Scope:
- Stop staging from pointing at production data.
- Make rollback trigger on partial deployment failures, not only smoke-test failure.
- Make staging smoke failures actionable once isolated staging infra exists.
- Replace Unix-only root scripts with cross-platform scripts.

Critical files:
- `apps/leaderboard/wrangler.toml`
- `apps/bot/wrangler.toml`
- `.github/workflows/deploy.yml`
- `.github/workflows/rollback.yml`
- `.github/workflows/staging.yml`
- `.github/workflows/pr-check.yml`
- `package.json`
- `build-shared.mjs`
- `apps/leaderboard/STAGING.md`
- `DEPLOY.md`

Implementation notes:
- Provision a dedicated staging Supabase project/Hyperdrive binding before flipping config.
- Reuse the same cross-platform test runner locally and in CI so root scripts mirror PR checks.
- Ensure rollback rebuilds shared artifacts where required.

### Verification

Database:
- Replay migrations from a fresh database.
- Validate there are no duplicate migration versions.
- Confirm exposed tables have RLS enabled and intended policies only.
- Confirm anon/authenticated access is denied where expected.

Application:
- Add a focused regression test proving a losing conversion insert does not project twice.
- Add a focused archive test proving snapshot and clear happen from one transactionally consistent view.
- Add an account-deletion test proving success clears auth state and subsequent auth checks fail.

Ops:
- Verify staging uses separate DB infrastructure.
- Verify staging smoke tests can fail the workflow.
- Verify production rollback covers partial deploy failures.
- Run `node build-shared.mjs`, `bun run lint`, `bun run typecheck`, and `bun run test` from repo root after the CI script hardening lands.
