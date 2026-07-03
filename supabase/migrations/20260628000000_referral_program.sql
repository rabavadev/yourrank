-- Migration 008: Referral program
-- Each user gets a unique referral code (backfilled from slug).
-- When a new user signs up with ?ref=<code>, both parties get 31 days Pro.

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_days INT NOT NULL DEFAULT 31,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_id);

-- Backfill: set referral_code = slug for all existing users who have a site
UPDATE users SET referral_code = sites.slug
FROM sites
WHERE sites.user_id = users.id
  AND users.referral_code IS NULL;

-- Fallback for any users without a site slug
UPDATE users SET referral_code = LOWER(SUBSTRING(id::text FROM 1 FOR 8))
WHERE referral_code IS NULL;
