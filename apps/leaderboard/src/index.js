import { hashPassword, verifyPassword, uuid, newToken, createSession, destroySession, destroyAllUserSessions, currentUser, requireUser, isEmail, slugify, RESERVED, cookieSet, cookieClear, readToken, json, bad, ok, readJson, rateLimit, clientIp, handleAccountDelete } from "./auth.js";
import { DEFAULT_EXTRA, getPublicSite, getUserSite, saveSite, getByUser, createArchive, deleteArchive } from "./site.js";
import { renderLeaderboard } from "./render.js";
import { PAGES } from "./pages.js";
import { effectivePlan, PLAN_LIMITS, priceUsd, handleCheckout, handleIpn, activatePro } from "./billing.js";
import { handleOverview, handleUsers, handleLeads, handlePayments, handleAction } from "./admin.js";
import { sendEmail, resetEmail } from "./email.js";
import { bumpStat, getStats } from "./stats.js";
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js, analytics_js, billing_js, bot_setup_js } from "./assets_bundled.js";
import { query, one, exec, getSql } from "./db.js";
import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";

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

export default {
  async fetch(request, env, ctx) {
    // Populate process.env so the shared Postgres data layer (db.js) can read
    // the connection string. The Pool is created lazily on first query(), so
    // this must run before any DB call — mirrors the bot Worker's worker.ts.
    if (typeof globalThis.process === "undefined") globalThis.process = { env: {} };
    const pe = globalThis.process.env;
    pe.DATABASE_URL = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

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
    if (path === "/dashboard/referral") {
      try {
        const user = await currentUser(request, env);
        if (!user) return Response.redirect(new URL("/login", url), 302);
        const html = PAGES.referral
          .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
          .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard/referral", user }));
        return new Response(html, { headers: { ...SECURE_HTML, ...csrfHeader } });
      } catch (e) {
        console.error("referral render failed:", String(e?.message || e));
        return new Response("Referral page couldn't load right now — please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
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
    const CSRF_EXEMPT = new Set(["/api/billing/ipn", "/api/lead", "/api/track/copy"]);
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
    if (path === "/api/site/archive" && method === "POST") return handleArchive(request, env);
    if (path === "/api/site/archive/delete" && method === "POST") return handleArchiveDelete(request, env);
    if (path === "/api/site/stats" && method === "GET") return handleStats(request, env);
    if (path === "/api/lead" && method === "POST") return handleLead(request, env);
    if (path === "/api/track/copy" && method === "POST") return handleTrackCopy(request, env, ctx);

    // --- API: billing ---
    if (path === "/api/billing/checkout" && method === "POST") return handleCheckout(request, env);
    if (path === "/api/billing/ipn" && method === "POST") return handleIpn(request, env);

    // --- API: referral program ---
    if (path === "/api/referral/code" && method === "GET") return handleReferralCode(request, env);
    if (path === "/api/referral/claim" && method === "POST") return handleReferralClaim(request, env);
    if (path === "/api/referral/stats" && method === "GET") return handleReferralStats(request, env);

    // --- API: bot connect ---
    if (path === "/api/bot/connect" && method === "POST") return handleBotConnect(request, env);

    // --- API: admin ---
    if (path === "/api/admin/overview" && method === "GET") return handleOverview(request, env);
    if (path === "/api/admin/users" && method === "GET") return handleUsers(request, env);
    if (path === "/api/admin/leads" && method === "GET") return handleLeads(request, env);
    if (path === "/api/admin/payments" && method === "GET") return handlePayments(request, env);
    if (path === "/api/admin/action" && method === "POST") return handleAction(request, env);

    // --- API: public data ---
    if (path.startsWith("/api/public/") && method === "GET") {
      // Lightweight players-only endpoint for live polling
      const playersMatch = path.match(/^\/api\/public\/([^/]+)\/players$/);
      if (playersMatch) {
        const slug = decodeURIComponent(playersMatch[1]).toLowerCase();
        const r = await getPublicSite(env, slug);
        if (!r || r.suspended) return bad("not found", 404);
        const players = (r.data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
        return json({ players }, 200, { "cache-control": "public, max-age=10" });
      }
      const slug = decodeURIComponent(path.slice("/api/public/".length)).toLowerCase();
      const r = await getPublicSite(env, slug);
      return r && !r.suspended ? json(r.data, 200, { "cache-control": "public, max-age=30" }) : bad("not found", 404);
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

    // --- public leaderboard at /<slug> ---
    if (method === "GET" && path.length > 1 && !path.includes(".")) {
      const slug = decodeURIComponent(path.slice(1).split("/")[0]).toLowerCase();
      if (RESERVED.has(slug)) return new Response("not found", { status: 404 });
      const r = await getPublicSite(env, slug);
      if (!r) return new Response(notFoundPage(slug), { status: 404, headers: HTML });
      if (r.suspended) return new Response(suspendedPage(), { status: 403, headers: HTML });
      // Only count one view per slug per browser per 24h (cookie-based cooldown).
      const viewCookieName = `__v_${slug}`;
      const viewCookies = (request.headers.get("cookie") || "");
      const alreadyViewed = new RegExp(`(?:^|;\\s*)${viewCookieName}=`).test(viewCookies);
      const respHeaders = { ...HTML, "cache-control": "public, max-age=30" };
      if (r.id && !alreadyViewed) {
        ctx.waitUntil(bumpStat(env, r.id, "views"));
        respHeaders["set-cookie"] = `${viewCookieName}=1; Path=/${slug}; Max-Age=86400; SameSite=Lax; Secure`;
      }
      const pro = r.plan === "pro";
      return new Response(
        renderLeaderboard(r.data, {
          watermark: !pro, homeUrl: url.origin, slug,
          logoUrl: pro && r.data.branding?.hasLogo ? `${url.origin}/logo/${slug}` : null,
        }),
        { headers: respHeaders }
      );
    }

    return new Response("not found", { status: 404 });
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

async function handleSignup(request, env) {
    try {
      if (!(await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600))) return bad("Too many attempts. Try again later.", 429);
      const body = await readJson(request);
      if (!body) return bad("Invalid request");
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      let slug = slugify(body.slug || name || email.split("@")[0]);
      const refCode = String(body.ref || "").trim() || null;
      if (!isEmail(email)) return bad("Enter a valid email");
      if (password.length < 8) return bad("Password must be at least 8 characters");
      if (!slug || RESERVED.has(slug)) slug = `${slug || "site"}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = await one("SELECT id FROM users WHERE email=$1", [email]);
      if (existing) return bad("If this email isn't already registered, check your inbox to confirm.");
      let finalSlug = slug;
      for (let n = 2; ; n++) { const c = await one("SELECT id FROM sites WHERE slug=$1", [finalSlug]); if (!c) break; finalSlug = `${slug}-${n}`; }

      // Resolve referral code to a referrer user (before creating the new user).
      let referrer = null;
      if (refCode) {
        referrer = await one("SELECT id FROM users WHERE referral_code=$1", [refCode]);
      }

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
          const referrerId = referrer ? referrer.id : null;
          await tx.unsafe("INSERT INTO users (id,email,password_hash,password_salt,plan,status,referral_code,referred_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [userId, email, hash, salt, "free", "active", finalSlug, referrerId]);
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

    // Apply referral reward: 31 days Pro for both referrer and new user.
    if (referrer && referrer.id !== userId) {
      const REWARD_DAYS = 31;
      try {
        await exec("INSERT INTO referral_rewards (id, referrer_id, referred_id, reward_days) VALUES ($1, $2, $3, $4)", [uuid(), referrer.id, userId, REWARD_DAYS]);
        await activatePro(env, referrer.id, REWARD_DAYS, { provider: "referral", amountUsd: 0 });
        await activatePro(env, userId, REWARD_DAYS, { provider: "referral", amountUsd: 0 });
      } catch (e) {
        console.error("referral reward failed:", String(e?.message || e));
        // Non-fatal: user still gets created, just without the bonus.
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
    return json({ ok: true, user: {
      id: user.id, email: user.email,
      plan: effectivePlan(user), planExpiresAt: user.plan_expires_at || 0,
      status: user.status, isAdmin: !!user.is_admin, slug: site?.slug || null,
      limits: { players: PLAN_LIMITS[effectivePlan(user)] }, proPrice: priceUsd(env),
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
    await sendEmail(env, { to: user.email, ...mail });
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
    const s = await getUserSite(env, user.id);
    if (!s) return bad("No site for this account", 404);
    return json({ ok: true, slug: s.slug, published: s.published, plan: effectivePlan(user), data: s.data, archives: s.archives });
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
  const r = await saveSite(env, user, payload);
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

// GET /api/referral/code — returns the current user's referral code, URL, and stats.
async function handleReferralCode(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  try {
    // Ensure the user has a referral_code (backfill if somehow missing).
    let code = user.referral_code;
    if (!code) {
      const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
      code = site?.slug || user.id.slice(0, 8);
      await exec("UPDATE users SET referral_code=$1 WHERE id=$2 AND referral_code IS NULL", [code, user.id]);
    }
    const origin = new URL(request.url).origin;
    const countRow = await one("SELECT COUNT(*)::int AS count FROM referral_rewards WHERE referrer_id=$1", [user.id]);
    const daysRow = await one("SELECT COALESCE(SUM(reward_days),0)::int AS total_days FROM referral_rewards WHERE referrer_id=$1", [user.id]);
    return json({
      ok: true,
      code,
      url: `${origin}/signup?ref=${code}`,
      referrals_count: countRow?.count || 0,
      rewards_earned: daysRow?.total_days || 0,
    });
  } catch (e) {
    console.error("referral code error:", String(e?.message || e));
    return bad("Couldn't load referral info.", 500);
  }
}

// POST /api/referral/claim — apply a referral code to the current user (post-signup).
// Body: { code: string }
async function handleReferralClaim(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  try {
    const body = await readJson(request);
    const code = String(body?.code || "").trim();
    if (!code) return bad("Missing referral code");

    // Already referred?
    if (user.referred_by) return bad("You've already used a referral code.");

    const referrer = await one("SELECT id FROM users WHERE referral_code=$1", [code]);
    if (!referrer) return bad("Invalid referral code.");
    if (referrer.id === user.id) return bad("You can't refer yourself.");

    const REWARD_DAYS = 31;
    await exec("UPDATE users SET referred_by=$1 WHERE id=$2", [referrer.id, user.id]);
    await exec("INSERT INTO referral_rewards (id, referrer_id, referred_id, reward_days) VALUES ($1, $2, $3, $4)", [uuid(), referrer.id, user.id, REWARD_DAYS]);
    await activatePro(env, referrer.id, REWARD_DAYS, { provider: "referral", amountUsd: 0 });
    await activatePro(env, user.id, REWARD_DAYS, { provider: "referral", amountUsd: 0 });
    return json({ ok: true, message: "Referral applied! You both earned 31 days of Pro." });
  } catch (e) {
    console.error("referral claim error:", String(e?.message || e));
    return bad("Couldn't apply referral code.", 500);
  }
}

// GET /api/referral/stats — returns referral history for the dashboard.
async function handleReferralStats(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  try {
    const rows = await query(
      `SELECT rr.id, rr.reward_days, rr.created_at,
              u.email AS referred_email, s.slug AS referred_slug
       FROM referral_rewards rr
       JOIN users u ON u.id = rr.referred_id
       LEFT JOIN sites s ON s.user_id = u.id
       WHERE rr.referrer_id = $1
       ORDER BY rr.created_at DESC
       LIMIT 50`,
      [user.id]
    );
    return json({ ok: true, referrals: rows });
  } catch (e) {
    console.error("referral stats error:", String(e?.message || e));
    return bad("Couldn't load referral stats.", 500);
  }
}
