export const UNKNOWN = "—";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

const ICONS = {
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 6h18"/><path d="M5 6v14h14V6"/><path d="M8 6V3h8v3"/><path d="M9 10h6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 4-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M22 21a7 7 0 0 0-5-6.71"/></svg>',
};

export function emptyStateHtml({ icon = "chart", title, body, actions = [] }) {
  const iconHtml = ICONS[icon] || icon || ICONS.chart;
  const actionHtml = actions.length
    ? `<div class="v3-empty-actions">${actions.map((action) => {
      const tag = action.href ? "a" : "button";
      const attrs = action.href
        ? `href="${esc(action.href)}"`
        : `type="button"${action.id ? ` id="${esc(action.id)}"` : ""}`;
      return `<${tag} class="v3-btn${action.accent ? " v3-btn--accent" : ""}" ${attrs}>${esc(action.label)}</${tag}>`;
    }).join("")}</div>`
    : "";
  return `<div class="v3-empty"><span class="v3-empty-ic">${iconHtml}</span><h2>${esc(title)}</h2>${body ? `<p>${esc(body)}</p>` : ""}${actionHtml}</div>`;
}

export function metricText(status, value) {
  return status === "loading" ? "" : status === "ready" ? String(value ?? UNKNOWN) : UNKNOWN;
}

export function setMetricLoading(el) {
  if (!el) return;
  el.setAttribute("aria-busy", "true");
  el.innerHTML = '<span class="skeleton v3-skel-kpi" aria-hidden="true"></span>';
}

export function setMetricValue(el, text) {
  if (!el) return;
  el.removeAttribute("aria-busy");
  el.textContent = metricText("ready", text);
}

export function setMetricUnknown(el) {
  if (!el) return;
  el.removeAttribute("aria-busy");
  el.setAttribute("data-metric-unavailable", "true");
  el.title = "Data unavailable — stats may still be loading or analytics isn't configured yet.";
  el.innerHTML = `<span class="metric-unavailable" aria-label="Data unavailable">${UNKNOWN}</span>`;
}

export function setRowsLoading(tbody, { cols = 1, rows = 3 } = {}) {
  if (!tbody) return;
  tbody.setAttribute("aria-busy", "true");
  tbody.innerHTML = Array.from({ length: rows }, () =>
    `<tr aria-hidden="true">${Array.from({ length: cols }, () => '<td><span class="skeleton v3-skel-cell"></span></td>').join("")}</tr>`
  ).join("");
}

export function setBlockLoading(el, { lines = 3 } = {}) {
  if (!el) return;
  el.setAttribute("aria-busy", "true");
  el.innerHTML = Array.from({ length: lines }, () => '<span class="skeleton v3-skel-line"></span>').join("");
}

export function setBlockReady(el) {
  if (!el) return;
  el.removeAttribute("aria-busy");
}

export function renderError(el, { title = "Couldn't load this panel", body = "Try again to reload it.", retry, retryLabel = "Try again" } = {}) {
  if (!el) return;
  el.removeAttribute("aria-busy");
  el.setAttribute("role", "alert");
  el.innerHTML = emptyStateHtml({
    icon: "chart",
    title,
    body,
    actions: retry ? [{ label: retryLabel, id: "stateRetry", accent: true }] : [],
  });
  el.hidden = false;
  if (retry) el.querySelector("#stateRetry")?.addEventListener("click", retry, { once: true });
}

export function renderEmpty(el, spec) {
  if (!el) return;
  el.removeAttribute("aria-busy");
  el.innerHTML = emptyStateHtml(spec);
  el.hidden = false;
}
