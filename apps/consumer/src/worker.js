// Cloudflare Queue consumer for YourRank.
//
// Processes click, conversion, analytics (bump), and notification events durably
// off the request thread. Failed messages are retried and routed to the DLQ.
import { one, query } from "../../../shared/db.js";
import { recordConversion } from "../../../shared/conversions.js";
import { logMinimizedClick } from "../../../shared/clicks.js";
import { bumpStat } from "../../../shared/stats.js";
import { dispatchNotifyEvent } from "../../../shared/notifications.js";
import { parseQueueEvent } from "../../../shared/queue-producer.js";

const db = { one, query };

function setProcessEnv(env) {
  const dbUrl = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (dbUrl) process.env.DATABASE_URL = dbUrl;
  if (env.PUBLIC_BASE_URL) process.env.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
}

async function handleEvent(input, tokenCache) {
  const body = parseQueueEvent(input);

  switch (body.type) {
    case "click": {
      await logMinimizedClick(
        body.shortLinkId,
        body.ipHash,
        body.tgUserId ?? null,
        body.clickRef
      );
      break;
    }
    case "conversion": {
      await recordConversion(body.ownerId, body.query);
      break;
    }
    case "bump": {
      await bumpStat(body.siteId, body.field, body.referer ?? null);
      break;
    }
    case "notify": {
      await dispatchNotifyEvent(db, {}, body, tokenCache);
      break;
    }
    default: {
      throw new Error(`unsupported queue event: ${body.type}`);
    }
  }
}

export default {
  async queue(batch, env, ctx) {
    setProcessEnv(env);
    const tokenCache = new Map();

    for (const msg of batch.messages) {
      const startedAt = Date.now();
      try {
        await handleEvent(msg.body, tokenCache);
        msg.ack();
        console.log(JSON.stringify({
          event: "queue_message_processed",
          message_id: msg.id,
          message_type: msg.body?.type ?? "unknown",
          duration_ms: Date.now() - startedAt,
        }));
      } catch (err) {
        console.error(JSON.stringify({
          event: "queue_message_failed",
          message_id: msg.id,
          message_type: msg.body?.type ?? "unknown",
          duration_ms: Date.now() - startedAt,
          error: err instanceof Error ? err.message : String(err),
        }));
        msg.retry();
      }
    }
  },

  async fetch(request, env, ctx) {
    setProcessEnv(env);
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("consumer ok", { status: 200 });
  },
};
