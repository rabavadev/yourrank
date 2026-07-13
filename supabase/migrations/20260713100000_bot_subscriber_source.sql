-- Deep-link attribution: capture the /start payload (e.g. t.me/<bot>?start=twitch)
-- so streamers can see where their bot subscribers came from. First-touch: set
-- once when a subscriber first starts the bot with a deep-link payload.
ALTER TABLE bot_subscribers ADD COLUMN IF NOT EXISTS source text;
CREATE INDEX IF NOT EXISTS idx_bot_subscribers_source ON bot_subscribers (bot_id, source);
