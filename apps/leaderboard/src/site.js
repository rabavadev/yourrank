// Site + players data helpers for the Worker.
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS } from "./billing.js";
import { query, one, exec, getSql } from "./db.js";
import { notifyTop3Change, notifyReset, detectTop3Changes } from "./notifications.js";

export const DEFAULT_EXTRA = {
  chips: ["Instant Withdrawals", "Crypto Native", "24/7 Support"],
  whyStats: [
    { big: "Deposit", label: "Bonus", sub: "Match on your first deposit" },
    { big: "Instant", label: "Rakeback", sub: "Automatic on every bet" },
    { big: "3,500+", label: "Slots", sub: "Full game library" },
    { big: "Instant", label: "Withdraw", sub: "Crypto-native payouts" },
  ],
  rules: [
    "Games with RTP of 98% or lower count 100% of wagered amount",
    "Games with RTP above 98% count 50% of wagered amount",
    "Accounts that were suspended or self-excluded are not eligible",
  ],
  socials: [
    { name: "Discord", handle: "Join the community", action: "Join", url: "#", brand: "discord" },
    { name: "Kick", handle: "Watch live", action: "Follow", url: "#", brand: "kick" },
    { name: "Twitch", handle: "Watch live", action: "Follow", url: "#", brand: "twitch" },
    { name: "X", handle: "Latest updates", action: "Follow", url: "#", brand: "x" },
  ],
};

// All site columns except logo_data (base64 image, up to 180KB) — that's only
// needed by the /logo/:slug endpoint and saveSite(), which fetch it separately.
// PERF-004 / PERF-107: avoid SELECT * to prevent 180KB+ transfers on every page.
const SITE_COLUMNS = "id, user_id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain";

// In-memory TTL cache for site configs (per-Worker isolate).
const siteCache = new Map();
const CACHE_TTL = 60_000; // 1 minute

function getCached(key, fetcher) {
  const entry = siteCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  const data = fetcher();
  siteCache.set(key, { data, expires: Date.now() + CACHE_TTL });
  return data;
}

export function invalidateSiteCache(slugOrId) {
  siteCache.delete(slugOrId);
}

export function invalidateUserCache(uid) {
  // Invalidate all cached entries that might be for this user
  // Since we cache by uid for getByUser and by slug for getBySlug,
  // we need to clear the uid key and any slug keys for this user
  siteCache.delete(uid);
  siteCache.delete(`user_boards:${uid}`);
}

const getBySlug = (env, slug) => getCached(slug, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE slug=$1`, [slug]));

// Multi-board: returns the FIRST board for a user (legacy single-board compat).
// For new code, use getAllBoards().
const getByUser = (env, uid) => getCached(uid, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY board_order ASC, created_at ASC LIMIT 1`, [uid]));

// Multi-board: returns ALL boards for a user.
export async function getAllBoards(env, uid) {
  const rows = await query(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY board_order ASC, created_at ASC`, [uid]);
  return rows || [];
}

// Multi-board: returns a specific board by site ID (only if owned by user).
export async function getBoardById(env, uid, siteId) {
  return one(`SELECT ${SITE_COLUMNS} FROM sites WHERE id=$1 AND user_id=$2`, [siteId, uid]);
}

async function getPlayers(env, siteId) {
  const rows = await query("SELECT name, wagered, prize FROM players WHERE site_id=$1 ORDER BY wagered DESC", [siteId]);
  return rows || [];
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const LOGO_RE = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_LOGO = 250000; // chars of data URI (~180KB image)

// theme_json is JSONB — pg returns it as a JS object already (or null). No parse.
function parseTheme(site) {
  const t = (site.theme_json && typeof site.theme_json === "object") ? site.theme_json : {};
  return {
    accentA: HEX.test(t.accentA || "") ? t.accentA : null,
    accentB: HEX.test(t.accentB || "") ? t.accentB : null,
  };
}

function archiveShape(a) {
  let top = Array.isArray(a.snapshot_json) ? a.snapshot_json : [];
  top = top.slice().sort((x, y) => (y.wagered || 0) - (x.wagered || 0)).slice(0, 3)
    .map((p) => ({ name: String(p.name || ""), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 }));
  return { label: a.label, at: a.created_at, top };
}

async function getArchives(env, siteId, limit = 6) {
  const rows = await query(
    `SELECT id, label, snapshot_json,
            (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at
       FROM archives WHERE site_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [siteId, limit]
  );
  return rows || [];
}

export function publicShape(site, players, archives = [], hasLogo = false) {
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const m = { ...DEFAULT_EXTRA, ...extra };
  const theme = parseTheme(site);
  return {
    brand: {
      name: site.name, tagline: site.tagline, code: site.code,
      prizePool: site.prize_pool, period: site.period, casino: site.casino,
      ctaUrl: site.cta_url, resetNote: site.reset_note,
    },
    endsAt: site.ends_at,
    partner: { blurb: site.blurb, chips: m.chips },
    whyStats: m.whyStats, rules: m.rules, socials: m.socials,
    branding: { hasLogo, accentA: theme.accentA, accentB: theme.accentB },
    pastWinners: archives.map(archiveShape),
    players: players.map((p) => ({ name: p.name, wagered: p.wagered, prize: p.prize })),
  };
}

export async function getPublicSite(env, slug) {
  const site = await getBySlug(env, slug);
  if (!site || !site.published) return null;
  const [owner, players, archives, logoRow] = await Promise.all([
    one(
      "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1",
      [site.user_id]
    ),
    getPlayers(env, site.id),
    getArchives(env, site.id),
    one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
  ]);
  if (owner && owner.status === "suspended") return { suspended: true };
  return { id: site.id, data: publicShape(site, players, archives, !!logoRow?.has_logo), plan: effectivePlan(owner) };
}

export async function getUserSite(env, uid) {
  const site = await getByUser(env, uid);
  if (!site) return null;
  const [archives, logoRow] = await Promise.all([
    getArchives(env, site.id, 24),
    one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
  ]);
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  return {
      slug: site.slug, published: !!site.published, customDomain: site.custom_domain || "",
      data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, 6), !!logoRow?.has_logo),
    notify: {
      discord_webhook_url: extra.discord_webhook_url || "",
      telegram_notify: !!extra.telegram_notify,
      telegram_chat_id: extra.telegram_chat_id || "",
    },
    archives: archives.map((a) => {
      const n = Array.isArray(a.snapshot_json) ? a.snapshot_json.length : 0;
      return { id: a.id, label: a.label, at: a.created_at, players: n };
    }),
  };
}

// Multi-board: return a summary list of all boards for a user.
export async function getUserBoardsList(env, uid) {
  const boards = await getAllBoards(env, uid);
  return boards.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    published: !!b.published,
    boardOrder: b.board_order || 0,
  }));
}

// Multi-board: get full site data for a specific board by siteId.
export async function getUserSiteById(env, uid, siteId) {
  const site = await getBoardById(env, uid, siteId);
  if (!site) return null;
  const [archives, logoRow] = await Promise.all([
    getArchives(env, site.id, 24),
    one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
  ]);
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  return {
      id: site.id, slug: site.slug, published: !!site.published, customDomain: site.custom_domain || "",
      data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, 6), !!logoRow?.has_logo),
    notify: {
      discord_webhook_url: extra.discord_webhook_url || "",
      telegram_notify: !!extra.telegram_notify,
      telegram_chat_id: extra.telegram_chat_id || "",
    },
    archives: archives.map((a) => {
      const n = Array.isArray(a.snapshot_json) ? a.snapshot_json.length : 0;
      return { id: a.id, label: a.label, at: a.created_at, players: n };
    }),
  };
}

// Close out the current period: snapshot the board, then optionally reset it.
export async function createArchive(env, uid, { label, clear, siteId } = {}) {
  // If siteId given, use that board; otherwise fall back to first board
  const site = siteId ? await getBoardById(env, uid, siteId) : await getByUser(env, uid);
  if (!site) return { error: "no site" };
  const players = await getPlayers(env, site.id);
  if (!players.length) return { error: "Nothing to archive — the board is empty." };
  const count = await one("SELECT COUNT(*) n FROM archives WHERE site_id=$1", [site.id]);
  if ((Number(count?.n) || 0) >= 24) return { error: "Archive limit reached (24). Delete an old one first." };
  const lab = String(label || "").trim().slice(0, 60) ||
    new Date().toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  await getSql().begin(async (tx) => {
    await tx.unsafe(
      "INSERT INTO archives (id,site_id,label,snapshot_json,created_at) VALUES ($1,$2,$3,$4::jsonb,now())",
      [crypto.randomUUID(), site.id, lab, JSON.stringify(players).slice(0, 200000)]
    );
    if (clear === "players") await tx.unsafe("DELETE FROM players WHERE site_id=$1", [site.id]);
    else if (clear === "wagers") await tx.unsafe("UPDATE players SET wagered=0 WHERE site_id=$1", [site.id]);
  });
  // Fire Discord webhook for leaderboard reset (Pro only).
  try {
    const owner = await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]);
    if (effectivePlan(owner) === "pro") {
      await notifyReset(env, site.id, site.name, players, lab);
    }
  } catch (e) {
    console.error("[notify] reset webhook failed:", String(e?.message || e));
  }
  return { ok: true, label: lab };
}

export async function deleteArchive(env, uid, id) {
  const site = await getByUser(env, uid);
  if (!site) return { error: "no site" };
  await exec("DELETE FROM archives WHERE id=$1 AND site_id=$2", [String(id || ""), site.id]);
  return { ok: true };
}

// Multi-board: create a new board for a user.
export async function createBoard(env, uid, { slug, name } = {}) {
  const plan = effectivePlan(await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]));
  const limit = BOARD_LIMITS[plan] || 1;
  const boards = await getAllBoards(env, uid);
  if (boards.length >= limit) {
    return { error: `Your ${plan} plan allows up to ${limit} leaderboard${limit > 1 ? "s" : ""}. Upgrade to create more.`, code: "board_limit" };
  }
  // Validate slug uniqueness
  const existing = await one("SELECT id FROM sites WHERE slug=$1", [slug]);
  if (existing) return { error: "That URL is already taken. Pick another.", code: "slug_taken" };
  const boardOrder = boards.length;
  const siteId = crypto.randomUUID();
  await exec(
    "INSERT INTO sites (id,user_id,slug,name,casino,prize_pool,period,published,extra_json,board_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)",
    [siteId, uid, slug, name || slug, "Stake", "$0", "Monthly", true, JSON.stringify(DEFAULT_EXTRA), boardOrder]
  );
  invalidateUserCache(uid);
  return { ok: true, id: siteId, slug };
}

export async function saveSite(env, user, payload, siteId) {
  const uid = typeof user === "string" ? user : user.id;
  // Multi-board: if siteId provided, use that board; otherwise first board
  const site = siteId ? await getBoardById(env, uid, siteId) : await getByUser(env, uid);
  if (!site) return { error: "no site" };
  // Plan gate: player count is the paid lever.
  if (typeof user === "object" && Array.isArray(payload.players)) {
    const plan = effectivePlan(user);
    const count = payload.players.filter((p) => p && p.name).length;
    if (count > PLAN_LIMITS[plan]) {
      return {
        error: plan === "pro" || plan === "agency"
          ? `Your plan allows up to ${PLAN_LIMITS[plan]} players.`
          : `Your plan allows up to ${PLAN_LIMITS[plan]} players. Upgrade for more.`,
        code: "player_limit",
      };
    }
  }
  const b = payload.brand || {};
  const existingExtra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const extra = JSON.stringify({
    chips: payload.chips || DEFAULT_EXTRA.chips,
    whyStats: payload.whyStats || DEFAULT_EXTRA.whyStats,
    rules: payload.rules || DEFAULT_EXTRA.rules,
    socials: payload.socials || DEFAULT_EXTRA.socials,
    // Notification settings (Pro only) — passed through from payload
    discord_webhook_url: payload.discord_webhook_url ?? existingExtra.discord_webhook_url ?? "",
    telegram_notify: payload.telegram_notify ?? existingExtra.telegram_notify ?? false,
    telegram_chat_id: payload.telegram_chat_id ?? existingExtra.telegram_chat_id ?? "",
  });

  // Fetch logo_data separately since the shared query no longer includes it (PERF-004).
  const existingLogoRow = await one("SELECT logo_data FROM sites WHERE id=$1", [site.id]);
  let logoData = existingLogoRow?.logo_data ?? "";
  let themeObj = (site.theme_json && typeof site.theme_json === "object") ? site.theme_json : {};
  const br = payload.branding;
  if (br && typeof user === "object" && effectivePlan(user) !== "free") {
    if (br.logo === null) logoData = "";
    else if (typeof br.logo === "string" && br.logo) {
      if (!LOGO_RE.test(br.logo)) return { error: "Logo must be a PNG, JPG or WebP image." };
      if (br.logo.length > MAX_LOGO) return { error: "Logo is too large. Keep it under ~180KB." };
      logoData = br.logo;
    }
    const t = {};
    if (HEX.test(br.accentA || "")) t.accentA = br.accentA;
    if (HEX.test(br.accentB || "")) t.accentB = br.accentB;
    themeObj = t;
  }
  const themeJson = JSON.stringify(themeObj);

  // Custom domain (Pro only) — validate and sanitize
  let customDomain = null;
  if (typeof payload.customDomain === "string" && payload.customDomain.trim()) {
    const plan = typeof user === "object" ? effectivePlan(user) : "free";
    if (plan !== "pro" && plan !== "agency") return { error: "Custom domains are a Pro feature.", code: "pro_only" };
    const dom = payload.customDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(dom)) {
      return { error: "Enter a valid domain name (e.g. board.mystream.com).", code: "invalid_domain" };
    }
    // Check if another site already owns this domain
    const existing = await one("SELECT id, slug FROM sites WHERE custom_domain=$1 AND id!=$2", [dom, site.id]);
    if (existing) return { error: "That domain is already in use by another site.", code: "domain_taken" };
    customDomain = dom;
  } else if (payload.customDomain === "" || payload.customDomain === null) {
    // Explicit clear
    customDomain = "";
  }

  // Invalidate cache before write
  invalidateSiteCache(site.slug);
  invalidateSiteCache(uid);
  if (siteId) invalidateSiteCache(siteId);

  // Snapshot old top-3 before the transaction overwrites players (for rank-change detection).
  let oldTop3 = [];
  if (Array.isArray(payload.players) && typeof user === "object" && effectivePlan(user) === "pro") {
    try {
      const oldPlayers = await getPlayers(env, site.id);
      oldTop3 = oldPlayers.slice(0, 3).map((p) => ({ name: p.name, wagered: p.wagered }));
    } catch {}
  }

  await getSql().begin(async (tx) => {
    if (customDomain !== null) {
      await tx.unsafe(
        `UPDATE sites SET name=$1, tagline=$2, casino=$3, code=$4, cta_url=$5, prize_pool=$6, period=$7, ends_at=$8, reset_note=$9, blurb=$10, extra_json=$11::jsonb, logo_data=$12, theme_json=$13::jsonb, custom_domain=$14, updated_at=now() WHERE id=$15`,
        [
          b.name ?? site.name, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
          b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, b.period ?? site.period,
          payload.endsAt ?? site.ends_at, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
          extra, logoData, themeJson, customDomain || null, site.id,
        ]
      );
    } else {
      await tx.unsafe(
        `UPDATE sites SET name=$1, tagline=$2, casino=$3, code=$4, cta_url=$5, prize_pool=$6, period=$7, ends_at=$8, reset_note=$9, blurb=$10, extra_json=$11::jsonb, logo_data=$12, theme_json=$13::jsonb, updated_at=now() WHERE id=$14`,
        [
          b.name ?? site.name, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
          b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, b.period ?? site.period,
          payload.endsAt ?? site.ends_at, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
          extra, logoData, themeJson, site.id,
        ]
      );
    }
    if (Array.isArray(payload.players)) {
      await tx.unsafe("DELETE FROM players WHERE site_id=$1", [site.id]);
      const validPlayers = payload.players.filter((p) => p && p.name);
      if (validPlayers.length > 0) {
        const cols = 6;
        const params = [];
        const valueRows = [];
        let idx = 1;
        validPlayers.forEach((p, i) => {
          const row = [];
          for (let c = 0; c < cols; c++) row.push(`$${idx++}`);
          valueRows.push(`(${row.join(",")})`);
          params.push(
            crypto.randomUUID(), site.id, String(p.name),
            Number(p.wagered) || 0, Number(p.prize) || 0, i
          );
        });
        await tx.unsafe(
          `INSERT INTO players (id,site_id,name,wagered,prize,sort) VALUES ${valueRows.join(",")}`,
          params
        );
      }
    }
  });

  // Pro-only: detect top-3 changes and fire notifications.
  if (Array.isArray(payload.players) && typeof user === "object" && effectivePlan(user) === "pro") {
    try {
      const newSorted = payload.players.filter((p) => p && p.name).sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0));
      const top3Changes = detectTop3Changes(oldTop3, newSorted);
      if (top3Changes.length) {
        await notifyTop3Change(env, site.id, b.name || site.name, top3Changes);
      }
    } catch (e) {
      console.error("[notify] top-3 detection failed:", String(e?.message || e));
    }
  }
  return { ok: true };
}

export { getByUser, getBySlug };
