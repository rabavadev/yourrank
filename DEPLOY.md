# YourRank — Deploy Runbook

One-time setup, then two `wrangler deploy`s. No servers to babysit.

Everything runs on managed edge infra: Cloudflare Workers (stateless, auto-scaled)
+ Supabase Postgres (managed) + Hyperdrive (managed pooling). Nothing you keep alive.

## 0. Prereqs
- Cloudflare account with `yourrank.site` added as a zone (nameservers pointed at
  Cloudflare, zone status Active). The `routes` in both `wrangler.toml` files
  will fail to deploy until this zone exists.
- Supabase project **yourrank** (you have this).
- `wrangler` authed to the account.

## 1. Database (once)
Apply migrations via Supabase CLI:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```
This runs all migrations in `supabase/migrations/` (in timestamp order) against your Supabase database. The schema includes all tables (one `users` table, Stars idempotency index, click partitions, etc.).

Grab the **direct** connection string from Supabase → Project Settings → Database
→ Connection string → "Direct connection" (host `db.<ref>.supabase.co`, port 5432).
**Do not use the pooler (port 6543)** with Hyperdrive — Hyperdrive pools itself,
so pointing it at the Supabase pooler double-pools and causes connection hangs.

## 2. Hyperdrive (both Workers)
Both Workers use Hyperdrive to pool connections to Supabase Postgres.
Create one Hyperdrive config and paste the returned id into **both**
`apps/leaderboard/wrangler.toml` and `apps/bot/wrangler.toml` under `[[hyperdrive]]`
(replace `id = "..."`):

```
wrangler hyperdrive create yourrank-db \
  --connection-string="postgresql://postgres.PROJECT:PASS@db.PROJECT.supabase.co:5432/postgres"
```

The `DATABASE_URL` secret is kept as a fallback if Hyperdrive is removed or
for local development. Set it on both Workers if you are not using Hyperdrive
(see section 4 below).

## 3. Shared session storage (Postgres)
Sessions live in the `sessions` table in Postgres. A single `yr_session`
cookie is set `Domain=.yourrank.site` so a login on either Worker works on the
other. No shared KV is needed for sessions.

The `SESSIONS` KV namespace is still bound for a legacy rate-limit fallback;
ensure both Workers bind the same `SESSIONS` id (`26e47bcce19941839a20bd2cd5879e42`)
if you keep that fallback enabled:
```
wrangler kv namespace create SESSIONS
```

## 4. Secrets
Leaderboard Worker (`cd apps/leaderboard`):
```
wrangler secret put NOWPAYMENTS_API_KEY
wrangler secret put NOWPAYMENTS_IPN_SECRET
wrangler secret put RESEND_API_KEY        # optional (transactional email)
wrangler secret put MAIL_FROM             # REQUIRED if RESEND_API_KEY is set;
                                          #   the From: address, e.g.
                                          #   "YourRank <hey@yourrank.site>"
                                          #   (Resend rejects an empty From)
wrangler secret put LEAD_WEBHOOK_URL      # optional (Discord/Slack ping on a new lead)
wrangler secret put PRO_PRICE_USD         # optional (defaults to 29)
wrangler secret put DATABASE_URL          # REQUIRED — direct Supabase Postgres connection string
wrangler secret put SENTRY_DSN           # optional (Sentry error tracking)
wrangler secret put ENCRYPTION_KEY       # REQUIRED for postback encryption (32-byte hex)
```
Bot Worker (`cd apps/bot`):
```
wrangler secret put TOKEN_ENC_KEY         # 32-byte hex (64 hex chars); encrypts streamer bot tokens
wrangler secret put ADMIN_API_KEY         # protects /bot/api/*
wrangler secret put IP_HASH_SALT          # salts hashed visitor IPs
wrangler secret put LOGIN_BOT_TOKEN       # @BotFather token for the Telegram Login WIDGET
wrangler secret put LOGIN_BOT_USERNAME    # that login bot's @username (the widget needs it)
wrangler secret put PLATFORM_BOT_TOKEN    # a SEPARATE @BotFather bot for Telegram Stars billing
wrangler secret put PLATFORM_WEBHOOK_SECRET
wrangler secret put SENTRY_DSN            # optional (Sentry error tracking)
wrangler secret put ALLOW_DEV_LOGIN       # optional, NEVER set in prod (enables /auth/dev)
# DATABASE_URL only as fallback if Hyperdrive is removed
```
Two distinct bots are needed: the **login** bot (powers "Login with Telegram" on
the /bot dashboard) and the **platform billing** bot (sends Stars invoices + the
plan-active message). They must not share a token.

## 5. Deploy
```
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
```
curl -X POST https://yourrank.site/bot/api/billing/setup -H "x-api-key: $ADMIN_API_KEY"
```
This sets the billing bot's webhook to `https://yourrank.site/billing/hook/<PLATFORM_WEBHOOK_SECRET>`
so Stars payments flow back to the app.

## Notes
- Streamer bots are BYO-token: each streamer pastes their BotFather token in the
  Bot tab; the platform sets that bot's webhook to `https://yourrank.site/hook/<secret>`.
- Both Workers connect to Postgres via Hyperdrive. `DATABASE_URL` exists as a
  fallback. No Supabase REST API is used — the `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLES_KEY` secrets are not needed.

## 7. CI auto-deploy (optional, recommended)

`.github/workflows/deploy.yml` deploys both Workers to Cloudflare automatically
on every push to `main` (and via manual "Run workflow"). You set **two** GitHub
repo secrets once, then push-to-deploy forever:

1. Create a Cloudflare API token: dash.cloudflare.com → My Profile → API Tokens
   → Create Token → "Edit Cloudflare Workers" template → scope it to the
   account + the `yourrank.site` zone. The "Workers Scripts: Edit" + "Account:
   Read" permissions are required. Copy the token.
2. Get your Cloudflare account id: your dash homepage → right sidebar →
   "Account ID" (a 32-char hex). Not the zone id.

Add both as **GitHub repo** secrets (repo → Settings → Secrets and variables →
Actions → New repository secret) — NOT Worker secrets:

| Repo secret             | Value                                  |
|-------------------------|----------------------------------------|
| `CLOUDFLARE_API_TOKEN`  | the token from step 1                  |
| `CLOUDFLARE_ACCOUNT_ID` | the 32-char account id from step 2     |

That's it. Worker **runtime** secrets (`ADMIN_API_KEY`, `TOKEN_ENC_KEY`,
`PLATFORM_BOT_TOKEN`, etc.) are NOT in the repo and are NOT managed by CI —
set them once via `wrangler secret put` (section 4); they persist on the
Workers across every deploy. CI only ships code.

Trigger a first run from repo → Actions → "Deploy" → Run workflow, or just push
to `main`. The leaderboard job rebuilds `assets_bundled.js` then deploys; the
bot job deploys `src/worker.ts` directly (wrangler bundles the TS).

## 8. Auto-migrate the database (optional, recommended)

The `Deploy` workflow (`.github/workflows/deploy.yml`) runs database migrations
automatically as the first step of every deploy. The `migrate` job links to the
Supabase project and runs `supabase db push` before any Worker is deployed.

It needs **two** GitHub repo secrets (set at repo → Settings → Secrets and
variables → Actions → New repository secret):

| Repo secret             | Value                                   |
|-------------------------|-----------------------------------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase personal access token          |
| `SUPABASE_DB_PASSWORD`  | Database password for supabase link      |

If `SUPABASE_DB_PASSWORD` is missing, the deploy will **fail** (not skip) to
prevent shipping new code against an old schema. Migrations are idempotent
(most use `IF NOT EXISTS` / `DO $$` guards), so re-running is safe.

The two phases are:
- **Migrate** — runs `supabase db push` to sync the schema.
- **Deploy** — ships Worker code to Cloudflare (only after migrations succeed).

Both trigger on push to `main`. You can also trigger manually from repo → Actions.

