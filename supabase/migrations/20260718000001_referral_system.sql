-- Referral system v2: per-user referral codes, referred-by tracking, and rewards ledger.
-- Re-adds columns dropped by 20260703000000_drop_referral_schema.sql and adds a reward table.

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reward_days INT NOT NULL DEFAULT 31,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);

-- Backfill existing users with deterministic codes from their UUID prefix.
UPDATE users SET referral_code = LOWER(SUBSTRING(id::text FROM 1 FOR 8))
WHERE referral_code IS NULL;
