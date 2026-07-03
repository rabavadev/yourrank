-- ============================================================
-- Fix: Missing 'suspended' column on sites table + missing enum values
-- 
-- BUG-002: Code queried sites.suspended which didn't exist, causing 500
--          on every /<slug> route, sitemap, and custom domain resolution.
-- BUG-003: pay_provider enum lacked 'trial' value, breaking trial activation.
-- BUG-004: plan_tier enum lacked 'starter' value, breaking starter plan.
-- ============================================================

-- Add suspended column to sites table (mirrors users.status = 'suspended')
ALTER TABLE sites ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- Backfill from users.status
UPDATE sites SET suspended = true 
WHERE user_id IN (SELECT id FROM users WHERE status = 'suspended');

-- Trigger to keep sites.suspended in sync with users.status
CREATE OR REPLACE FUNCTION sync_site_suspended() RETURNS TRIGGER AS $$
BEGIN
  UPDATE sites SET suspended = (NEW.status = 'suspended') WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_site_suspended ON users;
CREATE TRIGGER trg_sync_site_suspended 
  AFTER UPDATE OF status ON users 
  FOR EACH ROW EXECUTE FUNCTION sync_site_suspended();

-- Add missing enum values
ALTER TYPE pay_provider ADD VALUE IF NOT EXISTS 'trial';
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'starter';
