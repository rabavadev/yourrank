/* Bot setup wizard — walks streamers through connecting a Telegram bot. */
const $ = (id) => document.getElementById(id);
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

const steps = document.querySelectorAll(".step");
const nextBtns = document.querySelectorAll("[data-next]");
const tokenInput = $("botToken");
const tokenToggle = $("tokenToggle");
const connectBtn = $("connectBtn");
const statusEl = $("connectStatus");
const step4 = $("step4");
const botNameEl = $("botName");
const botUsernameEl = $("botUsername");

// Wire up "Next" buttons
nextBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.next;
    const el = $(target);
    if (el) {
      el.hidden = false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      btn.disabled = true;
      btn.textContent = "Done ✓";
    }
  });
});

// Enable connect button when token is pasted
tokenInput.addEventListener("input", () => {
  connectBtn.disabled = tokenInput.value.trim().length < 20;
});

// Toggle token visibility
if (tokenToggle) {
  tokenToggle.addEventListener("click", () => {
    const hidden = tokenInput.type === "password";
    tokenInput.type = hidden ? "text" : "password";
    tokenToggle.textContent = hidden ? "Hide" : "Show";
    tokenToggle.setAttribute("aria-label", hidden ? "Hide token" : "Show token");
  });
}

// Connect bot
connectBtn.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) return;

  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting…";
  statusEl.textContent = "";
  statusEl.className = "hint";

  try {
    const res = await fetch("/api/bot/connect", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      statusEl.textContent = "✅ Connected! Webhook is live.";
      statusEl.className = "msg";
      step4.hidden = false;
      if (data.botName) botNameEl.textContent = data.botName;
      if (data.botUsername) botUsernameEl.textContent = "@" + data.botUsername;
      step4.scrollIntoView({ behavior: "smooth", block: "start" });
      connectBtn.textContent = "Connected ✓";
      connectBtn.disabled = true;
      tokenInput.disabled = true;
      // E2E-013: Show "Change bot" link so user can reconnect a different bot
      let changeLink = document.getElementById("changeBotLink");
      if (!changeLink) {
        changeLink = document.createElement("a");
        changeLink.id = "changeBotLink";
        changeLink.href = "#";
        changeLink.textContent = "Change bot";
        changeLink.className = "change-bot-link";
        connectBtn.parentNode.insertBefore(changeLink, connectBtn.nextSibling);
      }
      changeLink.hidden = false;
      changeLink.onclick = (e) => {
        e.preventDefault();
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect bot";
        tokenInput.value = "";
        tokenInput.disabled = false;
        statusEl.textContent = "";
        statusEl.className = "hint";
        step4.hidden = true;
        changeLink.hidden = true;
        tokenInput.focus();
      };
    } else {
      statusEl.textContent = data.error || "Connection failed. Check the token and try again.";
      statusEl.className = "err";
      connectBtn.textContent = "Connect bot";
      connectBtn.disabled = false;
    }
  } catch {
    statusEl.textContent = "Network error. Try again.";
    statusEl.className = "err";
    connectBtn.textContent = "Connect bot";
    connectBtn.disabled = false;
  }
});
