// Client-side script for Live Chat Keyword Listener & Giveaways
// Connects to Kick's Pusher WebSocket network in real-time

(function () {
  const PUSHER_APP_KEY = "eb1d5f283081a78b932c";
  const PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;

  // State
  let ws = null;
  let isListening = false;
  let chatroomId = null;
  let channelName = "";
  let targetKeyword = "!win";
  let entrants = []; // Array of { id, username, avatar, message, time }
  let entrantIds = new Set();
  let messagesCount = 0;
  let sessionStartTime = null;
  let timerInterval = null;
  let currentWinner = null;

  // DOM Elements
  const $ = (id) => document.getElementById(id);

  function init() {
    wireEvents();
    autoFillChannel();
  }

  async function autoFillChannel() {
    // Check if channel is saved in localStorage or from site API
    const saved = localStorage.getItem("yr_gw_channel");
    if (saved) {
      $("gw-channel-input").value = saved;
    } else {
      try {
        const res = await fetch("/api/account/details", { headers: { "Accept": "application/json" } });
        if (res.ok) {
          const data = await res.json();
          if (data.kickChannel?.name) {
            $("gw-channel-input").value = data.kickChannel.name;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  function wireEvents() {
    $("gw-setup-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      toggleListening();
    });

    $("gw-roll-btn")?.addEventListener("click", () => rollWinner());
    $("gw-reroll-btn")?.addEventListener("click", () => rollWinner());
    $("gw-dismiss-winner")?.addEventListener("click", () => {
      $("gw-winner-showcase").hidden = true;
    });

    $("gw-copy-winner")?.addEventListener("click", () => copyWinnerDetails());
    $("gw-export-btn")?.addEventListener("click", () => exportCSV());
    $("gw-clear-btn")?.addEventListener("click", () => clearEntrants());
    $("gw-clear-chat")?.addEventListener("click", () => clearChatFeed());

    $("gw-search-input")?.addEventListener("input", (e) => {
      filterEntrantsTable(e.target.value);
    });
  }

  function setStatus(state, text) {
    const badge = $("gw-status-badge");
    const statusText = $("gw-status-text");
    badge.className = `gw-status-pill gw-status--${state}`;
    statusText.textContent = text;
  }

  async function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }

  async function startListening() {
    const inputChan = $("gw-channel-input").value.trim();
    const keyword = $("gw-keyword-input").value.trim();

    if (!inputChan) {
      $("gw-setup-status").textContent = "Please enter a Kick channel name.";
      return;
    }
    if (!keyword) {
      $("gw-setup-status").textContent = "Please enter a target keyword.";
      return;
    }

    targetKeyword = keyword;
    channelName = inputChan.toLowerCase().replace(/^@/, "");
    localStorage.setItem("yr_gw_channel", channelName);

    $("gw-setup-status").textContent = "Resolving Kick chatroom…";
    setStatus("connecting", "Connecting…");

    try {
      const res = await fetch(`/api/giveaways/chatroom?channel=${encodeURIComponent(channelName)}`);
      const data = await res.json();

      if (!data.ok || !data.chatroomId) {
        $("gw-setup-status").textContent = data.error || "Could not resolve channel chatroom.";
        setStatus("error", "Error");
        return;
      }

      chatroomId = data.chatroomId;
      $("gw-setup-status").textContent = `Connected to ${data.user || channelName}'s chatroom (ID: ${chatroomId})`;
      $("gw-stat-channel-name").textContent = `@${data.user || channelName}`;

      connectWebSocket();
    } catch (err) {
      $("gw-setup-status").textContent = "Failed to connect to Kick API. Check channel name.";
      setStatus("error", "Error");
    }
  }

  function connectWebSocket() {
    if (ws) {
      try { ws.close(); } catch {}
    }

    ws = new WebSocket(PUSHER_WS_URL);

    ws.onopen = () => {
      // Subscribe to Kick chatroom channel
      const subscribeMsg = {
        event: "pusher:subscribe",
        data: {
          auth: "",
          channel: `chatrooms.${chatroomId}.v2`,
        },
      };
      ws.send(JSON.stringify(subscribeMsg));

      isListening = true;
      setStatus("live", "Live & Listening");
      $("gw-toggle-text").textContent = "Stop Listening";
      $("gw-toggle-btn").classList.remove("btn--accent");
      $("gw-toggle-btn").classList.add("btn--danger");

      // Start timer
      sessionStartTime = Date.now();
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);

      appendChatSystemMessage(`Connected to Kick chatroom (${channelName}). Listening for "${targetKeyword}"…`);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Handle Pusher heartbeat ping
        if (msg.event === "pusher:ping") {
          ws.send(JSON.stringify({ event: "pusher:pong", data: {} }));
          return;
        }

        // Handle Chat message event
        if (msg.event === "App\\Events\\ChatMessageEvent") {
          const chatData = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
          handleIncomingChatMessage(chatData);
        }
      } catch (err) {
        console.warn("[giveaway] websocket message parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[giveaway] websocket error:", err);
      setStatus("error", "WS Error");
    };

    ws.onclose = () => {
      if (isListening) {
        stopListening();
        appendChatSystemMessage("Disconnected from Kick chatroom.");
      }
    };
  }

  function stopListening() {
    isListening = false;
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
    clearInterval(timerInterval);
    setStatus("idle", "Disconnected");
    $("gw-toggle-text").textContent = "Start Listening";
    $("gw-toggle-btn").classList.add("btn--accent");
    $("gw-toggle-btn").classList.remove("btn--danger");
  }

  function handleIncomingChatMessage(chatData) {
    if (!chatData || !chatData.content || !chatData.sender) return;

    messagesCount++;
    $("gw-stat-messages").textContent = messagesCount.toLocaleString();

    const sender = chatData.sender;
    const username = sender.username || sender.slug || "Anonymous";
    const userId = String(sender.id || username);
    const content = String(chatData.content || "");
    const avatar = sender.profile_thumb || sender.profile_pic || null;

    // Check keyword matching
    const optCase = $("gw-opt-case").checked;
    const optExact = $("gw-opt-exact").checked;
    const optUnique = $("gw-opt-unique").checked;

    let isMatch = false;
    if (optCase) {
      isMatch = optExact ? content.trim() === targetKeyword : content.includes(targetKeyword);
    } else {
      const lowerContent = content.trim().toLowerCase();
      const lowerKeyword = targetKeyword.toLowerCase();
      isMatch = optExact ? lowerContent === lowerKeyword : lowerContent.includes(lowerKeyword);
    }

    // Append to live chat ticker
    appendChatFeedMessage(username, content, isMatch);

    if (isMatch) {
      if (optUnique && entrantIds.has(userId.toLowerCase())) {
        return; // Already entered
      }

      const entrant = {
        id: userId.toLowerCase(),
        username: username,
        avatar: avatar,
        message: content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        timestamp: Date.now(),
      };

      entrantIds.add(entrant.id);
      entrants.push(entrant);
      renderEntrantRow(entrant, entrants.length);
      updateEntrantsCount();
    }
  }

  function appendChatFeedMessage(username, content, isMatch) {
    const feed = $("gw-chat-feed");
    const empty = $("gw-chat-empty");
    if (empty) empty.remove();

    const row = document.createElement("div");
    row.className = `gw-chat-msg ${isMatch ? "gw-chat-msg--match" : ""}`;

    const userSpan = document.createElement("span");
    userSpan.className = "gw-chat-user";
    userSpan.textContent = username + ":";

    const textSpan = document.createElement("span");
    textSpan.className = "gw-chat-text";

    if (isMatch) {
      textSpan.innerHTML = `<mark>${escapeHtml(content)}</mark>`;
    } else {
      textSpan.textContent = ` ${content}`;
    }

    row.appendChild(userSpan);
    row.appendChild(textSpan);
    feed.appendChild(row);

    // Keep at most 80 messages in feed
    while (feed.children.length > 80) {
      feed.removeChild(feed.firstChild);
    }

    feed.scrollTop = feed.scrollHeight;
  }

  function appendChatSystemMessage(text) {
    const feed = $("gw-chat-feed");
    const empty = $("gw-chat-empty");
    if (empty) empty.remove();

    const row = document.createElement("div");
    row.className = "gw-chat-msg";
    row.style.color = "#94a3b8";
    row.style.fontStyle = "italic";
    row.textContent = `⚡ ${text}`;
    feed.appendChild(row);
    feed.scrollTop = feed.scrollHeight;
  }

  function clearChatFeed() {
    const feed = $("gw-chat-feed");
    feed.innerHTML = '<div class="gw-chat-empty" id="gw-chat-empty"><p>Chat cleared.</p></div>';
  }

  function renderEntrantRow(entrant, index) {
    const tbody = $("gw-entrants-list");
    const empty = $("gw-entrants-empty");
    if (empty) empty.hidden = true;

    const tr = document.createElement("tr");
    tr.id = `entrant-${entrant.id}`;
    tr.dataset.username = entrant.username.toLowerCase();

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

    tr.innerHTML = `
      <td class="ta-c" style="color: #64748b;">${index}</td>
      <td>
        <div class="gw-entrant-user">
          <img class="gw-entrant-avatar" src="${entrant.avatar || defaultAvatar}" alt="" onerror="this.src='${defaultAvatar}'" />
          <a class="gw-entrant-name" href="https://kick.com/${encodeURIComponent(entrant.username)}" target="_blank" rel="noopener">${escapeHtml(entrant.username)}</a>
        </div>
      </td>
      <td><span class="gw-entrant-msg">${escapeHtml(entrant.message)}</span></td>
      <td style="color: #64748b; font-size: 12px;">${entrant.time}</td>
      <td class="ta-r">
        <button class="btn btn--sm btn--ghost btn--danger-text" type="button" data-remove-id="${entrant.id}" title="Remove entrant">✕</button>
      </td>
    `;

    tr.querySelector("[data-remove-id]")?.addEventListener("click", () => {
      removeEntrant(entrant.id);
    });

    tbody.appendChild(tr);
  }

  function removeEntrant(id) {
    entrantIds.delete(id);
    entrants = entrants.filter((e) => e.id !== id);
    const tr = $(`entrant-${id}`);
    if (tr) tr.remove();
    updateEntrantsCount();
    reindexTable();
  }

  function reindexTable() {
    const rows = $("gw-entrants-list")?.querySelectorAll("tr") || [];
    rows.forEach((row, idx) => {
      const firstCol = row.querySelector("td");
      if (firstCol) firstCol.textContent = idx + 1;
    });
  }

  function updateEntrantsCount() {
    const count = entrants.length;
    $("gw-stat-entrants").textContent = count.toLocaleString();
    $("gw-table-count").textContent = count.toLocaleString();

    const rollBtn = $("gw-roll-btn");
    const exportBtn = $("gw-export-btn");
    const clearBtn = $("gw-clear-btn");
    const emptyState = $("gw-entrants-empty");

    if (count > 0) {
      rollBtn.removeAttribute("disabled");
      exportBtn.removeAttribute("disabled");
      clearBtn.removeAttribute("disabled");
      if (emptyState) emptyState.hidden = true;
    } else {
      rollBtn.setAttribute("disabled", "true");
      exportBtn.setAttribute("disabled", "true");
      clearBtn.setAttribute("disabled", "true");
      if (emptyState) emptyState.hidden = false;
    }
  }

  function clearEntrants() {
    if (!confirm("Are you sure you want to clear all giveaway entrants?")) return;
    entrants = [];
    entrantIds.clear();
    $("gw-entrants-list").innerHTML = "";
    updateEntrantsCount();
    $("gw-winner-showcase").hidden = true;
  }

  function filterEntrantsTable(query) {
    const term = query.toLowerCase().trim();
    const rows = $("gw-entrants-list")?.querySelectorAll("tr") || [];
    rows.forEach((row) => {
      const username = row.dataset.username || "";
      row.hidden = term ? !username.includes(term) : false;
    });
  }

  function rollWinner() {
    if (entrants.length === 0) return;

    const rollBtn = $("gw-roll-btn");
    const roller = $("gw-roller");
    const track = $("gw-roller-track");
    const showcase = $("gw-winner-showcase");

    rollBtn.setAttribute("disabled", "true");
    showcase.hidden = true;
    roller.hidden = false;

    // Fast-cycle suspense names for 2.2 seconds
    let count = 0;
    const interval = setInterval(() => {
      const randomCandidate = entrants[Math.floor(Math.random() * entrants.length)];
      track.textContent = randomCandidate.username;
      count++;
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      roller.hidden = true;
      rollBtn.removeAttribute("disabled");

      // Cryptographically secure winner selection
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const winnerIndex = array[0] % entrants.length;
      const winner = entrants[winnerIndex];
      currentWinner = winner;

      displayWinner(winner);
      playWinnerSound();
    }, 2200);
  }

  function displayWinner(winner) {
    const showcase = $("gw-winner-showcase");
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

    $("gw-winner-name").textContent = winner.username;
    $("gw-winner-msg").textContent = `"${winner.message}"`;
    $("gw-winner-time").textContent = `Entered at ${winner.time}`;
    $("gw-winner-avatar").src = winner.avatar || defaultAvatar;

    showcase.hidden = false;
    showcase.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function copyWinnerDetails() {
    if (!currentWinner) return;
    const text = `🎉 Giveaway Winner: ${currentWinner.username}\nMessage: "${currentWinner.message}"\nTime: ${currentWinner.time}\nKick Profile: https://kick.com/${currentWinner.username}`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = $("gw-copy-winner");
      const orig = btn.textContent;
      btn.textContent = "Copied! ✓";
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }

  function exportCSV() {
    if (entrants.length === 0) return;

    let csv = "Index,Kick Username,Chat Message,Entered At,Kick Profile URL\n";
    entrants.forEach((e, idx) => {
      const cleanMsg = `"${e.message.replace(/"/g, '""')}"`;
      csv += `${idx + 1},${e.username},${cleanMsg},${e.time},https://kick.com/${e.username}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kick-giveaway-entrants-${channelName || "stream"}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function updateTimer() {
    if (!sessionStartTime) return;
    const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const secs = String(elapsedSec % 60).padStart(2, "0");
    $("gw-stat-time").textContent = `${mins}:${secs}`;
  }

  function playWinnerSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumphant chord
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.6);
      });
    } catch {}
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s] || s)
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
