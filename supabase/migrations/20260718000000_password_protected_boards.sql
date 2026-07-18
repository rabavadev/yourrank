-- Password-protected public boards
ALTER TABLE sites ADD COLUMN password_hash TEXT;
ALTER TABLE sites ADD COLUMN password_salt TEXT;
