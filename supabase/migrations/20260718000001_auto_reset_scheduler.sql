-- Auto-reset scheduler for board periods
ALTER TABLE sites ADD COLUMN auto_reset_enabled BOOLEAN DEFAULT false;
ALTER TABLE sites ADD COLUMN auto_reset_clear TEXT DEFAULT 'wagers';
ALTER TABLE sites ADD COLUMN auto_reset_last_run_at TIMESTAMPTZ;
