// Per-site viewer data helpers for the public site shell.
import { one, query } from "../../../shared/db.js";

export async function getShopItems(siteId) {
  return query(
    "SELECT id, name, description, cost, stock, active FROM shop_items WHERE site_id=$1 AND active=true ORDER BY name ASC",
    [siteId]
  ) || [];
}

/** Resolve the viewer's per-site row plus shop, redemptions and ledger.
 *  Passing viewerId=null returns just the public shop list.
 */
export async function getViewerSiteData(siteId, viewerId, { shop = false, redemptions = false, ledger = false } = {}) {
  if (!viewerId) {
    if (shop) return { viewerOnSite: null, shopItems: await getShopItems(siteId), redemptions: [], ledger: [] };
    return { viewerOnSite: null, shopItems: [], redemptions: [], ledger: [] };
  }

  const [viewerOnSite, shopItems] = await Promise.all([
    one(
      "SELECT id, balance, blocked, block_reason, total_earned, total_spent FROM site_viewers WHERE site_id=$1 AND viewer_id=$2",
      [siteId, viewerId]
    ),
    shop ? getShopItems(siteId) : Promise.resolve([]),
  ]);

  if (!viewerOnSite) {
    return { viewerOnSite: null, shopItems: shop ? shopItems : [], redemptions: [], ledger: [] };
  }

  const [redemptionRows, ledgerRows] = await Promise.all([
    redemptions
      ? query(
          `SELECT r.id, r.cost, r.status, r.created_at, r.updated_at, i.name AS item_name
             FROM redemptions r
             JOIN shop_items i ON i.id = r.shop_item_id
            WHERE r.site_viewer_id=$1
            ORDER BY r.created_at DESC LIMIT 50`,
          [viewerOnSite.id]
        )
      : Promise.resolve([]),
    ledger
      ? query(
          `SELECT id, type, amount, description, created_at FROM credit_ledger WHERE site_viewer_id=$1 ORDER BY created_at DESC LIMIT 100`,
          [viewerOnSite.id]
        )
      : Promise.resolve([]),
  ]);

  return {
    viewerOnSite,
    shopItems: shop ? shopItems : [],
    redemptions: redemptionRows || [],
    ledger: ledgerRows || [],
  };
}
