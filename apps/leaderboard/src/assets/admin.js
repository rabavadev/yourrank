/* Operator panel: users, leads, payments, support, actions. */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const when = (ms) => { if (!ms) return "–"; const d = new Date(Number(ms)); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

async function api(path, opts) {
    const merged = { ...opts, credentials: "include" };
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
  await Promise.all([loadUsers(), loadLeads(), loadPayments(), loadSupport()]);
  $("loading").hidden = true; $("panel").hidden = false;
}

function pill(text, tone) {
  return `<span class="pill pill--${tone || "muted"}">${esc(text)}</span>`;
}

document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", String(on)); });
    document.querySelectorAll(".tabpane").forEach((p) => (p.hidden = p.id !== "tab-" + t.dataset.tab));
  }));

  // A11Y-003: Arrow-key navigation for tablist
  document.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
    const tabs = [...document.querySelectorAll('.tab')];
    const idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    let next;
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); next.click(); next.focus(); }
  });

async function loadUsers(page) {
  page = page || 1;
  const d = await api("/api/admin/users?page=" + page);
  const rows = d.users || [];
  $("usersEmpty").hidden = rows.length > 0;
  $("usersBody").innerHTML = rows.map((u) => {
    const plan = String(u.plan || "free").toLowerCase();
    const paid = ["agency", "pro", "starter"].includes(plan) && u.plan_expires_at && Number(u.plan_expires_at) > Date.now();
    let planTxt = "free";
    if (paid) {
      planTxt = plan + " · until " + when(u.plan_expires_at);
      if (Number(u.plan_expires_at) > new Date("2099-01-01T00:00:00Z").getTime()) {
        planTxt = plan + " · lifetime";
      }
    }
    return `<tr>
<td>${esc(u.email)}${u.is_admin ? " " + pill("admin", "info") : ""}</td>
<td>${u.slug ? `<a href="/${esc(u.slug)}" target="_blank">/${esc(u.slug)}</a>` : "–"}</td>
<td>${pill(planTxt, paid ? "good" : "muted")}</td>
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
      alert(d.message || "Reset link generated. Deliver it via email.");
      btn.disabled = false;
      return;
    }
    await loadUsers();
    const ov = await api("/api/admin/overview");
    $("s_pro").textContent = ov.pro; $("s_rev").textContent = "$" + Number(ov.revenue || 0).toLocaleString();
  } catch { btn.disabled = false; }
}

async function loadLeads(page) {
  page = page || 1;
  const d = await api("/api/admin/leads?page=" + page);
  const rows = d.leads || [];
  $("leadsEmpty").hidden = rows.length > 0;
  $("leadsBody").innerHTML = rows.map((l) =>
    `<tr><td>${esc(l.handle)}</td><td>${esc(l.casino)}</td><td>${esc(l.contact)}</td><td class="note">${esc(l.note)}</td><td>${when(l.created_at)}</td></tr>`
  ).join("");
  renderPag("leadsPagination", d, page, loadLeads);
}

async function loadPayments(page) {
  page = page || 1;
  const d = await api("/api/admin/payments?page=" + page);
  const rows = d.payments || [];
  $("payEmpty").hidden = rows.length > 0;
  $("payBody").innerHTML = rows.map((p) => {
    const tone = ["finished", "manual"].includes(p.status) ? "good" : ["failed", "expired", "refunded"].includes(p.status) ? "bad" : "muted";
    return `<tr><td>${esc(p.email || p.user_id)}</td><td>${esc(p.provider)}</td><td class="ta-r">$${Number(p.amount_usd).toFixed(2)}</td><td>${pill(p.status, tone)}</td><td>${when(p.created_at)}</td></tr>`;
  }).join("");
  renderPag("payPagination", d, page, loadPayments);
}

let supportMessages = {};
let supportPage = 1;

async function loadSupport(page, status) {
  page = page || 1;
  supportPage = page;
  const statusFilter = status || $("supportFilter").value || "all";
  const d = await api(`/api/admin/support?status=${encodeURIComponent(statusFilter)}&page=${page}`);
  const rows = d.messages || [];
  supportMessages = Object.fromEntries(rows.map((m) => [m.id, m]));
  $("supportEmpty").hidden = rows.length > 0;
  $("supportBody").innerHTML = rows.map((m) =>
    `<tr>
      <td>${when(m.created_at)}</td>
      <td>${esc(m.name)}<br><small class="muted">${esc(m.email)}</small></td>
      <td>${esc(m.subject)}</td>
      <td>${pill(m.replied_at ? "replied" : "pending", m.replied_at ? "good" : "muted")}</td>
      <td><button class="btn btn--xs" data-reply="${m.id}">${m.replied_at ? "View" : "Reply"}</button></td>
    </tr>`
  ).join("");
  $("supportBody").querySelectorAll("button[data-reply]").forEach((b) => b.addEventListener("click", () => openReply(b.dataset.reply)));
  renderPag("supportPagination", d, page, loadSupport);
}

function openReply(id) {
  const m = supportMessages[id];
  if (!m) return;
  $("replyId").value = m.id;
  $("replyToEmail").textContent = m.email;
  $("replySubject").textContent = m.subject;
  $("replyMessage").textContent = m.message;
  $("replyText").value = m.reply || "";
  $("replyStatus").textContent = "";
  $("replyCancel").hidden = false;
  $("supportReplyCard").hidden = false;
  $("supportReplyCard").scrollIntoView({ behavior: "smooth" });
}

async function submitReply(e) {
  e.preventDefault();
  const id = $("replyId").value;
  const reply = $("replyText").value.trim();
  if (!reply) return;
  const btn = e.submitter;
  btn.disabled = true;
  $("replyStatus").textContent = "Sending...";
  try {
    const d = await api("/api/admin/support/reply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, reply }) });
    if (!d.ok) {
      $("replyStatus").textContent = d.error || "Failed to send reply.";
      btn.disabled = false;
      return;
    }
    $("replyStatus").textContent = "Reply sent" + (d.emailSent ? " by email" : " (email not configured)") + ".";
    await loadSupport(supportPage);
    setTimeout(() => { $("supportReplyCard").hidden = true; $("replyText").value = ""; }, 1500);
  } catch {
    $("replyStatus").textContent = "Network error. Try again.";
    btn.disabled = false;
  }
}

$("replyForm")?.addEventListener("submit", submitReply);
$("replyCancel")?.addEventListener("click", () => { $("supportReplyCard").hidden = true; });
$("supportFilter")?.addEventListener("change", () => loadSupport(1, $("supportFilter").value));

function renderPag(containerId, data, page, loadFn) {
  const el = $(containerId);
  if (!el) return;
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 50)));
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  const prevDis = page <= 1 ? "disabled" : "";
  const nextDis = page >= totalPages ? "disabled" : "";
  el.innerHTML = `<span class="hint" style="margin-right:auto">${data.total || 0} items · page ${page} of ${totalPages}</span>` +
    `<button class="btn btn--sm btn--ghost" ${prevDis} data-pag="-1">← Previous</button>` +
    `<button class="btn btn--sm btn--ghost" ${nextDis} data-pag="1">Next →</button>`;
  el.querySelectorAll("[data-pag]").forEach(b => b.addEventListener("click", () => loadFn(page + Number(b.dataset.pag))));
}

$("logout").addEventListener("click", async (e) => { e.preventDefault(); await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } }); location.href = "/login"; });
init();
