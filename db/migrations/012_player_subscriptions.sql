-- Player rank-change subscriptions via Telegram bot /subscribe command.
-- When a player subscribes through a streamer's bot, they get DMs when
-- their rank changes on that streamer's leaderboard.

CREATE TABLE IF NOT EXISTS player_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id          UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    tg_user_id      BIGINT NOT NULL,
    player_name     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bot_id, tg_user_id, site_id)
);

CREATE INDEX IF NOT EXISTS idx_player_subs_site ON player_subscriptions(site_id);
CREATE INDEX IF NOT EXISTS idx_player_subs_bot ON player_subscriptions(bot_id);
