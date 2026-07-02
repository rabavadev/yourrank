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

## Provenance

Merged from `rabavadev/rankup-saas` (leaderboards, D1→Postgres ported) and
`rabavadev/casino-bot-platform` (bots, already on Workers/Postgres). The
leaderboard's D1/SQLite data layer was rewritten to share the bot's Postgres.
