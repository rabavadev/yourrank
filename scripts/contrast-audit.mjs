#!/usr/bin/env node
/**
 * WCAG contrast auditor for leaderboard templates.
 *
 * Two sources of colour:
 *   1. CSS-skin templates (apps/leaderboard/src/templates/*.js) — colours live in
 *      CSS custom properties + literal declarations layered over leaderboard.css.
 * We can't fully resolve cascade statically, so this is a HEURISTIC linter:
 * for each template we pair every --ink* foreground var against --bg/--panel*
 * background vars and flag ratios under the WCAG AA floor.
 * Output is a work order, not gospel — every flag gets file+line+context.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TEMPLATES = join(ROOT, "apps/leaderboard/src/templates");

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0; // >=24px or >=18.66px bold

// ---- WCAG relative-luminance + contrast ratio ----
function srgbToLin(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance({ r, g, b }) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// ---- suggest a compliant foreground: nudge lightness toward the floor ----
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hslToRgb({ h, s, l }) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
/** Return a foreground hex (same hue) that clears `floor` against bg, or null. */
function suggestFg(fg, bg, floor) {
  const hsl = rgbToHsl(fg);
  const bgLum = luminance(bg);
  const goDark = bgLum > 0.4; // dark text on light bg, else lighten
  for (let i = 1; i <= 20; i++) {
    const step = i / 20;
    const l = goDark ? Math.max(0, hsl.l * (1 - step)) : Math.min(1, hsl.l + (1 - hsl.l) * step);
    const cand = hslToRgb({ ...hsl, l });
    if (contrast(cand, bg) >= floor) return rgbToHex(cand);
  }
  return goDark ? "#000000" : "#ffffff";
}

const failures = [];
function record(file, line, fg, bg, ratio, floor, ctx) {
  const fgRgb = hexToRgb(fg), bgRgb = hexToRgb(bg);
  const suggestion = fgRgb && bgRgb ? suggestFg(fgRgb, bgRgb, floor) : null;
  failures.push({ file, line, fg, bg, ratio: ratio.toFixed(2), floor, suggestion, ctx });
}

// ---- CSS-var skin pass ----
function auditSkin(file) {
  const abs = join(TEMPLATES, file);
  const src = readFileSync(abs, "utf8");
  const vars = {};
  for (const m of src.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g)) vars[m[1]] = m[2];
  const bgKeys = ["--bg", "--panel", "--panel-2", "--violet-2", "--surface", "--card"];
  const fgKeys = ["--ink", "--ink-soft", "--ink-mute", "--text", "--fg"];
  const bg = bgKeys.map((k) => vars[k]).find(Boolean);
  if (!bg) return;
  const bgRgb = hexToRgb(bg);
  for (const fk of fgKeys) {
    if (!vars[fk]) continue;
    const fgRgb = hexToRgb(vars[fk]);
    if (!fgRgb) continue;
    const ratio = contrast(fgRgb, bgRgb);
    // ink-mute is intentionally low-emphasis; hold it to large-text floor
    const floor = fk === "--ink-mute" ? AA_LARGE : AA_NORMAL;
    if (ratio < floor) record(file, 0, vars[fk], bg, ratio, floor, `${fk} on ${bgKeys.find((k) => vars[k] === bg)}`);
  }
}

const all = readdirSync(TEMPLATES).filter((f) => f.endsWith(".js") && f !== "index.js");
for (const f of all) auditSkin(f);

// ---- report ----
if (failures.length === 0) {
  console.log("✅ No contrast failures found (heuristic auditor).");
  process.exit(0);
}
failures.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
console.log(`⚠️  ${failures.length} potential contrast failures (WCAG AA):\n`);
let cur = "";
for (const f of failures) {
  if (f.file !== cur) { cur = f.file; console.log(`\n── ${cur} ──`); }
  const loc = f.line ? `L${f.line}` : "css-var";
  console.log(`  ${loc}  ${f.fg} on ${f.bg}  ratio ${f.ratio} (need ${f.floor})  → try ${f.suggestion}`);
  console.log(`        ${f.ctx}`);
}
console.log(`\nTotal: ${failures.length}`);
process.exit(1);