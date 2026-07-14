# YourRank

One platform for casino streamers, merged from two products:

- **Leaderboards** — hosted, editable public leaderboard page per streamer at `yourrank.site/<slug>`.
- **Telegram bots** — multi-tenant bot engine, promo-code delivery, tracked referral links, click/conversion analytics.

**One account. One dashboard. Two products.** A streamer signs up once and manages both their leaderboard and their Telegram bot from a single dashboard, backed by one Supabase Postgres database.

## Repo layout

```text
yourrank/
├── ARCHITECTURE.md          how the two halves fit together + why
├── DEPLOY.md                one-time setup, then two `wrangler deploy`s
├── supabase/
│   └── migrations/          SQL migrations (applied via `supabase db push`)
├── shared/                  code + specs shared by both Workers
│   ├── session.js / .ts     ONE cross-Worker session (yr_session + Postgres sessions)
│   ├── shell-nav.js / .ts   shared dashboard nav (Leaderboard | Bot | ...)
│   ├── session.md, routing.md, telegram-login.md, dashboard-shell.md
└── apps/
    ├── leaderboard/         Cloudflare Worker (JS) — root of yourrank.site
    │   ├── src/             SSR pages, dashboard, password auth, NOWPayments
    │   └── wrangler.toml    route: yourrank.site/*
    └── bot/                 Cloudflare Worker (TS + Hono + grammY)
        ├── src/             /bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*
        └── wrangler.toml    routes: /bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*
```

## Quick mental model

```text
                    yourrank.site (one Cloudflare zone)
        /*  (root) ──► Leaderboard Worker      /bot,/hook,/r,/pb ──► Bot Worker
              │                                          │
              └──────── shared yr_session + sessions (Postgres) ────┤
              └──────── Supabase Postgres (Hyperdrive) ──┘
                        one users table = one account
```

Start with **ARCHITECTURE.md**, then **DEPLOY.md**.

## Quick Start

### Prerequisites

- **Node.js** >= 20
- **[bun](https://bun.sh)** (used as package manager & runtime)
- **[Supabase](https://supabase.com)** account (Postgres database)
- **[Cloudflare](https://cloudflare.com)** account (Workers deployment)
- **[Wrangler](https://developers.cloudflare.com/workers/wrangler/)** CLI (`npm i -g wrangler`)

### Clone & Install

```bash
git clone https://github.com/rabavadev/yourrank.git
cd yourrank
bun install
```

### Environment Variables

Copy the example files and fill in your values:

```bash
cp apps/bot/.env.example apps/bot/.env
cp apps/leaderboard/.env.example apps/leaderboard/.env
```

Each file is commented with what's required vs optional. Key variables:

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | both apps | Supabase direct Postgres connection (not the pooler) |
| `TOKEN_ENC_KEY` | bot | 32-byte hex key for encrypting bot tokens at rest |
| `ADMIN_API_KEY` | bot | Protects `/bot/api/*` admin endpoints |
| `LOGIN_BOT_TOKEN` | bot | Telegram bot used for the Login widget |

### Database Setup

Apply migrations via Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This runs all migrations in `supabase/migrations/` (in timestamp order) against your Supabase database.

### Local Development

1. Start the local Postgres container:
```bash
docker compose up -d
```

2. Copy the local dev vars (these are not committed):
```bash
cp apps/leaderboard/.dev.vars.example apps/leaderboard/.dev.vars
cp apps/bot/.dev.vars.example apps/bot/.dev.vars
```

3. Apply the migrations to the local database:
```bash
for f in $(ls supabase/migrations/*.sql | sort); do
  psql "postgresql://postgres:postgres@localhost:5432/yourrank" -f "$f"
done
```

4. Run the Workers:
```bash
# Leaderboard app (yourrank.site/*)
cd apps/leaderboard && bun run dev

# Bot app (/bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*)
cd apps/bot && bun run dev
```

The `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` value in
`.dev.vars` tells Wrangler to connect the local `HYPERDRIVE` binding to the
Postgres container instead of a remote Supabase database.

The bot Worker’s deployed entrypoint is `src/worker.ts`, and `bun run dev` now uses `wrangler dev` to match production routing more closely.
If you still need the older Node/tsx path for comparison, run:

```bash
cd apps/bot && bun run dev:legacy
```

For webhook testing during local debug, the bot app will need a public tunnel (e.g. `cloudflared tunnel`) to receive Telegram webhooks.

### Deploy

```bash
# Deploy both Workers
cd apps/leaderboard && wrangler deploy
cd apps/bot && wrangler deploy
```

See **DEPLOY.md** for first-time Cloudflare setup (routes, KV namespaces, Hyperdrive, secrets).

## Provenance

Merged from `rabavadev/yourrank` (leaderboards, D1→Postgres ported) and
the bot engine (already on Workers/Postgres). The leaderboard's D1/SQLite
data layer was rewritten to share the bot's Postgres.
