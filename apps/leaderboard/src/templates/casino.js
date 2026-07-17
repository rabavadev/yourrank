// Casino design pack — eight full-page, structurally distinct leaderboard designs.
// Each design owns its own header, hero, list and footer markup; nothing is shared.
import {
  composeArcade,
  composeCandy,
  composeFun,
  composeLeaderboard,
  composeLeaderboardV2,
  composePro,
  composeSpace,
  composeTropical,
  composeUnderwater,
  composeVip,
  composeWestern,
  CASINO_FULL_CSS,
} from "./casino-full.js";
import { CASINO_TEXT_DEFAULTS } from "./casino-text.js";

const PRESETS = {
  arcade: [
    { id: "neon", name: "Neon", accentA: "#39FF14", accentB: "#FF00FF" },
    { id: "cyber", name: "Cyber", accentA: "#00BFFF", accentB: "#FFD700" },
    { id: "pixel", name: "Pixel", accentA: "#FF00FF", accentB: "#00BFFF" },
  ],
  candy: [
    { id: "bubblegum", name: "Bubblegum", accentA: "#FF1493", accentB: "#FFE500" },
    { id: "mint", name: "Mint", accentA: "#00E676", accentB: "#FF85B3" },
    { id: "grape", name: "Grape", accentA: "#C084FC", accentB: "#FF1493" },
  ],
  fun: [
    { id: "party", name: "Party", accentA: "#FBBF24", accentB: "#EC4899" },
    { id: "berry", name: "Berry", accentA: "#EC4899", accentB: "#8B5CF6" },
    { id: "ocean", name: "Ocean", accentA: "#06B6D4", accentB: "#3B82F6" },
  ],
  space: [
    { id: "nebula", name: "Nebula", accentA: "#8B5CF6", accentB: "#F472B6" },
    { id: "cyan", name: "Cyan", accentA: "#22D3EE", accentB: "#3B82F6" },
    { id: "stellar", name: "Stellar", accentA: "#FFFBEB", accentB: "#F59E0B" },
  ],
  tropical: [
    { id: "sunset", name: "Sunset", accentA: "#FF6B35", accentB: "#00D4AA" },
    { id: "coral", name: "Coral", accentA: "#FFE66D", accentB: "#FF6B6B" },
    { id: "teal", name: "Teal", accentA: "#00D4AA", accentB: "#0D7377" },
  ],
  underwater: [
    { id: "deep", name: "Deep", accentA: "#00E5FF", accentB: "#FF6B9D" },
    { id: "reef", name: "Reef", accentA: "#39FF9C", accentB: "#00E5FF" },
    { id: "abyss", name: "Abyss", accentA: "#003344", accentB: "#00E5FF" },
  ],
  vip: [
    { id: "gold", name: "Gold", accentA: "#C9A84C", accentB: "#F5F5F0" },
    { id: "platinum", name: "Platinum", accentA: "#E5E7EB", accentB: "#C9A84C" },
    { id: "obsidian", name: "Obsidian", accentA: "#1A1A1A", accentB: "#C9A84C" },
  ],
  western: [
    { id: "saloon", name: "Saloon", accentA: "#F5A623", accentB: "#C0392B" },
    { id: "dust", name: "Dust", accentA: "#D4B886", accentB: "#8B6B3D" },
    { id: "whiskey", name: "Whiskey", accentA: "#8B4513", accentB: "#F5A623" },
  ],
  pro: [
    { id: "green", name: "Green", accentA: "#22C55E", accentB: "#0D1A0F" },
    { id: "amber", name: "Amber", accentA: "#F59E0B", accentB: "#0D1A0F" },
    { id: "mono", name: "Mono", accentA: "#E5E5E5", accentB: "#0D1A0F" },
  ],
  leaderboardV2: [
    { id: "cream", name: "Cream", accentA: "#C41E3A", accentB: "#FAF7F2" },
    { id: "ink", name: "Ink", accentA: "#000000", accentB: "#FAF7F2" },
    { id: "gold", name: "Gold", accentA: "#B8860B", accentB: "#FAF7F2" },
  ],
  leaderboard: [
    { id: "dark", name: "Dark", accentA: "#38bdf8", accentB: "#020617" },
    { id: "void", name: "Void", accentA: "#8B5CF6", accentB: "#020617" },
    { id: "ember", name: "Ember", accentA: "#F59E0B", accentB: "#020617" },
  ],
};

const FRAME_COLORS = {
  arcade: { bg: "#0D0D1A", text: "#FFFFFF", accent: "#39FF14", muted: "rgba(255,255,255,0.6)", hover: "#FFFFFF" },
  candy: { bg: "#FF85B3", text: "#FFFFFF", accent: "#FFE500", muted: "rgba(255,255,255,0.7)", hover: "#FFFFFF" },
  fun: { bg: "#6B21A8", text: "#FFFFFF", accent: "#FBBF24", muted: "rgba(255,255,255,0.7)", hover: "#FFFFFF" },
  space: { bg: "#080B1A", text: "#FFFFFF", accent: "#8B5CF6", muted: "rgba(255,255,255,0.6)", hover: "#FFFFFF" },
  tropical: { bg: "#FF6B35", text: "#FFFFFF", accent: "#00D4AA", muted: "rgba(255,255,255,0.7)", hover: "#FFFFFF" },
  underwater: { bg: "#003344", text: "#E0F7FA", accent: "#00E5FF", muted: "rgba(224,247,250,0.7)", hover: "#FFFFFF" },
  vip: { bg: "#0A0A0A", text: "#F5F5F0", accent: "#C9A84C", muted: "rgba(245,245,240,0.6)", hover: "#FFFFFF" },
  western: { bg: "#3D1A00", text: "#FFF8E7", accent: "#F5A623", muted: "rgba(245,248,231,0.6)", hover: "#FFFFFF" },
  pro: { bg: "#0D1A0F", text: "#E5E5E5", accent: "#22C55E", muted: "#6B7280", hover: "#FFFFFF" },
  leaderboardV2: { bg: "#FAF7F2", text: "#000000", accent: "#C41E3A", muted: "rgba(0,0,0,0.6)", hover: "#000000" },
  leaderboard: { bg: "#020617", text: "#F8FAFC", accent: "#38bdf8", muted: "#94A3B8", hover: "#FFFFFF" },
};

export function frameCss(tpl) {
  const c = FRAME_COLORS[tpl];
  if (!c) return "";
  const s = (hex) => `${hex}40`;
  return `body[data-template="${tpl}"]{background-color:${c.bg}}
body[data-template="${tpl}"] .site-header--full{background-color:${c.bg};color:${c.text};border-bottom:1px solid ${s(c.accent)};display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;font-family:'Inter',system-ui,sans-serif;position:relative;z-index:999}
body[data-template="${tpl}"] .site-header--full__brand{display:flex;align-items:center;gap:.75rem;font-weight:800;font-size:1.1rem;text-decoration:none;color:${c.text}}
body[data-template="${tpl}"] .site-header--full__brand img{height:28px;width:auto;border-radius:6px}
body[data-template="${tpl}"] .site-header--full__nav a{color:${c.accent};text-decoration:none;margin-left:1.25rem;font-size:.875rem;font-weight:600}
body[data-template="${tpl}"] .site-header--full__nav a:hover{color:${c.hover}}
body[data-template="${tpl}"] .site-footer--full{background-color:${c.bg};color:${c.text};border-top:1px solid ${s(c.accent)};padding:2rem 1.5rem;text-align:center;position:relative;z-index:10}
body[data-template="${tpl}"] .site-footer--full__brand{display:block;font-weight:800;font-size:1.2rem;margin-bottom:.25rem}
body[data-template="${tpl}"] .site-footer--full__tag{display:block;font-size:.85rem;color:${c.muted};margin-bottom:1rem}
body[data-template="${tpl}"] .site-footer--full__fine,body[data-template="${tpl}"] .site-footer--full__copy{color:${c.muted};font-size:.78rem;line-height:1.6;margin:.5rem 0}
body[data-template="${tpl}"] .site-footer--full__links{margin:1rem 0}
body[data-template="${tpl}"] .site-footer--full__links a{color:${c.accent};text-decoration:none;margin:0 .75rem;font-size:.875rem;font-weight:600}
body[data-template="${tpl}"] .site-footer--full__links a:hover{color:${c.hover}}
body[data-template="${tpl}"] .legal-page{min-height:100vh;display:flex;flex-direction:column}
body[data-template="${tpl}"] .legal-page__wrap{flex:1;max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 4rem;color:${c.text};font-family:'Inter',system-ui,sans-serif;line-height:1.65}
body[data-template="${tpl}"] .legal-page__wrap h1{font-size:2rem;margin:0 0 .25rem;letter-spacing:-.02em}
body[data-template="${tpl}"] .legal-page__wrap h2{font-size:1.1rem;margin:1.75rem 0 .5rem}
body[data-template="${tpl}"] .legal-page__wrap p{margin:.75rem 0;color:${c.muted}}
body[data-template="${tpl}"] .legal-page__wrap a{color:${c.accent}}
body[data-template="${tpl}"] .legal-page__wrap a:hover{color:${c.hover}}
body[data-template="${tpl}"] .legal-page__updated{font-size:.85rem;color:${c.muted};margin-bottom:1.5rem}
body[data-template="${tpl}"] .legal-page__back{display:inline-flex;align-items:center;gap:.5rem;margin-top:2rem;color:${c.accent};text-decoration:none;font-weight:600}
body[data-template="${tpl}"] .legal-page__back:hover{color:${c.hover}}`;
}

const METAS = {
  arcade: { name: "Casino Arcade", description: "Retro 8-bit arcade: neon grid, pixel font, and glowing blocks." },
  candy: { name: "Casino Candy", description: "Sweet candy theme with soft pinks, yellows, and a bouncy vibe." },
  fun: { name: "Casino Fun", description: "Bold purple and gold party energy with rounded cards." },
  space: { name: "Casino Space", description: "Deep galaxy rankings with Orbitron type and starfield glows." },
  tropical: { name: "Casino Tropical", description: "Sunset-to-ocean gradients with a breezy script header." },
  underwater: { name: "Casino Underwater", description: "Deep-sea leaderboard with cyan, pink, and bubbly edges." },
  vip: { name: "Casino VIP", description: "Full-page black-and-gold members list with elegant serif type." },
  western: { name: "Casino Western", description: "Wild west saloon board with wood grain, gold, and sheriff stars." },
  pro: { name: "Casino Pro", description: "Poker-style data table with hands, win-rate bars, and net-profit deltas." },
  leaderboardV2: { name: "Editorial Standings", description: "Magazine-style light leaderboard with serif headlines and score bars." },
  leaderboard: { name: "Cyber Standings", description: "Dark shadcn podium and list with animated cards and glow effects." },
};

export const CASINO_TEMPLATES = Object.fromEntries(
  Object.keys(METAS).map((id) => [
    id,
    {
      id,
      name: METAS[id].name,
      description: METAS[id].description,
      css: CASINO_FULL_CSS[id],
      presets: PRESETS[id],
      textDefaults: CASINO_TEXT_DEFAULTS[id] || {},
    },
  ])
);

export const CASINO_COMPOSERS = {
  arcade: composeArcade,
  candy: composeCandy,
  fun: composeFun,
  space: composeSpace,
  tropical: composeTropical,
  underwater: composeUnderwater,
  vip: composeVip,
  western: composeWestern,
  pro: composePro,
  leaderboardV2: composeLeaderboardV2,
  leaderboard: composeLeaderboard,
};

export const CASINO_FULL = new Set(Object.keys(CASINO_COMPOSERS));

export { CASINO_TEXT_DEFAULTS };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Replace default text strings in a full-page template with streamer overrides.
export function applyCasinoText(html, templateId, overrides = {}) {
  const defaults = CASINO_TEXT_DEFAULTS[templateId] || {};
  const keys = Object.keys(defaults).sort((a, b) => (defaults[b]?.length || 0) - (defaults[a]?.length || 0));
  for (const key of keys) {
    const original = defaults[key];
    const replacement = overrides[key];
    if (replacement !== undefined && replacement !== original) {
      html = html.split(original).join(esc(replacement));
    }
  }
  return html;
}
