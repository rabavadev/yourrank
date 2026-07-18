// Dashboard entry point. Coordinates data loading and initial render across modules.
import { $, esc, getCsrf, logError, toLocalInput } from "./dashboard/utils.js";
import { state } from "./dashboard/state.js";
import { navTo, setupShell } from "./dashboard/shell.js";
import { renderBoardSwitcher, renderSidebarBoardSwitcher, renderBoardsPage } from "./dashboard/boards.js";
import { renderPlayers } from "./dashboard/players.js";
import { loadStats, renderArchives, renderBranding, renderDomain, renderDomainStatus, renderLegal, renderNotifications, renderOverlay, renderPlan, renderPlayerFields, renderPrizes, renderSections, renderSocials, renderTemplateText } from "./dashboard/site.js";
import { renderOverviewSummary, wireOverviewQuickActions } from "./dashboard/overview.js";
import { renderReferrals } from "./dashboard/referrals.js";

async function init() {
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch (err) { logError("auth/me", err); me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  state.ME = me.user;
  const emailEl = $("userEmail"); if (emailEl) emailEl.textContent = state.ME.email;
  if (state.ME.isAdmin) { const adminEl = $("adminLink"); if (adminEl) adminEl.hidden = false; }
  renderPlan();

  const urlParams = new URLSearchParams(location.search);
  const requestedSiteId = urlParams.get("board") || null;
  const apiUrl = requestedSiteId ? `/api/site?siteId=${encodeURIComponent(requestedSiteId)}` : "/api/site";
  const res = await fetch(apiUrl);
  const p = await res.json();
  if (!p.ok) {
    if (state.ME.isAdmin) { location.href = "/admin"; return; }
    $("loading").innerHTML = '<div class="error-state"><span class="error-icon">⚠</span><p>Couldn\'t load your site.</p><button class="btn btn--sm" id="retryBtn">Try again</button></div>';
    document.getElementById("retryBtn")?.addEventListener("click", () => location.reload()); return;
  }
  state.SLUG = p.slug;
  state.ACTIVE_SITE_ID = p.siteId || null;
  state.BOARDS = p.boards || [];
  state.TEMPLATE_CATALOG = Array.isArray(p.templates) ? p.templates : [];
  state.SITE_UPDATED_AT = p.updatedAt || null;
  state.ONBOARDING = p.onboarding || {};

  renderBoardSwitcher();
  renderSidebarBoardSwitcher();
  renderBoardsPage();
  renderDraftBanner(p);
  const d = p.data || {};
  const b = d.brand || {};
  loadStats();
  state.EXTRA = { chips: d.partner?.chips, whyStats: d.whyStats, rules: d.rules, socials: p.socials || d.socials || [], sections: d.sections, playerFields: d.playerFields || {}, text: (d.branding && d.branding.text) || {}, legal: d.legal || {} };
  $("f_name").value = b.name || "";
  $("f_tagline").value = b.tagline || "";
  $("f_casino").value = b.casino || "";
  $("f_code").value = b.code || "";
  $("f_cta").value = b.ctaUrl || "";
  $("f_pool").value = b.prizePool || "";
  $("f_period").value = b.period || "Monthly";
  $("f_ends").value = toLocalInput(d.endsAt);
  $("f_blurb").value = d.partner?.blurb || "";
  renderPlayers(d.players || []);
  renderPlayerFields();
  renderBranding(d.branding || {});
  renderPrizes(d.prizes || d.branding?.prizes || {});
  renderArchives(p.archives || []);
  renderDomain();
  renderOverlay();
  renderNotifications(p.notify || {});
  renderSocials();
  renderSections();
  renderTemplateText();
  renderLegal();
  const proAccordion = $("proAccordion");
  if (proAccordion) proAccordion.open = state.ME.plan !== "free";
  document.querySelectorAll(".preview-device").forEach((btn) => {
    btn.addEventListener("click", () => {
      const iframe = $("designPreview");
      if (!iframe) return;
      document.querySelectorAll(".preview-device").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      iframe.style.width = btn.dataset.width || "100%";
    });
  });
  if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
  if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  const pubToggle = $("pubToggle");
  state.PUBLISHED = p.published !== false;
  if (pubToggle) pubToggle.checked = state.PUBLISHED;
  const arToggle = $("f_auto_reset");
  const arClear = $("f_auto_reset_clear");
  if (arToggle) {
    arToggle.checked = !!(p.autoReset && p.autoReset.enabled);
    if (arClear) {
      arClear.value = (p.autoReset && p.autoReset.clear) || "wagers";
      arClear.disabled = !arToggle.checked;
    }
    arToggle.addEventListener("change", () => { if (arClear) arClear.disabled = !arToggle.checked; });
  }
  const pwEnabled = $("f_password_enabled");
  const pwInput = $("f_password");
  if (pwEnabled) {
    pwEnabled.checked = !!p.passwordProtected;
    if (pwInput) pwInput.disabled = !pwEnabled.checked;
    pwEnabled.addEventListener("change", () => { if (pwInput) pwInput.disabled = !pwEnabled.checked; });
  }
  $("a_label").placeholder = new Date().toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const liveUrl = "/" + state.SLUG;
  const liveLink = $("liveLink");
  if (liveLink) { liveLink.href = liveUrl; liveLink.title = location.host + liveUrl; }
  const embedCode = `<iframe src="https://${location.host}/${state.SLUG}/embed" width="100%" height="640" frameborder="0" loading="lazy" title="${esc(state.SLUG)} leaderboard"></iframe>`;
  const embedTextarea = $("embedCode");
  if (embedTextarea) embedTextarea.value = embedCode;
  const embedPreview = $("embedPreview");
  if (embedPreview) { embedPreview.href = `/${state.SLUG}/embed`; embedPreview.target = "_blank"; }
  $("copyEmbed")?.addEventListener("click", () => {
    if (!embedTextarea) return;
    embedTextarea.select();
    navigator.clipboard.writeText(embedTextarea.value).catch(() => {});
  });
  $("loading").hidden = true;
  $("dash").hidden = false;
  setupShell();
  const initialNav = new URLSearchParams(location.search).get("nav");
  if (initialNav && document.querySelector(`section[data-page="${initialNav}"]`)) navTo(initialNav);
  renderOverviewSummary();
  wireOverviewQuickActions();
  renderReferrals();

  const markDirty = () => { state._dirty = true; const sb = $("savebar"); if (sb) sb.hidden = false; };
  $("dash").addEventListener("input", markDirty);
  $("dash").addEventListener("change", markDirty);
  window.addEventListener("beforeunload", (e) => { if (state._dirty) { e.preventDefault(); e.returnValue = ""; } });
  if (urlParams.get("upgraded")) {
    $("status").textContent = "Payment received — Pro activates once the network confirms (usually minutes).";
  }
}

function isBoardSetup(p) {
  const d = p.data || {};
  const b = d.brand || {};
  const players = d.players || [];
  const o = p.onboarding || {};
  const brandDone = o.brand || !!(b.name && b.casino);
  const playersDone = o.players || players.length > 0;
  const sharedDone = o.shared || p.published !== false;
  return brandDone && playersDone && sharedDone;
}

function renderDraftBanner(p) {
  const banner = $("draftBanner");
  if (!banner) return;
  const activeId = p.siteId || state.ACTIVE_SITE_ID;
  const active = (p.boards || []).find((b) => b.id === activeId && b.isDraft);
  if (!active || isBoardSetup(p)) { banner.hidden = true; return; }
  banner.hidden = false;
  $("draftName").textContent = active.name || active.slug || "this board";
  $("draftResume").href = `/setup?resume=${encodeURIComponent(active.slug)}`;
  const doneBtn = $("draftDone");
  if (doneBtn) {
    doneBtn.onclick = async () => {
      doneBtn.disabled = true;
      try {
        const res = await fetch("/api/site/finish", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ siteId: active.id }) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); $("status").textContent = d.error || "Could not mark as done."; doneBtn.disabled = false; return; }
        banner.hidden = true;
      } catch (e) { $("status").textContent = "Network error"; doneBtn.disabled = false; }
    };
  }
}

init();
