// Kick channel-point credits logic shared by the leaderboard Worker and the
// queue consumer. Keeps webhook verification and credit-grant processing in
// one place so the architecture can scale without duplicating code.

import { one, exec, withTransaction } from "./db.js";

export interface KickRewardPayload {
  broadcaster?: { user_id?: number | string };
  redeemer?: {
    user_id?: number | string;
    username?: string;
    profile_picture?: string;
  };
  reward?: { id?: string; title?: string; cost?: number };
  status?: string;
}

export interface KickRewardEvent {
  messageId: string;
  eventType: string;
  payload: KickRewardPayload;
}

export interface KickRewardResult {
  credited: number;
  balance: number;
  newViewer: boolean;
}

export type KickRewardOutcome =
  | KickRewardResult
  | { duplicate: true }
  | { skipped: true };

// ---------------------------------------------------------------------------
// RSA-SHA256 / PKCS#1 v1.5 signature verification.
// Kick signs `Kick-Event-Message-Id.Kick-Event-Message-Timestamp.body`.
// ---------------------------------------------------------------------------
function base64StringToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pemToUint8Array(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  return base64StringToUint8Array(base64);
}

async function importKickPublicKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToUint8Array(pem);
  return crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

export async function verifyKickWebhookSignature(
  pem: string,
  message: string,
  signatureBase64: string
): Promise<boolean> {
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
  } catch (err: any) {
    console.error("[kick-credits] signature verification error:", err?.message || err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Credit-grant processing.
// Called from the queue consumer (and as a fallback from the webhook handler
// when the queue is not bound). Idempotent via `kick_reward_events.event_id`.
// ---------------------------------------------------------------------------

const CREDITABLE_STATUSES = new Set(["fulfilled", "accepted", "completed", "success"]);

export function isCreditableKickStatus(status: string | undefined): boolean {
  return CREDITABLE_STATUSES.has(String(status || "").toLowerCase());
}

export async function processKickRewardRedemption(
  event: KickRewardEvent
): Promise<KickRewardOutcome> {
  const { messageId, payload } = event;

  const broadcaster = payload.broadcaster || {};
  const redeemer = payload.redeemer || {};
  const reward = payload.reward || {};
  const status = String(payload.status || "");

  const channelExternalId = String(broadcaster.user_id || "");
  const redeemerKickUserId = String(redeemer.user_id || "");
  const rewardId = String(reward.id || "");
  const rewardTitle = String(reward.title || "");
  const rewardCost = Number(reward.cost || 0);

  if (!channelExternalId || !redeemerKickUserId || !rewardId) {
    throw new Error("Missing broadcaster, redeemer or reward ID");
  }

  if (!isCreditableKickStatus(status)) {
    return { skipped: true };
  }

  return await withTransaction(async (tx) => {
    // Idempotency: if we've already processed this message, skip it.
    const eventRows = (await tx.unsafe(
      `INSERT INTO kick_reward_events
         (event_id, event_type, reward_id, redeemer_kick_user_id, reward_cost, status, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [messageId, event.eventType, rewardId, redeemerKickUserId, rewardCost, status, JSON.stringify(payload)]
    )) as { event_id: string }[];
    if (!eventRows || eventRows.length === 0) {
      return { duplicate: true };
    }

    // Find the leaderboard site linked to this Kick channel.
    const site = await tx.one<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM sites WHERE kick_channel_external_id = $1 LIMIT 1",
      [channelExternalId]
    );
    if (!site) {
      throw new Error(`No site linked to Kick channel ${channelExternalId}`);
    }

    // Find the reward → credits mapping for this site.
    const mapping = await tx.one<{
      id: string;
      credits: number;
      kick_reward_cost: number;
    }>(
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

    // Upsert viewer.
    const viewerRows = (await tx.unsafe(
      `INSERT INTO viewers (kick_user_id, kick_username, kick_avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (kick_user_id)
       DO UPDATE SET kick_username = EXCLUDED.kick_username,
                     kick_avatar_url = EXCLUDED.kick_avatar_url,
                     updated_at = now()
       RETURNING id`,
      [redeemerKickUserId, redeemer.username || "", redeemer.profile_picture || ""]
    )) as { id: string }[];
    const viewerId = viewerRows[0].id;

    // Check whether this viewer already existed on this site.
    const existingSiteViewer = await tx.one<{ id: string }>(
      "SELECT id FROM site_viewers WHERE site_id = $1 AND viewer_id = $2 LIMIT 1",
      [site.id, viewerId]
    );

    // Upsert site viewer and grant credits.
    const creditAmount = Number(mapping.credits || 0);
    const svRows = (await tx.unsafe(
      `INSERT INTO site_viewers (site_id, viewer_id, balance, total_earned, total_spent)
       VALUES ($1, $2, $3, $3, 0)
       ON CONFLICT (site_id, viewer_id)
       DO UPDATE SET balance = site_viewers.balance + EXCLUDED.balance,
                     total_earned = site_viewers.total_earned + EXCLUDED.total_earned,
                     total_spent = site_viewers.total_spent,
                     updated_at = now()
       RETURNING id, balance`,
      [site.id, viewerId, creditAmount]
    )) as { id: string; balance: number }[];
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

    return {
      credited: creditAmount,
      balance: svRows[0].balance,
      newViewer: !existingSiteViewer,
    };
  });
}

// ---------------------------------------------------------------------------
// Admin helpers (used by dashboard API in Phase 1).
// ---------------------------------------------------------------------------

export async function upsertCreditRewardMapping(
  siteId: string,
  kickRewardId: string,
  kickRewardTitle: string,
  kickRewardCost: number,
  credits: number
): Promise<string> {
  const existing = await one<{ id: string }>(
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

  const rows = (await exec(
    `INSERT INTO credit_reward_mappings (site_id, kick_reward_id, kick_reward_title, kick_reward_cost, credits)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [siteId, kickRewardId, kickRewardTitle, kickRewardCost, credits]
  )) as { id: string }[];
  return rows[0].id;
}

export async function setSiteKickChannel(
  siteId: string,
  kickChannelExternalId: string,
  kickChannelName = ""
): Promise<void> {
  await exec(
    `UPDATE sites
        SET kick_channel_external_id = $1, kick_channel_name = $2, updated_at = now()
      WHERE id = $3`,
    [kickChannelExternalId, kickChannelName, siteId]
  );
}