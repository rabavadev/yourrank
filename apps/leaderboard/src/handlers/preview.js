import { currentUser } from "../auth.js";
import { effectivePlan } from "../billing.js";
import { getUserSiteById, FONT_KEYS } from "../site.js";
import { renderLeaderboard } from "../render.js";
import { SECURE_HTML, withNonce } from "../middleware/headers.js";
import { validTemplate } from "../templates/index.js";

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function handleDashboardPreview(request, env, nonce) {
  const url = new URL(request.url);
  const user = await currentUser(request, env);
  if (!user) return Response.redirect(new URL("/login", url), 302);
  const plan = effectivePlan(user);
  const siteId = url.searchParams.get("board");
  if (!siteId) return new Response("board required", { status: 400 });
  const site = await getUserSiteById(env, user.id, siteId, plan);
  if (!site) return new Response("not found", { status: 404 });

  const template = validTemplate(url.searchParams.get("template"));
  const accentA = url.searchParams.get("accentA");
  const accentB = url.searchParams.get("accentB");
  const font = url.searchParams.get("font");
  const branding = { ...site.data.branding, template };
  if (plan !== "free" && HEX.test(accentA || "") && HEX.test(accentB || "")) {
    branding.accentA = accentA;
    branding.accentB = accentB;
  }
  if (plan !== "free" && FONT_KEYS.includes(font || "")) {
    branding.font = font;
  }
  const watermark = plan === "free" ? true : (site.data.sections?.poweredBy === true);
  const html = renderLeaderboard({ ...site.data, branding }, {
    watermark,
    homeUrl: url.origin,
    slug: "",
    nonce,
    preview: true,
    logoUrl: plan !== "free" && site.data.branding?.hasLogo ? `/logo/${site.slug}` : null,
  });
  return new Response(html, {
    headers: { ...withNonce(SECURE_HTML, nonce), "cache-control": "private, no-store" },
  });
}
