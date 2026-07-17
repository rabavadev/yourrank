/* Support ticket page client */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const when = (ms) => { if (!ms) return "–"; const d = new Date(Number(ms)); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
const statusPill = (m) => { if (m.reply) return `<span class="pill pill--good">Answered</span>`; if (m.status === "closed") return `<span class="pill pill--muted">Closed</span>`; return `<span class="pill pill--warn">Open</span>`; };

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { ...(opts.body ? { "content-type": "application/json" } : {}), ...opts.headers }, ...opts });
  const data = await r.json().catch(() => ({ ok: false, error: "Network error" }));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

async function loadTickets() {
  try {
    const d = await api("/api/support");
    const list = $("ticketsList");
    const rows = (d.tickets || []);
    $("ticketsSub").textContent = `${rows.length} ticket${rows.length === 1 ? "" : "s"}`;
    $("ticketsEmpty").hidden = rows.length > 0;
    list.innerHTML = rows.map((t) =>
      `<div class="ticket-row">
        <div class="ticket-meta">
          <b>${esc(t.subject)}</b>
          <span class="muted">${when(t.created_at)}</span>
          ${statusPill(t)}
        </div>
        <div class="ticket-body"><p>${esc(t.message)}</p></div>
        ${t.reply ? `<div class="ticket-reply"><b>Reply:</b><p>${esc(t.reply).replace(/\n/g, "<br>")}</p><span class="muted">Replied ${when(t.replied_at)}</span></div>` : ""}
      </div>`
    ).join("");
  } catch (e) {
    $("ticketsSub").textContent = e.message;
  }
}

$("ticketForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const subject = $("ticketSubject").value.trim();
  const message = $("ticketMessage").value.trim();
  const btn = e.submitter;
  btn.disabled = true;
  const status = $("ticketStatus");
  status.textContent = "Sending…";
  try {
    await api("/api/support", { method: "POST", body: JSON.stringify({ subject, message }) });
    status.textContent = "Ticket sent.";
    status.className = "status success";
    $("ticketForm").reset();
    await loadTickets();
  } catch (err) {
    status.textContent = err.message;
    status.className = "status error";
  } finally {
    btn.disabled = false;
  }
});

(async function boot() {
  $("support").hidden = true;
  try {
    await loadTickets();
    $("loading").hidden = true;
    $("support").hidden = false;
  } catch (e) {
    $("loading").hidden = true;
    $("ticketsSub").textContent = e.message;
  }
})();
