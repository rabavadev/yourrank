// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, logError } from "./utils.js";
import { state } from "./state.js";

export function wireOverviewQuickActions() {
  const btn = $("ov_copyLink");
  if (!btn || btn._wired) return;
  btn._wired = true;
  const label = btn.querySelector(".lb-qa-t");
  btn.addEventListener("click", async () => {
    const url = location.origin + "/" + state.SLUG;
    try { await navigator.clipboard.writeText(url); if (label) label.textContent = "Copied!"; }
    catch (err) { logError("copy-live-link", err); if (label) label.textContent = "Copy failed"; }
    setTimeout(() => { if (label) label.textContent = "Copy your page link"; }, 1500);
  });
}

export function renderOverviewSummary() {
  if (!$("ov_pool")) return;
  const players = currentPlayers();
  $("ov_pool").textContent = ($("f_name")?.value.trim()) || "—";
  const cap = state.ME && state.ME.limits.players < 999 ? " / " + state.ME.limits.players : "";
  $("ov_players").textContent = players.length + cap;
  $("ov_resets").textContent = resetsIn();
  const top = $("ov_top");
  const topEmpty = $("ov_topEmpty");
  if (top) {
    const sorted = [...players].sort((a, b) => b.wagered - a.wagered).slice(0, 5);
    top.innerHTML = sorted.map((p, i) => `<div class="lb-toprow"><span class="lb-tr-rank">${String(i + 1).padStart(2, "0")}</span><div><div class="lb-tr-name">${esc(p.name)}</div><div class="lb-tr-sub">$${fmtMoney(p.wagered)} wagered</div></div><span class="lb-tr-prize">${p.prize ? "$" + fmtMoney(p.prize) : "—"}</span></div>`).join("");
    top.hidden = sorted.length === 0;
    if (topEmpty) topEmpty.hidden = sorted.length > 0;
  }
  const nameSet = !!($("f_name")?.value.trim());
  const codeSet = !!($("f_code")?.value.trim() || $("f_pool")?.value.trim());
  $("ov_step_brand")?.classList.toggle("is-done", nameSet && codeSet);
  $("ov_step_players")?.classList.toggle("is-done", players.length > 0);
}
