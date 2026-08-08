// Dashboard API for the Kick credits / shop system.
import { requireUser, bad, ok, readJson } from "../auth.js";
import { getByUser, getBoardById } from "../site.js";
import { query, one, exec, withTransaction } from "../../../../shared/db.js";
import { upsertCreditRewardMapping, setSiteKickChannel } from "../../../../shared/kick-credits.js";

function getSite(env, user, url) {
  const siteId = url.searchParams.get("siteId");
  return siteId ? getBoardById(env, user.id, siteId) : getByUser(env, user.id);
}

export async function handleCreditsStatus(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const [channel, mappings, items, viewers, redemptions] = await Promise.all([
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
              sv.created_at
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
  ]);

  return ok({
    channel: {
      externalId: channel?.kick_channel_external_id || null,
      name: channel?.kick_channel_name || null,
    },
    mappings: mappings || [],
    shopItems: items || [],
    viewers: viewers || [],
    redemptions: redemptions || [],
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
  const kickRewardId = String(body?.kickRewardId || "").trim();
  const kickRewardTitle = String(body?.kickRewardTitle || "").trim();
  const kickRewardCost = Number(body?.kickRewardCost || 0);
  const credits = Number(body?.credits || 0);

  if (!kickRewardId || !kickRewardTitle) return bad("Reward ID and title are required");
  if (!Number.isFinite(kickRewardCost) || kickRewardCost < 0) return bad("Reward cost must be a non-negative number");
  if (!Number.isFinite(credits) || credits <= 0) return bad("Credits must be a positive number");

  const id = await upsertCreditRewardMapping(site.id, kickRewardId, kickRewardTitle, kickRewardCost, credits);
  return ok({ id });
}

export async function handleCreditsDeleteReward(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = url.pathname.split("/").pop();
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

export async function handleCreditsDeleteShopItem(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = url.pathname.split("/").pop();
  if (!id) return bad("missing item id");

  await exec(
    "DELETE FROM shop_items WHERE id=$1 AND site_id=$2",
    [id, site.id]
  );
  return ok({ id });
}

export async function handleCreditsUpdateRedemption(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const site = await getSite(env, user, url);
  if (!site) return bad("no site", 404);

  const id = url.pathname.split("/").pop();
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
           VALUES ($1, 'refund', $2, 'Cancelled redemption refund', $3)`,
          [redemption.site_viewer_id, redemption.cost, JSON.stringify({ redemption_id: id })]
        );
      }
    });
  }

  return ok({ id: result[0].id, status });
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
        `SELECT sv.id, sv.balance, sv.total_earned, sv.total_spent, v.kick_username
           FROM site_viewers sv
           JOIN viewers v ON v.id = sv.viewer_id
          WHERE sv.site_id=$1 AND v.kick_user_id=$2`,
        [site.id, kickUserId]
      )
    : await one(
        `SELECT sv.id, sv.balance, sv.total_earned, sv.total_spent, v.kick_username
           FROM site_viewers sv
           JOIN viewers v ON v.id = sv.viewer_id
          WHERE sv.site_id=$1 AND lower(v.kick_username)=lower($2)`,
        [site.id, kickUsername]
      );

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

export async function handlePublicRedeem(request, _env) {
  const body = await readJson(request);
  const slug = String(body?.slug || "").trim();
  const kickUserId = String(body?.kickUserId || "").trim();
  const kickUsername = String(body?.kickUsername || "").trim();
  const shopItemId = String(body?.shopItemId || "").trim();

  if (!slug || (!kickUserId && !kickUsername) || !shopItemId) {
    return bad("slug, kickUserId or kickUsername, and shopItemId required");
  }

  const site = await one(
    "SELECT id FROM sites WHERE slug=$1 AND published=true",
    [slug.toLowerCase()]
  );
  if (!site) return bad("site not found", 404);

  const result = await withTransaction(async (tx) => {
    const viewer = kickUserId
      ? await tx.one(
          `SELECT sv.id, sv.balance, v.kick_username
             FROM site_viewers sv
             JOIN viewers v ON v.id = sv.viewer_id
            WHERE sv.site_id=$1 AND v.kick_user_id=$2`,
          [site.id, kickUserId]
        )
      : await tx.one(
          `SELECT sv.id, sv.balance, v.kick_username
             FROM site_viewers sv
             JOIN viewers v ON v.id = sv.viewer_id
            WHERE sv.site_id=$1 AND lower(v.kick_username)=lower($2)`,
          [site.id, kickUsername]
        );
    if (!viewer) throw new Error("viewer not found");

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