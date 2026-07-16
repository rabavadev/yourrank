import { destroySession, cookieClear, readToken, handleAccountDelete, RESERVED, bad, currentUser, hasLegacyCookie, cookieClearLegacy, rateLimit, clientIp } from "./auth.js";
import { sendErrorToDiscord } from "../../../shared/monitoring.js";
import { withWorkerFetch } from "../../../shared/with-worker.js";
import { RateLimiter } from "../../../shared/rate-limiter-do.js";
import { populateEnv } from "../../../shared/env.js";
import { getPublicSite, getByUser } from "./site.js";
import { renderLeaderboard } from "./render.js";
import { PAGES } from "./pages.js";

import { bumpStat } from "./stats.js";
import { createQueueProducer } from "../../../shared/queue-producer.js";
import { shellNavHtml } from "../../../shared/shell-nav.js";
import { findRoute } from "./routes.js";
import { OG_IMAGE_PNG_BASE64 } from "./og-image.js";
import {
  generateCsrfToken, csrfCookie, verifyCsrf, shouldRequireCsrf,
  resolveCustomDomain, isCustomHost,
  serveStaticAsset,
  serveRobotsTxt, serveSitemapXml, serveFavicon,
  HTML, SECURE_HTML, notFoundPage, suspendedPage, withNonce
} from "./middleware/index.js";
import { handlePublicApiPreflight, withPublicApiCors } from "./middleware/public-api.js";
import { findSiteLogoData, findSiteStatus, findUserTotpSecret } from "./data/sites.js";
import { detectImageMime } from "./site.js";
import { one } from "../../../shared/db.js";
import { hashToken } from "../../../shared/crypto.js";
import { handleDashboardPreview } from "./handlers/preview.js";

function enqueueBump(env, ctx, siteId, field, referer = null) {
  const producer = createQueueProducer(
    env.EVENTS_QUEUE,
    async (event) => {
      if (event.type === "bump") {
        await bumpStat(event.siteId, event.field, event.referer);
      }
    }
  );
  const p = producer.send({ type: "bump", siteId, field, referer, timestamp: Date.now() });
  ctx.waitUntil(p);
}

async function serveLogo(request, path) {
  let slug;
  try { slug = decodeURIComponent(path.slice(6)).toLowerCase().replace(/\.(png|jpe?g|webp)$/, ""); } catch { return new Response("not found", { status: 404 }); }
  const site = await findSiteLogoData(slug);
  const m = (site?.logo_data || "").match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!m) return new Response("not found", { status: 404 });
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest("SHA-256", encoder.encode(site.logo_data));
  const etag = '"' + [...new Uint8Array(hashBuf)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16) + '"';
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === etag) return new Response(null, { status: 304, headers: { etag, "cache-control": "public, max-age=86400" } });
  let bytes;
  try { bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0)); } catch { return new Response("not found", { status: 404 }); }
  // H-19: validate magic bytes even on read so a legacy invalid blob cannot be
  // served under an image MIME type.
  const detected = detectImageMime(bytes);
  if (!detected) return new Response("not found", { status: 404 });
  return new Response(bytes, { headers: { "content-type": detected, "cache-control": "public, max-age=86400", etag } });
}

export default {
  fetch: withWorkerFetch("leaderboard", async (request, env, ctx) => {
    const response = await handleRequest(request, env, ctx);
    // SEC-104: Clear legacy 'sess' cookie on every response (not just authenticated)
    if (hasLegacyCookie(request)) {
      response.headers.append("set-cookie", cookieClearLegacy());
    }
    // SEC-107: Propagate rotated session cookies from currentUser()
    if (request._sessionCookies) {
      for (const c of request._sessionCookies) {
        response.headers.append("set-cookie", c);
      }
    }
    return response;
  }),
};

function demoLeaderboardData() {
  return {
    brand: {
      name: "StakeDrop",
      casino: "Stake",
      code: "DEMO2025",
      ctaUrl: "https://stake.com/?c=DEMO2025",
      prizePool: "$5,000",
      period: "Monthly",
      tagline: "Casino streamer & Stake partner",
      resetNote: "",
      blurb: "Welcome to the official StakeDrop leaderboard. Use code DEMO2025 to join and climb the ranks. Top wagerers win big every month.",
    },
    branding: { hasLogo: false },
    players: [
      { name: "Crypto*****99", wagered: 287400, prize: 1500 },
      { name: "StakeWhale", wagered: 214800, prize: 1000 },
      { name: "DiceKing", wagered: 189200, prize: 750 },
      { name: "*****blue", wagered: 156000, prize: 500 },
      { name: "HighRoller", wagered: 134500, prize: 250 },
      { name: "JackpotJen", wagered: 112000, prize: 0 },
      { name: "SlotNinja", wagered: 98700, prize: 0 },
      { name: "*****ace", wagered: 87400, prize: 0 },
      { name: "BetMaster", wagered: 76200, prize: 0 },
      { name: "LuckyStar", wagered: 65100, prize: 0 },
    ],
    endsAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    rules: ["Wagers on Stake count towards your ranking.", "Minimum wager: $1,000.", "Leaderboard resets at the end of each month.", "Prizes credited within 48h of reset."],
    whyStats: [
      { big: "Licensed", label: "Provably Fair", sub: "Verified gaming platform" },
      { big: "Instant", label: "Deposits & Withdrawals", sub: "No waiting around" },
      { big: "24/7", label: "Live Support", sub: "Always online" },
      { big: "Exclusive", label: "VIP Rewards", sub: "Top-tier perks" },
    ],
    socials: [
      { platform: "kick", url: "https://kick.com/stakedrop", label: "Follow on Kick" },
      { platform: "twitter", url: "https://x.com/stakedrop", label: "Follow on X" },
      { platform: "discord", url: "https://discord.gg/stakedrop", label: "Join Discord" },
    ],
    archives: [],
  };
}

function addCookieConsent(html) {
  if (typeof html !== "string") return html;
  const supportEmail = (typeof process !== "undefined" && process.env?.SUPPORT_EMAIL) || "contact@yourrank.site";
  html = html.replace(/contact@yourrank\.site/g, supportEmail);
  return html.replace(/<\/body>\s*<\/html>\s*$/i, '<script src="/assets/cookie-consent.js" defer></script></body></html>');
}

const MAX_BODY_BYTES = 1_000_000;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function bodyExceedsLimit(request, maxBytes) {
  const cl = request.headers.get("content-length");
  if (cl && Number(cl) > maxBytes) return true;
  if (!request.body) return false;
  // H-18: Content-Length can be absent (chunked encoding) or lie. Read a clone
  // of the stream up to the limit so oversized chunked bodies are rejected too.
  const clone = request.clone();
  const reader = clone.body.getReader();
  try {
    let total = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value ? value.length : 0;
      if (total > maxBytes) return true;
    }
  } finally {
    reader.releaseLock();
  }
  return false;
}

async function handleRequest(request, env, ctx, meta) {
    const { log: workerLog, reqId } = meta || {};
    try {
      // BE-004 / H-18: Reject oversized request bodies early, before any parsing.
      // 1 MB is generous for JSON payloads (site data, auth forms, etc.) while
      // blocking multi-MB abuse. Applies to all state-changing methods and checks
      // chunked bodies by consuming a clone of the stream up to the limit.
      if (MUTATING_METHODS.has(request.method)) {
        if (await bodyExceedsLimit(request, MAX_BODY_BYTES)) {
          return new Response("payload too large", { status: 413 });
        }
      }

      // Populate process.env so the shared Postgres data layer (db.js) can read
      // the connection string. The Pool is created lazily on first query(), so
      // this must run before any DB call — mirrors the bot Worker's worker.ts.
      populateEnv(env, { setGlobalEnv: true });

      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method === "HEAD" ? "GET" : request.method;
      const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
      // BUG-007: Nonce for inline <style> blocks — CSP 'unsafe-inline' replaced per-request.
      const nonce = crypto.randomUUID().replace(/-/g, "");
      const HTML_N = withNonce(HTML, nonce);

      // --- custom domain resolution ---
      // If the Host header is not our primary domain, check if it maps to a
      // user's custom domain. If yes, serve their leaderboard at /.
      if (isCustomHost(host)) {
        const customSlug = await resolveCustomDomain(env, host);
        if (customSlug) {
          // Serve the leaderboard as if the path were /<slug>
          // Rewrite the URL path internally
          url.pathname = "/" + customSlug;
          // Only serve GET requests on custom domains (no dashboard/API)
          if (method === "GET" && path.startsWith("/logo/")) {
            return serveLogo(request, path);
          }
          if (method === "GET" && (path === "/" || path === "")) {
            const r = await getPublicSite(env, customSlug);
            if (!r || r.suspended) return new Response(notFoundPage(customSlug, nonce), { status: 404, headers: HTML_N });
            const paid = r.plan === "pro" || r.plan === "agency";
            return new Response(
              renderLeaderboard(r.data, {
                watermark: !paid, homeUrl: `https://${host}`, slug: customSlug, nonce,
                logoUrl: paid && r.data.branding?.hasLogo ? `https://${host}/logo/${customSlug}` : null,
              }),
              { headers: { ...HTML_N, "cache-control": "no-store" } }
            );
          }
          if (method === "GET" && path === "/favicon.ico") {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>', {
              headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
            });
          }
          // Everything else on a custom domain → 404
          return new Response(notFoundPage("", nonce), { status: 404, headers: HTML_N });
        }
        // No matching custom domain — fall through to normal routing
      }

      // --- static assets ---
      if (path.startsWith("/assets/")) {
        return serveStaticAsset(path, request);
      }

      // --- SEO endpoints ---
      if (path === "/robots.txt") return serveRobotsTxt(url.origin);
      if (path === "/sitemap.xml") return await serveSitemapXml(url.origin, env);
      if (path === "/favicon.ico") return serveFavicon();
      // Brand social-share image (og:image). Decoded from the inlined base64 so
      // shares of the homepage/pricing/unbranded boards don't render blank.
      if (method === "GET" && path === "/og.png") {
        const bytes = Uint8Array.from(atob(OG_IMAGE_PNG_BASE64), (c) => c.charCodeAt(0));
        return new Response(bytes, { headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" } });
      }

      // --- health check ---
      if (path === "/health") {
        const result = { status: "ok", timestamp: new Date().toISOString() };
        try {
          await one('SELECT 1 AS ok');
          result.db = true;
        } catch (e) {
          if (workerLog) workerLog.warn("health_db_probe_failed", { error: String(e) });
          else console.error("[leaderboard] health_db_probe_failed:", String(e));
          result.db = false;
          result.status = "degraded";
        }
        const status = result.status === "ok" ? 200 : 503;
        return new Response(JSON.stringify(result), {
          status,
          headers: { "content-type": "application/json", "cache-control": "no-store" },
        });
      }

      // --- pages ---
      // SEC-108: Issue CSRF cookie on every page load so the JS client can
      // echo it back as X-CSRF-Token on API calls.
      const csrfToken = generateCsrfToken();
      const csrfHeader = { "set-cookie": csrfCookie(csrfToken) };

      if (path === "/" || path === "/index.html") return new Response(addCookieConsent(PAGES.index), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/login" || path === "/login.html") return new Response(addCookieConsent(PAGES.login), { headers: { ...SECURE_HTML, ...csrfHeader } });
      // POST /logout only (BE-003). Previously GET, which allowed CSRF via
      // <img src="/logout">. Now only POST is accepted. The in-page buttons
      // already hit POST /api/auth/logout; the nav link should use a form POST.
      if ((path === "/logout" || path === "/logout.html") && method === "POST") {
        await destroySession(env, readToken(request));
        return new Response(null, { status: 302, headers: { "set-cookie": cookieClear(env), location: "/login" } });
      }
      if (path === "/signup" || path === "/signup.html") return new Response(addCookieConsent(PAGES.signup), { headers: { ...SECURE_HTML, ...csrfHeader } });
      if (path === "/dashboard" || path === "/dashboard.html") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.dashboard
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard", user }))
            .replace("{{REQ_ID}}", reqId || ""));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          // A transient DB/Hyperdrive hiccup on currentUser used to bubble as a
          // raw Cloudflare 1101 after the session cookie redirected past the
          // unauthenticated path. Retry-safe: a plain refresh re-runs the read.
          if (workerLog) workerLog.error("dashboard_render_failed", { error: String(e?.message || e) }); else console.error("dashboard render failed:", String(e?.message || e));
          return new Response("Dashboard couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/preview" && method === "GET") {
        try {
          return await handleDashboardPreview(request, env, nonce);
        } catch (e) {
          if (workerLog) workerLog.error("template_preview_failed", { error: String(e?.message || e) }); else console.error("template preview failed:", String(e?.message || e));
          return new Response("Preview couldn't load.", { status: 500 });
        }
      }
      if (path === "/dashboard/analytics") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.analytics
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/analytics", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("analytics_render_failed", { error: String(e?.message || e) }); else console.error("analytics render failed:", String(e?.message || e));
          return new Response("Analytics couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/billing") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.billing
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/billing", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("billing_render_failed", { error: String(e?.message || e) }); else console.error("billing render failed:", String(e?.message || e));
          return new Response("Billing couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/attribution") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.attribution
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/attribution", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("attribution_render_failed", { error: String(e?.message || e) }); else console.error("attribution render failed:", String(e?.message || e));
          return new Response("Attribution couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/bot/setup") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.botSetup
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/bot/setup", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("bot_setup_render_failed", { error: String(e?.message || e) }); else console.error("bot setup render failed:", String(e?.message || e));
          return new Response("Bot setup couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/setup") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          // Returning user with brand.name already set → skip wizard
          const site = await getByUser(env, user.id);
          if (site && site.name && site.name !== site.slug) {
            return Response.redirect(new URL("/dashboard", url), 302);
          }
          const html = addCookieConsent(PAGES.setup
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("setup_render_failed", { error: String(e?.message || e) }); else console.error("setup render failed:", String(e?.message || e));
          return new Response("Setup couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/dashboard/security") {
        try {
          const user = await currentUser(request, env);
          if (!user) return Response.redirect(new URL("/login", url), 302);
          const html = addCookieConsent(PAGES.security
            .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/security", user })));
          return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader, "cache-control": "no-store, no-cache, must-revalidate" } });
        } catch (e) {
          if (workerLog) workerLog.error("security_render_failed", { error: String(e?.message || e) }); else console.error("security render failed:", String(e?.message || e));
          return new Response("Security page couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
        }
      }
      if (path === "/forgot") return new Response(addCookieConsent(PAGES.forgot), { headers: { ...SECURE_HTML, ...csrfHeader } });
      if (path === "/reset") {
        // BUG-003: Don't show password form when no token is present.
        if (!url.searchParams.get("token")) {
          const invalidLink = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invalid link · YourRank</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>That link doesn't work.</h1><p>This reset link is missing, expired, or already used. Request a fresh one below.</p></div>
<div class="feat"></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>Invalid reset link</h2>
<p class="sub">This link is invalid or expired.</p>
<a class="btn btn--accent w-full" href="/forgot">Request a new link</a>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div></body></html>`;
          return new Response(addCookieConsent(invalidLink), { headers: { ...SECURE_HTML, ...csrfHeader } });
        }
        return new Response(addCookieConsent(PAGES.reset), { headers: { ...SECURE_HTML, ...csrfHeader } });
      }
      if (path === "/admin") {
        const u = await currentUser(request, env);
        if (!u || !u.is_admin) return new Response(notFoundPage("admin", nonce), { status: 404, headers: HTML_N });
        // C-10: Mandatory admin MFA. Admins with no enrolled TOTP are forced
        // to the 2FA setup page; enrolled admins must have a fresh session flag.
        const tfaRow = await findUserTotpSecret(u.id);
        if (!tfaRow?.totp_secret) {
          return new Response(addCookieConsent(PAGES.admin2fa), { headers: { ...SECURE_HTML, ...csrfHeader } });
        }
        const token = readToken(request);
        const tokenHash = token ? await hashToken(token) : null;
        const tfaRow2 = tokenHash ? await one("SELECT twofa_verified_at FROM sessions WHERE token=$1", [tokenHash]) : null;
        if (!tfaRow2?.twofa_verified_at) {
          // Show 2FA verification page instead of admin dashboard
          return new Response(addCookieConsent(PAGES.admin2fa), { headers: { ...SECURE_HTML, ...csrfHeader } });
        }
        return new Response(addCookieConsent(PAGES.admin), { headers: { ...SECURE_HTML, ...csrfHeader } });
      }
      if (path === "/terms") return new Response(addCookieConsent(PAGES.terms), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/privacy") return new Response(addCookieConsent(PAGES.privacy), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/responsible") return new Response(addCookieConsent(PAGES.responsible), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/refund") return new Response(addCookieConsent(PAGES.refund), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/contact") return new Response(addCookieConsent(PAGES.contact), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/pricing" || path === "/pricing.html") return new Response(addCookieConsent(PAGES.pricing), { headers: { ...HTML_N, ...csrfHeader } });
      if (path === "/cookies" || path === "/cookies.html") return new Response(addCookieConsent(PAGES.cookies), { headers: { ...HTML_N, ...csrfHeader } });


      // --- streamer logos (uploaded via dashboard, served as real images) ---
      if (path.startsWith("/logo/") && method === "GET") {
        return serveLogo(request, path);
      }

      // --- API routing ---
      if (method === "OPTIONS") {
        const preflight = handlePublicApiPreflight(path);
        if (preflight) return preflight;
      }

      // Route table lookup for all API endpoints
      const route = findRoute(path, method);
      if (route) {
        // Check CSRF for state-changing requests (except exempted paths)
        if (shouldRequireCsrf(method, path)) {
          if (!verifyCsrf(request)) {
            return bad("CSRF validation failed. Please refresh the page.", 403);
          }
        }
        // Pass route context (slug + a durable waitUntil bound to the real
        // ExecutionContext so handlers can defer work past the response) and
        // worker metadata (log, reqId) to the handler.
        const routeCtx = { slug: route.slug, waitUntil: (p) => ctx.waitUntil(p) };
        const response = await route.handler(request, env, routeCtx, meta);
        return withPublicApiCors(response, path);
      }

      // Handle account delete separately (still in auth.js)
      if (path === "/api/account/delete" && method === "POST") {
        if (shouldRequireCsrf(method, path)) {
          if (!verifyCsrf(request)) {
            return bad("CSRF validation failed. Please refresh the page.", 403);
          }
        }
        return handleAccountDelete(request, env);
      }



      // --- permanent demo leaderboard (always works, no DB needed) ---
      if (method === "GET" && path === "/demo") {
        return new Response(
          renderLeaderboard(demoLeaderboardData(), {
            watermark: false, homeUrl: url.origin, slug: "demo", nonce,
          }),
          { headers: { ...HTML_N, "cache-control": "no-store" } }
        );
      }

      // --- tracked Join redirect: /go/<slug> → streamer's referral URL ---
      if (method === "GET" && path.startsWith("/go/")) {
        const ip = clientIp(request);
        if (!(await rateLimit(env, `go:${ip}`, 120, 60)).ok) return new Response("Too many requests", { status: 429, headers: HTML_N });
        let slug;
        try { slug = decodeURIComponent(path.slice(4).split("/")[0]).toLowerCase(); } catch { return new Response(notFoundPage("", nonce), { status: 404, headers: HTML_N }); }
        // Demo board has no DB row — mirror the demo overlay special-case so the
        // "Join Stake" CTA on /demo (embedded on the homepage) isn't a dead 404.
        if (slug === "demo") {
          return Response.redirect(demoLeaderboardData().brand.ctaUrl, 302);
        }
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        if (r.id) enqueueBump(env, ctx, r.id, "clicks");
        const dest = r.data?.brand?.ctaUrl;
        // E2E-008: Only redirect to the CTA URL if it's a valid https:// URL.
        // If empty/null or non-https (javascript:, data:, relative paths),
        // redirect to the board page instead of risking a redirect loop.
        if (dest && /^https:\/\//i.test(dest)) {
          return Response.redirect(dest, 302);
        }
        return Response.redirect(`${url.origin}/${slug}`, 302);
      }

      // --- OBS overlay: /<slug>/overlay ---
      if (method === "GET" && /^\/[^/]+\/overlay$/.test(path)) {
        let slug;
        try { slug = decodeURIComponent(path.slice(1).split("/")[0]).toLowerCase(); } catch { return new Response(notFoundPage("", nonce), { status: 404, headers: HTML_N }); }
        if (RESERVED.has(slug)) return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        // Demo overlay: use hardcoded data (no DB)
        if (slug === "demo") {
          const overlayHtml = PAGES.overlay(demoLeaderboardData(), { slug: "demo", nonce });
          return new Response(overlayHtml, { headers: { ...HTML_N, "cache-control": "no-store" } });
        }
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        const paid = r.plan !== "free";
        if (!paid) {
          // Upsell page for free users
          const upsell = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>OBS Overlay — Pro Feature</title><style nonce="${nonce}">*{margin:0;padding:0;box-sizing:border-box}body{width:320px;background:rgba(8,8,12,0.95);font-family:'Segoe UI',system-ui,sans-serif;color:#fff;padding:20px;border-radius:12px;text-align:center}
h2{font-size:16px;margin-bottom:8px;background:linear-gradient(135deg,#c8ff00,#5ad9ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{font-size:11px;color:rgba(255,255,255,0.5);line-height:1.5}
a{color:#c8ff00;text-decoration:none;font-weight:600}</style></head><body>
<h2>🎬 OBS Overlay</h2>
<p>This is a Pro feature.<br/>Upgrade at <a href="/" target="_blank">yourrank.site</a> to unlock the live stream overlay with animated rankings.</p>
</body></html>`;
          return new Response(upsell, { headers: { ...HTML_N, "cache-control": "no-store" } });
        }
        const overlayHtml = PAGES.overlay(r.data, { slug, nonce });
        return new Response(overlayHtml, { headers: { ...HTML_N, "cache-control": "no-store" } });
      }

      // --- public leaderboard at /<slug> ---
      if (method === "GET" && path.length > 1 && !path.includes(".")) {
        let slug;
        try { slug = decodeURIComponent(path.slice(1).split("/")[0]).toLowerCase(); } catch { return new Response(notFoundPage("", nonce), { status: 404, headers: HTML_N }); }
        // BUG-004: Reject paths with extra segments (e.g., /slug/widget).
        // /<slug>/overlay is handled above; anything else is a 404.
        if (path !== `/${slug}` && path !== `/${slug}/`) return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        if (RESERVED.has(slug)) return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        const r = await getPublicSite(env, slug);
        if (!r) {
          // Check if site exists but is unpublished — return 404 with noindex
          // BUG-002 FIX: sites table has no 'suspended' column; join users to get status.
          const rawSite = await findSiteStatus(slug);
          if (rawSite && rawSite.suspended) return new Response(suspendedPage(nonce), { status: 403, headers: HTML_N });
          return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
        }
        if (r.suspended) return new Response(suspendedPage(nonce), { status: 403, headers: HTML_N });
        // Only count one view per slug per browser per 24h (cookie-based cooldown).
        const viewCookieName = `__v_${slug}`;
        const viewCookies = (request.headers.get("cookie") || "");
        const alreadyViewed = new RegExp(`(?:^|;\\s*)${viewCookieName}=`).test(viewCookies);
        const respHeaders = { ...HTML_N, "cache-control": "no-store" };
        if (r.id && !alreadyViewed) {
          const ref = request.headers.get("referer") || request.headers.get("Referer") || "";
          enqueueBump(env, ctx, r.id, "views", ref);
          respHeaders["set-cookie"] = `${viewCookieName}=1; Path=/${slug}; Max-Age=86400; SameSite=Lax; Secure`;
        }
        const paid = r.plan !== "free";
        return new Response(
          renderLeaderboard(r.data, {
            watermark: !paid, homeUrl: url.origin, slug, nonce, boards: r.boards,
            logoUrl: paid && r.data.branding?.hasLogo ? `${url.origin}/logo/${slug}` : null,
          }),
          { headers: respHeaders }
        );
      }

      return new Response(notFoundPage("", nonce), { status: 404, headers: HTML_N });
    } catch (err) {
      const errPath = (() => { try { return new URL(request.url).pathname; } catch { return "unknown"; } })();
      if (workerLog) workerLog.error("unhandled_error", { error: String(err?.message || err), stack: err?.stack, path: errPath });
      else console.error(`[leaderboard] unhandled error on ${errPath}:`, String(err?.message || err), err?.stack || "");
      // Fire-and-forget Discord monitoring webhook
      if (env.DISCORD_MONITORING_WEBHOOK) {
        ctx.waitUntil(sendErrorToDiscord({
          webhookUrl: env.DISCORD_MONITORING_WEBHOOK,
          title: "YourRank Error",
          message: String(err?.stack || err?.message || err),
          path: errPath,
          worker: "leaderboard",
        }));
      }
      return new Response("Internal Server Error", { status: 500 });
    }
}

// Durable Object classes must be exported from the main module.
export { RateLimiter };
