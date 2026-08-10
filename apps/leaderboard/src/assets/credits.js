// Credits & shop dashboard client.
import { showConfirmModal, showPromptModal, ListController } from "./dashboard/utils.js";
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString() : "—"; }
function usageCls(used, limit) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  if (limit > 0 && used >= limit) return "cr-usage-over";
  if (limit > 0 && pct >= 80) return "cr-usage-near";
  return "";
}
function usageLabel(used, limit, name) {
  const cls = usageCls(used, limit);
  return `<span class="cr-usage-text${cls ? " " + cls : ""}">${used} / ${limit} ${name}</span>`;
}
function usageCard(used, limit, name) {
  const cls = usageCls(used, limit);
  const link = cls ? `<a href="/account#plan" class="cr-usage-upgrade">Upgrade plan</a>` : "";
  return `<div class="cr-usage-card"><div class="hint">${esc(name)}</div><div class="cr-usage-number${cls ? " " + cls : ""}">${used} / ${limit}</div>${link}</div>`;
}
function csrf() {
  const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : "";
}
async function api(method, path, body) {
  const opts = { method, credentials: "same-origin", headers: { "x-csrf-token": csrf() } };
  if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("Session expired"); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let state = {};
let viewerCtrl, redemptionCtrl, rewardCtrl, shopCtrl, historyCtrl;

async function load() {
  setGlobalLoading(true);
  try {
    const data = await api("GET", "/api/credits/status");
    state = data;
    render();
    await loadAnalytics();
    $("cr-app").hidden = false;
    $("cr-empty").hidden = true;
  } catch (err) {
    $("cr-empty").innerHTML = `<p class="error">Could not load credits dashboard: ${esc(err.message)}</p>`;
    $("cr-empty").hidden = false;
    $("cr-app").hidden = true;
    throw err;
  } finally {
    setGlobalLoading(false);
  }
}

export async function initKickrewards() {
  return load();
}

function rewardRow(m) {
  return `<td><b>${esc(m.kick_reward_title)}</b><br><span class="hint">${esc(m.kick_reward_id)}</span></td><td>${m.kick_reward_cost}</td><td>${m.credits}</td><td>${m.active ? "Yes" : "No"}</td><td class="ta-r"><button class="btn btn--sm" data-edit-reward="${esc(m.id)}">Edit</button> <button class="btn btn--sm btn--danger" data-del-reward="${esc(m.id)}">Disable</button></td>`;
}
function shopRow(i) {
  return `<td><b>${esc(i.name)}</b><br><span class="hint">${esc(i.description || "")}</span></td><td>${i.cost}</td><td>${i.stock === null ? "∞" : i.stock}</td><td>${i.active ? "Yes" : "No"}</td><td class="ta-r"><button class="btn btn--sm" data-edit-shop="${esc(i.id)}">Edit</button> <button class="btn btn--sm btn--danger" data-del-shop="${esc(i.id)}">Delete</button></td>`;
}
function viewerRow(v) {
  return `<td>${esc(v.kick_username || v.kick_user_id)}${v.blocked ? ' <span class="pill pill--bad">blocked</span>' : ''}${v.fraud_score ? ` <span class="pill pill--warn">risk ${v.fraud_score}</span>` : ''}${v.block_reason ? `<div class="hint">${esc(v.block_reason)}</div>` : ''}</td><td>${v.balance}</td><td>${v.total_earned}</td><td>${v.total_spent}</td><td>${fmtDate(v.last_earned_at || v.created_at)}</td><td class="ta-r"><button class="btn btn--sm ${v.blocked ? 'btn--accent' : 'btn--danger'}" data-block="${esc(v.id)}" data-blocked="${v.blocked ? '1' : ''}">${v.blocked ? 'Unblock' : 'Block'}</button></td>`;
}
function redemptionRow(r) {
  return `<td>${esc(r.kick_username || r.kick_user_id)}</td><td>${esc(r.item_name)}</td><td>${r.cost}</td><td><span class="pill pill--${r.status === "pending" ? "muted" : r.status === "fulfilled" ? "good" : "bad"}">${r.status}</span></td><td>${fmtDate(r.created_at)}</td><td class="ta-r">${r.status === "pending" ? `<button class="btn btn--sm btn--accent" data-fulfill="${esc(r.id)}">Fulfill</button> <button class="btn btn--sm btn--danger" data-cancel="${esc(r.id)}">Cancel</button>` : ""}</td>`;
}
function historyRow(b) {
  return `<td><b>${esc(b.name || b.slug)}</b><br><span class="hint">${esc(b.slug)}</span></td><td>${b.balance}</td><td>${b.totalEarned}</td><td>${b.totalSpent}</td><td>${b.redemptionsPending}</td><td>${b.redemptionsTotal}</td><td class="ta-r"><a class="btn btn--sm" href="/dashboard/credits?siteId=${esc(b.siteId)}" target="_blank" rel="noopener">Board</a></td>`;
}
function wireRewardActions() {
  document.querySelectorAll("[data-edit-reward]").forEach((b) => b.addEventListener("click", () => editReward(b.dataset.editReward)));
  document.querySelectorAll("[data-del-reward]").forEach((b) => b.addEventListener("click", () => delReward(b.dataset.delReward)));
  document.querySelectorAll("[data-edit-shop]").forEach((b) => b.addEventListener("click", () => editShop(b.dataset.editShop)));
  document.querySelectorAll("[data-del-shop]").forEach((b) => b.addEventListener("click", () => delShop(b.dataset.delShop)));
}
function wireViewerActions() {
  document.querySelectorAll("[data-block]").forEach((b) => b.addEventListener("click", () => toggleBlock(b.dataset.block, b.dataset.blocked)));
}
function wireRedemptionActions() {
  document.querySelectorAll("[data-fulfill]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.fulfill, "fulfilled")));
  document.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.cancel, "cancelled")));
}

function render() {
  const connected = Boolean(state.channel?.externalId);
  $("cr-channel-connected").hidden = !connected;
  $("cr-channel-connect-wrap").hidden = connected;
  $("cr-channel-id").textContent = state.channel?.externalId || "";
  $("cr-channel-name").textContent = state.channel?.name || "";
  $("cr-channel-id-input").value = state.channel?.externalId || "";
  $("cr-channel-name-input").value = state.channel?.name || "";
  const linked = state.channel?.linkedAt ? fmtDate(state.channel.linkedAt) : "—";
  const linkedEl = $("cr-channel-linked");
  if (linkedEl) linkedEl.textContent = `· linked ${linked}`;

  const usage = state.usage || {};
  const limits = state.limits || {};

  $("cr-reward-usage").innerHTML = usageLabel(
    usage.rewardMappings || 0,
    limits.rewardMappings || 0,
    "reward mappings"
  );
  $("cr-shop-usage").innerHTML = usageLabel(
    usage.shopItems || 0,
    limits.shopItems || 0,
    "shop items"
  );

  const rewardAtLimit = (usage.rewardMappings || 0) >= (limits.rewardMappings || 0);
  const shopAtLimit = (usage.shopItems || 0) >= (limits.shopItems || 0);
  const rewardSubmit = $("cr-reward-submit");
  const rewardCreateSubmit = $("cr-reward-create-submit");
  const shopSubmit = $("cr-shop-submit");
  if (rewardSubmit) {
    rewardSubmit.disabled = rewardAtLimit;
    rewardSubmit.title = rewardAtLimit ? "Upgrade your plan to add more reward mappings" : "";
  }
  if (rewardCreateSubmit) {
    rewardCreateSubmit.disabled = rewardAtLimit;
    rewardCreateSubmit.title = rewardAtLimit ? "Upgrade your plan to add more reward mappings" : "";
  }
  if (shopSubmit) {
    shopSubmit.disabled = shopAtLimit;
    shopSubmit.title = shopAtLimit ? "Upgrade your plan to add more shop items" : "";
  }

  $("cr-usage").innerHTML = [
    usageCard(usage.rewardMappings || 0, limits.rewardMappings || 0, "reward mappings"),
    usageCard(usage.shopItems || 0, limits.shopItems || 0, "shop items"),
    usageCard(usage.pendingRedemptions || 0, limits.pendingRedemptions || 0, "pending redemptions"),
    usageCard(usage.redemptionsPer30Days || 0, limits.redemptionsPer30Days || 0, "redemptions / 30 days"),
    usageCard(usage.newViewersPer30Days || 0, limits.newViewersPer30Days || 0, "new viewers / 30 days"),
  ].join("");

  const va = state.viewerAuth || {};
  $("cr-viewer-auth-kick").checked = va.kick !== false;
  $("cr-viewer-auth-discord").checked = va.discord !== false;
  $("cr-viewer-auth-public").checked = va.public !== false;

  const mappings = state.mappings || [];
  const shopItems = state.shopItems || [];
  const viewers = state.viewers || [];
  const redemptions = state.redemptions || [];

  if (!rewardCtrl && $("cr-maps")) {
    rewardCtrl = new ListController({
      root: $("cr-maps"), tbody: "cr-reward-list", items: mappings, perPage: 10,
      searchFn: (m) => `${m.kick_reward_title} ${m.kick_reward_id} ${m.kick_reward_cost} ${m.credits}`,
      sortOptions: [
        { key: "cost", label: "Kick cost", fn: (a, b) => (b.kick_reward_cost || 0) - (a.kick_reward_cost || 0) },
        { key: "credits", label: "Credits", fn: (a, b) => (b.credits || 0) - (a.credits || 0) },
        { key: "active", label: "Active first", fn: (a, b) => Number(b.active) - Number(a.active) },
      ],
      emptyAllText: "No reward mappings yet.", emptyText: "No matching reward mappings.",
      renderItem: rewardRow, onRender: wireRewardActions,
    });
  } else if (rewardCtrl) { rewardCtrl.setItems(mappings); }

  if (!shopCtrl && $("cr-shop")) {
    shopCtrl = new ListController({
      root: $("cr-shop"), tbody: "cr-shop-list", items: shopItems, perPage: 10,
      searchFn: (i) => `${i.name} ${i.description || ""} ${i.cost} ${i.stock === null ? "" : i.stock}`,
      sortOptions: [
        { key: "cost", label: "Cost", fn: (a, b) => (b.cost || 0) - (a.cost || 0) },
        { key: "stock", label: "Stock", fn: (a, b) => ((b.stock ?? Infinity) - (a.stock ?? Infinity)) },
        { key: "active", label: "Active first", fn: (a, b) => Number(b.active) - Number(a.active) },
      ],
      emptyAllText: "No shop items yet.", emptyText: "No matching shop items.",
      renderItem: shopRow, onRender: wireRewardActions,
    });
  } else if (shopCtrl) { shopCtrl.setItems(shopItems); }

  if (!viewerCtrl && $("cr-viewers")) {
    viewerCtrl = new ListController({
      root: $("cr-viewers"), tbody: "cr-viewer-list", items: viewers, perPage: 15,
      searchFn: (v) => `${v.kick_username || v.kick_user_id} ${v.block_reason || ""} ${v.blocked ? "blocked" : ""}`,
      sortOptions: [
        { key: "balance", label: "Balance", fn: (a, b) => (b.balance || 0) - (a.balance || 0) },
        { key: "earned", label: "Earned", fn: (a, b) => (b.total_earned || 0) - (a.total_earned || 0) },
        { key: "spent", label: "Spent", fn: (a, b) => (b.total_spent || 0) - (a.total_spent || 0) },
        { key: "last", label: "Last earned", fn: (a, b) => new Date(b.last_earned_at || b.created_at || 0) - new Date(a.last_earned_at || a.created_at || 0) },
      ],
      emptyAllText: "No viewers yet.", emptyText: "No matching viewers.",
      renderItem: viewerRow, onRender: wireViewerActions,
    });
  } else if (viewerCtrl) { viewerCtrl.setItems(viewers); }
  $("cr-viewer-empty").hidden = true;

  if (!redemptionCtrl && $("cr-redemptions")) {
    redemptionCtrl = new ListController({
      root: $("cr-redemptions"), tbody: "cr-redemption-list", items: redemptions, perPage: 15,
      searchFn: (r) => `${r.kick_username || r.kick_user_id} ${r.item_name} ${r.status}`,
      sortOptions: [
        { key: "time", label: "Newest", fn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
        { key: "cost", label: "Cost", fn: (a, b) => (b.cost || 0) - (a.cost || 0) },
        { key: "status", label: "Status", fn: (a, b) => (a.status || "").localeCompare(b.status || "") },
      ],
      emptyAllText: "No redemptions yet.", emptyText: "No matching redemptions.",
      renderItem: redemptionRow, onRender: wireRedemptionActions,
    });
  } else if (redemptionCtrl) { redemptionCtrl.setItems(redemptions); }
  $("cr-redemption-empty").hidden = true;

  renderOnboarding();
}

function renderOnboarding() {
  const wrap = $("cr-onboarding");
  if (!wrap) return;
  const hidden = localStorage.getItem("cr-onboarding-hide") === "1";
  const connected = Boolean(state.channel?.externalId);
  const mappings = (state.mappings || []).filter((m) => m.active).length;
  const items = (state.shopItems || []).filter((i) => i.active).length;
  const redemptions = (state.redemptions || []).length;

  const steps = [
    { id: 1, done: connected },
    { id: 2, done: mappings > 0 },
    { id: 3, done: items > 0 },
    { id: 4, done: redemptions > 0 },
    { id: 5, done: connected && mappings > 0 && items > 0 },
  ];

  let current = 1;
  for (const s of steps) {
    const el = $(`cr-step-${s.id}`);
    if (!el) continue;
    el.classList.toggle("done", s.done);
    el.classList.toggle("current", current === s.id && !s.done);
    if (!s.done) current = s.id;
  }

  const ready = steps[4].done;
  wrap.hidden = hidden && ready;
  $("cr-onboarding-hide").hidden = !ready;
}

async function toggleBlock(id, isBlocked) {
  const blocking = !isBlocked;
  let reason = "";
  if (blocking) {
    reason = await showPromptModal("Block viewer", "Why are you blocking this viewer?", { confirmText: "Block", placeholder: "e.g. chargeback / abuse" }) || "";
    if (!reason) return;
  }
  await api("POST", `/api/credits/viewers/${encodeURIComponent(id)}/block`, { blocked: blocking, reason });
  await load();
}

function setStatus(id, msg, err) {
  const el = $(id);
  el.textContent = msg;
  el.className = err ? "status error" : "status";
  if (!err) setTimeout(() => { el.textContent = ""; }, 3000);
}

function setLoading(idOrEl, loading, text = "Loading…") {
  const el = typeof idOrEl === "string" ? $(idOrEl) : idOrEl;
  if (!el) return;
  if (loading) {
    el.dataset.origText = el.textContent;
    el.disabled = true;
    el.setAttribute("aria-busy", "true");
    el.classList.add("btn--loading");
    el.textContent = text;
  } else {
    el.disabled = false;
    el.removeAttribute("aria-busy");
    el.classList.remove("btn--loading");
    el.textContent = el.dataset.origText || el.textContent;
    delete el.dataset.origText;
  }
}

function setGlobalLoading(loading) {
  const el = $("cr-loading");
  if (el) el.hidden = !loading;
}

function draftKey(id) { return "yr:credits:draft:" + id; }

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function saveFormDraft(formId, id) {
  const form = $(formId);
  if (!form) return;
  const data = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "checkbox") { if (el.checked) data[el.name] = true; }
    else if (el.type === "number") { if (el.value !== "") data[el.name] = el.value; }
    else if (el.value.trim()) { data[el.name] = el.value; }
  }
  if (Object.keys(data).length === 0) { localStorage.removeItem(draftKey(id)); return; }
  try { localStorage.setItem(draftKey(id), JSON.stringify(data)); } catch {}
}

function restoreFormDraft(formId, id) {
  const form = $(formId);
  if (!form) return;
  const raw = localStorage.getItem(draftKey(id));
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    for (const el of form.elements) {
      if (!el.name || data[el.name] === undefined) continue;
      if (el.type === "checkbox") el.checked = Boolean(data[el.name]);
      else el.value = data[el.name];
    }
    const status = form.querySelector(".status");
    if (status) {
      status.textContent = "Draft restored.";
      status.className = "status";
      setTimeout(() => { status.textContent = ""; }, 3000);
    }
  } catch {}
}

function clearFormDraft(id) {
  try { localStorage.removeItem(draftKey(id)); } catch {}
}

function wireAutosave(formId, id) {
  const form = $(formId);
  if (!form) return;
  const save = debounce(() => saveFormDraft(formId, id), 400);
  form.addEventListener("input", save);
  form.addEventListener("change", save);
  form.addEventListener("submit", () => clearFormDraft(id));
  restoreFormDraft(formId, id);
}

$("cr-channel-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setLoading(btn, true, "Saving…");
  try {
    const data = await api("POST", "/api/credits/connect", {
      externalId: $("cr-channel-id-input").value.trim(),
      name: $("cr-channel-name-input").value.trim(),
    });
    state.channel = data.channel;
    setStatus("cr-channel-status", "Channel saved.");
    render();
  } catch (err) { setStatus("cr-channel-status", err.message, true); }
  finally { setLoading(btn, false); }
});

$("cr-channel-disconnect")?.addEventListener("click", async () => {
  try {
    await api("POST", "/api/kick/disconnect");
    state.channel = { externalId: null, name: null };
    render();
    setStatus("cr-channel-status", "Disconnected.");
  } catch (err) { setStatus("cr-channel-status", err.message, true); }
});

$("cr-reward-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setLoading(btn, true, "Saving…");
  try {
    await api("POST", "/api/credits/rewards", {
      id: $("cr-reward-id").value || undefined,
      kickRewardId: $("cr-reward-kick-id").value.trim(),
      kickRewardTitle: $("cr-reward-title").value.trim(),
      kickRewardCost: Number($("cr-reward-cost").value),
      credits: Number($("cr-reward-credits").value),
    });
    setStatus("cr-reward-status", "Mapping saved.");
    $("cr-reward-form").reset();
    $("cr-reward-id").value = "";
    await load();
  } catch (err) { setStatus("cr-reward-status", err.message, true); }
  finally { setLoading(btn, false); }
});

$("cr-reward-create-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setLoading(btn, true, "Creating…");
  try {
    await api("POST", "/api/credits/rewards/create", {
      title: $("cr-reward-create-title").value.trim(),
      cost: Number($("cr-reward-create-cost").value),
      credits: Number($("cr-reward-create-credits").value),
      description: $("cr-reward-create-desc").value.trim(),
      backgroundColor: $("cr-reward-create-color").value,
    });
    setStatus("cr-reward-create-status", "Reward created in Kick and mapped.");
    $("cr-reward-create-form").reset();
    $("cr-reward-create-color").value = "#00e701";
    await load();
  } catch (err) { setStatus("cr-reward-create-status", err.message, true); }
  finally { setLoading(btn, false); }
});

function editReward(id) {
  const m = (state.mappings || []).find((x) => x.id === id);
  if (!m) return;
  $("cr-reward-id").value = m.id;
  $("cr-reward-kick-id").value = m.kick_reward_id;
  $("cr-reward-title").value = m.kick_reward_title;
  $("cr-reward-cost").value = m.kick_reward_cost;
  $("cr-reward-credits").value = m.credits;
}

async function delReward(id) {
  if (!await showConfirmModal("Disable reward", "Disable this reward mapping? Viewers can no longer earn credits from it.", "Disable", true)) return;
  await api("DELETE", `/api/credits/rewards/${encodeURIComponent(id)}`);
  await load();
}

$("cr-shop-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setLoading(btn, true, "Saving…");
  try {
    await api("POST", "/api/credits/shop", {
      id: $("cr-shop-item-id").value || undefined,
      name: $("cr-shop-name").value.trim(),
      description: $("cr-shop-desc").value.trim(),
      cost: Number($("cr-shop-cost").value),
      stock: $("cr-shop-stock").value === "" ? null : Number($("cr-shop-stock").value),
      active: $("cr-shop-active").checked,
    });
    setStatus("cr-shop-status", "Item saved.");
    $("cr-shop-form").reset();
    $("cr-shop-item-id").value = "";
    $("cr-shop-active").checked = true;
    await load();
  } catch (err) { setStatus("cr-shop-status", err.message, true); }
  finally { setLoading(btn, false); }
});

function editShop(id) {
  const i = (state.shopItems || []).find((x) => x.id === id);
  if (!i) return;
  $("cr-shop-item-id").value = i.id;
  $("cr-shop-name").value = i.name;
  $("cr-shop-desc").value = i.description || "";
  $("cr-shop-cost").value = i.cost;
  $("cr-shop-stock").value = i.stock === null ? "" : i.stock;
  $("cr-shop-active").checked = i.active;
}

async function delShop(id) {
  if (!await showConfirmModal("Disable shop item", "Disable this shop item? It will no longer be redeemable, but past redemptions stay in the ledger.", "Disable", true)) return;
  await api("DELETE", `/api/credits/shop/${encodeURIComponent(id)}`);
  await load();
}

async function updateRedemption(id, status) {
  await api("POST", `/api/credits/redemptions/${encodeURIComponent(id)}`, { status });
  await load();
}

async function loadAnalytics() {
  const days = Number($("cr-analytics-days").value) || 30;
  try {
    const data = await api("GET", `/api/credits/analytics?days=${days}`);
    state.analytics = data;
    renderAnalytics();
  } catch (err) {
    console.error("analytics load failed", err);
  }
}

function renderAnalytics() {
  const a = state.analytics;
  if (!a) return;
  const s = a.summary || {};
  const days = Number($("cr-analytics-days")?.value) || 30;
  $("cr-stat-earned").textContent = `${s.periodEarned || 0} (all time: ${s.allTimeEarned || 0})`;
  $("cr-stat-spent").textContent = `${s.periodSpent || 0} (all time: ${s.allTimeSpent || 0})`;
  $("cr-stat-redemptions").textContent = s.redemptionsTotal || 0;
  $("cr-stat-pending").textContent = s.redemptionsPending || 0;
  $("cr-stat-balance").textContent = s.viewerBalance || 0;
  const daysLabel = $("cr-analytics-days-label");
  if (daysLabel) daysLabel.textContent = String(days);

  const earners = a.topEarners || [];
  $("cr-top-earners-list").innerHTML = earners.map((v) => `
    <tr>
      <td>${esc(v.kick_username)}</td>
      <td>${v.balance}</td>
      <td>${v.total_earned}</td>
      <td>${v.total_spent}</td>
    </tr>
  `).join("");
  $("cr-top-earners-empty").hidden = earners.length > 0;

  const items = a.topItems || [];
  $("cr-top-items-list").innerHTML = items.map((i) => `
    <tr>
      <td>${esc(i.name)}</td>
      <td>${i.redemptions}</td>
      <td>${i.credits_spent}</td>
    </tr>
  `).join("");
  $("cr-top-items-empty").hidden = items.length > 0;

  renderCreditsByDay(a.creditsByDay || []);
}

function renderCreditsByDay(rows) {
  const container = $("cr-credits-by-day");
  if (!rows.length) {
    container.innerHTML = "";
    $("cr-credits-by-day-empty").hidden = false;
    return;
  }
  $("cr-credits-by-day-empty").hidden = true;

  const grouped = {};
  for (const r of rows) {
    grouped[r.day] = grouped[r.day] || { earn: 0, spend: 0 };
    grouped[r.day][r.type] = r.total;
  }
  const days = Object.keys(grouped).sort();
  const max = Math.max(1, ...days.map((d) => grouped[d].earn + grouped[d].spend));

  container.innerHTML = days.map((d) => {
    const g = grouped[d];
    const total = g.earn + g.spend;
    const earnPct = max > 0 ? (g.earn / max) * 100 : 0;
    const spendPct = max > 0 ? (g.spend / max) * 100 : 0;
    const label = new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `<div class="cr-bar-col" title="${label}: ${total} (${g.earn} earned, ${g.spend} spent)">
      <div class="cr-bar-col-inner">
        <div class="cr-bar-earn" data-height="${earnPct}"></div>
        <div class="cr-bar-spend" data-height="${spendPct}"></div>
      </div>
    </div>`;
  }).join("");
  container.querySelectorAll("[data-height]").forEach((el) => { el.style.height = el.dataset.height + "%"; });
  container.setAttribute("role", "img");
  const allTotal = days.reduce((a, d) => a + grouped[d].earn + grouped[d].spend, 0);
  container.setAttribute("aria-label", `Bar chart of credits by day for the last ${days.length} days. Total: ${allTotal} credits.`);
}

$("cr-analytics-days")?.addEventListener("change", loadAnalytics);

$("cr-viewer-auth-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  setLoading(btn, true, "Saving…");
  try {
    const data = await api("POST", "/api/credits/viewer-auth", {
      kick: $("cr-viewer-auth-kick").checked,
      discord: $("cr-viewer-auth-discord").checked,
      public: $("cr-viewer-auth-public").checked,
    });
    state.viewerAuth = data;
    setStatus("cr-viewer-auth-status", "Viewer login settings saved.");
  } catch (err) { setStatus("cr-viewer-auth-status", err.message, true); }
  finally { setLoading(btn, false); }
});

async function searchHistory(e) {
  e.preventDefault();
  const username = $("cr-history-username").value.trim();
  if (!username) return setStatus("cr-history-status", "Enter a Kick username", true);
  setLoading("cr-history-search", true, "Searching…");
  try {
    const data = await api("GET", `/api/credits/viewer/history?kickUsername=${encodeURIComponent(username)}`);
    renderHistory(data);
    setStatus("cr-history-status", `Found ${data.boards?.length || 0} board(s).`);
  } catch (err) { setStatus("cr-history-status", err.message, true); }
  finally { setLoading("cr-history-search", false); }
}

function renderHistory(data) {
  const boards = data.boards || [];
  if (!historyCtrl && $("cr-history")) {
    historyCtrl = new ListController({
      root: $("cr-history"), tbody: "cr-history-list", items: boards, perPage: 10,
      searchFn: (b) => `${b.name || ""} ${b.slug || ""} ${b.balance} ${b.totalEarned} ${b.totalSpent}`,
      sortOptions: [
        { key: "balance", label: "Balance", fn: (a, b) => (b.balance || 0) - (a.balance || 0) },
        { key: "earned", label: "Earned", fn: (a, b) => (b.totalEarned || 0) - (a.totalEarned || 0) },
        { key: "pending", label: "Pending", fn: (a, b) => (b.redemptionsPending || 0) - (a.redemptionsPending || 0) },
      ],
      emptyAllText: "No boards found for this viewer.", emptyText: "No matching boards.",
      renderItem: historyRow,
    });
  } else if (historyCtrl) { historyCtrl.setItems(boards); }
  $("cr-history-empty").hidden = true;
}

$("cr-history-form")?.addEventListener("submit", searchHistory);

$("cr-onboarding-hide")?.addEventListener("click", () => {
  localStorage.setItem("cr-onboarding-hide", "1");
  const wrap = $("cr-onboarding");
  if (wrap) wrap.hidden = true;
});

wireAutosave("cr-channel-form", "channel");
wireAutosave("cr-reward-form", "reward");
wireAutosave("cr-reward-create-form", "reward-create");
wireAutosave("cr-shop-form", "shop");
wireAutosave("cr-viewer-auth-form", "viewer-auth");
wireAutosave("cr-history-form", "history");

// Auto-init only when the standalone credits markup is present. The dashboard SPA imports this module and calls initKickrewards() on demand.
if (document.getElementById("cr-standalone")) {
  initKickrewards().catch((err) => {
    $("cr-empty").innerHTML = `<p class="error">Could not load credits dashboard: ${esc(err.message)}</p>`;
    $("cr-empty").hidden = false;
    $("cr-app").hidden = true;
  });
}
