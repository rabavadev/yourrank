# GroupsMix — Unified Architecture

One platform for casino streamers. Two products, one account, one dashboard.

- **Leaderboards** (was `rankup-saas`): hosted, editable public leaderboard page per streamer at `yourrank.site/<slug>`.
- **Telegram bots** (was `casino-bot-platform`): multi-tenant bot engine, promo-code delivery, tracked referral links, click/conversion analytics.

A streamer signs up **once**. That single account owns both their leaderboard and their bot.

---

## The picture

```
                          yourrank.site  (one Cloudflare zone)
                                  │
              ┌───────────────────┴────────────────────┐
              │ route: /,/login,/signup,/dashboard,     │ route: /bot/*, /hook/*,
              │        /<slug>, /go/<slug>              │        /r/*, /pb/*, /billing/hook/*
              ▼                                          ▼
    ┌──────────────────┐                      ┌──────────────────────┐
    │ LEADERBOARD       │                      │ BOT WORKER            │
    │ Worker (JS)       │                      │ Worker (TS + Hono +   │
    │  - SSR pages      │                      │   grammY)             │
    │  - dashboard      │                      │  - /hook/:secret →    │
    │  - password auth  │                      │    all streamer bots  │
    │  - NOWPayments    │                      │  - /r/:slug redirect  │
    │  - analytics      │                      │  - /pb/:key postbacks │
    └────────┬──────────┘                      │  - Telegram-login     │
             │                                 │  - Telegram Stars     │
             │        shared KV (SESSIONS)     │  - cron: broadcasts,  │
             │        gm_session cookie        │    click rollup        │
             │      (Domain=.yourrank.site)    └───────────┬───────────┘
             │                                             │
             └──────────────────┬──────────────────────────┘
                                ▼
                    ┌───────────────────────────┐
                    │  Cloudflare Hyperdrive     │  (connection pooling)
                    └────────────┬──────────────┘
                                 ▼
                    ┌───────────────────────────┐
                    │  Supabase Postgres         │
                    │  project: groupsmix        │
                    │  ONE users table +         │
                    │  sites/players/...(LB) +   │
                    │  bots/offers/clicks/...(bot)│
                    └───────────────────────────┘

  Billing: NOWPayments (leaderboard Pro) + Telegram Stars (bot plans) → one payments ledger
  Deploy:  both Workers deploy to the same Cloudflare "Groupsmix" account
```

## Why this shape

| Choice | Reason |
|---|---|
| **One Postgres, one `users` table** | The whole point of "one dashboard" is one account. Same email = same streamer, who can have a leaderboard AND a bot. |
| **Supabase (not D1)** | The bot engine relies on Postgres features D1 can't do: monthly-**partitioned** `clicks`, `count(*) FILTER`, `make_interval`, JSONB. Moving the bot to SQLite would be a downgrade and lose partitioning. So the *leaderboard* moved to Postgres instead. |
| **Hyperdrive in front of Postgres** | Workers are serverless; opening a raw Postgres connection per request exhausts Supabase's connection cap. Hyperdrive pools + caches. Both Workers share one Hyperdrive config. |
| **Two Workers, not one** | The two apps have opposite runtimes (plain-JS Worker vs TS+Hono+grammY) and the bot needs **cron triggers** (broadcasts, click rollup) the leaderboard doesn't. Keeping them separate avoids a risky full rewrite and lets each deploy independently. They *feel* like one app via a shared nav + shared session. |
| **Shared session in KV** | One `gm_session` cookie scoped to `.yourrank.site` + one shared KV namespace = log in once, both Workers recognize you. |

## The seam that makes it "one app": the `users` table

Both original systems had a `users` table. Unified:

- `email` (citext, unique) — the join key. Same email across both products = same row.
- `password_hash` / `password_salt` — nullable. Set for password signups (leaderboard flow).
- `telegram_user_id` — nullable, unique. Set for Telegram-login (bot flow).
- A user can **link both**: sign up with email, later connect Telegram (or vice versa).
- `plan` (`free`/`pro`/`agency`), `plan_expires_at`, `status`, `is_admin`, `postback_key` — shared across both products.

Everything else hangs off `user_id`: `sites`/`players`/`archives`/`site_stats` (leaderboard), `bots`/`offers`/`short_links`/`clicks`/`conversions`/`broadcasts` (bot), and one shared `subscriptions`/`payments` ledger.

## Deploy targets

- Cloudflare account: **Groupsmix**
- Supabase project: **groupsmix**
- Domain: **yourrank.site**
- Two Workers on the one zone, routes as in the diagram.
- Secrets (per Worker, via `wrangler secret put`): `DATABASE_URL` (or Hyperdrive binding), `TOKEN_ENC_KEY` (bot), `IP_HASH_SALT` (bot), `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET` (leaderboard), `PLATFORM_BOT_TOKEN` + `PLATFORM_WEBHOOK_SECRET` (bot billing), `RESEND_API_KEY` (optional email), `LEAD_WEBHOOK_URL` (optional).

See `db/schema.sql` (run once in Supabase), `db/partitions.sql` (seed click partitions), and each app's `wrangler.toml`.
