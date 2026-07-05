-- ============================================================
--  Migration: Add advisory lock function for logClick TOCTOU race fix
--
--  BUG FIX: The CTE-based uniqueness check in logClick has a TOCTOU race:
--  two concurrent first-clicks from the same IP both see seen=false (neither
--  has committed yet) and both insert is_unique=true, inflating unique counts.
--
--  Partial unique indexes with time-based WHERE clauses don't work correctly
--  for this use case (the condition is evaluated at query time, not insert time).
--  Instead, we use PostgreSQL advisory locks to serialize inserts for the
--  same (short_link_id, ip_hash) pair within the 24-hour window.
-- ============================================================

-- Function to acquire an advisory lock for a given (short_link_id, ip_hash) pair
-- Uses hashtext to convert the composite key into a lock identifier
CREATE OR REPLACE FUNCTION acquire_click_uniqueness_lock(p_short_link_id UUID, p_ip_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Try to acquire an advisory lock (non-blocking)
  -- Returns true if lock acquired, false if already held
  -- Lock is automatically released at transaction end
  RETURN pg_try_advisory_xact_lock(hashtext(p_short_link_id::text || p_ip_hash));
END;
$$ LANGUAGE plpgsql;

-- Add index to speed up the uniqueness check (used by the new lock-based approach)
CREATE INDEX IF NOT EXISTS idx_clicks_uniqueness_check
    ON clicks (short_link_id, ip_hash, ts DESC)
    WHERE ts > now() - interval '24 hours';
