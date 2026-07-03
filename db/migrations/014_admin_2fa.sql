-- 014_admin_2fa.sql
-- Add TOTP secret column to users table for admin two-factor authentication.
-- The value stored is AES-256-GCM encrypted (v1: prefix + IV + ciphertext + tag).
-- Only admin users (is_admin=true) can enable/use 2FA.
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
