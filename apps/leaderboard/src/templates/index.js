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
//
// Conventions for new templates (these keep the system safe at scale):
// - Ids are immutable API names: never rename or reuse one, only add new ids.
// - Scope every CSS rule under body[data-template="<id>"] — never :root or
//   bare selectors — so templates can never leak into each other.
// - Declare the Google Fonts families the design needs in `fonts`; the
//   renderer loads only those plus the streamer's picker font.
import { CLASSIC } from "./classic.jsx";
import { TERMINAL } from "./terminal.jsx";
import { TOURNAMENT } from "./tournament.jsx";
import { NOIR } from "./noir.jsx";

export const TEMPLATES = {
  classic: CLASSIC,
  terminal: TERMINAL,
  tournament: TOURNAMENT,
  noir: NOIR,
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const validTemplate = (id) => (Object.hasOwn(TEMPLATES, id) ? id : "classic");
export const templateCss = (id) => TEMPLATES[validTemplate(id)].css;

// ── Editable options schema ─────────────────────────────────────────
// Each template may declare a `schema`: the knobs the dashboard renders for
// it. The dashboard never hardcodes per-template controls — it reads this
// schema and auto-builds the form. Field types:
//   color  — hex color, rendered as a color picker, exposed as --opt-<key>
//   toggle — boolean, rendered as a checkbox, exposed as data-opt-<key>
//   select — one of `options`, rendered as a dropdown, exposed both ways
// Values reach the page as scoped CSS custom properties and data attributes
// under body[data-template="<id>"], and as `parts.options` inside compose().
const HEX_OPT = /^#[0-9a-fA-F]{6}$/;
const OPT_KEY = /^[a-z][a-z0-9-]{0,31}$/;

export const templateSchema = (id) => TEMPLATES[validTemplate(id)].schema || {};

// Resolve a template's options: schema defaults overridden by validated
// saved values. Unknown keys are dropped and wrong types fall back to the
// default, so stale or hostile theme_json can never break a public page.
export function resolveOptions(id, raw) {
  const schema = templateSchema(id);
  const out = {};
  for (const [key, field] of Object.entries(schema)) {
    if (!OPT_KEY.test(key) || !field || typeof field !== "object") continue;
    const v = raw && typeof raw === "object" ? raw[key] : undefined;
    if (field.type === "color") out[key] = HEX_OPT.test(v || "") ? v : field.default;
    else if (field.type === "toggle") out[key] = typeof v === "boolean" ? v : field.default === true;
    else if (field.type === "select") out[key] = (field.options || []).includes(v) ? v : field.default;
  }
  return out;
}
// The composer that owns this template's page structure. Falls back to the
// classic composition for unknown ids so old boards never break.
export const composeFor = (id) => TEMPLATES[validTemplate(id)].compose || TEMPLATES.classic.compose;
// ── Shell chrome + part overrides ───────────────────────────────────
// Templates are not limited to <main>: a template module may export
//   header(sp)  — replaces the shared nav header entirely
//   footer(sp)  — replaces the shared footer entirely
//   parts       — map of block builders that redesign the inside of the
//                 shared contract-bound blocks: row(player, rank, helpers),
//                 top3Card(player, rank, helpers)
// Anything a template omits falls back to the shared defaults in render.jsx,
// so existing templates keep working untouched.
export const templateHeader = (id) => TEMPLATES[validTemplate(id)].header || null;
export const templateFooter = (id) => TEMPLATES[validTemplate(id)].footer || null;
export const templateParts = (id) => TEMPLATES[validTemplate(id)].parts || {};
// Google Fonts css2 family params the template's design needs.
export const templateFonts = (id) => TEMPLATES[validTemplate(id)].fonts || [];
export const templateCatalog = () => TEMPLATE_IDS.map((id) => ({
  id: TEMPLATES[id].id,
  name: TEMPLATES[id].name,
  description: TEMPLATES[id].description,
  presets: TEMPLATES[id].presets,
  schema: TEMPLATES[id].schema || {},
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
