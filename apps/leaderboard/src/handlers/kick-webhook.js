// Kick webhook handler for channel-point reward redemptions.
// Keeps the request thread thin: verify the signature, filter the event, then
// drop it onto the shared events queue. The consumer durably grants credits.
import { json, bad } from "../auth.js";
import { createQueueProducer } from "@yourrank/shared/queue-producer";
import {
  verifyKickWebhookSignature,
  isCreditableKickStatus,
  isReversibleKickStatus,
  processKickRewardRedemption,
} from "@yourrank/shared/kick-credits";

const KICK_REWARD_EVENT = "channel.reward.redemption.updated";
const KICK_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

// If the queue binding is missing, process the event inline so local/dev
// tests still work, but always prefer the queue for scale.
async function processFallback(event, env) {
  const result = await processKickRewardRedemption(event, env);
  console.log("[kick-webhook] fallback processed:", result);
  return result;
}

export async function handleKickWebhook(request, env) {
  const rawBody = await request.text();
  const messageId = request.headers.get("Kick-Event-Message-Id");
  const timestamp = request.headers.get("Kick-Event-Message-Timestamp");
  const signature = request.headers.get("Kick-Event-Signature");
  const eventType = request.headers.get("Kick-Event-Type");

  if (!messageId || !timestamp || !signature || !eventType) {
    return bad("Missing Kick webhook headers", 400);
  }

  const publicKeyPem = env.KICK_WEBHOOK_PUBLIC_KEY;
  if (!publicKeyPem) {
    console.error("[kick-webhook] KICK_WEBHOOK_PUBLIC_KEY is not configured");
    return bad("Webhook public key not configured", 500);
  }

  const signedMessage = `${messageId}.${timestamp}.${rawBody}`;
  const isValid = await verifyKickWebhookSignature(publicKeyPem, signedMessage, signature);
  if (!isValid) {
    return bad("Invalid webhook signature", 401);
  }

  const timestampMs = Date.parse(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return bad("Invalid webhook timestamp", 400);
  }
  const now = Date.now();
  if (now - timestampMs > KICK_WEBHOOK_MAX_AGE_MS || timestampMs > now + 60_000) {
    return bad("Webhook event timestamp outside accepted window", 400);
  }

  // Acknowledge any event we don't care about so Kick doesn't retry.
  if (eventType !== KICK_REWARD_EVENT) {
    return json({ ok: true, ignored: eventType });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return bad("Invalid JSON body", 400);
  }

  // Queue creditable completions and reversible cancellations/refunds.
  if (!isCreditableKickStatus(payload.status) && !isReversibleKickStatus(payload.status)) {
    return json({ ok: true, skipped: payload.status });
  }

  const producer = createQueueProducer(env.EVENTS_QUEUE, processFallback, env);

  try {
    await producer.send({
      type: "kick-redemption",
      messageId,
      eventType,
      payload,
    });
    return json({ ok: true, queued: true });
  } catch (err) {
    console.error("[kick-webhook] enqueue/fallback failed:", err?.message || err);
    return bad("Failed to queue redemption", 500);
  }
}