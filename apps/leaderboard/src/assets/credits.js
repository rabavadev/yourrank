import { showConfirmModal, showPromptModal, ListController, logError, showLoadError, clearLoadError } from "./dashboard/utils.js";
import { openDrawer, closeDrawer } from "./dashboard/shell.js";
import { setState } from "./dashboard/state.js";
import { UNKNOWN, emptyStateHtml, renderEmpty, setMetricLoading, setRowsLoading } from "./dashboard/states.js";
import { updateProfileMenu } from "./dashboard/profile-menu.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const csrf = () => document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : "—";
const relative = (iso) => { const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)); return mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`; };
const LEDGER_EVENT_LABELS = Object.freeze({ earn: "Earned", spend: "Spent", redeem: "Redeemed", revoke: "Refunded spend", refund: "Reversed earn" });
async function api(method, path, body) {
  const opts = { method, credentials: "same-origin", headers: { "x-csrf-token": csrf() } };
  if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(path, opts); const data = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("Session expired"); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`); return data;
}
let state = {};
let viewerCtrl, redemptionCtrl, rewardCtrl;
let activeSiteId = "";
let activityEvents = [];
let activityCursor = null;
let activityLoading = false;
let shopItemsView = [];
let shopSearch = "";
let shopSort = "cost";
let wired = false;
const tab = () => $("cr-app")?.dataset.crTab || "";
const siteQuery = () => new URLSearchParams(location.search).get("siteId");
const sitePath = (path) => `${path}${siteQuery() ? `${path.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteQuery())}` : ""}`;
function preserveSiteContextLinks() {
  const siteId = siteQuery();
  if (!siteId) return;
  const destinations = new Set([
    "/dashboard/rewards/redemptions",
    "/dashboard/rewards/shop",
    "/dashboard/rewards/rules",
    "/dashboard/audience/viewers",
    "/dashboard/audience/activity",
    "/dashboard/settings/integrations",
  ]);
  document.querySelectorAll("a[href]").forEach((link) => {
    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#")) return;
    const target = new URL(raw, location.origin);
    if (!destinations.has(target.pathname) || target.searchParams.has("siteId")) return;
    target.searchParams.set("siteId", siteId);
    link.href = `${target.pathname}${target.search}${target.hash}`;
  });
}
function setStatus(id, msg, error = false) { const el = $(id); if (!el) return; el.textContent = msg; el.className = error ? "status error" : "status"; if (!error) setTimeout(() => { el.textContent = ""; }, 3000); }
function setLoading(idOrEl, loading, text = "Loading…") {
  const el = typeof idOrEl === "string" ? $(idOrEl) : idOrEl;
  if (!el) return;
  if (loading) { el.dataset.origText = el.textContent; el.disabled = true; el.setAttribute("aria-busy", "true"); el.classList.add("btn--loading"); el.textContent = text; }
  else { el.disabled = false; el.removeAttribute("aria-busy"); el.classList.remove("btn--loading"); el.textContent = el.dataset.origText || el.textContent; delete el.dataset.origText; }
}
function setGlobalLoading(loading) { if ($("cr-loading")) $("cr-loading").hidden = !loading; }
function usageCls(used, limit) { const pct = limit > 0 ? Math.round((used / limit) * 100) : 0; return limit > 0 && used >= limit ? "cr-usage-over" : limit > 0 && pct >= 80 ? "cr-usage-near" : ""; }
function usageCard(used, limit, name) { const cls = usageCls(used, limit); return `<div class="cr-usage-card"><div class="hint">${esc(name)}</div><div class="cr-usage-number${cls ? ` ${cls}` : ""}">${used} / ${limit}</div>${cls ? '<a href="/account/plan" class="cr-usage-upgrade">Upgrade plan</a>' : ""}</div>`; }
function draftKey(id) { return `yr:credits:draft:${id}`; }
function debounce(fn, ms) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; }
function saveFormDraft(formId, id) {
  const form = $(formId); if (!form) return;
  const data = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "checkbox") { if (el.checked) data[el.name] = true; }
    else if (el.type === "number") { if (el.value !== "") data[el.name] = el.value; }
    else if (el.value.trim()) data[el.name] = el.value;
  }
  try { if (Object.keys(data).length) localStorage.setItem(draftKey(id), JSON.stringify(data)); else localStorage.removeItem(draftKey(id)); } catch (err) { logError("save-draft", err); }
}
function restoreFormDraft(formId, id) {
  const form = $(formId); if (!form) return;
  try {
    const data = JSON.parse(localStorage.getItem(draftKey(id)) || "null"); if (!data) return;
    for (const el of form.elements) { if (el.name && data[el.name] !== undefined) el.type === "checkbox" ? el.checked = Boolean(data[el.name]) : el.value = data[el.name]; }
    setStatus(form.querySelector(".status")?.id, "Draft restored.");
  } catch (err) { logError("restore-draft", err); }
}
function clearFormDraft(id) { try { localStorage.removeItem(draftKey(id)); } catch (err) { logError("clear-draft", err); } }
function wireAutosave(formId, id) {
  const form = $(formId); if (!form) return;
  const save = debounce(() => saveFormDraft(formId, id), 400);
  form.addEventListener("input", save); form.addEventListener("change", save); form.addEventListener("submit", () => clearFormDraft(id)); restoreFormDraft(formId, id);
}
function statusChip(status) {
  const meta = {
    pending: ["pending", "◷", "Pending"],
    fulfilled: ["fulfilled", "✓", "Fulfilled"],
    refunded: ["refunded", "↶", "Refunded"],
    cancelled: ["cancelled", "×", "Cancelled"],
  }[status] || ["pending", "◷", "Pending"];
  return `<span class="v3-chip v3-chip--${meta[0]}"><i aria-hidden="true">${meta[1]}</i> ${meta[2]}</span>`;
}
function wireShell() {
  const backdrop = document.querySelector(".lb-backdrop") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "lb-backdrop" }));
  $("lbMenu")?.addEventListener("click", () => openDrawer()); document.querySelector("[data-close-side]")?.addEventListener("click", () => closeDrawer()); backdrop.addEventListener("click", () => closeDrawer());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lbSide")?.classList.contains("is-open")) closeDrawer(); });
}
async function loadBoardShell() {
  const [me, boards] = await Promise.all([api("GET", "/api/auth/me"), api("GET", "/api/site/list")]);
  const user = me.user || {}; updateProfileMenu(user);
  const list = boards.sites || boards.boards || boards || []; const current = siteQuery() || list[0]?.id || list[0]?.siteId; const select = $("sidebarBoardSelect");
  activeSiteId = current || "";
  if (select) { select.innerHTML = list.map((b) => `<option value="${esc(b.id || b.siteId)}" ${String(b.id || b.siteId) === String(current) ? "selected" : ""}>${esc(b.name || b.slug || "Board")}</option>`).join(""); select.addEventListener("change", () => { location.href = `${location.pathname}?siteId=${encodeURIComponent(select.value)}`; }); }
  const board = list.find((b) => String(b.id || b.siteId) === String(current)) || list[0] || {};
  $("activeBoardName").textContent = board.name || board.slug || "Board"; $("activeBoardMeta").textContent = board.slug ? `yourrank.site/${board.slug}` : "";
  $("lbTopbarStatus").textContent = board.published ? "LIVE" : "NOT LIVE"; $("lbTopbarStatus").className = `lb-status ${board.published ? "lb-status--live" : "lb-status--draft"}`;
  $("planBadge").textContent = `${String(board.plan || user.plan || "free").toUpperCase()} PLAN`; if (board.slug) $("liveLink").href = `/${board.slug}`;
  preserveSiteContextLinks();
}
function renderShellUsage() {
  const used = state.usage?.redemptionsPer30Days;
  const limit = state.limits?.redemptionsPer30Days;
  const amount = $("usageAmount"); const max = $("usageLimit"); const fill = $("usageFill");
  if (amount) amount.textContent = used == null ? UNKNOWN : used;
  if (max) max.textContent = limit == null ? UNKNOWN : limit;
  if (fill) fill.style.width = `${limit > 0 && used != null ? Math.min(100, (used / limit) * 100) : 0}%`;
}
const metric = (value) => value == null ? UNKNOWN : value;
function renderRewardRow(m) {
  return `<td><b>${esc(m.kick_reward_title)}</b><br><span class="hint">${esc(m.kick_reward_id)}</span></td><td class="hint">Kick reward redeemed · ${m.kick_reward_cost} points</td><td class="num"><b>+${m.credits} credits</b></td><td><input class="v3-toggle" type="checkbox" ${m.active ? "checked" : ""} data-toggle-reward="${esc(m.id)}" /></td><td class="ta-r"><button class="btn btn--sm" data-edit-reward="${esc(m.id)}">Edit</button> <button class="btn btn--sm btn--danger" data-del-reward="${esc(m.id)}">Delete</button></td>`;
}
function renderViewerRow(v) { return `<td>${esc(v.kick_username || v.kick_user_id)}${v.blocked ? ' <span class="v3-chip v3-chip--cancelled">blocked</span>' : ""}</td><td class="num">${v.balance}</td><td class="num">${v.total_earned}</td><td class="num">${v.total_spent}</td><td>${fmtDate(v.last_earned_at || v.created_at)}</td><td class="ta-r"><button class="btn btn--sm ${v.blocked ? "btn--accent" : "btn--danger"}" data-block="${esc(v.id)}" data-blocked="${v.blocked ? "1" : ""}">${v.blocked ? "Unblock" : "Block"}</button></td>`; }
function renderRedemptionRow(r) { return `<td><b>${esc(r.kick_username || r.kick_user_id)}</b></td><td>${esc(r.item_name)}</td><td class="num"><b>${r.cost}</b><span class="hint">cr</span></td><td>${statusChip(r.status)}</td><td title="${esc(fmtDate(r.created_at))}">${relative(r.created_at)}</td><td class="ta-r">${r.status === "pending" ? `<button class="btn btn--sm" data-cancel="${esc(r.id)}">Cancel</button> <button class="btn btn--sm btn--accent" data-fulfill="${esc(r.id)}">Fulfil</button>` : ""}</td>`; }
function renderShopCards(items) {
  const root = $("cr-shop-list"); if (!root) return;
  ensureShopControls(items.length > 0);
  $("cr-shop-controls")?.toggleAttribute("hidden", items.length === 0);
  const filtered = items.filter((i) => !shopSearch || `${i.name} ${i.description || ""} ${i.cost} ${i.stock ?? ""}`.toLowerCase().includes(shopSearch));
  const sorted = [...filtered].sort((a, b) => shopSort === "active" ? Number(b.active) - Number(a.active) : shopSort === "stock" ? ((b.stock ?? Infinity) - (a.stock ?? Infinity)) : (b.cost || 0) - (a.cost || 0));
  const pages = Math.max(1, Math.ceil(sorted.length / 10)); shopPage = Math.min(shopPage, pages);
  const pageItems = sorted.slice((shopPage - 1) * 10, shopPage * 10);
  $("cr-shop-empty").hidden = filtered.length > 0;
  root.innerHTML = pageItems.map((i) => `<article class="cr-shop-card${i.active ? "" : " is-inactive"}"><div class="cr-shop-card-head"><button class="cr-shop-card-title" type="button" data-edit-shop="${esc(i.id)}">${esc(i.name)}</button><div class="cr-shop-card-controls"><button class="cr-shop-delete" type="button" data-del-shop="${esc(i.id)}" aria-label="Disable ${esc(i.name)}" title="Disable ${esc(i.name)}">×</button><input class="v3-toggle" type="checkbox" ${i.active ? "checked" : ""} data-toggle-shop="${esc(i.id)}" aria-label="Toggle ${esc(i.name)}" /></div></div><p>${esc(i.description || "")}</p><hr /><div class="cr-shop-card-foot"><b>${i.cost} <small>cr</small></b><span>Stock: ${i.stock === null ? "∞" : `${i.stock} left`}</span></div></article>`).join("");
  const controls = $("cr-shop-controls"); if (controls) { controls.querySelector("[data-shop-page]").textContent = filtered.length ? `Page ${shopPage} of ${pages} (${filtered.length})` : ""; controls.querySelector("[data-shop-prev]").disabled = shopPage <= 1; controls.querySelector("[data-shop-next]").disabled = shopPage >= pages; }
  wireDynamicActions();
}
function render() {
  const usage = state.usage || {}, limits = state.limits || {}, current = tab();
  renderShellUsage();
  const rewardAtLimit = usage.rewardMappings != null && limits.rewardMappings != null && usage.rewardMappings >= limits.rewardMappings;
  const shopAtLimit = usage.shopItems != null && limits.shopItems != null && usage.shopItems >= limits.shopItems;
  const rewardUsage = $("cr-reward-usage");
  if (rewardUsage) rewardUsage.textContent = `${metric(usage.rewardMappings)} / ${metric(limits.rewardMappings)} credit rules`;
  const addMapping = $("cr-add-mapping");
  if (addMapping) {
    addMapping.classList.toggle("is-disabled", rewardAtLimit);
    addMapping.title = rewardAtLimit ? "Upgrade your plan to add more credit rules" : "";
    addMapping.setAttribute("aria-disabled", rewardAtLimit ? "true" : "false");
    addMapping.onclick = rewardAtLimit ? (e) => e.preventDefault() : (e) => {
      e.preventDefault();
      const details = $("cr-reward-form")?.closest("details");
      if (details) details.open = true;
      $("cr-reward-kick-id")?.focus();
    };
  }
  if (current === "channel") {
    const connected = Boolean(state.channel?.externalId);
    $("cr-channel-connected").hidden = !connected; $("cr-channel-connect-wrap").hidden = connected;
    $("cr-channel-name").textContent = state.channel?.name || ""; $("cr-channel-id-input").value = state.channel?.externalId || ""; $("cr-channel-name-input").value = state.channel?.name || "";
    const expiry = state.channel?.tokenExpiresAt;
    $("cr-channel-token").textContent = expiry ? (new Date(expiry) > new Date() ? `Token valid · expires in ${Math.max(1, Math.ceil((new Date(expiry) - Date.now()) / 86400000))} days` : "Token expired · reconnect") : "No Kick token · connect Kick";
    $("cr-usage").innerHTML = [usageCard(metric(usage.rewardMappings), metric(limits.rewardMappings), "credit rules"), usageCard(metric(usage.shopItems), metric(limits.shopItems), "items"), usageCard(metric(usage.pendingRedemptions), metric(limits.pendingRedemptions), "pending redemptions"), usageCard(metric(usage.redemptionsPer30Days), metric(limits.redemptionsPer30Days), "redemptions / 30 days"), usageCard(metric(usage.newViewersPer30Days), metric(limits.newViewersPer30Days), "new viewers / 30 days")].join("");
    const auth = state.viewerAuth || {};
    $("cr-viewer-auth-kick").checked = auth.kick !== false; $("cr-viewer-auth-discord").checked = auth.discord !== false; $("cr-viewer-auth-public").checked = auth.public !== false;
  }
  if (current === "rules") {
    for (const id of ["cr-reward-submit", "cr-reward-create-submit"]) { const el = $(id); if (el) { el.disabled = rewardAtLimit; el.title = rewardAtLimit ? "Upgrade your plan to add more credit rules" : ""; } }
    const mappings = state.mappings || [];
    if (!rewardCtrl) { rewardCtrl = new ListController({ root: $("cr-rewards"), tbody: "cr-reward-list", emptyEl: $("cr-reward-empty"), emptySpec: { icon: "link", title: "No credit rules yet", body: "Set how Kick rewards award credits to your viewers.", actions: [{ label: "Create credit rule", href: "/dashboard/rewards/rules#cr-reward-form", accent: true }] }, items: mappings, perPage: 10, searchFn: (m) => `${m.kick_reward_title} ${m.kick_reward_id} ${m.kick_reward_cost} ${m.credits}`, sortOptions: [{ key: "cost", label: "Kick cost", fn: (a, b) => (b.kick_reward_cost || 0) - (a.kick_reward_cost || 0) }, { key: "credits", label: "Credits", fn: (a, b) => (b.credits || 0) - (a.credits || 0) }, { key: "active", label: "Active first", fn: (a, b) => Number(b.active) - Number(a.active) }], emptyAllText: "No credit rules yet.", emptyText: "No matching credit rules.", renderItem: (m) => renderRewardRow(m), onRender: () => wireDynamicActions() }); mountListControls($("cr-rewards"), $("cr-mapping-toolbar"), $("cr-mapping-foot")); }
    else rewardCtrl.setItems(mappings);
    prefillEditFromQuery();
  }
  if (current === "shop") {
    $("cr-shop-usage").textContent = `${metric(usage.shopItems)} / ${metric(limits.shopItems)} active items`;
    const submit = $("cr-shop-submit"); if (submit) { submit.disabled = shopAtLimit; submit.title = shopAtLimit ? "Upgrade your plan to add more items" : ""; }
    const create = $("cr-shop-new"); if (create) { create.disabled = shopAtLimit; create.title = shopAtLimit ? "Upgrade your plan to add more items" : ""; }
    shopItemsView = state.shopItems || []; renderShopCards(shopItemsView);
  }
  if (current === "viewers") {
    const viewers = state.viewers || [];
    if (!viewerCtrl) { viewerCtrl = new ListController({ root: $("cr-viewers"), tbody: "cr-viewer-list", emptyEl: $("cr-viewer-empty"), emptySpec: { icon: "users", title: "No viewers yet", body: "Viewer balances will appear after viewers earn or spend credits." }, items: viewers, perPage: 15, searchFn: (v) => `${v.kick_username || v.kick_user_id} ${v.block_reason || ""} ${v.blocked ? "blocked" : ""}`, sortOptions: [{ key: "balance", label: "Balance", fn: (a, b) => (b.balance || 0) - (a.balance || 0) }, { key: "earned", label: "Earned", fn: (a, b) => (b.total_earned || 0) - (a.total_earned || 0) }, { key: "spent", label: "Spent", fn: (a, b) => (b.total_spent || 0) - (a.total_spent || 0) }, { key: "last", label: "Last earned", fn: (a, b) => new Date(b.last_earned_at || b.created_at || 0) - new Date(a.last_earned_at || a.created_at || 0) }], emptyAllText: "No viewers yet.", emptyText: "No matching viewers.", renderItem: (v) => renderViewerRow(v), onRender: () => wireDynamicActions() }); }
    else viewerCtrl.setItems(viewers);
    renderAnalytics();
  }
  if (current === "redemptions") {
    renderOnboarding();
    const channel = $("cr-redemption-channel");
    if (state.channel?.externalId) { channel.innerHTML = `● Connected to @${esc(state.channel.name || state.channel.externalId)}`; channel.className = "v3-chip v3-chip--refunded"; } else { channel.innerHTML = '<a href="/dashboard/settings/integrations">Not connected · Connect in Integrations</a>'; channel.className = "v3-chip v3-chip--cancelled"; }
    $("cr-pending-counter").textContent = `${metric(usage.pendingRedemptions)} / ${metric(limits.pendingRedemptions)}`; $("cr-fulfilled-counter").textContent = `${metric(usage.redemptionsPer30Days)} / ${metric(limits.redemptionsPer30Days)}`;
    const redemptions = state.redemptions || [];
    if (!redemptionCtrl) { redemptionCtrl = new ListController({ root: $("cr-redemptions"), tbody: "cr-redemption-list", emptyEl: $("cr-redemption-empty"), emptySpec: { icon: "archive", title: "No shop redemptions yet", body: "Viewer shop redemption requests will appear here." }, items: redemptions, perPage: 15, searchFn: (r) => `${r.kick_username || r.kick_user_id} ${r.item_name} ${r.status}`, sortOptions: [{ key: "time", label: "Newest", fn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) }, { key: "cost", label: "Cost", fn: (a, b) => (b.cost || 0) - (a.cost || 0) }, { key: "status", label: "Status", fn: (a, b) => (a.status || "").localeCompare(b.status || "") }], emptyAllText: "No shop redemptions yet.", emptyText: "No matching shop redemptions.", renderItem: (r) => renderRedemptionRow(r), onRender: () => wireDynamicActions() }); mountListControls($("cr-redemptions"), $("cr-redemption-toolbar"), $("cr-redemption-foot")); }
    else redemptionCtrl.setItems(redemptions);
  }
  if (current === "history") {
    const typeSelect = $("cr-history-type");
    if (typeSelect && typeSelect.options.length === 1) {
      for (const [value, label] of Object.entries(LEDGER_EVENT_LABELS)) typeSelect.add(new Option(label, value));
    }
    const empty = $("cr-history-feed-empty");
    const list = $("cr-history-feed-list");
    if (list) setRowsLoading(list, { cols: 5, rows: 3 });
    if (empty) empty.hidden = true;
  }
}
function renderOnboarding() {
  const wrap = $("cr-onboarding"); if (!wrap) return;
  let hidden = false;
  try { hidden = localStorage.getItem("cr-onboarding-hide") === "1"; } catch { void 0; }
  const connected = Boolean(state.channel?.externalId);
  const mappings = (state.mappings || []).filter((m) => m.active).length;
  const items = (state.shopItems || []).filter((i) => i.active).length;
  const redemptions = (state.redemptions || []).length;
  const steps = [{ id: 1, done: connected }, { id: 2, done: mappings > 0 }, { id: 3, done: items > 0 }, { id: 4, done: redemptions > 0 }, { id: 5, done: connected && mappings > 0 && items > 0 }];
  const current = steps.find((step) => !step.done)?.id;
  for (const step of steps) {
    const el = $(`cr-step-${step.id}`); if (!el) continue;
    el.classList.toggle("done", step.done); el.classList.toggle("current", current === step.id && !step.done);
  }
  const ready = steps[4].done;
  if (ready && !hidden) { hidden = true; try { localStorage.setItem("cr-onboarding-hide", "1"); } catch { void 0; } }
  wrap.hidden = hidden;
  const hide = $("cr-onboarding-hide"); if (hide) hide.hidden = false;
}
async function loadAnalytics() {
  const days = Number($("cr-analytics-days")?.value) || 30;
  for (const id of ["cr-stat-earned", "cr-stat-spent", "cr-stat-redemptions", "cr-stat-pending", "cr-stat-balance"]) setMetricLoading($(id));
  const bars = $("cr-credits-by-day");
  if (bars) {
    bars.setAttribute("aria-busy", "true");
    bars.innerHTML = '<span class="skeleton v3-skel-line" aria-hidden="true"></span>';
  }
  try {
    const data = await api("GET", sitePath(`/api/credits/analytics?days=${days}`));
    state.analytics = data; renderAnalytics(); setStatus("cr-analytics-status", "");
  } catch { setStatus("cr-analytics-status", "Analytics are temporarily unavailable.", true); }
}
function renderAnalytics() {
  const a = state.analytics; if (!a) return;
  const s = a.summary || {};
  $("cr-stat-earned").textContent = `${s.periodEarned ?? "—"} (all time: ${s.allTimeEarned ?? "—"})`;
  $("cr-stat-spent").textContent = `${s.periodSpent ?? "—"} (all time: ${s.allTimeSpent ?? "—"})`;
  $("cr-stat-redemptions").textContent = s.redemptionsTotal ?? "—";
  $("cr-stat-pending").textContent = s.redemptionsPending ?? "—";
  $("cr-stat-balance").textContent = s.viewerBalance ?? "—";
  const label = $("cr-analytics-days-label"); if (label) label.textContent = String(Number($("cr-analytics-days")?.value) || 30);
  const items = a.topItems || [];
  $("cr-top-items-list").innerHTML = items.map((i) => `<tr><td>${esc(i.name)}</td><td class="num">${i.redemptions}</td><td class="num">${i.credits_spent}</td></tr>`).join("");
  const topEmpty = $("cr-top-items-empty");
  if (items.length) topEmpty.hidden = true;
  else renderEmpty(topEmpty, { icon: "archive", title: "No items redeemed yet", body: "Redeemed items will appear here." });
  renderCreditsByDay(a.creditsByDay || []);
}
function renderCreditsByDay(rows) {
  const container = $("cr-credits-by-day"); if (!container) return;
  container.innerHTML = ""; container.removeAttribute("role"); container.removeAttribute("aria-label"); container.removeAttribute("aria-busy");
  const empty = $("cr-credits-by-day-empty");
  if (!rows.length) {
    renderEmpty(empty, { icon: "chart", title: "No credit activity for this period", body: "Try a longer range or create credit rules and items." });
    return;
  }
  empty.hidden = true;
  const grouped = {};
  for (const row of rows) { grouped[row.day] = grouped[row.day] || { earn: 0, spend: 0 }; grouped[row.day][row.type] = row.total; }
  const days = Object.keys(grouped).sort(); const max = Math.max(1, ...days.map((day) => grouped[day].earn + grouped[day].spend));
  container.innerHTML = days.map((day) => {
    const g = grouped[day]; const total = g.earn + g.spend; const label = new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `<div class="cr-bar-col" title="${label}: ${total} (${g.earn} earned, ${g.spend} spent)"><div class="cr-bar-col-inner"><div class="cr-bar-earn" style="height:${(g.earn / max) * 100}%"></div><div class="cr-bar-spend" style="height:${(g.spend / max) * 100}%"></div></div></div>`;
  }).join("");
  container.setAttribute("role", "img"); const allTotal = days.reduce((sum, day) => sum + grouped[day].earn + grouped[day].spend, 0);
  container.setAttribute("aria-label", `Bar chart of credits across ${days.length} days with activity. Total: ${allTotal} credits.`);
}
function prefillEditFromQuery() {
  if (tab() !== "rules") return;
  const id = new URLSearchParams(location.search).get("edit");
  const m = (state.mappings || []).find((x) => String(x.id) === String(id));
  if (!m) return;
  $("cr-reward-id").value = m.id; $("cr-reward-kick-id").value = m.kick_reward_id; $("cr-reward-title").value = m.kick_reward_title; $("cr-reward-cost").value = m.kick_reward_cost; $("cr-reward-credits").value = m.credits;
  setStatus("cr-reward-status", "Editing credit rule.");
}
function editReward(id) { const q = new URLSearchParams(); q.set("edit", id); if (siteQuery()) q.set("siteId", siteQuery()); location.href = `/dashboard/rewards/rules?${q}`; }
async function delReward(id, trigger) {
  const confirmed = await confirmPopover(trigger, "Disable credit rule", "This disables the credit rule; credit activity is retained.");
  if (!confirmed) return;
  setLoading(trigger, true, "Deleting…");
  try { await api("DELETE", sitePath(`/api/credits/rewards/${encodeURIComponent(id)}`)); await load(); }
  catch (err) { setStatus("cr-reward-status", err.message, true); } finally { setLoading(trigger, false); }
}
async function delShop(id, trigger) {
  if (!await showConfirmModal("Disable item", "Disable this item? It will no longer be redeemable, but past redemptions stay in credit activity.", "Disable", true)) return;
  setLoading(trigger, true, "Deleting…");
  try { await api("DELETE", sitePath(`/api/credits/shop/${encodeURIComponent(id)}`)); await load(); }
  catch (err) { setStatus("cr-shop-status", err.message, true); } finally { setLoading(trigger, false); }
}
async function toggleBlock(id, blocked, trigger) {
  const next = !blocked;
  let reason = "";
  if (next) { reason = await showPromptModal("Block viewer", "Why are you blocking this viewer?", { confirmText: "Block", placeholder: "e.g. chargeback / abuse" }) || ""; if (!reason) return; }
  setLoading(trigger, true, next ? "Blocking…" : "Unblocking…");
  try { await api("POST", sitePath(`/api/credits/viewers/${encodeURIComponent(id)}/block`), { blocked: next, reason }); await load(); }
  catch (err) { setStatus("cr-viewer-status", err.message, true); } finally { setLoading(trigger, false); }
}
function wireDynamicActions() {
  document.querySelectorAll("[data-edit-reward]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => editReward(b.dataset.editReward)); });
  document.querySelectorAll("[data-del-reward]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => delReward(b.dataset.delReward, b)); });
  document.querySelectorAll("[data-edit-shop]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => openShop(state.shopItems.find((i) => i.id === b.dataset.editShop), b)); });
  document.querySelectorAll("[data-del-shop]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => delShop(b.dataset.delShop, b)); });
  document.querySelectorAll("[data-fulfill]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => updateRedemption(b.dataset.fulfill, "fulfilled", b)); });
  document.querySelectorAll("[data-cancel]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => updateRedemption(b.dataset.cancel, "cancelled", b)); });
  document.querySelectorAll("[data-block]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("click", () => toggleBlock(b.dataset.block, b.dataset.blocked === "1", b)); });
  document.querySelectorAll("[data-toggle-shop]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("change", () => toggleShop(b.dataset.toggleShop, b)); });
  document.querySelectorAll("[data-toggle-reward]:not([data-wired])").forEach((b) => { b.dataset.wired = "1"; b.addEventListener("change", () => toggleReward(b.dataset.toggleReward, b)); });
}
function ensureShopControls(hasItems = false) {
  const root = $("cr-shop-list"); if (!root || $("cr-shop-controls")) return;
  const controls = document.createElement("div"); controls.id = "cr-shop-controls"; controls.className = "list-controls";
  controls.hidden = !hasItems;
  controls.innerHTML = '<div class="list-controls-row"><input class="list-search" type="search" placeholder="Search items…" aria-label="Search items" /><select class="list-sort" aria-label="Sort items"><option value="cost">Cost</option><option value="stock">Stock</option><option value="active">Active first</option></select></div><div class="list-pagination"><button class="btn btn--sm" type="button" data-shop-prev>Previous</button><span data-shop-page></span><button class="btn btn--sm" type="button" data-shop-next>Next</button></div>';
  root.parentElement.insertBefore(controls, root);
  controls.querySelector(".list-search").addEventListener("input", (e) => { shopSearch = e.target.value.toLowerCase(); renderShopCards(shopItemsView); });
  controls.querySelector(".list-sort").addEventListener("change", (e) => { shopSort = e.target.value; renderShopCards(shopItemsView); });
  controls.querySelector("[data-shop-prev]").addEventListener("click", () => { shopPage = Math.max(1, shopPage - 1); renderShopCards(shopItemsView); });
  controls.querySelector("[data-shop-next]").addEventListener("click", () => { shopPage++; renderShopCards(shopItemsView); });
}
let shopPage = 1;
function mountListControls(root, toolbar, foot) {
  const controls = root?.querySelector(":scope > .list-controls");
  if (!controls) return;
  controls._mountedTargets = [toolbar, foot].filter(Boolean);
  toolbar?.appendChild(controls.querySelector(".list-controls-row"));
  foot?.appendChild(controls.querySelector(".list-pagination"));
  controls._mountedTargets.forEach((target) => { target.hidden = controls.hidden; });
  controls.remove();
}
let drawerTrigger;
function openShop(item, trigger) {
  drawerTrigger = trigger || $("cr-shop-new");
  $("cr-shop")?.classList.add("has-drawer");
  $("cr-shop-drawer").hidden = false; $("cr-shop-drawer-title").textContent = item ? "Edit item" : "Create item"; $("cr-shop-item-id").value = item?.id || ""; $("cr-shop-name").value = item?.name || ""; $("cr-shop-desc").value = item?.description || ""; $("cr-shop-cost").value = item?.cost || 100; $("cr-shop-stock").value = item?.stock === null ? "" : (item?.stock ?? ""); $("cr-shop-active").checked = item?.active !== false; $("cr-shop-name").focus();
}
function closeShop() { $("cr-shop-drawer").hidden = true; $("cr-shop")?.classList.remove("has-drawer"); drawerTrigger?.focus(); }
let activePopover;
function closePopover(result = false) {
  if (!activePopover) return;
  const { el, resolve, trigger } = activePopover; el.remove(); activePopover = null; trigger?.focus(); resolve(result);
}
function confirmPopover(trigger, title, body) {
  closePopover();
  return new Promise((resolve) => {
    const el = document.createElement("div"); el.className = "cr-confirm-popover"; el.setAttribute("role", "dialog");
    el.innerHTML = `<strong>${esc(title)}</strong><p>${esc(body)}</p><div><button type="button" data-pop-no>No</button><button type="button" class="btn--accent" data-pop-yes>Confirm</button></div>`;
    document.body.appendChild(el); activePopover = { el, resolve, trigger };
    const rect = trigger.getBoundingClientRect(); const width = 260; let left = Math.min(Math.max(8, rect.left), innerWidth - width - 8); let top = rect.bottom + 8;
    if (top + el.offsetHeight > innerHeight - 8) top = Math.max(8, rect.top - el.offsetHeight - 8);
    el.style.left = `${left}px`; el.style.top = `${top}px`; el.querySelector("[data-pop-no]").focus();
    el.querySelector("[data-pop-no]").addEventListener("click", () => closePopover(false)); el.querySelector("[data-pop-yes]").addEventListener("click", () => closePopover(true));
    setTimeout(() => document.addEventListener("click", outsidePopover, { capture: true }), 0);
    function outsidePopover(e) { if (!activePopover || el.contains(e.target) || e.target === trigger) return; document.removeEventListener("click", outsidePopover, { capture: true }); closePopover(false); }
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); document.removeEventListener("click", outsidePopover, { capture: true }); closePopover(false); } });
  });
}
async function updateRedemption(id, status, trigger) {
  const body = status === "cancelled" ? "This restores the viewer’s credits and returns one item to stock." : "This marks the item as fulfilled.";
  if (!await confirmPopover(trigger, status === "cancelled" ? "Cancel redemption" : "Fulfil redemption", body)) return;
  setLoading(trigger, true, "Saving…");
  try { await api("POST", sitePath(`/api/credits/redemptions/${encodeURIComponent(id)}`), { status }); await load(); }
  catch (err) { setStatus("cr-redemption-status", err.message, true); } finally { setLoading(trigger, false); }
}
async function toggleShop(id, trigger) {
  const item = state.shopItems.find((i) => i.id === id); if (!item) return;
  setLoading(trigger, true, "Saving…");
  try { await api("POST", sitePath("/api/credits/shop"), { ...item, active: trigger.checked }); await load(); }
  catch (err) { trigger.checked = item.active; setStatus("cr-shop-status", err.message, true); } finally { setLoading(trigger, false); }
}
async function toggleReward(id, trigger) {
  const m = state.mappings.find((x) => x.id === id); if (!m) return;
  setLoading(trigger, true, "Saving…");
  try {
    if (trigger.checked) await api("POST", sitePath("/api/credits/rewards"), { id: m.id, kickRewardId: m.kick_reward_id, kickRewardTitle: m.kick_reward_title, kickRewardCost: m.kick_reward_cost, credits: m.credits });
    else if (await confirmPopover(trigger, "Disable credit rule", "This disables the credit rule; credit activity is retained.")) await api("DELETE", sitePath(`/api/credits/rewards/${m.id}`));
    else { trigger.checked = true; return; }
    await load();
  } catch (err) { trigger.checked = m.active; setStatus("cr-reward-status", err.message, true); } finally { setLoading(trigger, false); }
}
async function load() {
  clearLoadError($("cr-empty"), false);
  setState({ CREDITS_STATUS: "loading" });
  setMetricLoading($("cr-pending-counter"));
  setMetricLoading($("cr-fulfilled-counter"));
  rewardCtrl?.setLoading(true);
  viewerCtrl?.setLoading(true);
  redemptionCtrl?.setLoading(true);
  setGlobalLoading(true);
  try {
    await loadBoardShell();
    state = await api("GET", sitePath("/api/credits/status"));
    setState({ CREDITS_STATUS: "ready" });
    render();
    if (tab() === "history") await loadActivity({ reset: true });
    if (tab() === "viewers" && $("cr-analytics")) await loadAnalytics();
    preserveSiteContextLinks();
    $("cr-app").hidden = false; $("cr-empty").hidden = true;
  } catch (err) {
    setState({ CREDITS_STATUS: "error" });
    logError("load-credits-dashboard", err);
    showLoadError($("cr-empty"), "your credits dashboard", load);
    $("cr-app").hidden = false;
    throw err;
  } finally { setGlobalLoading(false); }
}
function wireActions() {
  if (wired) return;
  wired = true;
  wireAutosave("cr-channel-form", "channel"); wireAutosave("cr-reward-form", "reward"); wireAutosave("cr-reward-create-form", "reward-create"); wireAutosave("cr-shop-form", "shop"); wireAutosave("cr-viewer-auth-form", "viewer-auth"); wireAutosave("cr-history-form", "history");
  $("cr-channel-form")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = e.submitter || $("cr-channel-submit"); setLoading(btn, true, "Saving…");
    try { const data = await api("POST", sitePath("/api/credits/connect"), { externalId: $("cr-channel-id-input").value.trim(), name: $("cr-channel-name-input").value.trim() }); state.channel = data.channel; setStatus("cr-channel-status", "Channel saved."); render(); }
    catch (err) { setStatus("cr-channel-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-channel-disconnect")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget; setLoading(btn, true, "Disconnecting…");
    try { await api("POST", "/api/kick/disconnect"); state.channel = { externalId: null, name: null }; render(); setStatus("cr-channel-status", "Disconnected."); }
    catch (err) { setStatus("cr-channel-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-reward-form")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = e.submitter || $("cr-reward-submit"); setLoading(btn, true, "Saving…");
    try { await api("POST", sitePath("/api/credits/rewards"), { id: $("cr-reward-id").value || undefined, kickRewardId: $("cr-reward-kick-id").value.trim(), kickRewardTitle: $("cr-reward-title").value.trim(), kickRewardCost: Number($("cr-reward-cost").value), credits: Number($("cr-reward-credits").value) }); setStatus("cr-reward-status", "Credit rule saved."); $("cr-reward-form").reset(); $("cr-reward-id").value = ""; await load(); }
    catch (err) { setStatus("cr-reward-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-reward-create-form")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = e.submitter || $("cr-reward-create-submit"); setLoading(btn, true, "Creating…");
    try { await api("POST", sitePath("/api/credits/rewards/create"), { title: $("cr-reward-create-title").value.trim(), cost: Number($("cr-reward-create-cost").value), credits: Number($("cr-reward-create-credits").value), description: $("cr-reward-create-desc").value.trim(), backgroundColor: $("cr-reward-create-color").value }); setStatus("cr-reward-create-status", "Kick reward created and mapped to a credit rule."); $("cr-reward-create-form").reset(); $("cr-reward-create-color").value = "#00e701"; await load(); }
    catch (err) { setStatus("cr-reward-create-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-shop-new")?.addEventListener("click", () => openShop()); document.querySelector("[data-cr-shop-create]")?.addEventListener("click", () => openShop()); $("cr-shop-close")?.addEventListener("click", closeShop); $("cr-shop-cancel")?.addEventListener("click", closeShop);
  $("cr-shop-form")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = e.submitter || $("cr-shop-submit"); setLoading(btn, true, "Saving…");
    try { await api("POST", sitePath("/api/credits/shop"), { id: $("cr-shop-item-id").value || undefined, name: $("cr-shop-name").value.trim(), description: $("cr-shop-desc").value.trim(), cost: Number($("cr-shop-cost").value), stock: $("cr-shop-stock").value === "" ? null : Number($("cr-shop-stock").value), active: $("cr-shop-active").checked }); setStatus("cr-shop-status", "Shop item saved."); closeShop(); await load(); }
    catch (err) { setStatus("cr-shop-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-viewer-auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = e.submitter || $("cr-viewer-auth-submit"); setLoading(btn, true, "Saving…");
    try { state.viewerAuth = await api("POST", "/api/credits/viewer-auth", { kick: $("cr-viewer-auth-kick").checked, discord: $("cr-viewer-auth-discord").checked, public: $("cr-viewer-auth-public").checked }); setStatus("cr-viewer-auth-status", "Viewer login settings saved."); }
    catch (err) { setStatus("cr-viewer-auth-status", err.message, true); } finally { setLoading(btn, false); }
  });
  $("cr-history-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    loadActivity({ reset: true }).catch((err) => setStatus("cr-history-status", err.message, true));
  });
  $("cr-history-load-more")?.addEventListener("click", () => loadActivity({ reset: false }).catch((err) => setStatus("cr-history-status", err.message, true)));
  $("cr-analytics-days")?.addEventListener("change", loadAnalytics);
  $("cr-onboarding-hide")?.addEventListener("click", () => { try { localStorage.setItem("cr-onboarding-hide", "1"); } catch { void 0; } $("cr-onboarding").hidden = true; });
}
async function loadViewerSummary(username) {
  const summary = $("cr-history-summary");
  if (!username) {
    if (summary) summary.hidden = true;
    return;
  }
  const data = await api("GET", `/api/credits/viewer/history?kickUsername=${encodeURIComponent(username)}`);
  renderHistory(data);
  if (summary) summary.hidden = false;
}

async function loadActivity({ reset }) {
  if (activityLoading) return;
  if (!activeSiteId) {
    const list = $("cr-history-feed-list");
    const empty = $("cr-history-feed-empty");
    const more = $("cr-history-load-more");
    if (list) list.innerHTML = "";
    if (empty) {
      empty.innerHTML = emptyStateHtml({ icon: "archive", title: "No board selected", body: "Select a board to view its credit activity." });
      empty.hidden = false;
    }
    if (more) more.hidden = true;
    return;
  }
  activityLoading = true;
  const btn = $("cr-history-search");
  const more = $("cr-history-load-more");
  try {
    if (reset) {
      activityEvents = [];
      activityCursor = null;
      setRowsLoading($("cr-history-feed-list"), { cols: 5, rows: 3 });
      $("cr-history-feed-empty").hidden = true;
      setLoading(btn, true, "Loading…");
      await loadViewerSummary($("cr-history-username")?.value.trim());
    } else {
      setLoading(more, true, "Loading…");
    }
    const params = new URLSearchParams({ siteId: activeSiteId });
    const username = $("cr-history-username")?.value.trim();
    const type = $("cr-history-type")?.value || "";
    if (username) params.set("kickUsername", username);
    if (type) params.set("type", type);
    if (activityCursor) params.set("cursor", activityCursor);
    const data = await api("GET", `/api/credits/activity?${params}`);
    activityEvents = reset ? data.events || [] : activityEvents.concat(data.events || []);
    activityCursor = data.nextCursor || null;
    renderActivity();
    setStatus("cr-history-status", `${activityEvents.length} event(s) loaded.`);
  } finally {
    activityLoading = false;
    setLoading(btn, false);
    setLoading(more, false);
  }
}

function renderActivity() {
  const list = $("cr-history-feed-list");
  const empty = $("cr-history-feed-empty");
  const more = $("cr-history-load-more");
  if (!list) return;
  if (!activityEvents.length) {
    list.innerHTML = "";
    if (empty) {
      empty.innerHTML = emptyStateHtml({ icon: "chart", title: "No credit activity found", body: "Try another viewer or event type." });
      empty.hidden = false;
    }
  } else {
    if (empty) empty.hidden = true;
    list.innerHTML = activityEvents.map((event) => {
      const debit = event.direction === "debit";
      const amount = `${debit ? "−" : "+"}${event.amount}`;
      return `<tr><td title="${esc(fmtDate(event.createdAt))}">${esc(relative(event.createdAt))}</td><td>${esc(event.kickUsername || event.kickUserId || "Unknown viewer")}</td><td>${esc(LEDGER_EVENT_LABELS[event.type] || event.type)}</td><td class="num ${debit ? "cr-negative" : "cr-positive"}">${amount}</td><td>${esc(event.description || "—")}</td></tr>`;
    }).join("");
  }
  if (more) more.hidden = !activityCursor;
}
function renderHistory(data) {
  const boards = data.boards || [];
  const list = $("cr-history-list");
  const empty = $("cr-history-empty");
  if (!list) return;
  list.innerHTML = boards.map((b) => `<tr><td><b>${esc(b.name || b.slug)}</b><br><span class="hint">${esc(b.slug)}</span></td><td class="num">${b.balance}</td><td class="num">${b.totalEarned}</td><td class="num">${b.totalSpent}</td><td class="num">${b.redemptionsPending}</td><td class="num">${b.redemptionsTotal}</td><td class="ta-r"><a class="btn btn--sm" href="/dashboard/settings/integrations?siteId=${esc(b.siteId)}">Integrations</a></td></tr>`).join("");
  if (empty) {
    empty.innerHTML = boards.length ? "" : emptyStateHtml({ icon: "users", title: "No boards found", body: "This viewer has no activity on your boards." });
    empty.hidden = boards.length > 0;
  }
}
if ($("cr-app")) { wireShell(); wireActions(); load().catch(() => {}); }
