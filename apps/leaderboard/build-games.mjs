// ============================================================================
//  Games island bundler.
//
//  Why a bundler at all: the rest of this Worker ships hand-written vanilla JS
//  because those pages are documents. The games are an application — a bet
//  panel, a live balance and an animated board sharing state — and hand-rolling
//  that in DOM calls is exactly how it ends up looking hand-rolled.
//
//  Why esbuild specifically: the repo already builds assets with plain Node
//  scripts, esbuild is a single dev dependency with no config file, and it does
//  the one thing we actually need — ESM code splitting, so a viewer downloads
//  the shell plus the one game they opened rather than all three.
//
//  Scope: this script only ever writes to src/assets/games/. It does not touch
//  any existing asset, and the existing bundler (build.js) picks the output up
//  the same way it picks up every other asset.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(here, "src/games/entry.tsx");
const outdir = path.join(here, "src/assets/games");

// Generated output is disposable: wipe it so a removed chunk can never be
// served from a stale file inlined into assets_bundled.js.
fs.rmSync(outdir, { recursive: true, force: true });
fs.mkdirSync(outdir, { recursive: true });

let outputSizes;
try {
  const result = await esbuild.build({
    entryPoints: [entry],
    outdir,
    bundle: true,
    splitting: true,
    format: "esm",
    target: ["es2020", "chrome100", "safari15", "firefox100"],
    minify: true,
    legalComments: "none",
    jsx: "automatic",
    jsxImportSource: "preact",
    entryNames: "games",
    chunkNames: "[name]-[hash]",
    define: { "process.env.NODE_ENV": '"production"' },
    metafile: true,
  });
  outputSizes = Object.entries(result.metafile.outputs)
    .map(([file, meta]) => `${path.basename(file)} ${(meta.bytes / 1024).toFixed(1)}kB`);
} catch (error) {
  // Some locked-down Windows environments allow Bun to read the workspace but
  // deny the child esbuild executable the same path. Keep esbuild as the normal
  // build and use Bun's in-process bundler only for that failure mode.
  if (typeof Bun === "undefined" || typeof Bun.build !== "function") throw error;
  console.warn("esbuild unavailable; using Bun's in-process games bundler");
  fs.rmSync(outdir, { recursive: true, force: true });
  fs.mkdirSync(outdir, { recursive: true });
  const result = await Bun.build({
    entrypoints: [entry],
    outdir,
    splitting: true,
    format: "esm",
    target: "browser",
    minify: true,
    naming: { entry: "games.[ext]", chunk: "[name]-[hash].[ext]" },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw error;
  }
  outputSizes = result.outputs.map((output) =>
    `${path.basename(output.path)} ${(output.size / 1024).toFixed(1)}kB`
  );
}

const sizes = outputSizes.sort().join(", ");
console.log(`games island: ${sizes}`);
