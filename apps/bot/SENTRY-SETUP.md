# Sentry Setup — Bot Worker (INFRA-102)

Error tracking for the Cloudflare Worker bot app using [toucan-js](https://github.com/robertcepa/toucan-js) (the recommended Sentry SDK for Cloudflare Workers before the official `@sentry/cloudflare` package reaches GA).

## 1. Install

```bash
cd apps/bot
bun add toucan-js
```

## 2. Initialize — top of `src/worker.ts`

Add the import and wrap the entry point at the very top of `src/worker.ts`:

```ts
import Toucan from "toucan-js";

export default {
  async fetch(req: Request, env: Record<string, any>, ctx: any): Promise<Response> {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx,              // waitUntil / passThroughOnException
      request: req,              // enriches events with request data
      environment: env.ENVIRONMENT ?? "production",
    });

    try {
      populateEnv(env);
      const { buildHonoApp } = await import("./hono-app.js");
      const app = buildHonoApp();
      return await app.fetch(req, env as any);
    } catch (err) {
      sentry.captureException(err);
      throw err;
    }
  },

  async scheduled(event: any, env: Record<string, any>, ctx: any): Promise<void> {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx,
      environment: env.ENVIRONMENT ?? "production",
    });

    try {
      populateEnv(env);
      // ... existing cron logic ...
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

```ts
try {
  // ... work ...
} catch (err) {
  sentry.captureException(err, { tags: { context: "broadcast-send" } });
  // or if sentry isn't in scope:
  console.error("[broadcast-send]: operation failed", err);
}
```

For inline `.catch()` chains (e.g. Telegram API calls), prefer:

```ts
await tg("sendMessage", { ... }).catch((err) => {
  console.error("[tg-send]: sendMessage failed", err);
});
```

## 5. Verify

1. Deploy: `wrangler deploy`
2. Trigger an error (e.g. hit a test route that throws)
3. Check your Sentry dashboard for the event

## Notes

- Toucan-js runs entirely in the Worker request context — no external process needed.
- For source maps, add `upload_source_map` to wrangler.toml and use the Sentry CLI or GitHub Action.
- If/when `@sentry/cloudflare` reaches stable, swap `toucan-js` for the official package.
