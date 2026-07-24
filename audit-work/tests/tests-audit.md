# Production-Readiness Test Audit: YourRank

## 1. Executive Summary
Audit of the test infrastructure, coverage, and security policies for `C:\yourrank`. While the repo maintains a high level of unit testing, critical gaps exist in RLS enforcement for newer tables and the CI pipeline's ability to verify cross-tenant isolation. A regression in the shared crypto utility was also identified.

---

## 2. Manifest: All Tracked Test/Audit Files (Count: 40)
The following files were read and audited:

### Bot App (`apps/bot`)
- `src/__tests__/bot-commands.test.ts`
- `src/__tests__/bot-engine.test.ts`
- `src/__tests__/dashboard.test.ts`
- `src/__tests__/plans-rollup.test.ts`
- `src/__tests__/postback-sunset.test.ts`
- `src/__tests__/validation.test.ts`

### Leaderboard App (`apps/leaderboard`)
- `src/__tests__/audit-validation.test.js`
- `src/__tests__/auth.test.js`
- `src/__tests__/billing.test.js`
- `src/__tests__/board-upsell.test.js`
- `src/__tests__/contact.test.js`
- `src/__tests__/dashboard-quick-actions.test.js`
- `src/__tests__/handler.test.js`
- `src/__tests__/idempotency.test.js`
- `src/__tests__/logo-validation.test.js`
- `src/__tests__/normalize-ends-at.test.js`
- `src/__tests__/postback-sunset.test.js`
- `src/__tests__/preview-handler.test.js`
- `src/__tests__/public-api-cors.test.js`
- `src/__tests__/public-handlers.test.js`
- `src/__tests__/render.test.js`
- `src/__tests__/scores.test.js`
- `src/__tests__/sites-handlers.test.js`
- `src/__tests__/static-assets.test.js`
- `src/__tests__/templates.test.js`

### Shared Infrastructure (`shared/__tests__`)
- `audit.test.ts`
- `crypto.test.ts`
- `notifications.test.ts`
- `postback.test.ts`
- `queue-producer.test.ts`
- `ratelimit.test.ts`
- `rls-isolation.test.ts`
- `session.test.ts`
- `telegram-login.test.ts`
- `validation.test.ts`

### Monitor, E2E, and Scripts
- `apps/monitor/src/__tests__/worker.test.ts`
- `e2e/src/smoke.test.ts`
- `docs/load-test.js`
- `scripts/contrast-audit.mjs`
- `test-routes.sh`

---

## 3. Commands and Results

### Shared Crypto Test
**Command**: `bun test shared/__tests__/crypto.test.ts`
**Result**: **FAILED (2 tests)**
- `encryptToken / decryptToken > round-trips an empty string`: OperationError (The operation failed for an operation-specific reason)
- `encrypt / decrypt (generic hex API) > round-trips an empty string`: OperationError
- **Pass Count**: 33

### Contrast Audit
**Command**: `node scripts/contrast-audit.mjs`
**Result**: **PASSED**
- ✅ No contrast failures found (heuristic auditor).

---

## 4. Detailed Findings

### [HIGH] Finding 1: Critical Security Risk — Missing RLS on Secret Tables
- **File:Line**: `supabase/migrations/20260715160000_postback_keys.sql:6`, `supabase/migrations/20260704000007_admin_audit_table.sql:9`
- **Affected Functionality**: Postback authentication and Admin auditing.
- **Why**: Newer tables `postback_keys` and `admin_audit` were created without `ALTER TABLE ENABLE ROW LEVEL SECURITY`. They are not covered by the baseline RLS sweep.
- **Repro**: Call `supabaseQuery` for `postback_keys` with the `anon` key.
- **Root Cause**: Tables added during refactoring phases missed the RLS checklist.
- **Best Fix**: Add RLS enablement and `service_role` policies to both tables immediately.

### [MEDIUM] Finding 2: CI Omission — RLS Isolation Tests Never Run
- **File:Line**: `.github/workflows/pr-check.yml:77`, `shared/__tests__/rls-isolation.test.ts:66`
- **Affected Functionality**: Data isolation.
- **Why**: The RLS tests are guarded by `describe.skipIf(!hasCredentials)`. CI does not provide these credentials, so RLS policies are never validated against the `anon` key in the pipeline.
- **Root Cause**: CI configuration does not provision a mock Supabase environment.
- **Best Fix**: Inject a local Postgres service with pre-applied RLS policies into the CI runner.

### [MEDIUM] Finding 3: False-Positive / "Check-Box" Tests
- **File:Line**: `apps/leaderboard/src/__tests__/idempotency.test.js:35`
- **Affected Functionality**: Money/Billing Idempotency.
- **Why**: The test asserts `expect(typeof handleIpn).toBe("function")` and calls it a pass for "duplicate IPN does not double-activate". It does not actually perform an assertion on the side-effects.
- **Root Cause**: Pressure to hit the 60% coverage threshold defined in `pr-check.yml`.
- **Best Fix**: Implement real assertions using `mock.module` to verify that `db.exec` (the plan activation query) is skipped when the payment status is already paid.

### [MEDIUM] Finding 4: Production Bug — Crypto Round-trip Failure (Empty Strings)
- **File:Line**: `shared/crypto.ts:111`
- **Affected Functionality**: Internal token/secret encryption.
- **Why**: Decrypting an empty string ciphertext fails. This is a regression in the `v1:` prefix handling where the IV/Tag offsets are miscalculated for zero-length payloads.
- **Root Cause**: `subarray(offset + 12)` results in an invalid buffer for Web Crypto decryption when the plaintext was empty.
- **Best Fix**: Validate minimum buffer length in `decryptToken` before slicing.

### [LOW] Finding 5: CI Fragility — Global Mock Pollution
- **File:Line**: `apps/leaderboard/src/__tests__/audit-validation.test.js:52`
- **Affected Functionality**: CI Performance.
- **Why**: Many tests use `mock.module`, which pollutes the process. This forces `pr-check.yml` to run tests in a slow `for f in ...` loop rather than in parallel.
- **Root Cause**: Heavy reliance on global mocking rather than dependency injection.
- **Best Fix**: Use instance-based mocking or constructors to allow parallel test execution.
