# AGENTS.md

Guidance for automated agents and new contributors working in this repo.

## Layout

- `apps/leaderboard` — public leaderboard + dashboard Worker (JavaScript, `src/`).
- `apps/bot` — Telegram bot + streamer dashboard Worker (TypeScript, `src/`).
- `apps/monitor` — uptime/monitor Worker.
- `shared/` — TypeScript modules shared across Workers, compiled to ignored
  `shared/*.js`. Edit the `.ts`; never edit the generated `.js`.
- `e2e/` — end-to-end tests.
- `supabase/migrations/` — SQL migrations (`YYYYMMDDHHMMSS_description.sql`).

## Runtime

- Bun `>= 1.3.0` (CI pins `1.3.0`), Node `>= 20`.
- Cloudflare Workers (Wrangler), Supabase/Postgres, Cloudflare Queues.

## Checks (run from repo root before committing)

```bash
bun run lint        # eslint: bot + leaderboard
bun run typecheck   # tsc: bot + leaderboard + monitor
bun run test        # shared + bot + leaderboard (per-file) + monitor
```

These mirror the `PR Check` workflow. A `.githooks/pre-commit` hook (enabled by
`bun install`) runs `lint` + `typecheck` automatically.

## Gotchas

- Leaderboard tests use process-global `mock.module`; run them **one file at a
  time** (`bun run test` and CI both do). Running `bun test src/__tests__` all at
  once corrupts mocks and produces misleading failures.
- Coverage gate is >= 60% lines on the leaderboard suite, excluding
  `audit-validation.test.js` (which is run only in isolation).
- After editing anything under `shared/`, run `node build-shared.mjs` so the
  Workers pick up the recompiled `.js`.
- Caches in the Workers are per-isolate L1 only (no KV/L2); invalidation clears
  the current isolate, and other isolates go stale until their TTL expires.

## Conventions

- Keep changes minimal and focused; follow the style of surrounding code.
- Never weaken CI gates or security controls to make a check pass.
- Never commit secrets; see `SECRETS.md`.
