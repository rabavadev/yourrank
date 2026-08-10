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

// The dialog itself lives in /assets/dialog.js so the bot dashboard can use the
// same one; these keep the call sites unchanged.
let dialogReady;
function ensureDialog() {
  if (window.YRDialog) return Promise.resolve(window.YRDialog);
  if (!dialogReady) {
    dialogReady = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/assets/dialog.js";
      s.onload = () => resolve(window.YRDialog);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return dialogReady;
}

export async function showConfirmModal(title, body, confirmText = "Confirm", isDanger = false) {
  const dialog = await ensureDialog();
  return dialog.confirm({ title, body, confirmText, danger: isDanger });
}

export async function showPromptModal(title, body, opts = {}) {
  const dialog = await ensureDialog();
  return dialog.prompt({
    title,
    body,
    confirmText: opts.confirmText || "OK",
    type: opts.inputType || "text",
    value: opts.defaultValue || "",
    placeholder: opts.placeholder || "",
    label: opts.label || title,
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

// Generic client-side search/sort/pagination controller for data-driven tables.
export class ListController {
  constructor(opts) {
    this.root = opts.root;
    this.tbody = typeof opts.tbody === "string" ? $(opts.tbody) : opts.tbody;
    this.all = opts.items || [];
    this.perPage = opts.perPage || 20;
    this.searchFn = opts.searchFn || (() => "");
    this.sortOptions = opts.sortOptions || [];
    this.emptyText = opts.emptyText || "No items.";
    this.emptyAllText = opts.emptyAllText || this.emptyText;
    this.onRender = opts.onRender || (() => {});
    this.renderItem = opts.renderItem || ((item) => `<tr><td colspan="99">${esc(String(item))}</td></tr>`);
    this.page = 1;
    this.query = "";
    this.sortKey = this.sortOptions[0]?.key || "";
    this._buildControls();
    this.refresh();
  }
  _buildControls() {
    const wrap = document.createElement("div");
    wrap.className = "list-controls";
    const searchPlaceholder = this.root?.dataset?.searchPlaceholder || "Search…";
    let html = `<div class="list-controls-row">`;
    html += `<input type="search" class="list-search" placeholder="${esc(searchPlaceholder)}" aria-label="Search" />`;
    if (this.sortOptions.length) {
      html += `<select class="list-sort" aria-label="Sort"><option value="">Sort by…</option>`;
      for (const opt of this.sortOptions) html += `<option value="${esc(opt.key)}"${opt.key === this.sortKey ? " selected" : ""}>${esc(opt.label)}</option>`;
      html += `</select>`;
    }
    html += `</div><div class="list-pagination" role="group" aria-label="Pagination"><button class="btn btn--sm" data-prev type="button">Previous</button><span class="list-page-info"></span><button class="btn btn--sm" data-next type="button">Next</button></div>`;
    wrap.innerHTML = html;
    this.root.insertBefore(wrap, this.root.firstChild);
    this.searchInput = wrap.querySelector(".list-search");
    this.sortSelect = wrap.querySelector(".list-sort");
    this.prevBtn = wrap.querySelector("[data-prev]");
    this.nextBtn = wrap.querySelector("[data-next]");
    this.pageInfo = wrap.querySelector(".list-page-info");
    this.searchInput.addEventListener("input", () => { this.query = this.searchInput.value.trim().toLowerCase(); this.page = 1; this.refresh(); });
    if (this.sortSelect) this.sortSelect.addEventListener("change", () => { this.sortKey = this.sortSelect.value; this.page = 1; this.refresh(); });
    this.prevBtn.addEventListener("click", () => { if (this.page > 1) { this.page--; this.refresh(); } });
    this.nextBtn.addEventListener("click", () => { if (this.page < this.totalPages) { this.page++; this.refresh(); } });
  }
  setItems(items) {
    this.all = items || [];
    this.page = 1;
    this.refresh();
  }
  _matches(item) {
    if (!this.query) return true;
    const hay = String(this.searchFn(item)).toLowerCase();
    const terms = this.query.split(/\s+/).filter(Boolean);
    return terms.every((t) => hay.includes(t));
  }
  _sort(a, b) {
    const opt = this.sortOptions.find((o) => o.key === this.sortKey);
    if (!opt || !opt.fn) return 0;
    return opt.fn(a, b);
  }
  refresh() {
    const filtered = this.all.filter((item) => this._matches(item));
    const sorted = this.sortKey ? [...filtered].sort(this._sort.bind(this)) : filtered;
    this.totalPages = Math.max(1, Math.ceil(sorted.length / this.perPage));
    if (this.page > this.totalPages) this.page = this.totalPages || 1;
    const start = (this.page - 1) * this.perPage;
    const pageItems = sorted.slice(start, start + this.perPage);
    if (pageItems.length === 0) {
      const msg = this.all.length === 0 && !this.query ? this.emptyAllText : this.emptyText;
      const colCount = this.tbody?.closest("table")?.querySelectorAll("thead th").length || 1;
      this.tbody.innerHTML = `<tr><td colspan="${colCount}" class="muted">${esc(msg)}</td></tr>`;
    } else {
      const frag = document.createDocumentFragment();
      for (const item of pageItems) {
        const rendered = this.renderItem(item);
        if (typeof rendered === "string") {
          const tr = document.createElement("tr");
          tr.innerHTML = rendered;
          frag.appendChild(tr);
        } else {
          frag.appendChild(rendered);
        }
      }
      this.tbody.innerHTML = "";
      this.tbody.appendChild(frag);
    }
    this._updatePagination(sorted.length);
    this.onRender(pageItems);
  }
  _updatePagination(total) {
    this.pageInfo.textContent = total ? `Page ${this.page} of ${this.totalPages} (${total})` : `0`;
    this.prevBtn.disabled = this.page <= 1;
    this.nextBtn.disabled = this.page >= this.totalPages || this.totalPages === 0;
  }
}
