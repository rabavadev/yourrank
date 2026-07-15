# Contributing to YourRank

## Setup

```bash
bun install
cp apps/bot/.env.example apps/bot/.env
cp apps/leaderboard/.env.example apps/leaderboard/.env
```

## Development

```bash
# Bot
cd apps/bot && bun run dev

# Leaderboard
cd apps/leaderboard && bun run dev
```

## Code Style

- Bot: TypeScript (.ts), ESLint with @typescript-eslint
- Leaderboard: JavaScript (.js), ESLint with eslint:recommended
- Shared modules: TypeScript (.ts) with compiled .js output

## Checks

The root scripts mirror exactly what CI enforces, so run them before pushing:

```bash
bun run lint        # eslint: bot + leaderboard
bun run typecheck   # tsc: bot + leaderboard + monitor
bun run test        # shared + bot + leaderboard (per-file) + monitor
```

Note: leaderboard tests must be run per file (as `bun run test` and CI both do) —
`bun test` on the whole directory corrupts process-global module mocks.

A pre-commit hook (in `.githooks/`, auto-enabled by `bun install` via the
`prepare` script) runs `lint` + `typecheck` on every commit.

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Run `bun run lint`, `bun run typecheck`, and `bun run test`
4. Open a PR against main

## Database Migrations

Migrations live in `supabase/migrations/`. Name format: `YYYYMMDDHHMMSS_description.sql`.

## Reference Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
- [DEPLOY.md](./DEPLOY.md) - Deployment procedures
- [SECRETS.md](./SECRETS.md) - Secrets inventory
- [`docs/history/`](./docs/history/) - Past audits and migration notes
