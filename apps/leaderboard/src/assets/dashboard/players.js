// Player table, CSV/paste import, and row management.
import { $, esc, logError, parseAmount, showConfirmModal } from "./utils.js";
import { state, markDirty } from "./state.js";

/**
 * Commit a change to the in-memory draft through one path. markDirty() keeps
 * the save bar and preview in sync; the status region is the existing live
 * announcement surface for the result.
 */
export function commitDraftMutation(mutation, message = "Changes made. Save to publish.") {
  const result = typeof mutation === "function" ? mutation() : undefined;
  markDirty();
  if (message) {
    const status = $("status");
    if (status) {
      status.textContent = typeof message === "function" ? message(result) : message;
      status.hidden = false;
      status.setAttribute("aria-live", "polite");
    }
  }
  return result;
}

function currencySymbol() {
  return String($("f_currency")?.value || "$").trim().slice(0, 6) || "$";
}

function formatMoney(value) {
  const amount = parseAmount(value);
  return `${currencySymbol()}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showMoneyValue(input) {
  const raw = input.value.trim();
  if (raw) input.value = formatMoney(raw);
}

function showMoneyEditor(input) {
  if (!input.value.trim()) return;
  input.value = String(parseAmount(input.value));
  input.select();
}

function wireMoneyInput(input) {
  input.addEventListener("focus", () => showMoneyEditor(input));
  input.addEventListener("blur", () => showMoneyValue(input));
  showMoneyValue(input);
}

export function playerRow(p = { name: "", wagered: "", prize: "", score: "", hands: "", netProfit: "", winRate: "", change: "" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td class="sel"><input type="checkbox" class="row-sel" title="Select" aria-label="Select player" /></td>
    <td class="rank"></td>
    <td><input class="p-name" placeholder="Player name" title="${esc(p.name)}" value="${esc(p.name)}"></td>
    <td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td>
    <td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td>
    <td class="num col-score" hidden><input class="p-score" inputmode="decimal" placeholder="0" value="${esc(p.score)}"></td>
    <td class="num col-hands" hidden><input class="p-hands" inputmode="decimal" placeholder="0" value="${esc(p.hands)}"></td>
    <td class="num col-net" hidden><input class="p-net-profit" inputmode="decimal" placeholder="0" value="${esc(p.netProfit)}"></td>
    <td class="num col-win" hidden><input class="p-win-rate" inputmode="decimal" placeholder="0" value="${esc(p.winRate)}"></td>
    <td class="num col-change" hidden><input class="p-change" inputmode="decimal" placeholder="0" value="${esc(p.change)}"></td>
    <td class="act"><button class="row-edit" title="Edit player" aria-label="Edit player" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button><button class="row-x" title="Remove" aria-label="Remove player" type="button">×</button></td>`;
  tr.querySelector(".row-edit").addEventListener("click", () => {
    const name = tr.querySelector(".p-name");
    name?.focus();
    name?.select();
  });
  tr.querySelector(".p-name")?.addEventListener("input", (event) => {
    event.currentTarget.title = event.currentTarget.value;
  });
  tr.querySelector(".row-x").addEventListener("click", async () => {
    const name = tr.querySelector(".p-name")?.value.trim() || "this player";
    if (!await showConfirmModal("Remove player", `Remove ${name}? You can restore it only by re-adding it before saving.`, "Remove", true)) return;
    commitDraftMutation(() => {
      tr.remove();
      renumber();
      toggleEmpty();
      syncSelectAll();
    }, `${name} removed. Save to publish.`);
  });
  // Wire spreadsheet-style keyboard navigation (ArrowDown, ArrowUp, Enter)
  tr.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || (e.key === "Enter" && !e.shiftKey)) {
        const nextTr = tr.nextElementSibling;
        if (nextTr) {
          const className = Array.from(inp.classList).find((c) => c.startsWith("p-"));
          if (className) {
            e.preventDefault();
            nextTr.querySelector(`.${className}`)?.focus();
          }
        }
      } else if (e.key === "ArrowUp") {
        const prevTr = tr.previousElementSibling;
        if (prevTr) {
          const className = Array.from(inp.classList).find((c) => c.startsWith("p-"));
          if (className) {
            e.preventDefault();
            prevTr.querySelector(`.${className}`)?.focus();
          }
        }
      }
    });
  });

  wireMoneyInput(tr.querySelector(".p-wager"));
  wireMoneyInput(tr.querySelector(".p-prize"));
  return tr;
}

const FIELD_COLS = {
  score: "col-score",
  hands: "col-hands",
  netProfit: "col-net",
  winRate: "col-win",
  change: "col-change",
};
function syncColumnDropdown(fields) {
  const merged = { ...state.EXTRA?.playerFields, ...(fields || {}) };
  $("colMenu")?.querySelectorAll("[data-col]").forEach((cb) => {
    cb.checked = merged[cb.dataset.col] !== false;
  });
}

export function applyPlayerFieldVisibility(fields) {
  const table = $("rows")?.closest("table");
  const merged = { ...state.EXTRA?.playerFields, ...(fields || {}) };
  for (const [key, cls] of Object.entries(FIELD_COLS)) {
    const shown = merged[key] !== false;
    table?.querySelectorAll(`.${cls}`).forEach((el) => { el.hidden = !shown; });
  }
  syncColumnDropdown(merged);
}

export function renderPlayers(list) {
  const b = $("rows");
  b.innerHTML = "";
  currentPage = 1;
  const frag = document.createDocumentFragment();
  list.forEach((p) => frag.appendChild(playerRow(p)));
  b.appendChild(frag);
  renumber();
  toggleEmpty();
  applyPlayerFieldVisibility();
  syncSelectAll();
}

export function renumber() {
  const rows = [...$("rows").children];
  rows.forEach((tr, i) => tr.querySelector(".rank").textContent = String(i + 1));
  const n = rows.length;
  const limit = state.ME?.limits?.players ?? 25;
  const pCount = $("pCount");
  if (pCount) pCount.textContent = String(n);
  const pLimit = $("pLimit");
  if (pLimit) pLimit.textContent = String(limit);
  const hint = $("limitHint");
  if (hint) hint.textContent = n >= limit ? "Limit reached" : (n >= Math.floor(limit * 0.8) ? "Approaching limit" : "");
  const upgrade = $("playerLimitUpgrade");
  if (upgrade) upgrade.hidden = n < Math.max(1, Math.floor(limit * 0.8));
  applyRowVisibility();
}

export function toggleEmpty() {
  const empty = $("rows").children.length === 0;
  const controls = document.querySelector(".v3-players-bar");
  if (controls) controls.hidden = empty;
  const archiveForm = document.querySelector(".arch-form");
  if (archiveForm) archiveForm.hidden = empty;
  if ($("playersEmpty")) $("playersEmpty").hidden = !empty;
  if ($("playersTableWrap")) $("playersTableWrap").hidden = empty;
  if ($("playersFoot")) $("playersFoot").hidden = empty;
  if ($("playerSort")) $("playerSort").hidden = empty;
  if (empty) $("selectAll") && ($("selectAll").checked = false);
}

// Live re-sort the player table as wagered numbers change, with a tiny
// FLIP-style translate animation so the operator sees the row move.
let sortTimer;
let currentPage = 1;
const PAGE_SIZE = 10;

function sortRows() {
  const rowsEl = $("rows");
  if (!rowsEl) return;
  const before = new Map();
  for (const row of rowsEl.children) before.set(row, row.getBoundingClientRect().top);
  const rowsArr = [...rowsEl.children];
  const sort = $("playerSort")?.value || "wagered";
  rowsArr.sort((a, b) => {
    if (sort === "name") {
      return a.querySelector(".p-name").value.localeCompare(b.querySelector(".p-name").value, undefined, { sensitivity: "base" });
    }
    const selector = sort === "prize" ? ".p-prize" : ".p-wager";
    const av = parseAmount(a.querySelector(selector).value);
    const bv = parseAmount(b.querySelector(selector).value);
    if (bv !== av) return bv - av;
    if (sort !== "prize") {
      const ap = parseAmount(a.querySelector(".p-prize").value);
      const bp = parseAmount(b.querySelector(".p-prize").value);
      if (bp !== ap) return bp - ap;
    }
    return a.querySelector(".p-name").value.localeCompare(b.querySelector(".p-name").value, undefined, { sensitivity: "base" });
  });
  
  let isSorted = true;
  for (let i = 0; i < rowsArr.length; i++) {
    if (rowsArr[i] !== rowsEl.children[i]) { isSorted = false; break; }
  }
  if (isSorted) return;

  const activeEl = document.activeElement;
  let activeData = null;
  if (activeEl && rowsEl.contains(activeEl)) {
    const tr = activeEl.closest("tr");
    activeData = { tr, cls: activeEl.className.split(" ")[0] };
  }

  rowsArr.forEach((row) => rowsEl.appendChild(row));
  renumber();

  if (activeData && activeData.tr) {
    const input = activeData.tr.querySelector("." + activeData.cls);
    if (input) {
      input.focus();
      // Restore cursor position if it's an input
      if (typeof input.selectionStart === "number") {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  }
  const after = new Map();
  for (const row of rowsArr) after.set(row, row.getBoundingClientRect().top);
  for (const row of rowsArr) {
    const dy = (before.get(row) || after.get(row) || 0) - (after.get(row) || before.get(row) || 0);
    if (dy) { row.style.transform = `translateY(${dy}px)`; row.style.transition = "none"; }
  }
  requestAnimationFrame(() => {
    for (const row of rowsArr) { row.style.transition = "transform 0.2s ease"; row.style.transform = ""; }
  });
  applyRowVisibility();
}

function onSortableInput() {
  if (($("playerSort")?.value || "wagered") !== "wagered") return;
  clearTimeout(sortTimer);
  sortTimer = setTimeout(sortRows, 200);
}

$("rows")?.addEventListener("input", (e) => {
  if (e.target && e.target.classList && (e.target.classList.contains("p-wager") || e.target.classList.contains("p-prize"))) {
    onSortableInput();
  }
});

$("addRow")?.addEventListener("click", () => {
  if (state.ME && $("rows").children.length >= state.ME.limits.players && state.ME.limits.players < 999) {
    const planNames = { free: "Free", starter: "Starter", pro: "Pro" };
    const msg = state.ME.plan === "pro" || state.ME.plan === "agency"
      ? `Your plan allows up to ${state.ME.limits.players} players.`
      : `${planNames[state.ME.plan] || "Your"} plan allows ${state.ME.limits.players} players. Upgrade for more.`;
    const el = $("limitMsg") || $("status");
    el.textContent = msg;
    setTimeout(() => el.textContent = "", 5000);
    return;
  }
  commitDraftMutation(() => {
    $("rows").appendChild(playerRow());
    renumber();
    toggleEmpty();
    applyPlayerFieldVisibility();
  }, "Player added. Save to publish.");
});

function addQuickRow() {
  const name = $("qa_name").value.trim();
  if (!name) return;
  if (state.ME && $("rows").children.length >= state.ME.limits.players && state.ME.limits.players < 999) {
    const el = $("limitMsg") || $("status");
    el.textContent = "Player limit reached. Upgrade to add more.";
    setTimeout(() => el.textContent = "", 5000);
    return;
  }
  const wagered = parseFloat($("qa_wager").value.replace(/[$,\s]/g, "")) || 0;
  const prize = parseFloat($("qa_prize").value.replace(/[$,\s]/g, "")) || 0;
  commitDraftMutation(() => {
    $("rows").appendChild(playerRow({ name, wagered, prize }));
    $("qa_name").value = "";
    $("qa_wager").value = "";
    $("qa_prize").value = "";
    renumber();
    toggleEmpty();
    applyPlayerFieldVisibility();
  }, `${name} added. Save to publish.`);
}

$("qa_add")?.addEventListener("click", addQuickRow);
$("qa_name")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("qa_wager")?.focus(); } });
$("qa_wager")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("qa_prize")?.focus(); } });
$("qa_prize")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addQuickRow(); $("qa_name")?.focus(); } });

export function sanitizeImportName(s) {
  // eslint-disable-next-line no-control-regex -- deliberately strip ASCII control characters from imported names.
  let n = String(s || "").replace(/[\x00-\x1f\x7f]/g, "").trim();
  n = n.replace(/^"+/, "").replace(/"+$/, "");
  n = n.replace(/[^\p{L}\p{N}\p{P}\p{S}\s]/gu, "").trim();
  return n.length > 40 ? n.slice(0, 40) : n;
}

export function parseImportAmount(s) {
  const raw = String(s || "").replace(/[$,\s]/g, "");
  if (raw === "") return 0;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseImportNumber(s) {
  const raw = String(s || "").replace(/[$,\s]/g, "");
  if (raw === "") return undefined;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || !Number.isFinite(n)) return undefined;
  return n;
}

// Accepted header aliases → canonical field. Lets people paste a sheet with
// columns in ANY order (or extra columns) without silently corrupting data.
const HEADER_ALIASES = {
  name: "name", player: "name", username: "name", user: "name", handle: "name",
  wagered: "wagered", wager: "wagered", wagers: "wagered", "total wagered": "wagered", volume: "wagered", bet: "wagered", "bet amount": "wagered",
  prize: "prize", reward: "prize", payout: "prize", winnings: "prize",
  score: "score", points: "score", pts: "score",
  hands: "hands", rounds: "hands", games: "hands",
  netprofit: "netProfit", "net profit": "netProfit", net: "netProfit", profit: "netProfit", pnl: "netProfit",
  winrate: "winRate", "win rate": "winRate", "win %": "winRate", winpct: "winRate",
  change: "change", delta: "change", movement: "change",
};
// Positional order used when there is no recognizable header row.
const POSITIONAL = ["name", "wagered", "prize", "score", "hands", "netProfit", "winRate", "change"];
const NUMERIC_FIELDS = ["score", "hands", "netProfit", "winRate", "change"];

function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/^"+|"+$/g, "").replace(/\s+/g, " ");
}

export function parseImportText(text, source = "text") {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
  if (!lines.length) return { rows: [], errors: ["No data found."], source };
  const first = lines[0];
  const sep = first.includes("\t") ? /\t/ : first.includes(",") ? /,/ : first.includes(";") ? /;/ : /\t|,|;/;
  const headerParts = first.split(sep).map(normalizeHeader);

  // A row counts as a header if its first cell is a name alias AND at least one
  // other cell maps to a known field — then we bind columns by name, not order.
  const mapped = headerParts.map((h) => HEADER_ALIASES[h]);
  const hasHeader = mapped[0] === "name" && mapped.slice(1).some((m) => m);

  let colOf;
  if (hasHeader) {
    colOf = {};
    mapped.forEach((field, i) => { if (field && colOf[field] === undefined) colOf[field] = i; });
  } else {
    colOf = {};
    POSITIONAL.forEach((field, i) => { colOf[field] = i; });
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows = [];
  const errors = [];
  const seen = new Set();
  const cell = (parts, field) => (colOf[field] === undefined ? "" : parts[colOf[field]]);
  dataLines.forEach((line, idx) => {
    const parts = line.split(sep).map((s) => s.trim().replace(/^"+|"+$/g, ""));
    const rawName = cell(parts, "name");
    if (!rawName) return;
    const name = sanitizeImportName(rawName);
    if (!name) { errors.push(`Row ${idx + 1}: missing name`); return; }
    const key = name.toLowerCase();
    if (seen.has(key)) { errors.push(`Row ${idx + 1}: duplicate "${name}"`); return; }
    seen.add(key);
    const wagered = parseImportAmount(cell(parts, "wagered"));
    if (wagered === null) { errors.push(`Row ${idx + 1}: invalid wagered for "${name}"`); return; }
    const prize = parseImportAmount(cell(parts, "prize"));
    if (prize === null) { errors.push(`Row ${idx + 1}: invalid prize for "${name}"`); return; }
    const row = { name, wagered, prize };
    for (const field of NUMERIC_FIELDS) {
      const v = parseImportNumber(cell(parts, field));
      if (v !== undefined) row[field] = v;
    }
    rows.push(row);
  });
  return { rows, errors, source };
}

export function formatImportSummary(result, imported, skipped, capped) {
  const parts = [];
  if (imported) parts.push(`${imported} imported`);
  if (capped) parts.push(`${capped} cut by plan limit`);
  if (skipped) parts.push(`${skipped} skipped`);
  let msg = parts.join(" · ");
  if (result.errors.length) msg += (msg ? " — " : "") + result.errors.slice(0, 3).join("; ");
  return msg || "Nothing to import";
}

$("importPasteBtn")?.addEventListener("click", () => {
  closeMenus(false);
  const p = $("importPanel");
  p.hidden = !p.hidden;
  $("gsheetPanel").hidden = true;
  if (!p.hidden) $("importText").focus();
});

$("importText")?.addEventListener("input", () => {
  const result = parseImportText($("importText").value, "paste");
  const n = result.rows.length;
  const err = result.errors.length ? ` (${result.errors.length} problem${result.errors.length === 1 ? "" : "s"})` : "";
  $("importPreview").textContent = n + (n === 1 ? " player" : " players") + " detected" + err;
  $("importApply").disabled = n === 0;
});

$("importApply")?.addEventListener("click", () => {
  const result = parseImportText($("importText").value, "paste");
  if (!result.rows.length) {
    $("status").textContent = result.errors.length ? result.errors[0] : "No players to import.";
    return;
  }
  const replace = $("importReplace").checked;
  const existing = replace ? [] : [...$("rows").children].map((tr) => {
    const p = {
      name: tr.querySelector(".p-name").value.trim(),
      wagered: parseAmount(tr.querySelector(".p-wager").value),
      prize: parseAmount(tr.querySelector(".p-prize").value),
    };
    const score = tr.querySelector(".p-score").value.trim();
    const hands = tr.querySelector(".p-hands").value.trim();
    const netProfit = tr.querySelector(".p-net-profit").value.trim();
    const winRate = tr.querySelector(".p-win-rate").value.trim();
    const change = tr.querySelector(".p-change").value.trim();
    if (score) p.score = parseFloat(score);
    if (hands) p.hands = parseFloat(hands);
    if (netProfit) p.netProfit = parseFloat(netProfit);
    if (winRate) p.winRate = parseFloat(winRate);
    if (change) p.change = parseFloat(change);
    return p;
  }).filter((p) => p.name);
  const limit = state.ME?.limits?.players || 9999;
  const remaining = Math.max(0, limit - existing.length);
  const parsed = result.rows.slice(0, remaining);
  const all = existing.concat(parsed);
  const cut = result.rows.length - parsed.length;
  commitDraftMutation(() => renderPlayers(all), `${parsed.length} player${parsed.length === 1 ? "" : "s"} imported. Save to publish.`);
  $("importText").value = "";
  $("importPreview").textContent = "0 players detected";
  $("importApply").disabled = true;
  $("importPanel").hidden = true;
  $("status").textContent = formatImportSummary(result, parsed.length, result.rows.length - parsed.length + (result.errors.length ? `${result.errors.length} invalid` : ""), cut) + " — hit Save to publish.";
});

$("csvImportBtn")?.addEventListener("click", () => { closeMenus(false); $("csvFileInput").click(); });

$("csvFileInput")?.addEventListener("change", () => {
  const f = $("csvFileInput").files[0];
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) { $("status").textContent = "CSV too large. Keep it under 2 MB."; $("csvFileInput").value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => {
    const result = parseImportText(reader.result, "csv");
    if (!result.rows.length) { $("status").textContent = "No players found. Expected: name, wagered, prize and optional score, hands, net profit, win rate, change."; return; }
    $("importPanel").hidden = false;
    $("importText").value = result.rows.map((p) => [p.name, p.wagered, p.prize, p.score ?? "", p.hands ?? "", p.netProfit ?? "", p.winRate ?? "", p.change ?? ""].join("\t")).join("\n");
    $("importText").dispatchEvent(new Event("input"));
    $("status").textContent = `CSV loaded: ${result.rows.length} valid player${result.rows.length === 1 ? "" : "s"}${result.errors.length ? `, ${result.errors.length} problem${result.errors.length === 1 ? "" : "s"}` : ""}. Review and click "Add to table".`;
  };
  reader.onerror = () => { $("status").textContent = "Couldn't read that file."; };
  reader.readAsText(f);
  $("csvFileInput").value = "";
});

$("csvTemplateBtn")?.addEventListener("click", () => {
  closeMenus(false);
  const csv = "name,wagered,prize\nCryptoKing,152000,1500\nLuckyStar,98000,700\nDiceHero,61250,500\nSlotMaster,45000,250\nBetPro,32000,0\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yourrank-players-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

$("csvExportBtn")?.addEventListener("click", async () => {
  try {
    const apiUrl = state.ACTIVE_SITE_ID ? `/api/site/players/export?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "/api/site/players/export";
    const res = await fetch(apiUrl, { credentials: "include" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      $("status").textContent = d.error || "Could not export players.";
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (state.SLUG || "board").replace(/[^a-z0-9-]/gi, "-");
    a.download = `yourrank-players-${slug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    $("status").textContent = "Players exported.";
  } catch (err) {
    logError("csvExport", err);
    $("status").textContent = "Network error.";
  }
});

function parseGSheetUrl(raw) {
  try {
    const url = new URL(raw.trim());
    const pub = url.pathname.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9_-]+)\//);
    if (pub) return `https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv&single=true`;
    const m = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)\//);
    if (!m) return null;
    const id = m[1];
    const gid = url.searchParams.get("gid") || "0";
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&id=${id}&gid=${gid}`;
  } catch { return null; }
}

$("gsheetBtn")?.addEventListener("click", () => {
  closeMenus(false);
  const p = $("gsheetPanel");
  p.hidden = !p.hidden;
  if (!p.hidden) $("importPanel").hidden = true;
});

$("gsheetFetch")?.addEventListener("click", async () => {
  const raw = $("gsheetUrl").value.trim();
  const status = $("gsheetStatus");
  const csvUrl = parseGSheetUrl(raw);
  if (!csvUrl) { status.textContent = "Paste a valid Google Sheets URL."; return; }
  status.textContent = "Fetching…";
  try {
    const res = await fetch(csvUrl, { credentials: "omit", mode: "cors" });
    if (!res.ok) { status.textContent = `Google returned ${res.status}. Make the sheet public or use CSV import.`; return; }
    const text = await res.text();
    const result = parseImportText(text, "gsheet");
    if (!result.rows.length) { status.textContent = result.errors.length ? result.errors[0] : "No players found. Expected: name, wagered, prize, ..."; return; }
    $("gsheetPanel").hidden = true;
    $("importPanel").hidden = false;
    $("importText").value = result.rows.map((p) => [p.name, p.wagered, p.prize, p.score ?? "", p.hands ?? "", p.netProfit ?? "", p.winRate ?? "", p.change ?? ""].join("\t")).join("\n");
    $("importText").dispatchEvent(new Event("input"));
    status.textContent = `Loaded ${result.rows.length} player${result.rows.length === 1 ? "" : "s"} from Google Sheets. Review and click “Add to table”.`;
  } catch (err) {
    logError("gsheetFetch", err);
    status.textContent = "Could not fetch the sheet. Try File → Share → Publish to web, or download as CSV.";
  }
});

// --- Search, pagination, bulk selection, and column visibility ---
function filteredRows() {
  const rows = $("rows");
  if (!rows) return [];
  const q = $("playerSearch")?.value.trim().toLowerCase() || "";
  return [...rows.children].filter((row) => !q || row.querySelector(".p-name")?.value.toLowerCase().includes(q));
}

function applyRowVisibility() {
  const rowsEl = $("rows");
  if (!rowsEl) return;
  const rows = [...rowsEl.children];
  const matches = filteredRows();
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, currentPage), pages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = new Set(matches.slice(start, start + PAGE_SIZE));
  rows.forEach((row) => {
    const visible = pageRows.has(row);
    row.hidden = !visible;
    row.classList.toggle("is-sel", !!row.querySelector(".row-sel")?.checked);
  });
  const showing = $("playersShowing");
  if (showing) {
    showing.textContent = matches.length
      ? `Showing ${start + 1}-${Math.min(start + PAGE_SIZE, matches.length)} of ${matches.length} players`
      : "No players";
  }
  const prev = $("playersPrev");
  const next = $("playersNext");
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= pages;
  syncSelectAll();
}

function getVisibleRows() {
  return [...$("rows").children].filter((tr) => !tr.hidden);
}

export function syncSelectAll() {
  const visible = getVisibleRows();
  const checked = visible.filter((tr) => tr.querySelector(".row-sel")?.checked).length;
  const selectAll = $("selectAll");
  if (selectAll) selectAll.checked = checked > 0 && checked === visible.length;
  const selected = [...$("rows").children].filter((tr) => tr.querySelector(".row-sel")?.checked);
  const bar = $("bulkActions");
  if (bar) bar.hidden = selected.length === 0;
  const count = $("bulkCount");
  if (count) count.textContent = `${selected.length} player${selected.length === 1 ? "" : "s"} selected`;
  [...$("rows").children].forEach((row) => row.classList.toggle("is-sel", !!row.querySelector(".row-sel")?.checked));
}

$("selectAll")?.addEventListener("change", () => {
  const checked = $("selectAll").checked;
  for (const row of getVisibleRows()) {
    const cb = row.querySelector(".row-sel");
    if (cb) cb.checked = checked;
  }
  syncSelectAll();
});

$("rows")?.addEventListener("change", (e) => {
  if (e.target?.classList?.contains("row-sel")) syncSelectAll();
});

$("bulkDelete")?.addEventListener("click", async () => {
  const selected = [...$("rows").children].filter((row) => row.querySelector(".row-sel")?.checked);
  if (!selected.length) return;
  const count = selected.length;
  if (!await showConfirmModal("Remove selected players", `Remove ${count} selected player${count === 1 ? "" : "s"}? You can restore them only by re-adding them before saving.`, "Remove", true)) return;
  commitDraftMutation(() => {
    selected.forEach((row) => row.remove());
    renumber();
    toggleEmpty();
    syncSelectAll();
  }, `${count} player${count === 1 ? "" : "s"} removed. Save to publish.`);
});

$("bulkClearWager")?.addEventListener("click", () => {
  let cleared = 0;
  for (const row of $("rows").children) {
    if (row.querySelector(".row-sel")?.checked) {
      const input = row.querySelector(".p-wager");
      if (input && parseAmount(input.value) !== 0) { input.value = "0"; showMoneyValue(input); cleared++; }
    }
  }
  if (cleared) {
    commitDraftMutation(() => sortRows(), `${cleared} wager${cleared === 1 ? "" : "s"} cleared. Save to publish.`);
  }
});

$("playerSearch")?.addEventListener("input", () => {
  currentPage = 1;
  const matches = new Set(filteredRows());
  for (const row of $("rows").children) {
    if (!matches.has(row)) {
      const checkbox = row.querySelector(".row-sel");
      if (checkbox) checkbox.checked = false;
    }
  }
  applyRowVisibility();
});

$("playerSort")?.addEventListener("change", () => {
  currentPage = 1;
  sortRows();
  applyRowVisibility();
});

$("playersPrev")?.addEventListener("click", () => {
  currentPage--;
  applyRowVisibility();
});

$("playersNext")?.addEventListener("click", () => {
  currentPage++;
  applyRowVisibility();
});

function setMenuState(trigger, menu, open, { focusFirst = false } = {}) {
  if (!trigger || !menu) return;
  menu.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
  if (open && focusFirst) {
    menu.querySelector("button:not([disabled]), input:not([disabled]), [href]:not([aria-disabled='true'])")?.focus();
  }
}

function closeMenus(returnFocus = false) {
  const active = document.activeElement;
  const importMenu = $("importMenu");
  const colMenu = $("colMenu");
  const importOpen = importMenu && !importMenu.hidden;
  const colOpen = colMenu && !colMenu.hidden;
  if (importMenu) importMenu.hidden = true;
  if (colMenu) colMenu.hidden = true;
  $("importMenuBtn")?.setAttribute("aria-expanded", "false");
  $("colDropdownBtn")?.setAttribute("aria-expanded", "false");
  if (returnFocus) {
    const trigger = importOpen ? $("importMenuBtn") : colOpen ? $("colDropdownBtn") : null;
    if (trigger && (active === importMenu || importMenu?.contains(active) || active === colMenu || colMenu?.contains(active))) trigger.focus();
  }
}

function wireMenuA11y(triggerId, menuId) {
  const trigger = $(triggerId);
  const menu = $(menuId);
  if (!trigger || !menu) return;
  trigger.setAttribute("aria-controls", menuId);
  trigger.setAttribute("aria-expanded", String(!menu.hidden));
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    closeMenus(false);
    setMenuState(trigger, menu, open, { focusFirst: open });
  });
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenus(true);
    }
  });
}

wireMenuA11y("colDropdownBtn", "colMenu");

$("colMenu")?.addEventListener("change", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.col) {
    const fields = { ...(state.EXTRA?.playerFields || {}) };
    fields[e.target.dataset.col] = e.target.checked;
    state.EXTRA.playerFields = fields;
    applyPlayerFieldVisibility(fields);
    markDirty();
  }
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#importMenu, #importMenuBtn, #colMenu, #colDropdownBtn")) closeMenus();
});

// Initialize the active column state and the first page once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  if (!$("rows")) return;
  applyPlayerFieldVisibility();
  applyRowVisibility();
});

// The new toolbar keeps the existing import actions and panel wiring.
$("emptyImportBtn")?.addEventListener("click", () => {
  $("importPanel").hidden = false;
  $("gsheetPanel").hidden = true;
  $("importText").focus();
});

$("emptyPasteBtn")?.addEventListener("click", async () => {
  $("importPanel").hidden = false;
  $("gsheetPanel").hidden = true;
  const input = $("importText");
  try {
    if (!navigator.clipboard?.readText) throw new Error("Clipboard API unavailable");
    input.value = await navigator.clipboard.readText();
    input.dispatchEvent(new Event("input"));
  } catch (err) {
    logError("clipboardRead", err);
    $("status").textContent = "Couldn't read your clipboard — paste the players in below.";
  }
  input.focus();
});

wireMenuA11y("importMenuBtn", "importMenu");

["importPasteBtn", "csvImportBtn", "gsheetBtn", "csvTemplateBtn", "csvExportBtn"].forEach((id) => {
  $(id)?.addEventListener("click", () => closeMenus(false));
});

// Initialize column dropdown state once the DOM is ready.
