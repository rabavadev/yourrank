/* Billing page — show current plan + upgrade options for all 4 tiers + trial. */
const $ = (s) => document.getElementById(s);
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

const TIERS = [
  { key: "free", name: "Free", price: 0, priceStr: "$0", desc: "Up to 10 players · 1 leaderboard · YourRank badge" },
  { key: "starter", name: "Starter", price: 12, priceStr: "$12/mo", desc: "Up to 25 players · 1 leaderboard · no badge · CSV import" },
  { key: "pro", name: "Pro", price: 29, priceStr: "$29/mo", desc: "Up to 9,999 players · up to 3 boards · custom domain · OBS widget · signed score API" },
  { key: "agency", name: "Agency", price: 79, priceStr: "$79/mo", desc: "Up to 99 boards · up to 9,999 players each · white-label · signed score API" },
];

const PLAN_ORDER = ["free", "starter", "pro", "agency"];

function fmtExp(ms) {
  if (!ms) return "Lifetime — no expiry.";
  const d = new Date(Number(ms));
  const left = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (left <= 0) return "Expired. Your plan has reverted to Free.";
  return `Active until ${d.toUTCString().slice(5, 16)} (${left} day${left === 1 ? "" : "s"} left).`;
}

(async function load() {
  let site;
  try {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (!r.ok || !d.ok) { $("loading").textContent = "Couldn't load billing right now — refresh."; return; }
    site = d;
  } catch {
    $("loading").textContent = "Couldn't load billing right now — refresh.";
    return;
  }

  // Fetch user info from /api/auth/me to get has_trial flag
  let meData = null;
  try {
    const mr = await fetch("/api/auth/me");
    const md = await mr.json();
    if (mr.ok && md.ok) meData = md.user;
  } catch { /* me fetch */ }

  const plan = site.plan || "free";
  const planNames = { free: "FREE", starter: "STARTER", pro: "PRO", agency: "AGENCY" };
  const planExpiry = meData?.planExpiresAt || 0;
  const hasTrialUsed = meData?.hasTrial || false;
  const isTrial = meData?.isTrial || false;

  // Plan badge — show trial info if on trial
  if (isTrial && planExpiry) {
    const daysLeft = Math.ceil((Number(planExpiry) - Date.now()) / 86400000);
    $("planBadge").textContent = `TRIAL · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  } else {
    $("planBadge").textContent = (planNames[plan] || "FREE") + " PLAN";
  }

  const currentTier = TIERS.find(t => t.key === plan) || TIERS[0];
  $("planLine").textContent = `${currentTier.name} — ${currentTier.desc}`;

  // Trial status card (when currently on trial)
  if (isTrial && planExpiry) {
    $("trialStatusCard").hidden = false;
    const daysLeft = Math.ceil((Number(planExpiry) - Date.now()) / 86400000);
    $("trialInfo").textContent = `Your Pro trial has ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining. Enjoy all Pro features until then!`;
  }

  // Trial card (for free users who haven't used trial)
  if (plan === "free" && !hasTrialUsed) {
    $("trialCard").hidden = false;
  }

  const isLifetime = !planExpiry || Number(planExpiry) === 0 || Number(planExpiry) > new Date("2099-01-01T00:00:00Z").getTime();
  const isPaid = plan !== "free";

  const isCanceled = meData?.subscriptionStatus === "canceled";
  const untilStr = planExpiry ? new Date(Number(planExpiry)).toUTCString().slice(5, 16) : null;
  if (isPaid && !isTrial && !isLifetime) {
    $("cancelBox").hidden = false;
    if (isCanceled) {
      // Already cancelled — show status instead of an actionable button so the
      // page doesn't look identical to an active subscription.
      $("cancelBtn").hidden = true;
      $("cancelStatus").textContent = untilStr
        ? `Subscription cancelled. You'll keep ${currentTier.name} features until ${untilStr}, then revert to Free.`
        : `Subscription cancelled. You'll keep ${currentTier.name} features until the end of your current billing period.`;
    } else {
      $("cancelBtn").onclick = async () => {
        if (!window.confirm("Cancel your paid subscription? You'll keep Pro features until the end of your current billing period.")) return;
        const status = $("cancelStatus");
        const btn = $("cancelBtn");
        btn.disabled = true;
        status.textContent = "Cancelling...";
        try {
          const r = await fetch("/api/billing/cancel", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
          const d = await r.json();
          if (r.ok && d.ok) {
            // Update in place (no reload) so the confirmation isn't lost and the
            // now-invalid Cancel button disappears.
            btn.hidden = true;
            status.textContent = untilStr
              ? `Subscription cancelled. You'll keep ${currentTier.name} features until ${untilStr}, then revert to Free.`
              : d.message;
          } else {
            status.textContent = d.error || "Could not cancel.";
            btn.disabled = false;
          }
        } catch {
          status.textContent = "Network error. Try again.";
          btn.disabled = false;
        }
      };
    }
  }

  if (plan === "pro" || plan === "agency") {
    $("upgradeCard").hidden = true;
    $("proCard").hidden = false;
    $("currentPlanName").textContent = isTrial ? "Pro (Trial)" : currentTier.name;
    if (isLifetime && !isTrial) {
      $("lifetimeNotice").hidden = false;
      $("proExp").textContent = "";
    } else if (isTrial) {
      const end = planExpiry ? new Date(Number(planExpiry)).toUTCString().slice(5, 16) : null;
      const daysLeft = planExpiry ? Math.max(0, Math.ceil((Number(planExpiry) - Date.now()) / 86400000)) : null;
      $("proExp").textContent = end
        ? `Your Pro trial ends ${end}${daysLeft != null ? ` (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)` : ""}. After that your plan reverts to Free — upgrade any time to keep Pro.`
        : "After your trial ends, your plan reverts to Free. Upgrade any time to keep Pro.";
    } else {
      $("proExp").textContent = fmtExp(planExpiry);
    }
    // Still show extend option
    const opts = $("planOptions");
    if (opts) {
      opts.innerHTML = "";
      TIERS.forEach(t => {
        if (t.key === "free") return;
        const el = document.createElement("div");
        const isCurrent = t.key === plan;
        const isDowngrade = PLAN_ORDER.indexOf(t.key) < PLAN_ORDER.indexOf(plan);
        el.className = "plan-opt" + (isCurrent ? " plan-opt--current" : isDowngrade ? " plan-opt--disabled" : "");
        el.innerHTML = `<span class="plan-opt-name">${t.name}</span><span class="plan-opt-price">${t.priceStr}</span>`;
        if (!isCurrent && !isDowngrade) {
          const btn = document.createElement("button");
          btn.className = "btn btn--sm btn--accent plan-opt-btn";
          btn.textContent = `Upgrade to ${t.name}`;
          btn.onclick = () => startCheckout(t.key);
          el.appendChild(btn);
        } else if (isCurrent) {
          const badge = document.createElement("span");
          badge.className = "plan-opt-btn";
          badge.textContent = isCurrent && isTrial ? "Trial" : "Current";
          badge.className = "label plan-opt-btn";
          el.appendChild(badge);
        }
        opts.appendChild(el);
      });
    }
  } else {
    // Free or Starter — show upgrade options
    const opts = $("planOptions");
    if (opts) {
      opts.innerHTML = "";
      TIERS.forEach(t => {
        const isCurrent = t.key === plan;
        const isDowngrade = PLAN_ORDER.indexOf(t.key) < PLAN_ORDER.indexOf(plan);
        const el = document.createElement("div");
        el.className = "plan-opt" + (isCurrent ? " plan-opt--current" : isDowngrade ? " plan-opt--disabled" : "");
        el.innerHTML = `<span class="plan-opt-name">${t.name}</span><span class="plan-opt-price">${t.price === 0 ? "Free" : t.priceStr}</span>`;
        if (!isCurrent && !isDowngrade) {
          const btn = document.createElement("button");
          btn.className = "btn btn--sm btn--accent plan-opt-btn";
          btn.textContent = t.price === 0 ? "Current" : `Upgrade to ${t.name}`;
          if (t.price > 0) {
            btn.onclick = () => startCheckout(t.key);
          } else {
            btn.disabled = true;
          }
          el.appendChild(btn);
        } else if (isCurrent) {
          const badge = document.createElement("span");
          badge.className = "plan-opt-btn";
          badge.textContent = "Current plan";
          badge.className = "label plan-opt-btn";
          el.appendChild(badge);
        }
        opts.appendChild(el);
      });
    }
  }

  $("loading").hidden = true;
  $("bl").hidden = false;

  // If the user arrived with ?plan=, start the matching checkout flow
  // automatically (e.g. after choosing a plan on the landing/pricing page).
  const autoPlan = new URLSearchParams(location.search).get("plan");
  if (autoPlan) {
    const target = autoPlan.toLowerCase();
    if (target === "lifetime" && !isLifetime) {
      startLifetimeCheckout();
    } else if (["starter", "pro", "agency"].includes(target) && PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(plan)) {
      startCheckout(target);
    }
  }
})();

// Trial button handler
const trialBtn = document.getElementById("trialBtn");
if (trialBtn) {
  trialBtn.addEventListener("click", async () => {
    const status = $("trialStatus");
    trialBtn.disabled = true;
    trialBtn.textContent = "Starting…";
    status.textContent = "";
    try {
      const r = await fetch("/api/billing/trial", {
        method: "POST",
        credentials: "include",
        headers: { "x-csrf-token": getCsrf() },
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        // Reload to reflect new plan
        location.reload();
        return;
      }
      status.textContent = d.error || "Couldn't start trial.";
      trialBtn.disabled = false;
      trialBtn.textContent = "Start free trial";
    } catch {
      status.textContent = "Network error. Try again.";
      trialBtn.disabled = false;
      trialBtn.textContent = "Start free trial";
    }
  });
}

async function startCheckout(planKey) {
  const status = $("status");
  status.textContent = "Opening checkout…";
  try {
    const r = await fetch("/api/billing/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
      body: JSON.stringify({ plan: planKey || "pro" })
    });
    const d = await r.json();
    if (r.ok && d.url) {
      window.location.href = d.url;
      return;
    }
    status.textContent = d.error || "Couldn't start checkout.";
  } catch {
    status.textContent = "Couldn't start checkout. Try again in a minute.";
  }
}

async function startLifetimeCheckout() {
  const status = $("lifetimeStatus");
  const btn = $("lifetimeBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Opening checkout…"; }
  status.textContent = "";
  try {
    const r = await fetch("/api/billing/checkout-lifetime", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
    const d = await r.json();
    if (r.ok && d.url) {
      window.location.href = d.url;
      return;
    }
    status.textContent = d.error || "Couldn't start checkout.";
  } catch {
    status.textContent = "Couldn't start checkout. Try again in a minute.";
  }
  if (btn) { btn.disabled = false; btn.textContent = "Get Lifetime Pro"; }
}

// Lifetime button handler
const lifetimeBtn = document.getElementById("lifetimeBtn");
if (lifetimeBtn) {
  lifetimeBtn.addEventListener("click", startLifetimeCheckout);
}

// QUALITY-012: GDPR self-delete account handler — inline modal, no browser popups
const deleteBtn = $("deleteAccountBtn");
const deleteModal = $("deleteModal");
const deleteConfirm = $("deleteConfirm");
const deletePasswordWrap = $("deletePasswordWrap");
const deletePassword = $("deletePassword");
const deleteConfirmBtn = $("deleteConfirmBtn");
const deleteCancelBtn = $("deleteCancelBtn");
const deleteModalStatus = $("deleteModalStatus");
const status = $("deleteStatus");

function closeDeleteModal() {
  if (deleteModal) deleteModal.hidden = true;
  if (deleteConfirm) deleteConfirm.value = "";
  if (deletePassword) deletePassword.value = "";
  if (deletePasswordWrap) deletePasswordWrap.hidden = true;
  if (deleteModalStatus) deleteModalStatus.textContent = "";
  if (deleteConfirmBtn) deleteConfirmBtn.textContent = "Delete my account";
  if (deleteConfirmBtn) deleteConfirmBtn.disabled = false;
}

if (deleteBtn && deleteModal) {
  deleteBtn.addEventListener("click", () => {
    if (deleteConfirm) deleteConfirm.value = "";
    if (deletePassword) deletePassword.value = "";
    if (deleteModalStatus) deleteModalStatus.textContent = "";
    deleteModal.hidden = false;
    deleteConfirm?.focus();
  });
}

if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener("click", closeDeleteModal);
}

if (deleteConfirmBtn) {
  deleteConfirmBtn.addEventListener("click", async () => {
    if (deleteConfirm?.value.trim() !== "DELETE") {
      if (deleteModalStatus) deleteModalStatus.textContent = 'Type DELETE exactly to confirm.';
      return;
    }
    const password = deletePasswordWrap && !deletePasswordWrap.hidden ? deletePassword?.value.trim() : "";
    if (deletePasswordWrap && !deletePasswordWrap.hidden && !password) {
      if (deleteModalStatus) deleteModalStatus.textContent = "Enter your password.";
      return;
    }
    deleteConfirmBtn.disabled = true;
    deleteConfirmBtn.textContent = "Deleting...";
    if (deleteModalStatus) deleteModalStatus.textContent = "";

    try {
      const r = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-csrf-token": getCsrf() },
        body: JSON.stringify(password ? { password } : {}),
      });
      const d = await r.json();

      if (r.status === 400 && d.error && d.error.includes("Password required")) {
        if (deletePasswordWrap) deletePasswordWrap.hidden = false;
        if (deleteModalStatus) deleteModalStatus.textContent = "Enter your password to confirm deletion.";
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.textContent = "Delete my account";
        if (deletePassword) deletePassword.focus();
        return;
      }

      if (r.ok && d.ok) {
        if (status) status.textContent = "Account deleted. Redirecting...";
        window.location.href = "/";
        return;
      }
      if (deleteModalStatus) deleteModalStatus.textContent = d.error || "Deletion failed. Try again.";
    } catch {
      if (deleteModalStatus) deleteModalStatus.textContent = "Couldn't delete account. Try again.";
    }
    deleteConfirmBtn.disabled = false;
    deleteConfirmBtn.textContent = "Delete my account";
  });
}

// Close modal on Escape or overlay click
if (deleteModal) {
  deleteModal.addEventListener("click", (e) => { if (e.target === deleteModal) closeDeleteModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !deleteModal.hidden) closeDeleteModal(); });
}

// Logout with CSRF
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
    location.href = "/login";
  });
}
