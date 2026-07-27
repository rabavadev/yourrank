// Shared helpers used across dashboard modules.
import { state } from "./state.js";

export function getCsrf() {
  const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : "";
}

// E2E-005: Redirect to login on session expiry instead of showing stale "Save failed"
export function guardAuth(res) {
  if (res.status === 401) { location.href = "/login"; throw new Error("session expired"); }
  return res;
}

export const $ = (id) => document.getElementById(id);

export function logError(context, err, extra = {}) {
  const reqId = state.pageReqId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = { level: "error", context, message: err?.message || String(err), stack: err?.stack, req_id: reqId, extra: { url: location.href, ...extra } };
  console.error(JSON.stringify({ ...payload, ctx: "dashboard" }));
  try {
    fetch("/api/log", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf(), "x-request-id": reqId },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}
}

export function showToast(message, type = "error") {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = message;
  el.className = "toast"; // reset classes
  if (type) el.classList.add(`toast--${type}`);
  el.hidden = false;
  // Automatically hide after 4 seconds
  clearTimeout(el._toastTimeout);
  el._toastTimeout = setTimeout(() => {
    el.hidden = true;
  }, 4000);
}

export function showConfirmModal(title, body, confirmText = "Confirm", isDanger = false) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal";
    const card = document.createElement("div");
    card.className = "modal-card";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const p = document.createElement("p");
    p.textContent = body;
    
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.justifyContent = "flex-end";
    
    const cancel = document.createElement("button");
    cancel.className = "btn btn--sm btn--ghost";
    cancel.type = "button";
    cancel.textContent = "Cancel";
    
    const confirm = document.createElement("button");
    confirm.className = `btn btn--sm ${isDanger ? 'btn--danger' : 'btn--accent'}`;
    confirm.type = "button";
    confirm.textContent = confirmText;
    
    actions.appendChild(cancel);
    actions.appendChild(confirm);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(actions);
    modal.appendChild(card);
    
    const close = (val) => {
      document.body.removeChild(modal);
      resolve(val);
    };
    
    cancel.onclick = () => close(false);
    confirm.onclick = () => close(true);
    
    document.body.appendChild(modal);
    confirm.focus();
  });
}

// Fill a <input type="datetime-local"> with the wall-clock time in the user's
// OWN timezone. fromLocalInput() parses the field back as local time, so both
// sides must agree — using UTC getters here (as before) shifted the countdown
// by the user's offset on every save.
export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// The user's timezone abbreviation (e.g. "GMT+2", "EDT") for labelling the
// countdown field so nobody has to think in UTC.
export function localTzLabel() {
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(new Date());
    const tz = parts.find((p) => p.type === "timeZoneName");
    return tz ? tz.value : "";
  } catch {
    return "";
  }
}

export function fromLocalInput(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? "" : d.toISOString();
}

export function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function fmtMoney(n) {
  return n ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0";
}

export function parseAmount(str) {
  const raw = String(str || "").replace(/[$,\s]/g, "");
  if (raw === "") return 0;
  const n = parseFloat(raw);
  return (Number.isNaN(n) || !Number.isFinite(n) || n < 0) ? 0 : n;
}

export function currentPlayers() {
  return [...$("rows").children].map((tr) => ({
    name: tr.querySelector(".p-name").value.trim(),
    wagered: parseAmount(tr.querySelector(".p-wager").value),
    prize: parseAmount(tr.querySelector(".p-prize").value),
  })).filter((p) => p.name);
}

export function resetsIn() {
  const v = $("f_ends")?.value;
  if (!v) return "—";
  const end = new Date(v);
  if (isNaN(end)) return "—";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d >= 1 ? `${d}d` : `${h}h`;
}
