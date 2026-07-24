## Summary

Fixes the production-critical bugs found in the audit and live test report (C1, C1b, C1c, C1d, C1e, C1f, C1g) plus the missing reset/quick-add test coverage.

- **C1 — Password reset:** `handleReset` now calls `tx.unsafe(...)` inside `withTransaction` (the transaction handle has no `exec`). Added `handleReset` happy-path, invalid-token, and short-password tests in `apps/leaderboard/src/__tests__/auth-handlers.test.js`.
- **C1b — Quick Add 500:** `handleQuickAdd` no longer tries to read `site.data.players` from the raw site row. It loads the player list with `getPlayers`, maps DB snake_case columns to the camelCase shape `saveSite` expects, and persists the result.
- **C1c — Dashboard "© 1970":** `isLifetime()` in `dashboard/site.js` and `billing.js` no longer treats `0`/`null`/`undefined` expiry as a lifetime plan. `cookie-consent.js` now overwrites the shell footer copy with the current browser year so stale server-rendered dates don't show 1970.
- **C1d — Setup wizard publish:** `shared/validation.ts` `handlePutSite` schema now whitelists `isDraft` and `password` so the wizard's `PUT /api/site` payload passes strict validation. `shared/validation.js` rebuilt via `node build-shared.mjs`.
- **C1e — Enabled socials missing:** `publicShape` keeps enabled socials even when `url` is empty or `#`. `renderLeaderboard`/`leaderboard.js` and the streamer profile render disabled placeholder controls for missing URLs and keep the section visible when any enabled social exists.
- **C1f — Player profile 404s:** primary-domain player URLs now emit `/<slug>/player/<name>`; custom domains continue to use `/player/<name>`. The primary route extracts the full player name from path segments correctly.
- **C1g — Find-rank search inert:** `initFindRank` filters and hides non-matching `.t-row` and `.t3` cards, highlights the first match, and reports the match count.

All repo checks pass: `node build-shared.mjs`, `bun run lint`, `bun run typecheck`, `bun run test`.
