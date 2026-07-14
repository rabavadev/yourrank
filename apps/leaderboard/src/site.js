// Site + players data helpers for the Worker.
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS } from "./billing.js";
import { query, one, exec, withTransaction } from "../../../shared/db.js";
import { notifyTop3Change, notifyReset, detectTop3Changes, notifySubscribedPlayers } from "../../../shared/notifications.js";
import { TEMPLATE_IDS } from "./templates/index.js";
import { RESERVED, slugify } from "./auth.js";

// NOTE: chips + whyStats intentionally start empty. They render casino perks
// ("Deposit Bonus", "Instant Rakeback", …) that a brand-new owner never entered,
// which published fabricated partner claims on every unconfigured page. Owners
// add their own via the dashboard; the public renderer hides these sections when
// they're empty. rules stays populated — it's generic, honest wager mechanics.
export const DEFAULT_EXTRA = {
  chips: [],
  whyStats: [],
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
// PERF-005: include has_logo as a computed column to avoid a separate re-query.
const SITE_COLUMNS = "id, user_id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain, domain_status, (logo_data IS NOT NULL AND logo_data != '') AS has_logo";

// L1 in-memory cache (per-isolate). No L2 KV — sessions moved to Postgres.
const siteCache = new Map();
const inflight = new Map();        // PERF-009: single-flight — prevent cache stampede
const L1_TTL = 25_000;
const L1_MAX_ENTRY_BYTES = 50_000;
const SITE_CACHE_MAX = 1000;

function evictOldest(cache, max) {
  while (cache.size > max) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
}

function setL1(cache, key, data, maxEntryBytes) {
  try {
    const size = JSON.stringify(data).length;
    if (size > maxEntryBytes) return;
  } catch { /* stringify failed */ }
  cache.set(key, { data, expires: Date.now() + L1_TTL });
  evictOldest(cache, SITE_CACHE_MAX);
}

async function getCached(env, key, dbFetcher) {
  // L1 check (synchronous, per-isolate)
  const entry = siteCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;

  // DB fetch — single-flight: coalesce concurrent misses into one query
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const data = await dbFetcher();
      setL1(siteCache, key, data, L1_MAX_ENTRY_BYTES);
      return data;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

export function invalidateSiteCache(env, ...keys) {
  for (const key of keys) {
    siteCache.delete(key);
  }
}

export function invalidateUserCache(env, uid) {
  siteCache.delete(uid);
  siteCache.delete(`user_boards:${uid}`);
}

const getBySlug = (env, slug) => getCached(env, slug, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE slug=$1`, [slug]));

// Multi-board: returns the ACTIVE board for a user (or the first board if none set).
const getByUser = (env, uid) => getCached(env, uid, () => one(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY CASE WHEN id=(SELECT active_site_id FROM users WHERE id=$1) THEN 0 ELSE 1 END, id ASC LIMIT 1`, [uid]));

// Multi-board: returns ALL boards for a user.
export async function getAllBoards(env, uid) {
  const rows = await query(`SELECT ${SITE_COLUMNS} FROM sites WHERE user_id=$1 ORDER BY id ASC`, [uid]);
  return rows || [];
}

// Multi-board: returns a specific board by site ID (only if owned by user).
export async function getBoardById(env, uid, siteId) {
  return one(`SELECT ${SITE_COLUMNS} FROM sites WHERE id=$1 AND user_id=$2`, [siteId, uid]);
}

// Public "hub": the owner's published boards, so a visitor on one board's page
// can tab across to the streamer's other sponsor leaderboards.
async function getPublicBoards(env, uid) {
  const rows = await query(
    "SELECT slug, name FROM sites WHERE user_id=$1 AND published=true ORDER BY board_order ASC, id ASC",
    [uid]
  );
  return (rows || []).map((r) => ({ slug: r.slug, name: r.name || r.slug }));
}

async function getPlayers(env, siteId) {
  const rows = await query("SELECT name, wagered, prize FROM players WHERE site_id=$1 ORDER BY wagered DESC", [siteId]);
  return rows || [];
}

const HEX = /^#[0-9a-fA-F]{6}$/;
// PERF-003: Logos are stored as base64 data URIs (up to 180KB) in the logo_data
// column. This means every /logo/:slug request fetches the blob from Postgres,
// decodes base64 in-memory, and sends it. Deferred: migrate to R2 bucket storage
// with signed URLs. Requires R2 bucket provisioning (not yet available in infra).
const LOGO_RE = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_LOGO = 250000; // chars of data URI (~180KB image)

// theme_json / extra_json / snapshot_json are JSONB. postgres.js returns them
// already parsed (object/array). But a value that is pre-stringified with
// JSON.stringify() and then bound to a `::jsonb` parameter gets JSON-encoded a
// SECOND time by the driver, so it lands in the column as a JSON *string*
// instead of an object. Legacy rows written that way come back as strings;
// coerce them back so both new (object) and old (string) rows read correctly.
export function fromJsonb(value) {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

function parseTheme(site) {
  const raw = fromJsonb(site.theme_json);
  const t = (raw && typeof raw === "object") ? raw : {};
  return {
    accentA: HEX.test(t.accentA || "") ? t.accentA : null,
    accentB: HEX.test(t.accentB || "") ? t.accentB : null,
    template: TEMPLATE_IDS.includes(t.template) ? t.template : "classic",
  };
}

function archiveShape(a) {
  const snap = fromJsonb(a.snapshot_json);
  let top = Array.isArray(snap) ? snap : [];
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
  const rawExtra = fromJsonb(site.extra_json);
  const extra = (rawExtra && typeof rawExtra === "object") ? rawExtra : {};
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
    whyStats: m.whyStats, rules: m.rules, socials: (m.socials || []).filter(s => s.url && s.url !== "#" && s.url !== ""),
    branding: { hasLogo, accentA: theme.accentA, accentB: theme.accentB, template: theme.template },
    pastWinners: archives.map(archiveShape),
    players: players.map((p) => ({ name: p.name, wagered: p.wagered, prize: p.prize })),
  };
}

export async function getPublicSite(env, slug) {
    const site = await getBySlug(env, slug);
    if (!site || !site.published) return null;
    // PERF-005: has_logo is now part of SITE_COLUMNS (computed from logo_data).
    // Eliminated redundant re-query of sites table. Owner query remains separate
    // since it's from the users table (indexed by id, ~0.1ms).
    // DB-003-v8: Resolve plan first, then fetch only needed archives
    const owner = await one(
      "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1",
      [site.user_id]
    );
    if (owner && owner.status === "suspended") return { suspended: true };
    const plan = effectivePlan(owner);
    const archiveLimit = ARCHIVE_LIMITS[plan] || 6;
    const [players, archives, boards] = await Promise.all([
      getPlayers(env, site.id),
      getArchives(env, site.id, archiveLimit), // DB-003-v8: fetch only what plan allows
      getPublicBoards(env, site.user_id),
    ]);
    return { id: site.id, data: publicShape(site, players, archives, !!site.has_logo), plan, boards };
  }

export async function getUserSite(env, uid, plan) {
      const site = await getByUser(env, uid);
      if (!site) return null;
      const archiveLimit = ARCHIVE_LIMITS[plan || "free"] || 6;
      // PERF-005: has_logo is now in SITE_COLUMNS — no separate query needed.
      const archives = await getArchives(env, site.id, archiveLimit);
    const rawExtra = fromJsonb(site.extra_json);
    const extra = (rawExtra && typeof rawExtra === "object") ? rawExtra : {};
    return {
        id: site.id, slug: site.slug, published: !!site.published,
        data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, archiveLimit), !!site.has_logo),
        customDomain: site.custom_domain || "",
          domainStatus: site.domain_status || "pending",
        notify: {
          discord_webhook_url: !!extra.discord_webhook_url,
          telegram_bot_token: !!extra.telegram_bot_token,
          telegram_chat_id: extra.telegram_chat_id || "",
          telegram_notify: !!extra.telegram_notify,
        },
        archives: archives.map((a) => {
          const snap = fromJsonb(a.snapshot_json);
          const n = Array.isArray(snap) ? snap.length : 0;
          return { id: a.id, label: a.label, at: a.created_at, players: n };
        }),
      };
    }

// Multi-board: return a summary list of all boards for a user.
export async function getUserBoardsList(env, uid) {
  const rows = await query(
    `SELECT s.id, s.slug, s.name, s.casino, s.code, s.published, s.board_order, s.theme_json,
            (SELECT COUNT(*) FROM players p WHERE p.site_id = s.id) AS player_count
       FROM sites s
      WHERE s.user_id=$1
      ORDER BY s.board_order ASC, s.id ASC`,
    [uid]
  );
  return (rows || []).map((b) => {
    const theme = parseTheme(b);
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      casino: b.casino || "",
      code: b.code || "",
      published: !!b.published,
      players: Number(b.player_count) || 0,
      template: theme.template,
      boardOrder: b.board_order || 0,
    };
  });
}

// Multi-board: get full site data for a specific board by siteId.
export async function getUserSiteById(env, uid, siteId, plan) {
    const site = await getBoardById(env, uid, siteId);
    if (!site) return null;
    const archiveLimit = ARCHIVE_LIMITS[plan || "free"] || 6;
    // PERF-005: has_logo is now in SITE_COLUMNS — no separate query needed.
    const archives = await getArchives(env, site.id, archiveLimit);
  const rawExtra = fromJsonb(site.extra_json);
  const extra = (rawExtra && typeof rawExtra === "object") ? rawExtra : {};
  return {
    id: site.id, slug: site.slug, published: !!site.published,
    data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, archiveLimit), !!site.has_logo),
      customDomain: site.custom_domain || "",
          domainStatus: site.domain_status || "pending",
      notify: {
        discord_webhook_url: !!extra.discord_webhook_url,
        telegram_bot_token: !!extra.telegram_bot_token,
        telegram_chat_id: extra.telegram_chat_id || "",
        telegram_notify: !!extra.telegram_notify,
      },
      archives: archives.map((a) => {
        const snap = fromJsonb(a.snapshot_json);
        const n = Array.isArray(snap) ? snap.length : 0;
        return { id: a.id, label: a.label, at: a.created_at, players: n };
      }),
    };
  }

// Multi-board: create a new board for a user.
export async function createBoard(env, uid, { slug, name, casino = "", code = "" } = {}) {
  const plan = effectivePlan(await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]));
  const limit = BOARD_LIMITS[plan] || 1;
  const boards = await getAllBoards(env, uid);
  if (boards.length >= limit) {
    return { error: `Your ${plan} plan allows up to ${limit} leaderboard${limit > 1 ? "s" : ""}. Upgrade to create more.`, code: "board_limit" };
  }
  const existing = await one("SELECT id FROM sites WHERE slug=$1", [slug]);
  if (existing) return { error: "That URL is already taken. Pick another.", code: "slug_taken" };
  // BIZ-004: Reject reserved slugs (api, login, dashboard, bot, etc.)
  if (RESERVED.has(slug)) return { error: "That URL is reserved and cannot be used.", code: "slug_reserved" };
  const siteId = crypto.randomUUID();
  const cleanCasino = String(casino || "").trim().slice(0, 40);
  const cleanCode = String(code || "").trim().slice(0, 40);
  const themeObj = { template: "classic" };
  await exec(
    "INSERT INTO sites (id,user_id,slug,name,casino,code,prize_pool,period,published,extra_json,theme_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb)",
    [siteId, uid, slug, name || slug, cleanCasino, cleanCode, "$0", "Monthly", true, DEFAULT_EXTRA, themeObj]
  );
  // If the user has no active board, make the new one active.
  await exec("UPDATE users SET active_site_id=$1, updated_at=now() WHERE id=$2 AND active_site_id IS NULL", [siteId, uid]);
  invalidateUserCache(env, uid);
  return { ok: true, id: siteId, slug };
}

// Generate a unique slug for a duplicated board by appending -copy, -copy-2, etc.
async function uniqueSlug(env, base) {
  let candidate = slugify(`${base}-copy`);
  let counter = 2;
  while (await one("SELECT id FROM sites WHERE slug=$1", [candidate])) {
    candidate = slugify(`${base}-copy-${counter}`);
    counter++;
    if (counter > 99) {
      candidate = slugify(`${base}-copy-${crypto.randomUUID().slice(0, 8)}`);
      break;
    }
  }
  return candidate;
}

// Multi-board: duplicate an existing board (design + players) for the next sponsor.
export async function duplicateBoard(env, uid, siteId) {
  const source = await getBoardById(env, uid, siteId);
  if (!source) return { error: "no site" };
  const owner = await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [uid]);
  const plan = effectivePlan(owner);
  const limit = BOARD_LIMITS[plan] || 1;
  const boards = await getAllBoards(env, uid);
  if (boards.length >= limit) {
    return { error: `Your ${plan} plan allows up to ${limit} leaderboard${limit > 1 ? "s" : ""}. Upgrade to create more.`, code: "board_limit" };
  }
  const newSlug = await uniqueSlug(env, source.slug);
  const newId = crypto.randomUUID();
  const players = await getPlayers(env, siteId);
  const rawTheme = fromJsonb(source.theme_json);
  const theme = (rawTheme && typeof rawTheme === "object") ? rawTheme : {};
  const rawExtra = fromJsonb(source.extra_json);
  const extra = (rawExtra && typeof rawExtra === "object") ? rawExtra : {};
  const logoRow = await one("SELECT logo_data FROM sites WHERE id=$1", [siteId]);
  const logoData = logoRow?.logo_data || "";
  const boardOrder = (source.board_order || 0) + 1;

  await withTransaction(async (tx) => {
    await tx.unsafe(
      `INSERT INTO sites (id,user_id,slug,name,tagline,casino,code,cta_url,prize_pool,period,ends_at,reset_note,blurb,published,extra_json,logo_data,theme_json,board_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17::jsonb,$18)`,
      [newId, uid, newSlug, `${source.name} (copy)`.slice(0, 80), source.tagline, source.casino, source.code, source.cta_url, source.prize_pool, source.period, source.ends_at, source.reset_note, source.blurb, false, extra, logoData, theme, boardOrder]
    );
    if (players.length) {
      const valueRows = [];
      const params = [];
      let idx = 1;
      players.forEach((p, i) => {
        const row = [];
        for (let c = 0; c < 6; c++) row.push(`$${idx++}`);
        valueRows.push(`(${row.join(",")})`);
        params.push(crypto.randomUUID(), newId, p.name, p.wagered, p.prize, i);
      });
      await tx.unsafe(
        `INSERT INTO players (id,site_id,name,wagered,prize,sort) VALUES ${valueRows.join(",")}`,
        params
      );
    }
  });
  invalidateUserCache(env, uid);
  return { ok: true, id: newId, slug: newSlug };
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
  const lab = String(label || "").trim().slice(0, 60) ||
    new Date().toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const archiveId = crypto.randomUUID();
  const snapshotJson = players;
  // QA-005: Atomic limit check — the count + INSERT happen in a single
  // statement so two concurrent archive-creation requests can't both pass
  // the count check and exceed the plan limit.
  let limitReached = false;
  await withTransaction(async (tx) => {
    if (maxArchives < 999) {
      const rows = await tx.unsafe(
        `INSERT INTO archives (id,site_id,label,snapshot_json,created_at)
         SELECT $1,$2,$3,$4::jsonb,now()
           WHERE (SELECT COUNT(*) FROM archives WHERE site_id=$2) < $5
         RETURNING id`,
        [archiveId, site.id, lab, snapshotJson, maxArchives]
      );
      if (!rows || rows.length === 0) { limitReached = true; return; }
    } else {
      await tx.unsafe(
        "INSERT INTO archives (id,site_id,label,snapshot_json,created_at) VALUES ($1,$2,$3,$4::jsonb,now())",
        [archiveId, site.id, lab, snapshotJson]
      );
    }
    if (clear === "players") await tx.unsafe("DELETE FROM players WHERE site_id=$1", [site.id]);
    else if (clear === "wagers") await tx.unsafe("UPDATE players SET wagered=0 WHERE site_id=$1", [site.id]);
  });
  if (limitReached) return { error: `Archive limit reached (${maxArchives}). Delete an old one first. Upgrade for more.` };
  // Send reset notification
  try {
    const rawNotify = fromJsonb(site.extra_json);
    const extra = (rawNotify && typeof rawNotify === "object") ? rawNotify : {};
    if (extra.discord_webhook_url || (extra.telegram_bot_token && extra.telegram_chat_id && extra.telegram_notify)) {
      await notifyReset({ one, query }, env, site.id, site.name || site.slug, players, lab);
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

// ends_at is a timestamptz. The dashboard always sends `endsAt`, using an empty
// string when no countdown is set — and nullish coalescing keeps that "" (it only
// defaults on null/undefined), so Postgres rejects the write with 22007 "invalid
// input syntax for type timestamp with time zone". Normalise a blank value to NULL;
// a genuinely omitted field (undefined) keeps the existing stored value.
export function normalizeEndsAt(incoming, existing) {
  if (incoming === undefined) return existing ?? null;
  const trimmed = String(incoming ?? "").trim();
  return trimmed || null;
}

export async function saveSite(env, user, payload, siteId) {
  const uid = typeof user === "string" ? user : user.id;
  const site = siteId ? await getBoardById(env, uid, siteId) : await getByUser(env, uid);
  if (!site) return { error: "no site" };
  // Internal / dedicated-endpoint fields are silently ignored rather than
  // rejecting the whole save: the dashboard and setup wizard round-trip fields
  // like `customDomain` (managed via /api/site/domain) straight back from the
  // load response, and a hard reject broke every save that included them.
  // `slug` is the one exception we act on — see the guarded rename below.
  // The custom domain is provisioned through its own verify/TLS endpoint.

  // Onboarding lets a streamer pick their handle after signup. Allow a validated
  // slug rename here (reserved + uniqueness checked); ignore a no-op or blank.
  let slugRename = null;
  if (payload.slug != null) {
    const next = slugify(payload.slug);
    if (next && next !== site.slug) {
      if (RESERVED.has(next)) return { error: "That URL is reserved. Pick another.", code: "slug_reserved" };
      const taken = await one("SELECT id FROM sites WHERE slug=$1", [next]);
      if (taken && taken.id !== site.id) return { error: "That URL is already taken. Pick another.", code: "slug_taken" };
      slugRename = next;
    }
  }
  
  // Optimistic concurrency check: if client provides expected updatedAt, verify it matches
  if (payload.expectedUpdatedAt && site.updated_at) {
    const clientTime = new Date(payload.expectedUpdatedAt).getTime();
    const serverTime = new Date(site.updated_at).getTime();
    if (clientTime !== serverTime) {
      return { 
        error: "This board was modified by another session. Refresh and try again.", 
        code: "concurrency_conflict",
        currentUpdatedAt: site.updated_at 
      };
    }
  }
  
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
  // Validate the referral/CTA link server-side (the client only rejects it at
  // render time via safeUrl). A non-empty value must be a valid http(s) URL.
  if (b.ctaUrl != null && String(b.ctaUrl).trim() !== "") {
    const cta = String(b.ctaUrl).trim();
    let ctaOk = false;
    try { ctaOk = /^https?:$/.test(new URL(cta).protocol); } catch { ctaOk = false; }
    if (!ctaOk) return { error: "Referral link must be a valid http:// or https:// URL.", code: "invalid_cta" };
  }
  // Keep the top-level site name in sync with brand.name (dashboard sends both).
  const siteName = String(payload.name ?? b.name ?? site.name).trim().slice(0, 80) || site.name;
  const extra = {
    chips: payload.chips || DEFAULT_EXTRA.chips,
    whyStats: payload.whyStats || DEFAULT_EXTRA.whyStats,
    rules: payload.rules || DEFAULT_EXTRA.rules,
    socials: payload.socials || DEFAULT_EXTRA.socials,
    discord_webhook_url: payload.discord_webhook_url ?? undefined,
    telegram_bot_token: payload.telegram_bot_token ?? undefined,
    telegram_chat_id: payload.telegram_chat_id ?? undefined,
    telegram_notify: payload.telegram_notify ?? undefined,
  };

  // Fetch logo_data separately since the shared query no longer includes it (PERF-004).
  const existingLogoRow = await one("SELECT logo_data FROM sites WHERE id=$1", [site.id]);
  let logoData = existingLogoRow?.logo_data ?? "";
  const rawThemeObj = fromJsonb(site.theme_json);
  let themeObj = (rawThemeObj && typeof rawThemeObj === "object") ? rawThemeObj : {};
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
  const themeJson = themeObj;

  // Invalidate cache before write (both L1 and L2 for cross-isolate consistency)
  invalidateSiteCache(env, site.slug, uid, siteId);
  if (slugRename) invalidateSiteCache(env, slugRename);
  // L1-only cache invalidated above.

  // Capture old top-3 for notifications
  const oldPlayers = await getPlayers(env, site.id);
  const oldTop3 = oldPlayers.slice().sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0)).slice(0, 3);

  await withTransaction(async (tx) => {
    // QA-004: Lock the site row to serialize concurrent saves on the same
    // board. Without this, two concurrent saveSite() calls could interleave
    // their DELETE + INSERT players, leaving orphaned or missing rows.
    await tx.unsafe("SELECT id FROM sites WHERE id=$1 FOR UPDATE", [site.id]);
    const publishedVal = typeof payload.published === "boolean" ? payload.published : site.published;
    const endsAtVal = normalizeEndsAt(payload.endsAt, site.ends_at);
    const slugVal = slugRename || site.slug;
    await tx.unsafe(
      `UPDATE sites SET slug=$1, name=$2, tagline=$3, casino=$4, code=$5, cta_url=$6, prize_pool=$7, period=$8, ends_at=$9, reset_note=$10, blurb=$11, extra_json=$12::jsonb, logo_data=$13, theme_json=$14::jsonb, published=$15, updated_at=now() WHERE id=$16`,
      [
        slugVal, siteName, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
        b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, b.period ?? site.period,
        endsAtVal, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
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
        await notifyTop3Change({ one, query }, env, site.id, siteName, top3Changes);
      }
    } catch (e) {
      console.error("[notify] top-3 detection failed:", String(e?.message || e));
    }

    // Notify subscribed players (via /subscribe) about rank changes
    try {
      const newPlayersSorted = payload.players.filter((p) => p && p.name);
      await notifySubscribedPlayers({ one, query }, env, site.id, siteName, oldPlayers, newPlayersSorted);
    } catch (e) {
      console.error("[notify] player subscription notification failed:", String(e?.message || e));
    }
  }
  // Return updated site data including new timestamp for optimistic concurrency
  const updatedSite = await getBoardById(env, uid, site.id);
  return { ok: true, updatedAt: updatedSite?.updated_at, slug: updatedSite?.slug || slugRename || site.slug };
}

export async function deleteBoard(env, uid, siteId) {
  const site = await getBoardById(env, uid, siteId);
  if (!site) return { error: "no site" };
  const boards = await getAllBoards(env, uid);
  if (boards.length <= 1) {
    return { error: "You must keep at least one board. Create a new board before deleting this one.", code: "last_board" };
  }
  await withTransaction(async (tx) => {
    const fallback = boards.find((b) => b.id !== siteId)?.id || null;
    await tx.unsafe("UPDATE users SET active_site_id=$1, updated_at=now() WHERE id=$2", [fallback, uid]);
    // Manual cleanup: these tables do not have ON DELETE CASCADE FKs.
    await tx.unsafe("DELETE FROM site_stats_hourly WHERE site_id=$1", [siteId]);
    await tx.unsafe("DELETE FROM site_referrers WHERE site_id=$1", [siteId]);
    await tx.unsafe("DELETE FROM sites WHERE id=$1 AND user_id=$2", [siteId, uid]);
  });
  invalidateSiteCache(env, site.slug, uid, siteId);
  invalidateUserCache(env, uid);
  return { ok: true };
}

export async function setActiveBoard(env, uid, siteId) {
  const site = await getBoardById(env, uid, siteId);
  if (!site) return { error: "no site" };
  await exec("UPDATE users SET active_site_id=$1, updated_at=now() WHERE id=$2", [siteId, uid]);
  invalidateUserCache(env, uid);
  return { ok: true };
}

export async function updateSiteTheme(env, user, payload = {}) {
  const site = payload.siteId
    ? await getBoardById(env, user.id, payload.siteId)
    : await getByUser(env, user.id);
  if (!site) return { error: "no site" };
  if (!TEMPLATE_IDS.includes(payload.template)) {
    return { error: "Choose a valid page template.", code: "invalid_template" };
  }

  const rawTheme = fromJsonb(site.theme_json);
  const theme = (rawTheme && typeof rawTheme === "object") ? { ...rawTheme } : {};
  theme.template = payload.template;
  const plan = effectivePlan(user);
  if (plan !== "free" && (payload.accentA != null || payload.accentB != null)) {
    if (!HEX.test(payload.accentA || "") || !HEX.test(payload.accentB || "")) {
      return { error: "Choose two valid accent colors.", code: "invalid_colors" };
    }
    theme.accentA = payload.accentA;
    theme.accentB = payload.accentB;
  }

  await exec(
    "UPDATE sites SET theme_json=$1::jsonb, updated_at=now() WHERE id=$2 AND user_id=$3",
    [theme, site.id, user.id]
  );
  invalidateSiteCache(env, site.slug, user.id, site.id);
  invalidateUserCache(env, user.id);
  return {
    ok: true,
    branding: {
      template: theme.template,
      accentA: HEX.test(theme.accentA || "") ? theme.accentA : null,
      accentB: HEX.test(theme.accentB || "") ? theme.accentB : null,
    },
  };
}

export { getByUser, getBySlug };
