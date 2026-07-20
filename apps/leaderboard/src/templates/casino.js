// Casino design pack — five full-page, structurally distinct leaderboard designs.
// Each design owns its own header, hero, list and footer markup; nothing is shared.
// Removed 7 broken/duplicate templates (tropical, underwater, western, vip, pro,
// leaderboardV2, leaderboard) that overlapped with CSS-skin templates and had
// broken layouts (no t-row hooks, fixed w-1/3 podiums, hardcoded stats, inert tabs).
import {
  composeArcade,
  composeCandy,
  composeFun,
  composeSpace,
  CASINO_FULL_CSS as BASE_CASINO_CSS,
} from "./casino-full.js";
import { composeHighRollers, HIGH_ROLLERS_CSS } from "./casino-high-rollers.js";
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
  highRollers: [
    { id: "gold", name: "Gold", accentA: "#c9a84c", accentB: "#8b5cf6" },
    { id: "midnight", name: "Midnight", accentA: "#5b8def", accentB: "#080b14" },
    { id: "ruby", name: "Ruby", accentA: "#ef4444", accentB: "#0a0f1a" },
  ],
};

const FRAME_COLORS = {
  arcade: { bg: "#0D0D1A", text: "#FFFFFF", accent: "#39FF14", muted: "rgba(255,255,255,0.6)", hover: "#FFFFFF" },
  candy: { bg: "#FF85B3", text: "#FFFFFF", accent: "#FFE500", muted: "rgba(255,255,255,0.7)", hover: "#FFFFFF" },
  fun: { bg: "#6B21A8", text: "#FFFFFF", accent: "#FBBF24", muted: "rgba(255,255,255,0.7)", hover: "#FFFFFF" },
  space: { bg: "#080B1A", text: "#FFFFFF", accent: "#8B5CF6", muted: "rgba(255,255,255,0.6)", hover: "#FFFFFF" },
  highRollers: { bg: "#080b14", text: "#f0f0f5", accent: "#c9a84c", muted: "rgba(240,240,245,0.65)", hover: "#ffffff" },
};

export function frameCss(tpl, font = "Inter") {
  const c = FRAME_COLORS[tpl];
  if (!c) return "";
  const s = (hex) => `${hex}40`;
  return `body[data-template="${tpl}"]{background-color:${c.bg}}
body[data-template="${tpl}"] .site-header--full{background-color:${c.bg};color:${c.text};border-bottom:1px solid ${s(c.accent)};display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;font-family:${font},system-ui,sans-serif;position:relative;z-index:999}
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
body[data-template="${tpl}"] .legal-page__wrap{flex:1;max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 4rem;color:${c.text};font-family:${font},system-ui,sans-serif;line-height:1.65}
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
  arcade:        { name: "Casino Arcade",       description: "Retro 8-bit arcade: neon grid, pixel font, and glowing blocks.",                    vibe: "retro",   featured: true  },
  candy:         { name: "Casino Candy",        description: "Sweet candy theme with soft pinks, yellows, and a bouncy vibe.",                    vibe: "fun",     featured: false },
  fun:           { name: "Casino Fun",          description: "Bold purple and gold party energy with rounded cards.",                              vibe: "fun",     featured: false },
  space:         { name: "Casino Space",        description: "Deep galaxy rankings with Orbitron type and starfield glows.",                       vibe: "retro",   featured: true  },
  highRollers:   { name: "High Rollers",        description: "Luxury dark casino leaderboard with hero, stats cards, podium and full standings.", vibe: "luxury",  featured: true  },
};

const CASINO_FULL_CSS = { ...BASE_CASINO_CSS, highRollers: HIGH_ROLLERS_CSS };

export const CASINO_TEMPLATES = Object.fromEntries(
  Object.keys(METAS).map((id) => [
    id,
    {
      id,
      name: METAS[id].name,
      description: METAS[id].description,
      vibe: METAS[id].vibe,
      featured: METAS[id].featured,
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
  highRollers: composeHighRollers,
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
