-- H-25 — Move notification credentials out of sites.extra_json.
-- Discord webhook URLs and Telegram tokens are stored in dedicated columns,
-- with Discord URLs encrypted at rest by the application layer.

ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS discord_webhook_url_enc TEXT,
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS telegram_notify BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill existing boards from the legacy extra_json storage so notifications
-- keep working after deploy. Plaintext values are migrated as-is; the app will
-- encrypt them on the next save.
UPDATE sites
SET
  discord_webhook_url_enc = extra_json ->> 'discord_webhook_url',
  telegram_chat_id = extra_json ->> 'telegram_chat_id',
  telegram_notify = COALESCE((extra_json ->> 'telegram_notify')::boolean, FALSE)
WHERE extra_json IS NOT NULL
  AND (
    extra_json ->> 'discord_webhook_url' IS NOT NULL
    OR extra_json ->> 'telegram_chat_id' IS NOT NULL
    OR extra_json ->> 'telegram_notify' IS NOT NULL
  );
