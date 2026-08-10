// Account settings: password, sessions, data export.
import { $, getCsrf, logError, showConfirmModal } from "./utils.js";

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
  try {
    const res = await fetch("/api/auth/sessions", { credentials: "include" });
    const data = await res.json();
    if (!data?.ok || !data.sessions) {
      list.innerHTML = '<p class="err">Could not load sessions.</p>';
      return;
    }
    if (!data.sessions.length) {
      list.innerHTML = '<p class="hint">No active sessions.</p>';
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
  } catch (e) {
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
