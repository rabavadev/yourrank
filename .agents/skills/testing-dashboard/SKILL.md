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
2. Start the local stack from the repo root:
   ```bash
   cd /home/ubuntu/repos/yourrank
   ./start-local.sh
   ```
   This starts Postgres, resets/migrates the `yourrank` database, and launches the leaderboard Worker on `http://localhost:8787`.
3. If `apps/leaderboard/src/assets_bundled.js` is missing, the static asset middleware will fail. Rebuild it with:
   ```bash
   cd apps/leaderboard
   node build.js
   ```
4. If the browser is closed, relaunch the Devin-managed Chrome on display `:0` with CDP on port `29229`:
   ```bash
   chrome_bin=$(ls /opt/.devin/chrome/chrome/linux-*/chrome-linux64/chrome | head -1)
   setsid "$chrome_bin" --no-sandbox --disable-gpu --remote-debugging-port=29229 \
     --user-data-dir="$HOME/.config/google-chrome-for-testing" \
     "http://localhost:8787/dashboard" >/tmp/chrome_cdp.log 2>&1 &
   ```
   Then use the dashboard shim to open tabs:
   ```bash
   $HOME/.local/bin/google-chrome http://localhost:8787/dashboard
   ```

## Test account and plan state

- Create an account at `/signup` (email/password). The app generates a sample board automatically.
- To toggle the Free/Paid state for verifying Pro feature cards, update the `users` table:
  ```sql
  UPDATE users SET plan='free', has_trial=false WHERE email='...';
  -- or
  UPDATE users SET plan='pro' WHERE email='...';
  ```
- You can also start a free Pro trial from the dashboard UI via `Plan & billing` → `Start free Pro trial`.

## Driving the UI

- The dashboard is heavily client-side. Editor tabs are switched by clicking `[data-egroup]` buttons (`data`, `appearance`, `share`, `legal`).
- Sidebar navigation uses `[data-nav]` buttons (`board`, `overview`, `manage`, etc.).
- The `computer` tool's native click coordinates can miss small elements or elements under the Chrome for Testing warning banners. If native clicks fail, use the Chrome DevTools Protocol:
  - CDP list: `curl http://localhost:29229/json/list`
  - Use `Runtime.evaluate` to read state or run JS.
  - Use `Input.dispatchMouseEvent` at the element's bounding-box center to reliably click tabs, toggles, and save buttons.
- The live preview is an iframe populated by `POST /dashboard/preview`. Watch it for real-time updates after changing templates, colors, or sections.

## Common gotchas

- If you reset the database or change `plan`, reload the dashboard to pick up the new state.
- The `Overview` page hides `ovQuickActions` when the onboarding checklist is complete (`setupComplete`), which means the Quick Actions card (including `Copy your page link`) can be invisible for accounts with the sample board.
- After editing colors/templates, the `#savebar` appears at the bottom. Click `#save` and wait for the `Saved. Your page is updated.` toast.
- Pro feature cards in `Appearance` switch between real forms (paid) and `.upsell-card` CTAs (free) based on `state.ME.plan`.

## Useful paths

- App root: `/home/ubuntu/repos/yourrank/apps/leaderboard`
- Dashboard entry: `http://localhost:8787/dashboard`
- Public board: `http://localhost:8787/<slug>`
- Local DB: `postgresql://postgres:postgres@localhost:5432/yourrank`
