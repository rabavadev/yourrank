// Dashboard entry point. Coordinates data loading and initial render across modules.
import { $, esc, fromLocalInput, getCsrf, getViewerTimeZone, logError, timeZoneLabel, toLocalInput, copyToClipboard, flashButton, showToast } from "./dashboard/utils.js";
import { markDirty, setState, state, subscribe } from "./dashboard/state.js";
import { currentRoute, navTo, setupShell } from "./dashboard/shell.js";
import { renderBoardSwitcher, renderSidebarBoardSwitcher, renderBoardsPage } from "./dashboard/boards.js";
import { renderPlayers } from "./dashboard/players.js";
import { checkout, fitDesignPreview, loadCreditsStatus, loadHistory, loadStats, refreshDesignPreview, renderArchives, renderBranding, renderDomain, renderDomainStatus, renderBoardStatus, renderEditorTimestamps, renderEmbedShare, renderLegal, renderNotifications, renderOverlay, renderPlan, renderPlayerFields, renderPrizes, renderSections, renderSocials, renderTemplateText, wireCancelSubscription, wireDeleteAccount } from "./dashboard/site.js";
import { renderOverviewSummary } from "./dashboard/overview.js";
import { renderReferrals } from "./dashboard/referrals.js";
import { initPerformance } from "./dashboard/performance.js";
import { setupSettingsScreen, wireAccount } from "./dashboard/account.js";
import { initGames } from "./dashboard/games.js";

async function init() {
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch (err) { logError("auth/me", err); me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  state.ME = me.user;
  const emailEl = $("userEmail"); if (emailEl) emailEl.textContent = state.ME.email;
  const avatarEl = $("userAvatar"); if (avatarEl) avatarEl.textContent = (state.ME.displayName || state.ME.email || "Y").trim().charAt(0).toUpperCase();
  if (state.ME.isAdmin) { const adminEl = $("adminLink"); if (adminEl) adminEl.hidden = false; }
  renderPlan();
  loadHistory();

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
  state.PUBLISHED_AT = p.publishedAt || null;
  state.PUBLISHED = !!p.published;
  state.IS_DRAFT = !!p.isDraft;
  state.ONBOARDING = p.onboarding || {};

  renderEditorTimestamps();
  renderBoardSwitcher();
  renderSidebarBoardSwitcher();
  document.querySelectorAll("#newBoardSide, #addBoardBtn").forEach((btn) => {
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener("click", () => $("newBoard")?.click());
    }
  });
  renderBoardsPage();
  const d = p.data || {};
  const b = d.brand || {};
  state.EXTRA = { chips: d.partner?.chips, whyStats: d.whyStats, rules: d.rules, socials: p.socials || d.socials || [], sections: d.sections, siteSections: d.siteSections || {}, playerFields: d.playerFields || {}, text: (d.branding && d.branding.text) || {}, legal: d.legal || {} };
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
  renderDomain();
  renderOverlay();
  renderNotifications(p.notify || {});
  renderSocials();
  renderSections();
  renderTemplateText();
  renderLegal();
  renderEmbedShare();
  const iframe = $("designPreview");
  if (iframe) iframe.addEventListener("load", fitDesignPreview);
  document.querySelectorAll(".preview-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".preview-tab").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
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
  const editorNav = document.querySelector('[data-nav="board"]');
  if (editorNav) editorNav.addEventListener("click", () => setTimeout(fitDesignPreview, 0));
  if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
  if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  const pubToggle = $("pubToggle");
  if (pubToggle) pubToggle.checked = state.PUBLISHED;
  function updatePublishHint() {
    const btn = $("save");
    const hint = document.querySelector(".savebar-hint");
    if (!btn || !hint) return;
    const willPublish = pubToggle?.checked && !state.PUBLISHED;
    btn.textContent = willPublish ? "Save & publish" : "Save changes";
    hint.textContent = willPublish ? "This board will go live when you save" : "Unsaved changes";
  }
  if (pubToggle) pubToggle.addEventListener("change", () => { setState({ _dirty: true }); updatePublishHint(); });
  updatePublishHint();
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
  const embedCode = `<iframe src="https://${location.host}/${state.SLUG}/embed" width="100%" height="640" frameborder="0" loading="lazy" title="${esc(state.SLUG)} leaderboard"></iframe>`;
  const embedTextarea = $("embedCode");
  if (embedTextarea) embedTextarea.value = embedCode;
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
  $("loading").hidden = true;
  $("dash").hidden = false;
  setupShell();
  initGames();
  wireCancelSubscription();
  wireDeleteAccount();
  // Boards nav is redundant for solo streamers — the sidebar board switcher covers it.
  const boardsNav = document.querySelector(".lb-nav--boards");
  if (boardsNav) boardsNav.hidden = state.BOARDS.length < 2;
  // The URL decides which section opens; /dashboard itself has no section, so
  // it lands set-up boards on Home and drafts on the editor they still need.
  const route = currentRoute();
  const planParam = urlParams.get("plan");
  const landing = route.page !== "home"
    ? route.page
    : (planParam ? "settings" : (isBoardSetup(p) ? "home" : "board"));
  const hash = route.tab || location.hash.replace("#", "");
  if (document.querySelector(`section[data-page="${landing}"]`)) navTo(landing, hash);
  if (planParam) {
    if (planParam.toLowerCase() === "agency") location.href = "/help/support?area=billing";
    else checkout(planParam);
  }
  // The iframe starts empty: render the preview once so the editor never opens
  // on a blank frame.
  if (document.querySelector('section[data-page="board"].is-on')) {
    refreshDesignPreview();
  }

  renderOverviewSummary();
  renderReferrals();
  initPerformance();
  loadStats();
  loadCreditsStatus();
  wireStreamerHud();
  wireAccount();
  setupSettingsScreen(p);

  // The save bar, unload guard and preview react to the same notification in
  // dashboard/site.js; this only adds the debounced overview refresh.
  let dirtyTimer;
  subscribe((keys) => {
    if (!keys.includes("draft")) return;
    clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(renderOverviewSummary, 150);
  });

  window.addEventListener("message", (e) => {
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

function isBoardSetup(p) {
  const d = p.data || {};
  const b = d.brand || {};
  const players = d.players || [];
  const o = p.onboarding || {};
  const brandDone = o.brand || !!b.name;
  const playersDone = o.players || players.length > 0;
  const sharedDone = o.shared || p.published !== false;
  return brandDone && playersDone && sharedDone;
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
