---
name: Testing the YourRank dashboard locally
description: |
  How to run the YourRank leaderboard Worker locally, create a test account, and drive the redesigned dashboard UI for end-to-end testing.
---

# Testing the YourRank dashboard locally

## Devin Secrets Needed

None for the local flow itself, but the Worker expects a `.dev.vars` file under `apps/leaderboard/`. If it is missing, copy `apps/leaderboard/.dev.vars.example` and fill in:

- `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`
- `DATABASE_URL`
- `SESSION_COOKIE_DOMAIN=localhost`

## Environment setup

1. Use Node 22 for `wrangler dev`:
   ```bash
   export PATH="$HOME/.nvm/versions/node/v22.12.0/bin:$PATH"
   ```
2. Export the Hyperdrive local connection string inline when running `wrangler dev`:
   ```bash
   cd /home/ubuntu/repos/yourrank
   export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://postgres:postgres@localhost:5432/yourrank?sslmode=disable"
   ./start-local.sh
   ```
   (If `start-local.sh` blocks on `tail -f`, start Postgres/migrations separately and run `wrangler dev` directly.)
3. If `apps/leaderboard/src/assets_bundled.js` is missing or stale, rebuild it before the Worker loads:
   ```bash
   cd apps/leaderboard
   node build.js
   ```
4. Launch the Devin-managed Chrome on display `:0` with CDP on port `29229`:
   ```bash
   chrome_bin=$(ls /opt/.devin/chrome/chrome/linux-*/chrome-linux64/chrome | head -1)
   setsid "$chrome_bin" --no-sandbox --disable-gpu --remote-debugging-port=29229 \
     --user-data-dir="$HOME/.config/google-chrome-for-testing" \
     "http://localhost:8787/dashboard" >/tmp/chrome_cdp.log 2>&1 &
   ```
   The `computer` tool's native click coordinates can miss small targets because the 1024x768 scaled space does not always map to rendered elements under the Chrome-for-Testing banner. As a fallback, use `javascript:` URLs in the address bar (e.g. `javascript:document.querySelector('[data-nav="analytics"]').click(); void 0;`) or the DevTools Protocol.

## Test account and board state

- Create an account at `/signup` (email/password). The app seeds a sample board automatically with `published=false`.
- The dashboard lands on the Board editor for an unpublished board and on Home once `isBoardSetup()` is true (name + players + published).
- To bypass flaky form typing or toggle `published` quickly for UI testing, use a freshly created session and `PUT /api/site`:
  ```bash
  # 1. Insert a raw session for the target user
  raw=$(openssl rand -hex 32)
  hash=$(printf "$raw" | sha256sum | awk '{print $1}')
  docker compose exec -T postgres psql -U postgres -d yourrank \
    -c "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES ('$hash', '<user_id>', now(), now() + interval '30 days');"
  # 2. GET /api/site to check current payload
  curl -sS -H "Cookie: yr_session=$raw" http://localhost:8787/api/site | python3 -m json.tool
  # 3. PUT /api/site (need __csrf cookie + x-csrf-token)
  #    GET /dashboard to read the __csrf cookie, then PUT with `name`, `brand`, `published`.
  ```
- To toggle Free/Paid state for verifying Pro feature cards:
  ```sql
  UPDATE users SET plan='free', has_trial=false WHERE email='...';
  -- or
  UPDATE users SET plan='pro' WHERE email='...';
  ```

## Driving the UI

- Sidebar nav: `[data-nav]` values are `home`, `board`, `performance` (label "Analytics"), `settings`.
- Editor tab bar (`#editorTabs`): `[data-egroup]` values are `setup`, `players`, `design`, `share`, `history`.
- Settings anchors: `#settings-profile`, `#settings-plan`, `#settings-integrations`, `#settings-compliance`, `#settings-account`.
- Home active state key IDs: `ovActiveBento`, `ovBoardStatusWidget`, `ov_prize`, `ov_players`, `ov_resets`, `ovQuickActions`, `ov_copyLink`.
- Copy-link buttons: `#editorCopyLink` (topbar) and `#ov_copyLink` (Next steps).
- Live preview: `#designPreview` iframe is populated by `POST /dashboard/preview` and re-fits via `state.fitDesignPreview`.

## Common gotchas

- `wrangler dev` may fail with “Wrangler requires at least Node.js v22.0.0” when invoked through Bun; prepend the Node 22 path.
- If `assets_bundled.js` is stale, rebuilt assets won't be picked up until the Worker restarts or `wrangler dev` reloads; stop and restart `wrangler dev` after `node build.js`.
- `loadStats()` in `assets/dashboard/site.js` currently references legacy IDs (`st_views7`, `st_views30`, `st_copies30`, `st_clicks30`) that no longer exist in the redesigned markup, causing a console error and leaving Home/Analytics KPI values as “–”.
- Copy-link buttons depend on `navigator.clipboard.writeText`. On `http://localhost` it is a secure context and usually works, but if the event listener is wired before the button is enabled/disabled or if the button is disabled, the click may do nothing and the button never shows “Copied!”.
- `loadStats` and `updateDesignPreview` make authenticated requests; keep the session cookie and CSRF token in sync when testing via `curl`.

## Useful paths

- App root: `/home/ubuntu/repos/yourrank/apps/leaderboard`
- Dashboard entry: `http://localhost:8787/dashboard`
- Public board: `http://localhost:8787/<slug>`
- Local DB: `postgresql://postgres:postgres@localhost:5432/yourrank`
