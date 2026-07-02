# Leaderboard Worker — D1 → Postgres (Supabase/Hyperdrive) Port Notes

Ported the RankUp leaderboard Worker off Cloudflare D1 (SQLite) onto Postgres,
reusing the same `query()` / `one()` data-layer API the bot Worker uses.

## Files changed

| File | Change |
|------|--------|
| `src/db.js` | **NEW.** Tiny `pg` Pool wrapper mirroring the bot's `db.ts`. Exports `query(text, params=[])` → rows[] and `one(text, params=[])` → rows[0]. Pool is created **lazily** on first `query()` so `process.env.DATABASE_URL` is set first. |
| `src/index.js` | Added `process.env.DATABASE_URL` bootstrap at top of `fetch()` from `env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL` (mirrors bot `worker.ts`). Ported all `env.DB` calls (logo lookup, signup, login, me, forgot, reset, track-copy, lead) to `query()`/`one()`. |
| `src/auth.js` | **Reconciled to the SHARED session module** (`../../../shared/session.js`) — no hand-rolled session code remains. Session create/destroy/cookie serialize/token read all delegate to the shared module (cookie `gm_session`, `Domain=.groupsmix.com`, shared `SESSIONS` KV, key `sess:<token>`, 30d TTL). PBKDF2 `hashPassword`/`verifyPassword`/`safeEqual` stay here. `currentUser()` resolves the token via `readTokenWithLegacy` (honors old `rk_session` during the cutover) then hydrates the user row through a Postgres `loadUser` using `one()` (epoch-ms timestamps, see below). |
| `src/site.js` | All site/player/archive reads+writes ported. JSONB handling reworked (no `JSON.parse` on read). |
| `src/stats.js` | Ported to `query()`. Table `stats` → `site_stats`. `day` DATE. `ON CONFLICT ... DO UPDATE` now qualifies `site_stats.<col>`. |
| `src/billing.js` | `effectivePlan`/`activatePro` reworked for TIMESTAMPTZ expiry; checkout/IPN ported to new `payments` schema (`amount`, JSONB `payload_json`). |
| `src/admin.js` | All 4 read handlers + action handler ported. Removed the local `const one = ...` shadow; now imports `one`/`query`. |
| `src/email.js` | **Unchanged** — no DB access. |
| `src/pages.js`, `src/render.js`, `src/assets/*`, `src/assets_bundled.js` | **Untouched** (pure templates), per instructions. |
| `wrangler.toml` | Removed D1 binding; kept KV `SESSIONS`; added `[[hyperdrive]]` binding placeholder (`REPLACE_WITH_HYPERDRIVE_ID`) + `compatibility_flags = ["nodejs_compat"]`; documented `DATABASE_URL` + other secrets. `main` now `src/index.js`. |
| `package.json` | **NEW.** Declares `pg` dependency + `wrangler` dev dep + build/deploy scripts. (Original app had none — it had zero npm deps under D1.) |
| `build.js` | **Unchanged** — asset bundling intact; re-ran it, produces `src/assets_bundled.js` fine. |

## Translation rules applied

- `?` placeholders → `$1, $2, …` positional.
- `.first()` → `one()`; `.all()` (which returned `{results}`) → `query()` (plain rows[]); `.run()` → `await query()`.
- **Timestamps:** old code stored/read unix-ms INTEGERs via `Date.now()`. Columns
  are now TIMESTAMPTZ. Writes use `now()` (or `to_timestamp($n/1000.0)` for a
  computed expiry). **Reads that the frontend consumes as numbers**
  (`plan_expires_at`, `created_at`, archive `.at`) are returned as
  **epoch-ms via `(EXTRACT(EPOCH FROM col) * 1000)::double precision`**. Chose
  `double precision` (not `bigint`) on purpose: node-postgres returns `int8`
  **and** `numeric` as JS **strings**, but `float8` as a real **number** — and
  the frontend does `new Date(ms)` / `Number(ms) > Date.now()`, which break on a
  bare numeric string. epoch-ms fits exactly in a double.
- **`plan_expires_at`:** now TIMESTAMPTZ (NULL = no expiry / lifetime), not the
  old integer `0`. `effectivePlan()` treats NULL/falsy as "no expiry".
  `activatePro(days<=0)` sets it to `NULL`; admin "free" sets it to `NULL`.
- **`published`** INTEGER 0/1 → BOOLEAN (`true` on insert; `published=true` in
  the track-copy query). **`is_admin`** → BOOLEAN (pg returns real booleans).
- **JSONB** (`extra_json`, `theme_json`, `snapshot_json`, `payload_json`): pg
  returns them as JS objects/arrays already — **removed all `JSON.parse` on
  read**. On write, pass `JSON.stringify(...)` cast with `$n::jsonb`.
- **`stats` → `site_stats`** everywhere; `day` is DATE (`getStats` normalises it
  back to `'YYYY-MM-DD'` via `to_char` so client-side day comparisons match).
- **`payments`:** `amount_usd` → `amount` (numeric) + added `currency`.
  `payload_json` TEXT → JSONB (store the parsed body object, not `raw.slice(...)`).
  NOWPayments statuses (`created/waiting/confirming/finished/failed/...`) all
  exist in the `pay_status` enum. `SUM()`/`COUNT()` results wrapped in `Number()`
  where they feed math or JSON numbers.
- **IDs:** app keeps generating `crypto.randomUUID()` for `users`, `sites`,
  `players`, `archives`, `leads` and inserts them explicitly (columns also have a
  `gen_random_uuid()` default as a fallback).

## Call sites I was unsure about / made a judgement call on

1. **NOWPayments `order_id` vs. the payments row id.** Original code used the
   prefixed TEXT string (`rk_<uuid>` / `manual_<uuid>`) **as the primary key**.
   `payments.id` is now a UUID, so a `rk_…` string can't be the id. **Decision:**
   generate the order_id as before but store it in **`tx_ref`**, let `id` default
   to a UUID, and look the row up by `tx_ref` in the IPN handler. Manual admin
   grants no longer set an explicit id at all. → If any external system relied on
   the payment row's id being the NOWPayments order_id, it should read `tx_ref`
   instead. (I judged nothing external depends on it — the IPN is the only reader.)

2. **`amount_usd` in the admin frontend.** `src/assets/admin.js` renders
   `Number(p.amount_usd).toFixed(2)`. To keep assets untouched I **aliased
   `amount AS amount_usd`** in `handlePayments`. Numeric-as-string is fine for
   `Number(...)`.

3. **Epoch-ms cast type.** As above I used `double precision` rather than the
   task's suggested `bigint`, specifically because pg serialises `bigint` as a
   string which would silently break `new Date(...)` on the (untouched) frontend.
   Flagging in case a reviewer expected literal `bigint`.

4. **`main` in wrangler.toml.** Original pointed at `dist/index.js` but nothing
   builds a `dist/` (build.js only writes `src/assets_bundled.js`); the original
   deploy appears to go through `deploy-meta.json` + the Cloudflare API. I set
   `main = "src/index.js"` so a plain `wrangler deploy` also works and bundles
   `pg`. If the real deploy path is the API-upload one, that flow's manifest may
   also need the D1 binding removed + Hyperdrive added (out of scope here — this
   dir has no `deploy-meta.json`).

5. **`password_hash` now nullable** (telegram-only users). `handleLogin` now
   rejects early if `password_hash` is null (`!user.password_hash`) so a
   passwordless account can't be logged into via the password form.

## Session reconciliation (shared module)

The leaderboard no longer has its own session implementation. `src/auth.js`
imports the cross-Worker shared session module at `../../../shared/session.js`
(the source of truth, delivered by the auth/dashboard agent) and delegates:

- **Cookie name** switched from `rk_session` → **`gm_session`** (Domain=
  `.groupsmix.com`), so a login on the leaderboard tab is valid on the bot tab
  and vice-versa. Both Workers bind the **same `SESSIONS` KV namespace** and use
  the same `sess:<token>` key + bare-UUID value + 30d TTL.
- `createSession` / `destroySession` / `cookieSet` / `cookieClear` / `newToken`
  are re-exported thin wrappers over the shared module, so existing call sites in
  `index.js` keep working unchanged.
- **`currentUser()`** resolves the token via the shared **`readTokenWithLegacy`**
  (accepts `gm_session` first, falls back to a legacy `rk_session` cookie during
  the cutover grace period), then hydrates the user row through a local
  `loadUser` that runs the Postgres `SELECT … FROM users WHERE id=$1` via `one()`
  (with the epoch-ms timestamp normalization). The KV prefix (`sess:`) is
  identical for both cookie names, so an old token resolves the same userId.
- PBKDF2 `hashPassword` / `verifyPassword` / `safeEqual` stay in `auth.js`.

### Two bugs found & fixed in the prior partial reconciliation
1. `currentUser` had been wired to the shared `currentUserId()`, which only reads
   `gm_session` — so a legacy `rk_session` cookie would NOT authenticate during
   the transition. Fixed by resolving the token with `readTokenWithLegacy` +
   `KV_PREFIX` directly inside `currentUser`.
2. `handleLogout` in `index.js` called `readToken(request)` but `readToken` was
   **not imported** (would throw a ReferenceError on logout). Added `readToken`
   to the `./auth.js` import — it re-exports the legacy-aware reader, so logout
   also clears either cookie.

### Note on the shared-module import path
The shared module lives at `groupsmix/shared/session.js`; from
`apps/leaderboard/src/auth.js` the correct relative path is
**`../../../shared/session.js`** (three levels up), not `../../shared/session.js`.
Wrangler's esbuild bundler follows the import from `src/index.js` → `auth.js` →
`shared/session.js` and bundles it into the Worker, so no extra wrangler config
is needed — but the `shared/` directory must be present at deploy/build time.

## Not done (by design)
- Sessions stay in **KV** (`env.SESSIONS`) — not moved to Postgres.
- Did not run wrangler or any live DB (sandbox has neither; `pg` isn't installed).
  Syntax-validated every file with `bun build --external pg` (all pass) and
  re-ran `build.js` successfully.
- `pg` must be installed at deploy time (`npm i` / `bun i`) and the Hyperdrive id
  + `DATABASE_URL` secret set — see the comments in `wrangler.toml`.
