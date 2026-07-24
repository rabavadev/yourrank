# Production-Readiness Audit: Shared Modules & Background Workers

**Audit Scope:** `shared/**`, `apps/consumer/**`, `apps/monitor/**`, `e2e/**`
**Target Path:** `C:\yourrank`
**Environment:** Cloudflare Workers, Postgres (via Hyperdrive), Cloudflare Queues, Durable Objects.

---

## 1. Files-Read Manifest (55/55)

| # | File Path |
|---|-----------|
| 1 | `apps/consumer/src/worker.js` |
| 2 | `apps/consumer/wrangler.toml` |
| 3 | `apps/monitor/package.json` |
| 4 | `apps/monitor/src/__tests__/worker.test.ts` |
| 5 | `apps/monitor/src/worker.ts` |
| 6 | `apps/monitor/tsconfig.json` |
| 7 | `apps/monitor/wrangler.toml` |
| 8 | `e2e/.env.example` |
| 9 | `e2e/package.json` |
| 10 | `e2e/src/client.ts` |
| 11 | `e2e/src/smoke.test.ts` |
| 12 | `shared/README.md` |
| 13 | `shared/__tests__/audit.test.ts` |
| 14 | `shared/__tests__/crypto.test.ts` |
| 15 | `shared/__tests__/notifications.test.ts` |
| 16 | `shared/__tests__/postback.test.ts` |
| 17 | `shared/__tests__/queue-producer.test.ts` |
| 18 | `shared/__tests__/ratelimit.test.ts` |
| 19 | `shared/__tests__/rls-isolation.test.ts` |
| 20 | `shared/__tests__/session.test.ts` |
| 21 | `shared/__tests__/telegram-login.test.ts` |
| 22 | `shared/__tests__/validation.test.ts` |
| 23 | `shared/activation-funnel.ts` |
| 24 | `shared/audit.ts` |
| 25 | `shared/clicks.ts` |
| 26 | `shared/conversions.ts` |
| 27 | `shared/crypto.ts` |
| 28 | `shared/dashboard-shell.md` |
| 29 | `shared/db.d.ts` |
| 30 | `shared/db.ts` |
| 31 | `shared/email.ts` |
| 32 | `shared/env.ts` |
| 33 | `shared/errors.ts` |
| 34 | `shared/features.ts` |
| 35 | `shared/monitoring.ts` |
| 36 | `shared/notifications.ts` |
| 37 | `shared/package.json` |
| 38 | `shared/page-shell.ts` |
| 39 | `shared/plans.ts` |
| 40 | `shared/postback.ts` |
| 41 | `shared/postgres.d.ts` |
| 42 | `shared/provider-events.ts` |
| 43 | `shared/queue-producer.ts` |
| 44 | `shared/rate-limiter-do.ts` |
| 45 | `shared/ratelimit.ts` |
| 46 | `shared/request-id.ts` |
| 47 | `shared/routing.md` |
| 48 | `shared/session.d.ts` |
| 49 | `shared/session.md` |
| 50 | `shared/session.ts` |
| 51 | `shared/shell-nav.ts` |
| 52 | `shared/stats.ts` |
| 53 | `shared/telegram-login.md` |
| 54 | `shared/validation.ts` |
| 55 | `shared/with-worker.ts` |

---

## 2. Audit Findings

### [MEDIUM] Double-Counting Race Condition in Conversion Projection
*   **Severity:** Medium
*   **File:Line:** `shared/conversions.ts:106-121`
*   **Affected Endpoints:** `POST /pb`, `POST /api/postback`, `POST /api/scores`
*   **Why:** The idempotency check at line 70 is not atomic with the player rank update at line 106. Two identical postbacks arriving simultaneously can both pass the check before either inserts the conversion record.
*   **Repro:** Execute two concurrent POST requests with the same `click_ref` and `amount`. Observe the `wagered` column in the `players` table being incremented twice.
*   **Root Cause:** Decoupled idempotency guard from the projection logic.
*   **Best Fix:** Use a single Common Table Expression (CTE) to insert the conversion and project it onto the player row ONLY if the insert succeeded.
    ```sql
    WITH new_conv AS (
      INSERT INTO conversions (...) VALUES (...) ON CONFLICT DO NOTHING RETURNING id
    ),
    ins AS (
      INSERT INTO players (...)
      SELECT ... FROM new_conv ...
      ON CONFLICT ... DO UPDATE ...
      RETURNING site_id
    )
    UPDATE sites SET updated_at = now() WHERE id IN (SELECT site_id FROM ins)
    ```

### [LOW] Blocking Sequential Queue Processing
*   **Severity:** Low
*   **File:Line:** `apps/consumer/src/worker.js:102-123`
*   **Affected Consumers:** All events in `yourrank-events` queue.
*   **Why:** Messages are processed in a sequential `for...of` loop. A slow network call for one message (e.g., Discord/Telegram notification) blocks the entire batch.
*   **Repro:** Enqueue 50 messages. Simulate a 4s delay on the first message. Observe the 50th message takes >4s to start processing.
*   **Root Cause:** Synchronous iteration over asynchronous batch items.
*   **Best Fix:** Use `Promise.allSettled` to process the batch in parallel.

### [LOW] Sensitive Data Leak in Audit Log
*   **Severity:** Low
*   **File:Line:** `shared/audit.ts:21`
*   **Affected Consumers:** Admin / Security audit trail.
*   **Why:** `AUDIT_SAFE_KEYS` whitelist includes `"email"` (PII) and `"code"` (2FA secret). This allows sensitive data to persist in plain text in the `audit_log` table.
*   **Repro:** Trigger a 2FA verification. Check `audit_log.details` for the raw 6-digit code.
*   **Root Cause:** Overly broad whitelist.
*   **Best Fix:** Remove `"code"` from `AUDIT_SAFE_KEYS` and mask email addresses before logging.

### [LOW] Lost Background Session Refreshes
*   **Severity:** Low
*   **File:Line:** `shared/session.ts:241`, `267`
*   **Affected Pages:** All authenticated dashboard pages.
*   **Why:** TTL updates are executed as fire-and-forget promises. Cloudflare Workers may kill the isolate before these background tasks complete if they aren't tracked.
*   **Repro:** Monitor DB logs for `UPDATE sessions` queries during rapid dashboard navigation. Observe occasional missing updates.
*   **Root Cause:** Missing `ctx.waitUntil()` for background database writes.
*   **Best Fix:** Pass the execution context (`ctx`) to `resolveSession` and wrap the `exec` call in `ctx.waitUntil()`.

---

## 3. Component Analysis

### Session & Crypto
*   **Security:** Uses Web Crypto AES-256-GCM. Tokens are rotated every 24h (SEC-107). Constant-time comparisons are correctly used.
*   **Consistency:** Shared Postgres session table prevents cross-Worker "split-brain" where a user is logged into one Worker but not the other.

### Rate Limiting
*   **Resilience:** Fail-closed by default. Durable Object backend provides atomic consistency for high-traffic paths.
*   **Failover:** Gracefully falls back to KV if Durable Objects are unavailable (if configured).

### Multi-Tenant Isolation
*   **RLS:** Row Level Security is enforced on all tables. `shared/__tests__/rls-isolation.test.ts` confirms the anon key has no access.
*   **Isolation:** All queries for conversion and clicks correctly filter by `ownerId`.

### Error Handling & Monitoring
*   **Uptime Monitor:** `apps/monitor` checks golden paths (health, landing, postback canary) every 5 minutes.
*   **DLQ Alerting:** Consumer correctly alerts Discord when messages exhaust retries.
*   **Structured Logging:** Request-scoped loggers with trace IDs ensure logs are grep-able across Worker boundaries.

---

## 4. Conclusion
The shared infrastructure is **Production-Ready**. The most critical architectural risk is the **Conversion Projection Race Condition**, which can lead to inaccurate leaderboard standings. The rest of the findings are low-impact performance or compliance optimizations.

**Audit Result:** ✅ Pass (subject to fixing conversion idempotency) ⚠️
