// Registry of public-page templates, layered on top of /assets/leaderboard.css.
// All templates share the SAME markup and data-* hooks, so leaderboard.js
// (countdown, rows, top3, socials, postback live updates) works unchanged.
// Most templates are colour/typography skins; the "layout" templates
// (podium/broadcast/cards/arena) and the reference-based set
// (quest/vault/tournament/champion/terminal/rewards/amber/copper) additionally
// rearrange the shared blocks via CSS grid/flex for genuinely different page
// compositions.
// The chosen template id is stored in sites.theme_json.template and reaches
// the renderer via data.branding.template.
import { QUEST_CSS } from "./quest.js";
import { VAULT_CSS } from "./vault.js";
import { TOURNAMENT_CSS } from "./tournament.js";
import { CHAMPION_CSS } from "./champion.js";
import { TERMINAL_CSS } from "./terminal.js";
import { REWARDS_CSS } from "./rewards.js";
import { AMBER_CSS } from "./amber.js";
import { COPPER_CSS } from "./copper.js";
import { SPONSOR_CSS } from "./sponsor.js";
import { CASINO_TEMPLATES } from "./casino.js";

export const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Purple night with a clean cyan glow.",
    css: "",
    presets: [
      { id: "purplenight", name: "Purple Night", accentA: "#06b6d4", accentB: "#a855f7" },
      { id: "electric", name: "Electric", accentA: "#5ad9ff", accentB: "#7b8cff" },
      { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
      { id: "emerald", name: "Emerald", accentA: "#3cf2b1", accentB: "#35a7ff" },
      { id: "gold", name: "Gold", accentA: "#ffd15c", accentB: "#ff9f43" },
      { id: "signal", name: "Signal", accentA: "#3b82ff", accentB: "#38e1c6" },
      { id: "ember", name: "Ember", accentA: "#ff5f6d", accentB: "#ffc371" },
      { id: "grape", name: "Grape", accentA: "#a855f7", accentB: "#ff5fae" },
      { id: "reef", name: "Reef", accentA: "#42e6ff", accentB: "#ff5fae" },
      { id: "lime", name: "Lime", accentA: "#cdff1f", accentB: "#72ff3d" },
      { id: "redline", name: "Redline", accentA: "#ff3b3b", accentB: "#ff7a1a" },
      { id: "ice", name: "Ice", accentA: "#7de8ff", accentB: "#4c68ff" },
    ],
  },
  quest: {
    id: "quest",
    name: "Quest Light",
    description: "Light app-style page: compact header with info chips, standings first.",
    css: QUEST_CSS,
    presets: [
      { id: "sky", name: "Sky", accentA: "#2f6bff", accentB: "#00b3a4" },
      { id: "grape", name: "Grape", accentA: "#7c5cff", accentB: "#ff5fae" },
      { id: "leaf", name: "Leaf", accentA: "#10b981", accentB: "#2f6bff" },
    ],
  },
  vault: {
    id: "vault",
    name: "Prize Vault",
    description: "Split hero with a boxed prize-pool race card, stat strip, gold podium.",
    css: VAULT_CSS,
    presets: [
      { id: "gold", name: "Gold", accentA: "#ffd15c", accentB: "#f0a93a" },
      { id: "emerald", name: "Emerald", accentA: "#4bd48a", accentB: "#2f9d67" },
      { id: "ruby", name: "Ruby", accentA: "#ff8aa0", accentB: "#d92f5a" },
    ],
  },
  tournament: {
    id: "tournament",
    name: "Tournament",
    description: "Countdown-first: a giant race clock hero, trophy top 3, numbered list.",
    css: TOURNAMENT_CSS,
    presets: [
      { id: "signal", name: "Signal", accentA: "#4fc3f7", accentB: "#3b82f6" },
      { id: "lime", name: "Lime", accentA: "#a3e635", accentB: "#22c55e" },
      { id: "flare", name: "Flare", accentA: "#ff9f43", accentB: "#ff5f6d" },
    ],
  },
  champion: {
    id: "champion",
    name: "Champion Stage",
    description: "Broadcast banner hero with prize facts, then a stepped pedestal stage.",
    css: CHAMPION_CSS,
    presets: [
      { id: "gold", name: "Gold", accentA: "#f4c85a", accentB: "#f0972f" },
      { id: "violet", name: "Violet", accentA: "#8b6bff", accentB: "#42e6ff" },
      { id: "mint", name: "Mint", accentA: "#42e6a4", accentB: "#16a6d9" },
    ],
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "The whole board inside a terminal window: prompt lines, dense table.",
    css: TERMINAL_CSS,
    presets: [
      { id: "matrix", name: "Matrix", accentA: "#39d98a", accentB: "#2fae6e" },
      { id: "amber", name: "Amber", accentA: "#e8c14c", accentB: "#c8871c" },
      { id: "ice", name: "Ice", accentA: "#5ad9ff", accentB: "#3b82f6" },
    ],
  },
  rewards: {
    id: "rewards",
    name: "Rewards",
    description: "One centered treasure card holds prize, clock and CTA; pedestals below.",
    css: REWARDS_CSS,
    presets: [
      { id: "violet", name: "Violet", accentA: "#7c5cff", accentB: "#4aa0ff" },
      { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
      { id: "reef", name: "Reef", accentA: "#42e6ff", accentB: "#7c5cff" },
    ],
  },
  amber: {
    id: "amber",
    name: "Amber Arena",
    description: "Two-column: sticky rail with prize, clock and code; standings beside it.",
    css: AMBER_CSS,
    presets: [
      { id: "amber", name: "Amber", accentA: "#ffb84d", accentB: "#ff8a1e" },
      { id: "ember", name: "Ember", accentA: "#ff6a4d", accentB: "#ffb347" },
      { id: "sun", name: "Sun", accentA: "#ffd15c", accentB: "#ff9f43" },
    ],
  },
  copper: {
    id: "copper",
    name: "Copper Glow",
    description: "Winners' gallery: the podium is the hero centerpiece, quiet ledger below.",
    css: COPPER_CSS,
    presets: [
      { id: "copper", name: "Copper", accentA: "#f0a95a", accentB: "#d1702a" },
      { id: "rose", name: "Rose", accentA: "#ff9a8b", accentB: "#d1702a" },
      { id: "brass", name: "Brass", accentA: "#f0b45a", accentB: "#b8862c" },
    ],
  },
  sponsor: {
    id: "sponsor",
    name: "Sponsor Stage",
    description: "Left-aligned campaign layout with sponsor ticker accent.",
    css: SPONSOR_CSS,
    presets: [
      { id: "flame", name: "Flame", accentA: "#ff4d4d", accentB: "#ff9f43" },
      { id: "neon", name: "Neon", accentA: "#00ffd1", accentB: "#ff4d4d" },
      { id: "amber", name: "Amber", accentA: "#ffc857", accentB: "#ff9f43" },
    ],
  },
  ...CASINO_TEMPLATES,
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const validTemplate = (id) => (Object.hasOwn(TEMPLATES, id) ? id : "classic");
export const templateCss = (id) => TEMPLATES[validTemplate(id)].css;
export const templateCatalog = () => TEMPLATE_IDS.map((id) => ({
  id: TEMPLATES[id].id,
  name: TEMPLATES[id].name,
  description: TEMPLATES[id].description,
  presets: TEMPLATES[id].presets,
  vibe: TEMPLATES[id].vibe,
  featured: TEMPLATES[id].featured,
  textDefaults: TEMPLATES[id].textDefaults || {},
}));

// ── Contrast validation gate ──────────────────────────────────────────
// Runs at module load. Scans each template's CSS for --ink* on --bg/--panel
// pairs and flags WCAG AA failures. This is how the four original contrast
// failures shipped — no gate existed at registration time.
// In production the warnings are logged; in CI (NODE_ENV=test) they throw.
function _contrastCheck() {
  const AA_NORMAL = 4.5;
  const AA_LARGE = 3.0;
  function srgbToLin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function luminance(r, g, b) { return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b); }
  function contrast(a, b) { const l1 = luminance(...a), l2 = luminance(...b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); }
  function hexToRgb(hex) { let h = hex.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); if (h.length !== 6) return null; const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

  const failures = [];
  for (const id of TEMPLATE_IDS) {
    const css = TEMPLATES[id].css;
    if (!css || typeof css !== "string") continue;
    const vars = {};
    for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g)) vars[m[1]] = m[2];
    const bgKeys = ["--bg", "--panel", "--panel-2", "--surface", "--card"];
    const fgKeys = ["--ink", "--ink-soft", "--ink-mute", "--text", "--fg"];
    const bg = bgKeys.map(k => vars[k]).find(Boolean);
    if (!bg) continue;
    const bgRgb = hexToRgb(bg);
    if (!bgRgb) continue;
    for (const fk of fgKeys) {
      if (!vars[fk]) continue;
      const fgRgb = hexToRgb(vars[fk]);
      if (!fgRgb) continue;
      const ratio = contrast(fgRgb, bgRgb);
      const floor = fk === "--ink-mute" ? AA_LARGE : AA_NORMAL;
      if (ratio < floor) failures.push({ template: id, fg: vars[fk], bg, ratio: ratio.toFixed(2), floor });
    }
  }
  if (failures.length) {
    const msg = failures.map(f => `  ${f.template}: ${f.fg} on ${f.bg} ratio ${f.ratio} (need ${f.floor})`).join("\n");
    if (process.env.NODE_ENV === "test") {
      throw new Error(`Template contrast validation failed:\n${msg}`);
    }
    console.warn(`⚠️  Template contrast validation found ${failures.length} failure(s):\n${msg}`);
  }
}
_contrastCheck();
