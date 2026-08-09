// Account page entry point: profile, plan, postbacks, danger zone.
import { $, esc, getCsrf, logError, copyToClipboard, flashButton } from "./dashboard/utils.js";
import { state } from "./dashboard/state.js";
import { wireAccount } from "./dashboard/account.js";
import { renderPlan, loadHistory, wireDeleteAccount, wireCancelSubscription } from "./dashboard/site.js";

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

function renderPostback(pb, upgrade) {
  const card = $("postbackCard");
  const upgradeEl = $("postbackUpgrade");
  const status = $("postbackStatus");
  if (!card || !upgradeEl) return;

  if (upgrade) {
    card.hidden = true;
    upgradeEl.hidden = false;
    return;
  }
  upgradeEl.hidden = true;

  if (!pb) {
    card.hidden = true;
    if (status) {
      status.textContent = "No active postback key. Click Rotate to generate one.";
      status.className = "hint";
    }
    return;
  }

  card.hidden = false;
  $("postbackSigned").textContent = pb.signedEndpoint;
  $("postbackKey").textContent = pb.key;
  $("postbackLegacy").textContent = pb.legacyUrl;
  if (status) {
    status.textContent = `Legacy URL sunset: ${pb.legacySunset}. Sign the raw query string with HMAC-SHA256 keyed by the postback key.`;
    status.className = "hint";
  }
}

async function loadPostbacks() {
  try {
    const res = await fetch("/api/account/postbacks", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setStatus(data.error || "Could not load postbacks.", true);
      return;
    }
    renderPostback(data.postback, data.upgrade);
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

  const rotate = $("postbackRotate");
  const revoke = $("postbackRevoke");
  const status = $("postbackStatus");

  if (rotate) {
    rotate.addEventListener("click", async () => {
      if (!confirm("Rotate the postback key? This will revoke the existing key.")) return;
      rotate.disabled = true;
      if (status) { status.textContent = "Rotating…"; status.className = "hint"; }
      const result = await jsonReq("POST", "/api/account/postbacks/rotate");
      rotate.disabled = false;
      if (result.ok && result.data.postback) {
        renderPostback(result.data.postback, false);
        setStatus("Postback key rotated.", false);
      } else {
        setStatus(result.data?.error || "Could not rotate key.", true);
      }
    });
  }

  if (revoke) {
    revoke.addEventListener("click", async () => {
      if (!confirm("Revoke the postback key? Casino updates will stop until a new key is created.")) return;
      revoke.disabled = true;
      if (status) { status.textContent = "Revoking…"; status.className = "hint"; }
      const result = await jsonReq("DELETE", "/api/account/postbacks");
      revoke.disabled = false;
      if (result.ok) {
        renderPostback(null, false);
        renderConversions([]);
        setStatus("Postback key revoked.", false);
      } else {
        setStatus(result.data?.error || "Could not revoke key.", true);
      }
    });
  }
}

function setActiveAccountNav(hash = "") {
  const clean = hash.replace("#", "");
  document.querySelectorAll(".lb-nav[data-hash]").forEach((n) => {
    const active = n.dataset.hash === clean;
    n.classList.toggle("is-on", active);
    if (active) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
}

function scrollToHash(hash = "") {
  const clean = hash.replace("#", "");
  if (!clean) return;
  const target = document.getElementById(clean);
  if (target) {
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    target.classList.add("is-highlighted");
    setTimeout(() => target.classList.remove("is-highlighted"), 1200);
  }
}

function setupAccountShell() {
  const userName = $("accUserName");
  if (userName && state.ME) userName.textContent = state.ME.display_name || state.ME.email || "Account";
  document.querySelectorAll(".lb-nav[data-hash]").forEach((link) => link.addEventListener("click", (e) => {
    e.preventDefault();
    const hash = link.dataset.hash;
    history.pushState({}, "", `/account#${hash}`);
    setActiveAccountNav(hash);
    scrollToHash(hash);
  }));
  window.addEventListener("popstate", () => {
    setActiveAccountNav(location.hash);
    scrollToHash(location.hash);
  });
  setActiveAccountNav(location.hash);
  scrollToHash(location.hash);
}

async function init() {
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch (err) { logError("auth/me", err); me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  state.ME = me.user;
  setupAccountShell();

  renderPlan();
  loadHistory();
  wireAccount();
  wireDeleteAccount();
  wireCancelSubscription();
  await loadPostbacks();
  wirePostbacks();
}

init();
