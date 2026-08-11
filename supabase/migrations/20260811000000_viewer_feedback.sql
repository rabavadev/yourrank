-- viewer feedback table: public submissions from the viewer site.
CREATE TABLE IF NOT EXISTS viewer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  site_viewer_id UUID REFERENCES site_viewers(id) ON DELETE SET NULL,
  viewer_id UUID REFERENCES viewers(id) ON DELETE SET NULL,
  kick_username TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewer_feedback_site_id ON viewer_feedback(site_id);
CREATE INDEX IF NOT EXISTS idx_viewer_feedback_created_at ON viewer_feedback(created_at);

ALTER TABLE viewer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_role_all_viewer_feedback
  ON viewer_feedback
  TO service_role
  USING (true)
  WITH CHECK (true);
