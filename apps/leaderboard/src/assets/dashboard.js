// Dashboard entry point. Coordinates data loading and initial render across modules.
import { $, logError, toLocalInput } from "./dashboard/utils.js";
import { state } from "./dashboard/state.js";
import { navTo, setupShell } from "./dashboard/shell.js";
import { renderBoardSwitcher, renderSidebarBoardSwitcher, renderBoardsPage } from "./dashboard/boards.js";
import { renderPlayers } from "./dashboard/players.js";
import { loadStats, renderArchives, renderBranding, renderDomain, renderDomainStatus, renderNotifications, renderOverlay, renderPlan, renderSections, renderSocials, renderTemplateText } from "./dashboard/site.js";
import { renderOverviewSummary, wireOverviewQuickActions } from "./dashboard/overview.js";

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

  renderBoardSwitcher();
  renderSidebarBoardSwitcher();
  renderBoardsPage();
  const d = p.data || {};
  const b = d.brand || {};
  loadStats();
  state.EXTRA = { chips: d.partner?.chips, whyStats: d.whyStats, rules: d.rules, socials: p.socials || d.socials || [], sections: d.sections, text: (d.branding && d.branding.text) || {} };
  $("f_name").value = b.name || "";
  $("f_tagline").value = b.tagline || "";
  $("f_casino").value = b.casino || "Stake";
  $("f_code").value = b.code || "";
  $("f_cta").value = b.ctaUrl || "";
  $("f_pool").value = b.prizePool || "";
  $("f_period").value = b.period || "Monthly";
  $("f_ends").value = toLocalInput(d.endsAt);
  $("f_blurb").value = d.partner?.blurb || "";
  renderPlayers(d.players || []);
  renderBranding(d.branding || {});
  renderArchives(p.archives || []);
  renderDomain();
  renderOverlay();
  renderNotifications(p.notify || {});
  renderSocials();
  renderSections();
  renderTemplateText();
  if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
  if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  const pubToggle = $("pubToggle");
  if (pubToggle) pubToggle.checked = p.published !== false;
  $("a_label").placeholder = new Date().toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  $("liveLink").textContent = location.host + "/" + state.SLUG;
  $("liveLink").href = "/" + state.SLUG;
  $("loading").hidden = true;
  $("dash").hidden = false;
  setupShell();
  const initialNav = new URLSearchParams(location.search).get("nav");
  if (initialNav && document.querySelector(`section[data-page="${initialNav}"]`)) navTo(initialNav);
  renderOverviewSummary();
  wireOverviewQuickActions();

  const markDirty = () => { state._dirty = true; const sb = $("savebar"); if (sb) sb.hidden = false; };
  $("dash").addEventListener("input", markDirty);
  $("dash").addEventListener("change", markDirty);
  window.addEventListener("beforeunload", (e) => { if (state._dirty) { e.preventDefault(); e.returnValue = ""; } });
  if (urlParams.get("upgraded")) {
    $("status").textContent = "Payment received — Pro activates once the network confirms (usually minutes).";
  }
}

init();
