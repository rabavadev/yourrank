-- NEW-DB-001: Add indexes for hot-path lookups
-- short_links.slug is queried on every redirect (WHERE sl.slug = $1)
-- users.postback_key is queried on every postback (WHERE postback_key = $1)

CREATE UNIQUE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);
CREATE INDEX IF NOT EXISTS idx_users_postback_key ON users(postback_key) WHERE postback_key IS NOT NULL;
