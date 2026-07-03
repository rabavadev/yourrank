-- 015_custom_domain_tls.sql
-- Add Cloudflare custom hostname ID and domain TLS status to sites table.
-- When a Pro user sets a custom domain, we create a custom hostname via the
-- Cloudflare for SaaS API and track the TLS provisioning status here.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS custom_hostname_id TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS domain_status TEXT DEFAULT 'pending';
