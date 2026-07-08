# Backup & Restore Plan — YourRank

**Date:** 2026-07-08
**Status:** Pending S M action

## Current State

Supabase project: `lygcqzjxlqbvymkfjvel`
- Automated backups: **unknown** (needs verification in Supabase dashboard)
- PITR: **unknown** (needs verification)

## Action Items (requires S M)

### 1. Enable PITR in Supabase

1. Go to Supabase Dashboard → Project → Settings → Backups
2. Enable Point-in-Time Recovery (PITR)
3. Set retention to at least 7 days
4. Document the RPO (Recovery Point Objective): ≤ 5 minutes with PITR

### 2. Perform Restore Drill

1. Create a scratch Supabase project
2. Restore from backup to the scratch project
3. Verify data integrity:
   - All tables present
   - Row counts match
   - Foreign key constraints intact
   - RLS policies applied
4. Time the restore process (RTO - Recovery Time Objective)
5. Document results here

### 3. Document RTO/RPO

| Metric | Target | Actual |
|--------|--------|--------|
| RPO (data loss window) | ≤ 5 min | TBD |
| RTO (restore time) | ≤ 30 min | TBD |
| Backup retention | 7 days | TBD |

## Emergency Restore Procedure

1. Go to Supabase Dashboard → Project → Settings → Backups
2. Select the restore point (timestamp)
3. Confirm restore (this overwrites the current database)
4. Wait for restore to complete
5. Verify health: `GET /health` should return `db: true`
6. Verify data: check a known board and user

## Related

- Phase 4.1 of launch plan
- Supabase docs: https://supabase.com/docs/guides/platform/backups
