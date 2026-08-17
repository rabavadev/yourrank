import { $, getCsrf, guardAuth, logError, showToast } from "./utils.js";
import { setState, state, subscribe } from "./state.js";
import { DEFAULT_SECTIONS, isPro } from "./site.js";
import { renderError, setBlockLoading, setBlockReady } from "./states.js";

const GAME_ROWS = [
  { key: "plinko", label: "Plinko", description: "A pachinko-style game with multiplier rewards." },
  { key: "mines", label: "Mines", description: "Reveal safe tiles and avoid the mines." },
  { key: "dice", label: "Dice", description: "Roll the dice and predict the outcome." },
  { key: "limbo", label: "Limbo", description: "Coming soon", disabled: true },
];

const sectionRows = [
  ["shop", "Shop", "Let viewers browse and redeem your shop items.", "Turning off removes Shop from navigation and disables the /shop URL."],
  ["credits", "Credits", "Let viewers see their balance and redemption history.", "Turning off removes Credits from navigation and disables the /credits URL."],
  ["games", "Games", "Let viewers play credit-based games on your board.", "Turning off removes Games from navigation and disables the /games URL."],
];

const BLOCK_ROWS = [
  ["hero", "Hero banner"],
  ["top3", "Top 3 podium"],
  ["search", "Search & Filter"],
  ["rules", "Rules marquee"],
  ["socials", "Social widgets"],
  ["share", "Share button"],
  ["countdown", "Countdown timer"],
  ["cta", "Call to action"],
];

function renderPageBlocks() {
  const list = $("leaderboardBlockRows");
  const note = $("leaderboardBlockNote");
  if (!list) return;
  const current = { ...DEFAULT_SECTIONS, ...(state.EXTRA?.sections || {}) };
  list.innerHTML = BLOCK_ROWS.map(([key, label]) => `<label><span>${label}</span><input class="v3-toggle" type="checkbox" ${current[key] !== false ? "checked" : ""} disabled aria-disabled="true" /></label>`).join("");
  if (note) note.textContent = isPro()
    ? "Edit page blocks in the Design editor."
    : "Page block visibility is available on Pro plans. Current board settings are shown.";
}

function siteSections() {
  const incoming = state.EXTRA?.siteSections || {};
  return {
    shop: incoming.shop !== false,
    credits: incoming.me !== false,
    games: incoming.games === true,
  };
}

export function setGamesPreviewState(previewBtn, enabled, liveUrl) {
  if (!previewBtn) return;
  if (enabled && liveUrl) {
    previewBtn.href = liveUrl;
    previewBtn.setAttribute("target", "_blank");
    previewBtn.setAttribute("rel", "noopener noreferrer");
    previewBtn.textContent = "Open on Public Site ↗";
    previewBtn.removeAttribute("aria-disabled");
    previewBtn.removeAttribute("role");
    previewBtn.removeAttribute("tabindex");
    previewBtn.removeAttribute("title");
    return;
  }
  previewBtn.removeAttribute("href");
  previewBtn.removeAttribute("target");
  previewBtn.removeAttribute("rel");
  previewBtn.setAttribute("role", "button");
  previewBtn.setAttribute("aria-disabled", "true");
  previewBtn.setAttribute("tabindex", "0");
  previewBtn.setAttribute("title", "Enable the Games section below to open the public Games page.");
  previewBtn.textContent = "Games unavailable";
}

function renderSections() {
  const list = $("gamesSectionRows");
  if (!list) return;
  const current = siteSections();
  list.innerHTML = `
    <div class="v3-setting-row">
      <div><strong>Home &amp; Leaderboard</strong><span>Core experience. Always visible.</span></div>
      <span class="v3-chip v3-chip--always">ALWAYS ON</span>
    </div>
    ${sectionRows.map(([key, title, description, note]) => `
      <label class="v3-setting-row" data-site-section-row="${key}">
        <span><strong>${title}</strong><span>${description} ${note}</span><small class="v3-inline-save" data-section-status="${key}" role="status" aria-live="polite"></small></span>
        <input class="v3-toggle" type="checkbox" data-site-section="${key}" ${current[key] ? "checked" : ""} aria-label="Enable ${title}">
      </label>
    `).join("")}`;
  list.querySelectorAll("[data-site-section]").forEach((input) => {
    input.addEventListener("change", () => saveSection(input));
  });
}

function setInlineSave(input, message, isError = false) {
  const status = input.closest("[data-site-section-row], [data-game]")?.querySelector("[data-section-status], [data-game-status]");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : message === "Saving…" ? "saving" : "saved";
}

async function saveSection(input) {
  const previous = !input.checked;
  const next = { ...siteSections(), [input.dataset.siteSection]: input.checked };
  input.disabled = true;
  setInlineSave(input, "Saving…");
  try {
    const res = await fetch("/api/site/sections", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId: state.ACTIVE_SITE_ID, siteSections: next }),
    }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not save viewer pages.");
    state.EXTRA.siteSections = { ...state.EXTRA.siteSections, shop: next.shop, games: next.games, me: next.credits };
    updateSimulator();
    setInlineSave(input, "Saved");
    showToast("Public page sections saved.", "success");
  } catch (err) {
    input.checked = previous;
    setInlineSave(input, "Couldn't save", true);
    logError("save-site-sections", err);
    showToast(err.message || "Could not save viewer pages.");
  } finally {
    input.disabled = false;
  }
}

function gamePayload(game, values) {
  return {
    siteId: state.ACTIVE_SITE_ID,
    game,
    enabled: !!values.enabled,
    minBet: Number(values.minBet) || 1,
    maxBet: Number(values.maxBet) || 1,
    houseEdgeBps: Number.isInteger(Number(values.houseEdgeBps)) ? Number(values.houseEdgeBps) : 100,
    dailyLossCap: values.dailyLossCap == null ? null : Number(values.dailyLossCap),
  };
}

async function saveGame(game, values, changedInput = null, previousValue = null, retryValues = values) {
  if (!state.ACTIVE_SITE_ID) return false;
  try {
    const res = await fetch("/api/site/games/settings", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify(gamePayload(game, values)),
    }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not save game settings.");
    if (changedInput) {
      changedInput.dataset.previous = changedInput.type === "checkbox" ? String(changedInput.checked) : changedInput.value;
      changedInput.dataset.saveError = "";
      setInlineSave(changedInput, "Saved");
      changedInput.closest("[data-game]")?.querySelector(".v3-inline-error")?.remove();
    }
    showToast("Game settings saved.", "success");
    return true;
  } catch (err) {
    logError("save-game-settings", err);
    if (changedInput) {
      const prior = previousValue ?? changedInput.dataset.previous ?? (changedInput.type === "checkbox" ? "false" : "");
      if (changedInput.type === "checkbox") changedInput.checked = prior === "true";
      else changedInput.value = prior;
      changedInput.dataset.saveError = err.message || "Could not save game settings.";
      setInlineSave(changedInput, "Couldn't save", true);
      const row = changedInput.closest("[data-game]");
      let error = row?.querySelector(".v3-inline-error");
      if (!error && row) {
        error = document.createElement("span");
        error.className = "v3-inline-error";
        row.querySelector(".v3-game-details")?.appendChild(error);
      }
      if (error) {
        error.textContent = err.message || "Could not save game settings.";
        error.setAttribute("role", "alert");
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "btn btn--xs btn--ghost";
        retry.textContent = "Retry";
        retry.addEventListener("click", () => {
          if (changedInput.type === "checkbox") changedInput.checked = !!retryValues.enabled;
          else changedInput.value = String(retryValues.maxBet ?? "");
          error.textContent = "Retrying…";
          saveGame(game, retryValues, changedInput, prior, retryValues);
        });
        error.append(" ", retry);
      }
    }
    showToast(err.message || "Could not save game settings.");
    return false;
  }
}

function renderGames(settings) {
  const list = $("gameSettingRows");
  if (!list) return;
  const byGame = new Map((settings || []).map((row) => [row.game, row]));
  list.innerHTML = GAME_ROWS.map((game) => {
    const row = byGame.get(game.key) || { enabled: false, minBet: 1, maxBet: "" , houseEdgeBps: 100, dailyLossCap: null };
    const disabled = game.disabled ? "disabled" : "";
    const details = game.disabled
      ? `<span class="v3-game-coming">Coming soon</span>`
      : `<div class="v3-game-controls" ${row.enabled ? "" : "hidden"}>
          <span class="v3-game-max"><label for="gameMax-${game.key}">Max Bet</label><input id="gameMax-${game.key}" class="v3-number-input" type="number" min="1" step="1" inputmode="numeric" placeholder="100" value="${row.maxBet || ""}" data-game-max="${game.key}" /><span>cr</span></span>
          <button type="button" class="btn btn--xs btn--ghost v3-game-test-btn" data-test-game="${game.key}">Test in Simulator 🎮</button>
        </div>`;
    return `<div class="v3-game-row ${game.disabled ? "is-disabled" : ""}" data-game="${game.key}">
      <div class="v3-game-main"><div><strong>${game.label}</strong><span>${game.description}</span><small class="v3-inline-save" data-game-status="${game.key}" role="status" aria-live="polite"></small></div><input class="v3-toggle" type="checkbox" data-game-toggle="${game.key}" ${row.enabled ? "checked" : ""} ${disabled} aria-label="Enable ${game.label}"></div>
      <div class="v3-game-details">${details}</div>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-game-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const game = input.dataset.gameToggle;
      const row = byGame.get(game) || { minBet: 1, maxBet: 1, houseEdgeBps: 100, dailyLossCap: null };
      const details = input.closest("[data-game]")?.querySelector(".v3-game-controls");
      if (details) details.hidden = !input.checked;
      setInlineSave(input, "Saving…");
      const previousValue = input.checked ? "false" : "true";
      saveGame(game, { ...row, enabled: input.checked }, input, previousValue);
    });
  });
  list.querySelectorAll("[data-game-max]").forEach((input) => {
    let timer;
    input.dataset.previous = input.value;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const game = input.dataset.gameMax;
        const row = byGame.get(game) || { enabled: false, minBet: 1, houseEdgeBps: 100, dailyLossCap: null };
        const maxBet = Number(input.value);
        if (!Number.isInteger(maxBet) || maxBet <= 0) {
          input.setCustomValidity("Enter a positive whole number.");
          return;
        }
        input.setCustomValidity("");
        setInlineSave(input, "Saving…");
        const previousValue = input.dataset.previous ?? input.value;
        saveGame(game, { ...row, maxBet }, input, previousValue, { ...row, maxBet });
      }, 350);
    });
  });
}

async function loadGames() {
  if (!state.ACTIVE_SITE_ID) return;
  setState({ GAMES_STATUS: "loading" });
  setBlockLoading($("gameSettingRows"), { lines: GAME_ROWS.length });
  try {
    const res = await fetch(`/api/site/games/settings?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}`, { credentials: "include" }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not load game settings.");
    setState({ GAMES_STATUS: "ready" });
    const settings = body.settings || [];
    const list = $("gameSettingRows");
    setBlockReady(list);
    renderGames(settings);
    updateSimulator();
  } catch (err) {
    setState({ GAMES_STATUS: "error" });
    logError("load-game-settings", err);
    renderError($("gameSettingRows"), { title: "Couldn't load game settings", body: "Your game settings could not be loaded.", retry: loadGames });
  }
}

let activeSimulatorGame = "mines";

/**
 * Point the simulator frame at `url` without touching the browser history:
 * assigning `src` appends an entry to the joint session history, which pollutes
 * Back and truncates the forward stack, so navigate the frame in place.
 */
function loadSimulatorFrame(iframe, url) {
  const frameWindow = iframe.contentWindow;
  if (!frameWindow || typeof frameWindow.location?.replace !== "function") return;
  frameWindow.location.replace(url);
}

function setSimulatorGame(gameId) {
  activeSimulatorGame = gameId || "mines";
  const siteId = state.ACTIVE_SITE_ID || "";
  const slug = state.SLUG || state.EXTRA?.slug || "";
  const iframe = $("gamesSimulatorIframe");
  const popout = $("gamesPopoutLink");
  const previewBtn = $("gamesPreviewBtn");

  const embedUrl = siteId
    ? `/dashboard/preview?board=${encodeURIComponent(siteId)}&section=games&demo=1&embed=1&game=${encodeURIComponent(activeSimulatorGame)}`
    : (slug ? `/${encodeURIComponent(slug)}/games?demo=1&embed=1&game=${encodeURIComponent(activeSimulatorGame)}` : "");
  const liveUrl = slug ? `/${encodeURIComponent(slug)}/games` : "#";

  if (iframe && embedUrl) {
    if (iframe.dataset.currentSrc !== embedUrl) {
      iframe.dataset.currentSrc = embedUrl;
      loadSimulatorFrame(iframe, embedUrl);
    }
  }
  if (popout && embedUrl) popout.href = embedUrl;
  setGamesPreviewState(previewBtn, siteSections().games && Boolean(slug), liveUrl);

  document.querySelectorAll("[data-preview-game]").forEach((tab) => {
    const isCurrent = tab.dataset.previewGame === activeSimulatorGame;
    tab.classList.toggle("is-active", isCurrent);
    tab.setAttribute("aria-selected", String(isCurrent));
  });
}

function updateSimulator() {
  setSimulatorGame(activeSimulatorGame);
}

function setupSimulator() {
  if (setupSimulator._wired) return;
  setupSimulator._wired = true;

  subscribe((keys) => {
    if (keys.includes("SLUG") || keys.includes("ACTIVE_SITE_ID") || keys.includes("GAMES_STATUS")) {
      updateSimulator();
    }
  });

  document.querySelectorAll("[data-preview-game]").forEach((tab) => {
    tab.addEventListener("click", () => {
      setSimulatorGame(tab.dataset.previewGame);
    });
  });

  const resetBtn = $("gamesResetDemo");
  resetBtn?.addEventListener("click", () => {
    const iframe = $("gamesSimulatorIframe");
    if (iframe && iframe.dataset.currentSrc) {
      loadSimulatorFrame(iframe, iframe.dataset.currentSrc + "&_t=" + Date.now());
      showToast("Demo balance reset to 2,500 credits", "success");
    }
  });

  document.addEventListener("click", (e) => {
    const testBtn = e.target.closest("[data-test-game]");
    if (!testBtn) return;
    const game = testBtn.getAttribute("data-test-game");
    if (game) {
      setSimulatorGame(game);
      $("gamesSimulatorIframe")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

export function initGames() {
  if (initGames._wired) return;
  initGames._wired = true;
  renderSections();
  renderPageBlocks();
  setBlockLoading($("gameSettingRows"), { lines: GAME_ROWS.length });
  loadGames();
  setupSimulator();
  updateSimulator();
  window.addEventListener("yr-games-visible", () => {
    renderSections();
    renderPageBlocks();
    loadGames();
    updateSimulator();
  });
}
