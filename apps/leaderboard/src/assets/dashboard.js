/* Dashboard: load the user's site, edit brand + players, save back, manage plan. */
// SEC-108: Read CSRF cookie and include it on state-changing requests.
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }
// E2E-005: Redirect to login on session expiry instead of showing stale "Save failed"
function guardAuth(res) { if (res.status === 401) { location.href = "/login"; throw new Error("session expired"); } return res; }
const $ = (id) => document.getElementById(id);
let SLUG = null, EXTRA = {}, ME = null, ACTIVE_SITE_ID = null, BOARDS = [], TEMPLATE_CATALOG = [];
let CURRENT_BRANDING = { template: "classic", accentA: null, accentB: null };
let THEME_SAVING = false;
let LOGO; // undefined = unchanged, null = remove, string = new data URI
let _dirty = false; // FE-002-v9: track unsaved changes for beforeunload warning
function toLocalInput(iso){ if(!iso) return ""; const d=new Date(iso); if(isNaN(d)) return ""; const p=(n)=>String(n).padStart(2,"0"); return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`; }
function fromLocalInput(v){ if(!v) return ""; const d = new Date(v); return isNaN(d) ? "" : d.toISOString(); }
const slugify=(s)=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);

async function init(){
  let me; try { me = await (await fetch("/api/auth/me")).json(); } catch { me=null; }
  if (!me || !me.ok || !me.user) { location.href="/login"; return; }
  ME = me.user;
  const emailEl = $("userEmail"); if (emailEl) emailEl.textContent = ME.email;
  if (ME.isAdmin) { const adminEl = $("adminLink"); if (adminEl) adminEl.hidden = false; }
  renderPlan();
  // Check URL for siteId param
  const urlParams = new URLSearchParams(location.search);
  const requestedSiteId = urlParams.get("board") || null;
  const apiUrl = requestedSiteId ? `/api/site?siteId=${encodeURIComponent(requestedSiteId)}` : "/api/site";
  const res = await fetch(apiUrl); const p = await res.json();
  if (!p.ok) {
    if (ME.isAdmin) { location.href = "/admin"; return; }
    $("loading").innerHTML = '<div class="error-state"><span class="error-icon">⚠</span><p>Couldn\'t load your site.</p><button class="btn btn--sm" id="retryBtn">Try again</button></div>';
    document.getElementById("retryBtn")?.addEventListener("click", () => location.reload()); return;
  }
  SLUG = p.slug; ACTIVE_SITE_ID = p.siteId || null;
  BOARDS = p.boards || [];
  TEMPLATE_CATALOG = Array.isArray(p.templates) ? p.templates : [];
  renderBoardSwitcher();
  renderSidebarBoardSwitcher();
  renderBoardsPage();
  const d = p.data||{}; const b = d.brand||{};
  loadStats(); // non-blocking; fills the analytics card when it lands
  EXTRA = { chips: d.partner?.chips, whyStats: d.whyStats, rules: d.rules, socials: d.socials };
  $("f_name").value=b.name||""; $("f_tagline").value=b.tagline||""; $("f_casino").value=b.casino||"Stake";
  $("f_code").value=b.code||""; $("f_cta").value=b.ctaUrl||""; $("f_pool").value=b.prizePool||"";
  $("f_period").value=b.period||"Monthly"; $("f_ends").value=toLocalInput(d.endsAt); $("f_blurb").value=d.partner?.blurb||"";
  renderPlayers(d.players||[]);
  renderBranding(d.branding||{});
  renderArchives(p.archives||[]);
  renderDomain();
  renderOverlay();
  renderNotifications(p.notify || {});
  if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
  // Show domain TLS status if a custom domain is set
  if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  // Published toggle
  const pubToggle = $("pubToggle");
  if (pubToggle) pubToggle.checked = p.published !== false;
  $("a_label").placeholder = new Date().toLocaleString("en-US",{month:"long",year:"numeric",timeZone:"UTC"});
  $("liveLink").textContent = location.host + "/" + SLUG; $("liveLink").href = "/" + SLUG;
  $("loading").hidden=true; $("dash").hidden=false;
  setupShell();
  const initialNav = new URLSearchParams(location.search).get("nav");
  if (initialNav && document.querySelector(`section[data-page="${initialNav}"]`)) navTo(initialNav);
  renderOverviewSummary();
  // FE-002-v9: track unsaved changes
  const markDirty = () => { _dirty = true; const sb = $("savebar"); if (sb) sb.hidden = false; };
  $("dash").addEventListener("input", markDirty);
  $("dash").addEventListener("change", markDirty);
  window.addEventListener("beforeunload", (e)=>{ if(_dirty){ e.preventDefault(); e.returnValue=""; } });
  if (urlParams.get("upgraded")) {
    $("status").textContent = "Payment received — Pro activates once the network confirms (usually minutes).";
  }
}

function renderBoardSwitcher(){
  const list = $("boardList");
  if (list) {
    list.innerHTML = "";
    BOARDS.forEach(b => {
      const el = document.createElement("div");
      const isActive = b.id === ACTIVE_SITE_ID;
      el.className = "board-item" + (isActive ? " board-item--active" : "");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      const sponsor = [b.casino, b.code].filter(Boolean).join(" · ");
      el.innerHTML = `<div class="board-info"><div class="board-row-top"><span class="board-slug">/${esc(b.slug)}</span><span class="board-name">${esc(b.name)}</span></div>${sponsor ? `<div class="board-sponsor">${esc(sponsor)}</div>` : ""}</div>${isActive ? '<span class="board-badge">editing</span>' : '<span class="board-actions"><button class="btn btn--sm" data-action="setActive" title="Set as active board" type="button">★</button><button class="btn btn--sm" data-action="delete" title="Delete board" type="button">×</button></span>'}`;
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
      const limit = ME?.limits?.boards || 1;
      countEl.textContent = BOARDS.length + " / " + limit + " boards";
    }
  }
  const newBtn = $("newBoard");
  if (newBtn) {
    const limit = ME?.limits?.boards || 1;
    const atLimit = BOARDS.length >= limit;
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
    $("nb_err").textContent = "Creating…";
    createBtn.disabled = true;
    try {
      const casino = $("nb_casino").value.trim();
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
    } catch { $("nb_err").textContent = "Network error."; createBtn.disabled = false; }
  };
}

function boardLimitOffer(){
  const plan = ME?.plan || "free";
  const limit = ME?.limits?.boards || 1;
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

function showBoardLimitUpsell(){
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

function hideBoardLimitUpsell(){
  const panel = $("boardLimitUpsell");
  if (panel) panel.hidden = true;
}

async function deleteBoard(siteId) {
  const board = BOARDS.find(b => b.id === siteId);
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
      BOARDS = BOARDS.filter(b => b.id !== siteId);
      if (siteId === ACTIVE_SITE_ID) { location.href = "/dashboard"; return; }
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      renderBoardsPage();
      $("status").textContent = "Board deleted.";
    } else {
      $("status").textContent = d.error || "Could not delete board.";
    }
  } catch { $("status").textContent = "Network error."; }
}

async function setActiveBoard(siteId) {
  try {
    const res = await fetch("/api/site/active", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ siteId })
    }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      ACTIVE_SITE_ID = siteId;
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      $("status").textContent = "Active board updated.";
    } else {
      $("status").textContent = d.error || "Could not set active board.";
    }
  } catch { $("status").textContent = "Network error."; }
}

function openNewBoardForm() {
  const newBtn = $("newBoard");
  if (newBtn && !newBtn.hidden) newBtn.click();
}

async function duplicateBoard(siteId) {
  const board = BOARDS.find(b => b.id === siteId);
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
  } catch { $("status").textContent = "Network error."; }
}

function renderSidebarBoardSwitcher() {
  const nameEl = $("activeBoardName");
  const metaEl = $("activeBoardMeta");
  const sel = $("sidebarBoardSelect");
  const manage = $("manageBoardsBtn");
  const active = BOARDS.find(b => b.id === ACTIVE_SITE_ID);
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
    if (!BOARDS.length) {
      const opt = document.createElement("option");
      opt.textContent = "No boards";
      opt.value = "";
      sel.appendChild(opt);
      sel.disabled = true;
    } else {
      BOARDS.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = `${b.name} /${b.slug}`;
        opt.selected = b.id === ACTIVE_SITE_ID;
        sel.appendChild(opt);
      });
      sel.disabled = false;
      sel.onchange = () => {
        const id = sel.value;
        if (id && id !== ACTIVE_SITE_ID) location.href = "/dashboard?board=" + encodeURIComponent(id);
      };
    }
  }
  if (manage) manage.onclick = () => navTo("boards");
}

function renderBoardsPage() {
  const body = $("boardsBody");
  const empty = $("boardsEmpty");
  const addBtn = $("addBoardFromBoards");
  if (!body) return;
  body.innerHTML = "";
  if (!BOARDS.length) {
    if (empty) empty.hidden = false;
  } else {
    if (empty) empty.hidden = true;
    BOARDS.forEach(b => {
      const tr = document.createElement("tr");
      const isActive = b.id === ACTIVE_SITE_ID;
      const tpl = TEMPLATE_CATALOG.find(t => t.id === (b.template || "classic"));
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

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function renderPlan(){
  const plan = ME.plan || "free";
  const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency" };
  $("planBadge").textContent = plan.toUpperCase() + " PLAN";
  $("planName").textContent = planNames[plan] || plan;
  if (plan === "agency" || plan === "pro") {
    const until = ME.planExpiresAt ? new Date(ME.planExpiresAt).toLocaleDateString() : null;
    // Pro/Agency player cap is 9999 — marketed as "unlimited"; keep the wording consistent.
    const playersLabel = ME.limits.players >= 9999 ? "unlimited players" : `up to ${ME.limits.players} players`;
    $("planMeta").textContent = until ? `Active until ${until} · ${playersLabel} · no badge` : `Lifetime · ${playersLabel} · no badge`;
    $("goPro").textContent = "Extend " + (planNames[plan] || plan) + " (+31 days)";
  } else if (plan === "starter") {
    $("planMeta").textContent = `Up to ${ME.limits.players} players · no badge · CSV import`;
    $("goPro").textContent = "Upgrade to Pro — $" + (ME.proPrice || 29) + "/mo";
  } else {
    $("planMeta").textContent = `Up to ${ME.limits.players} players · YourRank badge on your page`;
    $("goPro").textContent = `Upgrade — plans from $12/mo`;
  }
}
let checkingOut = false;
async function checkout(btn){
  if (checkingOut) return; checkingOut = true;
  btn.disabled = true; const orig = btn.textContent; btn.textContent = "Opening checkout…";
  try {
    const res = await fetch("/api/billing/checkout", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ plan: "pro" }) }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok && d.url) { location.href = d.url; return; }
    $("status").textContent = d.error || "Couldn't start checkout.";
  } catch { $("status").textContent = "Network error."; }
  btn.disabled = false; btn.textContent = orig; checkingOut = false;
}
function playerRow(p={name:"",wagered:"",prize:""}){
  const tr=document.createElement("tr");
  tr.innerHTML = `<td class="rank"></td><td><input class="p-name" placeholder="Player name" value="${esc(p.name)}"></td><td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td><td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td><td class="act"><button class="row-x" title="Remove" aria-label="Remove player" type="button">×</button></td>`;
  tr.querySelector(".row-x").addEventListener("click",()=>{tr.remove();renumber();toggleEmpty();});
  return tr;
}
function renderPlayers(list){ const b=$("rows"); b.innerHTML=""; list.forEach(p=>b.appendChild(playerRow(p))); renumber(); toggleEmpty(); }
function renumber(){
  const rows=[...$("rows").children];
  rows.forEach((tr,i)=>tr.querySelector(".rank").textContent=String(i+1).padStart(2,"0"));
  if (ME) $("pCount").textContent = `${rows.length} / ${ME.limits.players === 999 ? "∞" : ME.limits.players}`;
}
function toggleEmpty(){ $("playersEmpty").hidden=$("rows").children.length>0; }
$("addRow").addEventListener("click",()=>{
  if (ME && $("rows").children.length >= ME.limits.players && ME.limits.players < 999) {
    // E2E-011: Use #limitMsg (next to the Add button) instead of #status
    // (savebar) so upgrade prompts don't clobber save confirmations.
    const planNames = { free: "Free", starter: "Starter", pro: "Pro" };
    const msg = ME.plan==="pro" || ME.plan==="agency" ? `Your plan allows up to ${ME.limits.players} players.` : `${planNames[ME.plan]||"Your"} plan allows ${ME.limits.players} players. Upgrade for more.`;
    const el = $("limitMsg") || $("status");
    el.textContent = msg;
    setTimeout(()=>el.textContent="",5000); return;
  }
  $("rows").appendChild(playerRow());renumber();toggleEmpty();
});
function collect(){
  const players=[...$("rows").children].map(tr=>({name:tr.querySelector(".p-name").value.trim(),wagered:parseFloat(tr.querySelector(".p-wager").value)||0,prize:parseFloat(tr.querySelector(".p-prize").value)||0})).filter(p=>p.name);
  const brandName = $("f_name").value.trim();
  const out = { name: brandName, brand:{name:brandName,tagline:$("f_tagline").value.trim(),casino:$("f_casino").value.trim()||"Stake",code:$("f_code").value.trim(),ctaUrl:$("f_cta").value.trim(),prizePool:$("f_pool").value.trim(),period:$("f_period").value.trim()||"Monthly"}, endsAt:fromLocalInput($("f_ends").value), partner:{blurb:$("f_blurb").value.trim(),chips:EXTRA.chips}, whyStats:EXTRA.whyStats, rules:EXTRA.rules, socials:EXTRA.socials, players };
  // Include published state from toggle
  const pubToggle = $("pubToggle");
  if (pubToggle) out.published = pubToggle.checked;
  if (ACTIVE_SITE_ID) out.siteId = ACTIVE_SITE_ID;
  if (ME && ME.plan !== "free") {
    out.branding = { accentA: $("c_a").value, accentB: $("c_b").value };
    if (LOGO !== undefined) out.branding.logo = LOGO;
  }
  const tplEl = $("f_template");
  if (tplEl) out.branding = { ...(out.branding || {}), template: tplEl.value };
  // Custom domain is provisioned through its own Verify & Provision TLS endpoint
  // (/api/site/domain), so it is intentionally not part of the general save.
  out.notify = {
    discord_webhook_url: $("f_webhook")?.value.trim() || null,
    telegram_chat_id: $("f_tgChatId")?.value.trim() || null,
    telegram_notify: $("f_tgNotify")?.checked || false,
  };
  return out;
}

/* --- templates + branding --- */
function currentTemplate(){
  return TEMPLATE_CATALOG.find((template) => template.id === CURRENT_BRANDING.template) || TEMPLATE_CATALOG[0];
}
function previewUrl(template, accentA, accentB){
  const params = new URLSearchParams({ board: ACTIVE_SITE_ID, template });
  if (accentA && accentB) { params.set("accentA", accentA); params.set("accentB", accentB); }
  return "/dashboard/preview?" + params.toString();
}
function renderTemplateGallery(){
  const gallery = $("templateGallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  TEMPLATE_CATALOG.forEach((template) => {
    const selected = template.id === CURRENT_BRANDING.template;
    const defaultPreset = template.presets?.[0] || {};
    const accentA = selected && CURRENT_BRANDING.accentA ? CURRENT_BRANDING.accentA : defaultPreset.accentA;
    const accentB = selected && CURRENT_BRANDING.accentB ? CURRENT_BRANDING.accentB : defaultPreset.accentB;
    const card = document.createElement("article");
    card.className = "template-card" + (selected ? " is-selected" : "");
    card.dataset.template = template.id;
    card.innerHTML = `<div class="template-preview"><iframe loading="lazy" tabindex="-1" aria-hidden="true" title="${esc(template.name)} preview"></iframe></div><div class="template-meta"><div><b>${esc(template.name)}</b><span>${esc(template.description)}</span></div><button class="btn btn--sm ${selected ? "btn--accent" : "btn--ghost"}" type="button" aria-pressed="${selected}">${selected ? "Applied" : "Apply"}</button></div>`;
    const iframe = card.querySelector("iframe");
    iframe.src = previewUrl(template.id, accentA, accentB);
    const apply = () => applyTemplate(template);
    card.querySelector("button").addEventListener("click", apply);
    card.querySelector(".template-preview").addEventListener("click", apply);
    gallery.appendChild(card);
  });
}
function renderColorPresets(){
  const list = $("colorPresets");
  const template = currentTemplate();
  if (!list || !template) return;
  list.innerHTML = "";
  (template.presets || []).forEach((preset) => {
    const active = preset.accentA.toLowerCase() === String(CURRENT_BRANDING.accentA || "").toLowerCase()
      && preset.accentB.toLowerCase() === String(CURRENT_BRANDING.accentB || "").toLowerCase();
    const button = document.createElement("button");
    button.className = "preset-btn" + (active ? " is-selected" : "");
    button.type = "button";
    button.setAttribute("aria-pressed", String(active));
    button.innerHTML = `<span class="preset-swatch"><i data-color="${esc(preset.accentA)}"></i><i data-color="${esc(preset.accentB)}"></i></span><span>${esc(preset.name)}</span>`;
    button.querySelectorAll("[data-color]").forEach((swatch) => { swatch.style.background = swatch.dataset.color; });
    button.addEventListener("click", () => saveTheme(template.id, preset.accentA, preset.accentB, preset.name));
    list.appendChild(button);
  });
}
function updateThemeSelection(){
  const tpl = $("f_template"); if (tpl) tpl.value = CURRENT_BRANDING.template;
  if (CURRENT_BRANDING.accentA) $("c_a").value = CURRENT_BRANDING.accentA;
  if (CURRENT_BRANDING.accentB) $("c_b").value = CURRENT_BRANDING.accentB;
  renderTemplateGallery();
  renderColorPresets();
}
async function saveTheme(template, accentA, accentB, label){
  if (THEME_SAVING) return;
  THEME_SAVING = true;
  const status = $("templateStatus");
  if (status) status.textContent = "Applying…";
  document.querySelectorAll(".template-card button,.preset-btn,#applyCustomColors,#colorsReset").forEach((button) => { button.disabled = true; });
  const body = { siteId: ACTIVE_SITE_ID, template };
  if (ME.plan !== "free" && accentA && accentB) { body.accentA = accentA; body.accentB = accentB; }
  try {
    const res = await fetch("/api/site/theme", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify(body),
    }).then(guardAuth);
    const data = await res.json();
    if (!res.ok || !data.ok) {
      if (status) status.textContent = data.error || "Could not apply that design.";
      return;
    }
    CURRENT_BRANDING = { ...CURRENT_BRANDING, ...data.branding, template };
    if (ME.plan !== "free" && accentA && accentB) {
      CURRENT_BRANDING.accentA = accentA;
      CURRENT_BRANDING.accentB = accentB;
    }
    const active = BOARDS.find(b => b.id === ACTIVE_SITE_ID);
    if (active) active.template = template;
    updateThemeSelection();
    renderSidebarBoardSwitcher();
    renderBoardsPage();
    if (status) status.textContent = `${label || currentTemplate()?.name || "Design"} applied to /${SLUG}.`;
  } catch {
    if (status) status.textContent = "Network error. Try again.";
  } finally {
    THEME_SAVING = false;
    document.querySelectorAll(".template-card button,.preset-btn,#applyCustomColors,#colorsReset").forEach((button) => { button.disabled = false; });
  }
}
function applyTemplate(template){
  const preset = template.presets?.[0];
  saveTheme(template.id, preset?.accentA, preset?.accentB, template.name);
}
function renderBranding(br){
  CURRENT_BRANDING = {
    template: br.template || "classic",
    accentA: br.accentA || null,
    accentB: br.accentB || null,
  };
  const paid = ME.plan !== "free";
  $("brandBody").hidden = !paid; $("brandLock").hidden = paid;
  updateThemeSelection();
  if (br.hasLogo) { $("logoPreview").src = "/logo/" + SLUG + "?t=" + Date.now(); $("logoPreview").hidden = false; $("logoClear").hidden = false; }
}
$("logoPick").setAttribute("aria-label", "Upload logo");
$("logoPick").addEventListener("click",()=>$("logoFile").click());
$("logoClear").setAttribute("aria-label", "Remove logo");
$("logoClear").addEventListener("click",()=>{ LOGO = null; $("logoPreview").hidden = true; $("logoClear").hidden = true; $("status").textContent = "Logo will be removed when you save."; });
$("logoFile").addEventListener("change",()=>{
  const f = $("logoFile").files[0]; if (!f) return;
  const img = new Image();
  img.onload = ()=>{
    const max = 512, scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    let uri = c.toDataURL("image/png");
    if (uri.length > 240000) uri = c.toDataURL("image/jpeg", 0.85);
    if (uri.length > 240000) { $("status").textContent = "That image is too big even after resizing. Try a simpler one."; return; }
    LOGO = uri;
    $("logoPreview").src = uri; $("logoPreview").hidden = false; $("logoClear").hidden = false;
    $("status").textContent = "Logo ready — hit Save to publish it.";
    URL.revokeObjectURL(img.src);
  };
  img.onerror = ()=>{ $("status").textContent = "Couldn't read that image."; };
  img.src = URL.createObjectURL(f);
  $("logoFile").value = "";
});
$("applyCustomColors").addEventListener("click",()=>saveTheme(CURRENT_BRANDING.template,$("c_a").value,$("c_b").value,"Custom colors"));
$("colorsReset").addEventListener("click",()=>{ const preset=currentTemplate()?.presets?.[0]; if(preset) saveTheme(CURRENT_BRANDING.template,preset.accentA,preset.accentB,preset.name); });
$("brandUpgrade").addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });

/* --- paste / import --- */
function parseImport(text){
  const num = (s)=>parseFloat(String(s||"").replace(/[$,\s]/g,""))||0;
  return String(text||"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
    const parts = l.split(/\t|,|;/).map(s=>s.trim()).filter(s=>s!=="");
    if (!parts.length || !parts[0]) return null;
    return { name: parts[0].slice(0,40), wagered: num(parts[1]), prize: num(parts[2]) };
  }).filter(Boolean);
}
$("importBtn").addEventListener("click",()=>{ const p=$("importPanel"); p.hidden=!p.hidden; if(!p.hidden) $("importText").focus(); });
$("importText").addEventListener("input",()=>{
  const n = parseImport($("importText").value).length;
  $("importPreview").textContent = n + (n===1?" player":" players") + " detected";
  $("importApply").disabled = n===0;
});
$("importApply").addEventListener("click",()=>{
  let parsed = parseImport($("importText").value);
  if (!parsed.length) return;
  const replace = $("importReplace").checked;
  const existing = replace ? [] : [...$("rows").children].map(tr=>({name:tr.querySelector(".p-name").value.trim(),wagered:parseFloat(tr.querySelector(".p-wager").value)||0,prize:parseFloat(tr.querySelector(".p-prize").value)||0})).filter(p=>p.name);
  let all = existing.concat(parsed);
  let note = "";
  if (ME && ME.limits.players < 999 && all.length > ME.limits.players) { note = ` (cut to your ${ME.limits.players}-player limit)`; all = all.slice(0, ME.limits.players); }
  renderPlayers(all);
  $("importText").value = ""; $("importPreview").textContent = "0 players detected"; $("importApply").disabled = true; $("importPanel").hidden = true;
  $("status").textContent = `${parsed.length} imported${note} — hit Save to publish.`;
});

/* --- CSV import --- */
function parseCsvText(text) {
  const num = (s) => parseFloat(String(s || "").replace(/[$,\s]/g, "")) || 0;
  // Auto-detect separator: check first non-empty line for tabs vs commas
  const firstLine = String(text || "").split(/\r?\n/).find(l => l.trim()) || "";
  const sep = firstLine.includes("\t") ? /\t/ : /,/;
  return String(text || "").split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("//")).map(l => {
    const parts = l.split(sep).map(s => s.trim()).filter(s => s !== "");
    if (!parts.length || !parts[0]) return null;
    // Skip header row if first cell looks like "name"
    if (parts[0].toLowerCase() === "name" || parts[0].toLowerCase() === "player") return null;
    return { name: parts[0].slice(0, 40), wagered: num(parts[1]), prize: num(parts[2]) };
  }).filter(Boolean);
}

$("csvImportBtn")?.addEventListener("click", () => $("csvFileInput").click());

$("csvFileInput")?.addEventListener("change", () => {
  const f = $("csvFileInput").files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseCsvText(reader.result);
    if (!parsed.length) { $("status").textContent = "No players found in that CSV. Expected columns: name, wagered, prize"; return; }
    // Show preview in the import panel textarea
    $("importPanel").hidden = false;
    $("importText").value = parsed.map(p => `${p.name}\t${p.wagered}\t${p.prize}`).join("\n");
    $("importText").dispatchEvent(new Event("input"));
    $("status").textContent = `CSV loaded: ${parsed.length} players detected. Review and click "Add to table".`;
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
  a.href = url; a.download = "yourrank-players-template.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

/* --- custom domain (Pro) --- */
function renderNotifications(n){
  const paid = ME.plan !== "free";
  $("notifyBody").hidden = !paid; $("notifyLock").hidden = paid;
  if (!paid) {
    $("notifyUpgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); location.href="/dashboard/billing"; });
    return;
  }
  const wh = $("f_webhook"); if (wh && n.discord_webhook_url) { wh.value = ""; wh.placeholder = "Webhook configured ✓ (enter new URL to change)"; }
  const tg = $("f_tgNotify"); if (tg) tg.checked = !!n.telegram_notify;
  const tgChat = $("f_tgChatId"); if (tgChat) tgChat.value = n.telegram_chat_id || "";
}

function renderOverlay(){
  const pro = ME.plan === "pro" || ME.plan === "agency";
  const body = $("overlayBody"), lock = $("overlayLock");
  if (body) body.hidden = !pro;
  if (lock) lock.hidden = pro;
  if (!pro) return;
  const overlayUrl = location.origin + "/" + SLUG + "/overlay";
  const urlEl = $("overlayUrl");
  if (urlEl) urlEl.textContent = overlayUrl;
  const preview = $("overlayPreview");
  if (preview) preview.href = overlayUrl;
  const copy = $("overlayCopy");
  if (copy && !copy._wired) {
    copy._wired = true;
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(overlayUrl); copy.textContent = "Copied!"; }
      catch { copy.textContent = "Copy failed"; }
      setTimeout(() => { copy.textContent = "📋 Copy"; }, 1500);
    });
  }
}

function renderDomain(){
  const pro = ME.plan === "pro" || ME.plan === "agency";
  const domainBody = $("domainBody");
  const domainLock = $("domainLock");
  if (domainBody) domainBody.hidden = !pro;
  if (domainLock) domainLock.hidden = pro;

  // Domain verify button
  const verifyBtn = $("domainVerify");
  if (verifyBtn) {
    verifyBtn.onclick = async () => {
      const domain = $("f_domain").value.trim().toLowerCase();
      if (!domain) { $("domainStatus").textContent = "Enter a domain first."; return; }
      $("domainStatus").textContent = "Verifying…";
      verifyBtn.disabled = true;
      try {
        const body = { domain };
        if (ACTIVE_SITE_ID) body.siteId = ACTIVE_SITE_ID;
        const res = await fetch("/api/site/domain/verify", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (d.ok) {
          renderDomainStatus(d.status, d.message);
        } else {
          $("domainStatus").innerHTML = `<span class="domain-error">${esc(d.error || "Verification failed.")}</span>`;
        }
      } catch {
        $("domainStatus").innerHTML = `<span class="domain-error">Network error.</span>`;
      }
      verifyBtn.disabled = false;
    };
  }
}

function renderDomainStatus(status, message) {
  const el = $("domainStatus");
  if (!el) return;
  if (status === "active") {
    el.innerHTML = `<span class="domain-ok">✅ ${esc(message || "TLS active")}</span>`;
    } else if (status === "pending") {
      el.innerHTML = `<span class="domain-pending">⏳ ${esc(message || "TLS provisioning in progress")}</span>`;
    } else if (status === "error") {
      el.innerHTML = `<span class="domain-error">❌ ${esc(message || "Error")}</span>`;
    } else if (status === "saved") {
      el.innerHTML = `<span class="domain-saved">💾 ${esc(message || "Domain saved")}</span>`;
  } else {
    el.textContent = "";
  }
}

/* --- past winners / close out --- */
function renderArchives(list){
  const box = $("archList"); box.innerHTML = "";
  $("archEmpty").hidden = list.length > 0;
  list.forEach(a=>{
    const row = document.createElement("div"); row.className = "arch-row";
    const when = new Date(a.at).toLocaleDateString();
    row.innerHTML = `<span class="arch-label"></span><span class="hint">${a.players} players · closed ${when}</span><button class="btn btn--xs btn--ghost arch-del" type="button">Delete</button>`;
    row.querySelector(".arch-label").textContent = a.label;
    row.querySelector(".arch-del").addEventListener("click", async ()=>{
      if (!confirm(`Delete the "${a.label}" archive? It disappears from your page too.`)) return;
      const body = { id: a.id };
      if (ACTIVE_SITE_ID) body.siteId = ACTIVE_SITE_ID;
      const res = await fetch("/api/site/archive/delete",{method:"POST",credentials:"include",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(body)});
      const d = await res.json();
      if (res.ok && d.ok) { row.remove(); if(!$("archList").children.length) $("archEmpty").hidden=false; $("status").textContent="Archive deleted."; }
      else $("status").textContent = d.error || "Couldn't delete that.";
    });
    box.appendChild(row);
  });
}
$("a_go").addEventListener("click", async ()=>{
  const btn = $("a_go"), status = $("status");
  if (![...$("rows").children].length) { status.textContent = "The board is empty — nothing to close out."; return; }
  const clear = $("a_clear").value;
  const warn = clear==="players" ? "save the current board as past winners, then CLEAR the player list" : clear==="wagers" ? "save the current board as past winners, then reset every wager to 0" : "save the current board as past winners";
  if (!confirm(`This will ${warn}. Continue?`)) return;
  btn.disabled = true; btn.textContent = "Closing out…";
  try {
    // Persist any unsaved edits first so the snapshot matches what's on screen.
    const savePayload = collect();
    const saveRes = await fetch("/api/site",{method:"PUT",credentials:"include",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(savePayload)}).then(guardAuth);
    const saved = await saveRes.json();
    if (!saveRes.ok || !saved.ok) { status.textContent = saved.error || "Couldn't save before archiving."; btn.disabled=false; btn.textContent="Close out period"; return; }
    const archiveBody = { label:$("a_label").value.trim(), clear };
    if (ACTIVE_SITE_ID) archiveBody.siteId = ACTIVE_SITE_ID;
    const res = await fetch("/api/site/archive",{method:"POST",credentials:"include",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(archiveBody)});
    const d = await res.json();
    if (res.ok && d.ok) {
      const apiUrl2 = ACTIVE_SITE_ID ? `/api/site?siteId=${encodeURIComponent(ACTIVE_SITE_ID)}` : "/api/site";
      const p = await (await fetch(apiUrl2)).json();
      if (p.ok) { renderPlayers(p.data.players||[]); renderArchives(p.archives||[]); }
      $("a_label").value = "";
      status.textContent = `"${d.label}" closed out — it's on your page now.`;
    } else status.textContent = d.error || "Couldn't close out the period.";
  } catch { status.textContent = "Network error."; }
  btn.disabled = false; btn.textContent = "Close out period";
});
$("save").addEventListener("click", async ()=>{
  const btn=$("save"),status=$("status"); btn.disabled=true;btn.textContent="Saving…";status.textContent="";
  // E2E-011: Clear limit message when saving to avoid stale upgrade prompts.
  const limitEl = $("limitMsg"); if (limitEl) limitEl.textContent = "";
  try {
    const payload = collect();
    const res=await fetch("/api/site",{method:"PUT",credentials:"include",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(payload)}).then(guardAuth);
    const d=await res.json();
    if(res.ok&&d.ok){ status.textContent="Saved. Your page is updated."; _dirty=false; const sb=$("savebar"); if(sb) sb.hidden=true; const active = BOARDS.find(b => b.id === ACTIVE_SITE_ID); if (active) { active.name = payload.name; active.casino = payload.brand?.casino || active.casino; active.code = payload.brand?.code || active.code; } renderBoardSwitcher(); renderSidebarBoardSwitcher(); renderBoardsPage(); } else status.textContent=d.error||"Save failed.";
  } catch{ status.textContent="Network error."; }
  btn.disabled=false;btn.textContent="Save changes";
  // FE-004: Only auto-clear success messages; errors stay until next action.
  if(status.textContent==="Saved. Your page is updated.") setTimeout(()=>{ if(status.textContent==="Saved. Your page is updated.") status.textContent=""; },6000);
});
async function loadStats(){
  const statsUrl = ACTIVE_SITE_ID ? `/api/site/stats?siteId=${encodeURIComponent(ACTIVE_SITE_ID)}` : "/api/site/stats";
  let s; try { const r = await fetch(statsUrl); const d = await r.json(); if(!r.ok||!d.ok) return; s = d.stats; } catch { return; }
  const fmt = (n)=> n>=10000 ? (n/1000).toFixed(1).replace(/\.0$/,"")+"k" : String(n);
  $("st_views7").textContent = fmt(s.last7.views);
  $("st_views30").textContent = fmt(s.last30.views);
  $("st_copies30").textContent = fmt(s.last30.copies);
  $("st_clicks30").textContent = fmt(s.last30.clicks);
  const bars = $("statBars"); const days = s.days||[];
  const max = Math.max(1, ...days.map(x=>x.views));
  bars.innerHTML = days.map(x=>{
    const h = Math.max(2, Math.round((x.views/max)*100));
    const nice = new Date(x.day+"T00:00:00Z").toUTCString().slice(5,11);
    return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views, ${x.copies} copies, ${x.clicks} clicks"></div>`;
  }).join("");
  if (days.length) $("statFrom").textContent = new Date(days[0].day+"T00:00:00Z").toUTCString().slice(5,11);
  if (s.last30.views===0 && s.last30.copies===0 && s.last30.clicks===0) $("statsEmpty").hidden = false;
  // Mirror the headline view figures onto the Overview tab.
  const ov7 = $("ov_views7"); if (ov7) ov7.textContent = fmt(s.last7.views);
  const ovBars = $("ov_bars");
  if (ovBars) {
    ovBars.innerHTML = days.map(x=>{
      const h = Math.max(2, Math.round((x.views/max)*100));
      const nice = new Date(x.day+"T00:00:00Z").toUTCString().slice(5,11);
      return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views"></div>`;
    }).join("");
    if (days.length) $("ov_barsFrom").textContent = new Date(days[0].day+"T00:00:00Z").toUTCString().slice(5,11);
    if (!days.length || s.last30.views===0) $("ov_barsEmpty").hidden = false;
  }
  const shareStep = $("ov_step_share");
  if (shareStep && s.last7.views > 0) shareStep.classList.add("is-done");
}

$("logout")?.addEventListener("click", async (e)=>{ e.preventDefault(); await fetch("/api/auth/logout",{method:"POST",credentials:"include",headers:{"x-csrf-token":getCsrf()}}); location.href="/login"; });
$("upgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });
$("goPro")?.addEventListener("click",()=>checkout($("goPro")));
$("domainUpgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });
$("overlayUpgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });
$("testDiscord")?.addEventListener("click", async () => {
  const s = $("testDiscordStatus"); if(s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "discord" }) });
    const d = await r.json();
    if(s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch(e) { if(s) s.textContent = "Network error."; }
});
$("testTelegram")?.addEventListener("click", async () => {
  const s = $("testTelegramStatus"); if(s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "telegram" }) });
    const d = await r.json();
    if(s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch(e) { if(s) s.textContent = "Network error."; }
});
/* --- dashboard shell: sidebar navigation + mobile drawer --- */
function navTo(page){
  document.querySelectorAll(".lb-nav").forEach(n => n.classList.toggle("is-on", n.dataset.nav === page));
  document.querySelectorAll(".lb-page").forEach(p => p.classList.toggle("is-on", p.dataset.page === page));
  closeDrawer();
  if (page === "overview") renderOverviewSummary();
  const main = document.querySelector(".lb-main"); if (main) main.scrollIntoView({ block: "start" });
}
function openDrawer(){ $("lbSide")?.classList.add("is-open"); document.querySelector(".lb-backdrop")?.classList.add("is-open"); }
function closeDrawer(){ $("lbSide")?.classList.remove("is-open"); document.querySelector(".lb-backdrop")?.classList.remove("is-open"); }
function setupShell(){
  if (setupShell._done) return; setupShell._done = true;
  let backdrop = document.querySelector(".lb-backdrop");
  if (!backdrop) { backdrop = document.createElement("div"); backdrop.className = "lb-backdrop"; document.body.appendChild(backdrop); }
  backdrop.addEventListener("click", closeDrawer);
  document.querySelectorAll(".lb-nav").forEach(btn => btn.addEventListener("click", () => navTo(btn.dataset.nav)));
  document.querySelectorAll("[data-jump]").forEach(el => el.addEventListener("click", () => navTo(el.dataset.jump)));
  document.querySelectorAll(".lb-menu").forEach(btn => btn.addEventListener("click", (e) => { e.stopPropagation(); openDrawer(); }));
}

/* --- Overview summary tiles / top players / setup checklist --- */
function currentPlayers(){
  return [...$("rows").children].map(tr => ({
    name: tr.querySelector(".p-name").value.trim(),
    wagered: parseFloat(tr.querySelector(".p-wager").value) || 0,
    prize: parseFloat(tr.querySelector(".p-prize").value) || 0,
  })).filter(p => p.name);
}
function fmtMoney(n){ return n ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"; }
function resetsIn(){
  const v = $("f_ends")?.value; if (!v) return "—";
  const end = new Date(v); if (isNaN(end)) return "—";
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  return d >= 1 ? `${d}d` : `${h}h`;
}
function renderOverviewSummary(){
  if (!$("ov_pool")) return;
  const players = currentPlayers();
  $("ov_pool").textContent = ($("f_pool")?.value.trim()) || "—";
  const cap = ME && ME.limits.players < 999 ? " / " + ME.limits.players : "";
  $("ov_players").textContent = players.length + cap;
  $("ov_resets").textContent = resetsIn();
  const top = $("ov_top"), topEmpty = $("ov_topEmpty");
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

init();
