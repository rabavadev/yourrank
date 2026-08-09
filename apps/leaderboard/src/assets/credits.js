// Credits & shop dashboard client.
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString() : "—"; }
function usageLabel(used, limit, name) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const color = used >= limit ? "color:#ff6b6b" : pct >= 80 ? "color:#ffcc00" : "";
  return `<span style="${color}">${used} / ${limit} ${name}</span>`;
}
function usageCard(used, limit, name) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const color = used >= limit ? "color:#ff6b6b" : pct >= 80 ? "color:#ffcc00" : "";
  return `<div style="padding:10px;border:1px solid var(--line);border-radius:8px"><div class="hint">${esc(name)}</div><div style="font-weight:600;${color}">${used} / ${limit}</div></div>`;
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
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

let state = {};

async function load() {
  const data = await api("GET", "/api/credits/status");
  state = data;
  render();
  await loadAnalytics();
  $("cr-app").hidden = false;
  $("cr-empty").hidden = true;
}

function render() {
  const connected = Boolean(state.channel?.externalId);
  $("cr-channel-connected").hidden = !connected;
  $("cr-channel-connect-wrap").hidden = connected;
  $("cr-channel-id").textContent = state.channel?.externalId || "";
  $("cr-channel-name").textContent = state.channel?.name || "";
  $("cr-channel-id-input").value = state.channel?.externalId || "";
  $("cr-channel-name-input").value = state.channel?.name || "";

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

  $("cr-reward-list").innerHTML = (state.mappings || []).map((m) => `
    <tr>
      <td><b>${esc(m.kick_reward_title)}</b><br><span class="hint">${esc(m.kick_reward_id)}</span></td>
      <td>${m.kick_reward_cost}</td>
      <td>${m.credits}</td>
      <td>${m.active ? "Yes" : "No"}</td>
      <td class="ta-r">
        <button class="btn btn--sm" data-edit-reward="${esc(m.id)}">Edit</button>
        <button class="btn btn--sm btn--danger" data-del-reward="${esc(m.id)}">Disable</button>
      </td>
    </tr>
  `).join("");

  $("cr-shop-list").innerHTML = (state.shopItems || []).map((i) => `
    <tr>
      <td><b>${esc(i.name)}</b><br><span class="hint">${esc(i.description || "")}</span></td>
      <td>${i.cost}</td>
      <td>${i.stock === null ? "∞" : i.stock}</td>
      <td>${i.active ? "Yes" : "No"}</td>
      <td class="ta-r">
        <button class="btn btn--sm" data-edit-shop="${esc(i.id)}">Edit</button>
        <button class="btn btn--sm btn--danger" data-del-shop="${esc(i.id)}">Delete</button>
      </td>
    </tr>
  `).join("");

  const viewers = state.viewers || [];
  $("cr-viewer-list").innerHTML = viewers.map((v) => `
    <tr>
      <td>
        ${esc(v.kick_username || v.kick_user_id)}
        ${v.blocked ? '<span class="pill pill--bad">blocked</span>' : ''}
        ${v.fraud_score ? `<span class="pill pill--warn">risk ${v.fraud_score}</span>` : ''}
        ${v.block_reason ? `<div class="hint">${esc(v.block_reason)}</div>` : ''}
      </td>
      <td>${v.balance}</td>
      <td>${v.total_earned}</td>
      <td>${v.total_spent}</td>
      <td>${fmtDate(v.last_earned_at || v.created_at)}</td>
      <td class="ta-r">
        <button class="btn btn--sm ${v.blocked ? 'btn--accent' : 'btn--danger'}" data-block="${esc(v.id)}" data-blocked="${v.blocked ? '1' : ''}">
          ${v.blocked ? 'Unblock' : 'Block'}
        </button>
      </td>
    </tr>
  `).join("");
  $("cr-viewer-empty").hidden = viewers.length > 0;

  const redemptions = state.redemptions || [];
  $("cr-redemption-list").innerHTML = redemptions.map((r) => `
    <tr>
      <td>${esc(r.kick_username || r.kick_user_id)}</td>
      <td>${esc(r.item_name)}</td>
      <td>${r.cost}</td>
      <td><span class="pill pill--${r.status === "pending" ? "muted" : r.status === "fulfilled" ? "good" : "bad"}">${r.status}</span></td>
      <td>${fmtDate(r.created_at)}</td>
      <td class="ta-r">
        ${r.status === "pending" ? `
          <button class="btn btn--sm btn--accent" data-fulfill="${esc(r.id)}">Fulfill</button>
          <button class="btn btn--sm btn--danger" data-cancel="${esc(r.id)}">Cancel</button>
        ` : ""}
      </td>
    </tr>
  `).join("");
  $("cr-redemption-empty").hidden = redemptions.length > 0;

  // Wire action buttons
  document.querySelectorAll("[data-edit-reward]").forEach((b) => b.addEventListener("click", () => editReward(b.dataset.editReward)));
  document.querySelectorAll("[data-del-reward]").forEach((b) => b.addEventListener("click", () => delReward(b.dataset.delReward)));
  document.querySelectorAll("[data-edit-shop]").forEach((b) => b.addEventListener("click", () => editShop(b.dataset.editShop)));
  document.querySelectorAll("[data-del-shop]").forEach((b) => b.addEventListener("click", () => delShop(b.dataset.delShop)));
  document.querySelectorAll("[data-fulfill]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.fulfill, "fulfilled")));
  document.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.cancel, "cancelled")));
  document.querySelectorAll("[data-block]").forEach((b) => b.addEventListener("click", () => toggleBlock(b.dataset.block, b.dataset.blocked)));
}

async function toggleBlock(id, isBlocked) {
  const blocking = !isBlocked;
  let reason = "";
  if (blocking) {
    reason = window.prompt("Block reason:") || "";
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

$("cr-channel-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("POST", "/api/credits/connect", {
      externalId: $("cr-channel-id-input").value.trim(),
      name: $("cr-channel-name-input").value.trim(),
    });
    state.channel = data.channel;
    setStatus("cr-channel-status", "Channel saved.");
    render();
  } catch (err) { setStatus("cr-channel-status", err.message, true); }
});

$("cr-channel-disconnect")?.addEventListener("click", async () => {
  try {
    await api("POST", "/api/kick/disconnect");
    state.channel = { externalId: null, name: null };
    render();
    setStatus("cr-channel-status", "Disconnected.");
  } catch (err) { setStatus("cr-channel-status", err.message, true); }
});

$("cr-reward-form").addEventListener("submit", async (e) => {
  e.preventDefault();
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
});

$("cr-reward-create-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
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
  if (!confirm("Disable this reward mapping?")) return;
  await api("DELETE", `/api/credits/rewards/${encodeURIComponent(id)}`);
  await load();
}

$("cr-shop-form").addEventListener("submit", async (e) => {
  e.preventDefault();
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
  if (!confirm("Disable this shop item? It will no longer be redeemable, but past redemptions stay in the ledger.")) return;
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
  $("cr-stat-earned").textContent = `${s.periodEarned || 0} (all time: ${s.allTimeEarned || 0})`;
  $("cr-stat-spent").textContent = `${s.periodSpent || 0} (all time: ${s.allTimeSpent || 0})`;
  $("cr-stat-redemptions").textContent = s.redemptionsTotal || 0;
  $("cr-stat-pending").textContent = s.redemptionsPending || 0;
  $("cr-stat-balance").textContent = s.viewerBalance || 0;

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
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%" title="${label}: ${total} (${g.earn} earned, ${g.spend} spent)">
      <div style="width:100%;display:flex;align-items:flex-end;gap:1px;height:100%">
        <div style="flex:1;background:var(--accent,#2200ff);height:${earnPct}%"></div>
        <div style="flex:1;background:var(--ink-mute,#8b949e);height:${spendPct}%"></div>
      </div>
    </div>`;
  }).join("");
}

$("cr-analytics-days")?.addEventListener("change", loadAnalytics);

async function searchHistory(e) {
  e.preventDefault();
  const username = $("cr-history-username").value.trim();
  if (!username) return setStatus("cr-history-status", "Enter a Kick username", true);
  try {
    const data = await api("GET", `/api/credits/viewer/history?kickUsername=${encodeURIComponent(username)}`);
    renderHistory(data);
    setStatus("cr-history-status", `Found ${data.boards?.length || 0} board(s).`);
  } catch (err) { setStatus("cr-history-status", err.message, true); }
}

function renderHistory(data) {
  const boards = data.boards || [];
  $("cr-history-list").innerHTML = boards.map((b) => `
    <tr>
      <td><b>${esc(b.name || b.slug)}</b><br><span class="hint">${esc(b.slug)}</span></td>
      <td>${b.balance}</td>
      <td>${b.totalEarned}</td>
      <td>${b.totalSpent}</td>
      <td>${b.redemptionsPending}</td>
      <td>${b.redemptionsTotal}</td>
      <td class="ta-r">
        <a class="btn btn--sm" href="/dashboard/credits?siteId=${esc(b.siteId)}" target="_blank" rel="noopener">Board</a>
      </td>
    </tr>
  `).join("");
  $("cr-history-empty").hidden = boards.length > 0;
}

$("cr-history-form")?.addEventListener("submit", searchHistory);

load().catch((err) => {
  $("cr-empty").innerHTML = `<p class="error">Could not load credits dashboard: ${esc(err.message)}</p>`;
  $("cr-empty").hidden = false;
  $("cr-app").hidden = true;
});
