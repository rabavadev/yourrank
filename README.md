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
    ├── bot/                 Cloudflare Worker (TS + Hono + grammY)
    │   ├── src/             /bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*
    │   └── wrangler.toml    routes: /bot/*, /hook/*, /r/*, /pb/*, /billing/hook/*
    └── consumer/            Cloudflare Queue consumer (no HTTP routes)
        ├── src/worker.js    drains yourrank-events: clicks, conversions,
        │                    analytics bumps, notifications; DLQ → Discord alert
        └── wrangler.toml    consumes yourrank-events + yourrank-events-dlq
```

> ⚠️ **The consumer is not optional.** The leaderboard and bot Workers only
> *enqueue* analytics events; if `apps/consumer` isn't deployed, the
> `yourrank-events` queue fills up and dashboard analytics (views, clicks,
> conversions) silently starve. Deploy it with the other two Workers — see
> DEPLOY.md §5.

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

The bot Worker’s deployed entrypoint is `src/worker.ts`, and `bun run dev` uses `wrangler dev` to match production routing more closely.
Because `/assets/*` belongs to the leaderboard Worker’s root route, run the
leaderboard Worker alongside the bot Worker for local dashboard styling. A
standalone bot Worker does not serve those shared assets.

For webhook testing during local debug, the bot app will need a public tunnel (e.g. `cloudflared tunnel`) to receive Telegram webhooks.

### Deploy

```bash
# Deploy all three Workers (leaderboard + bot + queue consumer)
cd apps/leaderboard && wrangler deploy
cd apps/bot && wrangler deploy
node build-shared.mjs && cd apps/consumer && wrangler deploy
```

See **DEPLOY.md** for first-time Cloudflare setup (routes, KV namespaces, Hyperdrive, secrets).

### Staging load test

The capacity ramp is an opt-in k6 harness. It requires an explicit target and
board slug, has no production default, and refuses `yourrank.site` /
`www.yourrank.site`.

After provisioning an isolated staging database and seeding the fixtures in
`/home/ubuntu/audit/CAPACITY_AUDIT.md` §12, run the mixed viewer plan:

```bash
TARGET_URL=https://staging.example.test BOARD_SLUG=large-board \
k6 run docs/load-test.js
```

The plan runs T1–T7 at 100 → 250 → 500 → 1,000 → 2,500 → 5,000 → 10,000
VUs, exercising board HTML, a held SSE stream, page-two pagination, search,
and a `/go` redirect. Run the audit's SSE-only test separately with `STAGE=T0`:

```bash
TARGET_URL=https://staging.example.test BOARD_SLUG=large-board \
STAGE=T0 k6 run docs/load-test.js
```

To run one mixed stage, set `STAGE=T1` through `STAGE=T7`; it ramps to that
stage's target, holds for the audit duration, and ramps down. Threshold
failures require investigation: board-render p95 under 1.5 seconds, regular
request errors under 1%, and early SSE closes under 5%. The k6 summary reports
p50/p95/p99 timings; correlate it with Worker CPU, Hyperdrive pool errors,
Supabase CPU/connections, and queue backlog as described in the audit.
**Never point this harness at production.**

## Provenance

Merged from `rabavadev/yourrank` (leaderboards, D1→Postgres ported) and
the bot engine (already on Workers/Postgres). The leaderboard's D1/SQLite
data layer was rewritten to share the bot's Postgres.
