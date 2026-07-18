-- Track wizard-created boards that have not been finished, so the dashboard can show a resume banner.
ALTER TABLE sites ADD COLUMN is_draft BOOLEAN DEFAULT false;
