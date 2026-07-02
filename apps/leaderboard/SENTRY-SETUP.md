# Sentry Setup — Leaderboard Worker (INFRA-102)

Error tracking for the Cloudflare Worker leaderboard app using [toucan-js](https://github.com/robertcepa/toucan-js) (the recommended Sentry SDK for Cloudflare Workers before the official `@sentry/cloudflare` package reaches GA).

## 1. Install

```bash
cd apps/leaderboard
bun add toucan-js
```

## 2. Initialize — top of `src/index.js`

Wrap the default export in `src/index.js` with Sentry:

```js
import Toucan from "toucan-js";

export default {
  async fetch(req, env, ctx) {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx,              // waitUntil / passThroughOnException
      request: req,              // enriches events with request data
      environment: env.ENVIRONMENT ?? "production",
    });

    try {
      // ... existing request handler (Hono app / router) ...
    } catch (err) {
      sentry.captureException(err);
      throw err;
    }
  },
};
```

## 3. Set the DSN secret

```bash
wrangler secret put SENTRY_DSN
# Paste your Sentry DSN, e.g. https://abc123@o123456.ingest.sentry.io/789
```

## 4. Capture in existing catch blocks

Replace silent `catch {}` or `catch (e) { /* noop */ }` with:

```js
try {
  // ... work ...
} catch (err) {
  sentry.captureException(err, { tags: { context: "bump-stat" } });
  // or if sentry isn't in scope:
  console.error("[bump-stat]: operation failed", err);
}
```

For fetch calls that may fail silently:

```js
try {
  await fetch(env.LEAD_WEBHOOK_URL, { ... });
} catch (err) {
  console.error("[lead-webhook]: webhook delivery failed", err);
}
```

## 5. Verify

1. Deploy: `wrangler deploy`
2. Trigger an error (e.g. hit a test route that throws)
3. Check your Sentry dashboard for the event

## Notes

- Toucan-js runs entirely in the Worker request context — no external process needed.
- For source maps, build them locally and use the Sentry CLI or GitHub Action to upload.
- If/when `@sentry/cloudflare` reaches stable, swap `toucan-js` for the official package.
