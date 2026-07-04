-- ============================================================
-- Fix: Missing 'suspended' column on sites table
-- 
-- BUG-002: Code queried sites.suspended which didn't exist, causing 500
--          on every /<slug> route, sitemap, and custom domain resolution.
-- BUG-007: casinos.created_by foreign key was ON DELETE NO ACTION, which
-- blocked account deletion when a user had any casinos rows. Changed to CASCADE.
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

-- Fix casinos.created_by foreign key to allow account deletion
ALTER TABLE casinos DROP CONSTRAINT IF EXISTS casinos_created_by_fkey;
ALTER TABLE casinos ADD CONSTRAINT casinos_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
