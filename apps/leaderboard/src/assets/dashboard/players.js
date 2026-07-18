// Player table, CSV/paste import, and row management.
import { $, esc, logError } from "./utils.js";
import { state } from "./state.js";

export function playerRow(p = { name: "", wagered: "", prize: "", score: "", hands: "", netProfit: "", winRate: "", change: "" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td class="rank"></td>
    <td><input class="p-name" placeholder="Player name" value="${esc(p.name)}"></td>
    <td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td>
    <td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td>
    <td class="num col-score" hidden><input class="p-score" inputmode="decimal" placeholder="0" value="${esc(p.score)}"></td>
    <td class="num col-hands" hidden><input class="p-hands" inputmode="decimal" placeholder="0" value="${esc(p.hands)}"></td>
    <td class="num col-net" hidden><input class="p-net-profit" inputmode="decimal" placeholder="0" value="${esc(p.netProfit)}"></td>
    <td class="num col-win" hidden><input class="p-win-rate" inputmode="decimal" placeholder="0" value="${esc(p.winRate)}"></td>
    <td class="num col-change" hidden><input class="p-change" inputmode="decimal" placeholder="0" value="${esc(p.change)}"></td>
    <td class="act"><button class="row-x" title="Remove" aria-label="Remove player" type="button">×</button></td>`;
  tr.querySelector(".row-x").addEventListener("click", () => { tr.remove(); renumber(); toggleEmpty(); });
  return tr;
}

const FIELD_COLS = {
  score: "col-score",
  hands: "col-hands",
  netProfit: "col-net",
  winRate: "col-win",
  change: "col-change",
};

export function applyPlayerFieldVisibility(fields) {
  const table = $("rows")?.closest("table");
  const merged = { ...state.EXTRA?.playerFields, ...(fields || {}) };
  for (const [key, cls] of Object.entries(FIELD_COLS)) {
    const shown = merged[key] !== false;
    table?.querySelectorAll(`.${cls}`).forEach((el) => { el.hidden = !shown; });
  }
}

export function renderPlayers(list) {
  const b = $("rows");
  b.innerHTML = "";
  list.forEach((p) => b.appendChild(playerRow(p)));
  renumber();
  toggleEmpty();
  applyPlayerFieldVisibility();
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
    const wa = parseFloat(a.querySelector(".p-wager").value) || 0;
    const wb = parseFloat(b.querySelector(".p-wager").value) || 0;
    if (wb !== wa) return wb - wa;
    const pa = parseFloat(a.querySelector(".p-prize").value) || 0;
    const pb = parseFloat(b.querySelector(".p-prize").value) || 0;
    return pb - pa;
  });
  rowsArr.forEach((row) => rowsEl.appendChild(row));
  renumber();
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

export function parseImportText(text, source = "text") {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
  if (!lines.length) return { rows: [], errors: ["No data found."], source };
  const first = lines[0];
  const sep = first.includes("\t") ? /\t/ : first.includes(",") ? /,/ : first.includes(";") ? /;/ : /\t|,|;/;
  const headerParts = first.split(sep).map((s) => s.trim().toLowerCase().replace(/^"+|"+$/g, ""));
  const hasHeader = ["name", "player", "username"].includes(headerParts[0]);
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows = [];
  const errors = [];
  const seen = new Set();
  dataLines.forEach((line, idx) => {
    const parts = line.split(sep).map((s) => s.trim().replace(/^"+|"+$/g, ""));
    if (!parts[0]) return;
    const name = sanitizeImportName(parts[0]);
    if (!name) { errors.push(`Row ${idx + 1}: missing name`); return; }
    const key = name.toLowerCase();
    if (seen.has(key)) { errors.push(`Row ${idx + 1}: duplicate "${name}"`); return; }
    seen.add(key);
    const wagered = parseImportAmount(parts[1]);
    if (wagered === null) { errors.push(`Row ${idx + 1}: invalid wagered for "${name}"`); return; }
    const prize = parseImportAmount(parts[2]);
    if (prize === null) { errors.push(`Row ${idx + 1}: invalid prize for "${name}"`); return; }
    const row = { name, wagered, prize };
    const score = parseImportNumber(parts[3]);
    const hands = parseImportNumber(parts[4]);
    const netProfit = parseImportNumber(parts[5]);
    const winRate = parseImportNumber(parts[6]);
    const change = parseImportNumber(parts[7]);
    if (score !== undefined) row.score = score;
    if (hands !== undefined) row.hands = hands;
    if (netProfit !== undefined) row.netProfit = netProfit;
    if (winRate !== undefined) row.winRate = winRate;
    if (change !== undefined) row.change = change;
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

$("importBtn").addEventListener("click", () => {
  const p = $("importPanel");
  p.hidden = !p.hidden;
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

$("csvImportBtn")?.addEventListener("click", () => $("csvFileInput").click());

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
