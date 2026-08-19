import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { BRAND_COLORS, BRAND_NAME, brandMarkSvg } from "../../../packages/shared/dist/brand-assets.js";

const output = new URL("../src/og-image.js", import.meta.url);
const mark = brandMarkSvg({ className: "og-mark", variant: "light" });
const markContent = mark.replace(/^<svg[^>]*>|<\/svg>$/g, "");
const artwork = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BRAND_COLORS.dark}"/>
  <rect x="72" y="72" width="1056" height="486" rx="28" fill="#121111" stroke="#2A2A2A"/>
  <rect x="72" y="72" width="8" height="486" rx="4" fill="${BRAND_COLORS.blue}"/>
  <g transform="translate(150 196) scale(4)">${markContent}</g>
  <text x="254" y="300" fill="${BRAND_COLORS.light}" font-family="Inter, Arial, sans-serif" font-size="88" font-weight="600" letter-spacing="-3">${BRAND_NAME}</text>
  <text x="158" y="426" fill="#B7B7B7" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">Community engagement, ranked.</text>
</svg>`;

const png = await sharp(Buffer.from(artwork)).png().toBuffer();
const base64 = png.toString("base64");
await mkdir(new URL("../src/", import.meta.url), { recursive: true });
await writeFile(
  output,
  `// Generated from packages/shared/src/brand-assets.ts by scripts/generate-og-image.mjs.\nexport const OG_IMAGE_PNG_BASE64 = "${base64}";\n`,
);
