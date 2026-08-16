# AGENTS.md

Guidance for automated agents and new contributors working in this repo.

## Layout

- `apps/leaderboard` — public leaderboard + dashboard Worker (JavaScript, `src/`).
- `apps/bot` — Telegram bot + streamer dashboard Worker (TypeScript, `src/`).
- `apps/monitor` — uptime/monitor Worker.
- `packages/shared/` — TypeScript modules shared across Workers and the Next.js app,
  built to `packages/shared/dist`. Edit the `.ts` and run `bun run --cwd packages/shared build`.
- `e2e/` — end-to-end tests.
- `supabase/migrations/` — SQL migrations (`YYYYMMDDHHMMSS_description.sql`).

## Runtime

- Bun `>= 1.3.0` (CI pins `1.3.0`), Node `>= 20`.
- Cloudflare Workers (Wrangler), Supabase/Postgres, Cloudflare Queues.

## Product and frontend design

- For UI/UX, frontend, redesign, navigation, layout, user-flow, or information-
  architecture work, load and actively apply both project skills:
  `.agents/skills/impeccable/SKILL.md` and
  `.agents/skills/frontend-design/SKILL.md`.
- Use Impeccable for product shaping, journey analysis, interaction quality,
  responsive behavior, accessibility, and implementation rigor. Use Frontend
  Design in the same task to establish a distinctive, subject-specific visual
  direction rather than a templated dashboard aesthetic.
- Treat the existing interface as evidence, not as the design source of truth.
  Inspect the connected journey and shared patterns, then fix underlying UX,
  navigation, hierarchy, or product-architecture problems when they affect the
  requested work.

## Checks (run from repo root before committing)

```bash
bun run lint        # eslint: bot + leaderboard
bun run typecheck   # tsc: bot + leaderboard + monitor
bun run test        # shared + bot + leaderboard (per-file) + monitor
```

These mirror the `PR Check` workflow. A `.githooks/pre-commit` hook (enabled by
`bun install`) runs `lint` + `typecheck` automatically.

## Gotchas

- Global module mocks are disallowed in shared and Worker tests. Bun's
  `mock.module` is process-global, so one test can replace a shared dependency
  for every later test in an aggregate run and produce misleading failures.
  Inject collaborators into the function under test instead; production
  defaults must remain unchanged. When a test genuinely needs a module fake,
  spread the real module exports and override only the collaborators it uses.
  A temporary, documented allowlist is enforced by
  `bun run check:test-mocks`; it must only shrink.
- Coverage gate is >= 60% lines on the leaderboard suite, excluding
  `audit-validation.test.js`, `credits-loop.test.js`, `public-stream-version.test.js`,
  and `sites-handlers.test.js` (which are run only in isolation).
- After editing anything under `packages/shared/`, run `bun run --cwd packages/shared build` so the
  Workers and `apps/web` pick up the recompiled `.js`.
- Caches in the Workers are per-isolate L1 only (no KV/L2); invalidation clears
  the current isolate, and other isolates go stale until their TTL expires.

## Conventions

- Keep changes minimal and focused; follow the style of surrounding code.
- Never weaken CI gates or security controls to make a check pass.
- Never commit secrets; see `SECRETS.md`.
