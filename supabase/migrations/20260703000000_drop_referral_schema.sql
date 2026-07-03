-- 013_drop_referral_schema.sql
-- Clean up the referral program schema that was built and then reverted.
-- The referral feature was explicitly removed — these columns and table
-- are dead schema with no application code behind them.

ALTER TABLE users DROP COLUMN IF EXISTS referral_code;
ALTER TABLE users DROP COLUMN IF EXISTS referred_by;
DROP TABLE IF EXISTS referral_rewards CASCADE;
