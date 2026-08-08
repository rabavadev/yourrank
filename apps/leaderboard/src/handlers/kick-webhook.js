// Kick webhook handler for channel-point reward redemptions.
// Grants non-cashable credits to viewers when they redeem a mapped Kick reward.
import { json, bad } from "../auth.js";
import { one, exec, withTransaction } from "../../../../shared/db.js";

const KICK_REWARD_EVENT = "channel.reward.redemption.updated";

// ---------------------------------------------------------------------------
// Public-key signature verification (RSA-SHA256 / PKCS#1 v1.5)
// Kick signs the concatenation: `Kick-Event-Message-Id.Kick-Event-Message-Timestamp.body`
// ---------------------------------------------------------------------------
function base64StringToUint8Array(base64) {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pemToUint8Array(pem) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  return base64StringToUint8Array(base64);
}

async function importKickPublicKey(pem) {
  const keyData = pemToUint8Array(pem);
  return crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

async function verifyKickSignature(pem, message, signatureBase64) {
  try {
    const publicKey = await importKickPublicKey(pem);
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    const signature = base64StringToUint8Array(signatureBase64);
    return crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      publicKey,
      signature,
      messageBuffer
    );
  } catch (err) {
    console.error("[kick-webhook] signature verification error:", err?.message || err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Webhook entry point
// ---------------------------------------------------------------------------
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
  const isValid = await verifyKickSignature(publicKeyPem, signedMessage, signature);
  if (!isValid) {
    return bad("Invalid webhook signature", 401);
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

  const broadcaster = payload.broadcaster || {};
  const redeemer = payload.redeemer || {};
  const reward = payload.reward || {};
  const status = String(payload.status || "").toLowerCase();

  const channelExternalId = String(broadcaster.user_id || "");
  const redeemerKickUserId = String(redeemer.user_id || "");
  const rewardId = String(reward.id || "");
  const rewardTitle = String(reward.title || "");
  const rewardCost = Number(reward.cost || 0);

  if (!channelExternalId || !redeemerKickUserId || !rewardId) {
    return bad("Missing broadcaster, redeemer or reward ID", 400);
  }

  // Only credit rewards that actually completed.
  const creditableStatuses = new Set(["fulfilled", "accepted", "completed", "success"]);
  if (!creditableStatuses.has(status)) {
    return json({ ok: true, skipped: payload.status });
  }

  try {
    const result = await withTransaction(async (tx) => {
      // Idempotency: if we've already processed this message, skip it.
      const eventRows = await tx.unsafe(
        `INSERT INTO kick_reward_events
           (event_id, event_type, reward_id, redeemer_kick_user_id, reward_cost, status, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (event_id) DO NOTHING
         RETURNING event_id`,
        [messageId, eventType, rewardId, redeemerKickUserId, rewardCost, payload.status || "", JSON.stringify(payload)]
      );
      if (!eventRows || eventRows.length === 0) {
        return { duplicate: true };
      }

      // Find the leaderboard site linked to this Kick channel.
      const site = await tx.one(
        "SELECT id, user_id FROM sites WHERE kick_channel_external_id = $1 LIMIT 1",
        [channelExternalId]
      );
      if (!site) {
        throw new Error(`No site linked to Kick channel ${channelExternalId}`);
      }

      // Find the reward → credits mapping for this site.
      const mapping = await tx.one(
        `SELECT id, credits, kick_reward_cost
           FROM credit_reward_mappings
          WHERE site_id = $1 AND kick_reward_id = $2 AND active = true
          LIMIT 1`,
        [site.id, rewardId]
      );
      if (!mapping) {
        throw new Error(`No credit mapping for reward ${rewardId} on site ${site.id}`);
      }

      // Anti-tamper: make sure the reward cost hasn't changed since mapping.
      const expectedCost = Number(mapping.kick_reward_cost || 0);
      if (expectedCost !== 0 && expectedCost !== rewardCost) {
        throw new Error(`Reward cost mismatch for ${rewardId}: expected ${expectedCost}, got ${rewardCost}`);
      }

      // Upsert viewer (the person redeeming on Kick).
      const viewerRows = await tx.unsafe(
        `INSERT INTO viewers (kick_user_id, kick_username, kick_avatar_url)
         VALUES ($1, $2, $3)
         ON CONFLICT (kick_user_id)
         DO UPDATE SET kick_username = EXCLUDED.kick_username,
                       kick_avatar_url = EXCLUDED.kick_avatar_url,
                       updated_at = now()
         RETURNING id`,
        [redeemerKickUserId, redeemer.username || "", redeemer.profile_picture || ""]
      );
      const viewerId = viewerRows[0].id;

      // Upsert site viewer and grant credits.
      const creditAmount = Number(mapping.credits || 0);
      const svRows = await tx.unsafe(
        `INSERT INTO site_viewers (site_id, viewer_id, balance, total_earned, total_spent)
         VALUES ($1, $2, $3, $3, 0)
         ON CONFLICT (site_id, viewer_id)
         DO UPDATE SET balance = site_viewers.balance + EXCLUDED.balance,
                       total_earned = site_viewers.total_earned + EXCLUDED.total_earned,
                       total_spent = site_viewers.total_spent,
                       updated_at = now()
         RETURNING id, balance`,
        [site.id, viewerId, creditAmount]
      );
      const siteViewerId = svRows[0].id;

      // Record immutable ledger entry.
      await tx.unsafe(
        `INSERT INTO credit_ledger
           (site_viewer_id, type, amount, description, metadata, kick_event_id)
         VALUES ($1, 'earn', $2, $3, $4, $5)`,
        [
          siteViewerId,
          creditAmount,
          `Kick reward: ${rewardTitle}`,
          JSON.stringify({
            reward_id: rewardId,
            reward_title: rewardTitle,
            reward_cost: rewardCost,
            channel_id: channelExternalId,
          }),
          messageId,
        ]
      );

      // Update the event row with the site we credited.
      await tx.unsafe(
        "UPDATE kick_reward_events SET site_id = $1 WHERE event_id = $2",
        [site.id, messageId]
      );

      return { credited: creditAmount, balance: svRows[0].balance };
    });

    if (result.duplicate) {
      return json({ ok: true, duplicate: true });
    }

    return json({ ok: true, credited: result.credited, balance: result.balance });
  } catch (err) {
    console.error("[kick-webhook] processing failed:", err?.message || err);
    return bad("Failed to process redemption", 500);
  }
}

// ---------------------------------------------------------------------------
// Manual admin helpers (used by dashboard API later)
// ---------------------------------------------------------------------------

/** Create or update a reward mapping for a site. */
export async function upsertCreditRewardMapping(
  siteId,
  kickRewardId,
  kickRewardTitle,
  kickRewardCost,
  credits
) {
  const existing = await one(
    `SELECT id FROM credit_reward_mappings
      WHERE site_id = $1 AND kick_reward_id = $2
      LIMIT 1`,
    [siteId, kickRewardId]
  );

  if (existing) {
    await exec(
      `UPDATE credit_reward_mappings
        SET kick_reward_title = $1, kick_reward_cost = $2, credits = $3, active = true, updated_at = now()
      WHERE id = $4`,
      [kickRewardTitle, kickRewardCost, credits, existing.id]
    );
    return existing.id;
  }

  const rows = await exec(
    `INSERT INTO credit_reward_mappings (site_id, kick_reward_id, kick_reward_title, kick_reward_cost, credits)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [siteId, kickRewardId, kickRewardTitle, kickRewardCost, credits]
  );
  return rows[0].id;
}

/** Set a site's linked Kick channel ID. */
export async function setSiteKickChannel(siteId, kickChannelExternalId, kickChannelName) {
  await exec(
    `UPDATE sites
        SET kick_channel_external_id = $1, kick_channel_name = $2, updated_at = now()
      WHERE id = $3`,
    [kickChannelExternalId, kickChannelName || "", siteId]
  );
}