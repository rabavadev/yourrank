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

// Accessible confirmation modal with focus trap, Escape handling, and focus restore.
export function showConfirmModal(title, body, confirmText = "Confirm", isDanger = false) {
  return new Promise((resolve) => {
    const trigger = document.activeElement;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    const titleId = "modal-title-" + Math.random().toString(36).slice(2, 8);
    const descId = "modal-desc-" + Math.random().toString(36).slice(2, 8);
    modal.setAttribute("aria-labelledby", titleId);
    modal.setAttribute("aria-describedby", descId);

    const card = document.createElement("div");
    card.className = "modal-card";
    card.setAttribute("role", "document");

    const h3 = document.createElement("h3");
    h3.id = titleId;
    h3.textContent = title;

    const p = document.createElement("p");
    p.id = descId;
    p.textContent = body;

    const actions = document.createElement("div");
    actions.className = "modal-actions";
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

    const focusable = () => Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter((el) => !el.disabled && el.offsetParent !== null);

    let keyHandler;
    const close = (val) => {
      document.removeEventListener("keydown", keyHandler);
      document.body.removeChild(modal);
      if (trigger && trigger.focus) trigger.focus();
      resolve(val);
    };

    keyHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
        return;
      }
      if (e.key === "Tab") {
        const focusables = focusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    cancel.onclick = () => close(false);
    confirm.onclick = () => close(true);
    modal.onclick = (e) => { if (e.target === modal) close(false); };

    document.body.appendChild(modal);
    document.addEventListener("keydown", keyHandler);
    confirm.focus();
  });
}

// Accessible prompt modal (single input). Returns the string value, or null if cancelled.
export function showPromptModal(title, body, opts = {}) {
  return new Promise((resolve) => {
    const { confirmText = "OK", inputType = "text", defaultValue = "", placeholder = "" } = opts;
    const trigger = document.activeElement;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    const titleId = "modal-title-" + Math.random().toString(36).slice(2, 8);
    const descId = "modal-desc-" + Math.random().toString(36).slice(2, 8);
    modal.setAttribute("aria-labelledby", titleId);
    modal.setAttribute("aria-describedby", descId);

    const card = document.createElement("div");
    card.className = "modal-card";
    card.setAttribute("role", "document");

    const h3 = document.createElement("h3");
    h3.id = titleId;
    h3.textContent = title;

    const p = document.createElement("p");
    p.id = descId;
    p.textContent = body;

    const input = document.createElement("input");
    input.type = inputType;
    input.className = "modal-input";
    input.value = defaultValue;
    input.placeholder = placeholder;
    input.style.width = "100%";
    input.style.marginBottom = "14px";

    const actions = document.createElement("div");
    actions.className = "modal-actions";
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.justifyContent = "flex-end";

    const cancel = document.createElement("button");
    cancel.className = "btn btn--sm btn--ghost";
    cancel.type = "button";
    cancel.textContent = "Cancel";

    const confirm = document.createElement("button");
    confirm.className = "btn btn--sm btn--accent";
    confirm.type = "button";
    confirm.textContent = confirmText;

    actions.appendChild(cancel);
    actions.appendChild(confirm);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(input);
    card.appendChild(actions);
    modal.appendChild(card);

    const focusable = () => Array.from(modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")).filter((el) => !el.disabled && el.offsetParent !== null);

    let keyHandler;
    const close = (val) => {
      document.removeEventListener("keydown", keyHandler);
      document.body.removeChild(modal);
      if (trigger && trigger.focus) trigger.focus();
      resolve(val);
    };

    keyHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(null);
        return;
      }
      if (e.key === "Tab") {
        const focusables = focusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    input.addEventListener("keydown", (e) => { if (e.key === "Enter") close(input.value); });
    cancel.onclick = () => close(null);
    confirm.onclick = () => close(input.value);
    modal.onclick = (e) => { if (e.target === modal) close(null); };

    document.body.appendChild(modal);
    document.addEventListener("keydown", keyHandler);
    input.focus();
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

export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; } catch (err) { logError("clipboard-api", err); }
  }
  // Fallback for non-secure contexts or denied permission.
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (err) { logError("clipboard-fallback", err); return false; }
}

export function flashButton(btn, message, duration = 1500) {
  if (!btn) return;
  if (btn._flashTimeout) clearTimeout(btn._flashTimeout);
  if (btn._flashOriginal === undefined) btn._flashOriginal = btn.innerHTML;
  btn.textContent = message;
  btn._flashTimeout = setTimeout(() => {
    btn.innerHTML = btn._flashOriginal;
    delete btn._flashOriginal;
  }, duration);
}
