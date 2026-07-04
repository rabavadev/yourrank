-- supabase: disable-transaction

-- ============================================================
-- Add missing enum values (non-transactional)
-- 
-- BUG-003: pay_provider enum lacked 'trial' value, breaking trial activation.
-- BUG-004: plan_tier enum lacked 'starter' value, breaking starter plan.
-- 
-- NOTE: This migration must run non-transactionally because ALTER TYPE... ADD VALUE
-- cannot run inside a transaction block in older Postgres versions.
-- ============================================================

-- Add missing enum values
ALTER TYPE pay_provider ADD VALUE IF NOT EXISTS 'trial';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'starter';
