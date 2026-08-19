import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  BRAND_COLORS,
  brandMarkSvg,
  brandPoweredBySvg,
  brandWordmarkSvg,
} from "../../../packages/shared/dist/brand-assets.js";

const outputDir = new URL("../public/brand/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const assets = {
  "yourrank-mark-dark.svg": brandMarkSvg({ variant: "dark", width: "96", height: "96" }),
  "yourrank-mark-light.svg": brandMarkSvg({ variant: "light", width: "96", height: "96" }),
  "yourrank-mark-blue.svg": brandMarkSvg({ variant: "blue", width: "96", height: "96" }),
  "yourrank-wordmark-dark.svg": brandWordmarkSvg({ variant: "dark" }),
  "yourrank-wordmark-light.svg": brandWordmarkSvg({ variant: "light" }),
  "powered-by-yourrank-dark.svg": brandPoweredBySvg({
    variant: "light",
    background: { fill: BRAND_COLORS.dark, stroke: "#2A2A2A" },
  }),
  "powered-by-yourrank-light.svg": brandPoweredBySvg({
    variant: "dark",
    background: { fill: "#FFFFFF", stroke: "#E4E4E4" },
  }),
};

await Promise.all(
  Object.entries(assets).map(([file, svg]) =>
    writeFile(join(outputDir.pathname, file), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`),
  ),
);
