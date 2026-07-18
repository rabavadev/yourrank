// Site + players data helpers for the Worker.
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS } from "./billing.js";
import { query, one, exec, withTransaction } from "../../../shared/db.js";
import { detectTop3Changes, dispatchNotifyEvent } from "../../../shared/notifications.js";
import { TEMPLATE_IDS } from "./templates/index.js";
import { RESERVED, slugify } from "./auth.js";
import { logAudit } from "../../../shared/audit.js";
import { createQueueProducer } from "../../../shared/queue-producer.js";
import { encrypt } from "../../../shared/crypto.js";

function normalizePlayerName(name) {
  // C-07 / H-17: stable, case-insensitive, whitespace-collapsed identity.
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getTokenEncKey() {
  const hex = (typeof process !== "undefined" && process.env?.TOKEN_ENC_KEY) || "";
  if (hex.length !== 64) throw new Error("TOKEN_ENC_KEY must be 64 hex characters (32 bytes)");
  return hex;
}

const DISCORD_WEBHOOK_RE = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/.+/;

function createNotifyQueue(env) {
  return createQueueProducer(
    env.EVENTS_QUEUE,
    async (event) => {
      if (event.type === "notify") {
        await dispatchNotifyEvent({ one, query }, env, event);
      }
    }
  );
}

// NOTE: chips + whyStats intentionally start empty. They render casino perks
// ("Deposit Bonus", "Instant Rakeback", …) that a brand-new owner never entered,
// which published fabricated partner claims on every unconfigured page. Owners
// add their own via the dashboard; the public renderer hides these sections when
// they're empty. rules stays populated — it's generic, honest wager mechanics.
export const VALID_PERIODS = ["Weekly", "Monthly", "Season"];

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
    { name: "YouTube", handle: "Watch videos", action: "Subscribe", url: "#", brand: "youtube" },
    { name: "X", handle: "Latest updates", action: "Follow", url: "#", brand: "x" },
  ],
  sections: {
    hero: true,
    top3: true,
    search: true,
    rules: true,
    partner: true,
    socials: true,
    pastWinners: true,
    countdown: true,
    cta: true,
    payouts: true,
    poweredBy: false,
  },
  legal: {
    terms: "",
    privacy: "",
    responsible: "",
    cookies: "",
    refund: "",
    contact: "",
  },
};

// All site columns except logo_data (base64 image, up to 180KB) — that's only
// needed by the /logo/:slug endpoint and saveSite(), which fetch it separately.
// PERF-004 / PERF-107: avoid SELECT * to prevent 180KB+ transfers on every page.
// PERF-005: include has_logo as a computed column to avoid a separate re-query.
const SITE_COLUMNS = "id, user_id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain, domain_status, discord_webhook_url_enc, telegram_chat_id, telegram_notify, auto_reset_enabled, auto_reset_clear, auto_reset_last_run_at, (logo_data IS NOT NULL AND logo_data != '') AS has_logo";

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
  const rows = await query(
    "SELECT name, wagered, prize, score, hands, net_profit, win_rate, change FROM players WHERE site_id=$1 ORDER BY wagered DESC",
    [siteId]
  );
  return rows || [];
}

const HEX = /^#[0-9a-fA-F]{6}$/;

// H-19: Logo uploads are validated by decoded magic bytes, not just the data-URI
// regex. We still store the base64 blob in Postgres until an R2 bucket is
// provisioned; moving the asset out of the database is deferred to the infra task.
const LOGO_RE = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/;
const MAX_LOGO_CHARS = 250000; // chars of data URI (~187KB decoded)
const MAX_LOGO_BYTES = 200 * 1024;
const MAX_LOGO_JSON_CHARS = 400000; // srcset object with multiple pre-sized WebP blobs
const MAX_LOGO_TOTAL_BYTES = 240 * 1024;

function validateSingleLogoData(dataUri) {
  const m = LOGO_RE.exec(String(dataUri ?? ""));
  if (!m) return { error: "Logo must be a base64 data URI for PNG, JPEG or WebP." };

  const declaredMime = `image/${m[1]}`;
  const base64 = m[2];
  if (base64.length > MAX_LOGO_CHARS) {
    return { error: "Logo is too large. Keep it under ~180KB." };
  }

  let bytes;
  try {
    bytes = Buffer.from(base64, "base64");
  } catch {
    return { error: "Logo base64 is malformed." };
  }
  if (bytes.length > MAX_LOGO_BYTES) {
    return { error: "Logo is too large. Keep it under ~180KB." };
  }

  const detected = detectImageMime(bytes);
  if (!detected) {
    return { error: "Logo file type could not be verified from its contents." };
  }
  if (detected !== declaredMime) {
    return { error: `Logo content is ${detected.split("/")[1]} but declared as ${declaredMime.split("/")[1]}.` };
  }

  // Normalise the data URI to the detected MIME (dropping accidental whitespace).
  const normalised = `data:${detected};base64,${bytes.toString("base64")}`;
  return { ok: true, mime: detected, dataUri: normalised, bytes: bytes.length };
}

const PNG_MAGIC = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
const JPEG_MAGIC = [0xFF, 0xD8];
const WEBP_MAGIC = [0x52, 0x49, 0x46, 0x46];

function bytesMatch(buf, magic) {
  if (buf.length < magic.length) return false;
  for (let i = 0; i < magic.length; i++) {
    if (buf[i] !== magic[i]) return false;
  }
  return true;
}

export function detectImageMime(buf) {
  if (bytesMatch(buf, PNG_MAGIC)) return "image/png";
  if (bytesMatch(buf, JPEG_MAGIC)) return "image/jpeg";
  if (bytesMatch(buf, WEBP_MAGIC) && buf.length >= 12 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return "image/webp";
  }
  return null;
}

/** Validate a logo data URI (or a srcset object of URIs) by decoding and checking magic bytes.
 *  Returns { ok: true, mime, dataUri } or { error }.
 *  When an object is supplied, dataUri is a JSON string containing the normalised blobs.
 */
export function validateLogoData(dataUri) {
  if (dataUri && typeof dataUri === "object") {
    const keys = Object.keys(dataUri);
    if (keys.length === 0) return { error: "Logo must be a base64 data URI for PNG, JPEG or WebP." };
    const normalised = {};
    let totalBytes = 0;
    for (const k of keys) {
      const single = validateSingleLogoData(dataUri[k]);
      if (single.error) return { error: `Logo size ${k}: ${single.error}` };
      totalBytes += single.bytes || 0;
      normalised[k] = single.dataUri;
    }
    const json = JSON.stringify(normalised);
    if (json.length > MAX_LOGO_JSON_CHARS) {
      return { error: "Logo set is too large. Try a smaller image." };
    }
    if (totalBytes > MAX_LOGO_TOTAL_BYTES) {
      return { error: "Logo set is too large. Keep it under ~240KB." };
    }
    return { ok: true, mime: "image/webp", dataUri: json };
  }
  return validateSingleLogoData(dataUri);
}

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
    text: (t.text && typeof t.text === "object") ? t.text : {},
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

export async function getArchives(env, siteId, limit = 6) {
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
    whyStats: m.whyStats, rules: m.rules, socials: (m.socials || []).filter(s => s.enabled !== false && s.url && s.url !== "#" && s.url !== ""),
    branding: { hasLogo, accentA: theme.accentA, accentB: theme.accentB, template: theme.template, text: theme.text },
    pastWinners: archives.map(archiveShape),
    players: players.map((p) => ({
      name: p.name,
      wagered: p.wagered,
      prize: p.prize,
      score: p.score,
      hands: p.hands,
      netProfit: p.net_profit,
      winRate: p.win_rate,
      change: p.change,
    })),
    sections: m.sections || DEFAULT_EXTRA.sections,
    legal: m.legal || DEFAULT_EXTRA.legal,
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
    const [players, archives, boards, bot] = await Promise.all([
      getPlayers(env, site.id),
      getArchives(env, site.id, archiveLimit), // DB-003-v8: fetch only what plan allows
      getPublicBoards(env, site.user_id),
      one("SELECT username FROM bots WHERE owner_id=$1 LIMIT 1", [site.user_id]),
    ]);
    return { id: site.id, userId: site.user_id, data: publicShape(site, players, archives, !!site.has_logo), plan, boards, botUsername: bot?.username || null };
  }

export async function getUserSite(env, uid, plan) {
      const site = await getByUser(env, uid);
      if (!site) return null;
      const archiveLimit = ARCHIVE_LIMITS[plan || "free"] || 6;
      // PERF-005: has_logo is now in SITE_COLUMNS — no separate query needed.
      const archives = await getArchives(env, site.id, archiveLimit);
    return {
        id: site.id, slug: site.slug, published: !!site.published,
        updatedAt: site.updated_at,
        autoReset: { enabled: !!site.auto_reset_enabled, clear: site.auto_reset_clear || "wagers" },
        data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, archiveLimit), !!site.has_logo),
        socials: (fromJsonb(site.extra_json)?.socials) ?? DEFAULT_EXTRA.socials,
        customDomain: site.custom_domain || "",
          domainStatus: site.domain_status || "pending",
        notify: {
          discord_webhook_url: !!site.discord_webhook_url_enc,
          telegram_bot_token: false,
          telegram_chat_id: site.telegram_chat_id || "",
          telegram_notify: !!site.telegram_notify,
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
  return {
    id: site.id, slug: site.slug, published: !!site.published,
    updatedAt: site.updated_at,
    autoReset: { enabled: !!site.auto_reset_enabled, clear: site.auto_reset_clear || "wagers" },
    data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, archiveLimit), !!site.has_logo),
    socials: (fromJsonb(site.extra_json)?.socials) ?? DEFAULT_EXTRA.socials,
      customDomain: site.custom_domain || "",
          domainStatus: site.domain_status || "pending",
      notify: {
        discord_webhook_url: !!site.discord_webhook_url_enc,
        telegram_bot_token: false,
        telegram_chat_id: site.telegram_chat_id || "",
        telegram_notify: !!site.telegram_notify,
      },
      archives: archives.map((a) => {
        const snap = fromJsonb(a.snapshot_json);
        const n = Array.isArray(snap) ? snap.length : 0;
        return { id: a.id, label: a.label, at: a.created_at, players: n };
      }),
    };
  }

// Multi-board: create a new board for a user.
export async function createBoard(env, uid, { slug, name, casino = "", code = "" } = {}, request = null) {
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
  await logAudit({
    actorId: uid,
    action: "board_create",
    entityType: "site",
    entityId: siteId,
    request,
    details: { board_id: siteId, board_slug: slug, name: name || slug, casino: cleanCasino, code: cleanCode },
  });
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
export async function duplicateBoard(env, uid, siteId, request = null) {
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
  await logAudit({
    actorId: uid,
    action: "board_duplicate",
    entityType: "site",
    entityId: newId,
    request,
    details: { board_id: newId, board_slug: newSlug, source_site_id: siteId, source_board_slug: source.slug },
  });
  return { ok: true, id: newId, slug: newSlug };
}

// Close out the current period: snapshot the board, then optionally reset it.
export async function createArchive(env, uid, { label, clear, siteId } = {}, request = null) {
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
  await logAudit({
    actorId: uid,
    action: "archive_create",
    entityType: "site",
    entityId: site.id,
    request,
    details: { board_id: site.id, board_slug: site.slug, archive_label: lab, clear: clear || null },
  });
  // Enqueue reset notification so outbound calls don't block the request.
  try {
    if (site.discord_webhook_url_enc || (site.telegram_notify && site.telegram_chat_id)) {
      const notifyQueue = createNotifyQueue(env);
      await notifyQueue.send({
        type: "notify",
        kind: "reset",
        siteId: site.id,
        siteName: site.name || site.slug,
        players,
        period: lab,
      });
    }
  } catch (e) {
    console.error("[notify] reset enqueue failed:", String(e?.message || e));
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

export async function saveSite(env, user, payload, siteId, request = null) {
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
    const validPlayersForLimit = payload.players.filter((p) => p && p.name && normalizePlayerName(p.name) !== "");
    if (validPlayersForLimit.length > PLAN_LIMITS[plan]) {
      return {
        error: plan === "pro" || plan === "agency"
          ? `Your plan allows up to ${PLAN_LIMITS[plan]} players.`
          : `Your plan allows up to ${PLAN_LIMITS[plan]} players. Upgrade for more.`,
        code: "player_limit",
      };
    }
  }

  // H-17: reject duplicate player names and whitespace-only names before they
  // reach the database, using the same normalization as the upsert path.
  if (Array.isArray(payload.players)) {
    const seen = new Set();
    for (const p of payload.players) {
      if (!p || !p.name) continue;
      const norm = normalizePlayerName(p.name);
      if (norm === "") {
        return { error: `Player name cannot be empty.`, code: "invalid_player_name" };
      }
      if (seen.has(norm)) {
        return { error: `Duplicate player name: ${p.name}`, code: "duplicate_player" };
      }
      seen.add(norm);
    }
  }
  const b = payload.brand || {};
  // Require a non-empty casino name when the brand section is being saved.
  if (b.casino !== undefined && !String(b.casino).trim()) {
    return { error: "Casino name is required.", code: "missing_casino" };
  }
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
  const existingExtra = fromJsonb(site.extra_json) || {};
  const notify = payload.notify || {};

  // H-25: notification credentials live in dedicated columns (and Discord URLs
  // are encrypted at rest), not inside extra_json. Strip any legacy copies so
  // they cannot leak through public-shape or future code that reads extra_json.
  const incomingSections = payload.sections && typeof payload.sections === "object" ? payload.sections : {};
  const incomingLegal = payload.legal && typeof payload.legal === "object" ? payload.legal : {};
  const existingLegal = existingExtra.legal || {};
  const legalDefaults = DEFAULT_EXTRA.legal;
  const legal = {};
  for (const k of Object.keys(legalDefaults)) {
    const v = incomingLegal[k] !== undefined ? incomingLegal[k] : existingLegal[k];
    legal[k] = typeof v === "string" ? v.trim() : (legalDefaults[k] || "");
  }
  const extra = {
    chips: payload.partner?.chips ?? payload.chips ?? existingExtra.chips ?? DEFAULT_EXTRA.chips,
    whyStats: payload.whyStats ?? existingExtra.whyStats ?? DEFAULT_EXTRA.whyStats,
    rules: payload.rules ?? existingExtra.rules ?? DEFAULT_EXTRA.rules,
    socials: payload.socials ?? existingExtra.socials ?? DEFAULT_EXTRA.socials,
    sections: { ...(existingExtra.sections || DEFAULT_EXTRA.sections), ...incomingSections },
    legal,
  };

  let discordWebhookUrlEnc = site.discord_webhook_url_enc;
  if (notify.discord_webhook_url !== undefined && notify.discord_webhook_url !== null) {
    const url = String(notify.discord_webhook_url).trim();
    if (url === "") {
      discordWebhookUrlEnc = null;
    } else {
      if (!DISCORD_WEBHOOK_RE.test(url)) return { error: "That doesn't look like a valid Discord webhook URL.", code: "invalid_webhook" };
      discordWebhookUrlEnc = await encrypt(url, getTokenEncKey());
    }
  }

  const telegramChatId = notify.telegram_chat_id !== undefined && notify.telegram_chat_id !== null
    ? String(notify.telegram_chat_id).trim() || null
    : site.telegram_chat_id;
  const telegramNotify = notify.telegram_notify !== undefined ? !!notify.telegram_notify : !!site.telegram_notify;

  // Auto-reset scheduler controls
  const autoReset = payload.autoReset && typeof payload.autoReset === "object" ? payload.autoReset : {};
  const autoResetEnabled = typeof autoReset.enabled === "boolean" ? autoReset.enabled : !!site.auto_reset_enabled;
  const autoResetClear = ["wagers", "players", "none"].includes(String(autoReset.clear).trim())
    ? String(autoReset.clear).trim()
    : (site.auto_reset_clear || "wagers");

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
    else if ((typeof br.logo === "string" && br.logo) || (br.logo && typeof br.logo === "object")) {
      const validated = validateLogoData(br.logo);
      if (validated.error) return { error: validated.error, code: "invalid_logo" };
      logoData = validated.dataUri;
    }
    const t = { text: themeObj.text };
    if (HEX.test(br.accentA || "")) t.accentA = br.accentA;
    if (HEX.test(br.accentB || "")) t.accentB = br.accentB;
    if (themeObj.template && themeObj.template !== "classic") t.template = themeObj.template;
    themeObj = t;
  }
  // Streamer-editable template text is available on every plan.
  if (br && br.text && typeof br.text === "object") {
    themeObj = { ...themeObj, text: br.text };
  }
  const themeJson = themeObj;

  // Invalidate this isolate's L1 cache before writing. There is no L2/KV, so
  // other live isolates keep stale entries until the 25s TTL expires.
  invalidateSiteCache(env, site.slug, uid, siteId);
  if (slugRename) invalidateSiteCache(env, slugRename);

  // Capture old top-3 for notifications
  const oldPlayers = await getPlayers(env, site.id);
  const oldTop3 = oldPlayers.slice().sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0)).slice(0, 3);

  const txResult = await withTransaction(async (tx) => {
    // QA-004 / C-07: Lock the site row and re-read updated_at inside the same
    // transaction so the optimistic concurrency check is authoritative.
    const locked = await tx.one(
      `SELECT id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at FROM sites WHERE id=$1 FOR UPDATE`,
      [site.id]
    );
    if (!locked) throw new Error("site not found");

    if (payload.expectedUpdatedAt) {
      const clientTime = new Date(payload.expectedUpdatedAt).getTime();
      const serverTime = new Date(locked.updated_at).getTime();
      if (clientTime !== serverTime) {
        return {
          error: "This board was modified by another session. Refresh and try again.",
          code: "concurrency_conflict",
          currentUpdatedAt: locked.updated_at,
        };
      }
    }

    const publishedVal = typeof payload.published === "boolean" ? payload.published : site.published;
    const endsAtVal = normalizeEndsAt(payload.endsAt, site.ends_at);
    const slugVal = slugRename || site.slug;
    const periodVal = VALID_PERIODS.includes(String(b.period || "Monthly").trim())
      ? String(b.period || "Monthly").trim()
      : (site.period || "Monthly");
    await tx.unsafe(
      `UPDATE sites SET slug=$1, name=$2, tagline=$3, casino=$4, code=$5, cta_url=$6, prize_pool=$7, period=$8, ends_at=$9, reset_note=$10, blurb=$11, extra_json=$12::jsonb, logo_data=$13, theme_json=$14::jsonb, published=$15, discord_webhook_url_enc=$16, telegram_chat_id=$17, telegram_notify=$18, auto_reset_enabled=$19, auto_reset_clear=$20, updated_at=now() WHERE id=$21`,
      [
        slugVal, siteName, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
        b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, periodVal,
        endsAtVal, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
        extra, logoData, themeJson, publishedVal, discordWebhookUrlEnc, telegramChatId, telegramNotify,
        autoResetEnabled, autoResetClear, site.id,
      ]
    );

    if (Array.isArray(payload.players)) {
      const validPlayers = payload.players.filter((p) => p && p.name && normalizePlayerName(p.name) !== "");
      // C-07: delete only players whose stable normalized name is not in the
      // new payload; upsert the rest instead of replacing every row.
      if (validPlayers.length > 0) {
        const keepNames = validPlayers.map((p) => normalizePlayerName(p.name));
        await tx.unsafe("DELETE FROM players WHERE site_id=$1 AND normalized_name <> ALL($2::text[])", [site.id, keepNames]);
      } else {
        await tx.unsafe("DELETE FROM players WHERE site_id=$1", [site.id]);
      }
      if (validPlayers.length > 0) {
        const cols = 13;
        const params = [];
        const valueRows = [];
        let idx = 1;
        validPlayers.forEach((p, i) => {
          const row = [];
          for (let c = 0; c < cols; c++) row.push(`$${idx++}`);
          valueRows.push(`(${row.join(",")})`);
          const wagered = Number(p.wagered) || 0;
          const prize = Number(p.prize) || 0;
          const score = Number.isNaN(Number(p.score)) ? wagered : Number(p.score);
          const hands = Number.isNaN(Number(p.hands)) ? 0 : Number(p.hands);
          const netProfit = Number.isNaN(Number(p.netProfit)) ? (prize - wagered) : Number(p.netProfit);
          const winRate = Number.isNaN(Number(p.winRate)) ? 0 : Number(p.winRate);
          const change = Number.isNaN(Number(p.change)) ? 0 : Number(p.change);
          params.push(
            crypto.randomUUID(), site.id, String(p.name).slice(0, 80), normalizePlayerName(p.name),
            wagered, prize, i, 1, score, hands, netProfit, winRate, change
          );
        });
        await tx.unsafe(
          `INSERT INTO players (id, site_id, name, normalized_name, wagered, prize, sort, version, score, hands, net_profit, win_rate, change) VALUES ${valueRows.join(",")}
           ON CONFLICT (site_id, normalized_name) DO UPDATE
           SET name = EXCLUDED.name,
               wagered = EXCLUDED.wagered,
               prize = EXCLUDED.prize,
               sort = EXCLUDED.sort,
               score = EXCLUDED.score,
               hands = EXCLUDED.hands,
               net_profit = EXCLUDED.net_profit,
               win_rate = EXCLUDED.win_rate,
               change = EXCLUDED.change,
               updated_at = now(),
               version = players.version + 1
           RETURNING id, name, wagered, prize, sort, version, score, hands, net_profit, win_rate, change`,
          params
        );
      }
    }
    return { ok: true };
  });
  if (txResult.error) return txResult;

  // Detect top-3 / rank changes and enqueue notifications for the consumer to
  // deliver. This keeps outbound Telegram/Discord calls off the saveSite request
  // thread and routes player DMs through the bot_id the player subscribed to.
  if (Array.isArray(payload.players) && typeof user === "object" && effectivePlan(user) !== "free") {
    try {
      const notifyQueue = createNotifyQueue(env);
      const newSorted = payload.players.filter((p) => p && p.name).sort((a, b2) => (b2.wagered || 0) - (a.wagered || 0));
      const top3Changes = detectTop3Changes(oldTop3, newSorted);
      if (top3Changes.length) {
        await notifyQueue.send({ type: "notify", kind: "top3", siteId: site.id, siteName, changes: top3Changes });
      }

      const subs = await query(
        `SELECT ps.tg_user_id, ps.player_name, ps.bot_id FROM player_subscriptions ps WHERE ps.site_id = $1`,
        [site.id]
      );
      if (subs && subs.length > 0) {
        const oldRankMap = new Map();
        (oldPlayers || []).forEach((p, i) => oldRankMap.set(p.name, i + 1));
        const newRankMap = new Map();
        newSorted.forEach((p, i) => newRankMap.set(p.name, i + 1));

        for (const sub of subs) {
          const playerName = sub.player_name;
          const oldRank = oldRankMap.get(playerName) ?? null;
          const newRank = newRankMap.get(playerName);
          if (!newRank) continue;
          if ((oldRank === null && newRank <= 20) || (oldRank !== null && oldRank !== newRank)) {
            await notifyQueue.send({
              type: "notify",
              kind: "player-rank",
              siteId: site.id,
              siteName,
              playerName,
              oldRank,
              newRank,
              botId: sub.bot_id,
              tgUserId: sub.tg_user_id,
            });
          }
        }
      }
    } catch (e) {
      console.error("[notify] notification enqueue failed:", String(e?.message || e));
    }
  }
  // Return updated site data including new timestamp for optimistic concurrency
  const updatedSite = await getBoardById(env, uid, site.id);

  // Build a concise list of what changed for the audit log
  const changes = [];
  if (slugRename) changes.push("slug");
  if (siteName !== site.name) changes.push("name");
  if (typeof payload.published === "boolean" && payload.published !== !!site.published) changes.push(payload.published ? "publish" : "unpublish");
  if (Array.isArray(payload.players)) changes.push(`players:${payload.players.filter((p) => p && p.name).length}`);
  const oldTheme = rawThemeObj && typeof rawThemeObj === "object" ? rawThemeObj : {};
  if (payload.branding) {
    const hadLogo = !!existingLogoRow?.logo_data;
    const hasLogo = !!logoData;
    if (br && br.logo !== undefined && hadLogo !== hasLogo) changes.push("logo");
    if (br && br.accentA && br.accentA !== (oldTheme.accentA || "")) changes.push("accentA");
    if (br && br.accentB && br.accentB !== (oldTheme.accentB || "")) changes.push("accentB");
    if (br && br.template && br.template !== (oldTheme.template || "classic")) changes.push("template");
  }
  if (payload.endsAt !== undefined) changes.push("ends_at");
  if (payload.customDomain !== undefined) changes.push("custom_domain");

  await logAudit({
    actorId: uid,
    action: "board_update",
    entityType: "site",
    entityId: site.id,
    request,
    details: {
      board_id: site.id,
      board_slug: slugRename || site.slug,
      slug_rename: slugRename || null,
      old_slug: slugRename ? site.slug : null,
      changes,
    },
  });

  return { ok: true, updatedAt: updatedSite?.updated_at, slug: updatedSite?.slug || slugRename || site.slug };
}

export async function deleteBoard(env, uid, siteId, request = null) {
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
  await logAudit({
    actorId: uid,
    action: "board_delete",
    entityType: "site",
    entityId: siteId,
    request,
    details: { board_id: siteId, board_slug: site.slug, remaining_boards: boards.length - 1 },
  });
  return { ok: true };
}

export async function setActiveBoard(env, uid, siteId, request = null) {
  const site = await getBoardById(env, uid, siteId);
  if (!site) return { error: "no site" };
  await exec("UPDATE users SET active_site_id=$1, updated_at=now() WHERE id=$2", [siteId, uid]);
  invalidateUserCache(env, uid);
  await logAudit({
    actorId: uid,
    action: "board_set_active",
    entityType: "site",
    entityId: siteId,
    request,
    details: { board_id: siteId, board_slug: site.slug },
  });
  return { ok: true };
}

export async function updateSiteTheme(env, user, payload = {}, request = null) {
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
  await logAudit({
    actorId: user.id,
    action: "theme_update",
    entityType: "site",
    entityId: site.id,
    request,
    details: { board_id: site.id, board_slug: site.slug, template: theme.template, accentA: theme.accentA, accentB: theme.accentB },
  });
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
