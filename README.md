# GroupsMix

One platform for casino streamers, merged from two products:

- **Leaderboards** — hosted, editable public leaderboard page per streamer at `yourrank.site/<slug>` (was `rankup-saas`).
- **Telegram bots** — multi-tenant bot engine, promo-code delivery, tracked referral links, click/conversion analytics (was `casino-bot-platform`).

**One account. One dashboard. Two products.** A streamer signs up once and manages both their leaderboard and their Telegram bot from a single dashboard, backed by one Supabase Postgres database.

## Repo layout

```
groupsmix/
├── ARCHITECTURE.md          how the two halves fit together + why
├── DEPLOY.md                one-time setup, then two `wrangler deploy`s
├── db/
│   ├── schema.sql           unified Postgres schema (run once in Supabase)
│   └── partitions.sql       seed monthly click partitions
├── shared/                  code + specs shared by both Workers
│   ├── session.js / .ts     ONE cross-Worker session (gm_session + shared KV)
│   ├── shell-nav.js / .ts   shared dashboard nav (Leaderboard | Bot | ...)
│   ├── session.md, routing.md, telegram-login.md, dashboard-shell.md
└── apps/
    ├── leaderboard/         Cloudflare Worker (JS) — root of yourrank.site
    │   ├── src/             SSR pages, dashboard, password auth, NOWPayments
    │   └── wrangler.toml    route: yourrank.site/*
    └── bot/                 Cloudflare Worker (TS + Hono + grammY)
        ├── src/             /hook, /r, /pb, /bot dashboard, Telegram Stars
        └── wrangler.toml    routes: /bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*
```

## Quick mental model

```
                    yourrank.site (one Cloudflare zone)
        /*  (root) ──► Leaderboard Worker      /bot,/hook,/r,/pb ──► Bot Worker
              │                                          │
              └──────── shared gm_session (KV) ──────────┤
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
git clone https://github.com/rabavadev/groupsmix.git
cd groupsmix
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

Run the schema and partition scripts against your Supabase database:

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/partitions.sql
```

Then apply any migrations in `supabase/migrations/` (in timestamp order).

### Local Development

```bash
# Leaderboard app (yourrank.site/*)
cd apps/leaderboard && bun run dev

# Bot app (/bot/*, /hook/*, /r/*, /pb/*)
cd apps/bot && bun run dev
```

Each app starts a local Wrangler dev server. The bot app will need a public tunnel (e.g. `cloudflared tunnel`) to receive Telegram webhooks during development.

### Deploy

```bash
# Deploy both Workers
cd apps/leaderboard && wrangler deploy
cd apps/bot && wrangler deploy
```

See **DEPLOY.md** for first-time Cloudflare setup (routes, KV namespaces, Hyperdrive, secrets).

## Provenance

Merged from `rabavadev/rankup-saas` (leaderboards, D1→Postgres ported) and
`rabavadev/casino-bot-platform` (bots, already on Workers/Postgres). The
leaderboard's D1/SQLite data layer was rewritten to share the bot's Postgres.
