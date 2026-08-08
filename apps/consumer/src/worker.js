// Cloudflare Queue consumer for YourRank.
//
// Processes click, conversion, analytics (bump), and notification events durably
// off the request thread. Failed messages are retried and routed to the DLQ.
import { one, query, exec } from "../../../shared/db.js";
import { recordConversion } from "../../../shared/conversions.js";
import { logMinimizedClick } from "../../../shared/clicks.js";
import { bumpStat } from "../../../shared/stats.js";
import { dispatchNotifyEvent } from "../../../shared/notifications.js";
import { parseQueueEvent } from "../../../shared/queue-producer.js";
import { processKickRewardRedemption } from "../../../shared/kick-credits.js";

const db = { one, query };

function setProcessEnv(env) {
  const dbUrl = env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
  if (dbUrl) process.env.DATABASE_URL = dbUrl;
  if (env.PUBLIC_BASE_URL) process.env.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
}

async function alertDiscord(webhook, batch) {
  if (!webhook) return;
  const fields = batch.messages.map((msg) => ({
    name: `ID ${msg.id.slice(0, 12)}`,
    value: `type: ${msg.body?.type ?? "unknown"}`,
    inline: false,
  }));
  const embed = {
    title: "⚠️ YourRank events moved to DLQ",
    description: `${batch.messages.length} queue message(s) exhausted retries and reached the dead-letter queue.`,
    color: 0xff9900,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank Consumer" },
  };
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "YourRank DLQ", embeds: [embed] }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // Swallow — alerting must not block acking DLQ messages.
  }
}

async function handleDlq(batch, env, ctx) {
  for (const msg of batch.messages) {
    console.error(JSON.stringify({
      event: "queue_dlq_received",
      queue: batch.queue,
      message_id: msg.id,
      message_type: msg.body?.type ?? "unknown",
      ts: new Date().toISOString(),
    }));
    msg.ack();
  }
  ctx?.waitUntil(alertDiscord(env.DISCORD_MONITORING_WEBHOOK, batch));
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
    case "kick-redemption": {
      await processKickRewardRedemption({
        messageId: body.messageId,
        eventType: body.eventType,
        payload: body.payload,
      }, env);
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

    if (batch.queue === "yourrank-events-dlq") {
      return handleDlq(batch, env, ctx);
    }

    const tokenCache = new Map();
    let processed = 0;
    let failed = 0;

    for (const msg of batch.messages) {
      const startedAt = Date.now();
      try {
        await handleEvent(msg.body, tokenCache);
        msg.ack();
        processed++;
        console.log(JSON.stringify({
          event: "queue_message_processed",
          message_id: msg.id,
          message_type: msg.body?.type ?? "unknown",
          duration_ms: Date.now() - startedAt,
        }));
      } catch (err) {
        failed++;
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

    // Record that the consumer is alive and how much work it did in this batch.
    // This lets the monitor detect a silent outage instead of waiting for stale analytics.
    try {
      await exec(
        `INSERT INTO consumer_heartbeat (name, last_seen, processed_count, failed_count)
         VALUES ('consumer', now(), $1, $2)
         ON CONFLICT (name) DO UPDATE
         SET last_seen = now(),
             processed_count = consumer_heartbeat.processed_count + EXCLUDED.processed_count,
             failed_count = consumer_heartbeat.failed_count + EXCLUDED.failed_count`,
        [processed, failed]
      );
    } catch (hbErr) {
      console.error(JSON.stringify({
        event: "consumer_heartbeat_failed",
        error: hbErr instanceof Error ? hbErr.message : String(hbErr),
        ts: new Date().toISOString(),
      }));
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
