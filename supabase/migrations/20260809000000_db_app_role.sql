-- SEC-DB-01: Create a least-privilege application role for the Workers.
--
-- This role can read/write all application tables but cannot create/drop
-- schemas, modify roles, or bypass RLS. It is intended to replace connecting
-- as the `postgres` superuser in production.
--
-- After running this migration, set a strong password for `yourrank_app` in
-- the Supabase SQL editor (or via your secret manager) and update:
--   - the `DATABASE_URL` Cloudflare secret
--   - the Hyperdrive connection string used by `yourrank-site` and `yourrank-bot`
--
-- Example:
--   ALTER ROLE yourrank_app WITH PASSWORD '<generate-strong-random>';
--
-- Then update the connection string to use `yourrank_app` instead of `postgres`.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'yourrank_app') THEN
        CREATE ROLE yourrank_app NOLOGIN;
    END IF;
END $$;

-- Basic connection/schema usage (no table access yet)
GRANT USAGE ON SCHEMA public TO yourrank_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yourrank_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO yourrank_app;

-- Future objects created by migrations should be accessible automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO yourrank_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO yourrank_app;

-- Application functions used by migrations/workers
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO yourrank_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO yourrank_app;

-- Make the role inheritable so it can act through the connection user
ALTER ROLE yourrank_app INHERIT;
