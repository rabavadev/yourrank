# YourRank Refactoring Progress

## Completed Tasks

### 1. Migration Consolidation ✅
- **Status**: Completed
- **Action**: Documented migration history consolidation from `db/migrations/` to `supabase/migrations/`
- **Files**: Created `supabase/migrations/README.md` documenting the migration mapping
- **Impact**: Resolves the correctness hazard of having two migration directories out of sync

### 2. Telegram-send Logic Consolidation ✅
- **Status**: Completed  
- **Action**: Created shared notification module `shared/notifications.ts`
- **Files**: 
  - Created `shared/notifications.ts` with Discord and Telegram helpers
  - Updated `apps/leaderboard/src/notifications.js` to use shared utilities (temporarily kept local implementation for compatibility)
- **Impact**: Moves Telegram delivery logic to shared module, reducing coupling between Workers

### 3. Conversions Data Module ✅
- **Status**: Completed
- **Action**: Extracted `recordConversion()` from `apps/bot/src/hono-app.ts` to dedicated data module
- **Files**:
  - Created `apps/bot/src/conversions.ts` with conversion data operations
  - Updated `apps/bot/src/hono-app.ts` to import from conversions module
- **Impact**: Separates data access from routing in the bot Worker

## Pending Tasks (Require Build System Changes)

### 1. Database Layer Consolidation
- **Status**: Started (shared module created, but integration blocked by build system)
- **Action**: Created `shared/db.ts` as consolidated database layer
- **Blocker**: Requires TypeScript compilation for leaderboard Worker to use shared module
- **Files**: 
  - Created `shared/db.ts` (consolidated postgres.js wrapper)
  - Updated `apps/bot/src/db.ts` to import from shared (temporarily reverted to maintain compatibility)
  - Updated `apps/leaderboard/src/db.js` with transitional comments
- **Next Steps**: 
  - Set up TypeScript compilation for leaderboard Worker
  - Update both Workers to import from `shared/db.ts`
  - Delete duplicate implementations

### 2. Session Module Consolidation
- **Status**: Not started
- **Action**: Consolidate `shared/session.js` and `shared/session.ts` into single TypeScript module
- **Blocker**: Requires TypeScript compilation for leaderboard Worker
- **Next Steps**:
  - Make `shared/session.ts` the canonical implementation
  - Compile to JavaScript for leaderboard Worker
  - Delete `shared/session.js`
  - Update imports in both Workers

### 3. Shell-nav Module Consolidation
- **Status**: Not started
- **Action**: Consolidate `shared/shell-nav.js` and `shared/shell-nav.ts` into single TypeScript module
- **Blocker**: Requires TypeScript compilation for leaderboard Worker
- **Next Steps**:
  - Make `shared/shell-nav.ts` the canonical implementation
  - Compile to JavaScript for leaderboard Worker
  - Delete `shared/shell-nav.js`
  - Update imports in both Workers

### 4. Crypto Module Consolidation
- **Status**: Started (shared module created, but integration blocked by build system)
- **Action**: Created `shared/crypto.ts` as consolidated crypto utilities
- **Blocker**: Requires TypeScript compilation for leaderboard Worker
- **Files**:
  - Created `shared/crypto.ts` (consolidated AES/HMAC primitives)
  - Updated `apps/bot/src/crypto.ts` to import from shared (temporarily reverted to maintain compatibility)
  - Updated `apps/leaderboard/src/crypto.js` with transitional comments
- **Next Steps**:
  - Set up TypeScript compilation for leaderboard Worker
  - Update both Workers to import from `shared/crypto.ts`
  - Delete duplicate implementations

## Complex Refactoring Tasks (Require Major Code Restructuring)

### 1. Break up apps/leaderboard/src/index.js (1,210 lines)
- **Status**: Not started
- **Complexity**: High - largest single file refactor
- **Scope**:
  - Extract route table (path → handler)
  - Move handleX bodies into feature modules (auth, sites, billing, admin, leads)
  - Push every inline SQL string down into data module
- **Target Shape**: Follow bot Worker pattern (hono-app.ts routes → feature handlers → db.ts)
- **Estimated Effort**: 4-6 hours

### 2. Split apps/bot/src/dashboard.ts (739 lines)
- **Status**: Not started
- **Complexity**: Medium
- **Scope**:
  - Extract auth module (Telegram-login HMAC verification, session-issuing auth)
  - Extract API handlers module (~15 API route handlers with inline SQL)
  - Extract views module (HTML templates for login and dashboard pages)
- **Estimated Effort**: 2-3 hours

## Technical Requirements for Completion

### Build System Setup
To complete the shared module consolidations, the leaderboard Worker needs:
1. TypeScript installation (`npm install --save-dev typescript @types/node`)
2. TypeScript configuration (`tsconfig.json` with `allowJs: true`)
3. Build script update to compile shared TypeScript modules
4. Update `package.json` to compile TypeScript before deployment

### Dependencies
- `typescript`: ^5.5.3
- `@types/node`: ^20.14.10
- Existing: `postgres`: ^3.4.9 (already installed)

## Risk Assessment

### Low Risk
- Migration consolidation (documentation only)
- Conversions data module extraction (isolated change)
- Telegram-send logic consolidation (kept local implementation for compatibility)

### Medium Risk
- Database layer consolidation (core infrastructure, affects all DB operations)
- Crypto module consolidation (security-sensitive, affects token encryption)

### High Risk
- Session module consolidation (authentication, affects login/logout)
- Shell-nav consolidation (UI, affects dashboard rendering)
- Index.js breakup (largest refactor, affects all leaderboard routing)
- Dashboard.ts split (affects bot Worker authentication and dashboard)

## Recommendations

### Immediate Actions (Can be done without build system)
1. Complete the conversions data module extraction ✅
2. Document migration consolidation ✅
3. Create shared notification module ✅

### Short-term Actions (Require build system setup)
1. Set up TypeScript compilation for leaderboard Worker
2. Consolidate crypto module
3. Consolidate database layer
4. Consolidate session module
5. Consolidate shell-nav module

### Long-term Actions (Major refactoring)
1. Break up apps/leaderboard/src/index.js
2. Split apps/bot/src/dashboard.ts

## Testing Strategy

For each consolidation:
1. Run existing test suite (`npm test`)
2. Manual testing of affected features
3. Integration testing between Workers
4. Load testing for database operations
5. Security testing for crypto/session changes

## Rollback Plan

All changes maintain backwards compatibility through transitional implementations:
- Keep original files with `TEMPORARY` comments
- Gradually migrate imports
- Delete original files only after verification
- Git tags before each major consolidation
