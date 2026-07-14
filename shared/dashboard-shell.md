# YourRank — Unified Dashboard Shell

Two Workers, one domain, **one dashboard feel**. The shell is a shared sticky
header injected at the top of *both* dashboards' server-rendered HTML. Because
the Workers share the domain and the `yr_session` cookie, plain `<a>` links
navigate between them with no re-auth — it reads as a single app.

Files: [`shell-nav.js`](./shell-nav.js) (leaderboard, JS) · [`shell-nav.ts`](./shell-nav.ts) (bot, TS). Identical output.

---

## Why "inject a shared header", not iframe / SPA / edge-compose

- **No iframe.** The parent's guidance floated an iframe for the Bot tab; we
  reject it. Iframes break cookie `SameSite=Lax` expectations in some browsers,
  add scroll/focus jank, and duplicate chrome. Since both Workers are same-origin
  (`yourrank.site`), a full-page navigation between tabs is cleaner and cheaper.
- **No client-side SPA router** spanning two Workers — that reintroduces the
  cross-origin fetch/CORS problem the parent flagged. Each dashboard stays a
  server-rendered page; only the top nav is shared code.
- **Shared string module** = zero build coupling. Each Worker `import`s the nav,
  concatenates `SHELL_NAV_CSS` into its `<style>` and `shellNavHtml(...)` at the
  top of `<body>`. Update the module → both dashboards update on next deploy.

---

## The nav

Sticky top bar, 56px, containing:

```
[GM YourRank]   Leaderboard  Bot  Analytics  Billing        {name}  {plan badge}  Logout
```

- **Brand** (`GM` lime chip + wordmark) → `/dashboard`.
- **Tabs** — `Leaderboard | Bot | Analytics | Billing`. The active tab is
  underlined in the lime accent, computed from the current path by `activeKey()`
  (longest-prefix match, so `/dashboard/billing` lights Billing, not
  Leaderboard).
- **Right side** — streamer `display_name` (falls back to `email`, then
  "Streamer"), a **plan badge** (`Free` muted / `Pro` · `Agency` accent), and a
  **Logout** link → `/logout`.

| Tab         | href                    | Served by          |
|-------------|-------------------------|--------------------|
| Leaderboard | `/dashboard`            | Leaderboard Worker |
| Bot         | `/bot/dashboard`        | Bot Worker         |
| Analytics   | `/dashboard/analytics`  | Leaderboard Worker |
| Billing     | `/dashboard/billing`    | Leaderboard Worker |
| Logout      | `/logout`               | Leaderboard Worker |

> Analytics + Billing live on the leaderboard Worker because that's where the
> unified account/plan UI (and NOWPayments) already is. The Bot tab is the only
> one that crosses to the bot Worker — a normal same-origin navigation.

---

## Aesthetic (locked to YourRank — anti-slop)

Pulled from `apps/leaderboard/src/assets/app.css`:

- Background near-black `#0b0b0c`, panels `#0f0f11`, hairlines `#232327`.
- **One** accent: lime `#c8ff00` (accent-ink `#0b0b0c`). No second accent.
- **No gradients, no glassmorphism, no blur, no shadows.** Flat surfaces,
  1px borders, a single 2px accent underline for the active tab.
- Type: **JetBrains Mono** for labels/tabs/badges (uppercase, tracked), **Inter**
  for the name. Tabs are `font-size:12px; letter-spacing:.08em; uppercase`.
- All classes namespaced `.gm-*` so the nav can never collide with either
  dashboard's own CSS.

---

## Integration — leaderboard Worker (`/dashboard`, JS)

```js
import { shellNavHtml, SHELL_NAV_CSS } from "../shared/shell-nav.js";
import { currentUser } from "../shared/session.js";

async function dashboardPage(req, env, url) {
  const user = await currentUser(req, env, (env, uid) => loadUserById(env, uid));
  if (!user) return Response.redirect(new URL("/login", url), 302);

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>YourRank — Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>${SHELL_NAV_CSS}${PAGE_CSS}</style></head><body>
${shellNavHtml({ activePath: url.pathname, user })}
<main class="gm-shell-main">
  <!-- existing leaderboard dashboard body here -->
</main>
</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
```

## Integration — bot Worker (`/bot/dashboard`, TS)

The bot's `dashboard.ts` currently renders `APP_HTML` at `/dashboard`. Under the
merge it moves to `/bot/dashboard` (see `routing.md`) and gains the shell:

```ts
import { shellNavHtml, SHELL_NAV_CSS } from "../shared/shell-nav.js"; // .js path, ESM
import { currentUserIdFromHeader } from "../shared/session.js";

app.get("/bot/dashboard", async (c) => {
  const uid = await currentUserIdFromHeader(c.req.header("cookie"), c.env as any);
  if (!uid) return c.redirect("/login");                    // login lives on leaderboard
  const user = await one(`SELECT display_name, email, plan FROM users WHERE id=$1`, [uid]);

  return c.html(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>YourRank — Bot</title>
<style>${SHELL_NAV_CSS}${BASE_CSS}</style></head><body>
${shellNavHtml({ activePath: "/bot/dashboard", user })}
<main class="gm-shell-main">
  ${BOT_DASHBOARD_BODY}   <!-- the existing APP_HTML body, minus its old header -->
</main>
</body></html>`);
});
```

Notes for the bot side:
- **Remove the old inline header** in `APP_HTML` (the `🎰 Streamer Dashboard`
  title + inline "Log out" button) — the shell replaces it. Keep the panels.
- The bot dashboard's client fetches change from `/dash/api/*` to
  `/bot/dash/api/*` (see `routing.md`) so they stay on the bot Worker.
- Its old `/auth/logout` (which cleared the `sess` cookie) is superseded by the
  shell's `/logout` on the leaderboard Worker, which clears `gm_session`
  host-wide. The bot Worker can drop its own logout route.

---

## Shared-code delivery (no monorepo build assumed)

The user's constraint is "no builds, no babysitting". Two low-friction options:

1. **Copy on deploy (simplest):** keep `shared/shell-nav.js` and `.ts` as the
   canonical pair; each app imports via a relative path if the repos are vendored
   into one deploy tree, or a tiny prepublish copy step drops the file into each
   app's `src/`. Since the module is a pure string+function with no deps, copying
   is safe.
2. **Path import (if both apps live under `/workspace/projects/yourrank/apps/`):**
   import directly with `../../shared/shell-nav.js`. Wrangler bundles it into
   each Worker at deploy. Preferred — one source of truth, no copy drift.

Either way, `.js` and `.ts` must stay behaviourally identical; the CSS block is
duplicated verbatim in both — a 30-second diff check on any change.

---

## Accessibility / correctness

- Active tab gets `aria-current="page"`.
- Logout is a normal link (GET `/logout`) → server destroys the KV session and
  clears the cookie, then redirects to `/`. No JS required for the shell to work.
- Nav is responsive: under 680px the wordmark and name hide, tab padding tightens.
