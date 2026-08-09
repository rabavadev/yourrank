// Kick channel-point credits logic shared by the leaderboard Worker and the
// queue consumer. Keeps webhook verification and credit-grant processing in
// one place so the architecture can scale without duplicating code.

import { one, query, exec, withTransaction } from "./db.js";
import { rateLimit } from "./ratelimit.js";
import {
  effectivePlan,
  type PlanTier,
  CREDITS_VIEWERS_PER_30D_LIMITS,
} from "./plans.js";

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
  | { skipped: true; reason?: string }
  | { blocked: true }
  | { rateLimited: true }
  | { planLimit: true; plan: PlanTier }
  | { suspended: true }
  | { unverified: true };

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

// Simple Levenshtein distance for username similarity checks.
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = Array(a.length + 1).fill(0).map((_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let diag = prev[0];
    prev[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const temp = prev[i];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      prev[i] = Math.min(prev[i] + 1, prev[i - 1] + 1, diag + cost);
      diag = temp;
    }
  }
  return prev[a.length];
}

export interface AntiFraudEnv {
  SESSIONS?: any;
  RATE_LIMITER_DO?: any;
  RL_BACKEND?: string;
  RL_FAIL_OPEN?: string;
}

export async function processKickRewardRedemption(
  event: KickRewardEvent,
  env?: AntiFraudEnv
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
    return { skipped: true, reason: "Missing broadcaster, redeemer or reward ID" };
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

    // Find the leaderboard site linked to this Kick channel and lock it.
    const site = await tx.one<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM sites WHERE kick_channel_external_id = $1 LIMIT 1",
      [channelExternalId]
    );
    if (!site) {
      return { skipped: true };
    }
    await tx.unsafe("SELECT id FROM sites WHERE id=$1 FOR UPDATE", [site.id]);

    // Resolve effective plan for the streamer and reject suspended/unverified accounts.
    const owner = await tx.one<{ plan: string; plan_expires_at: number | null; status: string; email_verified: boolean }>(
      `SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at,
              status, email_verified
         FROM users WHERE id = $1`,
      [site.user_id]
    );
    if (owner && owner.status === "suspended") return { suspended: true };
    if (owner && !owner.email_verified) return { unverified: true };
    const plan = effectivePlan(owner);

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
      return { skipped: true };
    }

    // Anti-tamper: make sure the reward cost hasn't changed since mapping.
    const expectedCost = Number(mapping.kick_reward_cost || 0);
    if (expectedCost !== 0 && expectedCost !== rewardCost) {
      return { skipped: true, reason: `Reward cost mismatch for ${rewardId}: expected ${expectedCost}, got ${rewardCost}` };
    }

    // Upsert viewer and record username history.
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

    const username = String(redeemer.username || "").trim().toLowerCase();
    if (username) {
      // Track username history to detect alt-account swaps.
      await tx.unsafe(
        `INSERT INTO viewer_username_history (viewer_id, username)
         VALUES ($1, $2)
         ON CONFLICT (viewer_id, username)
         DO UPDATE SET seen_at = now()`,
        [viewerId, username]
      );
    }

    // Check whether this viewer already existed on this site.
    const existingSiteViewer = await tx.one<{ id: string }>(
      "SELECT id FROM site_viewers WHERE site_id = $1 AND viewer_id = $2 LIMIT 1",
      [site.id, viewerId]
    );

    // Enforce new-viewer plan limit (rolling 30 days) for new site viewers.
    if (!existingSiteViewer) {
      const newViewerCount = await tx.one<{ count: string }>(
        `SELECT count(*)::text AS count FROM site_viewers
          WHERE site_id = $1 AND created_at > now() - interval '30 days'`,
        [site.id]
      );
      const limit = CREDITS_VIEWERS_PER_30D_LIMITS[plan] || 0;
      if (Number(newViewerCount?.count || 0) >= limit) {
        return { planLimit: true, plan };
      }
    }

    // Upsert site viewer (without credits yet).
    const creditAmount = Number(mapping.credits || 0);
    const svRows = (await tx.unsafe(
      `INSERT INTO site_viewers (site_id, viewer_id, balance, total_earned, total_spent)
       VALUES ($1, $2, 0, 0, 0)
       ON CONFLICT (site_id, viewer_id)
       DO UPDATE SET updated_at = now()
       RETURNING id, balance, blocked, fraud_score`,
      [site.id, viewerId]
    )) as { id: string; balance: number; blocked: boolean; fraud_score: number }[];
    const siteViewer = svRows[0];
    const siteViewerId = siteViewer.id;

    // Anti-fraud scoring.
    let fraudScore = Number(siteViewer.fraud_score || 0);
    let fraudReasons: string[] = [];
    let isBlocked = siteViewer.blocked || false;

    if (username) {
      // Detect username reuse by a different Kick account (alt swap).
      const altHistory = await tx.query<{ viewer_id: string; seen_at: string }>(
        `SELECT viewer_id, seen_at FROM viewer_username_history
          WHERE username = $1 AND viewer_id != $2
            AND seen_at > now() - interval '30 days'
          LIMIT 1`,
        [username, viewerId]
      );
      if (altHistory.length > 0) {
        fraudScore += 50;
        fraudReasons.push("username reused by another Kick account");
      }

      // Detect look-alike usernames on this site.
      const peers = await tx.query<{ kick_username: string }>(
        `SELECT v.kick_username
           FROM site_viewers sv
           JOIN viewers v ON v.id = sv.viewer_id
          WHERE sv.site_id = $1 AND v.id != $2 AND v.kick_username IS NOT NULL AND v.kick_username != ''`,
        [site.id, viewerId]
      );
      for (const peer of peers) {
        const peerName = String(peer.kick_username || "").trim().toLowerCase();
        if (peerName.length < 4 || username.length < 4) continue;
        if (peerName === username) continue;
        const dist = levenshtein(username, peerName);
        if (dist <= 2) {
          fraudScore += 30;
          fraudReasons.push("username similar to existing viewer");
          break;
        }
      }
    }

    // Auto-block when fraud score crosses threshold.
    if (fraudScore >= 100 && !isBlocked) {
      isBlocked = true;
      fraudReasons.push("auto-blocked by fraud score");
    }

    if (isBlocked || fraudReasons.length > 0) {
      await tx.unsafe(
        `UPDATE site_viewers
            SET fraud_score = GREATEST(fraud_score, $1),
                blocked = $2,
                block_reason = CASE
                  WHEN block_reason IS NULL THEN $3
                  WHEN block_reason LIKE $4 THEN block_reason
                  ELSE block_reason || '; ' || $3
                END,
                updated_at = now()
          WHERE id = $5`,
        [
          fraudScore,
          isBlocked,
          fraudReasons.join("; "),
          `%${fraudReasons.join("; ")}%`,
          siteViewerId,
        ]
      );
    }

    // Update event with the matched site.
    await tx.unsafe(
      "UPDATE kick_reward_events SET site_id = $1 WHERE event_id = $2",
      [site.id, messageId]
    );

    if (isBlocked) {
      return { blocked: true };
    }

    // Rate-limit earning per viewer on this site.
    if (env && (env.SESSIONS || env.RATE_LIMITER_DO)) {
      const limit = await rateLimit(env, `kick-earn:${site.id}:${redeemerKickUserId}`, 15, 60);
      if (!limit.ok) {
        await tx.unsafe(
          `UPDATE site_viewers
              SET fraud_score = fraud_score + 10,
                  updated_at = now()
            WHERE id = $1`,
          [siteViewerId]
        );
        return { rateLimited: true };
      }
    }

    // Grant credits and record ledger.
    const creditedRows = (await tx.unsafe(
      `UPDATE site_viewers
          SET balance = balance + $1,
              total_earned = total_earned + $1,
              last_earned_at = now(),
              updated_at = now()
        WHERE id = $2
        RETURNING id, balance`,
      [creditAmount, siteViewerId]
    )) as { id: string; balance: number }[];

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

    return {
      credited: creditAmount,
      balance: creditedRows[0].balance,
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
  credits: number,
  id?: string | null
): Promise<string> {
  const existing = id
    ? await one<{ id: string }>("SELECT id FROM credit_reward_mappings WHERE id=$1 AND site_id=$2", [id, siteId])
    : await one<{ id: string }>(
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