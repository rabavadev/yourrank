// Site + players data helpers for the Worker.
import { effectivePlan, PLAN_LIMITS } from "./billing.js";
import { query, one, getSql } from "./db.js";

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

const getBySlug = (env, slug) => one("SELECT * FROM sites WHERE slug=$1", [slug]);
const getByUser = (env, uid) => one("SELECT * FROM sites WHERE user_id=$1", [uid]);

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
  // snapshot_json is JSONB — already an array (or null). No parse.
  let top = Array.isArray(a.snapshot_json) ? a.snapshot_json : [];
  top = top.slice().sort((x, y) => (y.wagered || 0) - (x.wagered || 0)).slice(0, 3)
    .map((p) => ({ name: String(p.name || ""), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 }));
  return { label: a.label, at: a.created_at, top };
}

async function getArchives(env, siteId, limit = 6) {
  // created_at as epoch-ms so the frontend keeps rendering it with new Date(a.at).
  const rows = await query(
    `SELECT id, label, snapshot_json,
            (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at
       FROM archives WHERE site_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [siteId, limit]
  );
  return rows || [];
}

export function publicShape(site, players, archives = []) {
  // extra_json is JSONB — already a JS object (or null). No parse.
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
    branding: { hasLogo: !!site.logo_data, accentA: theme.accentA, accentB: theme.accentB },
    pastWinners: archives.map(archiveShape),
    players: players.map((p) => ({ name: p.name, wagered: p.wagered, prize: p.prize })),
  };
}

export async function getPublicSite(env, slug) {
  const site = await getBySlug(env, slug);
  if (!site || !site.published) return null;
  const owner = await one(
    "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1",
    [site.user_id]
  );
  if (owner && owner.status === "suspended") return { suspended: true };
  return { id: site.id, data: publicShape(site, await getPlayers(env, site.id), await getArchives(env, site.id)), plan: effectivePlan(owner) };
}

export async function getUserSite(env, uid) {
  const site = await getByUser(env, uid);
  if (!site) return null;
  const archives = await getArchives(env, site.id, 24);
  return {
    slug: site.slug, published: !!site.published,
    data: publicShape(site, await getPlayers(env, site.id), archives.slice(0, 6)),
    archives: archives.map((a) => {
      const n = Array.isArray(a.snapshot_json) ? a.snapshot_json.length : 0;
      return { id: a.id, label: a.label, at: a.created_at, players: n };
    }),
  };
}

// Close out the current period: snapshot the board, then optionally reset it.
export async function createArchive(env, uid, { label, clear } = {}) {
  const site = await getByUser(env, uid);
  if (!site) return { error: "no site" };
  const players = await getPlayers(env, site.id);
  if (!players.length) return { error: "Nothing to archive — the board is empty." };
  const count = await one("SELECT COUNT(*) n FROM archives WHERE site_id=$1", [site.id]);
  if ((Number(count?.n) || 0) >= 24) return { error: "Archive limit reached (24). Delete an old one first." };
  const lab = String(label || "").trim().slice(0, 60) ||
    new Date().toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  // snapshot_json is JSONB — pass a JSON string cast to jsonb.
  await query(
    "INSERT INTO archives (id,site_id,label,snapshot_json,created_at) VALUES ($1,$2,$3,$4::jsonb,now())",
    [crypto.randomUUID(), site.id, lab, JSON.stringify(players).slice(0, 200000)]
  );
  if (clear === "players") await query("DELETE FROM players WHERE site_id=$1", [site.id]);
  else if (clear === "wagers") await query("UPDATE players SET wagered=0 WHERE site_id=$1", [site.id]);
  return { ok: true, label: lab };
}

export async function deleteArchive(env, uid, id) {
  const site = await getByUser(env, uid);
  if (!site) return { error: "no site" };
  await query("DELETE FROM archives WHERE id=$1 AND site_id=$2", [String(id || ""), site.id]);
  return { ok: true };
}

export async function saveSite(env, user, payload) {
  const uid = typeof user === "string" ? user : user.id;
  const site = await getByUser(env, uid);
  if (!site) return { error: "no site" };
  // Plan gate: player count is the paid lever.
  if (typeof user === "object" && Array.isArray(payload.players)) {
    const plan = effectivePlan(user);
    const count = payload.players.filter((p) => p && p.name).length;
    if (count > PLAN_LIMITS[plan]) {
      return {
        error: plan === "pro"
          ? `Pro allows up to ${PLAN_LIMITS.pro} players.`
          : `Free plan allows up to ${PLAN_LIMITS.free} players. Upgrade to Pro for up to ${PLAN_LIMITS.pro}.`,
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
  });

  // Branding is a Pro feature; only apply when the caller is a Pro user object.
  // logo_data stays a TEXT column. theme_json is JSONB: existing value is a JS
  // object, new value is built here — always end up with a JSON string for the
  // ::jsonb cast below.
  let logoData = site.logo_data ?? "";
  let themeObj = (site.theme_json && typeof site.theme_json === "object") ? site.theme_json : {};
  const br = payload.branding;
  if (br && typeof user === "object" && effectivePlan(user) === "pro") {
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

  // Wrap all write operations in a transaction so that a crash between
  // DELETE and INSERTs cannot lose player data (DOM3-002) and batch the
  // INSERTs to avoid N+1 queries (PERF-001).
  await getSql().begin(async (tx) => {
    await tx.unsafe(
      `UPDATE sites SET name=$1, tagline=$2, casino=$3, code=$4, cta_url=$5, prize_pool=$6, period=$7, ends_at=$8, reset_note=$9, blurb=$10, extra_json=$11::jsonb, logo_data=$12, theme_json=$13::jsonb, updated_at=now() WHERE user_id=$14`,
      [
        b.name ?? site.name, b.tagline ?? site.tagline, b.casino ?? site.casino, b.code ?? site.code,
        b.ctaUrl ?? site.cta_url, b.prizePool ?? site.prize_pool, b.period ?? site.period,
        payload.endsAt ?? site.ends_at, b.resetNote ?? site.reset_note, (payload.partner && payload.partner.blurb) ?? site.blurb,
        extra, logoData, themeJson, uid,
      ]
    );
    if (Array.isArray(payload.players)) {
      await tx.unsafe("DELETE FROM players WHERE site_id=$1", [site.id]);
      // Batch INSERT: build a single multi-row INSERT instead of N individual queries.
      const validPlayers = payload.players.filter((p) => p && p.name);
      if (validPlayers.length > 0) {
        const cols = 6; // id, site_id, name, wagered, prize, sort
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
  return { ok: true };
}

export { getByUser };
