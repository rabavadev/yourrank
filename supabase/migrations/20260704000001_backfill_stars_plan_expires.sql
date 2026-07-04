-- ============================================================
--  Migration: Backfill plan_expires_at for legacy Stars users
--
--  CRITICAL FIX: Stars subscriptions previously set users.plan but
--  not users.plan_expires_at, causing expiry inconsistency between
--  leaderboard and bot workers. This migration backfills plan_expires_at
--  for users with active Telegram Stars subscriptions.
--
--  For users with active Stars subscriptions (current_period_end > now()),
--  set plan_expires_at to match the subscription's end date.
--  For users with expired Stars subscriptions, leave plan_expires_at NULL
--  so they'll be downgraded by the nightly cron.
-- ============================================================

-- Backfill plan_expires_at for users with active Stars subscriptions
UPDATE users u
SET plan_expires_at = s.current_period_end
FROM subscriptions s
WHERE s.user_id = u.id
  AND s.provider = 'telegram_stars'
  AND s.status = 'active'
  AND s.current_period_end > now()
  AND u.plan_expires_at IS NULL;

-- Ensure the subscription's plan matches the user's plan (defensive sync)
UPDATE users u
SET plan = s.plan
FROM subscriptions s
WHERE s.user_id = u.id
  AND s.provider = 'telegram_stars'
  AND s.status = 'active'
  AND s.current_period_end > now()
  AND u.plan != s.plan;
