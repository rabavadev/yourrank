-- ============================================================
--  Migration 001 — Telegram Stars payment idempotency
--
--  Adds a partial UNIQUE index on payments.tx_ref for Stars rows so a
--  retried billing webhook (Telegram retries until it gets a 200) can
--  never insert a duplicate payment and double-credit a plan.
--
--  The application code (apps/bot/src/billing.ts) already dedupes inside
--  a transaction; this index is the hard DB-level backstop for the case
--  where two duplicate webhooks race concurrently.
--
--  Run once against the existing 'groupsmix' database. CONCURRENTLY so it
--  does not take a write lock on payments in production. NOTE: CREATE INDEX
--  CONCURRENTLY cannot run inside a transaction block — run this file on its
--  own (e.g. `psql "$DATABASE_URL" -f db/migrations/001_payments_stars_idempotency.sql`),
--  not wrapped in BEGIN/COMMIT.
--
--  If a duplicate already exists (from before this fix shipped), the index
--  build will fail; de-dupe first with the SELECT below, then re-run.
-- ============================================================

-- Find any pre-existing duplicates before building the index:
--   SELECT tx_ref, count(*) FROM payments
--    WHERE provider = 'telegram_stars' AND tx_ref IS NOT NULL
--    GROUP BY tx_ref HAVING count(*) > 1;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_payments_stars_txref
    ON payments (tx_ref) WHERE provider = 'telegram_stars';
