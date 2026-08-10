// Account page entry point: profile, plan, postbacks, danger zone.
import { $, esc, getCsrf, logError, copyToClipboard, flashButton, showConfirmModal } from "./dashboard/utils.js";
import { state } from "./dashboard/state.js";
import { wireAccount } from "./dashboard/account.js";
import { renderPlan, loadHistory, loadPlanUsage, wireDeleteAccount, wireCancelSubscription } from "./dashboard/site.js";

const statusEl = () => $("status");
function setStatus(message, isError) {
  const el = statusEl();
  if (!el) return;
  el.textContent = message;
  el.className = isError ? "toast toast--error" : "toast toast--success";
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

async function jsonReq(method, path) {
  const headers = { "x-csrf-token": getCsrf() };
  const res = await fetch(path, { method, credentials: "include", headers });
  let data = {};
  if (res.headers.get("content-type")?.includes("application/json")) {
    data = await res.json().catch(() => ({}));
  }
  return { ok: res.ok && data.ok, status: res.status, data };
}

function renderConversions(rows) {
  const body = $("conversionsBody");
  const empty = $("conversionsEmpty");
  const table = $("conversionsTable");
  if (!body || !empty || !table) return;
  if (!rows || rows.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }
  table.hidden = false;
  empty.hidden = true;
  body.innerHTML = rows.map((r) => `
    <tr>
      <td>${esc(r.at || "—")}</td>
      <td>${esc(r.event || "—")}</td>
      <td>${esc(r.amount != null ? Number(r.amount).toFixed(2) : "—")}</td>
      <td>${esc(r.currency || "—")}</td>
      <td>${esc(r.offer || "—")}</td>
    </tr>
  `).join("");
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function renderPostback(pb, status, upgrade) {
  const statusCard = $("postbackStatusCard");
  const shareCard = $("postbackShareCard");
  const keyCard = $("postbackKeyCard");
  const advanced = $("postbackAdvanced");
  const upgradeEl = $("postbackUpgrade");
  if (!statusCard || !shareCard || !keyCard || !advanced || !upgradeEl) return;

  if (upgrade) {
    statusCard.hidden = true;
    shareCard.hidden = true;
    keyCard.hidden = true;
    advanced.hidden = true;
    upgradeEl.hidden = false;
    return;
  }
  upgradeEl.hidden = true;

  if (!pb) {
    statusCard.hidden = false;
    shareCard.hidden = true;
    keyCard.hidden = true;
    advanced.hidden = true;
    const dot = $("postbackStatusDot");
    const text = $("postbackStatusText");
    const hint = $("postbackStatusHint");
    if (dot) dot.className = "status-dot status-dot--off";
    if (text) text.textContent = "Not configured";
    if (hint) hint.textContent = "Generate a postback key to start receiving conversions.";
    return;
  }

  statusCard.hidden = false;
  shareCard.hidden = false;
  keyCard.hidden = false;
  advanced.hidden = false;

  const active = status === "active";
  const dot = $("postbackStatusDot");
  const text = $("postbackStatusText");
  const hint = $("postbackStatusHint");
  if (dot) dot.className = `status-dot ${active ? "status-dot--ok" : "status-dot--pending"}`;
  if (text) text.textContent = active ? "Active — receiving conversions" : "Pending — no conversion received yet";
  if (hint) hint.textContent = active
    ? `Last conversion received: ${fmtDateTime(pb.lastUsedAt)}`
    : `Key created: ${fmtDateTime(pb.createdAt)}. Send the setup block below to your affiliate manager.`;

  $("postbackSigned").textContent = pb.signedEndpoint;
  $("postbackKey").textContent = pb.key;
  $("postbackLegacy").textContent = pb.legacyUrl;
}

async function loadPostbacks() {
  try {
    const res = await fetch("/api/account/postbacks", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setStatus(data.error || "Could not load postbacks.", true);
      return;
    }
    renderPostback(data.postback, data.status, data.upgrade);
    renderConversions(data.conversions);
  } catch (e) {
    logError("loadPostbacks", e);
    setStatus("Could not load postbacks.", true);
  }
}

function wireCopy(id, sourceId) {
  const btn = $(id);
  const source = $(sourceId);
  if (!btn || !source) return;
  btn.addEventListener("click", async () => {
    const ok = await copyToClipboard(source.textContent || "");
    flashButton(btn, ok ? "Copied!" : "Copy failed");
  });
}

function wirePostbacks() {
  wireCopy("postbackCopySigned", "postbackSigned");
  wireCopy("postbackCopyKey", "postbackKey");
  wireCopy("postbackCopyLegacy", "postbackLegacy");

  const manager = $("postbackCopyManager");
  if (manager) {
    manager.addEventListener("click", async () => {
      const signed = $("postbackSigned");
      if (!signed) return;
      const text = `Signed endpoint: ${signed.textContent}\nMethod: POST\nSign the raw query string with HMAC-SHA256 keyed by your postback key, then send the hex signature as the X-Postback-Signature header.\nAlso include X-Postback-Key with your key.\nLegacy unsigned URL: ${$("postbackLegacy")?.textContent || "deprecated"} (sunset ${$("postbackLegacy")?.textContent ? "2026-10-01" : ""})`;
      const ok = await copyToClipboard(text);
      flashButton(manager, ok ? "Copied!" : "Copy failed");
    });
  }

  const rotate = $("postbackRotate");
  const revoke = $("postbackRevoke");

  if (rotate) {
    rotate.addEventListener("click", async () => {
      if (!await showConfirmModal("Rotate postback key", "This will revoke the existing key immediately. Any in-flight conversions using the old key will fail.", "Rotate", true)) return;
      rotate.disabled = true;
      const result = await jsonReq("POST", "/api/account/postbacks/rotate");
      rotate.disabled = false;
      if (result.ok && result.data.postback) {
        renderPostback(result.data.postback, "pending", false);
        setStatus("Postback key rotated.", false);
      } else {
        setStatus(result.data?.error || "Could not rotate key.", true);
      }
    });
  }

  if (revoke) {
    revoke.addEventListener("click", async () => {
      if (!await showConfirmModal("Revoke postback key", "Casino updates will stop until a new key is created.", "Revoke", true)) return;
      revoke.disabled = true;
      const result = await jsonReq("DELETE", "/api/account/postbacks");
      revoke.disabled = false;
      if (result.ok) {
        renderPostback(null, "not_configured", false);
        renderConversions([]);
        setStatus("Postback key revoked.", false);
      } else {
        setStatus(result.data?.error || "Could not revoke key.", true);
      }
    });
  }

  const testBtn = $("postbackTest");
  const testStatus = $("postbackTestStatus");
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      testBtn.disabled = true;
      if (testStatus) { testStatus.textContent = "Sending test conversion…"; testStatus.className = "hint"; }
      const result = await jsonReq("POST", "/api/account/postbacks/test");
      testBtn.disabled = false;
      if (result.ok) {
        if (testStatus) { testStatus.textContent = result.data.message; testStatus.className = "hint hint--success"; }
        await loadPostbacks();
      } else {
        if (testStatus) { testStatus.textContent = result.data?.error || "Test failed."; testStatus.className = "hint hint--error"; }
      }
    });
  }
}

function currentTab() {
  return document.getElementById("acc-app")?.dataset?.accTab || "";
}

function setUserName() {
  const userName = $("accUserName");
  if (userName && state.ME) userName.textContent = state.ME.display_name || state.ME.email || "Account";
}

function renderConnectedAccounts(data) {
  const wrap = $("connectedAccounts");
  if (!wrap) return;
  if (!data || data.error) { wrap.innerHTML = `<p class="error">Could not load connected accounts.</p>`; return; }

  const kick = data.kick;
  const telegram = data.telegram;
  const sites = data.sites || [];

  let html = "";
  if (kick || telegram) {
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px">`;
    if (kick) html += `<div style="padding:12px;border:1px solid var(--line);border-radius:8px"><div class="hint">Kick</div><div style="font-weight:600">@${esc(kick.username || kick.userId)}</div><div class="hint">Linked ${fmtDateTime(kick.linkedAt)}</div></div>`;
    if (telegram) html += `<div style="padding:12px;border:1px solid var(--line);border-radius:8px"><div class="hint">Telegram</div><div style="font-weight:600">@${esc(telegram.username || telegram.userId)}</div><div class="hint">Linked ${fmtDateTime(telegram.linkedAt)}</div></div>`;
    html += `</div>`;
  } else {
    html += `<p class="hint">No streamer accounts connected yet. Connect Kick from Credits and Telegram from the bot dashboard.</p>`;
  }

  if (sites.length > 0) {
    html += `<h3 class="m-0 mt-18 mb-4">Per-board integrations</h3><table class="admin-table"><thead><tr><th>Board</th><th>Kick channel</th><th>Discord webhook</th><th>Telegram chat</th></tr></thead><tbody>`;
    for (const s of sites) {
      html += `<tr>
        <td><a href="/${esc(s.slug)}">${esc(s.name || s.slug)}</a></td>
        <td>${s.kickChannel ? `<span class="badge ok">${esc(s.kickChannel.name || s.kickChannel.id)}</span>` : "—"}</td>
        <td>${s.discordWebhook ? `<span class="badge ok">On</span>` : "—"}</td>
        <td>${s.telegramChat ? `<span class="badge ok">${esc(s.telegramChat.chatId)}</span>` : "—"}</td>
      </tr>`;
    }
    html += `</tbody></table>`;
  }

  wrap.innerHTML = html;
}

async function loadConnectedAccounts() {
  const r = await jsonReq("GET", "/api/account/connected-accounts");
  renderConnectedAccounts(r.ok ? r.data : { error: r.data?.error || "failed" });
}

async function init() {
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch (err) { logError("auth/me", err); me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  state.ME = me.user;
  setUserName();

  const tab = currentTab();
  if (!tab || tab === "profile") wireAccount();
  if (!tab || tab === "plan") {
    renderPlan();
    loadPlanUsage();
    loadHistory();
    wireCancelSubscription();
  }
  if (!tab || tab === "postbacks") {
    await loadPostbacks();
    wirePostbacks();
  }
  if (!tab || tab === "connected") await loadConnectedAccounts();
  if (!tab || tab === "data") wireDeleteAccount();
}

if (document.getElementById("acc-app")) init();
