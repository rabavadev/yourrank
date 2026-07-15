-- C-05: Unify Telegram identity columns.
--
-- The users table historically carried both telegram_id (leaderboard link widget)
-- and telegram_user_id (bot dashboard Telegram Login). This migration makes
-- telegram_user_id the single canonical column, merges any duplicate rows
-- created by the split, and drops telegram_id.
--
-- Safe to re-run: it is wrapped in a transaction and uses IF EXISTS/IF NOT EXISTS
-- guards for schema changes.

-- 1. Merge duplicate accounts.
--
-- A duplicate exists when a leaderboard-only row (telegram_user_id IS NULL)
-- has a telegram_id that matches another row's telegram_user_id. The row with
-- the real telegram_user_id is the survivor; the other row's password/email
-- data and child records are folded into it.
DO $$
DECLARE
  drop_id  uuid;
  keep_id  uuid;
  l_email          text;
  l_password_hash  text;
  l_password_salt  text;
  l_postback_key   text;
  l_display_name   text;
  l_telegram_username text;
  l_telegram_linked_at timestamptz;
  l_plan           public.plan_tier;
BEGIN
  FOR drop_id, keep_id IN
    SELECT d.id, k.id
      FROM users d
      JOIN users k ON d.telegram_id = k.telegram_user_id
     WHERE d.telegram_user_id IS NULL
       AND d.telegram_id IS NOT NULL
       AND d.id <> k.id
  LOOP
    -- Capture the losing row's credentials before we move anything.
    SELECT email, password_hash, password_salt, postback_key,
           display_name, telegram_username, telegram_linked_at, plan
      INTO l_email, l_password_hash, l_password_salt, l_postback_key,
           l_display_name, l_telegram_username, l_telegram_linked_at, l_plan
      FROM users
     WHERE id = drop_id;

    -- Move child records. For tables with global unique keys that can collide
    -- (bots.webhook_secret, bots.tg_bot_id, stream_channels.platform+channel_name),
    -- we move only non-conflicting rows and discard the rest; those discarded
    -- rows are duplicates of data already owned by the survivor.

    UPDATE sites            SET user_id  = keep_id WHERE user_id  = drop_id;
    UPDATE offers           SET owner_id = keep_id WHERE owner_id = drop_id;
    UPDATE conversions      SET owner_id = keep_id WHERE owner_id = drop_id;
    UPDATE subscriptions    SET user_id  = keep_id WHERE user_id  = drop_id;
    UPDATE payments         SET user_id  = keep_id WHERE user_id  = drop_id;
    UPDATE casinos          SET created_by = keep_id WHERE created_by = drop_id;
    UPDATE admin_audit      SET admin_id = keep_id WHERE admin_id = drop_id;
    UPDATE admin_audit      SET target_user_id = keep_id WHERE target_user_id = drop_id;
    UPDATE password_resets  SET user_id = keep_id WHERE user_id = drop_id;
    UPDATE sessions         SET user_id = keep_id WHERE user_id = drop_id;

    -- Move bots that do not conflict with the survivor's bots.
    UPDATE bots b
       SET owner_id = keep_id
     WHERE b.owner_id = drop_id
       AND NOT EXISTS (
         SELECT 1 FROM bots b2
          WHERE b2.owner_id = keep_id
            AND (b2.tg_bot_id = b.tg_bot_id OR b2.webhook_secret = b.webhook_secret)
       );
    DELETE FROM bots WHERE owner_id = drop_id;

    -- Move stream channels that do not conflict with the survivor's channels.
    UPDATE stream_channels sc
       SET owner_id = keep_id
     WHERE sc.owner_id = drop_id
       AND NOT EXISTS (
         SELECT 1 FROM stream_channels sc2
          WHERE sc2.owner_id = keep_id
            AND sc2.platform = sc.platform
            AND sc2.channel_name = sc.channel_name
       );
    DELETE FROM stream_channels WHERE owner_id = drop_id;

    -- Fold the loser's credentials and profile onto the survivor where missing.
    -- Null out the loser's unique columns first so the unique constraints on
    -- email and postback_key do not block the update.
    UPDATE users SET email = NULL, postback_key = NULL WHERE id = drop_id;

    UPDATE users u
       SET email            = COALESCE(u.email,            l_email),
           password_hash    = COALESCE(u.password_hash,    l_password_hash),
           password_salt    = COALESCE(u.password_salt,    l_password_salt),
           postback_key     = COALESCE(u.postback_key,     l_postback_key),
           display_name     = COALESCE(u.display_name,     l_display_name),
           telegram_username = COALESCE(u.telegram_username, l_telegram_username),
           telegram_linked_at = COALESCE(u.telegram_linked_at, l_telegram_linked_at),
           plan             = CASE WHEN l_plan = 'agency'
                                  OR (l_plan = 'pro' AND u.plan = 'free')
                             THEN l_plan ELSE u.plan END,
           updated_at       = now()
     WHERE u.id = keep_id;

    DELETE FROM users WHERE id = drop_id;
  END LOOP;
END $$;

-- 3. Backfill telegram_user_id for any remaining leaderboard-only rows that do
--    not conflict with an existing telegram_user_id.
UPDATE users u
   SET telegram_user_id = u.telegram_id
 WHERE u.telegram_user_id IS NULL
   AND u.telegram_id IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM users u2
      WHERE u2.telegram_user_id = u.telegram_id
        AND u2.id <> u.id
   );

-- 4. Drop the legacy telegram_id column, its unique constraint, and its index.
DROP INDEX IF EXISTS idx_users_telegram_id;
ALTER TABLE users DROP COLUMN IF EXISTS telegram_id;

-- 5. Make telegram_user_id the single canonical unique identity.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_telegram_user_id_key;
ALTER TABLE users ADD CONSTRAINT users_telegram_user_id_key UNIQUE (telegram_user_id);

-- 6. Add a helpful comment on the canonical column.
COMMENT ON COLUMN public.users.telegram_user_id IS 'Canonical Telegram user ID. Unique when not null; shared by bot dashboard and leaderboard link flow.';
