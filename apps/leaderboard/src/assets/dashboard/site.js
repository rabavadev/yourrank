// Site editing: plan, branding/theme, save, archive, domain, overlay, notifications.
import { $, esc, fromLocalInput, getCsrf, guardAuth, logError, toLocalInput, parseAmount, showToast, showConfirmModal } from "./utils.js";
import { state } from "./state.js";
import { renderBoardSwitcher, renderBoardsPage, renderSidebarBoardSwitcher } from "./boards.js";
import { applyPlayerFieldVisibility, renderPlayers, renumber, toggleEmpty } from "./players.js";

const FONT_FAMILIES = [
  { key: "Inter", label: "Inter — Default" },
  { key: "Oswald", label: "Oswald — Bold & Sporty" },
  { key: "Playfair Display", label: "Playfair Display — Premium & Elegant" },
  { key: "Rajdhani", label: "Rajdhani — Techy & Esports" },
  { key: "Bebas Neue", label: "Bebas Neue — Impact & Hype" },
];

export const DEFAULT_SECTIONS = {
  hero: true,
  leaderboard: true,
  top3: true,
  search: true,
  rules: true,
  partner: true,
  socials: true,
  share: true,
  pastWinners: true,
  countdown: true,
  cta: true,
  payouts: true,
  poweredBy: false,
};

const PLAN_ORDER = ["free", "starter", "pro", "agency"];
const LIFETIME_KEY = "lifetime";
const DEFAULT_PRIZES = { prizePoolLabel: "Prize pool", payoutsLabel: "Payouts", countdownLabel: "", currency: "$", hidePrizeAmounts: false };

function isLifetime() {
  const exp = state.ME?.planExpiresAt;
  return Number(exp) > new Date("2099-01-01T00:00:00Z").getTime();
}
function isPro() {
  const plan = state.ME?.plan;
  return plan === "pro" || plan === "agency" || plan === "lifetime" || isLifetime();
}

function planDefs() {
  const proPrice = state.ME?.proPrice || 29;
  return [
    { key: "free", name: "Free", price: 0, priceStr: "$0", period: "", note: "forever", features: ["1 leaderboard", "Up to 10 players", "YourRank badge", "Basic analytics (7 days)", "Live countdown"] },
    { key: "starter", name: "Starter", price: 12, priceStr: "$12", period: "/30 days", note: "", features: ["1 leaderboard", "Up to 25 players", "CSV import", "Full analytics (30 days)", "Font choice", "Custom accent colors", "Logo"] },
    { key: "pro", name: "Pro", price: proPrice, priceStr: `$${proPrice}`, period: "/30 days", note: "Most popular", features: ["Up to 3 leaderboards", "Up to 9,999 players", "Custom domain", "OBS overlay", "Discord + Telegram alerts", "Section controls", "Prize & countdown customization", "Remove YourRank badge"] },
    { key: "agency", name: "Agency", price: 79, priceStr: "$79", period: "/30 days", note: "", features: ["Up to 99 leaderboards", "White-label branding", "Signed score API", "Dedicated support", "Custom CSS", "Remove YourRank badge"] },
    { key: "lifetime", name: "Lifetime Pro", price: 149, priceStr: "$149", period: "", note: "one-time", features: ["All Pro + Agency features", "Pay once, use forever", "No monthly bills"] },
  ];
}

let checkingOut = false;
let startingTrial = false;

async function startTrial(btn) {
  if (!btn || startingTrial) return;
  startingTrial = true;
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Starting…";
  const status = $("trialStatus") || $("status");
  try {
    const res = await fetch("/api/billing/trial", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok) { location.reload(); return; }
    status.textContent = d.error || "Couldn't start trial.";
  } catch (err) { logError("trial", err); status.textContent = "Network error."; }
  btn.disabled = false;
  btn.textContent = orig;
  startingTrial = false;
}

export async function checkout(planOrBtn, btnRef) {
  const planKey = typeof planOrBtn === "string" ? planOrBtn : (planOrBtn?.dataset?.plan || "pro");
  const btn = typeof planOrBtn === "object" ? planOrBtn : btnRef;
  if (checkingOut) return;
  checkingOut = true;
  let orig = "";
  if (btn) { orig = btn.textContent; btn.disabled = true; btn.textContent = "Opening checkout…"; }
  try {
    const isLifetime = planKey === LIFETIME_KEY;
    const endpoint = isLifetime ? "/api/billing/checkout-lifetime" : "/api/billing/checkout";
    const headers = { "x-csrf-token": getCsrf() };
    const body = isLifetime ? undefined : JSON.stringify({ plan: planKey });
    if (!isLifetime) headers["content-type"] = "application/json";
    const res = await fetch(endpoint, { method: "POST", credentials: "include", headers, body }).then(guardAuth);
    const d = await res.json();
    if (res.ok && d.ok && d.url) { location.href = d.url; return; }
    $("status").textContent = d.error || "Couldn't start checkout.";
  } catch (err) { logError("checkout", err); $("status").textContent = "Network error."; }
  if (btn) { btn.disabled = false; btn.textContent = orig; }
  checkingOut = false;
}

function renderPlanCard(p, isCurrent, isLower, cta, accent, isContact) {
  const classes = ["plan-card"];
  if (isCurrent) classes.push("plan-card--current");
  if (p.note === "Most popular") classes.push("plan-card--popular");
  const disabled = isCurrent || isLower ? "disabled" : "";
  const note = p.note ? `<span class="plan-card-note">${esc(p.note)}</span>` : "";
  const list = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
  const ctaEl = isContact
    ? `<a class="btn btn--sm plan-card-cta" href="/contact?plan=agency">${esc(cta)}</a>`
    : `<button class="${accent ? "btn btn--sm btn--accent plan-card-cta" : "btn btn--sm plan-card-cta"}" data-plan="${esc(p.key)}" ${disabled}>${esc(cta)}</button>`;
  return `<div class="${classes.join(" ")}"><div class="plan-card-head"><div class="plan-card-name">${esc(p.name)}${note}</div><div class="plan-card-price">${esc(p.priceStr)}<span>${esc(p.period)}</span></div></div><ul class="plan-card-features">${list}</ul>${ctaEl}</div>`;
}

export function renderPlan() {
  const plan = state.ME.plan || "free";
  const isTrial = state.ME.isTrial;
  const lifetime = isLifetime();
  const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency" };
  const currentName = lifetime ? "Lifetime Pro" : (planNames[plan] || plan);
  const expiry = state.ME.planExpiresAt;
  const until = expiry && Number(expiry) > 0 && !lifetime ? `Active until ${new Date(Number(expiry)).toLocaleDateString()}` : (lifetime ? "No expiry" : "");

  const summary = $("planSummary");
  if (summary) {
    summary.innerHTML = `<div class="plan-summary-row"><span class="plan-summary-label">Current plan</span><span class="plan-summary-value">${esc(currentName)}${isTrial ? " (Trial)" : ""}</span></div>${until ? `<div class="plan-summary-row"><span class="plan-summary-label">Expires</span><span class="plan-summary-value">${esc(until)}</span></div>` : ""}`;
  }

  const banner = $("planBanner");
  if (banner) {
    if (!lifetime && plan !== "free" && expiry && Number(expiry) > 0) {
      const days = Math.floor((Number(expiry) - Date.now()) / 86_400_000);
      if (days < 0) {
        banner.hidden = false;
        banner.textContent = "Your plan has expired. Renew to restore Pro features.";
      } else if (days <= 7) {
        banner.hidden = false;
        banner.textContent = `Your plan expires in ${days} day${days === 1 ? "" : "s"}. Renew to keep your Pro features.`;
      } else {
        banner.hidden = true;
        banner.textContent = "";
      }
    } else {
      banner.hidden = true;
      banner.textContent = "";
    }
  }

  const cancelWrap = $("cancelWrap");
  if (cancelWrap) {
    const paid = plan !== "free" && !lifetime && !isTrial;
    cancelWrap.hidden = !paid;
    if (paid) {
      const cancelStatus = $("cancelStatus");
      if (cancelStatus) cancelStatus.textContent = "";
      const cancelBtn = $("cancelBtn");
      if (cancelBtn) { cancelBtn.hidden = false; cancelBtn.disabled = false; }
    }
  }

  const grid = $("planGrid");
  if (grid) {
    const currentIdx = PLAN_ORDER.indexOf(plan);
    grid.innerHTML = planDefs().map((p) => {
      if (p.key === LIFETIME_KEY) {
        const isCurrent = lifetime;
        const cta = isCurrent ? "Current plan" : "Get Lifetime Pro";
        return renderPlanCard(p, isCurrent, false, cta, !isCurrent, false);
      }
      const pIdx = PLAN_ORDER.indexOf(p.key);
      const isCurrent = p.key === plan && !lifetime;
      const isLower = pIdx < currentIdx;
      let cta, accent = false;
      if (isCurrent) {
        cta = isTrial ? "Current (trial)" : "Current plan";
      } else if (isLower) {
        cta = "Included";
      } else {
        cta = p.key === "free" ? "Current" : (p.key === "agency" ? "Contact us" : `Upgrade to ${p.name}`);
        accent = p.key !== "agency";
      }
      return renderPlanCard(p, isCurrent, isLower, cta, accent && !isCurrent, p.key === "agency");
    }).join("");
    if (!grid._wired) {
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-plan]");
        if (btn) checkout(btn.dataset.plan, btn);
      });
      grid._wired = true;
    }
  }

  const trialEl = $("planTrial");
  if (trialEl) {
    if (plan === "free" && !state.ME.hasTrial) {
      trialEl.hidden = false;
      const trialBtn = $("trialBtn");
      if (trialBtn && !trialBtn._wired) {
        trialBtn._wired = true;
        trialBtn.addEventListener("click", () => startTrial(trialBtn));
      }
    } else {
      trialEl.hidden = true;
    }
  }

  // Backfill legacy single-plan elements if they still exist
  if ($("planBadge")) $("planBadge").textContent = (lifetime ? "Lifetime" : plan).toUpperCase() + " PLAN";
  if ($("planName")) $("planName").textContent = currentName + (isTrial ? " (Trial)" : "");
  if ($("planMeta")) $("planMeta").textContent = until || `Up to ${state.ME.limits.players} players`;
  if ($("goPro")) $("goPro").textContent = lifetime ? "Lifetime active" : (plan === "free" ? "Upgrade — plans from $12/mo" : `Extend ${currentName} (+30 days)`);
}

export async function loadHistory() {
  const card = $("historyCard");
  const table = $("historyTable");
  const body = $("historyBody");
  const empty = $("historyEmpty");
  if (!card || !table || !body) return;
  try {
    const res = await fetch("/api/account/payments", { credentials: "include" }).then(guardAuth);
    const d = await res.json();
    if (!res.ok || !d.ok) return;
    const rows = d.payments || [];
    card.hidden = false;
    empty.hidden = rows.length > 0;
    table.hidden = rows.length === 0;
    body.innerHTML = rows.map((p) => {
      const plan = String(p.plan_tier || p.plan || "–").toUpperCase();
      const amount = Number(p.amount) || 0;
      const amountStr = `$${amount.toFixed(2)} ${p.currency || "USD"}`;
      const status = String(p.status || "").toLowerCase();
      const statusClass = ["confirmed", "finished", "active"].includes(status) ? "good" : ["failed", "expired", "refunded"].includes(status) ? "bad" : "muted";
      const date = p.created_at ? new Date(p.created_at).toLocaleString() : "–";
      return `<tr><td>${esc(date)}</td><td>${esc(plan)}</td><td>${esc(amountStr)}</td><td><span class="pill pill--${esc(statusClass)}">${esc(status)}</span></td></tr>`;
    }).join("");
  } catch (err) { logError("loadHistory", err); }
}

export function wireCancelSubscription() {
  const btn = $("cancelBtn");
  if (!btn || btn._wired) return;
  btn._wired = true;
  btn.addEventListener("click", async () => {
    const plan = state.ME?.plan || "free";
    const expiry = state.ME?.planExpiresAt;
    const until = expiry && Number(expiry) > 0 ? new Date(Number(expiry)).toUTCString().slice(5, 16) : "";
    const body = until
      ? `You'll keep ${plan} features until ${until}, then revert to Free.`
      : "Your plan will revert to Free immediately.";
    if (!await showConfirmModal("Cancel subscription?", body, "Yes, cancel", true)) return;
    const status = $("cancelStatus");
    if (status) status.textContent = "Cancelling...";
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
      const d = await res.json();
      if (res.ok && d.ok) {
        if (status) status.textContent = d.message || "Subscription cancelled.";
        btn.hidden = true;
        setTimeout(() => location.reload(), 1200);
      } else {
        if (status) status.textContent = d.error || "Could not cancel.";
      }
    } catch (err) { logError("cancel-subscription", err); if (status) status.textContent = "Network error."; }
  });
}

export function wireDeleteAccount() {
  const btn = $("deleteAccountBtn");
  const modal = $("deleteAccountModal");
  const confirmInput = $("deleteAccountConfirm");
  const passwordWrap = $("deleteAccountPasswordWrap");
  const passwordInput = $("deleteAccountPassword");
  const confirmBtn = $("deleteAccountConfirmBtn");
  const cancelBtn = $("deleteAccountCancelBtn");
  const status = $("deleteAccountModalStatus");
  if (!btn || !modal || !confirmInput || !confirmBtn || !cancelBtn) return;
  if (wireDeleteAccount._wired) return;
  wireDeleteAccount._wired = true;
  const close = () => {
    modal.hidden = true;
    confirmInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (passwordWrap) passwordWrap.hidden = true;
    if (status) status.textContent = "";
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = "Delete my account"; }
  };
  btn.addEventListener("click", () => {
    confirmInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (passwordWrap) passwordWrap.hidden = true;
    if (status) status.textContent = "";
    modal.hidden = false;
    confirmInput.focus();
  });
  cancelBtn.addEventListener("click", close);
  confirmBtn.addEventListener("click", async () => {
    if (status) status.textContent = "";
    if (confirmInput.value.trim() !== "DELETE") { if (status) status.textContent = "Type DELETE exactly to confirm."; return; }
    const password = passwordWrap && !passwordWrap.hidden && passwordInput ? passwordInput.value.trim() : "";
    if (passwordWrap && !passwordWrap.hidden && !password) { if (status) status.textContent = "Enter your password."; return; }
    confirmBtn.disabled = true; confirmBtn.textContent = "Deleting...";
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
        body: JSON.stringify(password ? { password } : {})
      });
      const d = await res.json();
      if (res.status === 400 && d.error && d.error.includes("Password required")) {
        if (passwordWrap) passwordWrap.hidden = false;
        if (status) status.textContent = "Enter your password to confirm deletion.";
        confirmBtn.disabled = false; confirmBtn.textContent = "Delete my account";
        if (passwordInput) passwordInput.focus();
        return;
      }
      if (res.ok && d.ok) {
        if (status) status.textContent = "Account deleted. Redirecting...";
        location.href = "/";
        return;
      }
      if (status) status.textContent = d.error || "Deletion failed. Try again.";
    } catch (err) { logError("delete-account", err); if (status) status.textContent = "Couldn't delete account. Try again."; }
    confirmBtn.disabled = false; confirmBtn.textContent = "Delete my account";
  });
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
}

export function collect() {
  const players = [...$("rows").children].map((tr) => {
    const p = {
      name: tr.querySelector(".p-name").value.trim(),
      wagered: parseAmount(tr.querySelector(".p-wager").value),
      prize: parseAmount(tr.querySelector(".p-prize").value),
    };
    const score = tr.querySelector(".p-score").value.trim();
    const hands = tr.querySelector(".p-hands").value.trim();
    const netProfit = tr.querySelector(".p-net-profit").value.trim();
    const winRate = tr.querySelector(".p-win-rate").value.trim();
    const change = tr.querySelector(".p-change").value.trim();
    if (score) p.score = parseAmount(score);
    if (hands) p.hands = parseAmount(hands);
    if (netProfit) p.netProfit = parseAmount(netProfit);
    if (winRate) p.winRate = parseAmount(winRate);
    if (change) p.change = parseAmount(change);
    return p;
  }).filter((p) => p.name);
  const brandName = $("f_name").value.trim();
  const out = {
    name: brandName,
    brand: {
      name: brandName,
      tagline: $("f_tagline").value.trim(),
      casino: $("f_casino").value.trim(),
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
    playerFields: state.EXTRA.playerFields,
    players,
    legal: {
      terms: ($("f_legal_terms")?.value || "").trim(),
      termsEnabled: $("f_legal_terms_enabled")?.checked ?? true,
      privacy: ($("f_legal_privacy")?.value || "").trim(),
      privacyEnabled: $("f_legal_privacy_enabled")?.checked ?? true,
      responsible: ($("f_legal_responsible")?.value || "").trim(),
      responsibleEnabled: $("f_legal_responsible_enabled")?.checked ?? true,
      cookies: ($("f_legal_cookies")?.value || "").trim(),
      cookiesEnabled: $("f_legal_cookies_enabled")?.checked ?? true,
      refund: ($("f_legal_refund")?.value || "").trim(),
      refundEnabled: $("f_legal_refund_enabled")?.checked ?? true,
      contact: ($("f_legal_contact")?.value || "").trim(),
      contactEnabled: $("f_legal_contact_enabled")?.checked ?? true,
    },
  };
  const pubToggle = $("pubToggle");
  if (pubToggle) out.published = pubToggle.checked;
  const pwEnabled = $("f_password_enabled");
  const pwInput = $("f_password");
  if (pwEnabled) {
    if (pwEnabled.checked) {
      if (pwInput && pwInput.value.trim()) out.password = pwInput.value.trim();
    } else {
      out.passwordProtected = false;
    }
  }
  if (state.ACTIVE_SITE_ID) out.siteId = state.ACTIVE_SITE_ID;
  if (state.SITE_UPDATED_AT) out.expectedUpdatedAt = state.SITE_UPDATED_AT;
  if (state.ME && state.ME.plan !== "free") {
    out.branding = { accentA: $("c_a").value, accentB: $("c_b").value, font: $("f_font")?.value || state.CURRENT_BRANDING?.font || "Inter", options: state.CURRENT_BRANDING?.options || {} };
    if (state.LOGO !== undefined) out.branding.logo = state.LOGO;
  }
  if (isPro()) {
    out.branding = {
      ...(out.branding || {}),
      prizes: {
        prizePoolLabel: $("f_prizePoolLabel")?.value.trim() || DEFAULT_PRIZES.prizePoolLabel,
        payoutsLabel: $("f_payoutsLabel")?.value.trim() || DEFAULT_PRIZES.payoutsLabel,
        countdownLabel: $("f_countdownLabel")?.value.trim() || "",
        currency: $("f_currency")?.value.trim() || DEFAULT_PRIZES.currency,
        hidePrizeAmounts: $("f_hidePrizeAmounts")?.checked || false,
      },
    };
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
  const arToggle = $("f_auto_reset");
  const arClear = $("f_auto_reset_clear");
  out.autoReset = {
    enabled: !!(arToggle && arToggle.checked),
    clear: arClear && !arClear.disabled ? arClear.value : "wagers",
  };
  return out;
}

/* --- templates + branding --- */
function currentTemplate() {
  return state.TEMPLATE_CATALOG.find((template) => template.id === state.CURRENT_BRANDING.template) || state.TEMPLATE_CATALOG[0];
}

function previewUrl(template, accentA, accentB, font, device = "desktop") {
  const params = new URLSearchParams({ board: state.ACTIVE_SITE_ID, template });
  if (accentA && accentB) { params.set("accentA", accentA); params.set("accentB", accentB); }
  if (font) params.set("font", font);
  if (device) params.set("device", device);
  return "/dashboard/preview?" + params.toString();
}

// Lazily boot template-preview iframes only when their card scrolls into view.
// The gallery can hold ~25 templates; booting every iframe at once (even with
// loading="lazy", which is unreliable for in-page galleries) causes real jank.
let _previewObserver = null;
function _lazyPreviewObserver() {
  if (_previewObserver || typeof IntersectionObserver === "undefined") return _previewObserver;
  _previewObserver = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const iframe = entry.target;
      if (iframe.dataset.preview && !iframe.src) iframe.src = iframe.dataset.preview;
      obs.unobserve(iframe);
    }
  }, { rootMargin: "300px 0px" });
  return _previewObserver;
}

function _observePreview(iframe, url) {
  iframe.dataset.preview = url;
  const obs = _lazyPreviewObserver();
  // No IntersectionObserver support → load immediately so previews still show.
  if (!obs) { iframe.src = url; return; }
  obs.observe(iframe);
}

function _buildCard(template) {
  const selected = template.id === state.CURRENT_BRANDING.template;
  const defaultPreset = template.presets?.[0] || {};
  const accentA = selected && state.CURRENT_BRANDING.accentA ? state.CURRENT_BRANDING.accentA : defaultPreset.accentA;
  const accentB = selected && state.CURRENT_BRANDING.accentB ? state.CURRENT_BRANDING.accentB : defaultPreset.accentB;
  const font = state.CURRENT_BRANDING.font || "Inter";
  const isPaid = state.ME?.plan !== "free";

  const card = document.createElement("article");
  card.className = ["template-card", selected ? "is-selected" : ""].filter(Boolean).join(" ");
  card.dataset.template = template.id;

  // Badges
  const badges = [];

  // Color swatches — inline presets
  let presetsHtml = "";
  if (template.presets?.length) {
    const swatches = template.presets.map((p) => {
      const activeSwatch = selected
        && p.accentA?.toLowerCase() === (state.CURRENT_BRANDING.accentA || "").toLowerCase()
        && p.accentB?.toLowerCase() === (state.CURRENT_BRANDING.accentB || "").toLowerCase();
      return `<button class="template-preset-btn${activeSwatch ? " is-active" : ""}" data-accent-a="${esc(p.accentA)}" data-accent-b="${esc(p.accentB)}" data-preset-name="${esc(p.name)}" type="button" title="${esc(p.name)}"${!isPaid ? ' data-free="1"' : ""}><span class="template-preset-swatch" style="--sa:${esc(p.accentA)};--sb:${esc(p.accentB)}"></span><span class="template-preset-label">${esc(p.name)}</span></button>`;
    }).join("");
    presetsHtml = `<div class="template-presets">${swatches}</div>`;
  }

  card.innerHTML = `
<div class="template-preview"><iframe loading="lazy" tabindex="-1" aria-hidden="true" title="${esc(template.name)} preview"></iframe></div>
<div class="template-card-body">
${badges.length ? `<div class="template-badge-row">${badges.join("")}</div>` : ""}
<div class="template-meta"><div class="template-meta-text"><b>${esc(template.name)}</b><span>${esc(template.description)}</span></div><button class="btn btn--sm${selected ? " btn--accent" : ""} template-apply-btn" type="button" aria-pressed="${selected}">${selected ? "✓ Applied" : "Apply"}</button></div>
${presetsHtml}
</div>`;

  const iframe = card.querySelector("iframe");
  _observePreview(iframe, previewUrl(template.id, accentA, accentB, font, "desktop"));

  // Apply on preview click or button click
  const applyDefault = () => applyTemplate(template);
  card.querySelector(".template-apply-btn").addEventListener("click", applyDefault);
  card.querySelector(".template-preview").addEventListener("click", applyDefault);

  // Swatch click — applies template + color in one gesture
  card.querySelectorAll(".template-preset-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isPaid && btn.dataset.free) {
        const status = $("templateStatus") || $("status");
        if (status) status.textContent = "Custom colors are a Pro feature — upgrade to unlock all palettes.";
        // Still apply the template with default colors
        applyTemplate(template);
        return;
      }
      applyTheme(template.id, btn.dataset.accentA, btn.dataset.accentB, btn.dataset.presetName);
    });
  });

  return card;
}

function renderTemplateGallery() {
  const gallery = $("templateGallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  state.TEMPLATE_CATALOG.forEach((template) => gallery.appendChild(_buildCard(template)));
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
    button.addEventListener("click", () => applyTheme(template.id, preset.accentA, preset.accentB, preset.name));
    list.appendChild(button);
  });
}

let _previewAbort = null;
let _previewTimeout = null;

export function updateDesignPreview() {
  const iframe = $("designPreview");
  if (!iframe || !state.ACTIVE_SITE_ID) return;
  // Don't waste CPU/network rendering a preview that isn't on screen.
  const editorVisible = document.querySelector('section[data-page="board"].is-on');
  if (!editorVisible) return;

  const tpl = state.CURRENT_BRANDING.template || currentTemplate()?.id || "classic";
  const active = document.querySelector(".preview-tab.is-active");
  const device = active?.dataset.device || "desktop";

  // Build full URL for POST target
  const params = new URLSearchParams({ board: state.ACTIVE_SITE_ID, template: tpl, device });
  const url = "/dashboard/preview?" + params.toString();

  // Debounce the live preview update (750ms) so typing doesn't repeatedly re-render.
  clearTimeout(_previewTimeout);
  _previewTimeout = setTimeout(async () => {
    if (_previewAbort) _previewAbort.abort();
    _previewAbort = new AbortController();

    try {
      // collect() returns the current draft state of the board
      const draft = collect();
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
        body: JSON.stringify(draft),
        signal: _previewAbort.signal
      });
      if (res.ok) {
        const html = await res.text();
        if (iframe.hasAttribute("srcdoc") && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: "yr_preview_update", html }, "*");
        } else {
          iframe.srcdoc = html;
          iframe.removeAttribute("src");
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error("Preview render failed", e);
    }
  }, 300);
}

function updateThemeSelection() {
  const tpl = $("f_template"); if (tpl) tpl.value = state.CURRENT_BRANDING.template;
  if (state.CURRENT_BRANDING.accentA) $("c_a").value = state.CURRENT_BRANDING.accentA;
  if (state.CURRENT_BRANDING.accentB) $("c_b").value = state.CURRENT_BRANDING.accentB;
  const font = $("f_font"); if (font) font.value = state.CURRENT_BRANDING.font || "Inter";
  renderTemplateGallery();
  renderColorPresets();
  renderTemplateOptions();
  updateDesignPreview();
}

/* --- per-template options (schema-driven) ---
   The dashboard never hardcodes per-template controls: it reads the active
   template's `schema` from the catalog and auto-builds the form. Values live
   in state.CURRENT_BRANDING.options and are validated server-side on save. */
function renderTemplateOptions() {
  const wrap = $("templateOptions");
  if (!wrap) return;
  const template = currentTemplate();
  const schema = (template && template.schema) || {};
  const keys = Object.keys(schema).filter((k) => schema[k] && typeof schema[k] === "object");
  wrap.innerHTML = "";
  if (!keys.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const paid = state.ME && state.ME.plan !== "free";
  const saved = state.CURRENT_BRANDING.options || {};

  const head = document.createElement("div");
  head.className = "tpl-opt-head";
  head.innerHTML = `<span class="tpl-opt-title">${esc(template.name)} options</span>${paid
    ? `<span class="hint">Changes preview instantly — save to publish.</span>`
    : `<span class="hint">Pro feature. <a href="/dashboard?nav=manage">Upgrade to unlock</a>.</span>`}`;
  wrap.appendChild(head);

  const list = document.createElement("div");
  list.className = "tpl-opt-list";
  for (const key of keys) {
    const field = schema[key];
    const value = Object.hasOwn(saved, key) ? saved[key] : field.default;
    const id = `opt_${key}`;
    const row = document.createElement("div");
    row.className = "tpl-opt";
    const label = `<div class="tpl-opt-label"><span class="tpl-opt-name">${esc(field.label || key)}</span>${field.hint ? `<span class="tpl-opt-hint">${esc(field.hint)}</span>` : ""}</div>`;
    const apply = (v) => {
      state.CURRENT_BRANDING.options = { ...(state.CURRENT_BRANDING.options || {}), [key]: v };
      markDirty();
    };
    if (field.type === "toggle") {
      row.innerHTML = `${label}<label class="switch" title="Toggle ${esc(field.label || key)}"><input type="checkbox" id="${id}"${value ? " checked" : ""}${paid ? "" : " disabled"} /><span class="switch-track"></span></label>`;
      row.querySelector("input").addEventListener("change", (e) => apply(e.target.checked));
    } else if (field.type === "select") {
      const pills = (field.options || [])
        .map((o) => `<button type="button" class="tpl-seg-btn${o === value ? " is-active" : ""}" data-val="${esc(o)}"${paid ? "" : " disabled"}>${esc(o)}</button>`)
        .join("");
      row.innerHTML = `${label}<div class="tpl-seg" role="group" aria-label="${esc(field.label || key)}">${pills}</div>`;
      row.querySelectorAll(".tpl-seg-btn").forEach((btn) =>
        btn.addEventListener("click", () => {
          row.querySelectorAll(".tpl-seg-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
          apply(btn.dataset.val);
        })
      );
    } else if (field.type === "color") {
      row.innerHTML = `${label}<span class="tpl-color"><span class="tpl-color-hex" id="${id}_hex">${esc(String(value || "#000000"))}</span><input type="color" id="${id}" value="${esc(String(value || "#000000"))}"${paid ? "" : " disabled"} /></span>`;
      const input = row.querySelector("input");
      const hex = row.querySelector(`#${id}_hex`);
      // "input" fires while dragging the picker so the preview feels alive.
      const onInput = () => { if (hex) hex.textContent = input.value; apply(input.value); };
      input.addEventListener("input", onInput);
      input.addEventListener("change", onInput);
    } else continue;
    list.appendChild(row);
  }
  wrap.appendChild(list);
}

function _beforeUnloadGuard(e) {
  e.preventDefault();
  return (e.returnValue = "");
}

function markDirty() {
  if (!state._dirty) window.addEventListener("beforeunload", _beforeUnloadGuard);
  state._dirty = true;
  const sb = $("savebar");
  if (sb) sb.hidden = false;
  updateDesignPreview();
}
state.markDirty = markDirty;

export function applyTheme(template, accentA, accentB, label, font = null) {
  const selectedFont = font || $("f_font")?.value || state.CURRENT_BRANDING?.font || "Inter";
  const templateChanged = template !== state.CURRENT_BRANDING.template;
  state.CURRENT_BRANDING = { ...state.CURRENT_BRANDING, template, font: selectedFont };
  // Options are per-template: switching designs drops the previous
  // template's knobs so stale keys never leak across designs.
  if (templateChanged) state.CURRENT_BRANDING.options = {};
  if (state.ME.plan !== "free" && accentA && accentB) {
    state.CURRENT_BRANDING.accentA = accentA;
    state.CURRENT_BRANDING.accentB = accentB;
  }
  const tplEl = $("f_template"); if (tplEl) tplEl.value = template;
  if (state.ME.plan !== "free" && accentA && accentB) {
    $("c_a").value = accentA;
    $("c_b").value = accentB;
  }
  const fontEl = $("f_font"); if (fontEl) fontEl.value = selectedFont;
  const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
  if (active) active.template = template;
  updateThemeSelection();
  renderTemplateText();
  renderSidebarBoardSwitcher();
  renderBoardsPage();
  const status = $("templateStatus");
  if (status) status.textContent = `${label || currentTemplate()?.name || "Design"} selected — click Save changes to publish.`;
  markDirty();
}

function applyTemplate(template) {
  const preset = template.presets?.[0];
  applyTheme(template.id, preset?.accentA, preset?.accentB, template.name);
}

export function renderBranding(br) {
  state.CURRENT_BRANDING = {
    template: br.template || "classic",
    accentA: br.accentA || null,
    accentB: br.accentB || null,
    font: br.font || "Inter",
    options: (br.options && typeof br.options === "object") ? br.options : {},
  };
  const paid = state.ME.plan !== "free";
  $("brandBody").hidden = !paid;
  $("brandLock").hidden = paid;
  updateThemeSelection();
  if (br.hasLogo) { $("logoPreview").src = "/logo/" + state.SLUG + "?t=" + Date.now(); $("logoPreview").hidden = false; $("logoClear").hidden = false; }
}

export function renderPrizes(prizes = {}) {
  const p = { ...DEFAULT_PRIZES, ...prizes };
  const body = $("prizesBody"), lock = $("prizesLock");
  if (body) body.hidden = !isPro();
  if (lock) lock.hidden = isPro();
  if (!isPro()) {
    lock?.addEventListener("click", (e) => { if (e.target.id === "prizesUpgrade") { e.preventDefault(); checkout("pro", e.target); } });
    return;
  }
  $("f_prizePoolLabel").value = p.prizePoolLabel || "";
  $("f_payoutsLabel").value = p.payoutsLabel || "";
  $("f_countdownLabel").value = p.countdownLabel || "";
  $("f_currency").value = p.currency || "$";
  $("f_hidePrizeAmounts").checked = !!p.hidePrizeAmounts;
}

$("logoPick").setAttribute("aria-label", "Upload logo");
$("logoPick").addEventListener("click", () => $("logoFile").click());
$("logoClear").setAttribute("aria-label", "Remove logo");
$("logoClear").addEventListener("click", () => { state.LOGO = null; $("logoPreview").hidden = true; $("logoClear").hidden = true; $("status").textContent = "Logo will be removed when you save."; });
$("logoFile").addEventListener("change", () => {
  const f = $("logoFile").files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => {
    const aspect = img.width / img.height;
    const sizes = [64, 128, 256, 512];
    const srcset = {};
    for (const w of sizes) {
      const h = Math.max(1, Math.round(w / aspect));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      let uri = c.toDataURL("image/webp", 0.85);
      if (!uri.startsWith("data:image/webp")) uri = c.toDataURL("image/jpeg", 0.85);
      if (!uri.startsWith("data:")) continue;
      srcset[w] = uri;
    }
    const entries = Object.values(srcset);
    if (entries.length === 0) { $("status").textContent = "Couldn't convert that image."; URL.revokeObjectURL(img.src); return; }
    const totalChars = entries.reduce((a, b) => a + b.length, 0);
    if (totalChars > 300000) { $("status").textContent = "That image is too big even after resizing. Try a simpler one."; return; }
    state.LOGO = srcset;
    $("logoPreview").src = entries[entries.length - 1];
    $("logoPreview").hidden = false; $("logoClear").hidden = false;
    $("status").textContent = "Logo ready — hit Save to publish it.";
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => { $("status").textContent = "Couldn't read that image."; };
  img.src = URL.createObjectURL(f);
  $("logoFile").value = "";
});
$("applyCustomColors").addEventListener("click", () => applyTheme(state.CURRENT_BRANDING.template, $("c_a").value, $("c_b").value, "Custom colors"));
$("colorsReset").addEventListener("click", () => { const preset = currentTemplate()?.presets?.[0]; if (preset) applyTheme(state.CURRENT_BRANDING.template, preset.accentA, preset.accentB, preset.name); });
$("f_font")?.addEventListener("change", () => applyTheme(state.CURRENT_BRANDING.template, $("c_a")?.value, $("c_b")?.value, "Font"));
$("brandUpgrade").addEventListener("click", (e) => { e.preventDefault(); checkout("pro", e.target); });

export function renderNotifications(n) {
  const paid = state.ME.plan !== "free";
  $("notifyBody").hidden = !paid; $("notifyLock").hidden = paid;
  if (!paid) {
    $("notifyUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); location.href = "/dashboard?nav=manage"; });
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

const SOCIAL_ICONS = {
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/></svg>`,
    kick: `<span style="font-weight:900;font-size:18px">K</span>`,
    twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
  };

  export function renderSocials() {
    const list = $("socialsList");
    if (!list) return;
    const existing = Array.isArray(state.EXTRA?.socials) ? state.EXTRA.socials : [];
    const byBrand = new Map(existing.map((s) => [String(s.brand || s.name || "").toLowerCase(), s]));
    list.innerHTML = SOCIAL_CATALOG.map((c) => {
      const cur = byBrand.get(c.brand) || {};
      const url = cur.url && cur.url !== "#" ? cur.url : "";
      const enabled = cur.enabled !== undefined ? !!cur.enabled : !!url;
      const icon = SOCIAL_ICONS[c.brand] || `<span style="font-weight:700;font-size:14px">${esc(c.name[0])}</span>`;
      return `<div class="social-row-brand" data-social="${esc(c.brand)}">
<div class="social-brand-icon social-brand-icon--${esc(c.brand)}">${icon}</div>
<div><span class="social-name">${esc(c.name)}</span><span class="social-handle">${esc(c.handle)}</span>
<input id="social_${esc(c.brand)}" class="social-url" type="url" inputmode="url" placeholder="${esc(c.placeholder)}" value="${esc(url)}" /></div>
<label class="yr-toggle" title="Show on public page"><input type="checkbox" class="social-toggle" ${enabled ? "checked" : ""} /><span class="yr-slider"></span></label>
</div>`;
    }).join("");
    list.addEventListener("input", collectSocials);
    list.addEventListener("change", collectSocials);
    collectSocials();
  }

const SECTIONS_CATALOG = [
  { key: "leaderboard", label: "Show Leaderboard" },
  { key: "payouts", label: "Show Prize Pool" },
  { key: "countdown", label: "Show Countdown Timer" },
  { key: "rules", label: "Show Rules Section" },
  { key: "socials", label: "Show Social Links" },
  { key: "share", label: "Show Share Buttons" },
  { key: "poweredBy", label: "Show 'Powered by YourRank' badge" },
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
  const body = $("sectionsBody");
  const lock = $("sectionsLock");
  if (list) {
    list.innerHTML = "";
    list.removeEventListener("input", collectSections);
    list.removeEventListener("change", collectSections);
  }
  if (body) body.hidden = !isPro();
  if (lock) lock.hidden = isPro();
  if (lock && !isPro()) lock.addEventListener("click", (e) => { if (e.target.id === "sectionsUpgrade") { e.preventDefault(); checkout("pro", e.target); } });
  if (!list || !isPro()) return;
  const current = { ...DEFAULT_SECTIONS, ...(state.EXTRA?.sections || {}) };
  list.innerHTML = SECTIONS_CATALOG.map((s) => `<div class="section-row" data-section="${esc(s.key)}">
<span class="section-name">${esc(s.label)}</span>
<label class="switch" title="Show on public page"><input type="checkbox" class="section-toggle" ${current[s.key] !== false ? "checked" : ""} /><span class="switch-track"></span></label>
</div>`).join("");
  list.addEventListener("input", collectSections);
  list.addEventListener("change", collectSections);
  collectSections();
}

const DEFAULT_PLAYER_FIELDS = {
  score: { label: "Score", col: "col-score" },
  hands: { label: "Hands", col: "col-hands" },
  netProfit: { label: "Net profit", col: "col-net" },
  winRate: { label: "Win rate", col: "col-win" },
  change: { label: "Change", col: "col-change" },
};

function collectPlayerFields() {
  const list = $("playerFieldsList");
  if (!list) return;
  const current = { ...(state.EXTRA?.playerFields || {}) };
  for (const row of list.querySelectorAll("[data-field]")) {
    const key = row.dataset.field;
    current[key] = row.querySelector(".field-toggle")?.checked ?? true;
  }
  state.EXTRA.playerFields = current;
  applyPlayerFieldVisibility(current);
}

function onPlayerFieldChange() {
  collectPlayerFields();
  markDirty();
}

export function renderPlayerFields() {
  const list = $("playerFieldsList");
  if (!list) return;
  const current = { ...DEFAULT_PLAYER_FIELDS, ...(state.EXTRA?.playerFields || {}) };
  list.innerHTML = Object.entries(DEFAULT_PLAYER_FIELDS).map(([key, meta]) => `<div class="section-row" data-field="${esc(key)}">
<span class="section-name">${esc(meta.label)}</span>
<label class="switch" title="Show in player table"><input type="checkbox" class="field-toggle" ${current[key] !== false ? "checked" : ""} /><span class="switch-track"></span></label>
</div>`).join("");
  list.addEventListener("input", onPlayerFieldChange);
  list.addEventListener("change", onPlayerFieldChange);
  collectPlayerFields();
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

export function renderLegal() {
  const list = $("legalList");
  if (!list) return;
  const legal = state.EXTRA?.legal || {};
  const pages = [
    { key: "terms", label: "Terms of Service" },
    { key: "privacy", label: "Privacy Policy" },
    { key: "responsible", label: "Responsible Gaming" },
    { key: "cookies", label: "Cookie Policy" },
    { key: "refund", label: "Refund Policy" },
    { key: "contact", label: "Contact" },
  ];
  list.innerHTML = pages.map((p) => {
    const enabled = legal[`${p.key}Enabled`] !== false;
    return `<div class="field" style="margin-bottom: 24px;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
  <label for="f_legal_${p.key}" style="margin-bottom: 0;">${esc(p.label)}</label>
  <label class="switch"><input type="checkbox" id="f_legal_${p.key}_enabled"${enabled ? " checked" : ""}><span class="switch-track"></span></label>
</div>
<textarea id="f_legal_${p.key}" rows="4" placeholder="Leave blank to use the default legal text.">${esc(legal[p.key] || "")}</textarea>
</div>`;
  }).join("");
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
    row.innerHTML = `<span class="arch-label"></span><span class="hint">${a.players} players · closed ${when}</span><button class="btn btn--xs btn--ghost arch-restore" type="button">Restore</button><button class="btn btn--xs btn--ghost arch-del" type="button">Delete</button>`;
    row.querySelector(".arch-label").textContent = a.label;
    row.querySelector(".arch-restore").addEventListener("click", async (e) => {
      if (!confirm(`Restore players from "${a.label}"? This will replace the current player list. Save changes to publish.`)) return;
      const btn = e.target;
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Restoring…";
      try {
        const body = { archiveId: a.id };
        if (state.ACTIVE_SITE_ID) body.siteId = state.ACTIVE_SITE_ID;
        const res = await fetch("/api/site/archive/restore", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(body) });
        const d = await res.json().catch(() => ({}));
        if (res.ok && d.ok) {
          const apiUrl = state.ACTIVE_SITE_ID ? `/api/site?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "/api/site";
          const p = await (await fetch(apiUrl)).json();
          if (p.ok) { renderPlayers(p.data.players || []); renumber(); toggleEmpty(); }
          $("status").textContent = `Restored ${d.players || a.players} players from "${a.label}". Save to publish.`;
        } else $("status").textContent = d.error || "Couldn't restore that.";
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
    row.querySelector(".arch-del").addEventListener("click", async (e) => {
      if (!confirm(`Delete the "${a.label}" archive? It disappears from your page too.`)) return;
      const btn = e.target;
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Deleting…";
      try {
        const body = { id: a.id };
        if (state.ACTIVE_SITE_ID) body.siteId = state.ACTIVE_SITE_ID;
        const res = await fetch("/api/site/archive/delete", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(body) });
        const d = await res.json();
        if (res.ok && d.ok) { row.remove(); if (!$("archList").children.length) $("archEmpty").hidden = false; $("status").textContent = "Archive deleted."; }
        else $("status").textContent = d.error || "Couldn't delete that.";
      } finally {
        if (document.body.contains(btn)) {
          btn.disabled = false;
          btn.textContent = orig;
        }
      }
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
      window.removeEventListener("beforeunload", _beforeUnloadGuard);
      if (d.updatedAt) state.SITE_UPDATED_AT = d.updatedAt;
      const sb = $("savebar"); if (sb) sb.hidden = true;
      const active = state.BOARDS.find((b) => b.id === state.ACTIVE_SITE_ID);
      if (active) { active.name = payload.name; active.casino = payload.brand?.casino || active.casino; active.code = payload.brand?.code || active.code; }
      renderBoardSwitcher();
      renderSidebarBoardSwitcher();
      renderBoardsPage();
      // Close the 2-click loop: refresh the live preview so the edit shows immediately.
      updateDesignPreview();
    } else status.textContent = d.error || "Save failed.";
  } catch (err) { logError("save", err); status.textContent = "Network error."; }
  btn.disabled = false; btn.textContent = "Save changes";
  if (status.textContent === "Saved. Your page is updated.") setTimeout(() => { if (status.textContent === "Saved. Your page is updated.") status.textContent = ""; }, 6000);
});

export function renderEmbedShare() {
    const slug = state.SLUG;
    if (!slug) return;
    const origin = location.origin;
    const publicUrl = origin + "/" + slug;

    // Public link
    const pubLink = $("embedPublicLink");
    if (pubLink) pubLink.textContent = publicUrl;
    const pubCopy = $("embedPublicCopy");
    if (pubCopy && !pubCopy._wired) {
      pubCopy._wired = true;
      pubCopy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(publicUrl); pubCopy.querySelector("svg + *")?.remove(); } catch {}
        const span = document.createElement("span"); span.textContent = " Copied!";
        pubCopy.appendChild(span);
        setTimeout(() => span.remove(), 1500);
      });
    }

    // OBS URL
    const obsUrl = origin + "/" + slug + "/overlay";
    const obsLink = $("embedObsUrl");
    if (obsLink) obsLink.textContent = obsUrl;
    const obsCopy = $("embedObsCopy");
    if (obsCopy && !obsCopy._wired) {
      obsCopy._wired = true;
      obsCopy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(obsUrl); obsCopy.querySelector("svg + *")?.remove(); } catch {}
        const span = document.createElement("span"); span.textContent = " Copied!";
        obsCopy.appendChild(span);
        setTimeout(() => span.remove(), 1500);
      });
    }

    // Embed code
    const embedCode = `<iframe src="${origin}/${slug}/embed" width="100%" height="600" frameborder="0"></iframe>`;
    const embedInline = $("embedCodeInline");
    if (embedInline) embedInline.textContent = embedCode;
    const embedCopy = $("embedCodeCopy");
    if (embedCopy && !embedCopy._wired) {
      embedCopy._wired = true;
      embedCopy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(embedCode); embedCopy.textContent = "Copied!"; embedCopy.classList.add("is-copied"); } catch {}
        setTimeout(() => { embedCopy.textContent = "Copy"; embedCopy.classList.remove("is-copied"); }, 1500);
      });
    }

    // Embed options: transparent + hide branding
    const transparentCb = $("embedTransparent");
    const brandingCb = $("embedHideBranding");
    const updateEmbedCode = () => {
      let src = `${origin}/${slug}/embed`;
      const params = [];
      if (transparentCb?.checked) params.push("transparent=1");
      if (brandingCb?.checked) params.push("noBrand=1");
      if (params.length) src += "?" + params.join("&");
      const code = `<iframe src="${src}" width="100%" height="600" frameborder="0"></iframe>`;
      if (embedInline) embedInline.textContent = code;
    };
    if (transparentCb && !transparentCb._wired) { transparentCb._wired = true; transparentCb.addEventListener("change", updateEmbedCode); }
    if (brandingCb && !brandingCb._wired) { brandingCb._wired = true; brandingCb.addEventListener("change", updateEmbedCode); }

    // Social share cards
    const shareUrl = encodeURIComponent(publicUrl);
    const shareText = encodeURIComponent("Check out my leaderboard!");
    const shareX = $("shareX");
    if (shareX && !shareX._wired) { shareX._wired = true; shareX.addEventListener("click", () => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, "_blank")); }
    const shareDiscord = $("shareDiscord");
    if (shareDiscord && !shareDiscord._wired) { shareDiscord._wired = true; shareDiscord.addEventListener("click", () => window.open(`https://discord.com/channels/@me`, "_blank")); }
    const shareTwitch = $("shareTwitch");
    if (shareTwitch && !shareTwitch._wired) { shareTwitch._wired = true; shareTwitch.addEventListener("click", () => window.open(`https://dashboard.twitch.tv`, "_blank")); }
    const shareCopy = $("shareCopy");
    if (shareCopy && !shareCopy._wired) {
      shareCopy._wired = true;
      shareCopy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(publicUrl); shareCopy.querySelector("svg + *")?.remove(); } catch {}
        const span = document.createElement("span"); span.textContent = " Copied!";
        shareCopy.appendChild(span);
        setTimeout(() => span.remove(), 1500);
      });
    }

    // API access (unlock for Pro)
    const apiEl = $("apiAccess");
    if (apiEl) {
      const pro = state.ME?.plan === "pro" || state.ME?.plan === "agency";
      apiEl.classList.toggle("locked", !pro);
    }
  }

  export async function loadStats() {
      const statsUrl = state.ACTIVE_SITE_ID ? `/api/site/stats?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "/api/site/stats";
      let s;
      try {
        const r = await fetch(statsUrl);
        const d = await r.json();
        if (!r.ok || !d.ok) return null;
        s = d.stats;
      } catch (err) { logError("load-stats", err); return null; }
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
  
  // Populate HUD
  const hV = $("hud_views"); if (hV) hV.textContent = fmt(s.last30.views);
  const hC = $("hud_clicks"); if (hC) hC.textContent = fmt(s.last30.clicks);
  const hCtr = $("hud_ctr"); if (hCtr) hCtr.textContent = (s.last30.views ? ((s.last30.clicks / s.last30.views) * 100).toFixed(1) : "0.0") + "%";
  const hS = $("hud_signups"); if (hS) hS.textContent = fmt(s.last30.copies); // Using copies as signups proxy

  const ov7 = $("ov_views7"); if (ov7) ov7.textContent = fmt(s.last7.views);
  const ovBars = $("ov_bars");
  if (ovBars) {
    const ovMax = Math.max(1, ...days.map((x) => x.views + x.copies + x.clicks));
    ovBars.innerHTML = days.map((x) => {
      const total = x.views + x.copies + x.clicks;
      const h = Math.max(2, Math.round((total / ovMax) * 100));
      const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
      const tip = `${nice}: ${x.views} views, ${x.copies} copies, ${x.clicks} clicks`;
      if (!total) return `<div class="stat-bar is-empty" style="height:2%" title="${tip}"></div>`;
      const seg = (v, c) => {
        const pct = Math.max(1, Math.round((v / total) * 100));
        return v ? `<div class="stat-bar-seg ${c}" style="height:${pct}%"></div>` : "";
      };
      return `<div class="stat-bar is-stacked" style="height:${h}%" title="${tip}">${seg(x.views, "views")}${seg(x.copies, "copies")}${seg(x.clicks, "clicks")}</div>`;
    }).join("");
    if (days.length) $("ov_barsFrom").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
    const ovBarsEmpty = $("ov_barsEmpty");
    if (ovBarsEmpty) ovBarsEmpty.hidden = days.length > 0 && (s.last30.views + s.last30.copies + s.last30.clicks) > 0;
  }
  const shareStep = $("ov_step_share");
  if (shareStep && s.last7.views > 0) shareStep.classList.add("is-done");
  return s;
}

$("logout")?.addEventListener("click", async (e) => { e.preventDefault(); await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } }); location.href = "/login"; });
$("upgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout("pro", e.target); });
$("goPro")?.addEventListener("click", (e) => { e.preventDefault(); checkout("pro", e.target); });
$("domainUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout("pro", e.target); });
$("overlayUpgrade")?.addEventListener("click", (e) => { e.preventDefault(); checkout("pro", e.target); });
$("testDiscord")?.addEventListener("click", async () => {
  const s = $("testDiscordStatus"); if (s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "discord", webhook_url: $("f_webhook")?.value.trim() || undefined }) });
    const d = await r.json();
    if (s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch (e) { if (s) s.textContent = "Network error."; }
});
$("testTelegram")?.addEventListener("click", async () => {
  const s = $("testTelegramStatus"); if (s) s.textContent = "Sending…";
  try {
    const r = await fetch("/api/site/notify/test", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify({ channel: "telegram", chat_id: $("f_tgChatId")?.value.trim() || undefined }) });
    const d = await r.json();
    if (s) s.textContent = d.ok ? "✅ Sent!" : (d.error || "Failed");
  } catch (e) { if (s) s.textContent = "Network error."; }
});