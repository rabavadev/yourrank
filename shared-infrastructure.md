# Shared Infrastructure Configuration

This document tracks the infrastructure IDs that are shared across both Workers (leaderboard and bot).

## Critical: Single Point of Failure

The following infrastructure resources are shared between both Workers. If any of these are deleted or modified, it will affect BOTH Workers simultaneously.

### Shared Resources

- **KV Namespace ID**: `26e47bcce19941839a20bd2cd5879e42`
  - Used by: `apps/leaderboard/wrangler.toml` and `apps/bot/wrangler.toml`
  - Binding: `SESSIONS`
  - Purpose: Shared session store across both Workers (cross-Worker login)
  - Impact: If deleted, ALL active sessions across the entire platform are wiped simultaneously
  - Recommendation: Add Cloudflare account-level protections (API token restrictions)

- **Hyperdrive ID**: `9e5b625bfdd84cd691b44c4780bdaf13`
  - Used by: `apps/leaderboard/wrangler.toml` and `apps/bot/wrangler.toml`
  - Binding: `HYPERDRIVE`
  - Purpose: Shared Postgres (Supabase) connection via Hyperdrive
  - Impact: Both Workers read/write to the same production database
  - Recommendation: Ensure staging uses separate Hyperdrive ID (see TODO in wrangler.toml files)

- **Zone ID**: `dd79a3ac13643b94732f2fef6ce3b1f5`
  - Used by: `apps/leaderboard/wrangler.toml` (CF_ZONE_ID var)
  - Purpose: Cloudflare zone for routing
  - Impact: Affects routing for both Workers
  - Recommendation: Consider separate zones for staging

## Staging Configuration

Staging environments should use separate infrastructure:
- Staging KV ID: `e0b6cba066ad4168ad76629f23b5111d` (already separate)
- Staging Hyperdrive ID: TODO - must be created and configured (currently commented out to prevent production DB usage)

## Migration to Shared Config

Future improvement: Consider using a build step or environment variable templating to avoid hardcoding these IDs in multiple files. Example:

```toml
# shared-config.toml
kv_namespace_id = "26e47bcce19941839a20bd2cd5879e42"
hyperdrive_id = "9e5b625bfdd84cd691b44c4780bdaf13"
zone_id = "dd79a3ac13643b94732f2fef6ce3b1f5"
```

Then use a build script to substitute these values into the wrangler.toml files.

## Deployment Checklist

Before deploying:
1. Verify staging uses separate Hyperdrive ID (not production)
2. Test staging doesn't affect production data
3. Consider backup strategy for shared KV namespace
4. Review Cloudflare account-level protections for shared resources
