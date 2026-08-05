// Registry of public-page templates, layered on top of /assets/leaderboard.css.
// There is exactly ONE template ("classic"): one markup path, one renderer
// branch, and colour presets for variety. Additional templates will be
// reintroduced later as composable layout blocks, not per-template HTML.
// The chosen template id is stored in sites.theme_json.template and reaches
// the renderer via data.branding.template.
export const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "High-Stakes Kinetic: obsidian glass with a glowing neon podium.",
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