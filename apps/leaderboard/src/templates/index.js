// Registry of public-page templates, layered on top of /assets/leaderboard.css.
// Each template is a self-contained package in its own module: design tokens
// and layout CSS (`css`), curated accent presets, and its own page composer
// (`compose`) that assembles the shared, escaped buildParts() blocks into a
// genuinely different page structure. All templates honour the same client
// contract — every single-element data-* hook (data-rows, data-top3,
// data-timer-grid, data-countdown, data-count, ...) appears exactly once —
// so leaderboard.js (countdown, rows, top3, socials, live updates) works
// unchanged across templates.
// The chosen template id is stored in sites.theme_json.template and reaches
// the renderer via data.branding.template.
import { CLASSIC } from "./classic.jsx";
import { TERMINAL } from "./terminal.jsx";
import { TOURNAMENT } from "./tournament.jsx";

export const TEMPLATES = {
  classic: CLASSIC,
  terminal: TERMINAL,
  tournament: TOURNAMENT,
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const validTemplate = (id) => (Object.hasOwn(TEMPLATES, id) ? id : "classic");
export const templateCss = (id) => TEMPLATES[validTemplate(id)].css;
// The composer that owns this template's page structure. Falls back to the
// classic composition for unknown ids so old boards never break.
export const composeFor = (id) => TEMPLATES[validTemplate(id)].compose || TEMPLATES.classic.compose;
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
