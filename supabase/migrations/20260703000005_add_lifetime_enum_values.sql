-- supabase: disable-transaction

-- Add 'nowpayments_lifetime' and 'manual' to pay_provider enum if not present.
-- Required before 20260704000003_fix_lifetime_null_expiry which references these values.
-- Must run non-transactionally (ALTER TYPE ADD VALUE cannot run inside a transaction).

ALTER TYPE pay_provider ADD VALUE IF NOT EXISTS 'nowpayments_lifetime';
ALTER TYPE pay_provider ADD VALUE IF NOT EXISTS 'manual';
