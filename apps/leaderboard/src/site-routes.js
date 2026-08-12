// Public multi-section site route handler.
// This is the single entry-point for /<slug> and /<slug>/<section> on the
// primary domain, plus the matching paths on custom domains. It enforces
// section visibility server-side, resolves the viewer session, and renders
// the shared site shell.
import { getPublicSite } from "./site.js";
import { resolveViewer } from "../../../shared/viewer-session.js";
import { createQueueProducer } from "../../../shared/queue-producer.js";
import { bumpStat } from "./stats.js";
import { hashToken } from "../../../shared/crypto.js";
import { HTML, withNonce, notFoundPage, pendingVerificationPage, error500Page } from "./middleware/headers.js";
import { generateCsrfToken, csrfCookie } from "./middleware/csrf.js";
import { renderPasswordGate } from "./render.jsx";
import { renderSite } from "./site-render.js";
import { getViewerSiteData } from "./site-data.js";
import {
  cachedPublicBoardResponse,
  getPublicBoardCache,
  isPublicBoardCacheRequest,
  isPublicBoardCacheSite,
  PUBLIC_HTML_CSRF_PLACEHOLDER,
  PUBLIC_HTML_NONCE_PLACEHOLDER,
  putPublicBoardCache,
} from "./public-html-cache.js";

const SECTIONS = new Set(["home", "leaderboard", "shop", "games", "me"]);

export function parseSitePath(path, isCustomDomain, customSlug) {
  const clean = (path || "").replace(/\/$/, "") || "/";
  if (isCustomDomain) {
    if (clean === "/") return { slug: customSlug, section: "home" };
    const seg = clean.slice(1).split("/")[0];
    if (SECTIONS.has(seg) && clean === `/${seg}`) return { slug: customSlug, section: seg };
    return null;
  }
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const slug = decodeURIComponent(parts[0]).toLowerCase();
  if (parts.length === 1) return { slug, section: "home" };
  if (parts.length === 2) {
    const section = parts[1].toLowerCase();
    if (SECTIONS.has(section)) return { slug, section };
  }
  return null;
}

function enqueueBump(env, ctx, siteId, field, referer, visitorHash) {
  const producer = createQueueProducer(
    env.EVENTS_QUEUE,
    async (event) => {
      if (event.type === "bump") {
        await bumpStat(event.siteId, event.field, event.referer, event.visitorHash);
      }
    }
  );
  const p = producer.send({ type: "bump", siteId, field, referer, visitorHash, timestamp: Date.now() });
  ctx.waitUntil(p);
}

async function bumpView(env, ctx, request, siteId, slug, headers) {
  const cookies = request.headers.get("cookie") || "";
  let vid = "";
  let consent = "";
  for (const c of cookies.split(";")) {
    const [k, v] = c.trim().split("=");
    if (k === "yr_vid") vid = decodeURIComponent(v || "");
    if (k === "yr_consent") consent = decodeURIComponent(v || "");
  }
  const analyticsAllowed = consent === "all";
  if (!analyticsAllowed) return;

  if (!vid) {
    vid = crypto.randomUUID();
    headers.append("set-cookie", `yr_vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  }
  const visitorHash = await hashToken(`${vid}:${siteId}`);
  const viewCookieName = `__v_${slug}`;
  const alreadyViewed = new RegExp(`(?:^|;\\s*)${viewCookieName}=`).test(cookies);
  if (!alreadyViewed) {
    const ref = request.headers.get("referer") || "";
    enqueueBump(env, ctx, siteId, "views", ref, visitorHash);
    headers.append("set-cookie", `${viewCookieName}=1; Path=/${slug}; Max-Age=86400; SameSite=Lax; Secure`);
  }
}

export async function renderSiteRoute({ request, env, ctx, nonce, slug, section, isCustomDomain }) {
  const cacheableRequest = isPublicBoardCacheRequest(request, section);
  const renderNonce = cacheableRequest ? PUBLIC_HTML_NONCE_PLACEHOLDER : nonce;
  const HTML_N = withNonce(HTML, renderNonce);
  const respHeaders = new Headers({ ...HTML_N, "cache-control": "no-store" });

  try {
    if (cacheableRequest) {
      const cached = await getPublicBoardCache(request);
      if (cached) {
        const csrfToken = generateCsrfToken();
        return cachedPublicBoardResponse(cached, nonce, csrfToken, csrfCookie(csrfToken));
      }
    }

    const r = await getPublicSite(env, slug, request);
    if (r && r.requiresPassword) {
      return new Response(renderPasswordGate(r, { nonce, isCustomDomain }), { headers: respHeaders });
    }
    if (r && r.pendingVerification) {
      return new Response(pendingVerificationPage(nonce), { status: 403, headers: HTML_N });
    }
    if (!r || r.suspended) {
      return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
    }

    const siteSections = r.data?.siteSections || { home: true, leaderboard: true, shop: true, games: false, me: true };
    if (!siteSections[section]) {
      return new Response(notFoundPage(slug, nonce), { status: 404, headers: HTML_N });
    }

    const { viewer, cookie: viewerCookie } = await resolveViewer(request, env);
    if (viewerCookie) respHeaders.append("set-cookie", viewerCookie);

    const csrfToken = cacheableRequest ? PUBLIC_HTML_CSRF_PLACEHOLDER : generateCsrfToken();
    respHeaders.append("set-cookie", csrfCookie(csrfToken));

    const url = new URL(request.url);
    const homeUrl = url.origin;
    const paid = r.plan !== "free";
    const watermark = !paid;
    const logoUrl = paid && r.data?.branding?.hasLogo ? `${homeUrl}/logo/${slug}` : null;

    let viewerData = null;
    if (section === "home" || section === "shop" || section === "me") {
      // Home shows the featured reward grid (public), plus the signed-in
      // viewer's balance, 7-day chart, activity log and pending count.
      const opts = { shop: true, redemptions: !!viewer, ledger: !!viewer };
      viewerData = await getViewerSiteData(r.id, viewer?.id || null, opts);
    } else if (viewer) {
      // Leaderboard and Games only need the balance shown in the header.
      viewerData = await getViewerSiteData(r.id, viewer.id);
    }

    if (section === "home" || section === "leaderboard") {
      await bumpView(env, ctx, request, r.id, slug, respHeaders);
    }

    const html = await renderSite({
      r,
      section,
      viewer,
      viewerData,
      opts: { nonce, homeUrl, slug, isCustomDomain, logoUrl, watermark, csrfToken, boards: r.boards, botUsername: r.botUsername },
    });
    const response = new Response(html, { headers: respHeaders });
    if (cacheableRequest && isPublicBoardCacheSite(r)) {
      if (ctx?.waitUntil) ctx.waitUntil(putPublicBoardCache(request, response));
      else await putPublicBoardCache(request, response);
      const servedCsrfToken = generateCsrfToken();
      return cachedPublicBoardResponse(response, nonce, servedCsrfToken, csrfCookie(servedCsrfToken));
    }
    return response;
  } catch (err) {
    console.error("[site-routes]", String(err?.message || err), err?.stack);
    return new Response(error500Page(nonce), { status: 500, headers: HTML_N });
  }
}
