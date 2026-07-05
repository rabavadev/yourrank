CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sites_postback_key ON sites(postback_key) WHERE postback_key IS NOT NULL;
