# GroupsMix — Deploy Runbook

One-time setup, then two `wrangler deploy`s. No servers to babysit.

Everything runs on managed edge infra: Cloudflare Workers (stateless, auto-scaled)
+ Supabase Postgres (managed) + Hyperdrive (managed pooling). Nothing you keep alive.

## 0. Prereqs
- Cloudflare "Groupsmix" account, `groupsmix.com` added as a zone.
- Supabase project **groupsmix** (you have this).
- `wrangler` authed to the Groupsmix account.

## 1. Database (once)
In the Supabase SQL editor for project **groupsmix**, run in order:
1. `db/schema.sql`      — all tables, one `users` table.
2. `db/partitions.sql`  — seed current + next 2 monthly click partitions.

Grab the pooled connection string from Supabase → Project Settings → Database →
Connection string (use the **connection pooler / port 6543** string for serverless).

## 2. Hyperdrive (once, recommended)
```
wrangler hyperdrive create groupsmix-db \
  --connection-string="postgresql://postgres.PROJECT:PASS@aws-0-REGION.pooler.supabase.com:6543/postgres"
```
Paste the returned id into BOTH `apps/bot/wrangler.toml` and
`apps/leaderboard/wrangler.toml` under `[[hyperdrive]]`, and uncomment.
(If you skip Hyperdrive, set `DATABASE_URL` as a secret on each Worker instead.)

## 3. Shared session KV
Both Workers already point at the same KV namespace id
(`26e47bcce19941839a20bd2cd5879e42`). If that namespace no longer exists, create
one and put the SAME id in both wrangler.toml files:
```
wrangler kv namespace create SESSIONS
```

## 4. Secrets
Leaderboard Worker (`cd apps/leaderboard`):
```
wrangler secret put NOWPAYMENTS_API_KEY
wrangler secret put NOWPAYMENTS_IPN_SECRET
wrangler secret put RESEND_API_KEY        # optional (email resets)
wrangler secret put LEAD_WEBHOOK_URL      # optional (Discord/Telegram ping)
# DATABASE_URL only if NOT using Hyperdrive
```
Bot Worker (`cd apps/bot`):
```
wrangler secret put TOKEN_ENC_KEY         # 32-byte hex
wrangler secret put ADMIN_API_KEY
wrangler secret put IP_HASH_SALT
wrangler secret put PLATFORM_BOT_TOKEN
wrangler secret put PLATFORM_WEBHOOK_SECRET
# DATABASE_URL only if NOT using Hyperdrive
```

## 5. Deploy
```
cd apps/leaderboard && bun build.js && wrangler deploy
cd ../bot           && wrangler deploy
```
Routes are declared in each wrangler.toml. Cloudflare sends `/bot/*`, `/hook/*`,
`/r/*`, `/pb/*`, `/billing/hook/*` to the bot Worker; everything else on
`groupsmix.com` to the leaderboard Worker. More-specific routes win.

## 6. Point the platform billing bot
```
curl -X POST https://groupsmix.com/bot/api/billing/setup -H "x-api-key: $ADMIN_API_KEY"
```

## Notes
- The sandbox can't run wrangler or Postgres (bun shim, no real Node). Build + deploy
  happen against the real Cloudflare edge, which runs the true Workers runtime.
- Streamer bots are BYO-token: each streamer pastes their BotFather token in the Bot
  tab; the platform sets that bot's webhook to `groupsmix.com/hook/<secret>`.
