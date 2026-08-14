// Dashboard entry point. Coordinates data loading and initial render across modules.
import { $, esc, fromLocalInput, getCsrf, getViewerTimeZone, logError, timeZoneLabel, toLocalInput, copyToClipboard, flashButton, showToast } from "./dashboard/utils.js";
import { markDirty, setState, state, subscribe } from "./dashboard/state.js";
import { currentRoute, navTo, setupShell } from "./dashboard/shell.js";
import { renderBoardSwitcher, renderSidebarBoardSwitcher, renderBoardsPage } from "./dashboard/boards.js";
import { renderPlayers } from "./dashboard/players.js";
import { fitDesignPreview, loadCreditsStatus, loadStats, refreshDesignPreview, renderArchives, renderBranding, renderDomain, renderDomainStatus, renderBoardStatus, renderEditorTimestamps, renderEmbedShare, renderLegal, renderNotifications, renderOverlay, renderPlayerFields, renderPrizes, renderSections, renderSocials, wirePublishAction } from "./dashboard/site.js";
import { renderOverviewSummary } from "./dashboard/overview.js";
import { renderReferrals } from "./dashboard/referrals.js";
import { initPerformance } from "./dashboard/performance.js";
import { setupSettingsScreen } from "./dashboard/account.js";
import { initGames } from "./dashboard/games.js";
import { updateProfileMenu } from "./dashboard/profile-menu.js";
import "./dashboard/help-drawer.js";
import "./dashboard/command-palette.js";

const LOADING_MESSAGES = [
  "Loading your workspace…",
  "Preparing rank insights…",
  "Setting up your dashboard…",
];
let loadingMessageTimer;

function startLoadingCopy() {
  clearInterval(loadingMessageTimer);
  let index = 0;
  const label = $("loadingStatus");
  if (!label) return;
  label.textContent = LOADING_MESSAGES[index];
  loadingMessageTimer = setInterval(() => {
    index = (index + 1) % LOADING_MESSAGES.length;
    label.textContent = LOADING_MESSAGES[index];
  }, 1200);
}

function stopLoadingCopy() {
  clearInterval(loadingMessageTimer);
  loadingMessageTimer = undefined;
}

async function init() {
  startLoadingCopy();
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch (err) { logError("auth/me", err); me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  state.ME = me.user;
  const emailEl = $("userEmail"); if (emailEl) emailEl.textContent = state.ME.email;
  updateProfileMenu(state.ME);
  if (state.ME.isAdmin) { const adminEl = $("adminLink"); if (adminEl) adminEl.hidden = false; }

  // Each route serves only its own sections now, so a screen's setup only runs
  // when that screen is in the document.
  const hasSection = (name) => !!document.querySelector(`section[data-page="${name}"]`);
  const hasEditor = hasSection("board");
  const hasBoardSettings = hasSection("settings");

  const urlParams = new URLSearchParams(location.search);
  // Plan and billing live in the account settings document; a `?plan=` on the
  // dashboard is an old checkout link.
  const planParam = urlParams.get("plan");
  if (planParam) {
    location.href = planParam.toLowerCase() === "agency"
      ? "/help/support?area=billing"
      : `/dashboard/settings/plan?plan=${encodeURIComponent(planParam)}`;
    return;
  }
  const requestedSiteId = urlParams.get("board") || null;
  const apiUrl = requestedSiteId ? `/api/site?siteId=${encodeURIComponent(requestedSiteId)}` : "/api/site";
  const loading = $("loading");
  const renderSiteLoadError = (message) => {
    const detail = message || "The board service returned an unexpected response.";
    stopLoadingCopy();
    if (loading) {
      loading.classList.add("is-error");
      loading.setAttribute("aria-busy", "false");
      loading.innerHTML = `<div class="error-state" role="alert"><span class="error-icon" aria-hidden="true">!</span><p>Couldn't load your board.</p><p class="hint">${esc(detail)}</p><button class="btn btn--sm" id="retryBtn" type="button">Retry</button><a class="btn btn--sm btn--ghost" href="/dashboard">Open dashboard</a></div>`;
    }
    const status = $("status");
    if (status) {
      status.textContent = `Couldn't load your board: ${detail}`;
      status.setAttribute("role", "alert");
      status.setAttribute("aria-live", "assertive");
      status.hidden = false;
    }
    $("retryBtn")?.addEventListener("click", () => init());
  };
  let p;
  try {
    const res = await fetch(apiUrl);
    let body;
    try { body = await res.json(); } catch (err) { throw new Error(`The board service returned invalid data${res.status ? ` (HTTP ${res.status})` : ""}.`); }
    if (!res.ok || !body?.ok) throw new Error(body?.error || `The board service returned HTTP ${res.status}.`);
    p = body;
  } catch (err) {
    logError("site", err);
    if (state.ME.isAdmin && err?.message?.includes("HTTP 404")) { location.href = "/admin"; return; }
    renderSiteLoadError(err?.message || "Network error while loading the board.");
    return;
  }
  state.SLUG = p.slug;
  state.ACTIVE_SITE_ID = p.siteId || null;
  state.BOARDS = p.boards || [];
  state.SITE_UPDATED_AT = p.updatedAt || null;
  state.PUBLISHED_AT = p.publishedAt || null;
  state.PUBLISHED = !!p.published;
  state.IS_DRAFT = !!p.isDraft;
  state.ONBOARDING = p.onboarding || {};

  if (hasEditor) renderEditorTimestamps();
  renderBoardSwitcher();
  renderSidebarBoardSwitcher();
  document.querySelectorAll("#newBoardSide, #addBoardBtn").forEach((btn) => {
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener("click", () => $("newBoard")?.click());
    }
  });
  if (hasSection("boards")) renderBoardsPage();
  const d = p.data || {};
  const b = d.brand || {};
  state.EXTRA = { chips: d.partner?.chips, whyStats: d.whyStats, rules: d.rules, socials: p.socials || d.socials || [], sections: d.sections, siteSections: d.siteSections || {}, playerFields: d.playerFields || {}, text: (d.branding && d.branding.text) || {}, legal: d.legal || {} };
  state.PLAYERS = Array.isArray(d.players) ? d.players : [];
  document.querySelectorAll("a[href]").forEach((link) => {
    if (!state.ACTIVE_SITE_ID) return;
    if (link.dataset.productLink === "sites") {
      link.href = `/dashboard?board=${encodeURIComponent(state.ACTIVE_SITE_ID)}`;
      return;
    }
    const target = new URL(link.getAttribute("href"), location.origin);
    const creditsPath = target.pathname.startsWith("/dashboard/rewards/") || target.pathname.startsWith("/dashboard/audience/");
    const sitePath = target.pathname === "/dashboard" || target.pathname === "/dashboard/boards" || target.pathname === "/dashboard/games" || target.pathname === "/dashboard/settings/board" || target.pathname.startsWith("/dashboard/editor/") || target.pathname.startsWith("/dashboard/analytics/");
    if (creditsPath) {
      target.searchParams.set("siteId", state.ACTIVE_SITE_ID);
    } else if (sitePath) {
      target.searchParams.set("board", state.ACTIVE_SITE_ID);
    } else {
      return;
    }
    link.href = `${target.pathname}${target.search}${target.hash}`;
  });
  if (hasEditor) {
    $("f_name").value = b.name || "";
    $("f_tagline").value = b.tagline || "";
    $("f_casino").value = b.casino || "";
    $("f_code").value = b.code || "";
    $("f_cta").value = b.ctaUrl || "";
    $("f_pool").value = b.prizePool || "";
    $("f_period").value = b.period || "Monthly";
    $("f_ends").value = toLocalInput(d.endsAt);
    const endsHint = $("f_ends_hint");
    const endsInput = $("f_ends");
    const renderEndsHint = () => {
      if (!endsHint) return;
      const zone = getViewerTimeZone();
      const instant = endsInput?.value ? fromLocalInput(endsInput.value, zone) : new Date().toISOString();
      const label = zone ? timeZoneLabel(instant, zone) : "";
      endsHint.textContent = label
        ? `When the leaderboard resets, shown in ${label}. Powers the live timer.`
        : `When the leaderboard resets, shown in ${zone ? "your timezone" : "your browser's timezone"}. Powers the live timer.`;
    };
    renderEndsHint();
    endsInput?.addEventListener("change", renderEndsHint);
    $("f_blurb").value = d.partner?.blurb || "";
    renderPlayers(d.players || []);
    renderPlayerFields();
    renderBranding(d.branding || {});
    renderPrizes(d.prizes || d.branding?.prizes || {});
    renderArchives(p.archives || []);
    renderOverlay();
    renderSocials();
    renderSections();
    renderEmbedShare();
    const iframe = $("designPreview");
    if (iframe) iframe.addEventListener("load", fitDesignPreview);
    document.querySelectorAll(".preview-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".preview-tab").forEach((b2) => {
          b2.classList.remove("is-active");
          b2.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        refreshDesignPreview();
      });
    });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitDesignPreview, 150);
    });
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
    const embedTextarea = $("embedCode");
    if (embedTextarea) {
      embedTextarea.value = `<iframe src="https://${location.host}/${state.SLUG}/embed" width="100%" height="640" frameborder="0" loading="lazy" title="${esc(state.SLUG)} leaderboard"></iframe>`;
    }
    const embedPreview = $("embedPreview");
    if (embedPreview) { embedPreview.href = `/${state.SLUG}/embed`; embedPreview.target = "_blank"; }
    const copyEmbed = $("copyEmbed");
    if (copyEmbed && !copyEmbed._wired) {
      copyEmbed._wired = true;
      copyEmbed.addEventListener("click", async () => {
        if (!embedTextarea) return;
        const ok = await copyToClipboard(embedTextarea.value);
        flashButton(copyEmbed, ok ? "Copied!" : "Copy failed");
      });
    }
  }

  if (hasBoardSettings) {
    renderDomain();
    renderNotifications(p.notify || {});
    renderLegal();
    if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
    if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  }

  const pubToggle = $("pubToggle");
  if (pubToggle) pubToggle.checked = state.PUBLISHED;
  wirePublishAction();
  const liveUrl = "/" + state.SLUG;
  const liveLink = $("liveLink");
  if (liveLink) { liveLink.href = liveUrl; liveLink.title = location.host + liveUrl; }
  renderBoardStatus();
  const editorLiveLink = $("editorLiveLink");
  if (editorLiveLink) { editorLiveLink.href = liveUrl; editorLiveLink.title = location.host + liveUrl; }
  const previewLiveLink = $("previewLiveLink");
  if (previewLiveLink) { previewLiveLink.href = liveUrl; previewLiveLink.title = location.host + liveUrl; }
  const editorCopyLink = $("editorCopyLink");
  if (editorCopyLink && !editorCopyLink._wired) {
    editorCopyLink._wired = true;
    editorCopyLink.addEventListener("click", async () => {
      const ok = await copyToClipboard(location.origin + "/" + state.SLUG);
      flashButton(editorCopyLink, ok ? "Copied!" : "Copy failed");
    });
  }
  stopLoadingCopy();
  $("loading").setAttribute("aria-busy", "false");
  $("loading").hidden = true;
  $("dash").hidden = false;
  setupShell();
  // Keep every feature visible. Manage sites is useful even with one site because
  // it is also where the operator creates the next one.
  // The URL says which section this document is: `/dashboard` is the Overview,
  // not "whichever screen we guess you need".
  const route = currentRoute();
  const hash = route.tab || location.hash.replace("#", "");
  navTo(route.page, hash);
  if (hasEditor) {
    // The iframe starts empty: render the preview once so the editor never
    // opens on a blank frame.
    refreshDesignPreview();
    wireStreamerHud();
  }
  if (hasSection("games")) initGames();
  if (hasSection("home")) renderOverviewSummary();
  if (hasSection("performance")) {
    renderReferrals();
    initPerformance();
  }
  if (hasSection("home") || hasSection("performance")) loadStats();
  if (hasSection("home") || hasBoardSettings) loadCreditsStatus();
  if (hasBoardSettings) {
    setupSettingsScreen(p);
  }

  // The save bar, unload guard and preview react to the same notification in
  // dashboard/site.js; this only adds the debounced overview refresh.
  if (hasSection("home")) {
    let dirtyTimer;
    subscribe((keys) => {
      if (!keys.includes("draft")) return;
      clearTimeout(dirtyTimer);
      dirtyTimer = setTimeout(renderOverviewSummary, 150);
    });
  }

  if (hasEditor) window.addEventListener("message", (e) => {
    if (e.data?.type === "yr_edit_request") {
      const { key, value, extra } = e.data;
      if (value !== undefined) {
        // Brand fields: update the form input directly
        const el = document.getElementById(key);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event("input"));
        } else if (key === "player_name" && extra) {
          // Find the player row by name and update
          const rows = [...$("rows").children];
          const row = rows.find(tr => tr.querySelector(".p-name")?.value.trim() === extra);
          if (row) { row.querySelector(".p-name").value = value; markDirty(); }
        } else if (key === "player_wager" && extra) {
          // Find the player row by name and update wager
          const rows = [...$("rows").children];
          const row = rows.find(tr => tr.querySelector(".p-name")?.value.trim() === extra);
          if (row) { row.querySelector(".p-wager").value = value.replace(/[^0-9.]/g, ""); markDirty(); }
        }
      } else {
        // Fallback: scroll to and focus the relevant field in the settings panel
        const el = document.getElementById(key);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
          el.select?.();
        }
      }
    }
  });
  $("dash").addEventListener("input", markDirty);
  $("dash").addEventListener("change", markDirty);

  // Keyboard shortcut system (Hook at dashboard mount)
  document.addEventListener("keydown", (e) => {
    // Ctrl+S / Cmd+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      const saveBtn = document.getElementById("save");
      if (saveBtn && !saveBtn.disabled && !saveBtn.hidden) saveBtn.click();
    }
    // Escape: Close drawer
    if (e.key === "Escape") {
      import("./dashboard/shell.js").then(m => m.closeDrawer(false));
    }
  });

  if (urlParams.get("upgraded")) {
    $("status").textContent = "Payment received — Pro activates once the network confirms (usually minutes).";
  }
}

function wireStreamerHud() {
  const form = document.getElementById("hudQuickAdd");
  const addBtn = document.getElementById("hudAddBtn");
  const copyObs = document.getElementById("hudCopyObs");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("hudName").value;
      const amount = document.getElementById("hudAmount").value;
      if (!name || !state.ACTIVE_SITE_ID) return;

      addBtn.disabled = true;
      addBtn.textContent = "Updating...";
      try {
        const res = await fetch(`/api/sites/${state.ACTIVE_SITE_ID}/quick-add`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
          body: JSON.stringify({ name, amount })
        });
        if (res.ok) {
          // Immediately reload page to show updated table/preview
          location.reload();
        } else {
          const d = await res.json().catch(() => ({}));
          showToast(d.error || "Failed to update player", "error");
          addBtn.disabled = false;
          addBtn.textContent = "Update";
        }
      } catch (err) {
        showToast("Network error", "error");
        addBtn.disabled = false;
        addBtn.textContent = "Update";
      }
    });
  }

  if (copyObs) {
    copyObs.addEventListener("click", async () => {
      const ok = await copyToClipboard(location.origin + "/" + state.SLUG + "/overlay");
      flashButton(copyObs, ok ? "✓ Copied" : "Copy failed", 2000);
    });
  }

  window.addEventListener("message", (e) => {
    if (e.data?.type === "yr_click_player") {
      const name = e.data.name;
      const rows = document.getElementById("rows")?.querySelectorAll("tr");
      if (!rows) return;
      for (const row of rows) {
        const input = row.querySelector(".p-name");
        if (input && input.value.trim() === name) {
          // Found it. Highlight and focus.
          row.style.animation = "none";
          // Trigger a quick highlight flash
          setTimeout(() => {
            row.style.animation = "bg-flash 1s ease-out";
            const wagerInput = row.querySelector(".p-wager");
            if (wagerInput) {
              wagerInput.focus();
              wagerInput.select();
            } else {
              input.focus();
            }
          }, 10);
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    }
  });
}

init();
