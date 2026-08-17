// ============================================================================
//  Local demo harness for the games island. Development only — this file is
//  never imported by the Worker and never deployed.
//
//    node build-games.mjs && node games-demo.mjs   →  http://localhost:5174
//
//  It serves src/assets/ and a host page that embeds the island exactly the way
//  the real site shell will (see src/games-embed.js), with ?demo=1 so the
//  island loads the mock API. This exists so the shell and the primitives can
//  be looked at, and future game sessions developed, before the backend lands.
//
//  Query flags, all handled by the island itself:
//    ?demo=1              mock API (required here — there is no backend)
//    &game=mines|plinko|dice
// ============================================================================
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gamesIslandHead, gamesIslandMount } from "@yourrank/shared/games-embed";

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, "src/assets");
const port = Number(process.env.PORT || 5174);

const TYPES = { ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };

// Stands in for the host page the site-shell session is building: its own
// chrome, its own tokens, with the island dropped into a Games section.
function hostPage() {
  const mount = gamesIslandMount({
    slug: "demo",
    nonce: "demo",
    siteName: "Demo Streamer",
    logoUrl: null,
    demoAllowed: true,
    header: true,
  });
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Games island — demo harness</title>
${gamesIslandHead()}
<style>
  body { margin: 0; background: #08080b; }
  .host { max-width: 1400px; margin: 0 auto; padding: 16px; }
</style>
</head><body><div class="host">${mount}</div></body></html>`;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname.startsWith("/assets/")) {
      const file = path.join(assets, url.pathname.slice("/assets/".length));
      if (file.startsWith(assets) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(fs.readFileSync(file));
        return;
      }
      res.writeHead(404).end("not found");
      return;
    }
    if (url.pathname === "/api/viewer/me") {
      res.writeHead(401, { "content-type": "application/json" }).end('{"error":"unauthenticated"}');
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(hostPage());
  })
  .listen(port, () => {
    console.log(`games demo harness → http://localhost:${port}/?demo=1`);
  });
