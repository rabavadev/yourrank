// Regenerates apps/web/public/brand/*.svg from the canonical geometry in
// packages/shared/src/brand-assets.ts, so the downloadable files can never
// drift from the marks the product renders. Requires the shared package to be
// built first (`bun run --cwd packages/shared build`).
//
// Run: bun run build:brand-assets
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LOGO_FULL_PATH,
  LOGO_FULL_VIEWBOX,
  LOGO_MARK_PATH,
  LOGO_MARK_VIEWBOX,
} from "../packages/shared/dist/brand-assets.js";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../apps/web/public/brand");
const NS = 'xmlns="http://www.w3.org/2000/svg"';

const markSvg = (fill) =>
  `<svg ${NS} viewBox="${LOGO_MARK_VIEWBOX}" width="96" height="119" fill="none"><path d="${LOGO_MARK_PATH}" fill="${fill}" fill-rule="evenodd"/></svg>\n`;

const wordmarkSvg = (fill) =>
  `<svg ${NS} viewBox="${LOGO_FULL_VIEWBOX}" width="352" height="117" fill="none"><path d="${LOGO_FULL_PATH}" fill="${fill}" fill-rule="evenodd"/></svg>\n`;

const badgeSvg = ({ background, border, label, mark }) =>
  `<svg ${NS} viewBox="0 0 220 44" width="220" height="44" fill="none">
  <rect x="0.5" y="0.5" width="219" height="43" rx="8" fill="${background}" stroke="${border}"/>
  <text x="77" y="17" font-family="Inter, Helvetica, Arial, sans-serif" font-size="9" font-weight="600" letter-spacing="1.2" fill="${label}">POWERED BY</text>
  <svg x="77" y="23" width="66" height="22" viewBox="${LOGO_FULL_VIEWBOX}" preserveAspectRatio="xMidYMid meet"><path d="${LOGO_FULL_PATH}" fill="${mark}" fill-rule="evenodd"/></svg>
</svg>\n`;

const files = {
  "yourrank-mark-blue.svg": markSvg("#2200FF"),
  "yourrank-mark-dark.svg": markSvg("#0A0A0A"),
  "yourrank-mark-light.svg": markSvg("#FFFFFF"),
  "yourrank-wordmark-dark.svg": wordmarkSvg("#0A0A0A"),
  "yourrank-wordmark-light.svg": wordmarkSvg("#FFFFFF"),
  "powered-by-yourrank-dark.svg": badgeSvg({ background: "#0A0A0A", border: "#2A2A2A", label: "#9A9A9A", mark: "#FFFFFF" }),
  "powered-by-yourrank-light.svg": badgeSvg({ background: "#FFFFFF", border: "#E4E4E4", label: "#6B6B6B", mark: "#0A0A0A" }),
};

for (const [name, contents] of Object.entries(files)) {
  writeFileSync(path.join(outDir, name), contents);
  console.log(`wrote apps/web/public/brand/${name}`);
}
