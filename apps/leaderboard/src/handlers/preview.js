import { currentUser } from "../auth.js";
import { effectivePlan } from "../billing.js";
import { getUserSiteById, FONT_KEYS } from "../site.js";
import { renderLeaderboard } from "../render.jsx";
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
  const device = url.searchParams.get("device") === "mobile" ? "mobile" : "desktop";
  
  let draftData = {};
  if (request.method === "POST") {
    draftData = await request.json().catch(() => ({}));
  }

  const mergedData = { ...site.data, ...draftData };
  const branding = { ...mergedData.branding, template };
  if (plan !== "free" && HEX.test(accentA || "") && HEX.test(accentB || "")) {
    branding.accentA = accentA;
    branding.accentB = accentB;
  }
  if (plan !== "free" && FONT_KEYS.includes(font || "")) {
    branding.font = font;
  }
  const watermark = plan === "free" ? true : (mergedData.sections?.poweredBy === true);
  let html = await renderLeaderboard({ ...mergedData, branding }, {
    watermark,
    homeUrl: url.origin,
    slug: "",
    nonce,
    preview: true,
    previewDevice: device,
    logoUrl: plan !== "free" && site.data.branding?.hasLogo ? `/logo/${site.slug}` : null,
  });

  if (device === "desktop") {
    const editableSelectors = "[data-brand-name], [data-casino], .hr-brand-title, .hr-brand-sub, .hr-stat-value, .hr-podium-name, .hr-podium-value, .tr-name, .tr-wager, .tr-prize, .bf-val, .reward-pool, .hero-name, .hero-sub, .clock-sub";
    html = html.replace('</head>', `<style nonce="${nonce}">
      ${editableSelectors} { cursor: text; transition: outline 0.15s ease, outline-offset 0.15s ease; }
      ${editableSelectors.split(", ").map(s => s + ":hover").join(", ")} { outline: 2px dashed rgba(200,255,0,0.4); outline-offset: 3px; border-radius: 4px; }
    </style></head>`);
    html = html.replace('</body>', `<script nonce="${nonce}">
      document.addEventListener("click", (e) => {
        const targetSelectors = "${editableSelectors}";
        const el = e.target.closest(targetSelectors);
        
        if (el && !el.isContentEditable) {
          e.preventDefault();
          e.stopPropagation();
          
          const originalText = el.textContent;
          el.contentEditable = "true";
          el.focus();
          
          // Select all text
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          selection.removeAllRanges();
          selection.addRange(range);
          
          el.style.outline = "2px solid #c8ff00";
          el.style.outlineOffset = "2px";
          el.style.borderRadius = "4px";
          
          const finishEditing = () => {
            if (!el.isContentEditable) return;
            el.contentEditable = "false";
            el.style.outline = "";
            el.style.outlineOffset = "";
            
            const newText = el.textContent.trim();
            if (newText !== originalText) {
              let key = null;
              let extra = null;
              
              if (el.matches("[data-brand-name], .hr-brand-title, .hero-name")) key = "f_name";
              else if (el.matches(".hr-brand-sub, .hero-sub")) key = "f_tagline";
              else if (el.matches("[data-casino]")) key = "f_casino";
              else if (el.matches(".hr-stat-value, .reward-pool, .bf-val, .clock-sub")) key = "f_pool";
              else if (el.matches(".hr-podium-name, .tr-name, .t3-name")) { key = "player_name"; extra = originalText.trim(); }
              else if (el.matches(".hr-podium-value, .tr-wager, .t3-wager")) { key = "player_wager"; extra = el.closest("[data-name]")?.dataset.name || el.closest(".hr-podium-card")?.querySelector(".hr-podium-name")?.textContent.trim() || el.closest(".t3")?.querySelector(".t3-name")?.textContent.trim() || ""; }
              
              if (key) {
                window.parent.postMessage({ type: "yr_edit_request", key, value: newText, extra }, "*");
              }
            }
          };
          
          el.addEventListener("blur", finishEditing, { once: true });
          el.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter") {
              evt.preventDefault();
              finishEditing();
            } else if (evt.key === "Escape") {
              el.textContent = originalText;
              finishEditing();
            }
          });
        }
      });
    </script></body>`);
  }

  return new Response(html, {
    headers: { ...withNonce(SECURE_HTML, nonce), "cache-control": "private, no-store" },
  });
}
