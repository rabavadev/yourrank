// Site switcher, creation, duplication, deletion, and the site list page.
import { $, esc, getCsrf, guardAuth, logError, slugify, showConfirmModal } from "./utils.js";
import { state } from "./state.js";
import { requestDashboardRoute } from "./shell.js";
import { renderEmpty } from "./states.js";

export function renderBoardSwitcher() {
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
    if (!slug) { $("nb_err").textContent = "Enter a name or web address."; return; }
    const casino = $("nb_casino").value.trim();
    if (!casino) { $("nb_err").textContent = "Enter a sponsor or partner name."; return; }
    $("nb_err").textContent = "Creating…";
    createBtn.disabled = true;
    try {
      const code = $("nb_code").value.trim();
      const res = await fetch("/api/site/create", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ slug, name, casino, code }) });
      const d = await res.json();
      if (res.ok && d.ok) {
        requestDashboardRoute("home", "", { query: `board=${encodeURIComponent(d.id)}`, reload: true });
      } else if (d.code === "board_limit") {
        $("newBoardForm").hidden = true;
        newBtn.hidden = false;
        showBoardLimitUpsell();
        createBtn.disabled = false;
      } else {
        $("nb_err").textContent = d.error || "Could not create the site.";
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
      title: `You've reached your ${limit}-site limit`,
      text: "Need more sites? Contact support and tell us how many your team manages.",
      cta: "Contact support",
      href: "/help/support?area=billing&return=/dashboard",
    };
  }
  if (plan === "pro") {
    return {
      title: `You've reached your ${limit}-site limit`,
      text: "Agency supports up to 99 sites.",
      cta: "View Agency plan",
      href: "/dashboard/settings",
    };
  }
  const planName = plan === "starter" ? "Starter" : "Free";
  return {
    title: "Need another site?",
    text: `${planName} includes ${limit} site. Pro unlocks up to 3 sites.`,
    cta: "Upgrade to Pro",
    href: "/dashboard/settings",
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
  if (!await showConfirmModal("Delete site", `Delete ${board.name || `/${board.slug}`}? This cannot be undone.`, "Delete site", true)) return;
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
      if (siteId === state.ACTIVE_SITE_ID) { requestDashboardRoute("home", "", { query: "", reload: true }); return; }
      renderBoardSwitcher();
      renderBoardSelect();
      renderBoardsPage();
      $("status").textContent = "Site deleted.";
    } else {
      $("status").textContent = d.error || "Could not delete the site.";
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
      renderBoardSelect();
      $("status").textContent = "Current site updated.";
    } else {
      $("status").textContent = d.error || "Could not switch sites.";
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
  if (!await showConfirmModal("Duplicate site", `Duplicate ${board.name || `/${board.slug}`}? The copy starts unpublished with the same design and players.`, "Duplicate site", false)) return;
  try {
    const res = await fetch("/api/site/duplicate", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId })
    }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      requestDashboardRoute("home", "", { query: `board=${encodeURIComponent(d.id)}`, reload: true });
    } else if (d.code === "board_limit") {
      showBoardLimitUpsell();
    } else {
      $("status").textContent = d.error || "Could not duplicate the site.";
    }
  } catch (err) { logError("duplicate-board", err); $("status").textContent = "Network error."; }
}

export function renderBoardSelect() {
  const sel = $("sidebarBoardSelect");
  const topbarPath = $("lbTopbarSitePath");
  const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
  if (topbarPath) topbarPath.textContent = active?.slug ? `/${active.slug}` : "Web address unavailable";
  if (sel) {
    sel.innerHTML = "";
    if (!state.BOARDS.length) {
      const opt = document.createElement("option");
      opt.textContent = "No sites";
      opt.value = "";
      sel.appendChild(opt);
      sel.disabled = true;
    } else {
      state.BOARDS.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = b.name;
        opt.selected = b.id === state.ACTIVE_SITE_ID;
        sel.appendChild(opt);
      });
      sel.disabled = false;
      sel.onchange = () => {
        const id = sel.value;
        if (id && id !== state.ACTIVE_SITE_ID) requestDashboardRoute("home", "", { query: `board=${encodeURIComponent(id)}`, reload: true });
      };
    }
  }
}

export function renderBoardsPage() {
  const body = $("boardsBody");
  const empty = $("boardsEmpty");
  const addBtn = $("addBoardFromBoards");
  if (!body) return;
  body.innerHTML = "";
  const controls = $("boardsSearch")?.closest(".list-controls");
  if (controls) controls.hidden = state.BOARDS.length === 0;
  if (!state.BOARDS.length) {
    renderEmpty(empty, { icon: "archive", title: "No sites yet", body: "Create your first site to get started.", actions: [{ label: "Create site", id: "boardsCreateEmpty", accent: true }] });
    $("boardsCreateEmpty")?.addEventListener("click", openNewBoardForm);
  } else {
    if (empty) empty.hidden = true;
    state.BOARDS.forEach((b) => {
      const tr = document.createElement("tr");
      const isActive = b.id === state.ACTIVE_SITE_ID;
      const statusClass = b.published ? "pill--good" : "pill--muted";
      const statusText = b.published ? "Published" : "Unpublished";
      tr.innerHTML = `<td><a class="board-table-name${isActive ? ' board-table-name--active' : ''}" href="/dashboard?board=${encodeURIComponent(b.id)}">${esc(b.name)}${isActive ? '<span class="board-table-badge">Current</span>' : ''}</a></td><td>${esc(b.casino || "")}${b.code ? `<span class="mono"> · ${esc(b.code)}</span>` : ""}</td><td><a class="mono" href="/${esc(b.slug)}" target="_blank" rel="noopener noreferrer">/${esc(b.slug)}</a></td><td>${b.players || 0}</td><td><span class="pill ${statusClass}">${statusText}</span></td><td class="ta-r"><button class="btn btn--xs btn--ghost" data-action="edit" type="button">Edit</button><button class="btn btn--xs btn--ghost" data-action="dup" type="button">Duplicate</button><button class="btn btn--xs btn--danger" data-action="del" type="button">Delete</button></td>`;
      tr.querySelector(".board-table-name")?.addEventListener("click", (e) => {
        e.preventDefault();
        requestDashboardRoute("home", "", { query: `board=${encodeURIComponent(b.id)}`, reload: true });
      });
      tr.querySelector('[data-action="edit"]')?.addEventListener("click", () => { requestDashboardRoute("board", "", { query: `board=${encodeURIComponent(b.id)}`, reload: true }); });
      tr.querySelector('[data-action="dup"]')?.addEventListener("click", () => { duplicateBoard(b.id); });
      tr.querySelector('[data-action="del"]')?.addEventListener("click", () => { deleteBoard(b.id); });
      body.appendChild(tr);
    });
    filterBoards();
  }
  if (addBtn) addBtn.onclick = openNewBoardForm;
}

function filterBoards() {
  const input = $("boardsSearch");
  const body = $("boardsBody");
  const empty = $("boardsEmpty");
  if (!input || !body) return;
  const q = input.value.trim().toLowerCase();
  let visible = 0;
  for (const row of body.children) {
    const hide = q && !row.textContent.toLowerCase().includes(q);
    row.hidden = hide;
    if (!hide) visible++;
  }
  if (empty) {
    if (visible > 0) {
      empty.hidden = true;
    } else {
      renderEmpty(empty, q
        ? { icon: "archive", title: "No sites match your search.", body: "Try a different search." }
        : { icon: "archive", title: "No sites yet", body: "Create your first site to get started.", actions: [{ label: "Create site", id: "boardsCreateEmpty", accent: true }] });
      if (!q) $("boardsCreateEmpty")?.addEventListener("click", openNewBoardForm);
    }
  }
}

$("boardsSearch")?.addEventListener("input", filterBoards);
