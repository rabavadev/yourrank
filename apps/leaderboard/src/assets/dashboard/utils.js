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

export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
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

export function currentPlayers() {
  return [...$("rows").children].map((tr) => ({
    name: tr.querySelector(".p-name").value.trim(),
    wagered: parseFloat(tr.querySelector(".p-wager").value) || 0,
    prize: parseFloat(tr.querySelector(".p-prize").value) || 0,
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
