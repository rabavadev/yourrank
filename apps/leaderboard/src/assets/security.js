// Security center client-side handlers.
function getCsrf() {
  const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : "";
}

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
  const list = document.getElementById("sess_list");
  try {
    const res = await fetch("/api/auth/sessions", { credentials: "include" });
    const data = await res.json();
    if (!data?.ok || !data.sessions) {
      list.innerHTML = "<p class=\"err\">Could not load sessions.</p>";
      return;
    }
    if (!data.sessions.length) {
      list.innerHTML = "<p class=\"hint\">No active sessions.</p>";
      return;
    }
    let html = '<table class="board-table"><thead><tr><th>Started</th><th>Expires</th><th></th></tr></thead><tbody>';
    for (const s of data.sessions) {
      const label = s.current ? '<span class="board-table-badge">This device</span>' : "";
      const created = s.createdAt ? new Date(s.createdAt).toLocaleString() : "—";
      const expires = s.expiresAt ? new Date(s.expiresAt).toLocaleString() : "—";
      html += `<tr><td>${created}</td><td>${expires}</td><td class="ta-r">${label}</td></tr>`;
    }
    html += "</tbody></table>";
    list.innerHTML = html;
  } catch (e) {
    list.innerHTML = "<p class=\"err\">Could not load sessions.</p>";
  }
}

document.getElementById("cp_save")?.addEventListener("click", async () => {
  const status = document.getElementById("cp_status");
  const current = document.getElementById("cp_current").value.trim();
  const password = document.getElementById("cp_new").value.trim();
  setStatus(status, "", false);
  if (password.length < 8) {
    setStatus(status, "New password must be at least 8 characters.", true);
    return;
  }
  setStatus(status, "Saving…", false);
  const result = await jsonPost("/api/auth/change-password", { currentPassword: current, password });
  if (result.ok) {
    setStatus(status, result.data.message || "Password updated.", false);
    document.getElementById("cp_current").value = "";
    document.getElementById("cp_new").value = "";
    loadSessions();
  } else {
    setStatus(status, result.data?.message || "Update failed.", true);
  }
});

document.getElementById("sess_revoke")?.addEventListener("click", async () => {
  const status = document.getElementById("sess_status");
  if (!confirm("Sign out every other device?")) return;
  setStatus(status, "Signing out…", false);
  const result = await jsonPost("/api/auth/sessions/revoke-others", {});
  if (result.ok) {
    setStatus(status, result.data.message || "Other sessions signed out.", false);
    loadSessions();
  } else {
    setStatus(status, result.data?.message || "Could not sign out sessions.", true);
  }
});

document.getElementById("export_btn")?.addEventListener("click", async () => {
  const status = document.getElementById("export_status");
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
    setStatus(status, "Download failed.", true);
  }
});

loadSessions();
