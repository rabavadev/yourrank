# YourRank — Deploy Runbook

One-time setup, then two `wrangler deploy`s. No servers to babysit.

Everything runs on managed edge infra: Cloudflare Workers (stateless, auto-scaled)
+ Supabase Postgres (managed) + Hyperdrive (managed pooling). Nothing you keep alive.

## 0. Prereqs
- Cloudflare account with `yourrank.site` added as a zone (nameservers pointed at
  Cloudflare, zone status Active). The `routes` in both `wrangler.toml` files
  will fail to deploy until this zone exists.
- Supabase project for YourRank.
- `wrangler` authed to the account.

## 1. Database (once)
In the Supabase SQL editor, run in order:
1. `db/schema.sql`      — all tables, one `users` table, + the Stars idempotency index.
2. `db/partitions.sql`  — seed current + next 2 monthly click partitions.

Grab the **direct** connection string from Supabase → Project Settings → Database
→ Connection string → "Direct connection" (host `db.<ref>.supabase.co`, port 5432).
**Do not use the pooler (port 6543)** with Hyperdrive — Hyperdrive pools itself,
so pointing it at the Supabase pooler double-pools and causes connection hangs.

## 2. Hyperdrive (once, recommended)
```bash
wrangler hyperdrive create yourrank-db \
  --connection-string="postgresql://postgres.PROJECT:PASS@db.PROJECT.supabase.co:5432/postgres"
```
Paste the returned id into BOTH `apps/bot/wrangler.toml` and
`apps/leaderboard/wrangler.toml` under `[[hyperdrive]]` (replace `id = "..."`).
(If you skip Hyperdrive, set `DATABASE_URL` as a secret on each Worker instead.)

## 3. Shared session KV
Both Workers must point at the **same** KV namespace id (so one login works
across both). The id currently in both `wrangler.toml` files is
`26e47bcce19941839a20bd2cd5879e42`. If that namespace no longer exists, create
one and put the SAME id in both:
```bash
wrangler kv namespace create SESSIONS
```

## 4. Secrets
Leaderboard Worker (`cd apps/leaderboard`):
```bash
wrangler secret put NOWPAYMENTS_API_KEY
wrangler secret put NOWPAYMENTS_IPN_SECRET
wrangler secret put RESEND_API_KEY        # optional (transactional email)
wrangler secret put MAIL_FROM             # REQUIRED if RESEND_API_KEY is set;
                                          #   the From: address, e.g.
                                          #   "RankUp <hey@yourrank.site>"
                                          #   (Resend rejects an empty From)
wrangler secret put LEAD_WEBHOOK_URL      # optional (Discord/Slack ping on a new lead)
wrangler secret put PRO_PRICE_USD         # optional (defaults to 29)
# DATABASE_URL only if NOT using Hyperdrive
```
Bot Worker (`cd apps/bot`):
```bash
wrangler secret put TOKEN_ENC_KEY         # 32-byte hex (64 hex chars); encrypts streamer bot tokens
wrangler secret put ADMIN_API_KEY         # protects /bot/api/*
wrangler secret put IP_HASH_SALT          # salts hashed visitor IPs
wrangler secret put LOGIN_BOT_TOKEN       # @BotFather token for the Telegram Login WIDGET
wrangler secret put LOGIN_BOT_USERNAME    # that login bot's @username (the widget needs it)
wrangler secret put PLATFORM_BOT_TOKEN    # a SEPARATE @BotFather bot for Telegram Stars billing
wrangler secret put PLATFORM_WEBHOOK_SECRET
# DATABASE_URL only if NOT using Hyperdrive
```
Two distinct bots are needed: the **login** bot (powers "Login with Telegram" on
the /bot dashboard) and the **platform billing** bot (sends Stars invoices + the
plan-active message). They must not share a token.

## 5. Deploy
```bash
cd apps/leaderboard && node build.js && wrangler deploy    # rebuild assets_bundled.js first
cd ../bot           && wrangler deploy
```
Routes are declared in each `wrangler.toml`. Cloudflare sends `/bot/*`, `/hook/*`,
`/r/*`, `/pb/*`, `/billing/hook/*` to the bot Worker; everything else on
`yourrank.site` to the leaderboard Worker. More-specific routes win.

The leaderboard cookie domain comes from `SESSION_COOKIE_DOMAIN` (default
`.yourrank.site`). It must be the host-wide domain and match the deployed zone,
or the login cookie is rejected and nobody can log in.

## 6. Point the platform billing bot
```bash
curl -X POST https://yourrank.site/bot/api/billing/setup -H "x-api-key: $ADMIN_API_KEY"
```
This sets the billing bot's webhook to `https://yourrank.site/billing/hook/<PLATFORM_WEBHOOK_SECRET>`
so Stars payments flow back to the app.

## Notes
- Streamer bots are BYO-token: each streamer pastes their BotFather token in the
  Bot tab; the platform sets that bot's webhook to `https://yourrank.site/hook/<secret>`.
- Both Workers communicate with Supabase only as a SQL database via Hyperdrive
  (or the `DATABASE_URL` fallback). No Supabase REST API is used — the
  `SUPABASE_URL` / `SUPABASE_SERVICE_ROLES_KEY` secrets are not needed.

## 7. CI auto-deploy (optional, recommended)

`.github/workflows/deploy.yml` deploys both Workers automatically on every push
to `main` (and via manual "Run workflow"). You set **four** GitHub repo secrets
once, then push-to-deploy forever:

1. Create a Cloudflare API token: dash.cloudflare.com → My Profile → API Tokens
   → Create Token → "Edit Cloudflare Workers" template → scope it to the
   account + the `yourrank.site` zone. The "Workers Scripts: Edit" + "Account:
   Read" permissions are required. Copy the token.
2. Get your Cloudflare account id: your dash homepage → right sidebar →
   "Account ID" (a 32-char hex). Not the zone id.
3. Create a Supabase personal access token for CLI auth.
4. Use the Supabase database password for `supabase link --password`.

Add all four as **GitHub repo** secrets (repo → Settings → Secrets and variables →
Actions → New repository secret) — NOT Worker secrets:

| Repo secret               | Value                                      |
|---------------------------|--------------------------------------------|
| `CLOUDFLARE_API_TOKEN`    | the token from step 1                      |
| `CLOUDFLARE_ACCOUNT_ID`   | the 32-char account id from step 2         |
| `SUPABASE_ACCESS_TOKEN`   | Supabase personal access token             |
| `SUPABASE_DB_PASSWORD`    | Supabase DB password for CLI linking       |

That's it. Worker **runtime** secrets (`ADMIN_API_KEY`, `TOKEN_ENC_KEY`,
`PLATFORM_BOT_TOKEN`, etc.) are NOT in the repo and are NOT managed by CI —
set them once via `wrangler secret put` (section 4); they persist on the
Workers across every deploy. CI only ships code.

Trigger a first run from repo → Actions → "Deploy" → Run workflow, or just push
to `main`. The leaderboard job rebuilds `assets_bundled.js` then deploys; the
bot job typechecks then deploys `src/worker.ts`.

## 8. Staging deploy (optional)

`.github/workflows/staging.yml` provides a **manual-only** staging deploy for
both Workers. Trigger it from repo → Actions → "Deploy Staging" → Run workflow.

Before using it, finish the staging setup described in `apps/leaderboard/STAGING.md`
and in both app `wrangler.toml` files:
- create a separate staging Supabase project,
- create a separate staging Hyperdrive config,
- create a separate staging KV namespace,
- paste the staging IDs into both `[env.staging]` sections.

Important: both app `wrangler.toml` files currently keep the staging Hyperdrive
`id` commented out on purpose to prevent accidental production DB usage. Until
those IDs are filled in, a staging deploy is not fully configured.

---
