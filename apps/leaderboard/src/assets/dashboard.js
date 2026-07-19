// Dashboard entry point. Coordinates data loading and initial render across modules.
import { $, esc, getCsrf, logError, toLocalInput, fmtMoney, currentPlayers, resetsIn } from "./dashboard/utils.js";
import { state } from "./dashboard/state.js";
import { navTo, setupShell } from "./dashboard/shell.js";
import { renderBoardSwitcher, renderSidebarBoardSwitcher, renderBoardsPage } from "./dashboard/boards.js";
import { renderPlayers } from "./dashboard/players.js";
import { loadStats, renderArchives, renderBranding, renderDomain, renderDomainStatus, renderLegal, renderNotifications, renderOverlay, renderPlan, renderPlayerFields, renderPrizes, renderSections, renderSocials, renderTemplateText, updateDesignPreview } from "./dashboard/site.js";
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
  function fitDesignPreview() {
    const iframe = $("designPreview");
    const stage = $("previewStage");
    const frame = $("previewFrame");
    if (!iframe || !stage || !frame) return;
    const active = document.querySelector(".preview-tab.is-active");
    const deviceWidth = parseInt(active?.dataset.width || "1100", 10) || 1100;
    const cw = frame.clientWidth;
    if (!cw) return;
    const doc = iframe.contentDocument;
    let contentHeight = 680;
    if (doc && doc.readyState === "complete" && doc.documentElement) {
      const html = doc.documentElement;
      const body = doc.body;
      contentHeight = Math.max(680, html.scrollHeight, body ? body.scrollHeight : 0, html.offsetHeight, body ? body.offsetHeight : 0);
    }
    const scale = cw / deviceWidth;
    const scaledHeight = contentHeight * scale;
    const isEditing = frame.closest(".design-grid")?.classList.contains("is-editing");
    const maxHeight = Math.min(isEditing ? 900 : 720, Math.floor(window.innerHeight * (isEditing ? 0.85 : 0.75)));
    const frameHeight = Math.min(scaledHeight, maxHeight);
    stage.style.width = deviceWidth + "px";
    stage.style.height = contentHeight + "px";
    stage.style.setProperty("--preview-scale", String(scale));
    frame.style.height = frameHeight + "px";
  }
  // Expose so shell.js can re-fit the preview when navigating into the Editor.
  state.fitDesignPreview = fitDesignPreview;
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
      updateDesignPreview();
      fitDesignPreview();
    });
  });
  window.addEventListener("resize", fitDesignPreview);
  const editorNav = document.querySelector('[data-nav="board"]');
  if (editorNav) editorNav.addEventListener("click", () => setTimeout(fitDesignPreview, 0));
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
  const editorLiveLink = $("editorLiveLink");
  if (editorLiveLink) { editorLiveLink.href = liveUrl; editorLiveLink.title = location.host + liveUrl; }
  const editorCopyLink = $("editorCopyLink");
  if (editorCopyLink && !editorCopyLink._wired) {
    editorCopyLink._wired = true;
    editorCopyLink.addEventListener("click", () => {
      navigator.clipboard.writeText(location.origin + "/" + state.SLUG).then(() => {
        const prev = editorCopyLink.textContent;
        editorCopyLink.textContent = "Copied!";
        setTimeout(() => { editorCopyLink.textContent = prev; }, 1500);
      }).catch(() => {});
    });
  }
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
  // Boards nav is redundant for solo streamers — the sidebar board switcher covers it.
  const boardsNav = document.querySelector(".lb-nav--boards");
  if (boardsNav) boardsNav.hidden = state.BOARDS.length < 2;
  // Smart landing: returning, set-up users go straight to the Editor (the daily job).
  // Brand-new boards still land on Overview so the setup checklist is front and center.
  const initialNav = new URLSearchParams(location.search).get("nav");
  const landing = initialNav || "board";
  if (document.querySelector(`section[data-page="${landing}"]`)) navTo(landing);
  if (document.querySelector('section[data-page="board"].is-on')) fitDesignPreview();

  renderReferrals();
  wireStreamerHud();
  renderHUD();
  
  const settingsModal = $("settingsModal");
  $("openSettings")?.addEventListener("click", () => settingsModal?.showModal());
  $("closeSettings")?.addEventListener("click", () => settingsModal?.close());
  settingsModal?.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.close(); });

  const markDirty = () => { state._dirty = true; const sb = $("savebar"); if (sb) sb.hidden = false; renderHUD(); };

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
          if (row) { row.querySelector(".p-name").value = value; markDirty(); updateDesignPreview(); }
        } else if (key === "player_wager" && extra) {
          // Find the player row by name and update wager
          const rows = [...$("rows").children];
          const row = rows.find(tr => tr.querySelector(".p-name")?.value.trim() === extra);
          if (row) { row.querySelector(".p-wager").value = value.replace(/[^0-9.]/g, ""); markDirty(); updateDesignPreview(); }
        }
      } else {
        // Fallback: open the settings modal and focus the relevant field
        settingsModal?.showModal();
        const el = document.getElementById(key);
        if (el) {
          el.focus();
          el.select?.();
        }
      }
    }
  });
  $("dash").addEventListener("input", (e) => { markDirty(); updateDesignPreview(); });
  $("dash").addEventListener("change", (e) => { markDirty(); updateDesignPreview(); });
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
          alert(d.error || "Failed to update player");
          addBtn.disabled = false;
          addBtn.textContent = "Update";
        }
      } catch (err) {
        alert("Network error");
        addBtn.disabled = false;
        addBtn.textContent = "Update";
      }
    });
  }

  if (copyObs) {
    copyObs.addEventListener("click", () => {
      navigator.clipboard.writeText(location.origin + "/" + state.SLUG + "/overlay").then(() => {
        copyObs.textContent = "✓ Copied";
        setTimeout(() => { copyObs.textContent = "📋 Copy OBS Link"; }, 2000);
      });
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

function renderHUD() {
  const boardName = $("f_name")?.value.trim() || "—";
  const rawPrize = ($("f_pool")?.value || "").replace(/[^0-9.]/g, "");
  const players = currentPlayers();
  const cap = state.ME && state.ME.limits.players < 999 ? " / " + state.ME.limits.players : "";
  
  if ($("ov_board")) $("ov_board").textContent = boardName;
  if ($("ov_prize")) $("ov_prize").textContent = rawPrize ? "$" + fmtMoney(Number(rawPrize)) : "—";
  if ($("ov_players")) $("ov_players").textContent = players.length + cap;
  if ($("ov_resets")) $("ov_resets").textContent = resetsIn();
}

init();
