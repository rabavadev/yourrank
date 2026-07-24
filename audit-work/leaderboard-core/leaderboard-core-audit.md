# Production-Readiness Audit: Leaderboard Core

**Date**: 2026-07-24
**Scope**: apps/leaderboard/src/ (Handlers, Middleware, Data, Core)
**Manifest Count**: 37 files tracked/read

## Summary
The leaderboard core application demonstrates high production readiness with mature security patterns (CSRF protection, mandatory Admin 2FA, standardized error handling). Tenant isolation is consistently enforced via user ID checks in SQL queries and shared session resolution.

## Detailed Findings

### [HIGH] SEC-001: HTML Injection in Admin Support Reply Emails
- **File**: `apps/leaderboard/src/admin.js:323`
- **Endpoint**: `POST /api/admin/support/reply`
- **Why**: `m.name` is interpolated into email HTML without escaping.
- **Repro**: User submits name `</a><h1 style="color:red">XSS</h1>`; admin replies; recipient's email is defaced.
- **Fix**: Use `esc(m.name)` in the HTML template.

### [MEDIUM] BE-001: Non-standard CSV Escaping in Player Export
- **File**: `apps/leaderboard/src/handlers/sites.js:87`
- **Endpoint**: `GET /api/site/players/export`
- **Why**: Uses `JSON.stringify` for CSV fields. Escapes quotes with `\"` instead of `""`.
- **Repro**: Player name `Steve "The King"` results in broken CSV parsing in Excel.
- **Fix**: Replace `JSON.stringify` with `s => '"' + String(s).replace(/"/g, '""') + '"'`.

### [LOW] PERF-001: Loose Parameter Parsing in Quick-Add
- **File**: `apps/leaderboard/src/handlers/quick-add.js:25`
- **Endpoint**: `POST /api/sites/:id/quick-add`
- **Why**: Loose coercion of `payload.amount` to string before numeric parsing.
- **Repro**: `{"amount": [1,2]}` results in `12`.
- **Fix**: Add strict type check for number or string.

### [INFO] PERF-002: Infinite SSE Stream Poll
- **File**: `apps/leaderboard/src/handlers/public.js:141`
- **Endpoint**: `GET /api/public/:slug/stream`
- **Why**: Stream polls every 4s indefinitely.
- **Fix**: Add a 1-hour max duration for the `ReadableStream`.

## Audit Manifest
1. apps/leaderboard/src/admin.js
2. apps/leaderboard/src/auth.js
3. apps/leaderboard/src/auto-reset.js
4. apps/leaderboard/src/billing.js
5. apps/leaderboard/src/board-password.js
6. apps/leaderboard/src/constants.js
7. apps/leaderboard/src/data/auth.js
8. apps/leaderboard/src/data/sites.js
9. apps/leaderboard/src/email.js
10. apps/leaderboard/src/handlers/attribution.js
11. apps/leaderboard/src/handlers/auth.js
12. apps/leaderboard/src/handlers/billing.js
13. apps/leaderboard/src/handlers/contact.js
14. apps/leaderboard/src/handlers/csp-report.js
15. apps/leaderboard/src/handlers/docs.js
16. apps/leaderboard/src/handlers/leads.js
17. apps/leaderboard/src/handlers/log.js
18. apps/leaderboard/src/handlers/preview.js
19. apps/leaderboard/src/handlers/public.js
20. apps/leaderboard/src/handlers/quick-add.js
21. apps/leaderboard/src/handlers/referrals.js
22. apps/leaderboard/src/handlers/scores.js
23. apps/leaderboard/src/handlers/security.js
24. apps/leaderboard/src/handlers/sites.js
25. apps/leaderboard/src/handlers/support.js
26. apps/leaderboard/src/handlers/telegram-link.js
27. apps/leaderboard/src/index.js
28. apps/leaderboard/src/middleware/csrf.js
29. apps/leaderboard/src/middleware/custom-domain.js
30. apps/leaderboard/src/middleware/handler.js
31. apps/leaderboard/src/middleware/headers.js
32. apps/leaderboard/src/middleware/index.js
33. apps/leaderboard/src/middleware/public-api.js
34. apps/leaderboard/src/middleware/seo.js
35. apps/leaderboard/src/middleware/static-assets.js
36. apps/leaderboard/src/routes.js
37. apps/leaderboard/src/totp.js
