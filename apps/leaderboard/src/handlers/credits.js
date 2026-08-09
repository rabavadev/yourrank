// Dashboard API for the Kick credits / shop system.
import { requireUser, bad, ok, readJson } from "../auth.js";
import { getByUser, getBoardById } from "../site.js";
import { query, one, exec, withTransaction } from "../../../../shared/db.js";
import { rateLimit } from "../../../../shared/ratelimit.js";
import { upsertCreditRewardMapping, setSiteKickChannel } from "../../../../shared/kick-credits.js";
import {
  getValidKickAccessToken,
  createKickChannelReward,
} from "../../../../shared/kick-oauth.js";
import {
  effectivePlan,
  CREDITS_REWARD_LIMITS,
  CREDITS_SHOP_LIMITS,
  CREDITS_PENDING_REDEMPTIONS_LIMITS,
  CREDITS_REDEMPTIONS_PER_30D_LIMITS,
  CREDITS_VIEWERS_PER_30D_LIMITS,
} from "../../../../shared/plans.js";

function getSite(env, user, url) {
  const siteId = url.searchParams.get("siteId");
  return siteId ? getBoardById(env, user.id, siteId) : getByUser(env, user.id);
}

async function getSiteCreditsUsage(siteId) {
  const [rewardMappings, shopItems, pendingRedemptions, redemptions30d, newViewers30d] = await Promise.all([
    one("SELECT count(*)::int AS count FROM credit_reward_mappings WHERE site_id=$1 AND active=true", [siteId]),
    one("SELECT count(*)::int AS count FROM shop_items WHERE site_id=$1 AND active=true", [siteId]),
    one(
      `SELECT count(*)::int AS count FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id=$1 AND r.status='pending'`,
      [siteId]
    ),
    one(
      `SELECT count(*)::int AS count FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id=$1 AND r.status='fulfilled' AND r.created_at > now() - interval '30 days'`,
      [siteId]
    ),
    one(
      `SELECT count(*)::int AS count FROM site_viewers
        WHERE site_id=$1 AND created_at > now() - interval '30 days'`,
      [siteId]
    ),
  ]);
  return {
    rewardMappings: rewardMappings?.count || 0,
    shopItems: shopItems?.count || 0,
    pendingRedemptions: pendingRedemptions?.count || 0,
    redemptionsPer30Days: redemptions30d?.count || 0,
    newViewersPer30Days: newViewers30d?.count || 0,
  };
}

export async function handleCreditsStatus(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const [channel, mappings, items, viewers, redemptions, usage] = await Promise.all([
    one("SELECT kick_channel_external_id, kick_channel_name FROM sites WHERE id=$1", [site.id]),
    query(
      `SELECT id, kick_reward_id, kick_reward_title, kick_reward_cost, credits, active
         FROM credit_reward_mappings
        WHERE site_id=$1 ORDER BY created_at DESC`,
      [site.id]
    ),
    query(
      `SELECT id, name, description, cost, stock, active
         FROM shop_items
        WHERE site_id=$1 ORDER BY created_at DESC`,
      [site.id]
    ),
    query(
      `SELECT sv.id, v.kick_user_id, v.kick_username, sv.balance, sv.total_earned, sv.total_spent,
              sv.blocked, sv.fraud_score, sv.block_reason, sv.last_earned_at, sv.created_at
         FROM site_viewers sv
         JOIN viewers v ON v.id = sv.viewer_id
        WHERE sv.site_id=$1
        ORDER BY sv.balance DESC, v.kick_username ASC
        LIMIT 100`,
      [site.id]
    ),
    query(
      `SELECT r.id, r.cost, r.status, r.created_at, r.updated_at,
              v.kick_user_id, v.kick_username, i.name AS item_name
         FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
         JOIN viewers v ON v.id = sv.viewer_id
         JOIN shop_items i ON i.id = r.shop_item_id
        WHERE sv.site_id=$1
        ORDER BY r.created_at DESC
        LIMIT 100`,
      [site.id]
    ),
    getSiteCreditsUsage(site.id),
  ]);

  const plan = effectivePlan(user);

  return ok({
    channel: {
      externalId: channel?.kick_channel_external_id || null,
      name: channel?.kick_channel_name || null,
    },
    mappings: mappings || [],
    shopItems: items || [],
    viewers: viewers || [],
    redemptions: redemptions || [],
    usage: usage || {},
    limits: {
      rewardMappings: CREDITS_REWARD_LIMITS[plan],
      shopItems: CREDITS_SHOP_LIMITS[plan],
      pendingRedemptions: CREDITS_PENDING_REDEMPTIONS_LIMITS[plan],
      redemptionsPer30Days: CREDITS_REDEMPTIONS_PER_30D_LIMITS[plan],
      newViewersPer30Days: CREDITS_VIEWERS_PER_30D_LIMITS[plan],
    },
  });
}

export async function handleCreditsConnect(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const body = await readJson(request);
  const externalId = String(body?.externalId || "").trim();
  const name = String(body?.name || "").trim();
  if (!externalId) return bad("Kick channel ID is required");

  await setSiteKickChannel(site.id, externalId, name);
  return ok({ channel: { externalId, name } });
}

export async function handleCreditsSaveReward(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const body = await readJson(request);
  const id = body?.id ? String(body.id).trim() : null;
  const kickRewardId = String(body?.kickRewardId || "").trim();
  const kickRewardTitle = String(body?.kickRewardTitle || "").trim();
  const kickRewardCost = Number(body?.kickRewardCost || 0);
  const credits = Number(body?.credits || 0);

  if (!kickRewardId || !kickRewardTitle) return bad("Reward ID and title are required");
  if (!Number.isFinite(kickRewardCost) || kickRewardCost < 0) return bad("Reward cost must be a non-negative number");
  if (!Number.isFinite(credits) || credits <= 0) return bad("Credits must be a positive number");

  const plan = effectivePlan(user);
  const limit = CREDITS_REWARD_LIMITS[plan];
  const countRow = await one(
    `SELECT count(*)::int AS count FROM credit_reward_mappings
      WHERE site_id=$1 AND active=true ${id ? "AND id != $2" : ""}`,
    id ? [site.id, id] : [site.id]
  );
  if ((countRow?.count || 0) >= limit) {
    return bad(`Reward mapping limit reached for the ${plan} plan. Upgrade to add more.`, 403);
  }

  const resultId = await upsertCreditRewardMapping(site.id, kickRewardId, kickRewardTitle, kickRewardCost, credits, id);
  return ok({ id: resultId });
}

export async function handleCreditsCreateReward(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const body = await readJson(request);
  const title = String(body?.title || "").trim();
  const cost = Number(body?.cost || 0);
  const credits = Number(body?.credits || 0);
  const description = String(body?.description || "").trim();
  const backgroundColor = String(body?.backgroundColor || "#00e701").trim();

  if (!title) return bad("Reward title is required");
  if (!Number.isFinite(cost) || cost < 1) return bad("Reward cost must be a positive number");
  if (!Number.isFinite(credits) || credits <= 0) return bad("Credits must be a positive number");

  // Enforce plan limit.
  const plan = effectivePlan(user);
  const limit = CREDITS_REWARD_LIMITS[plan];
  const countRow = await one(
    "SELECT count(*)::int AS count FROM credit_reward_mappings WHERE site_id=$1 AND active=true",
    [site.id]
  );
  if ((countRow?.count || 0) >= limit) {
    return bad(`Reward mapping limit reached for the ${plan} plan. Upgrade to add more.`, 403);
  }

  // Load and refresh the streamer's Kick tokens.
  const tokenRow = await one(
    `SELECT kick_access_token_enc, kick_refresh_token_enc, kick_token_expires_at
       FROM users WHERE id=$1`,
    [user.id]
  );
  if (!tokenRow?.kick_access_token_enc) {
    return bad("Connect your Kick account first in the channel section", 403);
  }

  const tokenSet = await getValidKickAccessToken(
    env,
    tokenRow.kick_access_token_enc,
    tokenRow.kick_refresh_token_enc || null,
    tokenRow.kick_token_expires_at
  );

  const reward = await createKickChannelReward(tokenSet.accessToken, {
    title,
    cost,
    description: description || undefined,
    background_color: backgroundColor,
    is_enabled: true,
  });

  // Persist refreshed tokens if they changed.
  await exec(
    `UPDATE users
        SET kick_access_token_enc = $1,
            kick_refresh_token_enc = $2,
            kick_token_expires_at = $3,
            updated_at = now()
      WHERE id = $4`,
    [tokenSet.accessEnc, tokenSet.refreshEnc, tokenSet.expiresAt, user.id]
  );

  const mappingId = await upsertCreditRewardMapping(
    site.id,
    String(reward.id),
    reward.title,
    reward.cost,
    credits
  );

  return ok({
    id: mappingId,
    reward: {
      id: reward.id,
      title: reward.title,
      cost: reward.cost,
      description: reward.description,
      backgroundColor: reward.background_color,
    },
  });
}

export async function handleCreditsDeleteReward(request, env, ctx) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = ctx?.slug || url.pathname.split("/").pop();
  if (!id) return bad("missing reward id");

  await exec(
    "UPDATE credit_reward_mappings SET active=false, updated_at=now() WHERE id=$1 AND site_id=$2",
    [id, site.id]
  );
  return ok({ id });
}

export async function handleCreditsSaveShopItem(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const body = await readJson(request);
  const id = body?.id ? String(body.id).trim() : null;
  const name = String(body?.name || "").trim();
  const description = String(body?.description || "").trim();
  const cost = Number(body?.cost || 0);
  const stock = body?.stock === null || body?.stock === undefined ? null : Number(body.stock);
  const active = body?.active !== false;

  if (!name) return bad("Item name is required");
  if (!Number.isFinite(cost) || cost <= 0) return bad("Cost must be a positive number");
  if (stock !== null && (!Number.isFinite(stock) || stock < 0)) return bad("Stock must be a non-negative number or null");

  const plan = effectivePlan(user);
  const limit = CREDITS_SHOP_LIMITS[plan];
  const countRow = await one(
    `SELECT count(*)::int AS count FROM shop_items
      WHERE site_id=$1 AND active=true ${id ? "AND id != $2" : ""}`,
    id ? [site.id, id] : [site.id]
  );
  if (active && (countRow?.count || 0) >= limit) {
    return bad(`Shop item limit reached for the ${plan} plan. Upgrade to add more.`, 403);
  }

  let resultId;
  if (id) {
    const rows = await exec(
      `UPDATE shop_items
        SET name=$1, description=$2, cost=$3, stock=$4, active=$5, updated_at=now()
      WHERE id=$6 AND site_id=$7
      RETURNING id`,
      [name, description, cost, stock, active, id, site.id]
    );
    if (!rows || rows.length === 0) return bad("shop item not found", 404);
    resultId = rows[0].id;
  } else {
    const rows = await exec(
      `INSERT INTO shop_items (site_id, name, description, cost, stock, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [site.id, name, description, cost, stock, active]
    );
    resultId = rows[0].id;
  }

  return ok({ id: resultId });
}

export async function handleCreditsDeleteShopItem(request, env, ctx) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = ctx?.slug || url.pathname.split("/").pop();
  if (!id) return bad("missing item id");

  await exec(
    "DELETE FROM shop_items WHERE id=$1 AND site_id=$2",
    [id, site.id]
  );
  return ok({ id });
}

export async function handleCreditsUpdateRedemption(request, env, ctx) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = ctx?.slug || url.pathname.split("/").pop();
  const body = await readJson(request);
  const status = String(body?.status || "").trim();
  if (!["fulfilled", "cancelled"].includes(status)) return bad("status must be fulfilled or cancelled");

  const result = await exec(
    `UPDATE redemptions r
        SET status=$1, updated_at=now()
      FROM site_viewers sv
      WHERE r.id=$2 AND r.site_viewer_id = sv.id AND sv.site_id=$3
      RETURNING r.id`,
    [status, id, site.id]
  );
  if (!result || result.length === 0) return bad("redemption not found", 404);

  if (status === "cancelled") {
    await withTransaction(async (tx) => {
      const redemption = await tx.one(
        "SELECT site_viewer_id, cost FROM redemptions WHERE id=$1",
        [id]
      );
      if (redemption) {
        await tx.unsafe(
          `UPDATE site_viewers
            SET balance = balance + $1,
                total_spent = GREATEST(total_spent - $1, 0),
                updated_at = now()
          WHERE id=$2`,
          [redemption.cost, redemption.site_viewer_id]
        );
        await tx.unsafe(
          `INSERT INTO credit_ledger (site_viewer_id, type, amount, description, metadata)
           VALUES ($1, 'revoke', $2, 'Cancelled redemption refund', $3)`,
          [redemption.site_viewer_id, redemption.cost, JSON.stringify({ redemption_id: id })]
        );
      }
    });
  }

  return ok({ id: result[0].id, status });
}

// Cross-board viewer history for a streamer: all of their sites where a given
// Kick viewer has a site_viewer record, with balances and redemption counts.
export async function handleCreditsViewerHistory(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const kickUsername = String(url.searchParams.get("kickUsername") || "").trim();
  const kickUserId = String(url.searchParams.get("kickUserId") || "").trim();
  if (!kickUsername && !kickUserId) return bad("kickUsername or kickUserId is required");

  const rows = await query(
    `SELECT
       s.id AS site_id,
       s.slug,
       s.name,
       sv.id AS site_viewer_id,
       sv.balance,
       sv.total_earned,
       sv.total_spent,
       sv.blocked,
       sv.fraud_score,
       sv.created_at,
       v.kick_user_id,
       v.kick_username,
       COUNT(r.id) FILTER (WHERE r.status != 'cancelled')::int AS redemptions_total,
       COUNT(r.id) FILTER (WHERE r.status = 'pending')::int AS redemptions_pending
     FROM sites s
     JOIN site_viewers sv ON sv.site_id = s.id
     JOIN viewers v ON v.id = sv.viewer_id
     LEFT JOIN redemptions r ON r.site_viewer_id = sv.id
     WHERE s.user_id = $1
       AND ($2 = '' OR v.kick_username ILIKE $2)
       AND ($3 = '' OR v.kick_user_id = $3)
     GROUP BY s.id, s.slug, s.name, sv.id, v.kick_user_id, v.kick_username
     ORDER BY sv.total_earned DESC, s.name ASC
     LIMIT 50`,
    [user.id, kickUsername, kickUserId]
  );

  const boards = (rows || []).map((r) => ({
    siteId: r.site_id,
    slug: r.slug,
    name: r.name,
    siteViewerId: r.site_viewer_id,
    balance: r.balance,
    totalEarned: r.total_earned,
    totalSpent: r.total_spent,
    blocked: r.blocked,
    fraudScore: r.fraud_score,
    createdAt: r.created_at,
    kickUserId: r.kick_user_id,
    kickUsername: r.kick_username,
    redemptionsTotal: r.redemptions_total,
    redemptionsPending: r.redemptions_pending,
  }));

  return ok({ kickUsername: kickUsername || null, kickUserId: kickUserId || null, boards });
}

// Public viewer endpoints (no auth; keyed by slug + kick user id).
export async function handlePublicCredits(request, _env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const kickUserId = String(url.searchParams.get("kickUserId") || "").trim();
  const kickUsername = String(url.searchParams.get("kickUsername") || "").trim();
  if (!slug || (!kickUserId && !kickUsername)) return bad("slug and kickUserId or kickUsername required");

  const site = await one(
    "SELECT id, slug FROM sites WHERE slug=$1 AND published=true",
    [slug.toLowerCase()]
  );
  if (!site) return bad("site not found", 404);

  const viewer = kickUserId
    ? await one(
        `SELECT sv.id, sv.balance, sv.total_earned, sv.total_spent, sv.blocked, sv.block_reason, v.kick_username
           FROM site_viewers sv
           JOIN viewers v ON v.id = sv.viewer_id
          WHERE sv.site_id=$1 AND v.kick_user_id=$2`,
        [site.id, kickUserId]
      )
    : await one(
        `SELECT sv.id, sv.balance, sv.total_earned, sv.total_spent, sv.blocked, sv.block_reason, v.kick_username
           FROM site_viewers sv
           JOIN viewers v ON v.id = sv.viewer_id
          WHERE sv.site_id=$1 AND lower(v.kick_username)=lower($2)`,
        [site.id, kickUsername]
      );

  if (viewer?.blocked) {
    return bad("viewer blocked");
  }

  const shopItems = await query(
    `SELECT id, name, description, cost, stock, active
       FROM shop_items
      WHERE site_id=$1 AND active=true
      ORDER BY cost ASC`,
    [site.id]
  );

  return ok({
    viewer: viewer || null,
    shopItems: shopItems || [],
  });
}

export async function handlePublicRedeem(request, env) {
  const body = await readJson(request);
  const slug = String(body?.slug || "").trim();
  const kickUserId = String(body?.kickUserId || "").trim();
  const kickUsername = String(body?.kickUsername || "").trim();
  const shopItemId = String(body?.shopItemId || "").trim();

  if (!slug || (!kickUserId && !kickUsername) || !shopItemId) {
    return bad("slug, kickUserId or kickUsername, and shopItemId required");
  }

  const site = await one(
    `SELECT s.id, u.plan, (EXTRACT(EPOCH FROM u.plan_expires_at) * 1000)::double precision AS plan_expires_at
       FROM sites s
       JOIN users u ON u.id = s.user_id
      WHERE s.slug=$1 AND s.published=true`,
    [slug.toLowerCase()]
  );
  if (!site) return bad("site not found", 404);

  const plan = effectivePlan(site);

  // Rate-limit redemptions per viewer per minute.
  const rl = await rateLimit(env, `redeem:${site.id}:${kickUserId || kickUsername}`, 5, 60);
  if (!rl.ok) {
    return bad("rate limited", 429);
  }

  // Enforce site plan limits before creating the redemption.
  const [pendingRow, fulfilled30dRow] = await Promise.all([
    one(
      `SELECT count(*)::int AS count FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id=$1 AND r.status='pending'`,
      [site.id]
    ),
    one(
      `SELECT count(*)::int AS count FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id=$1 AND r.status='fulfilled' AND r.created_at > now() - interval '30 days'`,
      [site.id]
    ),
  ]);
  if ((pendingRow?.count || 0) >= CREDITS_PENDING_REDEMPTIONS_LIMITS[plan]) {
    return bad("This streamer's shop is at capacity. Ask them to upgrade.", 403);
  }
  if ((fulfilled30dRow?.count || 0) >= CREDITS_REDEMPTIONS_PER_30D_LIMITS[plan]) {
    return bad("This streamer's monthly redemption limit is reached. Ask them to upgrade.", 403);
  }

  const result = await withTransaction(async (tx) => {
    const viewer = kickUserId
      ? await tx.one(
          `SELECT sv.id, sv.balance, sv.blocked, v.kick_username
             FROM site_viewers sv
             JOIN viewers v ON v.id = sv.viewer_id
            WHERE sv.site_id=$1 AND v.kick_user_id=$2`,
          [site.id, kickUserId]
        )
      : await tx.one(
          `SELECT sv.id, sv.balance, sv.blocked, v.kick_username
             FROM site_viewers sv
             JOIN viewers v ON v.id = sv.viewer_id
            WHERE sv.site_id=$1 AND lower(v.kick_username)=lower($2)`,
          [site.id, kickUsername]
        );
    if (!viewer) throw new Error("viewer not found");
    if (viewer.blocked) throw new Error("viewer blocked");

    const item = await tx.one(
      "SELECT id, cost, stock FROM shop_items WHERE id=$1 AND site_id=$2 AND active=true FOR UPDATE",
      [shopItemId, site.id]
    );
    if (!item) throw new Error("item not found");
    if (item.stock !== null && item.stock <= 0) throw new Error("out of stock");
    if (viewer.balance < item.cost) throw new Error("insufficient balance");

    await tx.unsafe(
      `UPDATE site_viewers
        SET balance = balance - $1,
            total_spent = total_spent + $1,
            last_redeemed_at = now(),
            updated_at = now()
      WHERE id=$2`,
      [item.cost, viewer.id]
    );

    if (item.stock !== null) {
      await tx.unsafe(
        "UPDATE shop_items SET stock = stock - 1, updated_at = now() WHERE id=$1",
        [item.id]
      );
    }

    const redemptionRows = await tx.unsafe(
      `INSERT INTO redemptions (site_viewer_id, shop_item_id, cost, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id`,
      [viewer.id, item.id, item.cost]
    );

    await tx.unsafe(
      `INSERT INTO credit_ledger (site_viewer_id, type, amount, description, metadata)
       VALUES ($1, 'spend', $2, $3, $4)`,
      [viewer.id, item.cost, `Redeemed: ${item.id}`, JSON.stringify({ shop_item_id: item.id, redemption_id: redemptionRows[0].id })]
    );

    return { redemptionId: redemptionRows[0].id, balance: viewer.balance - item.cost };
  });

  return ok(result);
}

export async function handleCreditsAnalytics(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const rawDays = Number(url.searchParams.get("days") || 30);
  const days = Math.min(Math.max(Number.isFinite(rawDays) ? rawDays : 30, 1), 90);
  const startDate = new Date(Date.now() - days * 86400000).toISOString();

  const [
    allTimeEarned,
    periodEarned,
    allTimeSpent,
    periodSpent,
    redemptionSummary,
    viewerBalance,
    topEarners,
    topItems,
    redemptionsByStatus,
    creditsByDay,
  ] = await Promise.all([
    one(
      `SELECT COALESCE(SUM(cl.amount), 0)::int AS total
         FROM credit_ledger cl
         JOIN site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = $1 AND cl.type = 'earn'`,
      [site.id]
    ),
    one(
      `SELECT COALESCE(SUM(cl.amount), 0)::int AS total
         FROM credit_ledger cl
         JOIN site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = $1 AND cl.type = 'earn' AND cl.created_at > $2::timestamptz`,
      [site.id, startDate]
    ),
    one(
      `SELECT COALESCE(SUM(cl.amount), 0)::int AS total
         FROM credit_ledger cl
         JOIN site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = $1 AND cl.type = 'spend'`,
      [site.id]
    ),
    one(
      `SELECT COALESCE(SUM(cl.amount), 0)::int AS total
         FROM credit_ledger cl
         JOIN site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = $1 AND cl.type = 'spend' AND cl.created_at > $2::timestamptz`,
      [site.id, startDate]
    ),
    one(
      `SELECT
         COUNT(*) FILTER (WHERE r.status != 'cancelled')::int AS total,
         COUNT(*) FILTER (WHERE r.status = 'fulfilled')::int AS fulfilled,
         COUNT(*) FILTER (WHERE r.status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE r.status = 'cancelled')::int AS cancelled,
         COALESCE(SUM(r.cost) FILTER (WHERE r.status != 'cancelled'), 0)::int AS credits_spent
         FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id = $1 AND r.created_at > $2::timestamptz`,
      [site.id, startDate]
    ),
    one(
      "SELECT COALESCE(SUM(balance), 0)::int AS total FROM site_viewers WHERE site_id = $1",
      [site.id]
    ),
    query(
      `SELECT v.kick_username, sv.balance, sv.total_earned, sv.total_spent
         FROM site_viewers sv
         JOIN viewers v ON v.id = sv.viewer_id
        WHERE sv.site_id = $1
        ORDER BY sv.total_earned DESC, v.kick_username ASC
        LIMIT 10`,
      [site.id]
    ),
    query(
      `SELECT i.id, i.name, COUNT(r.id) FILTER (WHERE r.status != 'cancelled')::int AS redemptions,
              COALESCE(SUM(r.cost) FILTER (WHERE r.status != 'cancelled'), 0)::int AS credits_spent
         FROM shop_items i
         LEFT JOIN redemptions r ON r.shop_item_id = i.id
        WHERE i.site_id = $1
        GROUP BY i.id, i.name
        ORDER BY redemptions DESC, i.name ASC
        LIMIT 10`,
      [site.id]
    ),
    query(
      `SELECT r.status, COUNT(*)::int AS count
         FROM redemptions r
         JOIN site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id = $1
        GROUP BY r.status`,
      [site.id]
    ),
    query(
      `SELECT DATE(cl.created_at) AS day, cl.type, COALESCE(SUM(cl.amount), 0)::int AS total
         FROM credit_ledger cl
         JOIN site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = $1 AND cl.created_at > $2::timestamptz AND cl.type IN ('earn', 'spend')
        GROUP BY DATE(cl.created_at), cl.type
        ORDER BY day ASC`,
      [site.id, startDate]
    ),
  ]);

  return ok({
    days,
    summary: {
      allTimeEarned: allTimeEarned?.total || 0,
      periodEarned: periodEarned?.total || 0,
      allTimeSpent: allTimeSpent?.total || 0,
      periodSpent: periodSpent?.total || 0,
      redemptionsTotal: redemptionSummary?.total || 0,
      redemptionsFulfilled: redemptionSummary?.fulfilled || 0,
      redemptionsPending: redemptionSummary?.pending || 0,
      redemptionsCancelled: redemptionSummary?.cancelled || 0,
      redemptionCreditsSpent: redemptionSummary?.credits_spent || 0,
      viewerBalance: viewerBalance?.total || 0,
    },
    topEarners: topEarners || [],
    topItems: topItems || [],
    redemptionsByStatus: redemptionsByStatus || [],
    creditsByDay: creditsByDay || [],
  });
}