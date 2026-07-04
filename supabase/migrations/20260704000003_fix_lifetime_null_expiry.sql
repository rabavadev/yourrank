-- ============================================================
--  Migration: Fix NULL plan_expires_at for lifetime users
--
--  SECURITY FIX: effectivePlan now treats NULL plan_expires_at as expired
--  to prevent accidental permanent grants. This migration backfills
--  plan_expires_at for existing lifetime users with a far-future date.
--
--  Lifetime users are identified by:
--  1. Subscriptions with provider 'nowpayments_lifetime' or 'manual'
--     AND current_period_end far in the future (e.g., 2099-12-31)
--  2. OR users with plan_expires_at = NULL who should have lifetime
-- ============================================================

-- Backfill plan_expires_at for users with lifetime subscriptions
UPDATE users u
SET plan_expires_at = s.current_period_end
FROM subscriptions s
WHERE s.user_id = u.id
  AND s.provider IN ('nowpayments_lifetime', 'manual')
  AND s.status = 'active'
  AND s.current_period_end > '2090-01-01'::timestamptz
  AND u.plan_expires_at IS NULL;

-- For any remaining NULL plan_expires_at users with paid plans,
-- set expiry to far-future if they have any active subscription
UPDATE users u
SET plan_expires_at = '2099-12-31T23:59:59Z'::timestamptz
WHERE u.plan_expires_at IS NULL
  AND u.plan IN ('pro', 'starter', 'agency')
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = u.id
      AND s.status = 'active'
      AND s.current_period_end > now() + interval '1 year'
  );
