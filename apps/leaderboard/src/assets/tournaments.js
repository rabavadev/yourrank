import { loadBoardShell } from "./dashboard/board-shell.js";
import { renderEmpty } from "./dashboard/states.js";
import { computeTrustScore, connectKickChat } from "./chat-entry.js";

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));
const csrf = () => document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";
const SOURCE_LABELS = {
  chat: "Chat",
  page: "Signup page",
  manual: "Added by you",
  leaderboard: "Leaderboard",
};

let siteId = "";
let board = {};
let tournament = null;
let entries = [];
let chatConnection = null;
let chatHistory = new Map();
let recentEntryTimestamps = [];

function apiPath(path) {
  return siteId ? `${path}${path.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteId)}` : path;
}

async function api(path, options = {}) {
  const response = await fetch(apiPath(path), {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-csrf-token": csrf(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function setChatStatus(text, live = false) {
  const status = $("tournament-chat-status");
  if (!status) return;
  status.textContent = text;
  status.classList.toggle("is-live", live);
}

function stopChat() {
  chatConnection?.close();
  chatConnection = null;
  setChatStatus("Chat off");
}

function renderEntries() {
  const container = $("tournament-entries");
  if (!container) return;
  if (!entries.length) {
    renderEmpty(container, {
      compactHeading: true,
      title: tournament?.signup_state === "open" ? "Waiting for viewers" : "No entries yet",
      body: tournament?.signup_state === "open"
        ? `Ask viewers to type ${tournament.entry_keyword || "!join"} in chat.`
        : "Open signups when you are ready to collect names.",
      actions: [{ id: "tournament-empty-action", label: tournament?.signup_state === "open" ? "Show chat command" : "Open signups" }],
    });
    return;
  }

  container.removeAttribute("aria-busy");
  container.innerHTML = entries.map((entry) => {
    const flagged = tournament?.anti_alt_enabled && entry.alt_flag;
    const action = ["removed", "blocked"].includes(entry.status)
      ? `<button class="tournament-row-action" type="button" data-entry-action="restore" data-entry-id="${esc(entry.id)}">Restore</button>`
      : `<button class="tournament-row-action" type="button" data-entry-action="remove" data-entry-id="${esc(entry.id)}">Remove</button>
         <button class="tournament-row-action tournament-row-action--quiet" type="button" data-entry-action="block" data-entry-id="${esc(entry.id)}">Block</button>`;
    return `
      <div class="tournament-entry-row${flagged ? " is-flagged" : ""}" data-entry-id="${esc(entry.id)}">
        <div class="tournament-entry-main">
          <strong>${esc(entry.display_name)}</strong>
          <span>${esc(SOURCE_LABELS[entry.source] || entry.source)}${entry.status !== "pending" ? ` · ${esc(entry.status)}` : ""}</span>
        </div>
        ${flagged ? `<div class="tournament-entry-flag" role="status"><b>Review</b><span>${esc(entry.alt_reason || "Possible duplicate account.")}</span></div>` : ""}
        <div class="tournament-entry-actions">${action}</div>
      </div>`;
  }).join("");
}

function renderTournament() {
  const empty = $("tournament-empty");
  const listCard = $("tournament-list-card");
  const settings = $("tournament-settings");
  const primary = $("tournament-primary");
  const pickWrap = $("tournament-pick-count-wrap");
  if (!tournament) {
    listCard.hidden = true;
    settings.hidden = true;
    primary.hidden = true;
    renderEmpty(empty, {
      compactHeading: true,
      title: "Start a tournament",
      body: "Create a simple entry list and let viewers join from chat.",
      actions: [{ id: "tournament-create-empty", label: "Create tournament", accent: true }],
    });
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  listCard.hidden = false;
  settings.hidden = false;
  const activeCount = entries.filter((entry) => ["pending", "confirmed", "selected"].includes(entry.status)).length;
  const eligibleCount = entries.filter((entry) => ["pending", "confirmed"].includes(entry.status)).length;
  $("tournament-count").textContent = `${activeCount}${tournament.entry_cap ? ` of ${tournament.entry_cap}` : ""} entries`;
  $("tournament-step-label").textContent = tournament.signup_state === "open"
    ? `Viewers can join with ${tournament.entry_keyword || "!join"}`
    : tournament.signup_state === "locked" ? "Signups are locked" : "Signups are closed";
  const picking = tournament.signup_state === "locked" || eligibleCount > 0 && tournament.signup_state !== "open";
  primary.hidden = false;
  pickWrap.hidden = !picking;
  primary.textContent = tournament.signup_state === "open" ? "Lock signups" : eligibleCount ? "Pick winners" : "Open signups";
  if (tournament.signup_state === "open") primary.dataset.action = "lock";
  else if (eligibleCount) primary.dataset.action = "pick";
  else primary.dataset.action = "open";

  $("tournament-format").value = tournament.format || "bracket";
  $("tournament-entry-cap").value = tournament.entry_cap || "";
  $("tournament-keyword").value = tournament.entry_keyword || "!join";
  $("tournament-anti-alt").checked = tournament.anti_alt_enabled === true;
  $("tournament-chat-channel").value = localStorage.getItem("yr_tournament_channel") || board.slug || "";
  renderEntries();
}

async function loadEntries() {
  if (!tournament) return;
  const data = await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/entries`);
  entries = data.entries || [];
  renderTournament();
}

async function loadTournament() {
  const data = await api("/api/tournaments");
  tournament = data.tournaments?.[0] || null;
  entries = [];
  if (tournament) await loadEntries();
  else renderTournament();
}

async function createTournament() {
  const data = await api("/api/tournaments", {
    method: "POST",
    body: JSON.stringify({
      siteId,
      title: "Community tournament",
      gameName: "Game",
      bracketSize: 8,
      format: "bracket",
      participants: [],
    }),
  });
  tournament = data.tournament;
  await loadEntries();
}

async function startChat() {
  if (!tournament || tournament.signup_state !== "open" || chatConnection) return;
  const channel = $("tournament-chat-channel")?.value.trim() || board.slug || "";
  if (!channel) {
    setChatStatus("Add a Kick channel");
    return;
  }
  localStorage.setItem("yr_tournament_channel", channel);
  setChatStatus("Connecting…");
  try {
    const response = await fetch(`/api/giveaways/chatroom?channel=${encodeURIComponent(channel)}`);
    const data = await response.json();
    if (!response.ok || !data.chatroomId) throw new Error(data.error || "Could not find that Kick channel.");
    chatConnection = connectKickChat({
      chatroomId: data.chatroomId,
      onOpen: () => setChatStatus("Chat listening", true),
      onError: () => setChatStatus("Chat connection error"),
      onClose: () => {
        chatConnection = null;
        setChatStatus("Chat off");
      },
      onMessage: handleChatMessage,
    });
  } catch {
    setChatStatus("Chat unavailable");
  }
}

async function handleChatMessage(chatData) {
  const sender = chatData?.sender;
  const content = String(chatData?.content || "").trim();
  if (!sender || !content) return;
  const username = String(sender.username || sender.slug || "Anonymous").trim();
  const keyword = String(tournament?.entry_keyword || "!join").toLowerCase();
  if (content.split(/\s+/)[0].toLowerCase() !== keyword) return;
  const now = Date.now();
  const nameKey = username.toLowerCase();
  chatHistory.set(nameKey, (chatHistory.get(nameKey) || 0) + 1);
  recentEntryTimestamps.push(now);
  if (recentEntryTimestamps.length > 50) recentEntryTimestamps.shift();
  const score = computeTrustScore(username, content, now, {
    chatHistory,
    recentEntryTimestamps,
  });
  try {
    await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/entries`, {
      method: "POST",
      body: JSON.stringify({
        displayName: username,
        source: "chat",
        trustScore: score.trustScore,
        altFlag: tournament.anti_alt_enabled ? score.sybilFlag : false,
        altReason: score.altReason,
      }),
    });
    await loadEntries();
  } catch (error) {
    if (!String(error.message).toLowerCase().includes("blocked")) console.warn("[tournament] entry failed", error);
  }
}

async function handlePrimary() {
  if (!tournament) return createTournament();
  const action = $("tournament-primary").dataset.action;
  if (action === "open") {
    await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/signups/open`, { method: "POST", body: "{}" });
    await loadTournament();
    return startChat();
  }
  if (action === "lock") {
    await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/signups/lock`, { method: "POST", body: "{}" });
    stopChat();
    return loadTournament();
  }
  if (action === "pick") {
    const count = Math.max(1, parseInt($("tournament-pick-count").value, 10) || 1);
    await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/entries/random-pick`, {
      method: "POST",
      body: JSON.stringify({ count }),
    });
    return loadEntries();
  }
}

async function handleEntryAction(button) {
  const action = button.dataset.entryAction;
  const entryId = encodeURIComponent(button.dataset.entryId || "");
  if (!action || !entryId) return;
  await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/entries/${entryId}/${action}`, {
    method: "POST",
    body: "{}",
  });
  await loadEntries();
}

async function saveSettings(event) {
  event.preventDefault();
  const body = {
    format: $("tournament-format").value,
    entryCap: $("tournament-entry-cap").value,
    entryKeyword: $("tournament-keyword").value.trim() || "!join",
    antiAltEnabled: $("tournament-anti-alt").checked,
  };
  await api(`/api/tournaments/${encodeURIComponent(tournament.id)}/settings`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  await loadTournament();
  if (tournament.signup_state === "open") {
    stopChat();
    await startChat();
  }
}

async function init() {
  if (!$("tournament-app")) return;
  try {
    const shell = await loadBoardShell();
    siteId = shell.activeSiteId || "";
    board = shell.board || {};
    $("tournament-settings-form")?.addEventListener("submit", (event) => {
      saveSettings(event).catch((error) => setChatStatus(error.message || "Could not save settings."));
    });
    await loadTournament();
    await startChat();
  } catch (error) {
    renderEmpty($("tournament-empty"), {
      compactHeading: true,
      title: "Tournament unavailable",
      body: error.message || "Try again in a moment.",
      actions: [{ id: "tournament-retry", label: "Try again" }],
    });
    $("tournament-empty").hidden = false;
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest?.("#tournament-primary, #tournament-create-empty, #tournament-empty-action, #tournament-retry, [data-entry-action]");
  if (!target || !$("tournament-app")) return;
  event.preventDefault();
  try {
    if (target.id === "tournament-retry") return init();
    if (target.matches("[data-entry-action]")) return await handleEntryAction(target);
    if (target.id === "tournament-create-empty") return await createTournament();
    if (target.id === "tournament-empty-action" && tournament?.signup_state === "open") {
      return $("tournament-chat-channel")?.focus();
    }
    if (target.id === "tournament-empty-action") return await handlePrimary();
    if (target.id === "tournament-primary") return await handlePrimary();
  } catch (error) {
    setChatStatus(error.message || "Action failed");
  }
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
