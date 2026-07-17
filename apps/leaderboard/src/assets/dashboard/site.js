// Site editing: plan, branding/theme, save, archive, domain, overlay, notifications.
import { $, esc, fromLocalInput, getCsrf, guardAuth, logError, toLocalInput } from "./utils.js";
import { state } from "./state.js";
import { renderBoardSwitcher, renderBoardsPage, renderSidebarBoardSwitcher } from "./boards.js";
import { renderPlayers } from "./players.js";

export const DEFAULT_SECTIONS = {
  hero: true,
  top3: true,
  search: true,
  rules: true,
  partner: true,
  socials: true,
  pastWinners: true,
  countdown: true,
  cta: true,
  payouts: true,
};

export function renderPlan() {
  const plan = state.ME.plan || "free";
  const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency" };
  $("planBadge").textContent = plan.toUpperCase() + " PLAN";
  $("planName").textContent = planNames[plan] || plan;
  if (plan === "agency" || plan === "pro") {
    const until = state.ME.planExpiresAt ? new Date(state.ME.planExpiresAt).toLocaleDateString() : null;
    const playersLabel = state.ME.limits.players >= 9999 ? "unlimited players" : `up to ${state.ME.limits.players} players`;
    $("planMeta").textContent = until ? `Active until ${until} · ${playersLabel} · no badge` : `Lifetime · ${playersLabel} · no badge`;
    $("goPro").textContent = "Extend " + (planNames[plan] || plan) + " (+30 days)";
  } else if (plan === "starter") {
    $("planMeta").textContent = `Up to ${state.ME.limits.players} players · no badge · CSV import`;
    $("goPro").textContent = "Upgrade to Pro — $" + (state.ME.proPrice || 29) + "/mo";
  } else {
    $("planMeta").textContent = `Up to ${state.ME.limits.players} players · YourRank badge on your page`;
    $("goPro").textContent = `Upgrade — plans from $12/mo`;
  }
}

let checkingOut = false;
export async function checkout(btn) {
  if (checkingOut) return;
  checkingOut = true;
  btn.disabled = true;
  const orig = btn.textContent;
  btn.textContent = "Opening checkout…";
  try {
    const res = await fetch("/api/billing/checkout", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ plan: "pro" }) }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok && d.url) { location.href = d.url; return; }
    $("status").textContent = d.error || "Couldn't start checkout.";
  } catch (err) { logError("checkout", err); $("status").textContent = "Network error."; }
  btn.disabled = false;
  btn.textContent = orig;
  checkingOut = false;
}

export function collect() {
  const players = [...$("rows").children].map((tr) => ({
    name: tr.querySelector(".p-name").value.trim(),
    wagered: parseFloat(tr.querySelector(".p-wager").value) || 0,
    prize: parseFloat(tr.querySelector(".p-prize").value) || 0,
  })).filter((p) => p.name);
  const brandName = $("f_name").value.trim();
  const out = {
    name: brandName,
    brand: {
      name: brandName,
      tagline: $("f_tagline").value.trim(),
      casino: $("f_casino").value.trim() || "Stake",
      code: $("f_code").value.trim(),
      ctaUrl: $("f_cta").value.trim(),
      prizePool: $("f_pool").value.trim(),
      period: $("f_period").value.trim() || "Monthly",
    },
    endsAt: fromLocalInput($("f_ends").value),
    partner: { blurb: $("f_blurb").value.trim(), chips: state.EXTRA.chips },
    whyStats: state.EXTRA.whyStats,
    rules: state.EXTRA.rules,
    socials: state.EXTRA.socials,
    sections: state.EXTRA.sections,
    players,
  };
  const pubToggle = $("pubToggle");
  if (pubToggle) out.published = pubToggle.checked;
  if (state.ACTIVE_SITE_ID) out.siteId = state.ACTIVE_SITE_ID;
  if (state.SITE_UPDATED_AT) out.expectedUpdatedAt = state.SITE_UPDATED_AT;
  if (state.ME && state.ME.plan !== "free") {
    out.branding = { accentA: $("c_a").value, accentB: $("c_b").value };
    if (state.LOGO !== undefined) out.branding.logo = state.LOGO;
  }
  const tplEl = $("f_template");
  if (tplEl) out.branding = { ...(out.branding || {}), template: tplEl.value };
  collectTemplateText();
  if (state.EXTRA.text && Object.keys(state.EXTRA.text).length) out.branding = { ...(out.branding || {}), text: state.EXTRA.text };
  out.notify = {
    discord_webhook_url: $("f_webhook")?.value.trim() || null,
    telegram_chat_id: $("f_tgChatId")?.value.trim() || null,
    telegram_notify: $("f_tgNotify")?.checked || false,
  };
  return out;
}

/* --- templates + branding --- */
function currentTemplate() {
  return state.TEMPLATE_CATALOG.find((template) => template.id === state.CURRENT_BRANDING.template) || state.TEMPLATE_CATALOG[0];
}

function previewUrl(template, accentA, accentB) {
  const params = new URLSearchParams({ board: state.ACTIVE_SITE_ID, template });
  if (accentA && accentB) { params.set("accentA", accentA); params.set("accentB", accentB); }
  return "/dashboard/preview?" + params.toString();
}

function renderTemplateGallery() {
  const gallery = $("templateGallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  state.TEMPLATE_CATALOG.forEach((template) => {
    const selected = template.id === state.CURRENT_BRANDING.template;
    const defaultPreset = template.presets?.[0] || {};
    const accentA = selected && state.CURRENT_BRANDING.accentA ? state.CURRENT_BRANDING.accentA : defaultPreset.accentA;
    const accentB = selected && state.CURRENT_BRANDING.accentB ? state.CURRENT_BRANDING.accentB : defaultPreset.accentB;
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

function renderColorPresets() {
  const list = $("colorPresets");
  const template = currentTemplate();
  if (!list || !template) return;
  list.innerHTML = "";
  (template.presets || []).forEach((preset) => {
    const active = preset.accentA.toLowerCase() === String(state.CURRENT_BRANDING.accentA || "").toLowerCase()
      && preset.accentB.toLowerCase() === String(state.CURRENT_BRANDING.accentB || "").toLowerCase();
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

function updateThemeSelection() {
  const tpl = $("f_template"); if (tpl) tpl.value = state.CURRENT_BRANDING.template;
  if (state.CURRENT_BRANDING.accentA) $("c_a").value = state.CURRENT_BRANDING.accentA;
  if (state.CURRENT_BRANDING.accentB) $("c_b").value = state.CURRENT_BRANDING.accentB;
  renderTemplateGallery();
  renderColorPresets();
}

export async function saveTheme(template, accentA, accentB, label) {
  if (state.THEME_SAVING) return;
  state.THEME_SAVING = true;
  const status = $("templateStatus");
  if (status) status.textContent = "Applying…";
  document.querySelectorAll(".template-card button,.preset-btn,#applyCustomColors,#colorsReset").forEach((button) => { button.disabled = true; });
  const body = { siteId: state.ACTIVE_SITE_ID, template };
  if (state.ME.plan !== "free" && accentA && accentB) { body.accentA = accentA; body.accentB = accentB; }
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
    state.CURRENT_BRANDING = { ...state.CURRENT_BRANDING, ...data.branding, template };
    if (state.ME.plan !== "free" && accentA && accentB) {
      state.CURRENT_BRANDING.accentA = accentA;
      state.CURRENT_BRANDING.accentB = accentB;
    }
    const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
    if (active) active.template = template;
    updateThemeSelection();
    renderTemplateText();
    renderSidebarBoardSwitcher();
    renderBoardsPage();
    if (status) status.textContent = `${label || currentTemplate()?.name || "Design"} applied to /${state.SLUG}.`;
  } catch (err) {
    logError("apply-design", err);
    if (status) status.textContent = "Network error. Try again.";
  } finally {
    state.THEME_SAVING = false;
    document.querySelectorAll(".template-card button,.preset-btn,#applyCustomColors,#colorsReset").forEach((button) => { button.disabled = false; });
  }
}

function applyTemplate(template) {
  const preset = template.presets?.[0];
  saveTheme(template.id, preset?.accentA, preset?.accentB, template.name);
}

export function renderBranding(br) {
  state.CURRENT_BRANDING = {
    template: br.template || "classic",
    accentA: br.accentA || null,
    accentB: br.accentB || null,
  };
  const paid = state.ME.plan !== "free";
  $("brandBody").hidden = !paid;
  $("brandLock").hidden = paid;
  updateThemeSelection();
  if (br.hasLogo) { $("logoPreview").src = "/logo/" + state.SLUG + "?t=" + Date.now(); $("logoPreview").hidden = false; $("logoClear").hidden = false; }
}

$("logoPick").setAttribute("aria-label", "Upload logo");
$("logoPick").addEventListener("click", () => $("logoFile").click());
$("logoClear").setAttribute("aria-label", "Remove logo");
$("logoClear").addEventListener("click", () => { state.LOGO = null; $("logoPreview").hidden = true; $("logoClear").hidden = true; $("status").textContent = "Logo will be removed when you save."; });
$("logoFile").addEventListener("change", () => {
  const f = $("logoFile").files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => {
    const max = 512, scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale)); c.height = Math.max(1, Math.round(img.height * scale));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    let uri = c.toDataURL("image/png");
    if (uri.length > 240000) uri = c.toDataURL("image/jpeg", 0.85);
    if (uri.length > 240000) { $("status").textContent = "That image is too big even after resizing. Try a simpler one."; return; }
    state.LOGO = uri;
    $("logoPreview").src = uri; $("logoPreview").hidden = false; $("logoClear").hidden = false;
    $("status").textContent = "Logo ready — hit Save to publish it.";
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => { $("status").textContent = "Couldn't read that image."; };
  img.src = URL.createObjectURL(f);
  $("logoFile").value = "";
});
$("applyCustomColors").addEventListener("click", () => saveTheme(state.CURRENT_BRANDING.template, $("c_a").value, $("c_b").value, "Custom colors"));
$("colorsReset").addEventListener("click", () => { const preset = currentTemplate()?.presets?.[0]; if (preset) saveTheme(state.CURRENT_BRANDING.template, preset.accentA, preset.accentB, preset.name); });
$("brandUpgrade").addEventListener("click", (e) => { e.preventDefault(); checkout($("goPro")); });

export function renderNotifications(n) {
  const paid = state.ME.plan !== "free";
  $("notifyBody").hidden = !paid; $("notifyLock").hidden = paid;
  if (!paid) {
    $("notifyUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); location.href = "/dashboard/billing"; });
    return;
  }
  const wh = $("f_webhook"); if (wh && n.discord_webhook_url) { wh.value = ""; wh.placeholder = "Webhook configured ✓ (enter new URL to change)"; }
  const tg = $("f_tgNotify"); if (tg) tg.checked = !!n.telegram_notify;
  const tgChat = $("f_tgChatId"); if (tgChat) tgChat.value = n.telegram_chat_id || "";
}

const SOCIAL_CATALOG = [
  { brand: "discord", name: "Discord", action: "Join", handle: "Join the community", placeholder: "https://discord.gg/yourserver" },
  { brand: "kick", name: "Kick", action: "Follow", handle: "Watch live", placeholder: "https://kick.com/yourname" },
  { brand: "twitch", name: "Twitch", action: "Follow", handle: "Watch live", placeholder: "https://twitch.tv/yourname" },
  { brand: "x", name: "X (Twitter)", action: "Follow", handle: "Latest updates", placeholder: "https://x.com/yourname" },
  { brand: "youtube", name: "YouTube", action: "Subscribe", handle: "Watch videos", placeholder: "https://youtube.com/@yourname" },
  { brand: "instagram", name: "Instagram", action: "Follow", handle: "Follow along", placeholder: "https://instagram.com/yourname" },
  { brand: "telegram", name: "Telegram", action: "Join", handle: "Join the channel", placeholder: "https://t.me/yourchannel" },
];

// Read the current editor rows back into state.EXTRA.socials so a save picks them up.
function collectSocials() {
  const list = $("socialsList");
  if (!list) return;
  state.EXTRA.socials = SOCIAL_CATALOG.map((c) => {
    const row = list.querySelector(`[data-social="${c.brand}"]`);
    const url = row ? row.querySelector(".social-url").value.trim() : "";
    const enabled = row ? row.querySelector(".social-toggle").checked : false;
    return { name: c.name, brand: c.brand, handle: c.handle, action: c.action, url, enabled };
  });
}

export function renderSocials() {
  const list = $("socialsList");
  if (!list) return;
  const existing = Array.isArray(state.EXTRA?.socials) ? state.EXTRA.socials : [];
  const byBrand = new Map(existing.map((s) => [String(s.brand || s.name || "").toLowerCase(), s]));
  list.innerHTML = SOCIAL_CATALOG.map((c) => {
    const cur = byBrand.get(c.brand) || {};
    const url = cur.url && cur.url !== "#" ? cur.url : "";
    const enabled = cur.enabled !== undefined ? !!cur.enabled : !!url;
    return `<div class="social-row" data-social="${esc(c.brand)}">
<label class="social-name" for="social_${esc(c.brand)}">${esc(c.name)}</label>
<input id="social_${esc(c.brand)}" class="social-url" type="url" inputmode="url" placeholder="${esc(c.placeholder)}" value="${esc(url)}" />
<label class="switch" title="Show on public page"><input type="checkbox" class="social-toggle" ${enabled ? "checked" : ""} /><span class="switch-track"></span></label>
</div>`;
  }).join("");
  list.addEventListener("input", collectSocials);
  list.addEventListener("change", collectSocials);
  collectSocials();
}

const SECTIONS_CATALOG = [
  { key: "hero", label: "Hero header" },
  { key: "top3", label: "Top 3 podium" },
  { key: "search", label: "Find my rank search" },
  { key: "payouts", label: "Prize payout strip" },
  { key: "countdown", label: "Countdown timer" },
  { key: "cta", label: "Join CTA button" },
  { key: "rules", label: "Rules section" },
  { key: "partner", label: "Partner panel" },
  { key: "socials", label: "Social links" },
  { key: "pastWinners", label: "Past winners" },
];

function collectSections() {
  const list = $("sectionsList");
  if (!list) return;
  const sections = {};
  for (const row of list.querySelectorAll("[data-section]")) {
    const key = row.dataset.section;
    const checked = row.querySelector(".section-toggle")?.checked ?? true;
    sections[key] = checked;
  }
  state.EXTRA.sections = { ...(state.EXTRA.sections || DEFAULT_SECTIONS), ...sections };
}

export function renderSections() {
  const list = $("sectionsList");
  if (!list) return;
  const current = { ...DEFAULT_SECTIONS, ...(state.EXTRA?.sections || {}) };
  list.innerHTML = SECTIONS_CATALOG.map((s) => `<div class="section-row" data-section="${esc(s.key)}">
<span class="section-name">${esc(s.label)}</span>
<label class="switch" title="Show on public page"><input type="checkbox" class="section-toggle" ${current[s.key] !== false ? "checked" : ""} /><span class="switch-track"></span></label>
</div>`).join("");
  list.addEventListener("input", collectSections);
  list.addEventListener("change", collectSections);
  collectSections();
}

export function collectTemplateText() {
  const list = $("textList");
  if (!list) return;
  const text = {};
  for (const row of list.querySelectorAll("[data-text-key]")) {
    const key = row.dataset.textKey;
    const val = row.querySelector(".text-value")?.value ?? "";
    if (val.trim()) text[key] = val.trim();
  }
  state.EXTRA.text = text;
}

export function renderTemplateText() {
  const list = $("textList");
  if (!list) return;
  const template = currentTemplate();
  const defaults = template?.textDefaults || {};
  const current = state.EXTRA?.text || {};
  const keys = Object.keys(defaults);
  if (!keys.length) {
    list.innerHTML = `<p class="hint">This design does not have editable text slots.</p>`;
    return;
  }
  list.innerHTML = keys.map((key) => {
    const def = defaults[key];
    const val = current[key] ?? "";
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return `<div class="text-row" data-text-key="${esc(key)}">
<label class="text-label" for="text_${esc(key)}">${esc(label)}</label>
<input id="text_${esc(key)}" class="text-value" type="text" placeholder="${esc(def)}" value="${esc(val)}" />
</div>`;
  }).join("");
  list.addEventListener("input", collectTemplateText);
  list.addEventListener("change", collectTemplateText);
  collectTemplateText();
}

export function renderOverlay() {
  const pro = state.ME.plan === "pro" || state.ME.plan === "agency";
  const body = $("overlayBody"), lock = $("overlayLock");
  if (body) body.hidden = !pro;
  if (lock) lock.hidden = pro;
  if (!pro) return;
  const overlayUrl = location.origin + "/" + state.SLUG + "/overlay";
  const urlEl = $("overlayUrl");
  if (urlEl) urlEl.textContent = overlayUrl;
  const preview = $("overlayPreview");
  if (preview) preview.href = overlayUrl;
  const copy = $("overlayCopy");
  if (copy && !copy._wired) {
    copy._wired = true;
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(overlayUrl); copy.textContent = "Copied!"; }
      catch (err) { logError("copy-overlay", err); copy.textContent = "Copy failed"; }
      setTimeout(() => { copy.textContent = "📋 Copy"; }, 1500);
    });
  }
}

export function renderDomain() {
  const pro = state.ME.plan === "pro" || state.ME.plan === "agency";
  const domainBody = $("domainBody");
  const domainLock = $("domainLock");
  if (domainBody) domainBody.hidden = !pro;
  if (domainLock) domainLock.hidden = pro;

  const verifyBtn = $("domainVerify");
  if (verifyBtn) {
    verifyBtn.onclick = async () => {
      const domain = $("f_domain").value.trim().toLowerCase();
      if (!domain) { $("domainStatus").textContent = "Enter a domain first."; return; }
      $("domainStatus").textContent = "Verifying…";
      verifyBtn.disabled = true;
      try {
        const body = { domain };
        if (state.ACTIVE_SITE_ID) body.siteId = state.ACTIVE_SITE_ID;
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
      } catch (err) {
        logError("domain-verify", err);
        $("domainStatus").innerHTML = `<span class="domain-error">Network error.</span>`;
      }
      verifyBtn.disabled = false;
    };
  }
}

export function renderDomainStatus(status, message) {
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
export function renderArchives(list) {
  const box = $("archList"); box.innerHTML = "";
  $("archEmpty").hidden = list.length > 0;
  list.forEach((a) => {
    const row = document.createElement("div"); row.className = "arch-row";
    const when = new Date(a.at).toLocaleDateString();
    row.innerHTML = `<span class="arch-label"></span><span class="hint">${a.players} players · closed ${when}</span><button class="btn btn--xs btn--ghost arch-del" type="button">Delete</button>`;
    row.querySelector(".arch-label").textContent = a.label;
    row.querySelector(".arch-del").addEventListener("click", async () => {
      if (!confirm(`Delete the "${a.label}" archive? It disappears from your page too.`)) return;
      const body = { id: a.id };
      if (state.ACTIVE_SITE_ID) body.siteId = state.ACTIVE_SITE_ID;
      const res = await fetch("/api/site/archive/delete", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(body) });
      const d = await res.json();
      if (res.ok && d.ok) { row.remove(); if (!$("archList").children.length) $("archEmpty").hidden = false; $("status").textContent = "Archive deleted."; }
      else $("status").textContent = d.error || "Couldn't delete that.";
    });
    box.appendChild(row);
  });
}

$("a_go").addEventListener("click", async () => {
  const btn = $("a_go"), status = $("status");
  if (![...$("rows").children].length) { status.textContent = "The board is empty — nothing to close out."; return; }
  const clear = $("a_clear").value;
  const warn = clear === "players" ? "save the current board as past winners, then CLEAR the player list" : clear === "wagers" ? "save the current board as past winners, then reset every wager to 0" : "save the current board as past winners";
  if (!confirm(`This will ${warn}. Continue?`)) return;
  btn.disabled = true; btn.textContent = "Closing out…";
  try {
    const savePayload = collect();
    const saveRes = await fetch("/api/site", { method: "PUT", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(savePayload) }).then(guardAuth);
    const saved = await saveRes.json();
    if (!saveRes.ok || !saved.ok) { status.textContent = saved.error || "Couldn't save before archiving."; btn.disabled = false; btn.textContent = "Close out period"; return; }
    const archiveBody = { label: $("a_label").value.trim(), clear };
    if (state.ACTIVE_SITE_ID) archiveBody.siteId = state.ACTIVE_SITE_ID;
    const res = await fetch("/api/site/archive", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(archiveBody) });
    const d = await res.json();
    if (res.ok && d.ok) {
      const apiUrl2 = state.ACTIVE_SITE_ID ? `/api/site?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "/api/site";
      const p = await (await fetch(apiUrl2)).json();
      if (p.ok) { renderPlayers(p.data.players || []); renderArchives(p.archives || []); }
      $("a_label").value = "";
      status.textContent = `"${d.label}" closed out — it's on your page now.`;
    } else status.textContent = d.error || "Couldn't close out the period.";
  } catch (err) { logError("archive", err); status.textContent = "Network error."; }
  btn.disabled = false; btn.textContent = "Close out period";
});

$("save").addEventListener("click", async () => {
  const btn = $("save"), status = $("status"); btn.disabled = true; btn.textContent = "Saving…"; status.textContent = "";
  const limitEl = $("limitMsg"); if (limitEl) limitEl.textContent = "";
  try {
    const payload = collect();
    const res = await fetch("/api/site", { method: "PUT", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(payload) }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) {
      status.textContent = "Saved. Your page is updated.";
      state._dirty = false;
      if (d.updatedAt) state.SITE_UPDATED_AT = d.updatedAt;
      const sb = $("savebar"); if (sb) sb.hidden = true;
      const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
      if (active) { active.name = payload.name; active.casino = payload.brand?.casino || active.casino; active.code = payload.brand?.code || active.code; }
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      renderBoardsPage();
    } else status.textContent = d.error || "Save failed.";
  } catch (err) { logError("save", err); status.textContent = "Network error."; }
  btn.disabled = false; btn.textContent = "Save changes";
  if (status.textContent === "Saved. Your page is updated.") setTimeout(() => { if (status.textContent === "Saved. Your page is updated.") status.textContent = ""; }, 6000);
});

export async function loadStats() {
  const statsUrl = state.ACTIVE_SITE_ID ? `/api/site/stats?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "/api/site/stats";
  let s;
  try {
    const r = await fetch(statsUrl);
    const d = await r.json();
    if (!r.ok || !d.ok) return;
    s = d.stats;
  } catch (err) { logError("load-stats", err); return; }
  const fmt = (n) => n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  $("st_views7").textContent = fmt(s.last7.views);
  $("st_views30").textContent = fmt(s.last30.views);
  $("st_copies30").textContent = fmt(s.last30.copies);
  $("st_clicks30").textContent = fmt(s.last30.clicks);
  const bars = $("statBars"); const days = s.days || [];
  const max = Math.max(1, ...days.map((x) => x.views));
  bars.innerHTML = days.map((x) => {
    const h = Math.max(2, Math.round((x.views / max) * 100));
    const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
    return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views, ${x.copies} copies, ${x.clicks} clicks"></div>`;
  }).join("");
  if (days.length) $("statFrom").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
  if (s.last30.views === 0 && s.last30.copies === 0 && s.last30.clicks === 0) $("statsEmpty").hidden = false;
  const ov7 = $("ov_views7"); if (ov7) ov7.textContent = fmt(s.last7.views);
  const ovBars = $("ov_bars");
  if (ovBars) {
    ovBars.innerHTML = days.map((x) => {
      const h = Math.max(2, Math.round((x.views / max) * 100));
      const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
      return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views"></div>`;
    }).join("");
    if (days.length) $("ov_barsFrom").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
    if (!days.length || s.last30.views === 0) $("ov_barsEmpty").hidden = false;
  }
  const shareStep = $("ov_step_share");
  if (shareStep && s.last7.views > 0) shareStep.classList.add("is-done");
}

$("logout")?.addEventListener("click", async (e) => { e.preventDefault(); await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } }); location.href = "/login"; });
$("upgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout($("goPro")); });
$("goPro")?.addEventListener("click", () => checkout($("goPro")));
$("domainUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout($("goPro")); });
$("overlayUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout($("goPro")); });
$("testDiscord")?.addEventListener("click", async () => {
  const s = $("testDiscordStatus"); if (s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "discord" }) });
    const d = await r.json();
    if (s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch (e) { if (s) s.textContent = "Network error."; }
});
$("testTelegram")?.addEventListener("click", async () => {
  const s = $("testTelegramStatus"); if (s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "telegram" }) });
    const d = await r.json();
    if (s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch (e) { if (s) s.textContent = "Network error."; }
});
