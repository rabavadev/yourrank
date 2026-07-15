// Player table, CSV/paste import, and row management.
import { $, esc, logError } from "./utils.js";
import { state } from "./state.js";

export function playerRow(p = { name: "", wagered: "", prize: "" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td class="rank"></td><td><input class="p-name" placeholder="Player name" value="${esc(p.name)}"></td><td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td><td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td><td class="act"><button class="row-x" title="Remove" aria-label="Remove player" type="button">×</button></td>`;
  tr.querySelector(".row-x").addEventListener("click", () => { tr.remove(); renumber(); toggleEmpty(); });
  return tr;
}

export function renderPlayers(list) {
  const b = $("rows");
  b.innerHTML = "";
  list.forEach((p) => b.appendChild(playerRow(p)));
  renumber();
  toggleEmpty();
}

export function renumber() {
  const rows = [...$("rows").children];
  rows.forEach((tr, i) => tr.querySelector(".rank").textContent = String(i + 1).padStart(2, "0"));
  if (state.ME) $("pCount").textContent = `${rows.length} / ${state.ME.limits.players === 999 ? "∞" : state.ME.limits.players}`;
}

export function toggleEmpty() {
  $("playersEmpty").hidden = $("rows").children.length > 0;
}

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
    rows.push({ name, wagered, prize });
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
  const existing = replace ? [] : [...$("rows").children].map((tr) => ({
    name: tr.querySelector(".p-name").value.trim(),
    wagered: parseFloat(tr.querySelector(".p-wager").value) || 0,
    prize: parseFloat(tr.querySelector(".p-prize").value) || 0,
  })).filter((p) => p.name);
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
    if (!result.rows.length) { $("status").textContent = "No players found in that CSV. Expected columns: name, wagered, prize"; return; }
    $("importPanel").hidden = false;
    $("importText").value = result.rows.map((p) => `${p.name}\t${p.wagered}\t${p.prize}`).join("\n");
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
