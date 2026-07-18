// Board switcher, creation, duplication, deletion, and the board list page.
import { $, esc, guardAuth, getCsrf, logError, slugify } from "./utils.js";
import { state } from "./state.js";
import { navTo } from "./shell.js";

export function renderBoardSwitcher() {
  const list = $("boardList");
  if (list) {
    list.innerHTML = "";
    state.BOARDS.forEach((b) => {
      const el = document.createElement("div");
      const isActive = b.id === state.ACTIVE_SITE_ID;
      el.className = "board-item" + (isActive ? " board-item--active" : "");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      const sponsor = [b.casino, b.code].filter(Boolean).join(" · ");
      el.innerHTML = `<div class="board-info"><div class="board-row-top"><span class="board-slug">/${esc(b.slug)}</span><span class="board-name">${esc(b.name)}</span></div>${sponsor ? `<div class="board-sponsor">${esc(sponsor)}</div>` : ""}</div>${isActive ? '<span class="board-badge">editing</span>' : '<span class="board-actions"><button class="btn btn--sm" data-action="setActive" title="Set as active board" aria-label="Set as active board" type="button">★</button><button class="btn btn--sm" data-action="delete" title="Delete board" aria-label="Delete board" type="button">×</button></span>'}`;
      if (!isActive) {
        el.style.cursor = "pointer";
        el.addEventListener("click", (e) => { if (e.target.closest('[data-action]')) return; location.href = "/dashboard?board=" + encodeURIComponent(b.id); });
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
        el.querySelector('[data-action="setActive"]')?.addEventListener("click", (e) => { e.stopPropagation(); setActiveBoard(b.id); });
        el.querySelector('[data-action="delete"]')?.addEventListener("click", (e) => { e.stopPropagation(); deleteBoard(b.id); });
      }
      list.appendChild(el);
    });
    const countEl = $("boardCount");
    if (countEl) {
      const limit = state.ME?.limits?.boards || 1;
      countEl.textContent = state.BOARDS.length + " / " + limit + " boards";
    }
  }
  const newBtn = $("newBoard");
  if (newBtn) {
    const limit = state.ME?.limits?.boards || 1;
    const atLimit = state.BOARDS.length >= limit;
    newBtn.hidden = false;
    newBtn.classList.toggle("btn--ghost", atLimit);
    newBtn.title = atLimit ? "Plan limit reached — see upgrade options" : "";
    newBtn.setAttribute("aria-expanded", "false");
    newBtn.setAttribute("aria-controls", atLimit ? "boardLimitUpsell" : "newBoardForm");
    if (!atLimit) hideBoardLimitUpsell();
    newBtn.onclick = () => {
      if (atLimit) { showBoardLimitUpsell(); return; }
      hideBoardLimitUpsell();
      $("newBoardForm").hidden = false;
      newBtn.hidden = true;
      newBtn.setAttribute("aria-expanded", "true");
      $("nb_name").focus();
    };
  }
  const cancelBtn = $("nb_cancel");
  if (cancelBtn) cancelBtn.onclick = () => {
    $("newBoardForm").hidden = true;
    $("newBoard").hidden = false;
    $("newBoard").setAttribute("aria-expanded", "false");
    $("nb_err").textContent = "";
  };
  const createBtn = $("nb_create");
  if (createBtn) createBtn.onclick = async () => {
    const name = $("nb_name").value.trim();
    let slug = $("nb_slug").value.trim() || slugify(name);
    if (!slug) { $("nb_err").textContent = "Enter a name or slug."; return; }
    const casino = $("nb_casino").value.trim();
    if (!casino) { $("nb_err").textContent = "Enter a casino name."; return; }
    $("nb_err").textContent = "Creating…";
    createBtn.disabled = true;
    try {
      const code = $("nb_code").value.trim();
      const res = await fetch("/api/site/create", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ slug, name, casino, code }) });
      const d = await res.json();
      if (res.ok && d.ok) {
        location.href = "/dashboard?board=" + encodeURIComponent(d.id);
      } else if (d.code === "board_limit") {
        $("newBoardForm").hidden = true;
        newBtn.hidden = false;
        showBoardLimitUpsell();
        createBtn.disabled = false;
      } else {
        $("nb_err").textContent = d.error || "Creation failed.";
        createBtn.disabled = false;
      }
    } catch (err) { logError("new-board", err); $("nb_err").textContent = "Network error."; createBtn.disabled = false; }
  };
}

function boardLimitOffer() {
  const plan = state.ME?.plan || "free";
  const limit = state.ME?.limits?.boards || 1;
  if (plan === "agency") {
    return {
      title: `You've reached ${limit} boards`,
      text: "Need a higher limit? Contact support and tell us how many boards your team manages.",
      cta: "Contact support",
      href: "/contact?type=support&area=billing&return=/dashboard",
    };
  }
  if (plan === "pro") {
    return {
      title: `You've reached ${limit} boards`,
      text: "Agency supports up to 99 independent leaderboards.",
      cta: "View Agency plan",
      href: "/dashboard/billing",
    };
  }
  const planName = plan === "starter" ? "Starter" : "Free";
  return {
    title: "Need another leaderboard?",
    text: `${planName} includes ${limit} board. Pro unlocks up to 3 independent boards.`,
    cta: "Upgrade to Pro",
    href: "/dashboard/billing",
  };
}

function showBoardLimitUpsell() {
  const panel = $("boardLimitUpsell");
  if (!panel) return;
  const offer = boardLimitOffer();
  $("boardLimitTitle").textContent = offer.title;
  $("boardLimitText").textContent = offer.text;
  $("boardLimitCta").textContent = offer.cta;
  $("boardLimitCta").href = offer.href;
  panel.hidden = false;
  $("newBoard")?.setAttribute("aria-expanded", "true");
  $("boardLimitCta")?.focus();
}

function hideBoardLimitUpsell() {
  const panel = $("boardLimitUpsell");
  if (panel) panel.hidden = true;
}

export async function deleteBoard(siteId) {
  const board = state.BOARDS.find((b) => b.id === siteId);
  if (!board) return;
  if (!window.confirm(`Delete board /${board.slug}? This cannot be undone.`)) return;
  try {
    const res = await fetch("/api/site", {
      method: "DELETE",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId })
    }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      const idx = state.BOARDS.findIndex((b) => b.id === siteId);
      if (idx >= 0) state.BOARDS.splice(idx, 1);
      if (siteId === state.ACTIVE_SITE_ID) { location.href = "/dashboard"; return; }
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      renderBoardsPage();
      $("status").textContent = "Board deleted.";
    } else {
      $("status").textContent = d.error || "Could not delete board.";
    }
  } catch (err) { logError("delete-board", err); $("status").textContent = "Network error."; }
}

export async function setActiveBoard(siteId) {
  try {
    const res = await fetch("/api/site/active", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId })
    }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      state.ACTIVE_SITE_ID = siteId;
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      $("status").textContent = "Active board updated.";
    } else {
      $("status").textContent = d.error || "Could not set active board.";
    }
  } catch (err) { logError("set-active-board", err); $("status").textContent = "Network error."; }
}

export function openNewBoardForm() {
  const newBtn = $("newBoard");
  if (newBtn && !newBtn.hidden) newBtn.click();
}

export async function duplicateBoard(siteId) {
  const board = state.BOARDS.find((b) => b.id === siteId);
  if (!board) return;
  if (!window.confirm(`Duplicate /${board.slug}? This creates an unpublished copy with the same design and players.`)) return;
  try {
    const res = await fetch("/api/site/duplicate", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId })
    }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      location.href = "/dashboard?board=" + encodeURIComponent(d.id);
    } else if (d.code === "board_limit") {
      showBoardLimitUpsell();
    } else {
      $("status").textContent = d.error || "Could not duplicate board.";
    }
  } catch (err) { logError("duplicate-board", err); $("status").textContent = "Network error."; }
}

export function renderSidebarBoardSwitcher() {
  const nameEl = $("activeBoardName");
  const metaEl = $("activeBoardMeta");
  const sel = $("sidebarBoardSelect");
  const manage = $("manageBoardsBtn");
  const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
  if (nameEl) nameEl.textContent = active?.name || "…";
  if (metaEl) {
    if (active) {
      const parts = [`/${active.slug}`, active.casino, active.code].filter(Boolean);
      metaEl.textContent = parts.join(" · ");
    } else {
      metaEl.textContent = "";
    }
  }
  if (sel) {
    sel.innerHTML = "";
    if (!state.BOARDS.length) {
      const opt = document.createElement("option");
      opt.textContent = "No boards";
      opt.value = "";
      sel.appendChild(opt);
      sel.disabled = true;
    } else {
      state.BOARDS.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = `${b.name} /${b.slug}`;
        opt.selected = b.id === state.ACTIVE_SITE_ID;
        sel.appendChild(opt);
      });
      sel.disabled = false;
      sel.onchange = () => {
        const id = sel.value;
        if (id && id !== state.ACTIVE_SITE_ID) location.href = "/dashboard?board=" + encodeURIComponent(id);
      };
    }
  }
  if (manage) manage.onclick = () => navTo("boards");
}

export function renderBoardsPage() {
  const body = $("boardsBody");
  const empty = $("boardsEmpty");
  const addBtn = $("addBoardFromBoards");
  if (!body) return;
  body.innerHTML = "";
  if (!state.BOARDS.length) {
    if (empty) empty.hidden = false;
  } else {
    if (empty) empty.hidden = true;
    state.BOARDS.forEach((b) => {
      const tr = document.createElement("tr");
      const isActive = b.id === state.ACTIVE_SITE_ID;
      const tpl = state.TEMPLATE_CATALOG.find((t) => t.id === (b.template || "classic"));
      const statusClass = b.published ? "pill--good" : "pill--muted";
      const statusText = b.published ? "Published" : "Draft";
      tr.innerHTML = `<td><a class="board-table-name${isActive ? ' board-table-name--active' : ''}" href="/dashboard?board=${encodeURIComponent(b.id)}">${esc(b.name)}${isActive ? '<span class="board-table-badge">editing</span>' : ''}</a></td><td>${esc(b.casino || "")}${b.code ? `<span class="mono"> · ${esc(b.code)}</span>` : ""}</td><td><a class="mono" href="/${esc(b.slug)}" target="_blank">/${esc(b.slug)}</a></td><td>${b.players || 0}</td><td>${esc(tpl ? tpl.name : (b.template || "classic"))}</td><td><span class="pill ${statusClass}">${statusText}</span></td><td class="ta-r"><button class="btn btn--xs btn--ghost" data-action="edit" type="button">Edit</button><button class="btn btn--xs" data-action="dup" type="button">Duplicate</button><button class="btn btn--xs btn--danger" data-action="del" type="button">Delete</button></td>`;
      tr.querySelector('[data-action="edit"]')?.addEventListener("click", () => { location.href = "/dashboard?board=" + encodeURIComponent(b.id); });
      tr.querySelector('[data-action="dup"]')?.addEventListener("click", () => { duplicateBoard(b.id); });
      tr.querySelector('[data-action="del"]')?.addEventListener("click", () => { deleteBoard(b.id); });
      body.appendChild(tr);
    });
  }
  if (addBtn) addBtn.onclick = openNewBoardForm;
}
