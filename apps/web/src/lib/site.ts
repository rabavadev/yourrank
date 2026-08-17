// @ts-nocheck
// Public site data layer for apps/web.
// Mirrors the shape produced by apps/leaderboard/src/site.js for use by
// site-render.ts. Queries Postgres directly via packages/shared/db.

import { query, one } from "@yourrank/shared/db";
import { effectivePlan } from "@yourrank/shared/plans";
import { verifyBoardPasswordCookie } from "./board-password";

function normalizePlayerName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const SITE_COLUMNS = `id, user_id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, is_draft, theme_json, updated_at, published_at, custom_domain, domain_status, discord_webhook_url_enc, telegram_chat_id, telegram_notify, auto_reset_enabled, auto_reset_clear, auto_reset_last_run_at, password_hash, password_salt, viewer_kick_auth_enabled, viewer_discord_auth_enabled, viewer_public_redeem_enabled, games_enabled, shop_enabled, credits_enabled, (logo_data IS NOT NULL AND logo_data != '') AS has_logo`;

const DEFAULT_EXTRA = {
  chips: [],
  whyStats: [],
  rules: [
    "Leaderboard resets automatically each period.",
    "Scores update instantly when posted via the dashboard or API.",
    "Prizes are set by the board owner and displayed for entertainment.",
  ],
  socials: [
    { name: "Discord", handle: "Join the community", action: "Join", url: "#", brand: "discord", enabled: false },
    { name: "Kick", handle: "Watch live", action: "Follow", url: "#", brand: "kick", enabled: false },
    { name: "Twitch", handle: "Watch live", action: "Follow", url: "#", brand: "twitch", enabled: false },
    { name: "YouTube", handle: "Watch videos", action: "Subscribe", url: "#", brand: "youtube", enabled: false },
    { name: "X", handle: "Latest updates", action: "Follow", url: "#", brand: "x", enabled: false },
  ],
  sections: {
    hero: true,
    leaderboard: true,
    top3: true,
    search: true,
    rules: true,
    partner: true,
    socials: true,
    share: true,
    pastWinners: true,
    countdown: true,
    cta: true,
    payouts: true,
    poweredBy: false,
  },
  playerFields: {
    score: true,
    hands: true,
    netProfit: true,
    winRate: true,
    change: true,
  },
  legal: {
    terms: "",        termsEnabled: false,
    privacy: "",      privacyEnabled: false,
    responsible: "",  responsibleEnabled: false,
    cookies: "",      cookiesEnabled: false,
    refund: "",       refundEnabled: false,
    contact: "",      contactEnabled: false,
  },
};

const DEFAULT_PRIZES = {
  prizePoolLabel: "Prize pool",
  countdownLabel: "",
  currency: "$",
  hidePrizeAmounts: false,
  payoutsLabel: "Payouts",
  wagerLabel: "Wagered",
  prizeLabel: "Prize",
  wagerTotalLabel: "Wager total",
};

const PRIZE_LABEL_MAX = 40;
const CURRENCY_MAX = 6;

function parsePrizes(rawPrizes) {
  const raw = (rawPrizes && typeof rawPrizes === "object") ? rawPrizes : {};
  return {
    prizePoolLabel:  String(raw.prizePoolLabel  || DEFAULT_PRIZES.prizePoolLabel).slice(0, PRIZE_LABEL_MAX),
    countdownLabel:  String(raw.countdownLabel  || DEFAULT_PRIZES.countdownLabel).slice(0, PRIZE_LABEL_MAX),
    currency:        String(raw.currency        || DEFAULT_PRIZES.currency).slice(0, CURRENCY_MAX),
    hidePrizeAmounts: raw.hidePrizeAmounts === true,
    payoutsLabel:    String(raw.payoutsLabel    || DEFAULT_PRIZES.payoutsLabel).slice(0, PRIZE_LABEL_MAX),
    wagerLabel:      String(raw.wagerLabel      || DEFAULT_PRIZES.wagerLabel).slice(0, PRIZE_LABEL_MAX),
    prizeLabel:      String(raw.prizeLabel      || DEFAULT_PRIZES.prizeLabel).slice(0, PRIZE_LABEL_MAX),
    wagerTotalLabel: String(raw.wagerTotalLabel || DEFAULT_PRIZES.wagerTotalLabel).slice(0, PRIZE_LABEL_MAX),
  };
}

export const FONT_FAMILIES = {
  Inter:              "'Inter', system-ui, -apple-system, sans-serif",
  Oswald:             "'Oswald', system-ui, sans-serif",
  "Playfair Display": "'Playfair Display', Georgia, serif",
  Rajdhani:           "'Rajdhani', system-ui, sans-serif",
  "Bebas Neue":       "'Bebas Neue', system-ui, sans-serif",
};
export const FONT_KEYS = Object.keys(FONT_FAMILIES);

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const VALID_TEMPLATES = ["cyber_arcade", "esports_pro", "creator_glass", "classic"];

export function fromJsonb(value) {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

function parseTheme(site) {
  const raw = fromJsonb(site.theme_json);
  const t = (raw && typeof raw === "object") ? raw : {};
  const font = FONT_KEYS.includes(t.font) ? t.font : "Inter";
  const template = VALID_TEMPLATES.includes(t.template)
    ? (t.template === "classic" ? "cyber_arcade" : t.template)
    : "cyber_arcade";
  const prizes = parsePrizes((t.prizes && typeof t.prizes === "object") ? t.prizes : {});
  return {
    template,
    accentA: HEX.test(t.accentA || "") ? t.accentA : null,
    accentB: HEX.test(t.accentB || "") ? t.accentB : null,
    options: {},
    font,
    prizes,
  };
}

export function archiveShape(a) {
  const top = fromJsonb(a.top3_json);
  const players = Array.isArray(top) ? top : [];
  return { label: a.label, at: a.created_at, top: players };
}

export function playerStreak(player, currentRank, archives) {
  if (currentRank !== 0) return 0;
  const name = normalizePlayerName(player.name);
  let streak = 1;
  for (const a of archives) {
    if (normalizePlayerName(a.winner_name) !== name) break;
    streak++;
  }
  return streak;
}

export const ARCHIVE_LIMITS = { free: 6, starter: 6, pro: 24, agency: 999 };
export const PUBLIC_ARCHIVE_LIMIT = 24;

export async function getArchives(siteId, limit = 6) {
  const rows = await query(
    `SELECT id, label, top3_json, winner_name,
            (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at
       FROM archives WHERE site_id=$1 ORDER BY created_at DESC LIMIT $2`,
    [siteId, limit]
  );
  return rows || [];
}

export async function getPlayers(siteId, options = {}) {
  const limit = Math.min(10000, Math.max(1, Number(options.limit) || 10000));
  const offset = Math.max(0, Number(options.offset) || 0);
  const search = String(options.search || "").trim().toLowerCase().replace(/\s+/g, " ");
  const sql = search
    ? `WITH matches AS MATERIALIZED (
         SELECT id, name, normalized_name, wagered, prize, score, hands, net_profit, win_rate, change
           FROM players
          WHERE site_id=$1 AND normalized_name LIKE '%' || $2 || '%'
          ORDER BY wagered DESC, id ASC
          LIMIT 10000
       ), page AS (
         SELECT *
           FROM matches
          ORDER BY wagered DESC, id ASC
          LIMIT $3 OFFSET $4
       )
       SELECT name, wagered, prize, score, hands, net_profit, win_rate, change,
              (SELECT count(*) FROM players better
                WHERE better.site_id=$1
                  AND (better.wagered > page.wagered
                    OR (better.wagered = page.wagered AND better.id < page.id)))::int + 1 AS rank
         FROM page
        ORDER BY wagered DESC, id ASC`
    : `SELECT name, wagered, prize, score, hands, net_profit, win_rate, change, rank
         FROM (
           SELECT name, normalized_name, wagered, prize, score, hands, net_profit, win_rate, change,
                  ROW_NUMBER() OVER (ORDER BY wagered DESC, id ASC)::int AS rank
             FROM (
               SELECT id, name, normalized_name, wagered, prize, score, hands, net_profit, win_rate, change
                 FROM players
                WHERE site_id=$1
                ORDER BY wagered DESC, id ASC
                LIMIT 10000
             ) bounded
         ) ranked
        WHERE ($2 = '' OR normalized_name LIKE '%' || $2 || '%')
        ORDER BY rank
        LIMIT $3 OFFSET $4`;
  const rows = await query(sql, [siteId, search, limit, offset]);
  return rows || [];
}

export async function getPlayerCount(siteId, search = "") {
  const normalizedSearch = String(search || "").trim().toLowerCase().replace(/\s+/g, " ");
  const row = await one(
    "SELECT count(*)::int AS count FROM players WHERE site_id=$1 AND ($2 = '' OR normalized_name LIKE '%' || $2 || '%')",
    [siteId, normalizedSearch]
  );
  return Number(row?.count) || 0;
}

export function publicShape(site, players, archives = [], hasLogo = false, playerCount = null) {
  const rawExtra = fromJsonb(site.extra_json);
  const extra = (rawExtra && typeof rawExtra === "object") ? rawExtra : {};
  const m = { ...DEFAULT_EXTRA, ...extra };
  const theme = parseTheme(site);
  const brand = {
    name: site.name, tagline: site.tagline, code: site.code,
    prizePool: site.prize_pool, period: site.period, casino: site.casino,
    ctaUrl: site.cta_url, resetNote: site.reset_note,
    currency: theme.prizes.currency,
    hidePrizeAmounts: theme.prizes.hidePrizeAmounts,
    prizePoolLabel: theme.prizes.prizePoolLabel,
    countdownLabel: theme.prizes.countdownLabel,
    payoutsLabel: theme.prizes.payoutsLabel,
  };
  return {
    brand,
    prizes: { ...theme.prizes },
    endsAt: site.ends_at,
    partner: { blurb: site.blurb, chips: m.chips },
    whyStats: m.whyStats, rules: m.rules, socials: (m.socials || []).filter(s => s.enabled !== false),
    branding: { hasLogo, accentA: theme.accentA, accentB: theme.accentB, template: theme.template, text: theme.text, font: theme.font, options: theme.options },
    pastWinners: archives.map(archiveShape),
    playerCount: Number.isFinite(Number(playerCount)) ? Number(playerCount) : players.length,
    players: players.map((p, i) => ({
      name: p.name,
      wagered: p.wagered,
      prize: p.prize,
      score: p.score,
      hands: p.hands,
      netProfit: p.net_profit,
      winRate: p.win_rate,
      change: p.change,
      rank: Number(p.rank) || i + 1,
      streak: playerStreak(p, i, archives),
    })),
    sections: m.sections || DEFAULT_EXTRA.sections,
    siteSections: {
      home: true,
      leaderboard: true,
      shop: !!site.shop_enabled,
      games: !!site.games_enabled,
      me: !!site.credits_enabled,
    },
    legal: m.legal || DEFAULT_EXTRA.legal,
    playerFields: { ...DEFAULT_EXTRA.playerFields, ...(m.playerFields || {}) },
  };
}

export async function getSiteBySlug(slug: string): Promise<any> {
  return one(`SELECT ${SITE_COLUMNS} FROM sites WHERE slug=$1`, [slug]);
}

async function getBySlug(slug: string): Promise<any> {
  return getSiteBySlug(slug);
}

export async function getPublicSite(
  slug: string,
  request: Request | null = null,
  playerOptions: any = null,
): Promise<any> {
  if (slug === "demo") {
    return getDemoPublicSite();
  }

  const site = await getBySlug(slug);
  if (!site || !site.published) return null;

  if (site.password_hash && !(request && await verifyBoardPasswordCookie(request, site))) {
    return { requiresPassword: true, id: site.id, slug: site.slug, name: site.name, passwordHash: site.password_hash, passwordSalt: site.password_salt };
  }

  const owner = await one(
    "SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status, email_verified FROM users WHERE id=$1",
    [site.user_id]
  );
  if (owner && owner.status === "suspended") return { suspended: true };
  if (owner && !owner.email_verified) return { suspended: true, pendingVerification: true };

  const plan = effectivePlan(owner);
  const archiveLimit = Math.min(ARCHIVE_LIMITS[plan] || 6, PUBLIC_ARCHIVE_LIMIT);

  const boundedPlayers = playerOptions && Number.isFinite(Number(playerOptions.limit));
  const totalCountPromise = boundedPlayers ? getPlayerCount(site.id) : Promise.resolve(null);
  const matchCountPromise = boundedPlayers && String(playerOptions.search || "").trim()
    ? getPlayerCount(site.id, playerOptions.search)
    : totalCountPromise;

  const [players, playerCount, playerMatchCount, archives] = await Promise.all([
    getPlayers(site.id, boundedPlayers ? playerOptions : undefined),
    totalCountPromise,
    matchCountPromise,
    getArchives(site.id, archiveLimit),
  ]);

  const data = publicShape(site, players, archives, !!site.has_logo, playerCount);
  if (boundedPlayers) data.playerMatchCount = playerMatchCount;

  return {
    id: site.id,
    userId: site.user_id,
    published: !!site.published,
    isDraft: !!site.is_draft,
    data,
    plan,
    boards: [],
    botUsername: null,
    viewerKickAuthEnabled: !!site.viewer_kick_auth_enabled,
    viewerDiscordAuthEnabled: !!site.viewer_discord_auth_enabled,
    viewerPublicRedeemEnabled: !!site.viewer_public_redeem_enabled,
  };
}

function getDemoPublicSite() {
  const data = {
    brand: {
      name: "Demo Challenge",
      casino: "",
      code: "",
      ctaUrl: "",
      prizePool: "500 points",
      period: "Monthly",
      tagline: "A sample community challenge for any streamer.",
      resetNote: "",
      blurb: "This is a demo board. Create your own and replace these players with your community.",
      currency: "pts ",
      hidePrizeAmounts: false,
      prizePoolLabel: "Reward pool",
      countdownLabel: "",
      payoutsLabel: "Payouts",
    },
    prizes: {
      prizePoolLabel: "Reward pool",
      currency: "pts ",
      payoutsLabel: "Payouts",
      wagerLabel: "Score",
      prizeLabel: "Reward",
      wagerTotalLabel: "Total Score",
      countdownLabel: "",
      hidePrizeAmounts: false,
    },
    branding: { hasLogo: false, accentA: null, accentB: null, template: "cyber_arcade", text: "", font: "Inter", options: {} },
    players: [
      { name: "Alex", wagered: 9500, prize: 250, score: null, hands: null, netProfit: null, winRate: null, change: null, rank: 1, streak: 0 },
      { name: "Bree", wagered: 7200, prize: 150, score: null, hands: null, netProfit: null, winRate: null, change: null, rank: 2, streak: 0 },
      { name: "Casey", wagered: 5400, prize: 100, score: null, hands: null, netProfit: null, winRate: null, change: null, rank: 3, streak: 0 },
      { name: "Drew", wagered: 3100, prize: 0, score: null, hands: null, netProfit: null, winRate: null, change: null, rank: 4, streak: 0 },
      { name: "Ellis", wagered: 1800, prize: 0, score: null, hands: null, netProfit: null, winRate: null, change: null, rank: 5, streak: 0 },
    ],
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    partner: { blurb: "", chips: [] },
    whyStats: [],
    rules: [
      "Leaderboard resets automatically each period.",
      "Scores update instantly when posted via the dashboard or API.",
      "Rewards are set by the board owner and displayed for entertainment.",
    ],
    socials: [],
    pastWinners: [],
    playerCount: 5,
    sections: DEFAULT_EXTRA.sections,
    siteSections: { home: true, leaderboard: true, shop: true, games: false, me: true },
    legal: DEFAULT_EXTRA.legal,
    playerFields: DEFAULT_EXTRA.playerFields,
  };
  return {
    id: "demo",
    userId: null,
    published: true,
    isDraft: false,
    data,
    plan: "pro",
    boards: [],
    botUsername: null,
    viewerKickAuthEnabled: false,
    viewerDiscordAuthEnabled: false,
    viewerPublicRedeemEnabled: false,
  };
}
