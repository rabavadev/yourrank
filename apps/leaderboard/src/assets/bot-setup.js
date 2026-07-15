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

// Bot setup is handled by the bot Worker dashboard; disable the old leaderboard
// connect flow and point users to the authoritative UI (C-06).
if (connectBtn) {
  connectBtn.disabled = true;
  connectBtn.textContent = "Use Bot Dashboard";
  connectBtn.addEventListener("click", () => {
    location.href = "/bot/dashboard";
  });
}
if (tokenInput) tokenInput.disabled = true;
if (statusEl) {
  statusEl.textContent = "Bot setup has moved to the Bot Dashboard.";
  statusEl.className = "msg";
}
