/* Dashboard: load the user's site, edit brand + players, save back, manage plan. */
// SEC-108: Read CSRF cookie and include it on state-changing requests.
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }
const $ = (id) => document.getElementById(id);
let SLUG = null, EXTRA = {}, ME = null, ACTIVE_SITE_ID = null, BOARDS = [];
let LOGO; // undefined = unchanged, null = remove, string = new data URI
const DEFAULT_A = "#5ad9ff", DEFAULT_B = "#7b8cff";
function toLocalInput(iso){ if(!iso) return ""; const d=new Date(iso); if(isNaN(d)) return ""; const p=(n)=>String(n).padStart(2,"0"); return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`; }
function fromLocalInput(v){ if(!v) return ""; return v.length===16 ? `${v}:00Z` : new Date(v).toISOString(); }
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
    $("loading").textContent = "Couldn't load your site."; return;
  }
  SLUG = p.slug; ACTIVE_SITE_ID = p.siteId || null;
  BOARDS = p.boards || [];
  renderBoardSwitcher();
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
  renderNotifications(p.notify || {});
  if (p.customDomain !== undefined) $("f_domain").value = p.customDomain || "";
  // Show domain TLS status if a custom domain is set
  if (p.customDomain && p.domainStatus) renderDomainStatus(p.domainStatus, "");
  // Published toggle
  const pubToggle = $("pubToggle");
  if (pubToggle) pubToggle.checked = p.published !== false;
  $("a_label").placeholder = new Date().toLocaleString("en-US",{month:"long",year:"numeric",timeZone:"UTC"});
  $("liveLink").textContent = location.host + "/" + SLUG; $("liveLink").href = "/" + SLUG; $("viewLive").href = "/" + SLUG;
  $("loading").hidden=true; $("dash").hidden=false;
  if (urlParams.get("upgraded")) {
    $("status").textContent = "Payment received — Pro activates once the network confirms (usually minutes).";
  }
}

function renderBoardSwitcher(){
  const list = $("boardList"); if (!list) return;
  list.innerHTML = "";
  BOARDS.forEach(b => {
    const el = document.createElement("div");
    const isActive = b.id === ACTIVE_SITE_ID;
    el.className = "board-item" + (isActive ? " board-item--active" : "");
    el.innerHTML = `<span class="board-slug">/${esc(b.slug)}</span><span class="board-name">${esc(b.name)}</span>${isActive ? '<span class="board-badge">editing</span>' : ''}`;
    if (!isActive) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => { location.href = "/dashboard?board=" + encodeURIComponent(b.id); });
    }
    list.appendChild(el);
  });
  const countEl = $("boardCount");
  if (countEl) {
    const limit = ME?.limits?.boards || 1;
    countEl.textContent = BOARDS.length + " / " + limit + " boards";
  }
  const newBtn = $("newBoard");
  if (newBtn) {
    const limit = ME?.limits?.boards || 1;
    newBtn.hidden = BOARDS.length >= limit;
    newBtn.onclick = () => { $("newBoardForm").hidden = false; newBtn.hidden = true; $("nb_name").focus(); };
  }
  const cancelBtn = $("nb_cancel");
  if (cancelBtn) cancelBtn.onclick = () => { $("newBoardForm").hidden = true; $("newBoard").hidden = BOARDS.length >= (ME?.limits?.boards || 1); $("nb_err").textContent = ""; };
  const createBtn = $("nb_create");
  if (createBtn) createBtn.onclick = async () => {
    const name = $("nb_name").value.trim();
    let slug = $("nb_slug").value.trim() || slugify(name);
    if (!slug) { $("nb_err").textContent = "Enter a name or slug."; return; }
    $("nb_err").textContent = "Creating…";
    createBtn.disabled = true;
    try {
      const res = await fetch("/api/site/create", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ slug, name }) });
      const d = await res.json();
      if (res.ok && d.ok) {
        location.href = "/dashboard?board=" + encodeURIComponent(d.id);
      } else {
        $("nb_err").textContent = d.error || "Creation failed.";
        createBtn.disabled = false;
      }
    } catch { $("nb_err").textContent = "Network error."; createBtn.disabled = false; }
  };
}

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function renderPlan(){
  const plan = ME.plan || "free";
  const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency" };
  $("planBadge").textContent = plan.toUpperCase() + " PLAN";
  $("planName").textContent = planNames[plan] || plan;
  if (plan === "agency" || plan === "pro") {
    const until = ME.planExpiresAt ? new Date(ME.planExpiresAt).toLocaleDateString() : null;
    $("planMeta").textContent = until ? `Active until ${until} · up to ${ME.limits.players} players · no badge` : `Lifetime · up to ${ME.limits.players === 999 ? "unlimited" : ME.limits.players} players · no badge`;
    $("goPro").textContent = "Extend " + (planNames[plan] || plan) + " (+31 days)";
  } else if (plan === "starter") {
    $("planMeta").textContent = `Up to ${ME.limits.players} players · no badge · CSV import`;
    $("goPro").textContent = "Upgrade to Pro — $" + (ME.proPrice || 29) + "/mo";
  } else {
    $("planMeta").textContent = `Up to ${ME.limits.players} players · YourRank badge on your page`;
    $("goPro").textContent = `Upgrade — plans from $12/mo`;
  }
}
async function checkout(btn){
  btn.disabled = true; const orig = btn.textContent; btn.textContent = "Opening checkout…";
  try {
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "x-csrf-token": getCsrf() } });
    const d = await res.json();
    if (res.ok && d.ok && d.url) { location.href = d.url; return; }
    $("status").textContent = d.error || "Couldn't start checkout.";
  } catch { $("status").textContent = "Network error."; }
  btn.disabled = false; btn.textContent = orig;
}
function playerRow(p={name:"",wagered:"",prize:""}){
  const tr=document.createElement("tr");
  tr.innerHTML = `<td class="rank"></td><td><input class="p-name" placeholder="*****ess" value="${esc(p.name)}"></td><td class="num"><input class="p-wager" inputmode="decimal" placeholder="0" value="${esc(p.wagered)}"></td><td class="num"><input class="p-prize" inputmode="decimal" placeholder="0" value="${esc(p.prize)}"></td><td class="act"><button class="row-x" title="Remove" type="button">×</button></td>`;
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
    const planNames = { free: "Free", starter: "Starter", pro: "Pro" };
    $("status").textContent = ME.plan==="pro" || ME.plan==="agency" ? `Your plan allows up to ${ME.limits.players} players.` : `${planNames[ME.plan]||"Your"} plan allows ${ME.limits.players} players. Upgrade for more.`;
    setTimeout(()=>$("status").textContent="",5000); return;
  }
  $("rows").appendChild(playerRow());renumber();toggleEmpty();
});
function collect(){
  const players=[...$("rows").children].map(tr=>({name:tr.querySelector(".p-name").value.trim(),wagered:parseFloat(tr.querySelector(".p-wager").value)||0,prize:parseFloat(tr.querySelector(".p-prize").value)||0})).filter(p=>p.name);
  const out = { brand:{name:$("f_name").value.trim(),tagline:$("f_tagline").value.trim(),casino:$("f_casino").value.trim()||"Stake",code:$("f_code").value.trim(),ctaUrl:$("f_cta").value.trim(),prizePool:$("f_pool").value.trim(),period:$("f_period").value.trim()||"Monthly"}, endsAt:fromLocalInput($("f_ends").value), partner:{blurb:$("f_blurb").value.trim(),chips:EXTRA.chips}, whyStats:EXTRA.whyStats, rules:EXTRA.rules, socials:EXTRA.socials, players };
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
  // Custom domain (Pro only)
  const domainEl = $("f_domain");
  if (domainEl && (ME.plan === "pro" || ME.plan === "agency")) {
    out.customDomain = domainEl.value.trim().toLowerCase();
  }
  return out;
}

/* --- branding (paid) --- */
function ensureTemplateCard(){
  if ($("templateCard")) return;
  const anchor = $("brandCard");
  if (!anchor || !anchor.parentNode) return;
  const card = document.createElement("div");
  card.className = "card"; card.id = "templateCard";
  card.innerHTML = '<h2>Page template</h2><p class="card-sub">The overall look of your public page. Available on every plan.</p>' +
    '<div class="field"><label for="f_template">Template</label><select id="f_template">' +
    '<option value="classic">Classic \u2014 purple night, cyan gradient</option>' +
    '<option value="midnight">Midnight Gold \u2014 black felt, molten gold</option>' +
    '</select><span class="hint">Save to apply. Pro accent colors and logo work on top of any template.</span></div>';
  anchor.parentNode.insertBefore(card, anchor);
}
function renderBranding(br){
  ensureTemplateCard();
  const paid = ME.plan !== "free";
  $("brandBody").hidden = !paid; $("brandLock").hidden = paid;
  const tplSel = $("f_template");
  if (tplSel) tplSel.value = br.template || "classic";
  if (br.accentA) $("c_a").value = br.accentA;
  if (br.accentB) $("c_b").value = br.accentB;
  if (br.hasLogo) { $("logoPreview").src = "/logo/" + SLUG + "?t=" + Date.now(); $("logoPreview").hidden = false; $("logoClear").hidden = false; }
}
$("logoPick").addEventListener("click",()=>$("logoFile").click());
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
$("colorsReset").addEventListener("click",()=>{ $("c_a").value = DEFAULT_A; $("c_b").value = DEFAULT_B; $("status").textContent = "Colors reset — hit Save to apply."; });
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
          headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
          body: JSON.stringify(body),
        });
        const d = await res.json();
        if (d.ok) {
          renderDomainStatus(d.status, d.message);
        } else {
          $("domainStatus").innerHTML = `<span style="color:#ff6b6b">${esc(d.error || "Verification failed.")}</span>`;
        }
      } catch {
        $("domainStatus").innerHTML = `<span style="color:#ff6b6b">Network error.</span>`;
      }
      verifyBtn.disabled = false;
    };
  }
}

function renderDomainStatus(status, message) {
  const el = $("domainStatus");
  if (!el) return;
  if (status === "active") {
    el.innerHTML = `<span style="color:#4ade80">✅ ${esc(message || "TLS active")}</span>`;
  } else if (status === "pending") {
    el.innerHTML = `<span style="color:#fbbf24">⏳ ${esc(message || "TLS provisioning in progress")}</span>`;
  } else if (status === "error") {
    el.innerHTML = `<span style="color:#ff6b6b">❌ ${esc(message || "Error")}</span>`;
  } else if (status === "saved") {
    el.innerHTML = `<span style="color:#5ad9ff">💾 ${esc(message || "Domain saved")}</span>`;
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
      const res = await fetch("/api/site/archive/delete",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(body)});
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
    const saveRes = await fetch("/api/site",{method:"PUT",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(savePayload)});
    const saved = await saveRes.json();
    if (!saveRes.ok || !saved.ok) { status.textContent = saved.error || "Couldn't save before archiving."; btn.disabled=false; btn.textContent="Close out period"; return; }
    const archiveBody = { label:$("a_label").value.trim(), clear };
    if (ACTIVE_SITE_ID) archiveBody.siteId = ACTIVE_SITE_ID;
    const res = await fetch("/api/site/archive",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(archiveBody)});
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
  try {
    const payload = collect();
    const res=await fetch("/api/site",{method:"PUT",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(payload)});
    const d=await res.json();
    if(res.ok&&d.ok) status.textContent="Saved. Your page is updated."; else status.textContent=d.error||"Save failed.";
  } catch{ status.textContent="Network error."; }
  btn.disabled=false;btn.textContent="Save changes"; setTimeout(()=>status.textContent="",6000);
});
async function loadStats(){
  let s; try { const r = await fetch("/api/site/stats"); const d = await r.json(); if(!r.ok||!d.ok) return; s = d.stats; } catch { return; }
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
}

$("logout")?.addEventListener("click", async (e)=>{ e.preventDefault(); await fetch("/api/auth/logout",{method:"POST",headers:{"x-csrf-token":getCsrf()}}); location.href="/login"; });
$("upgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });
$("goPro")?.addEventListener("click",()=>checkout($("goPro")));
$("domainUpgrade")?.addEventListener("click",(e)=>{ e.preventDefault(); checkout($("goPro")); });
init();
