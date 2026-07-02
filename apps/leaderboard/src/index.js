import { hashPassword, verifyPassword, uuid, newToken, createSession, destroySession, destroyAllUserSessions, currentUser, requireUser, isEmail, slugify, RESERVED, cookieSet, cookieClear, readToken, json, bad, ok, readJson, rateLimit, clientIp } from "./auth.js";
import { DEFAULT_EXTRA, getPublicSite, getUserSite, saveSite, getByUser, createArchive, deleteArchive } from "./site.js";
import { renderLeaderboard } from "./render.js";
import { PAGES } from "./pages.js";
import { effectivePlan, PLAN_LIMITS, priceUsd, handleCheckout, handleIpn } from "./billing.js";
import { handleOverview, handleUsers, handleLeads, handlePayments, handleAction } from "./admin.js";
import { sendEmail, resetEmail } from "./email.js";
import { bumpStat, getStats } from "./stats.js";
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js } from "./assets_bundled.js";
import { query, one } from "./db.js";
import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";

const MIME = {
  ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
};
const HTML = { "content-type": "text/html; charset=utf-8" };
// Hardened headers for the authenticated/app pages (login, signup, forgot,
// reset, dashboard, admin). The public leaderboard keeps the plain HTML set
// (it's intentionally iframe-able and loads Google Fonts) so we scope security
// headers only to the pages that hold sessions/credentials. CSP allows inline
// styles (the templates use <style> blocks) + Google Fonts (the auth pages load
// them); nothing else. nosniff + Referrer-Policy are free wins everywhere.
const SECURE_HTML = {
  "content-type": "text/html; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
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
      };
      const entry = map[path];
      if (entry) return new Response(entry[0], { headers: { "content-type": MIME[entry[1]], "cache-control": "public, max-age=3600" } });
      return new Response("not found", { status: 404 });
    }

    // --- pages ---
    if (path === "/" || path === "/index.html") return new Response(PAGES.index, { headers: HTML });
    if (path === "/login" || path === "/login.html") return new Response(PAGES.login, { headers: SECURE_HTML });
  // GET /logout — the shared shell nav links here (a plain <a> can't POST).
  // Destroy the session from the cookie's token, clear the cookie, and send the
  // user to the login page. The in-page buttons still hit POST /api/auth/logout.
  if ((path === "/logout" || path === "/logout.html") && method === "GET") {
    await destroySession(env, readToken(request));
    return new Response(null, { status: 302, headers: { "set-cookie": cookieClear(), location: "/login" } });
  }
    if (path === "/signup" || path === "/signup.html") return new Response(PAGES.signup, { headers: SECURE_HTML });
    if (path === "/dashboard" || path === "/dashboard.html") {
      const user = await currentUser(request, env);
      if (!user) return Response.redirect(new URL("/login", url), 302);
      const html = PAGES.dashboard
        .replace("<!--GM_NAV_CSS-->", `<style>${SHELL_NAV_CSS}</style>`)
        .replace("<!--GM_NAV-->", shellNavHtml({ activePath: "/dashboard", user }));
      return new Response(html, { headers: SECURE_HTML });
    }
    if (path === "/forgot") return new Response(PAGES.forgot, { headers: SECURE_HTML });
    if (path === "/reset") return new Response(PAGES.reset, { headers: SECURE_HTML });
    if (path === "/admin") return new Response(PAGES.admin, { headers: SECURE_HTML });
    if (path === "/terms") return new Response(PAGES.terms, { headers: HTML });
    if (path === "/privacy") return new Response(PAGES.privacy, { headers: HTML });
    if (path === "/responsible") return new Response(PAGES.responsible, { headers: HTML });

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

    // --- API: auth ---
    if (path === "/api/auth/signup" && method === "POST") return handleSignup(request, env);
    if (path === "/api/auth/login" && method === "POST") return handleLogin(request, env);
    if (path === "/api/auth/logout" && method === "POST") return handleLogout(request, env);
    if (path === "/api/auth/me" && method === "GET") return handleMe(request, env);
    if (path === "/api/auth/forgot" && method === "POST") return handleForgot(request, env);
    if (path === "/api/auth/reset" && method === "POST") return handleReset(request, env);

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

    // --- API: admin ---
    if (path === "/api/admin/overview" && method === "GET") return handleOverview(request, env);
    if (path === "/api/admin/users" && method === "GET") return handleUsers(request, env);
    if (path === "/api/admin/leads" && method === "GET") return handleLeads(request, env);
    if (path === "/api/admin/payments" && method === "GET") return handlePayments(request, env);
    if (path === "/api/admin/action" && method === "POST") return handleAction(request, env);

    // --- API: public data ---
    if (path.startsWith("/api/public/") && method === "GET") {
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
      if (r.id) ctx.waitUntil(bumpStat(env, r.id, "views"));
      const pro = r.plan === "pro";
      return new Response(
        renderLeaderboard(r.data, {
          watermark: !pro, homeUrl: url.origin, slug,
          logoUrl: pro && r.data.branding?.hasLogo ? `${url.origin}/logo/${slug}` : null,
        }),
        { headers: { ...HTML, "cache-control": "public, max-age=30" } }
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
<body><div class="b"><h1>No leaderboard here</h1><p>There's no page at <b>/${esc(slug)}</b> yet.</p><p><a href="/">Back to RankUp</a></p></div></body></html>`;
}

function suspendedPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unavailable</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>This page is unavailable</h1><p>The owner's account is suspended.</p><p><a href="/">RankUp</a></p></div></body></html>`;
}

async function handleSignup(request, env) {
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
  if (existing) return bad("An account with that email already exists", 409);
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
      await query("INSERT INTO users (id,email,password_hash,password_salt,plan,status) VALUES ($1,$2,$3,$4,$5,$6)", [userId, email, hash, salt, "free", "active"]);
      await query("INSERT INTO sites (id,user_id,slug,name,casino,prize_pool,period,published,extra_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)", [uuid(), userId, finalSlug, name || finalSlug, "Stake", "$0", "Monthly", true, JSON.stringify(DEFAULT_EXTRA)]);
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
      return bad(/users_email_key|23505.*email/i.test(msg) ? "An account with that email already exists" : "Sign-up failed, please try again", 409);
    }
  }
  const token = await createSession(env, userId);
  return json({ ok: true, user: { id: userId, email, slug: finalSlug } }, 200, { "set-cookie": cookieSet(token) });
}

async function handleLogin(request, env) {
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
  if (user.status === "suspended") return bad("This account is suspended. Contact support.", 403);
  // Lazy upgrade: if the stored hash used fewer PBKDF2 iterations than the
  // current target, re-hash at the new count and persist — no password reset
  // needed. Fire-and-forget so login latency isn't dominated by the rehash.
  if (needsRehash) {
    const { hash, salt } = await hashPassword(password);
    query("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, user.id]).catch(() => {});
  }
  const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
  const token = await createSession(env, user.id);
  return json({ ok: true, user: { id: user.id, email: user.email, slug: site?.slug || null } }, 200, { "set-cookie": cookieSet(token) });
}

async function handleLogout(request, env) {
  await destroySession(env, readToken(request));
  return json({ ok: true }, 200, { "set-cookie": cookieClear() });
}

async function handleMe(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ ok: false, user: null });
  const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
  return json({ ok: true, user: {
    id: user.id, email: user.email,
    plan: effectivePlan(user), planExpiresAt: user.plan_expires_at || 0,
    status: user.status, isAdmin: !!user.is_admin, slug: site?.slug || null,
    limits: { players: PLAN_LIMITS[effectivePlan(user)] }, proPrice: priceUsd(env),
  } });
}

// POST /api/auth/forgot — always answers ok; never reveals whether the account exists.
async function handleForgot(request, env) {
  if (!(await rateLimit(env, `forgot:${clientIp(request)}`, 5, 3600))) return bad("Too many attempts. Try again later.", 429);
  const body = await readJson(request);
  const email = String(body?.email || "").trim().toLowerCase();
  if (!isEmail(email)) return bad("Enter a valid email");
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
  await query("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, userId]);
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
  await query("INSERT INTO leads (id,handle,casino,contact,note) VALUES ($1,$2,$3,$4,$5)", [uuid(), handle, casino, contact, note]);
  if (env.LEAD_WEBHOOK_URL) {
    // Strip Discord/Slack mention syntax so a lead submitter can't @everyone,
    // <@&role-id>, or otherwise ping the operator's server through the webhook.
    const safe = (s) => String(s ?? "").replace(/@/g, "@\u200b").replace(/</g, "<\u200b");
    try {
      await fetch(env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: `New RankUp lead: ${safe(handle)} (${safe(casino)}) — ${safe(contact)}\n${safe(note)}` }),
      });
    } catch {}
  }
  return json({ ok: true });
}
