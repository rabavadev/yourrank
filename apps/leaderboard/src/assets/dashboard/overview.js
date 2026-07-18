// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, logError } from "./utils.js";
import { state } from "./state.js";

async function copyLiveLink(triggerLabel, url) {
  try {
    await navigator.clipboard.writeText(url);
    const prev = triggerLabel?.textContent;
    if (triggerLabel) triggerLabel.textContent = "Copied!";
    setTimeout(() => { if (triggerLabel) triggerLabel.textContent = prev; }, 1500);
  } catch (err) { logError("copy-live-link", err); }
}

export function wireOverviewQuickActions() {
  const qaBtn = $("ov_copyLink");
  if (qaBtn && !qaBtn._wired) {
    qaBtn._wired = true;
    const label = qaBtn.querySelector(".lb-qa-t");
    qaBtn.addEventListener("click", () => copyLiveLink(label, location.origin + "/" + state.SLUG));
  }
  const headerBtn = $("overviewCopyLink");
  if (headerBtn && !headerBtn._wired) {
    headerBtn._wired = true;
    const label = headerBtn.childNodes[0];
    headerBtn.addEventListener("click", () => copyLiveLink(label, location.origin + "/" + state.SLUG));
  }
}

export function renderOverviewSummary() {
  if (!$("ov_prize")) return;
  const players = currentPlayers();
  const boardName = $("f_name")?.value.trim() || "—";
  $("ov_board").textContent = boardName;
  const rawPrize = ($("f_pool")?.value || "").replace(/[^0-9.]/g, "");
  $("ov_prize").textContent = rawPrize ? "$" + fmtMoney(Number(rawPrize)) : "—";
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
  const o = state.ONBOARDING || {};
  const brandDone = o.brand || !!($("f_name")?.value.trim() && $("f_casino")?.value.trim());
  const playersDone = o.players || players.length > 0;
  const sharedDone = o.shared || state.PUBLISHED;
  $("ov_step_brand")?.classList.toggle("is-done", brandDone);
  $("ov_step_players")?.classList.toggle("is-done", playersDone);
  $("ov_step_share")?.classList.toggle("is-done", sharedDone);
  $("ov_step_bot")?.classList.toggle("is-done", o.botConnected);
  $("ov_step_postback")?.classList.toggle("is-done", o.postback);
  $("ov_step_postback")?.classList.toggle("is-locked", o.isFree);

  const setupComplete = !!(brandDone && playersDone && sharedDone);
  const qa = $("ovQuickActions");
  const telegram = $("ovTelegramCard");
  const steps = $("ovSetupSteps");
  if (qa) qa.hidden = setupComplete;
  if (telegram) telegram.hidden = setupComplete;
  if (steps) steps.hidden = setupComplete;
}
