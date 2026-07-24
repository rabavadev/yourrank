# Production-Readiness Database Audit: YourRank

**Date**: 2026-07-24
**Audit Scope**: `supabase/**` (71 files)
**Status**: Critical Issues Found

---

## 1. Files-Read Manifest

Total Files: 71

1. `supabase/config.toml`
2. `supabase/migrations/00000000000000_baseline.sql`
3. `supabase/migrations/20260625000000_payments_stars_idempotency.sql`
4. `supabase/migrations/20260625000001_click_daily_index.sql`
5. `supabase/migrations/20260625000002_rls_enable.sql`
6. `supabase/migrations/20260625000003_money_numeric.sql`
7. `supabase/migrations/20260625000004_money_constraints.sql`
8. `supabase/migrations/20260625000005_rls_fix_anon_access.sql`
9. `supabase/migrations/20260628000000_referral_program.sql`
10. `supabase/migrations/20260702000000_multi_board.sql`
11. `supabase/migrations/20260702000001_custom_domain.sql`
12. `supabase/migrations/20260702000002_trial.sql`
13. `supabase/migrations/20260702000003_player_subscriptions.sql`
14. `supabase/migrations/20260703000000_drop_referral_schema.sql`
15. `supabase/migrations/20260703000001_admin_2fa.sql`
16. `supabase/migrations/20260703000002_custom_domain_tls.sql`
17. `supabase/migrations/20260703000003_fix_missing_columns_and_enums.sql`
18. `supabase/migrations/20260703000004_add_missing_enum_values.sql`
19. `supabase/migrations/20260703000005_add_lifetime_enum_values.sql`
20. `supabase/migrations/20260704000000_payments_plan_tier.sql`
21. `supabase/migrations/20260704000001_backfill_stars_plan_expires.sql`
22. `supabase/migrations/20260704000002_nowpayments_txref_unique.sql`
23. `supabase/migrations/20260704000003_fix_lifetime_null_expiry.sql`
24. `supabase/migrations/20260704000004_clicks_unique_constraint.sql`
25. `supabase/migrations/20260704000005_fix_broadcast_cursor_types.sql`
26. `supabase/migrations/20260704000006_analytics_tables.sql`
27. `supabase/migrations/20260704000007_admin_audit_table.sql`
28. `supabase/migrations/20260704000008_fix_ends_at_type.sql`
29. `supabase/migrations/20260704000009_indexes_slug_postback.sql`
30. `supabase/migrations/20260705000001_rls_new_tables.sql`
31. `supabase/migrations/20260705000002_conversions_idempotency_index.sql`
32. `supabase/migrations/20260705000003_login_lockout.sql`
33. `supabase/migrations/20260705000004_click_retention.sql`
34. `supabase/migrations/20260705000005_encrypt_postback_key.sql`
35. `supabase/migrations/20260705000006_updated_at_trigger.sql`
36. `supabase/migrations/20260705000007_index_sites_postback_key.sql`
37. `supabase/migrations/20260705000008_players_composite_index.sql`
38. `supabase/migrations/20260705000009_fix_postback_key_enc_table.sql`
39. `supabase/migrations/20260707000001_drop_permissive_public_policies.sql`
40. `supabase/migrations/20260708000000_telegram_identity_link.sql`
41. `supabase/migrations/20260708000001_broadcast_segments.sql`
42. `supabase/migrations/20260708000002_sessions_table.sql`
43. `supabase/migrations/20260711110000_defensive_schema_fixes.sql`
44. `supabase/migrations/20260711120000_support_messages.sql`
45. `supabase/migrations/20260711130000_support_reply.sql`
46. `supabase/migrations/20260713000001_active_site_id.sql`
47. `supabase/migrations/20260713000002_site_stats_fks.sql`
48. `supabase/migrations/20260713100000_bot_subscriber_source.sql`
49. `supabase/migrations/20260714000000_normalize_double_encoded_jsonb.sql`
50. `supabase/migrations/20260714000001_create_audit_log.sql`
51. `supabase/migrations/20260715000000_feature_flags.sql`
52. `supabase/migrations/20260715000001_rls_security_sweep.sql`
53. `supabase/migrations/20260715110000_provider_events_ledger.sql`
54. `supabase/migrations/20260715120100_unify_telegram_identity.sql`
55. `supabase/migrations/20260715130200_stable_player_identity.sql`
56. `supabase/migrations/20260715140000_admin_mfa_stepup.sql`
57. `supabase/migrations/20260715160000_postback_keys.sql`
58. `supabase/migrations/20260715170000_notification_credentials.sql`
59. `supabase/migrations/20260715180000_postback_usage.sql`
60. `supabase/migrations/20260716170000_period_enum.sql`
61. `supabase/migrations/20260717000001_player_extra_fields.sql`
62. `supabase/migrations/20260717000002_onboarding_emails.sql`
63. `supabase/migrations/20260717140000_bot_command_buttons.sql`
64. `supabase/migrations/20260717170000_support_tickets_user_status.sql`
65. `supabase/migrations/20260718000000_password_protected_boards.sql`
66. `supabase/migrations/20260718000001_auto_reset_scheduler.sql`
67. `supabase/migrations/20260718000001_referral_system.sql`
68. `supabase/migrations/20260718000002_analytics_v2.sql`
69. `supabase/migrations/20260718092850_draft_boards.sql`
70. `supabase/migrations/README.md`
71. `supabase/seed.sql`

---

## 2. Critical Findings

### [CRITICAL] Multiple Tables Exposed to `anon` Role (Missing RLS)
*   **Severity**: Critical
*   **File:Line**: 
    *   `20260715140000_admin_mfa_stepup.sql:20` (Table: `admin_recovery_codes`)
    *   `20260718000001_referral_system.sql:19` (Table: `referral_rewards`)
    *   `20260718000002_analytics_v2.sql:2, 13, 21` (Tables: `site_visitors`, `site_scroll_depth`, `site_clicks`)
*   **Affected Table/API**: `admin_recovery_codes`, `referral_rewards`, `site_visitors`, `site_scroll_depth`, `site_clicks`
*   **Why**: These tables were created in migrations AFTER the initial RLS sweeps and were never enabled for RLS. Due to baseline default privileges (`GRANT ALL ON TABLES TO anon`), these tables are fully readable and writable by anyone with the Supabase anon key via PostgREST. `admin_recovery_codes` exposure allows bypassing 2FA for any user.
*   **Repro Scenario**: `curl -H "apikey: ANON_KEY" https://project.supabase.co/rest/v1/admin_recovery_codes` returns all recovery hashes.
*   **Root Cause**: Inconsistent RLS application in incremental migrations and overly broad default privileges in baseline.
*   **Best Fix**: Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and appropriate policies (at least `TO service_role`) for every new table created in migrations.

### [CRITICAL] Duplicate Migration Timestamp Collision & Metadata Manipulation
*   **Severity**: Critical
*   **File:Line**: 
    *   `20260718000001_auto_reset_scheduler.sql`
    *   `20260718000001_referral_system.sql:6-14`
*   **Affected Table/API**: Supabase Migration Engine
*   **Why**: Two migrations share the same `20260718000001` prefix. `referral_system.sql` explicitly deletes the migration record for its own version (`DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260718000001'`) to force a re-run. This is extremely dangerous, can cause one migration to overwrite the other's status, and leads to non-deterministic schema states.
*   **Repro Scenario**: Deploying via `supabase db push` will behave inconsistently depending on which file is processed first or if one was already partially applied.
*   **Root Cause**: Manual collision of timestamps and anti-pattern use of metadata deletion to "fix" failed deployments.
*   **Best Fix**: Rename `referral_system.sql` to a unique timestamp and remove the `DELETE` from `schema_migrations`.

---

## 3. High/Medium Findings

### [HIGH] Security Definer Functions Missing `search_path`
*   **Severity**: High
*   **File:Line**: 
    *   `00000000000000_baseline.sql:211`
    *   `20260705000004_click_retention.sql:13`
*   **Affected Table/API**: `cleanup_old_clicks()` function
*   **Why**: Functions declared as `SECURITY DEFINER` run with owner privileges (usually `postgres`). Without an explicit `search_path`, they are vulnerable to search-path hijacking where a user creates a malicious object (e.g., a table or function) that the system function inadvertently uses.
*   **Repro Scenario**: Create a table named `click_daily` in a different schema and trick the `postgres` user into running `cleanup_old_clicks()` with a compromised search path.
*   **Root Cause**: Missing security best practice for PL/pgSQL functions.
*   **Best Fix**: Add `SET search_path TO 'public', 'pg_catalog'` to all `SECURITY DEFINER` functions.

### [HIGH] Non-Transactional Data Migration / Long-Running Locks
*   **Severity**: High
*   **File:Line**: `20260715120100_unify_telegram_identity.sql:17-106`
*   **Affected Table/API**: `users` and all child tables
*   **Why**: This migration performs a complex merge of duplicate users inside a single `DO` block. It executes multiple `UPDATE` and `DELETE` statements across many core tables. In a production database with many rows, this will hold high-level locks on `users`, `sites`, `payments`, etc., for the duration of the entire loop, potentially causing a full application outage.
*   **Repro Scenario**: Run migration on a DB with 100k users and 1M sites; observe lock contention and transaction log bloat.
*   **Root Cause**: Performing massive data reconstruction in a single synchronous migration block.
*   **Best Fix**: Perform data merging via a background script or batch the updates in smaller transactions outside the main migration if possible.

### [MEDIUM] Non-Concurrent Index Creation in Production
*   **Severity**: Medium
*   **File:Line**: 
    *   `20260625000000_payments_stars_idempotency.sql:27`
    *   `20260704000002_nowpayments_txref_unique.sql:19`
*   **Affected Table/API**: `payments` table
*   **Why**: The migrations create UNIQUE indexes without the `CONCURRENTLY` keyword. Creating a standard index on a large table takes a `SHARE` lock, blocking all writes (INSERT/UPDATE/DELETE) to that table until the index is built. The comment in `20260625000000` even mentions `CONCURRENTLY` but the SQL code fails to include it.
*   **Root Cause**: Discrepancy between documentation/intent and actual SQL implementation.
*   **Best Fix**: Use `CREATE UNIQUE INDEX CONCURRENTLY` and ensure `supabase: disable-transaction` is set for those files.

### [MEDIUM] Advisory Lock Hash Collisions
*   **Severity**: Medium
*   **File:Line**: `20260704000004_clicks_unique_constraint.sql:22`
*   **Affected Table/API**: `acquire_click_uniqueness_lock` / `clicks`
*   **Why**: Uses `hashtext(p_short_link_id::text || p_ip_hash)` which returns a 32-bit integer. Given the volume of clicks, collisions are guaranteed. A collision between two different IP/Link pairs will cause one to be incorrectly blocked or delayed by the other's lock.
*   **Root Cause**: 32-bit hash space is too small for high-cardinality unique keys.
*   **Best Fix**: Use a 64-bit lock by hashing to two 32-bit values or use a more robust unique constraint approach.

---

## 4. Minor/Consistency Findings

1.  **Enum Hazards**: `20260716170000_period_enum.sql` actually implements a `CHECK` constraint on a `TEXT` column instead of a native ENUM, despite the filename. While safer, it's inconsistent with other plan/status fields.
2.  **Redundant RLS Drops**: `20260707000001_drop_permissive_public_policies.sql` drops `service_all` policies that were already dropped and replaced in `20260625000005_rls_fix_anon_access.sql`.
3.  **Heuristic Backfills**: `20260704000003_fix_lifetime_null_expiry.sql` uses a `now() + interval '1 year'` heuristic to identify "lifetime" users, which may misidentify long-term annual subscribers.
4.  **Redundant Manual Cleanup**: `apps/leaderboard/src/site.js:1084` manually deletes stats on board deletion, which is now handled by `ON DELETE CASCADE` FKs added in `20260713000002_site_stats_fks.sql`.

---

## 5. Final Schema Reconstruction Summary

The final schema is a hybrid of a centralized user/site model and a partitioned/heavy-volume analytics model.

*   **Users**: Unified Telegram identity (via `telegram_user_id`), support for MFA/Step-up, and plan-based gating.
*   **Sites**: Multi-board support per user, custom domains (Cloudflare integration), password protection, and auto-reset scheduling.
*   **Players**: Stable identity via `normalized_name`, optimistic concurrency via `updated_at`, and expanded fields for advanced leaderboards.
*   **Analytics**: High-volume click tracking is partitioned by range (`clicks`), with daily/hourly rollups.
*   **Security**: RLS is "mostly" enabled but has significant holes in newer tables. The app relies on `service_role` and JS-level filtering, making PostgREST a secondary but currently dangerous access vector.

**Production Readiness Recommendation**: **HOLD**. The RLS leaks and migration collision must be fixed before deploying to production.
