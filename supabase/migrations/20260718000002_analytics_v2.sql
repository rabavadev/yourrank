-- Richer analytics: new/returning viewers, scroll depth, click-to-conversion linking.
CREATE TABLE IF NOT EXISTS site_visitors (
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  sessions INT NOT NULL DEFAULT 1,
  PRIMARY KEY (site_id, visitor_hash)
);
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_seen ON site_visitors(site_id, last_seen);
CREATE INDEX IF NOT EXISTS idx_site_visitors_first_seen ON site_visitors(site_id, first_seen);

CREATE TABLE IF NOT EXISTS site_scroll_depth (
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  bucket INT NOT NULL CHECK (bucket IN (0, 25, 50, 75, 100)),
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, day, bucket)
);

CREATE TABLE IF NOT EXISTS site_clicks (
  click_ref TEXT PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cta_url TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_clicks_site ON site_clicks(site_id, created_at);

ALTER TABLE conversions ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_site_ts ON conversions(site_id, ts) WHERE site_id IS NOT NULL;
