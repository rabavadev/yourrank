import { showConfirmModal, showPromptModal } from "./dashboard/utils.js";
import { openDrawer, closeDrawer } from "./dashboard/shell.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const csrf = () => document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString() : "—";
const relative = (iso) => { const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)); return mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`; };
async function api(method, path, body) {
  const opts = { method, credentials: "same-origin", headers: { "x-csrf-token": csrf() } };
  if (body) { opts.headers["content-type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(path, opts); const data = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("Session expired"); }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`); return data;
}
let state = {};
const tab = () => $("cr-app")?.dataset.crTab || "";
const siteQuery = () => new URLSearchParams(location.search).get("siteId");
const sitePath = (path) => `${path}${siteQuery() ? `?siteId=${encodeURIComponent(siteQuery())}` : ""}`;
function setStatus(id, msg, error = false) { const el = $(id); if (!el) return; el.textContent = msg; el.className = error ? "status error" : "status"; }
function statusChip(status) { const kind = status === "fulfilled" ? "fulfilled" : status === "cancelled" ? "cancelled" : status === "refunded" ? "refunded" : "pending"; return `<span class="v3-chip v3-chip--${kind}">● ${esc(status)}</span>`; }
function wireShell() {
  const backdrop = document.querySelector(".lb-backdrop") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "lb-backdrop" }));
  $("lbMenu")?.addEventListener("click", () => openDrawer()); document.querySelector("[data-close-side]")?.addEventListener("click", () => closeDrawer()); backdrop.addEventListener("click", () => closeDrawer());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lbSide")?.classList.contains("is-open")) closeDrawer(); });
}
async function loadBoardShell() {
  const [me, boards] = await Promise.all([api("GET", "/api/auth/me"), api("GET", "/api/site/list")]);
  const user = me.user || {}; $("userAvatar").textContent = (user.displayName || user.email || "Y").trim().charAt(0).toUpperCase();
  const list = boards.sites || boards.boards || boards || []; const current = siteQuery() || list[0]?.id || list[0]?.siteId; const select = $("sidebarBoardSelect");
  if (select) { select.innerHTML = list.map((b) => `<option value="${esc(b.id || b.siteId)}" ${String(b.id || b.siteId) === String(current) ? "selected" : ""}>${esc(b.name || b.slug || "Board")}</option>`).join(""); select.addEventListener("change", () => { location.href = `${location.pathname}?siteId=${encodeURIComponent(select.value)}`; }); }
  const board = list.find((b) => String(b.id || b.siteId) === String(current)) || list[0] || {};
  $("activeBoardName").textContent = board.name || board.slug || "Board"; $("activeBoardMeta").textContent = board.slug ? `yourrank.site/${board.slug}` : "";
  $("lbTopbarStatus").textContent = board.published ? "LIVE" : "NOT LIVE"; $("lbTopbarStatus").className = `lb-status ${board.published ? "lb-status--live" : "lb-status--draft"}`;
  $("planBadge").textContent = `${String(board.plan || user.plan || "free").toUpperCase()} PLAN`; if (board.slug) $("liveLink").href = `/${board.slug}`;
}
function renderRewardRow(m) {
  return `<tr><td><b>${esc(m.kick_reward_title)}</b><br><span class="hint">${esc(m.kick_reward_id)}</span></td><td class="hint">When redeemed · ${m.kick_reward_cost} points</td><td class="num"><b>+${m.credits} cr</b></td><td><input class="v3-toggle" type="checkbox" ${m.active ? "checked" : ""} data-toggle-reward="${esc(m.id)}" /></td><td class="ta-r"><button class="btn btn--sm" data-edit-reward="${esc(m.id)}">Edit</button> <button class="btn btn--sm btn--danger" data-del-reward="${esc(m.id)}">Delete</button></td></tr>`;
}
function renderViewerRow(v) { return `<tr><td>${esc(v.kick_username || v.kick_user_id)}${v.blocked ? ' <span class="v3-chip v3-chip--cancelled">blocked</span>' : ""}</td><td class="num">${v.balance}</td><td class="num">${v.total_earned}</td><td class="num">${v.total_spent}</td><td>${fmtDate(v.last_earned_at || v.created_at)}</td><td class="ta-r"><button class="btn btn--sm ${v.blocked ? "btn--accent" : "btn--danger"}" data-block="${esc(v.id)}" data-blocked="${v.blocked ? "1" : ""}">${v.blocked ? "Unblock" : "Block"}</button></td></tr>`; }
function renderRedemptionRow(r) { return `<tr><td><b>${esc(r.kick_username || r.kick_user_id)}</b></td><td>${esc(r.item_name)}</td><td class="num"><b>${r.cost}</b> <span class="hint">cr</span></td><td>${statusChip(r.status)}</td><td title="${esc(fmtDate(r.created_at))}">${relative(r.created_at)}</td><td class="ta-r">${r.status === "pending" ? `<button class="btn btn--sm" data-cancel="${esc(r.id)}">Cancel</button> <button class="btn btn--sm btn--accent" data-fulfill="${esc(r.id)}">Fulfil</button>` : ""}</td></tr>`; }
function renderShopCards(items) {
  const root = $("cr-shop-list"); if (!root) return; $("cr-shop-empty").hidden = items.length > 0;
  root.innerHTML = items.map((i) => `<article class="cr-shop-card${i.active ? "" : " is-inactive"}"><div class="cr-shop-card-head"><h2>${esc(i.name)}</h2><input class="v3-toggle" type="checkbox" ${i.active ? "checked" : ""} data-toggle-shop="${esc(i.id)}" aria-label="Toggle ${esc(i.name)}" /></div><p>${esc(i.description || "")}</p><hr /><div class="cr-shop-card-foot"><b>${i.cost} <small>cr</small></b><span>Stock: ${i.stock === null ? "∞" : `${i.stock} left`}</span></div><button class="btn btn--sm" data-edit-shop="${esc(i.id)}">Edit</button></article>`).join("");
}
function render() {
  const usage = state.usage || {}, limits = state.limits || {}, current = tab();
  if (current === "channel") {
    const connected = Boolean(state.channel?.externalId); $("cr-channel-connected").hidden = !connected; $("cr-channel-connect-wrap").hidden = connected;
    $("cr-channel-name").textContent = state.channel?.name || ""; $("cr-channel-id-input").value = state.channel?.externalId || ""; $("cr-channel-name-input").value = state.channel?.name || "";
    const expiry = state.channel?.tokenExpiresAt; $("cr-channel-token").textContent = expiry ? (new Date(expiry) > new Date() ? `Token valid · expires in ${Math.max(1, Math.ceil((new Date(expiry) - Date.now()) / 86400000))} days` : "Token expired · reconnect") : "No Kick token · connect Kick";
    $("cr-reward-usage").textContent = `${usage.rewardMappings || 0} / ${limits.rewardMappings || 0} MAPPINGS DEFINED`;
  }
  if (current === "maps" || current === "rewards") { $("cr-reward-usage").textContent = `${usage.rewardMappings || 0} / ${limits.rewardMappings || 0} MAPPINGS DEFINED`; $("cr-reward-list").innerHTML = (state.mappings || []).map(renderRewardRow).join(""); }
  if (current === "shop") { $("cr-shop-usage").textContent = `${usage.shopItems || 0} / ${limits.shopItems || 0} ACTIVE ITEMS`; renderShopCards(state.shopItems || []); }
  if (current === "viewers") $("cr-viewer-list").innerHTML = (state.viewers || []).map(renderViewerRow).join("");
  if (current === "redemptions") {
    const channel = $("cr-redemption-channel"); if (state.channel?.externalId) { channel.innerHTML = `● Connected to @<span>${esc(state.channel.name || state.channel.externalId)}</span>`; channel.className = "v3-chip v3-chip--refunded"; } else { channel.textContent = "Not connected · Connect in Channel"; channel.className = "v3-chip v3-chip--cancelled"; }
    $("cr-pending-counter").textContent = `${usage.pendingRedemptions || 0} / ${limits.pendingRedemptions || 0}`; $("cr-fulfilled-counter").textContent = `${usage.redemptionsPer30Days || 0} / ${limits.redemptionsPer30Days || 0}`;
    $("cr-redemption-list").innerHTML = (state.redemptions || []).map(renderRedemptionRow).join(""); $("cr-redemption-empty").hidden = (state.redemptions || []).length > 0;
  }
}
function openShop(item) {
  $("cr-shop-drawer").hidden = false; $("cr-shop-drawer-title").textContent = item ? "Edit Shop Item" : "Create New Shop Item"; $("cr-shop-item-id").value = item?.id || ""; $("cr-shop-name").value = item?.name || ""; $("cr-shop-desc").value = item?.description || ""; $("cr-shop-cost").value = item?.cost || 100; $("cr-shop-stock").value = item?.stock === null ? "" : (item?.stock ?? ""); $("cr-shop-active").checked = item?.active !== false; $("cr-shop-name").focus();
}
async function updateRedemption(id, status) {
  const body = status === "cancelled" ? "This restores the viewer’s credits and returns one item to stock." : "This marks the item as fulfilled.";
  if (!await showConfirmModal(status === "cancelled" ? "Cancel redemption" : "Fulfil redemption", body, "Confirm", true)) return;
  await api("POST", sitePath(`/api/credits/redemptions/${encodeURIComponent(id)}`), { status }); await load();
}
async function load() {
  if ($("cr-loading")) $("cr-loading").hidden = false;
  try { await loadBoardShell(); state = await api("GET", sitePath("/api/credits/status")); render(); $("cr-app").hidden = false; $("cr-empty").hidden = true; wireActions(); }
  catch (err) { $("cr-empty").innerHTML = `<p class="error">Could not load credits dashboard: ${esc(err.message)}</p>`; $("cr-empty").hidden = false; }
  finally { if ($("cr-loading")) $("cr-loading").hidden = true; }
}
function wireActions() {
  $("cr-channel-form")?.addEventListener("submit", async (e) => { e.preventDefault(); try { const d = await api("POST", sitePath("/api/credits/connect"), { externalId: $("cr-channel-id-input").value.trim(), name: $("cr-channel-name-input").value.trim() }); state.channel = d.channel; render(); } catch (err) { setStatus("cr-channel-status", err.message, true); } });
  $("cr-channel-disconnect")?.addEventListener("click", async () => { await api("POST", "/api/kick/disconnect"); state.channel = {}; render(); });
  $("cr-reward-form")?.addEventListener("submit", async (e) => { e.preventDefault(); await api("POST", sitePath("/api/credits/rewards"), { id: $("cr-reward-id").value || undefined, kickRewardId: $("cr-reward-kick-id").value.trim(), kickRewardTitle: $("cr-reward-title").value.trim(), kickRewardCost: Number($("cr-reward-cost").value), credits: Number($("cr-reward-credits").value) }); await load(); });
  $("cr-shop-new")?.addEventListener("click", () => openShop()); document.querySelector("[data-cr-shop-create]")?.addEventListener("click", () => openShop()); $("cr-shop-close")?.addEventListener("click", () => { $("cr-shop-drawer").hidden = true; }); $("cr-shop-cancel")?.addEventListener("click", () => { $("cr-shop-drawer").hidden = true; });
  $("cr-shop-form")?.addEventListener("submit", async (e) => { e.preventDefault(); await api("POST", sitePath("/api/credits/shop"), { id: $("cr-shop-item-id").value || undefined, name: $("cr-shop-name").value.trim(), description: $("cr-shop-desc").value.trim(), cost: Number($("cr-shop-cost").value), stock: $("cr-shop-stock").value === "" ? null : Number($("cr-shop-stock").value), active: $("cr-shop-active").checked }); $("cr-shop-drawer").hidden = true; await load(); });
  document.querySelectorAll("[data-edit-shop]").forEach((b) => b.addEventListener("click", () => openShop(state.shopItems.find((i) => i.id === b.dataset.editShop)))); document.querySelectorAll("[data-toggle-shop]").forEach((b) => b.addEventListener("change", async () => { const i = state.shopItems.find((x) => x.id === b.dataset.toggleShop); await api("POST", sitePath("/api/credits/shop"), { ...i, active: b.checked }); await load(); }));
  document.querySelectorAll("[data-fulfill]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.fulfill, "fulfilled"))); document.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", () => updateRedemption(b.dataset.cancel, "cancelled")));
  document.querySelectorAll("[data-edit-reward]").forEach((b) => b.addEventListener("click", () => { const q = siteQuery() ? `?edit=${encodeURIComponent(b.dataset.editReward)}&siteId=${encodeURIComponent(siteQuery())}` : `?edit=${encodeURIComponent(b.dataset.editReward)}`; location.href = `/dashboard/rewards/maps${q}`; }));
  document.querySelectorAll("[data-toggle-reward]").forEach((b) => b.addEventListener("change", async () => {
    const m = state.mappings.find((x) => x.id === b.dataset.toggleReward);
    if (!m) return;
    if (b.checked) {
      await api("POST", sitePath("/api/credits/rewards"), { id: m.id, kickRewardId: m.kick_reward_id, kickRewardTitle: m.kick_reward_title, kickRewardCost: m.kick_reward_cost, credits: m.credits });
    } else if (await showConfirmModal("Disable mapping", "This disables the mapping; history is retained.", "Confirm", true)) {
      await api("DELETE", sitePath(`/api/credits/rewards/${m.id}`));
    } else {
      b.checked = true;
      return;
    }
    await load();
  }));
  document.querySelectorAll("[data-del-reward]").forEach((b) => b.addEventListener("click", async () => { if (await showConfirmModal("Disable mapping", "This disables the mapping; history is retained.", "Confirm", true)) { await api("DELETE", sitePath(`/api/credits/rewards/${b.dataset.delReward}`)); await load(); } }));
  document.querySelectorAll("[data-block]").forEach((b) => b.addEventListener("click", async () => { const blocked = !b.dataset.blocked; const reason = blocked ? await showPromptModal("Block viewer", "Why are you blocking this viewer?", { confirmText: "Block" }) : ""; if (blocked && !reason) return; await api("POST", sitePath(`/api/credits/viewers/${b.dataset.block}/block`), { blocked, reason }); await load(); }));
  $("cr-history-form")?.addEventListener("submit", async (e) => { e.preventDefault(); const d = await api("GET", `/api/credits/viewer/history?kickUsername=${encodeURIComponent($("cr-history-username").value.trim())}`); $("cr-history-list").innerHTML = (d.boards || []).map((b) => `<tr><td><b>${esc(b.name || b.slug)}</b></td><td class="num">${b.balance}</td><td class="num">${b.totalEarned}</td><td class="num">${b.totalSpent}</td><td class="num">${b.redemptionsPending}</td><td class="num">${b.redemptionsTotal}</td><td></td></tr>`).join(""); $("cr-history-empty").hidden = true; });
}
if ($("cr-app")) { wireShell(); load(); }
