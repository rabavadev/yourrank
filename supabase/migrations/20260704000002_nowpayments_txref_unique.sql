-- ============================================================
--  Migration: Add unique index for NOWPayments tx_ref
--
--  CRITICAL FIX: Prevent double-crediting of NOWPayments IPNs by
--  adding a partial UNIQUE index on payments.tx_ref for nowpayments
--  rows, similar to the existing Stars idempotency index.
--
--  NOWPayments can send duplicate IPNs for the same order_id/tx_ref,
--  and without this index, race conditions could cause double plan
--  activation. The application code already has a paid-transition guard,
--  but this index is the hard DB-level backstop.
-- ============================================================

-- Find any pre-existing duplicates before building the index:
--   SELECT tx_ref, count(*) FROM payments
--    WHERE provider = 'nowpayments' AND tx_ref IS NOT NULL
--    GROUP BY tx_ref HAVING count(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_nowpayments_txref
    ON payments (tx_ref) WHERE provider = 'nowpayments';
