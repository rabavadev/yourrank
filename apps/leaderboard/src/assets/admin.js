/* Operator panel: users, leads, payments, actions. */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const when = (ms) => { if (!ms) return "–"; const d = new Date(Number(ms)); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

async function api(path, opts) {
  const merged = { ...opts };
  if (merged.method && ["POST","PUT","DELETE","PATCH"].includes(merged.method.toUpperCase())) {
    merged.headers = { ...(merged.headers || {}), "x-csrf-token": getCsrf() };
  }
  const res = await fetch(path, merged);
  const d = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("auth"); }
  if (res.status === 403) { const err = d.error || "forbidden"; if (err === "2fa_required") { location.href = "/admin"; throw new Error("2fa"); } const el = document.getElementById("panel") || document.getElementById("loading") || document.querySelector(".wrap"); if (el) { el.innerHTML = "<p style='padding:24px;font-family:system-ui'>Not an admin account. <a href='/dashboard'>Back to dashboard</a></p>"; el.hidden = false; } throw new Error("forbidden"); }
  return d;
}

async function init() {
  const me = await api("/api/auth/me");
  if (!me.ok || !me.user) { location.href = "/login"; return; }
  $("userEmail").textContent = me.user.email;
  const [ov] = await Promise.all([api("/api/admin/overview")]); // 403s here for non-admins
  $("s_users").textContent = ov.users; $("s_pro").textContent = ov.pro;
  $("s_leads").textContent = ov.leads; $("s_rev").textContent = "$" + Number(ov.revenue || 0).toLocaleString();
  await Promise.all([loadUsers(), loadLeads(), loadPayments()]);
  $("loading").hidden = true; $("panel").hidden = false;
}

document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
    document.querySelectorAll(".tabpane").forEach((p) => (p.hidden = p.id !== "tab-" + t.dataset.tab));
  }));

function pill(text, tone) { return `<span class="pill pill--${tone}">${esc(text)}</span>`; }

async function loadUsers(page) {
  page = page || 1;
  const d = await api("/api/admin/users?page=" + page);
  const rows = d.users || [];
  $("usersEmpty").hidden = rows.length > 0;
  $("usersBody").innerHTML = rows.map((u) => {
    const proLive = u.plan === "pro" && (!u.plan_expires_at || Number(u.plan_expires_at) > Date.now());
    const planTxt = proLive ? (u.plan_expires_at ? "pro · until " + new Date(Number(u.plan_expires_at)).toLocaleDateString() : "pro · lifetime") : "free";
    return `<tr>
<td>${esc(u.email)}${u.is_admin ? " " + pill("admin", "info") : ""}</td>
<td>${u.slug ? `<a href="/${esc(u.slug)}" target="_blank">/${esc(u.slug)}</a>` : "–"}</td>
<td>${pill(planTxt, proLive ? "good" : "muted")}</td>
<td>${pill(u.status, u.status === "active" ? "good" : "bad")}</td>
<td class="ta-r">${u.player_count ?? 0}</td>
<td>${when(u.created_at)}</td>
<td class="actions">
<button class="btn btn--xs" data-act="pro" data-id="${u.id}" title="Activate/extend Pro 31 days">+31d Pro</button>
<button class="btn btn--xs" data-act="free" data-id="${u.id}" title="Downgrade to Free">Free</button>
${u.status === "suspended"
  ? `<button class="btn btn--xs" data-act="unsuspend" data-id="${u.id}">Unsuspend</button>`
  : `<button class="btn btn--xs btn--danger" data-act="suspend" data-id="${u.id}">Suspend</button>`}
<button class="btn btn--xs" data-act="reset-link" data-id="${u.id}" title="Generate a 24h password reset link">Reset link</button>
</td></tr>`;
  }).join("");
  $("usersBody").querySelectorAll("button[data-act]").forEach((b) => b.addEventListener("click", () => action(b)));
  // Pagination UI
  const totalPages = Math.max(1, Math.ceil((d.total || 0) / (d.pageSize || 50)));
  const pagEl = $("usersPagination");
  if (pagEl) {
    if (totalPages <= 1) { pagEl.innerHTML = ""; return; }
    const prevDis = page <= 1 ? "disabled" : "";
    const nextDis = page >= totalPages ? "disabled" : "";
    pagEl.innerHTML = `<span class="hint" style="margin-right:auto">${d.total || 0} users · page ${page} of ${totalPages}</span>` +
      `<button class="btn btn--sm btn--ghost" id="pagPrev" ${prevDis}>← Previous</button>` +
      `<button class="btn btn--sm btn--ghost" id="pagNext" ${nextDis}>Next →</button>`;
    $("pagPrev")?.addEventListener("click", () => loadUsers(page - 1));
    $("pagNext")?.addEventListener("click", () => loadUsers(page + 1));
  }
}

async function action(btn) {
  const act = btn.dataset.act, userId = btn.dataset.id;
  if (act === "suspend" && !confirm("Suspend this account? Their page goes offline and they can't sign in.")) return;
  btn.disabled = true;
  try {
    const body = { userId, action: act };
    if (act === "pro") {
      const amt = prompt("Amount they paid you in USD (for the revenue ledger — 0 if comped):", "29");
      if (amt === null) { btn.disabled = false; return; }
      body.amountUsd = Number(amt) || 0;
    }
    const d = await api("/api/admin/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!d.ok) { alert(d.error || "Failed"); btn.disabled = false; return; }
    if (act === "reset-link") {
      try { await navigator.clipboard.writeText(d.link); } catch {}
      prompt(`Reset link for ${d.email} (valid 24h, copied to clipboard):`, d.link);
      btn.disabled = false;
      return;
    }
    await loadUsers();
    const ov = await api("/api/admin/overview");
    $("s_pro").textContent = ov.pro; $("s_rev").textContent = "$" + Number(ov.revenue || 0).toLocaleString();
  } catch { btn.disabled = false; }
}

async function loadLeads() {
  const d = await api("/api/admin/leads");
  const rows = d.leads || [];
  $("leadsEmpty").hidden = rows.length > 0;
  $("leadsBody").innerHTML = rows.map((l) =>
    `<tr><td>${esc(l.handle)}</td><td>${esc(l.casino)}</td><td>${esc(l.contact)}</td><td class="note">${esc(l.note)}</td><td>${when(l.created_at)}</td></tr>`
  ).join("");
}

async function loadPayments() {
  const d = await api("/api/admin/payments");
  const rows = d.payments || [];
  $("payEmpty").hidden = rows.length > 0;
  $("payBody").innerHTML = rows.map((p) => {
    const tone = ["finished", "manual"].includes(p.status) ? "good" : ["failed", "expired", "refunded"].includes(p.status) ? "bad" : "muted";
    return `<tr><td>${esc(p.email || p.user_id)}</td><td>${esc(p.provider)}</td><td class="ta-r">$${Number(p.amount_usd).toFixed(2)}</td><td>${pill(p.status, tone)}</td><td>${when(p.created_at)}</td></tr>`;
  }).join("");
}

$("logout").addEventListener("click", async (e) => { e.preventDefault(); await fetch("/api/auth/logout", { method: "POST", headers: { "x-csrf-token": getCsrf() } }); location.href = "/login"; });
init();
