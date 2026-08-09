// Viewer dashboard (/me) client.
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString() : "—"; }

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

function setStatus(id, msg, err) {
  const el = $(id);
  el.textContent = msg;
  el.className = err ? "status error" : "status";
}

async function load() {
  try {
    const data = await api("GET", "/api/viewer/me");
    state = data;
    render();
  } catch (err) {
    if (err.message === "unauthorized") {
      renderLoggedOut();
    } else {
      setStatus("vd-login-status", err.message, true);
    }
  }
}

function renderLoggedOut() {
  $("vd-login-card").hidden = false;
  $("vd-profile").hidden = true;
  $("vd-boards-card").hidden = true;
  $("vd-site-card").hidden = true;
}

function render() {
  const v = state.viewer;
  if (!v) return renderLoggedOut();

  $("vd-login-card").hidden = true;
  $("vd-profile").hidden = false;
  $("vd-boards-card").hidden = false;
  $("vd-site-card").hidden = true;

  const name = v.discordUsername || v.kickUsername || "Viewer";
  $("vd-username").textContent = name;
  if (v.avatarUrl) {
    $("vd-avatar").src = v.avatarUrl;
    $("vd-avatar").alt = name;
    $("vd-avatar").hidden = false;
  } else {
    $("vd-avatar").hidden = true;
  }

  $("vd-nav").innerHTML = `<a class="btn btn--sm" href="/me">My credits</a>`;

  const boards = state.boards || [];
  $("vd-boards-empty").hidden = boards.length > 0;
  $("vd-boards").innerHTML = boards.map((b) => `
    <div style="padding:14px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div>
        <div style="font-weight:600">${esc(b.name || b.slug)}</div>
        <div class="hint">${esc(b.slug)}</div>
        ${b.blocked ? `<span class="pill pill--bad">blocked</span>` : ""}
      </div>
      <div style="text-align:right">
        <div style="font-size:1.4rem;font-weight:700">${b.balance}</div>
        <div class="hint">credits</div>
        <button class="btn btn--sm" data-view-site="${esc(b.slug)}">View shop</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("[data-view-site]").forEach((b) => {
    b.addEventListener("click", () => viewSite(b.dataset.viewSite));
  });
}

async function viewSite(slug) {
  try {
    const data = await api("GET", `/api/viewer/site?slug=${encodeURIComponent(slug)}`);
    state.current = data;
    renderSite();
  } catch (err) { setStatus("vd-login-status", err.message, true); }
}

function renderSite() {
  const data = state.current;
  if (!data) return;

  $("vd-boards-card").hidden = true;
  $("vd-site-card").hidden = false;
  $("vd-site-name").textContent = data.site.name || data.site.slug;
  const v = data.viewer;
  $("vd-site-balance").textContent = v ? v.balance : 0;

  const items = data.shopItems || [];
  $("vd-shop-empty").hidden = items.length > 0;
  $("vd-shop-list").innerHTML = items.map((i) => {
    const canBuy = v && !v.blocked && v.balance >= i.cost && (i.stock === null || i.stock > 0);
    return `
      <div style="padding:14px;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:600">${esc(i.name)}</div>
          <div class="hint">${esc(i.description || "")}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${i.cost} credits</div>
          ${i.stock !== null ? `<div class="hint">Stock: ${i.stock}</div>` : ""}
          <button class="btn btn--sm" data-redeem="${esc(i.id)}" ${canBuy ? "" : "disabled"}>Redeem</button>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll("[data-redeem]").forEach((b) => {
    b.addEventListener("click", () => redeem(b.dataset.redeem));
  });

  const redemptions = data.redemptions || [];
  $("vd-redemptions-empty").hidden = redemptions.length > 0;
  $("vd-redemptions-list").innerHTML = redemptions.map((r) => `
    <div style="padding:12px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>${esc(r.item_name)}</div>
      <div>
        <span class="pill pill--${r.status === "pending" ? "muted" : r.status === "fulfilled" ? "good" : "bad"}">${r.status}</span>
        <div class="hint">${fmtDate(r.createdAt)}</div>
      </div>
    </div>
  `).join("");
}

async function redeem(shopItemId) {
  const slug = state.current?.site?.slug;
  if (!slug) return;
  const item = (state.current.shopItems || []).find((i) => i.id === shopItemId);
  if (!item) return;
  if (!confirm(`Spend ${item.cost} credits on ${item.name}?`)) return;

  try {
    const data = await api("POST", "/api/viewer/redeem", { slug, shopItemId });
    state.current.viewer.balance = data.balance;
    state.current.redemptions = state.current.redemptions || [];
    state.current.redemptions.unshift({
      id: data.redemptionId,
      itemName: item.name,
      cost: item.cost,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    renderSite();
    // Refresh boards list to update balances.
    load().catch(() => {});
  } catch (err) { setStatus("vd-login-status", err.message, true); }
}

$("vd-logout")?.addEventListener("click", async () => {
  try {
    await api("POST", "/api/viewer/logout");
    state = {};
    renderLoggedOut();
  } catch (err) { setStatus("vd-login-status", err.message, true); }
});

$("vd-back")?.addEventListener("click", () => {
  state.current = null;
  $("vd-site-card").hidden = true;
  $("vd-boards-card").hidden = false;
  load().catch(() => {});
});

// Show any OAuth error in the URL.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("error")) {
  setStatus("vd-login-status", "Login failed: " + urlParams.get("error"), true);
  window.history.replaceState({}, "", "/me");
}

load().catch((err) => {
  setStatus("vd-login-status", err.message, true);
});
