// Account settings: password, sessions, data export.
import { $, getCsrf, logError, showConfirmModal } from "./utils.js";
import { setState, state } from "./state.js";
import { renderEmpty, setBlockLoading } from "./states.js";

async function jsonPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
    body: JSON.stringify(body),
  });
  let data = {};
  if (res.headers.get("content-type")?.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  }
  return { ok: res.ok && data.ok, status: res.status, data };
}

function setStatus(el, message, isError) {
  el.textContent = message;
  el.className = isError ? "err" : "hint";
}

async function loadSessions() {
  const list = $("accSessions");
  if (!list) return;
  setState({ SESSIONS_STATUS: "loading" });
  setBlockLoading(list, { lines: 3 });
  try {
    const res = await fetch("/api/auth/sessions", { credentials: "include" });
    const data = await res.json();
    if (!data?.ok || !data.sessions) {
      setState({ SESSIONS_STATUS: "error" });
      list.innerHTML = '<p class="err">Could not load sessions.</p>';
      return;
    }
    setState({ SESSIONS_STATUS: "ready" });
    if (!data.sessions.length) {
      renderEmpty(list, { icon: "users", title: "No active sessions.", body: "Active signed-in devices will appear here." });
      return;
    }
    let html =
      '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Started</th><th>Expires</th><th></th></tr></thead><tbody>';
    for (const s of data.sessions) {
      const label = s.current ? '<span class="pill pill--info">This device</span>' : "";
      const created = s.createdAt ? new Date(s.createdAt).toLocaleString() : "—";
      const expires = s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "—";
      html += `<tr><td>${created}</td><td>${expires}</td><td class="ta-r">${label}</td></tr>`;
    }
    html += "</tbody></table></div>";
    list.innerHTML = html;
    list.removeAttribute("aria-busy");
  } catch (e) {
    setState({ SESSIONS_STATUS: "error" });
    logError("loadSessions", e);
    list.innerHTML = '<p class="err">Could not load sessions.</p>';
  }
}

function wireChangePassword() {
  const save = $("accChangePassword");
  if (!save) return;
  save.addEventListener("click", async () => {
    const status = $("accPasswordStatus");
    const current = $("accCurrentPassword").value.trim();
    const password = $("accNewPassword").value.trim();
    setStatus(status, "", false);
    if (password.length < 8) {
      setStatus(status, "New password must be at least 8 characters.", true);
      return;
    }
    setStatus(status, "Saving…", false);
    const result = await jsonPost("/api/auth/change-password", { currentPassword: current, password });
    if (result.ok) {
      setStatus(status, result.data.message || "Password updated.", false);
      $("accCurrentPassword").value = "";
      $("accNewPassword").value = "";
      loadSessions();
    } else {
      setStatus(status, result.data?.message || "Update failed.", true);
    }
  });
}

function wireRevokeSessions() {
  const btn = $("accRevokeSessions");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const status = $("accSessionsStatus");
    if (!await showConfirmModal("Sign out other devices", "Every other active session will be closed. This device will stay signed in.", "Sign out", false)) return;
    setStatus(status, "Signing out…", false);
    const result = await jsonPost("/api/auth/sessions/revoke-others", {});
    if (result.ok) {
      setStatus(status, result.data.message || "Other sessions signed out.", false);
      loadSessions();
    } else {
      setStatus(status, result.data?.message || "Could not sign out sessions.", true);
    }
  });
}

function wireExport() {
  const btn = $("accExportData");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const status = $("accExportStatus");
    setStatus(status, "Preparing download…", false);
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus(status, data?.message || "Export failed.", true);
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("content-disposition") || "";
      let filename = "yourrank-export.json";
      const m = disp.match(/filename="?([^"]+)"?/);
      if (m) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(status, "Download started.", false);
    } catch (e) {
      logError("exportData", e);
      setStatus(status, "Download failed.", true);
    }
  });
}

export function wireAccount() {
  wireChangePassword();
  wireRevokeSessions();
  wireExport();
  loadSessions();
}

const SETTINGS_SUBLINES = {
  plan: "Manage your subscription, account connections, and safety settings",
  account: "Manage your subscription, account connections, and safety settings",
  security: "Configure server credentials, notification targets, and restrictive boundaries",
  domain: "Manage the custom domain for your public leaderboard",
  support: "Get help and manage the tools around your public leaderboard",
};

function settingsMeter(name, used, limit) {
  if (used == null || limit == null) return "";
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const warn = limit > 0 && pct >= 80;
  return `<div class="v3-settings-meter"><div class="v3-meter-lbl"><span>${name}</span><span class="v3-meter-val${warn ? " v3-meter-val--warn" : ""}">${used} / ${limit}</span></div><div class="v3-meter${warn ? " v3-meter--warn" : ""}"><i style="width:${Math.min(100, pct)}%"></i></div></div>`;
}

async function loadSettingsUsage() {
  const wrap = $("settingsUsage");
  if (!wrap) return;
  setState({ USAGE_STATUS: "loading" });
  setBlockLoading(wrap, { lines: 4 });
  try {
    const res = await fetch("/api/account/usage", { credentials: "include" });
    const data = await res.json();
    if (!res.ok || !data) throw new Error("usage request failed");
    setState({ USAGE_STATUS: "ready" });
    const rows = [
      settingsMeter("Players per board", data.leaderboard?.players?.used, data.leaderboard?.players?.limit),
      settingsMeter("Active boards", data.leaderboard?.boards?.used, data.leaderboard?.boards?.limit),
    ];
    if (data.credits) rows.push(
      settingsMeter("Kick credit rules", data.credits.rewardMappings?.used, data.credits.rewardMappings?.limit),
      settingsMeter("Active items", data.credits.shopItems?.used, data.credits.shopItems?.limit),
      settingsMeter("Pending redemptions", data.credits.pendingRedemptions?.used, data.credits.pendingRedemptions?.limit),
      settingsMeter("Fulfilled this month", data.credits.redemptionsPer30Days?.used, data.credits.redemptionsPer30Days?.limit),
      settingsMeter("New viewers this month", data.credits.newViewersPer30Days?.used, data.credits.newViewersPer30Days?.limit),
    );
    wrap.innerHTML = rows.join("") || '<p class="v3-settings-inline">No usage data yet.</p>';
    wrap.removeAttribute("aria-busy");
  } catch (err) {
    setState({ USAGE_STATUS: "error" });
    logError("settings-usage", err);
    wrap.innerHTML = '<p class="v3-settings-inline v3-settings-inline--error">Couldn’t load usage. Try again later.</p>';
  }
}

function renderSettingsPlan() {
  const plan = state.ME?.plan || null;
  const label = plan === "pro" ? "PRO PLAN" : plan === "starter" ? "STARTER PLAN" : plan ? `${plan.toUpperCase()} PLAN` : "—";
  const chip = $("settingsPlanChip");
  const price = $("settingsPlanPrice");
  const renewal = $("settingsPlanRenewal");
  if (chip) chip.textContent = label;
  if (price) price.textContent = plan === "free" ? "Free" : state.ME?.proPrice ? `$${state.ME.proPrice}/month` : "—";
  if (renewal) {
    const expiry = state.ME?.planExpiresAt ? new Date(state.ME.planExpiresAt).toLocaleDateString() : "";
    renewal.textContent = state.ME?.isTrial ? `Your trial is active${expiry ? ` until ${expiry}` : ""}.` : expiry ? `Your subscription renews automatically on ${expiry}.` : "—";
  }
}

function wireSettingsTabs() {
  const tabs = [...document.querySelectorAll("[data-settings-tab]")];
  const panels = [...document.querySelectorAll("[data-settings-panel]")];
  if (!tabs.length) return;
  const select = (key, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.settingsTab === key;
      tab.classList.toggle("is-on", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.settingsPanel !== key; });
    const subline = $("settingsSubline");
    if (subline) subline.textContent = SETTINGS_SUBLINES[key] || SETTINGS_SUBLINES.plan;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab.dataset.settingsTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next].dataset.settingsTab, true);
    });
  });
  document.querySelectorAll("[data-settings-jump]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    select(link.dataset.settingsJump);
  }));
  select("plan");
}

async function loadSettingsProviders() {
  const toggle = $("settingsKickLogin");
  if (!toggle) return;
  try {
    const res = await fetch("/api/credits/status", { credentials: "include" });
    const data = await res.json();
    toggle.checked = data?.viewerAuth?.kick === true;
  } catch (err) {
    logError("settings-providers", err);
    toggle.checked = false;
  }
}

function wireSettingsDanger() {
  const reset = $("settingsResetData");
  if (reset) reset.addEventListener("click", async () => {
    if (!await showConfirmModal("Reset leaderboard data", "Archive this period and clear all players? This cannot be undone.", "Reset data", true)) return;
    const status = $("status");
    try {
      const res = await fetch("/api/site/archive", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ label: "Settings reset", clear: "players", siteId: state.ACTIVE_SITE_ID }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Reset failed");
      if (status) { status.textContent = "Leaderboard data reset."; status.hidden = false; }
      location.reload();
    } catch (err) { logError("settings-reset", err); if (status) { status.textContent = err.message; status.hidden = false; } }
  });
  const del = $("settingsDeleteBoard");
  if (del) del.addEventListener("click", async () => {
    if (!await showConfirmModal("Delete board", "Delete this board and all of its data? This cannot be undone.", "Delete board", true)) return;
    try {
      const res = await fetch("/api/site", { method: "DELETE", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ siteId: state.ACTIVE_SITE_ID }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Delete failed");
      location.href = "/dashboard";
    } catch (err) { logError("settings-delete-board", err); const status = $("status"); if (status) { status.textContent = err.message; status.hidden = false; } }
  });
}

function wireSettingsPassword(site) {
  const save = $("settingsPasswordSave");
  const toggle = $("settingsPasswordEnabled");
  const input = $("settingsPassword");
  const status = $("settingsPasswordStatus");
  if (!save || !toggle || !input) return;
  toggle.checked = !!site?.passwordProtected;
  toggle.addEventListener("change", () => { input.disabled = !toggle.checked; });
  input.disabled = !toggle.checked;
  save.addEventListener("click", () => {
    const editorToggle = $("f_password_enabled");
    const editorInput = $("f_password");
    if (editorToggle) editorToggle.checked = toggle.checked;
    if (editorInput && input.value.trim()) editorInput.value = input.value.trim();
    const editorSave = $("save");
    if (editorSave) {
      editorSave.click();
      if (status) status.textContent = "Saving…";
    } else if (status) status.textContent = "Open Board → Setup to save password protection.";
  });
}

function wireSettingsWebhook() {
  const toggle = $("settingsWebhookEnabled");
  const body = $("notifyBody");
  if (!toggle || !body) return;
  const webhook = $("f_webhook");
  toggle.checked = !!webhook?.value;
  const sync = () => {
    body.classList.toggle("is-disabled", !toggle.checked);
    body.querySelectorAll("input, button").forEach((el) => { el.disabled = !toggle.checked; });
  };
  toggle.addEventListener("change", sync);
  sync();
}

export function setupSettingsScreen(sitePayload) {
  if (!document.querySelector('[data-page="settings"]')) return;
  wireSettingsTabs();
  renderSettingsPlan();
  loadSettingsUsage();
  loadSettingsProviders();
  wireSettingsDanger();
  wireSettingsPassword(sitePayload);
  wireSettingsWebhook();
}
