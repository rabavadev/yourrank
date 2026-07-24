// Player table, CSV/paste import, and row management.
import { $, esc, logError, parseAmount } from "./utils.js";
import { state } from "./state.js";

export function playerRow(p = { name: "", wagered: "", prize: "", score: "", hands: "", netProfit: "", winRate: "", change: "" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td class="sel"><input type="checkbox" class="row-sel" title="Select" aria-label="Select player" /></td>
    <td class="rank"></td>
    <td><input class="p-name" placeholder="Player name" value="${esc(p.name)}"></td>
    <td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td>
    <td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td>
    <td class="num col-score" hidden><input class="p-score" inputmode="decimal" placeholder="0" value="${esc(p.score)}"></td>
    <td class="num col-hands" hidden><input class="p-hands" inputmode="decimal" placeholder="0" value="${esc(p.hands)}"></td>
    <td class="num col-net" hidden><input class="p-net-profit" inputmode="decimal" placeholder="0" value="${esc(p.netProfit)}"></td>
    <td class="num col-win" hidden><input class="p-win-rate" inputmode="decimal" placeholder="0" value="${esc(p.winRate)}"></td>
    <td class="num col-change" hidden><input class="p-change" inputmode="decimal" placeholder="0" value="${esc(p.change)}"></td>
    <td class="act"><button class="row-x" title="Remove" aria-label="Remove player" type="button">×</button></td>`;
  tr.querySelector(".row-x").addEventListener("click", () => { tr.remove(); renumber(); toggleEmpty(); syncSelectAll(); });
  return tr;
}

const FIELD_COLS = {
  score: "col-score",
  hands: "col-hands",
  netProfit: "col-net",
  winRate: "col-win",
  change: "col-change",
};
const FIELD_LABELS = { score: "Score", hands: "Hands", netProfit: "Net profit", winRate: "Win rate", change: "Change" };

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
  rows.forEach((tr, i) => tr.querySelector(".rank").textContent = String(i + 1).padStart(2, "0"));
  const n = rows.length;
  const limit = state.ME?.limits?.players ?? 25;
  const unlimited = limit >= 999;
  const pCount = $("pCount");
  if (pCount) pCount.textContent = unlimited ? `${n} player${n === 1 ? "" : "s"}` : `${n} / ${limit} players`;
  const fill = $("limitFill");
  if (fill) {
    const pct = unlimited ? 0 : Math.min(100, Math.round((n / limit) * 100));
    fill.style.width = `${pct}%`;
    fill.classList.toggle("limit-warning", !unlimited && n >= limit);
  }
  const hint = $("limitHint");
  if (hint) hint.textContent = unlimited ? "Unlimited" : (n >= limit ? "Limit reached" : (n >= Math.floor(limit * 0.8) ? "Approaching limit" : ""));
  const upgrade = $("playerLimitUpgrade");
  if (upgrade) upgrade.hidden = unlimited || n < Math.max(1, Math.floor(limit * 0.8));
}

export function toggleEmpty() {
  $("playersEmpty").hidden = $("rows").children.length > 0;
}

// Live re-sort the player table as wagered numbers change, with a tiny
// FLIP-style translate animation so the operator sees the row move.
let sortTimer;
function sortRows() {
  const rowsEl = $("rows");
  if (!rowsEl) return;
  const before = new Map();
  for (const row of rowsEl.children) before.set(row, row.getBoundingClientRect().top);
  const rowsArr = [...rowsEl.children];
  rowsArr.sort((a, b) => {
    const wa = parseAmount(a.querySelector(".p-wager").value);
    const wb = parseAmount(b.querySelector(".p-wager").value);
    if (wb !== wa) return wb - wa;
    const pa = parseAmount(a.querySelector(".p-prize").value);
    const pb = parseAmount(b.querySelector(".p-prize").value);
    return pb - pa;
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
}

function onSortableInput() {
  clearTimeout(sortTimer);
  sortTimer = setTimeout(sortRows, 200);
}

$("rows").addEventListener("input", (e) => {
  if (e.target && e.target.classList && (e.target.classList.contains("p-wager") || e.target.classList.contains("p-prize"))) {
    onSortableInput();
  }
});

$("addRow").addEventListener("click", () => {
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
  $("rows").appendChild(playerRow());
  renumber();
  toggleEmpty();
  applyPlayerFieldVisibility();
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
  $("rows").appendChild(playerRow({ name, wagered, prize }));
  $("qa_name").value = "";
  $("qa_wager").value = "";
  $("qa_prize").value = "";
  renumber();
  toggleEmpty();
}

$("qa_add")?.addEventListener("click", addQuickRow);
$("qa_name")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("qa_wager")?.focus(); } });
$("qa_wager")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("qa_prize")?.focus(); } });
$("qa_prize")?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addQuickRow(); $("qa_name")?.focus(); } });

$("hudQuickAdd")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("hudName").value.trim();
  const amountRaw = $("hudAmount").value.trim();
  if (!name || !amountRaw) return;

  const isAddition = amountRaw.startsWith("+");
  const isSubtraction = amountRaw.startsWith("-");
  const amount = parseAmount(amountRaw);

  let found = false;
  const nameLower = name.toLowerCase();
  [...$("rows").children].forEach(row => {
    const pName = row.querySelector(".p-name").value.trim();
    if (pName.toLowerCase() === nameLower) {
      found = true;
      const wagerInput = row.querySelector(".p-wager");
      const currentWager = parseAmount(wagerInput.value);
      if (isAddition || isSubtraction) {
         wagerInput.value = (isSubtraction ? currentWager - amount : currentWager + amount);
      } else {
         wagerInput.value = amount;
      }
      wagerInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  if (!found) {
    if (state.ME && $("rows").children.length >= state.ME.limits.players && state.ME.limits.players < 999) {
      const el = $("status");
      if (el) el.textContent = "Player limit reached. Upgrade to add more.";
      return;
    }
    const wagered = isSubtraction ? 0 : amount;
    $("rows").appendChild(playerRow({ name, wagered, prize: 0 }));
    renumber();
    toggleEmpty();
    applyPlayerFieldVisibility();
    $("rows").lastElementChild.querySelector(".p-wager").dispatchEvent(new Event("input", { bubbles: true }));
  }

  $("hudName").value = "";
  $("hudAmount").value = "";
  $("hudName").focus();
});

const NAME_RE = /^[\p{L}\p{N}\p{P}\p{S}\s]+$/u;

export function sanitizeImportName(s) {
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

$("importMenuBtn")?.addEventListener("click", () => {
  const menu = $("importMenu");
  if (menu) menu.hidden = !menu.hidden;
});

$("importPasteBtn")?.addEventListener("click", () => {
  $("importMenu").hidden = true;
  const p = $("importPanel");
  p.hidden = !p.hidden;
  $("gsheetPanel").hidden = true;
  if (!p.hidden) $("importText").focus();
});

$("importText").addEventListener("input", () => {
  const result = parseImportText($("importText").value, "paste");
  const n = result.rows.length;
  const err = result.errors.length ? ` (${result.errors.length} problem${result.errors.length === 1 ? "" : "s"})` : "";
  $("importPreview").textContent = n + (n === 1 ? " player" : " players") + " detected" + err;
  $("importApply").disabled = n === 0;
});

$("importApply").addEventListener("click", () => {
  const result = parseImportText($("importText").value, "paste");
  if (!result.rows.length) {
    $("status").textContent = result.errors.length ? result.errors[0] : "No players to import.";
    return;
  }
  const replace = $("importReplace").checked;
  const existing = replace ? [] : [...$("rows").children].map((tr) => {
    const p = {
      name: tr.querySelector(".p-name").value.trim(),
      wagered: parseFloat(tr.querySelector(".p-wager").value) || 0,
      prize: parseFloat(tr.querySelector(".p-prize").value) || 0,
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
  renderPlayers(all);
  $("importText").value = "";
  $("importPreview").textContent = "0 players detected";
  $("importApply").disabled = true;
  $("importPanel").hidden = true;
  $("status").textContent = formatImportSummary(result, parsed.length, result.rows.length - parsed.length + (result.errors.length ? `${result.errors.length} invalid` : ""), cut) + " — hit Save to publish.";
});

$("csvImportBtn")?.addEventListener("click", () => { $("importMenu").hidden = true; $("csvFileInput").click(); });

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
  $("importMenu").hidden = true;
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
  $("importMenu").hidden = true;
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

// --- Search, bulk selection, and column visibility ---
function getVisibleRows() {
  const rows = [...$("rows").children];
  return rows.filter((tr) => !tr.hidden && tr.style.display !== "none");
}

export function syncSelectAll() {
  updateBulkActions();
  const visible = getVisibleRows();
  const checked = visible.filter((tr) => tr.querySelector(".row-sel")?.checked).length;
  const selectAll = $("selectAll");
  if (selectAll) selectAll.checked = checked > 0 && checked === visible.length;
}

function updateBulkActions() {
  const any = $("rows")?.querySelector(".row-sel:checked");
  const bar = $("bulkActions");
  if (bar) bar.hidden = !any;
}

$("selectAll")?.addEventListener("change", () => {
  const checked = $("selectAll").checked;
  for (const row of getVisibleRows()) {
    const cb = row.querySelector(".row-sel");
    if (cb) cb.checked = checked;
  }
  updateBulkActions();
});

$("rows")?.addEventListener("change", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("row-sel")) {
    syncSelectAll();
  }
});

$("bulkDelete")?.addEventListener("click", () => {
  const rows = [...$("rows").children];
  let removed = 0;
  for (const row of rows) {
    if (row.querySelector(".row-sel")?.checked) { row.remove(); removed++; }
  }
  if (removed) {
    renumber(); toggleEmpty(); syncSelectAll();
    state.markDirty?.();
    $("status").textContent = `${removed} player${removed === 1 ? "" : "s"} removed.`;
  }
});

$("bulkClearWager")?.addEventListener("click", () => {
  let cleared = 0;
  for (const row of $("rows").children) {
    if (row.querySelector(".row-sel")?.checked) {
      const input = row.querySelector(".p-wager");
      if (input && input.value !== "0") { input.value = "0"; cleared++; }
    }
  }
  if (cleared) {
    sortRows();
    state.markDirty?.();
    $("status").textContent = `${cleared} wager${cleared === 1 ? "" : "s"} cleared.`;
  }
});

$("playerSearch")?.addEventListener("input", () => {
  const q = $("playerSearch").value.trim().toLowerCase();
  for (const row of $("rows").children) {
    const name = row.querySelector(".p-name")?.value.toLowerCase() || "";
    const hide = q && !name.includes(q);
    row.hidden = hide;
    if (hide) row.querySelector(".row-sel") && (row.querySelector(".row-sel").checked = false);
  }
  $("selectAll").checked = false;
  updateBulkActions();
  renumber();
});

$("colDropdownBtn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  const menu = $("colMenu");
  if (menu) menu.hidden = !menu.hidden;
});

$("colMenu")?.addEventListener("change", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.col) {
    const fields = { ...(state.EXTRA?.playerFields || {}) };
    fields[e.target.dataset.col] = e.target.checked;
    state.EXTRA.playerFields = fields;
    applyPlayerFieldVisibility(fields);
    state.markDirty?.();
  }
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#importMenu, #importMenuBtn")) $("importMenu").hidden = true;
  if (!e.target.closest("#colMenu, #colDropdownBtn")) $("colMenu").hidden = true;
});

// Initialize column dropdown state once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => applyPlayerFieldVisibility());
