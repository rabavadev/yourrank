import { hashPassword, verifyPassword, uuid, newToken, createSession, destroySession, destroyAllUserSessions, currentUser, requireUser, isEmail, slugify, RESERVED, cookieSet, cookieClear, readToken, json, bad, ok, readJson, rateLimit, clientIp, handleAccountDelete } from "./auth.js";
import { sendErrorToDiscord } from "../../../shared/monitoring.js";
import { DEFAULT_EXTRA, getPublicSite, getUserSite, getUserSiteById, getUserBoardsList, saveSite, getByUser, getBoardById, getAllBoards, createBoard, invalidateSiteCache, invalidateUserCache, createArchive, deleteArchive, ARCHIVE_LIMITS } from "./site.js";
import { renderLeaderboard } from "./render.js";
import { PAGES } from "./pages.js";
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS, PLAN_PRICES, priceUsd, handleCheckout, handleCheckoutLifetime, handleIpn, activatePlan, activatePro } from "./billing.js";
import { handleOverview, handleUsers, handleLeads, handlePayments, handleAction, handle2faEnable, handle2faVerify, handle2faStatus } from "./admin.js";
import { sendEmail, resetEmail } from "./email.js";
import { bumpStat, getStats, getHeatmap, getTopReferrers } from "./stats.js";
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js, analytics_js, billing_js, bot_setup_js, overlay_js } from "./assets_bundled.js";
import { query, one, exec, getSql } from "./db.js";
import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";
import { sendDiscordWebhook, buildTop3Embed, buildResetEmbed, sendTelegramMessage } from "./notifications.js";

// SEC-108: CSRF token helpers. Tokens are stored in a __csrf cookie (readable
// by JS) and must be echoed in a X-CSRF-Token header on every state-changing
// POST/PUT/DELETE. SameSite=Lax already blocks cross-site POST forms, but
// this adds defense-in-depth against XSS exfiltration.
function generateCsrfToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
}
function csrfCookie(token) {
  return `__csrf=${token}; Path=/; Domain=${typeof process !== "undefined" && process.env?.SESSION_COOKIE_DOMAIN || ".yourrank.site"}; Secure; SameSite=Lax; Max-Age=86400`;
}
function readCsrfToken(req) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : null;
}
function verifyCsrf(req) {
  const cookie = readCsrfToken(req);
  const header = req.headers.get("x-csrf-token");
  if (!cookie || !header) return false;
  // Constant-time comparison
  if (cookie.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < cookie.length; i++) diff |= cookie.charCodeAt(i) ^ header.charCodeAt(i);
  return diff === 0;
}

const MIME = {
    ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  };
const HTML = { "content-type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };
// Hardened headers for the authenticated/app pages (login, signup, forgot,
// reset, dashboard, admin). The public leaderboard keeps the plain HTML set
// (it's intentionally iframe-able and loads Google Fonts) so we scope security
// headers only to the pages that hold sessions/credentials. CSP allows inline
// styles (the templates use <style> blocks) + Google Fonts (the auth pages load
// them); nothing else. nosniff + Referrer-Policy are free wins everywhere.
const SECURE_HTML = {
  "content-type": "text/html; charset=utf-8",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'self'",
};

// In-memory custom domain cache: host → { slug, expires }
const CUSTOM_DOMAIN_CACHE = new Map();
const CUSTOM_DOMAIN_TTL = 60_000; // 60 seconds

async function resolveCustomDomain(env, host) {
  const now = Date.now();
  const cached = CUSTOM_DOMAIN_CACHE.get(host);
  if (cached && cached.expires > now) return cached.slug;
  try {
    const row = await one("SELECT slug FROM sites WHERE custom_domain=$1 AND published=true AND suspended IS NOT TRUE", [host]);
    const slug = row?.slug || null;
    CUSTOM_DOMAIN_CACHE.set(host, { slug, expires: now + CUSTOM_DOMAIN_TTL });
    return slug;
  } catch {
    return cached?.slug || null;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      // Populate process.env so the shared Postgres data layer (db.js) can read
      // the connection string. The Pool is created lazily on first query(), so
      // this must run before any DB call — mirrors the bot Worker's worker.ts.
      if (typeof globalThis.process === "undefined") globalThis.process = { env: {} };
      const pe = globalThis.process.env;
      pe.DATABASE_URL = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
      globalThis.__yr_env = env; // for KV-backed cache invalidation in site.js

      const url = new URL(request.url);
      const path = url.pathname;
    const method = request.method;
    const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];

    // --- custom domain resolution ---
    // If the Host header is not our primary domain, check if it maps to a
    // user's custom domain. If yes, serve their leaderboard at /.
    const IS_CUSTOM_HOST = host !== "yourrank.site" && host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".yourrank.site");
    if (IS_CUSTOM_HOST) {
      const customSlug = await resolveCustomDomain(env, host);
      if (customSlug) {
        // Serve the leaderboard as if the path were /<slug>
        // Rewrite the URL path internally
        url.pathname = "/" + customSlug;
        // Only serve GET requests on custom domains (no dashboard/API)
        if (method === "GET" && (path === "/" || path === "")) {
          const r = await getPublicSite(env, customSlug);
          if (!r || r.suspended) return new Response("not found", { status: 404 });
          const pro = r.plan === "pro";
          return new Response(
            renderLeaderboard(r.data, {
              watermark: !pro, homeUrl: `https://${host}`, slug: customSlug,
              logoUrl: pro && r.data.branding?.hasLogo ? `https://${host}/logo/${customSlug}` : null,
            }),
            { headers: { ...HTML, "cache-control": "public, max-age=30" } }
          );
        }
        if (method === "GET" && path === "/favicon.ico") {
          return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>', {
            headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
          });
        }
        // Everything else on a custom domain → 404
        return new Response("not found", { status: 404 });
      }
      // No matching custom domain — fall through to normal routing
    }

    // --- static assets ---
    if (path.startsWith("/assets/")) {
      const map = {
        "/assets/leaderboard.css": [leaderboard_css, ".css"],
        "/assets/leaderboard.js": [leaderboard_js, ".js"],
        "/assets/app.css": [app_css, ".css"],
        "/assets/auth.js": [auth_js, ".js"],
        "/assets/dashboard.js": [dashboard_js, ".js"],
        "/assets/admin.js": [admin_js, ".js"],
        "/assets/landing.css": [landing_css, ".css"],
        "/assets/landing.js": [landing_js, ".js"],
        "/assets/analytics.js": [analytics_js, ".js"],
        "/assets/billing.js": [billing_js, ".js"],
        "/assets/bot-setup.js": [bot_setup_js, ".js"],
        "/assets/overlay.js": [overlay_js, ".js"],
      };
      const entry = map[path];
      if (entry) return new Response(entry[0], { headers: { "content-type": MIME[entry[1]], "cache-control": "public, max-age=300, s-maxage=3600" } });
      return new Response("not found", { status: 404 });
    }

    // --- SEO: robots.txt (SEO-001) ---
    if (path === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /admin\nDisallow: /auth\nDisallow: /billing\nSitemap: https://yourrank.site/sitemap.xml\n", {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" },
      });
    }

    // --- SEO: sitemap.xml (SEO-002) ---
    if (path === "/sitemap.xml") {
      const origin = url.origin;
      let entries = [
        `<url><loc>${origin}/</loc><priority>1.0</priority></url>`,
        `<url><loc>${origin}/terms</loc><priority>0.3</priority></url>`,
        `<url><loc>${origin}/privacy</loc><priority>0.3</priority></url>`,
        `<url><loc>${origin}/responsible</loc><priority>0.3</priority></url>`,
      ];
      try {
        const sites = await query("SELECT slug FROM sites WHERE published=true AND suspended IS NOT TRUE");
        for (const s of sites) {
          entries.push(`<url><loc>${origin}/${encodeURIComponent(s.slug)}</loc><priority>0.8</priority></url>`);
        }
      } catch (e) {
        console.error("sitemap: site query failed:", String(e?.message || e));
      }
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
      return new Response(sitemap, {
        headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" },
      });
    }

    // --- SEO: favicon.ico (SEO-006) ---
    if (path === "/favicon.ico") {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>', {
        headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
      });
    }

      // --- health check ---
      if (path === "/health") {
        return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }

    // --- pages ---
    // SEC-108: Issue CSRF cookie on every page load so the JS client can
    // echo it back as X-CSRF-Token on API calls.
    const csrfToken = generateCsrfToken();
    const csrfHeader = { "set-cookie": csrfCookie(csrfToken) };

    if (path === "/" || path === "/index.html") return new Response(PAGES.index, { headers: { ...HTML, ...csrfHeader } });
    if (path === "/login" || path === "/login.html") return new Response(PAGES.login, { headers: { ...SECURE_HTML, ...csrfHeader } });
  // POST /logout only (BE-003). Previously GET, which allowed CSRF via
  // <img src="/logout">. Now only POST is accepted. The in-page buttons
  // already hit POST /api/auth/logout; the nav link should use a form POST.
  if ((path === "/logout" || path === "/logout.html") && method === "POST") {
    await destroySession(env, readToken(request));
    return new Response(null, { status: 302, headers: { "set-cookie": cookieClear(), location: "/login" } });
  }
    if (path === "/signup" || path === "/signup.html") return new Response(PAGES.signup, { headers: { ...SECURE_HTML, ...csrfHeader } });
    if (path === "/dashboard" || path === "/dashboard.html") {
      try {
        const user = await currentUser(request, env);
        if (!user) return Response.redirect(new URL("/login", url), 302);
        const html = PAGES.dashboard
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        // A transient DB/Hyperdrive hiccup on currentUser used to bubble as a
        // raw Cloudflare 1101 after the session cookie redirected past the
        // unauthenticated path. Retry-safe: a plain refresh re-runs the read.
        console.error("dashboard render failed:", String(e?.message || e));
        return new Response("Dashboard couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    }
    if (path === "/dashboard/analytics") {
      try {
        const user = await currentUser(request, env);
        if (!user) return Response.redirect(new URL("/login", url), 302);
        const html = PAGES.analytics
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/analytics", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        console.error("analytics render failed:", String(e?.message || e));
        return new Response("Analytics couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    }
    if (path === "/dashboard/billing") {
      try {
        const user = await currentUser(request, env);
        if (!user) return Response.redirect(new URL("/login", url), 302);
        const html = PAGES.billing
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/billing", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        console.error("billing render failed:", String(e?.message || e));
        return new Response("Billing couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    }
    if (path === "/dashboard/bot/setup") {
      try {
        const user = await currentUser(request, env);
        if (!user) return Response.redirect(new URL("/login", url), 302);
        const html = PAGES.botSetup
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/bot/setup", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        console.error("bot setup render failed:", String(e?.message || e));
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
        const html = PAGES.setup
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        console.error("setup render failed:", String(e?.message || e));
        return new Response("Setup couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    }
    if (path === "/forgot") return new Response(PAGES.forgot, { headers: { ...SECURE_HTML, ...csrfHeader } });
    if (path === "/reset") return new Response(PAGES.reset, { headers: { ...SECURE_HTML, ...csrfHeader } });
    if (path === "/admin") {
      const u = await currentUser(request, env);
      if (!u || !u.is_admin) return new Response('Not found', { status: 404 });
      // Check if 2FA is required but not yet verified
      const tfaRow = await one("SELECT totp_secret FROM users WHERE id=$1", [u.id]);
      if (tfaRow?.totp_secret) {
        const token = readToken(request);
        const tfaVerified = token ? await env.SESSIONS.get(`2fa:${token}`) : null;
        if (tfaVerified !== "1") {
          // Show 2FA verification page instead of admin dashboard
          return new Response(PAGES.admin2fa, { headers: { ...SECURE_HTML, ...csrfHeader } });
        }
      }
      return new Response(PAGES.admin, { headers: { ...SECURE_HTML, ...csrfHeader } });
    }
    if (path === "/terms") return new Response(PAGES.terms, { headers: { ...HTML, ...csrfHeader } });
    if (path === "/privacy") return new Response(PAGES.privacy, { headers: { ...HTML, ...csrfHeader } });
    if (path === "/responsible") return new Response(PAGES.responsible, { headers: { ...HTML, ...csrfHeader } });

    // --- streamer logos (uploaded via dashboard, served as real images) ---
    if (path.startsWith("/logo/") && method === "GET") {
      const slug = decodeURIComponent(path.slice(6)).toLowerCase().replace(/\.(png|jpe?g|webp)$/, "");
      const site = await one("SELECT logo_data FROM sites WHERE slug=$1", [slug]);
      const m = (site?.logo_data || "").match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
      if (!m) return new Response("not found", { status: 404 });
      let bytes;
      try { bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0)); } catch { return new Response("not found", { status: 404 }); }
      return new Response(bytes, { headers: { "content-type": m[1], "cache-control": "public, max-age=3600" } });
    }

    // --- API: auth (CSRF-exempt: callers may not have a CSRF cookie yet) ---
    if (path === "/api/auth/signup" && method === "POST") return handleSignup(request, env);
    if (path === "/api/auth/login" && method === "POST") return handleLogin(request, env);
    if (path === "/api/auth/me" && method === "GET") return handleMe(request, env);
    if (path === "/api/auth/forgot" && method === "POST") return handleForgot(request, env);
    if (path === "/api/auth/reset" && method === "POST") return handleReset(request, env);

    // --- SEC-108: CSRF check for all authenticated state-changing requests ---
    // Exemptions: signup/login/forgot/reset (no session yet), IPN (server-to-server webhook),
    // /api/lead and /api/track/copy (public, no session), and GET/HEAD/OPTIONS (idempotent).
    const CSRF_EXEMPT = new Set(["/api/billing/ipn", "/api/lead", "/api/track/copy", "/api/scores"]);
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      if (!verifyCsrf(request) && !CSRF_EXEMPT.has(path)) {
        return bad("CSRF validation failed. Please refresh the page.", 403);
      }
    }

    // --- API: authenticated actions (CSRF required) ---
    if (path === "/api/auth/logout" && method === "POST") return handleLogout(request, env);
      if (path === "/api/account/delete" && method === "POST") return handleAccountDelete(request, env);

    // --- API: site + leads ---
    if (path === "/api/site" && method === "GET") return handleGetSite(request, env);
    if (path === "/api/site" && method === "PUT") return handlePutSite(request, env);
    if (path === "/api/site/list" && method === "GET") return handleListBoards(request, env);
    if (path === "/api/site/create" && method === "POST") return handleCreateBoard(request, env);
    if (path === "/api/site/archive" && method === "POST") return handleArchive(request, env);
    if (path === "/api/site/archive/delete" && method === "POST") return handleArchiveDelete(request, env);
    if (path === "/api/site/stats" && method === "GET") return handleStats(request, env);
    if (path === "/api/site/stats/heatmap" && method === "GET") return handleHeatmap(request, env);
    if (path === "/api/lead" && method === "POST") return handleLead(request, env);
    if (path === "/api/track/copy" && method === "POST") return handleTrackCopy(request, env, ctx);

    // --- API: billing ---
    if (path === "/api/billing/checkout" && method === "POST") return handleCheckout(request, env);
    if (path === "/api/billing/checkout-lifetime" && method === "POST") return handleCheckoutLifetime(request, env);
    if (path === "/api/billing/trial" && method === "POST") return handleTrial(request, env);
    if (path === "/api/billing/ipn" && method === "POST") return handleIpn(request, env);

    // --- API: score postback (authenticated via X-Postback-Key header, Pro+ only) ---
    if (path === "/api/scores" && method === "POST") return handleScores(request, env);

    // --- tracked Join redirect: /go/<slug> → streamer's referral URL ---
    if (path === "/api/bot/connect" && method === "POST") return handleBotConnect(request, env);

    // --- API: notifications (Pro only) ---
    if (path === "/api/site/notify/test" && method === "POST") return handleNotifyTest(request, env);

    // --- API: admin ---
    if (path === "/api/admin/overview" && method === "GET") return handleOverview(request, env);
    if (path === "/api/admin/users" && method === "GET") return handleUsers(request, env);
    if (path === "/api/admin/leads" && method === "GET") return handleLeads(request, env);
    if (path === "/api/admin/payments" && method === "GET") return handlePayments(request, env);
    if (path === "/api/admin/action" && method === "POST") return handleAction(request, env);
    if (path === "/api/admin/2fa/enable" && method === "POST") return handle2faEnable(request, env);
    if (path === "/api/admin/2fa/verify" && method === "POST") return handle2faVerify(request, env);
    if (path === "/api/admin/2fa/status" && method === "GET") return handle2faStatus(request, env);

    // --- API: custom domain TLS verification (Pro only) ---
    if (path === "/api/site/domain/verify" && method === "POST") return handleDomainVerify(request, env);

    // --- API: public data ---
    if (path.startsWith("/api/public/") && method === "GET") {
      // Full standings JSON endpoint for embedding / Telegram bot queries
      const standingsMatch = path.match(/^\/api\/public\/([^/]+)\/standings$/);
      if (standingsMatch) {
        const slug = decodeURIComponent(standingsMatch[1]).toLowerCase();
        if (!(await rateLimit(env, `pub-standings:${clientIp(request)}`, 100, 60))) return bad("Rate limit exceeded. Try again shortly.", 429);
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return bad("not found", 404);
        const d = r.data;
        const sorted = (d.players || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
        const players = sorted.map((p, i) => ({ name: p.name, wagered: p.wagered, prize: p.prize, position: i + 1 }));
        const endsAt = d.endsAt || null;
        let countdown = null;
        if (endsAt) {
          const remaining = Math.max(0, new Date(endsAt).getTime() - Date.now());
          countdown = { endsAt, remaining };
        }
        return json({
          slug,
          name: d.brand?.name || slug,
          casino: d.brand?.casino || "",
          period: d.brand?.period || "Monthly",
          prizePool: d.brand?.prizePool || "$0",
          players,
          countdown,
        }, 200, { "cache-control": "public, max-age=30" });
      }
      // Lightweight players-only endpoint for live polling
      const playersMatch = path.match(/^\/api\/public\/([^/]+)\/players$/);
      if (playersMatch) {
        const slug = decodeURIComponent(playersMatch[1]).toLowerCase();
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return bad("not found", 404);
        const players = (r.data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
        return json({ players }, 200, { "cache-control": "public, max-age=10" });
      }
      // Plain-text rank lookup for Nightbot / Streamlabs custom commands.
      // /api/public/:slug/rank?user=X returns plain text like:
      // "CryptoKing is #2 of 15 ($12,345 wagered, $312 behind #1)"
      const rankMatch = path.match(/^\/api\/public\/([^/]+)\/rank$/);
      if (rankMatch) {
        const slug = decodeURIComponent(rankMatch[1]).toLowerCase();
        const userParam = new URL(request.url).searchParams.get("user") || "";
        if (!userParam) return new Response("Usage: /api/public/:slug/rank?user=NAME", { status: 400, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" } });
        if (!(await rateLimit(env, `pub-rank:${clientIp(request)}`, 60, 60))) return new Response("Rate limit exceeded.", { status: 429, headers: { "content-type": "text/plain; charset=utf-8" } });
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return new Response("Leaderboard not found.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
        const sorted = (r.data.players || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
        const matchUser = userParam.toLowerCase().replace(/^@/, "");
        const idx = sorted.findIndex(p => String(p.name || "").toLowerCase().replace(/^\*+/, "").includes(matchUser));
        if (idx === -1) return new Response(`${userParam} is not on ${r.data.brand?.name || slug}'s leaderboard yet.`, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" } });
        const player = sorted[idx];
        const rank = idx + 1;
        const total = sorted.length;
        const wagered = "$" + Number(player.wagered || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
        let gap = "";
        if (rank > 1) {
          const ahead = sorted[idx - 1];
          const diff = (ahead.wagered || 0) - (player.wagered || 0);
          gap = ` ($${Number(diff).toLocaleString("en-US", { maximumFractionDigits: 0 })} behind #${rank - 1})`;
        }
        const name = r.data.brand?.name || slug;
        const text = rank === 1
          ? `${player.name} is #1 of ${total} on ${name}'s leaderboard! 🏆 ${wagered} wagered`
          : `${player.name} is #${rank} of ${total} on ${name}'s leaderboard. ${wagered} wagered${gap}`;
        return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" } });
      }
      const slug = decodeURIComponent(path.slice("/api/public/".length)).toLowerCase();
      const r = await getPublicSite(env, slug);
      return r && !r.suspended ? json(r.data, 200, { "cache-control": "public, max-age=30" }) : bad("not found", 404);
    }

    // --- permanent demo leaderboard (always works, no DB needed) ---
    if (method === "GET" && path === "/demo") {
      const demoData = {
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
        why: ["Licensed & provably fair", "Instant deposits & withdrawals", "24/7 live support", "Exclusive VIP rewards"],
        socials: [
          { platform: "kick", url: "https://kick.com/stakedrop", label: "Follow on Kick" },
          { platform: "twitter", url: "https://x.com/stakedrop", label: "Follow on X" },
          { platform: "discord", url: "https://discord.gg/stakedrop", label: "Join Discord" },
        ],
        archives: [],
      };
      return new Response(
        renderLeaderboard(demoData, {
          watermark: false, homeUrl: url.origin, slug: "demo",
        }),
        { headers: { ...HTML, "cache-control": "public, max-age=3600" } }
      );
    }

    // --- tracked Join redirect: /go/<slug> → streamer's referral URL ---
    if (method === "GET" && path.startsWith("/go/")) {
      const slug = decodeURIComponent(path.slice(4).split("/")[0]).toLowerCase();
      const r = await getPublicSite(env, slug);
      if (!r || r.suspended) return Response.redirect(url.origin, 302);
      if (r.id) ctx.waitUntil(bumpStat(env, r.id, "clicks"));
      const dest = r.data?.brand?.ctaUrl;
      return Response.redirect(dest && /^https?:\/\//i.test(dest) ? dest : `${url.origin}/${slug}`, 302);
    }

    // --- OBS overlay: /<slug>/overlay ---
    if (method === "GET" && /^\/[^/]+\/overlay$/.test(path)) {
      const slug = decodeURIComponent(path.slice(1).split("/")[0]).toLowerCase();
      if (RESERVED.has(slug)) return new Response("not found", { status: 404 });
      const r = await getPublicSite(env, slug);
      if (!r || r.suspended) return new Response("not found", { status: 404 });
      const paid = r.plan !== "free";
      if (!paid) {
        // Upsell page for free users
        const upsell = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>OBS Overlay — Pro Feature</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{width:320px;background:rgba(8,8,12,0.95);font-family:'Segoe UI',system-ui,sans-serif;color:#fff;padding:20px;border-radius:12px;text-align:center}
h2{font-size:16px;margin-bottom:8px;background:linear-gradient(135deg,#c8ff00,#5ad9ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{font-size:11px;color:rgba(255,255,255,0.5);line-height:1.5}
a{color:#c8ff00;text-decoration:none;font-weight:600}</style></head><body>
<h2>🎬 OBS Overlay</h2>
<p>This is a Pro feature.<br/>Upgrade at <a href="/" target="_blank">yourrank.site</a> to unlock the live stream overlay with animated rankings.</p>
</body></html>`;
        return new Response(upsell, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
      }
      const overlayHtml = PAGES.overlay(r.data, { slug });
      return new Response(overlayHtml, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=30" } });
    }

    // --- public leaderboard at /<slug> ---
    if (method === "GET" && path.length > 1 && !path.includes(".")) {
      const slug = decodeURIComponent(path.slice(1).split("/")[0]).toLowerCase();
      if (RESERVED.has(slug)) return new Response("not found", { status: 404 });
      const r = await getPublicSite(env, slug);
      if (!r) {
        // Check if site exists but is unpublished — show Coming Soon instead of 404
        const rawSite = await one("SELECT slug, published, suspended FROM sites WHERE slug=$1", [slug]);
        if (rawSite && !rawSite.published && !rawSite.suspended) {
          return new Response(comingSoonPage(slug), { status: 200, headers: HTML });
        }
        if (rawSite && rawSite.suspended) return new Response(suspendedPage(), { status: 403, headers: HTML });
        return new Response(notFoundPage(slug), { status: 404, headers: HTML });
      }
      if (r.suspended) return new Response(suspendedPage(), { status: 403, headers: HTML });
      // Only count one view per slug per browser per 24h (cookie-based cooldown).
      const viewCookieName = `__v_${slug}`;
      const viewCookies = (request.headers.get("cookie") || "");
      const alreadyViewed = new RegExp(`(?:^|;\\s*)${viewCookieName}=`).test(viewCookies);
      const respHeaders = { ...HTML, "cache-control": "public, max-age=30" };
      if (r.id && !alreadyViewed) {
        const ref = request.headers.get("referer") || request.headers.get("Referer") || "";
        ctx.waitUntil(bumpStat(env, r.id, "views", ref));
        respHeaders["set-cookie"] = `${viewCookieName}=1; Path=/${slug}; Max-Age=86400; SameSite=Lax; Secure`;
      }
      const paid = r.plan !== "free";
      return new Response(
        renderLeaderboard(r.data, {
          watermark: !paid, homeUrl: url.origin, slug,
          logoUrl: paid && r.data.branding?.hasLogo ? `${url.origin}/logo/${slug}` : null,
        }),
        { headers: respHeaders }
      );
    }

    return new Response("not found", { status: 404 });
  } catch (err) {
    const errPath = (() => { try { return new URL(request.url).pathname; } catch { return "unknown"; } })();
    console.error(`[leaderboard] unhandled error on ${errPath}:`, String(err?.message || err), err?.stack || "");
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
},
};

// HTML-escape a value for interpolation into text/attribute context. Mirrors
// render.js's esc(); duplicated here so index.js doesn't pull render.js's SSR
// deps into the route layer.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function notFoundPage(slug) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>No leaderboard here</h1><p>There's no page at <b>/${esc(slug)}</b> yet.</p><p><a href="/">Back to YourRank</a></p></div></body></html>`;
}

function suspendedPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unavailable</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>This page is unavailable</h1><p>The owner's account is suspended.</p><p><a href="/">YourRank</a></p></div></body></html>`;
}

function comingSoonPage(slug) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coming Soon</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}h1{font-size:48px;margin:0 0 12px}p{color:rgba(255,255,255,0.5);font-size:16px}</style></head>
<body><div class="b"><h1>🚧 Coming Soon</h1><p>This leaderboard is being set up. Check back soon!</p><p><a href="/">YourRank</a></p></div></body></html>`;
}

async function handleSignup(request, env) {
  try {
    if (!(await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600))) return bad("Too many attempts. Try again later.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    let slug = slugify(body.slug || name || email.split("@")[0]);
    if (!isEmail(email)) return bad("Enter a valid email");
    if (password.length < 8) return bad("Password must be at least 8 characters");
    if (!slug || RESERVED.has(slug)) slug = `${slug || "site"}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await one("SELECT id FROM users WHERE email=$1", [email]);
    if (existing) return bad("If this email isn't already registered, check your inbox to confirm.");
    let finalSlug = slug;
    for (let n = 2; ; n++) { const c = await one("SELECT id FROM sites WHERE slug=$1", [finalSlug]); if (!c) break; finalSlug = `${slug}-${n}`; }
    const { hash, salt } = await hashPassword(password);
    const userId = uuid();
  // created_at/updated_at default to now(); id generated in-app for consistency.
  // The slug check above is a TOCTOU race: two concurrent signups choosing the
  // same slug can both pass the SELECT, then the second INSERT hits sites.slug
  // UNIQUE and threw an unhandled 500. Wrap the inserts; on a unique violation
  // (23505) on the slug, append a short random suffix and retry once.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await getSql().begin(async (tx) => {
        await tx.unsafe("INSERT INTO users (id,email,password_hash,password_salt,plan,status) VALUES ($1,$2,$3,$4,$5,$6)", [userId, email, hash, salt, "free", "active"]);
        await tx.unsafe("INSERT INTO sites (id,user_id,slug,name,casino,prize_pool,period,published,extra_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)", [uuid(), userId, finalSlug, name || finalSlug, "Stake", "$0", "Monthly", true, JSON.stringify(DEFAULT_EXTRA)]);
      });
      break;
    } catch (e) {
      const msg = String(e?.message || e);
      if (/23505/.test(msg) && attempt < 2) {
        // unique violation — likely the slug raced; retry with a fresh suffix
        finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      // users.email UNIQUE collision (already checked above, but concurrent) or
      // a real error: surface a clean message, never a raw 500.
      return bad("If this email isn't already registered, check your inbox to confirm.");
    }
  }
  const token = await createSession(env, userId);
    return json({ ok: true, user: { id: userId, email, slug: finalSlug } }, 200, { "set-cookie": cookieSet(token) });
  } catch (e) {
    console.error("signup failed:", String(e?.message || e));
    return bad("Sign-up failed, please try again", 500);
  }
}

async function handleLogin(request, env) {
    try {
    if (!(await rateLimit(env, `login:${clientIp(request)}`, 20, 600))) return bad("Too many attempts. Try again in a few minutes.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!isEmail(email) || !password) return bad("Email and password required");
    const user = await one("SELECT id,email,password_hash,password_salt,status FROM users WHERE email=$1", [email]);
    if (!user || !user.password_hash) return bad("Incorrect email or password", 401);
    const { ok, needsRehash } = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) return bad("Incorrect email or password", 401);
    // BE-014: Use generic error even for suspended accounts to prevent
    // account enumeration. Previously the suspended message confirmed the
    // email existed, distinguishing it from a wrong-password error.
    if (user.status === "suspended") return bad("Incorrect email or password", 403);
    // Lazy upgrade: if the stored hash used fewer PBKDF2 iterations than the
    // current target, re-hash at the new count and persist — no password reset
    // needed. Fire-and-forget so login latency isn't dominated by the rehash.
    if (needsRehash) {
      const { hash, salt } = await hashPassword(password);
      exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, user.id]).catch(() => {});
    }
    const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
    const token = await createSession(env, user.id);
    return json({ ok: true, user: { id: user.id, email: user.email, slug: site?.slug || null } }, 200, { "set-cookie": cookieSet(token) });
    } catch (e) {
      console.error("login failed:", String(e?.message || e));
      return bad("Login failed, please try again", 500);
    }
  }

async function handleLogout(request, env) {
  await destroySession(env, readToken(request));
  return json({ ok: true }, 200, { "set-cookie": cookieClear() });
}

async function handleMe(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return json({ ok: false, user: null });
    const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
    const boards = await getUserBoardsList(env, user.id);
    const plan = effectivePlan(user);
    // Check if the most recent active subscription is from a trial
    let isTrial = false;
    if (plan === "pro" && user.has_trial) {
      try {
        const sub = await one("SELECT provider FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1", [user.id]);
        isTrial = sub?.provider === "trial";
      } catch {}
    }
    return json({ ok: true, user: {
      id: user.id, email: user.email,
      plan, planExpiresAt: user.plan_expires_at || 0,
      status: user.status, isAdmin: !!user.is_admin, slug: site?.slug || null,
      limits: { players: PLAN_LIMITS[plan], boards: BOARD_LIMITS[plan] },
      proPrice: priceUsd(env, "pro"),
      hasTrial: !!user.has_trial,
      isTrial,
      boards,
    } });
  } catch (e) {
    console.error("handleMe error:", String(e?.message || e), String(e?.stack || ""));
    return json({ ok: false, error: "Internal error", detail: String(e?.message || e) }, 500);
  }
}

// POST /api/auth/forgot — always answers ok; never reveals whether the account exists.
async function handleForgot(request, env) {
  if (!(await rateLimit(env, `forgot:${clientIp(request)}`, 5, 3600))) return bad("Too many attempts. Try again later.", 429);
  const body = await readJson(request);
  const email = String(body?.email || "").trim().toLowerCase();
  if (!isEmail(email)) return bad("Enter a valid email");
  // Per-email rate limit: 3 resets per hour (prevents email bomb abuse).
  if (!(await rateLimit(env, `forgot-email:${email}`, 3, 3600))) return bad("Too many attempts. Try again later.", 429);
  const user = await one("SELECT id, email FROM users WHERE email=$1", [email]);
  if (user) {
    const token = newToken();
    await env.SESSIONS.put(`reset:${token}`, user.id, { expirationTtl: 3600 });
    const link = `${new URL(request.url).origin}/reset?token=${token}`;
    const mail = resetEmail(link);
    const result = await sendEmail(env, { to: user.email, ...mail });
    if (!result.sent) {
      console.error("[forgot]: email send failed", result.reason);
      return bad("Couldn't send the reset email right now. Please try again in a few minutes or contact support.", 502);
    }
  }
  return ok({ message: "If that account exists, a reset link is on its way." });
}

// POST /api/auth/reset — { token, password }
async function handleReset(request, env) {
  const body = await readJson(request);
  const token = String(body?.token || "");
  const password = String(body?.password || "");
  if (!token) return bad("Missing reset token");
  if (password.length < 8) return bad("Password must be at least 8 characters");
  const userId = await env.SESSIONS.get(`reset:${token}`);
  if (!userId) return bad("This reset link is invalid or expired. Ask for a new one.", 400);
  const { hash, salt } = await hashPassword(password);
  await exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, userId]);
  await env.SESSIONS.delete(`reset:${token}`);
  // Revoke EVERY other live session for this user before issuing a fresh one.
  // Without this, a stolen session survives a victim-initiated reset for up to
  // the 30-day KV TTL. The per-user token index in shared/session.js makes this
  // possible without a schema change.
  await destroyAllUserSessions(env, userId);
  const session = await createSession(env, userId);
  return json({ ok: true }, 200, { "set-cookie": cookieSet(session) });
}

async function handleStats(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const site = await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  return json({ ok: true, stats: await getStats(env, site.id) });
}

async function handleHeatmap(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const site = await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  const [heatmap, referrers] = await Promise.all([
    getHeatmap(env, site.id),
    getTopReferrers(env, site.id),
  ]);
  return json({ ok: true, heatmap, referrers });
}

async function handleTrackCopy(request, env, ctx) {
  const body = await readJson(request);
  const slug = slugify(body.slug || "");
  if (!slug) return json({ ok: true });
  const site = await one("SELECT id FROM sites WHERE slug=$1 AND published=true", [slug]);
  if (site) ctx.waitUntil(bumpStat(env, site.id, "copies"));
  return json({ ok: true });
}

async function handleGetSite(request, env) {
      const { user, res } = await requireUser(request, env);
      if (res) return res;
      if (user.status === "suspended") return bad("This account is suspended.", 403);
      const url = new URL(request.url);
      const siteId = url.searchParams.get("siteId");
      const plan = effectivePlan(user);
      let s;
      if (siteId) {
        s = await getUserSiteById(env, user.id, siteId, plan);
      } else {
        s = await getUserSite(env, user.id, plan);
      }
      if (!s) return bad("No site for this account", 404);
      const boards = await getUserBoardsList(env, user.id);
      return json({ ok: true, slug: s.slug, published: s.published, plan: plan, data: s.data, notify: s.notify || {}, archives: s.archives, boards, siteId: s.id, customDomain: s.customDomain || "", domainStatus: s.domainStatus || "pending" });
    }

async function handleListBoards(request, env) {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);
    const plan = effectivePlan(user);
    const boards = await getUserBoardsList(env, user.id);
    return json({ ok: true, boards, limits: { boards: BOARD_LIMITS[plan], players: PLAN_LIMITS[plan] }, plan });
  }

async function handleCreateBoard(request, env) {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);
    if (!(await rateLimit(env, `createboard:${user.id}`, 5, 3600))) return bad("Too many requests. Try again later.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    let slug = slugify(body.slug || "");
    if (!slug) return bad("Enter a valid slug for the board URL.");
    const name = String(body.name || "").trim().slice(0, 80) || slug;
    const r = await createBoard(env, user.id, { slug, name });
    return r.error ? bad(r.error, 400) : json({ ok: true, id: r.id, slug: r.slug });
  }

// POST /api/site/archive — { label?, clear: "wagers"|"players"|"none" }
async function handleArchive(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `archive:${user.id}`, 10, 3600))) return bad("Too many archive actions. Try again later.", 429);
  const body = (await readJson(request)) || {};
  const r = await createArchive(env, user.id, { label: body.label, clear: body.clear });
  return r.error ? bad(r.error, 400) : json({ ok: true, label: r.label });
}

// POST /api/site/archive/delete — { id }
async function handleArchiveDelete(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const body = (await readJson(request)) || {};
  if (!body.id) return bad("id required");
  const r = await deleteArchive(env, user.id, body.id);
  return r.error ? bad(r.error, 400) : json({ ok: true });
}

async function handlePutSite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  const payload = await readJson(request);
  if (!payload) return bad("Invalid request");
  const r = await saveSite(env, user, payload, payload.siteId || null);
  return r.error ? bad(r.error, 400) : json({ ok: true });
}

async function handleLead(request, env) {
  if (!(await rateLimit(env, `lead:${clientIp(request)}`, 5, 3600))) return bad("Too many requests. Try again later.", 429);
  const body = await readJson(request);
  if (!body) return bad("Invalid request");
  const handle = String(body.handle || "").slice(0, 120), casino = String(body.casino || "").slice(0, 60);
  const contact = String(body.contact || "").slice(0, 160), note = String(body.note || "").slice(0, 500);
  if (!handle && !contact) return bad("Tell us who you are");
  await exec("INSERT INTO leads (id,handle,casino,contact,note) VALUES ($1,$2,$3,$4,$5)", [uuid(), handle, casino, contact, note]);
  if (env.LEAD_WEBHOOK_URL) {
    // Strip Discord/Slack mention syntax so a lead submitter can't @everyone,
    // <@&role-id>, or otherwise ping the operator's server through the webhook.
    const safe = (s) => String(s ?? "").replace(/@/g, "@\u200b").replace(/</g, "<\u200b");
    try {
      await fetch(env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({ content: `New YourRank lead: ${safe(handle)} (${safe(casino)}) — ${safe(contact)}\n${safe(note)}` }),
      });
    } catch (err) { console.error("[leadWebhook]: webhook delivery failed", err); }
  }
  return json({ ok: true });
}

// POST /api/bot/connect — validate a Telegram bot token via getMe, then set the webhook.
async function handleBotConnect(request, env) {
try {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);

  const body = await readJson(request);
  if (!body) return bad("Invalid request");
  const token = String(body.token || "").trim();
  // Basic format check: digits:alphanumeric
  if (!/^\d{8,}:[A-Za-z0-9_-]{30,}$/.test(token)) return bad("That doesn't look like a valid bot token. Copy the full string from BotFather.");

  if (!(await rateLimit(env, `bot-connect:${user.id}`, 5, 3600))) return bad("Too many attempts. Try again later.", 429);

  // Step 1: Validate the token by calling Telegram getMe
  let meData;
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(10_000),
    });
    meData = await meRes.json();
  } catch {
    return bad("Couldn't reach Telegram. Try again in a moment.", 502);
  }
  if (!meData.ok) return bad("Telegram says this token is invalid. Double-check it from BotFather and try again.");

  const botName = meData.result.first_name || "Bot";
  const botUsername = meData.result.username || "";

  // Step 2: Set the webhook
  const webhookUrl = "https://chat.groupsmix.com/webhooks/telegram";
  try {
    const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });
    const whData = await whRes.json();
    if (!whData.ok) return bad(`Webhook setup failed: ${whData.description || "unknown error"}. You may need to retry.`);
  } catch {
    return bad("Couldn't set the webhook. Try again in a moment.", 502);
  }

  return json({ ok: true, botName, botUsername });
} catch (e) {
  console.error("bot connect failed:", String(e?.message || e));
  return bad("Something went wrong. Try again.", 500);
}
}

// POST /api/site/notify/test — send a test Discord or Telegram notification.
async function handleNotifyTest(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (effectivePlan(user) === "free") return bad("Notifications are a Pro feature. Upgrade to unlock.", 403);

  const body = await readJson(request);
  if (!body) return bad("Invalid request");
  const channel = String(body.channel || "").trim(); // "discord" or "telegram"

  const site = await getByUser(env, user.id);
  if (!site) return bad("No site found", 404);
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};

  if (channel === "discord") {
    const webhookUrl = String(body.webhook_url || extra.discord_webhook_url || "").trim();
    if (!webhookUrl) return bad("No Discord webhook URL configured.");
    if (!/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+/.test(webhookUrl) &&
        !/^https:\/\/discordapp\.com\/api\/webhooks\/\d+\/.+/.test(webhookUrl)) {
      return bad("That doesn't look like a valid Discord webhook URL.");
    }
    const embed = buildTop3Embed(site.name || "Your Site", "TestPlayer", 1, 99999);
    embed.title = "🧪 Test Notification";
    embed.description = "Your Discord webhook is set up correctly!";
    embed.fields.push({ name: "Status", value: "✅ Notifications are working.", inline: false });
    const result = await sendDiscordWebhook(webhookUrl, embed);
    return result.ok ? json({ ok: true, message: "Test message sent to Discord!" }) : bad(result.error || "Failed to send.", 502);
  }

  if (channel === "telegram") {
    const chatId = String(body.chat_id || extra.telegram_chat_id || "").trim();
    if (!chatId) return bad("No Telegram chat ID configured.");
    // Find bot token
    const owner = await one("SELECT bot_token FROM users WHERE id=$1", [user.id]);
    if (!owner?.bot_token) return bad("No Telegram bot connected. Set up your bot first.");
    const text = `🧪 *Test Notification*\n\nYour Telegram notifications for *${site.name || "Your Site"}* are working!`;
    const result = await sendTelegramMessage(owner.bot_token, chatId, text);
    return result.ok ? json({ ok: true, message: "Test message sent to Telegram!" }) : bad(result.error || "Failed to send.", 502);
  }

  return bad("Unknown channel. Use 'discord' or 'telegram'.");
}

// POST /api/billing/trial — start a free 7-day Pro trial (one-time per user).
async function handleTrial(request, env) {
try {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);

  // Gate: one trial ever
  if (user.has_trial) return bad("You've already used your free trial.", 400);

  // Don't allow trial if already on a paid plan
  const current = effectivePlan(user);
  if (current !== "free") return bad("You're already on a paid plan.", 400);

  // Activate 7-day Pro trial
  await activatePro(env, user.id, 7, { provider: "trial" });

  // Mark has_trial = true so they can never trial again
  await exec("UPDATE users SET has_trial=TRUE, updated_at=now() WHERE id=$1", [user.id]);

  // Calculate expiry for the response
  const expiresMs = Date.now() + 7 * 86400000;
  const expiresAt = new Date(expiresMs).toISOString();

  return json({ ok: true, expiresAt, days: 7 });
} catch (e) {
  console.error("trial failed:", String(e?.message || e));
  return bad("Couldn't start trial. Try again.", 500);
}
}

// POST /api/scores — authenticated by X-Postback-Key header.
// Validates key against sites table, checks Pro plan gate, replaces player list.
async function handleScores(request, env) {
try {
  const postbackKey = request.headers.get("x-postback-key");
  if (!postbackKey) return bad("Missing X-Postback-Key header.", 401);
  // Rate limit: 10/min per key
  if (!(await rateLimit(env, `scores:${postbackKey}`, 10, 60))) return bad("Rate limit exceeded. Try again shortly.", 429);
  // Validate key against sites table
  const site = await one("SELECT id, user_id FROM sites WHERE postback_key=$1", [postbackKey]);
  if (!site) return bad("Invalid postback key.", 401);
  // Gate behind Pro plan
  const owner = await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [site.user_id]);
  const plan = effectivePlan(owner);
  if (plan !== "pro" && plan !== "agency") return bad("Score API is a Pro feature. Upgrade to unlock.", 403);
  const body = await readJson(request);
  if (!body) return bad("Invalid JSON body.");
  const slug = String(body.slug || "").trim();
  const players = body.players;
  if (!Array.isArray(players)) return bad("players must be an array.");
  // Plan gate: player count
  const validPlayers = players.filter(p => p && p.name);
  if (validPlayers.length > PLAN_LIMITS[plan]) return bad(`Your plan allows up to ${PLAN_LIMITS[plan]} players.`, 400);
  // Fetch existing site data to preserve brand settings
  const existingSite = await one("SELECT id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at FROM sites WHERE id=$1", [site.id]);
  if (!existingSite) return bad("Site not found.", 404);
  // Reuse saveSite with just the players update — pass minimal payload
  const user = owner;
  const savePayload = {
    brand: { name: existingSite.name, tagline: existingSite.tagline, casino: existingSite.casino, code: existingSite.code, ctaUrl: existingSite.cta_url, prizePool: existingSite.prize_pool, period: existingSite.period, resetNote: existingSite.reset_note },
    partner: { blurb: existingSite.blurb },
    players: validPlayers.map(p => ({ name: String(p.name).slice(0, 40), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 })),
  };
  const r = await saveSite(env, user, savePayload, site.id);
  return r.error ? bad(r.error, 400) : json({ ok: true, players: validPlayers.length });
} catch (e) {
  console.error("scores API failed:", String(e?.message || e));
  return bad("Internal error.", 500);
}
}

// POST /api/site/domain/verify — verify custom domain CNAME and provision TLS
// via Cloudflare for SaaS custom hostnames. Pro/Agency only.
async function handleDomainVerify(request, env) {
try {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  const plan = effectivePlan(user);
  if (plan !== "pro" && plan !== "agency") return bad("Custom domains are a Pro feature.", 403);

  const body = await readJson(request);
  if (!body || !body.domain) return bad("Domain required");
  const domain = String(body.domain).trim().toLowerCase();
  // Basic domain validation
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domain)) {
    return bad("Invalid domain format.");
  }

  // Get the site
  const siteId = body.siteId || null;
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("No site found", 404);

  const zoneId = env.CF_ZONE_ID || "dd79a3ac13643b94732f2fef6ce3b1f5";
  const cfToken = env.CF_API_TOKEN;

  if (!cfToken) {
    // Fallback: just save the domain without TLS provisioning
    await exec("UPDATE sites SET custom_domain=$1, updated_at=now() WHERE id=$2", [domain, site.id]);
    return ok({ status: "saved", message: "Domain saved. TLS automation is not configured — contact support." });
  }

  // Step 1: Check if there's already a custom hostname for this domain
  const existing = await one(
    "SELECT custom_hostname_id, domain_status FROM sites WHERE id=$1",
    [site.id]
  );

  if (existing?.custom_hostname_id && existing?.domain_status === "active") {
    // Already active — check with CF to confirm
    try {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${existing.custom_hostname_id}`,
        {
          headers: { "Authorization": `Bearer ${cfToken}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000),
        }
      );
      const cfData = await cfRes.json();
      if (cfData.success && cfData.result?.ssl?.status === "active") {
        return ok({ status: "active", message: "TLS is active on your custom domain." });
      }
    } catch (e) {
      console.error("[domain] CF status check failed:", String(e?.message || e));
    }
  }

  // Step 2: If there's an existing custom_hostname_id, check its status first
  if (existing?.custom_hostname_id) {
    try {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${existing.custom_hostname_id}`,
        {
          headers: { "Authorization": `Bearer ${cfToken}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000),
        }
      );
      const cfData = await cfRes.json();
      if (cfData.success) {
        const cfStatus = cfData.result?.ssl?.status || "pending";
        const dbStatus = cfStatus === "active" ? "active" : cfStatus === "pending_validation" || cfStatus === "pending_issuance" ? "pending" : "pending";
        await exec("UPDATE sites SET domain_status=$1, updated_at=now() WHERE id=$2", [dbStatus, site.id]);
        return ok({ status: dbStatus, customHostnameId: existing.custom_hostname_id, message: dbStatus === "active" ? "TLS is active!" : "TLS provisioning in progress. This can take a few minutes." });
      }
    } catch (e) {
      console.error("[domain] CF status check failed:", String(e?.message || e));
    }
  }

  // Step 3: Create a new custom hostname via CF API
  let cfResult;
  try {
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${cfToken}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          hostname: domain,
          ssl: { method: "http", type: "dv" },
        }),
      }
    );
    cfResult = await cfRes.json();
  } catch (e) {
    console.error("[domain] CF create failed:", String(e?.message || e));
    return bad("Failed to connect to Cloudflare. Try again.", 502);
  }

  if (!cfResult.success) {
    const errMsg = cfResult.errors?.[0]?.message || "Cloudflare API error";
    console.error("[domain] CF error:", errMsg);
    // Save domain even if CF fails, for manual resolution
    await exec("UPDATE sites SET custom_domain=$1, domain_status='error', updated_at=now() WHERE id=$2", [domain, site.id]);
    return ok({ status: "error", message: errMsg });
  }

  const chId = cfResult.result?.id;
  const chStatus = cfResult.result?.ssl?.status || "pending";
  const dbStatus = chStatus === "active" ? "active" : "pending";

  // Save domain, custom_hostname_id, and status
  await exec(
    "UPDATE sites SET custom_domain=$1, custom_hostname_id=$2, domain_status=$3, updated_at=now() WHERE id=$4",
    [domain, chId, dbStatus, site.id]
  );

  invalidateSiteCache(site.slug);
  invalidateSiteCache(user.id);

  return ok({
    status: dbStatus,
    customHostnameId: chId,
    message: dbStatus === "active"
      ? "TLS is active on your custom domain!"
      : "TLS provisioning started. Point a CNAME for your domain to yourrank.site, then check back in a few minutes.",
  });
} catch (e) {
  console.error("[domain] verify failed:", String(e?.message || e));
  return bad("Domain verification failed. Try again.", 500);
}
}
