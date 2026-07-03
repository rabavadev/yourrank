-- 011_trial: add has_trial column to users for one-time 7-day Pro trial gating.
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_trial BOOLEAN DEFAULT FALSE;
