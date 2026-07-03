// Site + players data helpers for the Worker.
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS } from "./billing.js";
import { query, one, exec, getSql } from "./db.js";
import { notifyTop3Change, notifyReset, detectTop3Changes, notifySubscribedPlayers } from "./notifications.js";
import { TEMPLATE_IDS } from "./templates/index.js";

export const DEFAULT_EXTRA = {
  chips: ["Fast Payouts", "Crypto Friendly", "24/7 Support"],
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
const SITE_COLUMNS = "id, user_id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain, domain_status";

// Two-tier cache: L1 in-memory Map (per-isolate, instant) + L2 KV (cross-isolate, 30s TTL).
// On Cloudflare Workers, each isolate has its own L1 Map. KV ensures that after
// a dashboard save (which invalidates both layers), all isolates pick up the new
// data within 30s. The L1 Map is a hot-path optimization — avoids a KV read for
// the isolate that just wrote or recently read.
const siteCache = new Map();       // L1 — per-isolate, no TTL enforcement beyond what's set below
const L1_TTL = 60_000;             // L1 entries expire after 60s
const L2_TTL = 30;                 // KV entries expire after 30s (seconds, for KV expirationTtl)
const KV_PREFIX_SITE = "sitecache:";

async function getCached(env, key, dbFetcher) {
  // L1 check (synchronous, per-isolate)
  const entry = siteCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;

  // L2 check (KV, cross-isolate)
  try {
    const kvRaw = await env.SESSIONS.get(KV_PREFIX_SITE + key, { type: "json" });
    if (kvRaw !== null) {
      siteCache.set(key, { data: kvRaw, expires: Date.now() + L1_TTL });
      return kvRaw;
    }
  } catch { /* KV miss — fall through to DB */ }

  // DB fetch
  const data = await dbFetcher();
  // Populate both layers
  siteCache.set(key, { data, expires: Date.now() + L1_TTL });
  try {
    await env.SESSIONS.put(KV_PREFIX_SITE + key, JSON.stringify(data), { expirationTtl: L2_TTL });
  } catch { /* non-critical */ }
  return data;
}

export function invalidateSiteCache(slugOrId) {
  siteCache.delete(slugOrId);
  // Fire-and-forget KV delete — best-effort; 30s TTL handles stale entries anyway.
  try { globalThis.__yr_env?.SESSIONS?.delete(KV_PREFIX_SITE + slugOrId).catch(() => {}); } catch {}
}

export function invalidateUserCache(uid) {
  siteCache.delete(uid);
  siteCache.delete(`user_boards:${uid}`);
  try {
    const sessions = globalThis.__yr_env?.SESSIONS;
    if (sessions) {
      sessions.delete(KV_PREFIX_SITE + uid).catch(() => {});
      sessions.delete(KV_PREFIX_SITE + `user_boards:${uid}`).catch(() => {});
    }
  } catch {}
}

const getBySlug = (env, slug) => getCached(env, slug, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE slug=$1`, [slug]));

// Multi-board: returns the FIRST board for a user (legacy single-board compat).
const getByUser = (env, uid) => getCached(env, uid, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY id ASC LIMIT 1`, [uid]));

// Multi-board: returns ALL boards for a user.
export async function getAllBoards(env, uid) {
  const rows = await query(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY id ASC`, [uid]);
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
    template: TEMPLATE_IDS.includes(t.template) ? t.template : "classic",
  };
}

function archiveShape(a) {
  let top = Array.isArray(a.snapshot_json) ? a.snapshot_json : [];
  top = top.slice().sort((x, y) => (y.wagered || 0) - (x.wagered || 0)).slice(0, 3)
    .map((p) => ({ name: String(p.name || ""), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 }));
  return { label: a.label, at: a.created_at, top };
}

// Plan-aware archive limits
export const ARCHIVE_LIMITS = { free: 6, starter: 6, pro: 24, agency: 999 };

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
    branding: { hasLogo, accentA: theme.accentA, accentB: theme.accentB, template: theme.template },
    pastWinners: archives.map(archiveShape),
    players: players.map((p) => ({ name: p.name, wagered: p.wagered, prize: p.prize })),
  };
}

export async function getPublicSite(env, slug) {
    const site = await getBySlug(env, slug);
    if (!site || !site.published) return null;
    const [owner, players, logoRow] = await Promise.all([
      one(
        "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1",
        [site.user_id]
      ),
      getPlayers(env, site.id),
      one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
    ]);
    if (owner && owner.status === "suspended") return { suspended: true };
    const plan = effectivePlan(owner);
    const archiveLimit = ARCHIVE_LIMITS[plan] || 6;
    const archives = await getArchives(env, site.id, archiveLimit);
    return { id: site.id, data: publicShape(site, players, archives, !!logoRow?.has_logo), plan };
  }

export async function getUserSite(env, uid, plan) {
    const site = await getByUser(env, uid);
    if (!site) return null;
    const archiveLimit = ARCHIVE_LIMITS[plan || "free"] || 6;
    const [archives, logoRow, extraRow] = await Promise.all([
      getArchives(env, site.id, archiveLimit),
      one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
      one("SELECT extra_json FROM sites WHERE id=$1", [site.id]),
    ]);
  const extra = (extraRow?.extra_json && typeof extraRow.extra_json === "object") ? extraRow.extra_json : {};
  return {
      id: site.id, slug: site.slug, published: !!site.published,
      data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, 6), !!logoRow?.has_logo),
      customDomain: site.custom_domain || "",
        domainStatus: site.domain_status || "pending",
      notify: {
        discord_webhook_url: !!extra.discord_webhook_url,
        telegram_bot_token: !!extra.telegram_bot_token,
        telegram_chat_id: extra.telegram_chat_id || "",
        telegram_notify: !!extra.telegram_notify,
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
export async function getUserSiteById(env, uid, siteId, plan) {
    const site = await getBoardById(env, uid, siteId);
    if (!site) return null;
    const archiveLimit = ARCHIVE_LIMITS[plan || "free"] || 6;
    const [archives, logoRow, extraRow] = await Promise.all([
      getArchives(env, site.id, archiveLimit),
    one("SELECT (logo_data IS NOT NULL AND logo_data != '') AS has_logo FROM sites WHERE id=$1", [site.id]),
    one("SELECT extra_json FROM sites WHERE id=$1", [site.id]),
  ]);
  const extra = (extraRow?.extra_json && typeof extraRow.extra_json === "object") ? extraRow.extra_json : {};
  return {
    id: site.id, slug: site.slug, published: !!site.published,
    data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, 6), !!logoRow?.has_logo),
    customDomain: site.custom_domain || "",
        domainStatus: site.domain_status || "pending",
    notify: {
      discord_webhook_url: !!extra.discord_webhook_url,
      telegram_bot_token: !!extra.telegram_bot_token,
      telegram_chat_id: extra.telegram_chat_id || "",
      telegram_notify: !!extra.telegram_notify,
    },
    archives: archives.map((a) => {
      const n = Array.isArray(a.snapshot_json) ? a.snapshot_json.length : 0;
      return { id: a.id, label: a.label, at: a.created_at, players: n };
    }),
  };
}

// Multi-board: create a new board for a user.
export async function createBoard(env, uid, { slug, name } = {}) {
  const plan = effectivePlan(await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]));
  const limit = BOARD_LIMITS[plan] || 1;
  const boards = await getAllBoards(env, uid);
  if (boards.length >= limit) {
    return { error: `Your ${plan} plan allows up to ${limit} leaderboard${limit > 1 ? "s" : ""}. Upgrade to create more.`, code: "board_limit" };
  }
  const existing = await one("SELECT id FROM sites WHERE slug=$1", [slug]);
  if (existing) return { error: "That URL is already taken. Pick another.", code: "slug_taken" };
  const siteId = crypto.randomUUID();
  await exec(
    "INSERT INTO sites (id,user_id,slug,name,casino,prize_pool,period,published,extra_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)",
    [siteId, uid, slug, name || slug, "", "$0", "Monthly", true, JSON.stringify(DEFAULT_EXTRA)]
  );
  invalidateUserCache(uid);
  return { ok: true, id: siteId, slug };
}

// Close out the current period: snapshot the board, then optionally reset it.
export async function createArchive(env, uid, { label, clear, siteId } = {}) {
    const site = siteId ? await getBoardById(env, uid, siteId) : await getByUser(env, uid);
    if (!site) return { error: "no site" };
    const players = await getPlayers(env, site.id);
    if (!players.length) return { error: "Nothing to archive — the board is empty." };
    const owner = await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]);
    const plan = effectivePlan(owner);
    const maxArchives = ARCHIVE_LIMITS[plan] || 6;
    const count = await one("SELECT COUNT(*) n FROM archives WHERE site_id=$1", [site.id]);
    if (maxArchives < 999 && (Number(count?.n) || 0) >= maxArchives) return { error: `Archive limit reached (${maxArchives}). Delete an old one first. Upgrade for more.` };
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
  // Send reset notification
  try {
    const extraRow = await one("SELECT extra_json FROM sites WHERE id=$1", [site.id]);
    const extra = (extraRow?.extra_json && typeof extraRow.extra_json === "object") ? extraRow.extra_json : {};
    if (extra.discord_webhook_url || (extra.telegram_bot_token && extra.telegram_chat_id && extra.telegram_notify)) {
      await notifyReset(env, site.id, site.name || site.slug, players, lab);
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

export async function saveSite(env, user, payload, siteId) {
  const uid = typeof user === "string" ? user : user.id;
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
  const extra = JSON.stringify({
    chips: payload.chips || DEFAULT_EXTRA.chips,
    whyStats: payload.whyStats || DEFAULT_EXTRA.whyStats,
    rules: payload.rules || DEFAULT_EXTRA.rules,
    socials: payload.socials || DEFAULT_EXTRA.socials,
    discord_webhook_url: payload.discord_webhook_url ?? undefined,
    telegram_bot_token: payload.telegram_bot_token ?? undefined,
    telegram_chat_id: payload.telegram_chat_id ?? undefined,
    telegram_notify: payload.telegram_notify ?? undefined,
  });

  // Fetch logo_data separately since the shared query no longer includes it (PERF-004).
  const existingLogoRow = await one("SELECT logo_data FROM sites WHERE id=$1", [site.id]);
  let logoData = existingLogoRow?.logo_data ?? "";
  let themeObj = (site.theme_json && typeof site.theme_json === "object") ? site.theme_json : {};
  const br = payload.branding;
  // Template selection is available on every plan. Whitelisted ids only.
  if (br && typeof br.template === "string" && TEMPLATE_IDS.includes(br.template)) {
    themeObj = { ...themeObj, template: br.template };
  }
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
    if (themeObj.template && themeObj.template !== "classic") t.template = themeObj.template;
    themeObj = t;
  }
  const themeJson = JSON.stringify(themeObj);

  // Invalidate cache before write (both L1 and L2 for cross-isolate consistency)
  invalidateSiteCache(site.slug);
  invalidateSiteCache(uid);
  if (siteId) invalidateSiteCache(siteId);
  // Also invalidate L2 KV entries explicitly with env for immediate effect
  const _kv = env?.SESSIONS;
  if (_kv) {
    try {
      await Promise.all([
        _kv.delete(KV_PREFIX_SITE + site.slug),
        _kv.delete(KV_PREFIX_SITE + uid),
        siteId ? _kv.delete(KV_PREFIX_SITE + siteId) : Promise.resolve(),
      ]);
    } catch {}
  }

  // Capture old top-3 for notifications
  const oldPlayers = await getPlayers(env, site.id);
  const oldTop3 = oldPlayers.slice().sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0)).slice(0, 3);

  await getSql().begin(async (tx) => {
    const publishedVal = typeof payload.published === "boolean" ? payload.published : site.published;
    await tx.unsafe(
      `UPDATE sites SET name=$1, tagline=$2, casino=$3, code=$4, cta_url=$5, prize_pool=$6, period=$7, ends_at=$8, reset_note=$9, blurb=$10, extra_json=$11::jsonb, logo_data=$12, theme_json=$13::jsonb, published=$14, updated_at=now() WHERE id=$15`,
      [
        b.name ?? site.name, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
        b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, b.period ?? site.period,
        payload.endsAt ?? site.ends_at, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
        extra, logoData, themeJson, publishedVal, site.id,
      ]
    );
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

  // Detect top-3 changes and send notifications
  if (Array.isArray(payload.players) && typeof user === "object" && effectivePlan(user) !== "free") {
    try {
      const newSorted = payload.players.filter((p) => p && p.name).sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0));
      const top3Changes = detectTop3Changes(oldTop3, newSorted);
      if (top3Changes.length) {
        await notifyTop3Change(env, site.id, b.name || site.name, top3Changes);
      }
    } catch (e) {
      console.error("[notify] top-3 detection failed:", String(e?.message || e));
    }

    // Notify subscribed players (via /subscribe) about rank changes
    try {
      const newPlayersSorted = payload.players.filter((p) => p && p.name);
      await notifySubscribedPlayers(env, site.id, b.name || site.name, oldPlayers, newPlayersSorted);
    } catch (e) {
      console.error("[notify] player subscription notification failed:", String(e?.message || e));
    }
  }
  return { ok: true };
}

export { getByUser, getBySlug };
