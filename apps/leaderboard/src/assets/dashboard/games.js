import { $, getCsrf, guardAuth, logError, showToast } from "./utils.js";
import { state } from "./state.js";
import { DEFAULT_SECTIONS, isPro } from "./site.js";

const GAME_ROWS = [
  { key: "plinko", label: "Plinko", description: "A pachinko-style game with multiplier rewards." },
  { key: "mines", label: "Mines", description: "Reveal safe tiles and avoid the mines." },
  { key: "dice", label: "Dice", description: "Roll the dice and predict the outcome." },
  { key: "limbo", label: "Limbo", description: "Coming soon", disabled: true },
];

const sectionRows = [
  ["shop", "Shop", "Let viewers browse and redeem your credit rewards.", "Turning off removes Shop from navigation and disables the /shop URL."],
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
    ? "Edit block visibility in the Page design editor."
    : "Block visibility is available on Pro plans. Current board settings are shown.";
}

function siteSections() {
  const incoming = state.EXTRA?.siteSections || {};
  return {
    shop: incoming.shop !== false,
    credits: incoming.me !== false,
    games: incoming.games === true,
  };
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
      <label class="v3-setting-row">
        <span><strong>${title}</strong><span>${description} ${note}</span></span>
        <input class="v3-toggle" type="checkbox" data-site-section="${key}" ${current[key] ? "checked" : ""} aria-label="Enable ${title}">
      </label>
    `).join("")}`;
  list.querySelectorAll("[data-site-section]").forEach((input) => {
    input.addEventListener("change", () => saveSection(input));
  });
}

async function saveSection(input) {
  const previous = !input.checked;
  const next = { ...siteSections(), [input.dataset.siteSection]: input.checked };
  input.disabled = true;
  try {
    const res = await fetch("/api/site/sections", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId: state.ACTIVE_SITE_ID, siteSections: next }),
    }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not save site sections.");
    state.EXTRA.siteSections = { ...state.EXTRA.siteSections, shop: next.shop, games: next.games, me: next.credits };
    showToast("Site sections saved.", "success");
  } catch (err) {
    input.checked = previous;
    logError("save-site-sections", err);
    showToast(err.message || "Could not save site sections.");
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

async function saveGame(game, values, changedInput = null) {
  if (!state.ACTIVE_SITE_ID) return;
  try {
    const res = await fetch("/api/site/games/settings", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify(gamePayload(game, values)),
    }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not save game settings.");
    showToast("Game settings saved.", "success");
  } catch (err) {
    logError("save-game-settings", err);
    if (changedInput) changedInput.value = changedInput.dataset.previous || changedInput.value;
    showToast(err.message || "Could not save game settings.");
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
      : `<span class="v3-game-max" ${row.enabled ? "" : "hidden"}><label for="gameMax-${game.key}">Max Bet</label><input id="gameMax-${game.key}" class="v3-number-input" type="number" min="1" step="1" inputmode="numeric" placeholder="100" value="${row.maxBet || ""}" data-game-max="${game.key}" /><span>cr</span></span>`;
    return `<div class="v3-game-row ${game.disabled ? "is-disabled" : ""}" data-game="${game.key}">
      <div class="v3-game-main"><div><strong>${game.label}</strong><span>${game.description}</span></div><input class="v3-toggle" type="checkbox" data-game-toggle="${game.key}" ${row.enabled ? "checked" : ""} ${disabled} aria-label="Enable ${game.label}"></div>
      <div class="v3-game-details">${details}</div>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-game-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const game = input.dataset.gameToggle;
      const row = byGame.get(game) || { minBet: 1, maxBet: 1, houseEdgeBps: 100, dailyLossCap: null };
      const details = input.closest("[data-game]")?.querySelector(".v3-game-max");
      if (details) details.hidden = !input.checked;
      saveGame(game, { ...row, enabled: input.checked }, input);
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
        saveGame(game, { ...row, maxBet }, input);
        input.dataset.previous = input.value;
      }, 350);
    });
  });
}

async function loadGames() {
  if (!state.ACTIVE_SITE_ID) return;
  try {
    const res = await fetch(`/api/site/games/settings?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}`, { credentials: "include" }).then(guardAuth);
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Could not load game settings.");
    renderGames(body.settings || []);
  } catch (err) {
    logError("load-game-settings", err);
    const list = $("gameSettingRows");
    if (list) list.innerHTML = `<p class="v3-inline-error">Couldn't load game settings.</p>`;
  }
}

export function initGames() {
  if (initGames._wired) return;
  initGames._wired = true;
  renderSections();
  renderPageBlocks();
  renderGames([]);
  loadGames();
  window.addEventListener("yr-games-visible", () => {
    renderSections();
    renderPageBlocks();
    loadGames();
  });
}
