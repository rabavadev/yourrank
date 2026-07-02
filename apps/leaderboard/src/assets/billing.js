/* Billing page — show current plan + upgrade options for all 4 tiers. */
const $ = (s) => document.getElementById(s);
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

const TIERS = [
  { key: "free", name: "Free", price: 0, priceStr: "$0", desc: "Up to 10 players · 1 leaderboard · YourRank badge" },
  { key: "starter", name: "Starter", price: 12, priceStr: "$12/mo", desc: "Up to 25 players · 1 leaderboard · no badge · CSV import" },
  { key: "pro", name: "Pro", price: 29, priceStr: "$29/mo", desc: "Unlimited players · up to 3 boards · custom domain · OBS widget · Discord/Telegram" },
  { key: "agency", name: "Agency", price: 79, priceStr: "$79/mo", desc: "Unlimited everything · white-label · API access" },
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

  const plan = site.plan || "free";
  const planNames = { free: "FREE", starter: "STARTER", pro: "PRO", agency: "AGENCY" };
  $("planBadge").textContent = (planNames[plan] || "FREE") + " PLAN";

  const currentTier = TIERS.find(t => t.key === plan) || TIERS[0];
  $("planLine").textContent = `${currentTier.name} — ${currentTier.desc}`;

  if (plan === "pro" || plan === "agency") {
    $("upgradeCard").hidden = true;
    $("proCard").hidden = false;
    $("currentPlanName").textContent = currentTier.name;
    $("proExp").textContent = "Manage your leaderboard from the Leaderboard tab. Extend your subscription below.";
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
          btn.onclick = () => startCheckout();
          el.appendChild(btn);
        } else if (isCurrent) {
          const badge = document.createElement("span");
          badge.className = "plan-opt-btn";
          badge.textContent = "Current";
          badge.style.cssText = "font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute)";
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
            btn.onclick = () => startCheckout();
          } else {
            btn.disabled = true;
          }
          el.appendChild(btn);
        } else if (isCurrent) {
          const badge = document.createElement("span");
          badge.className = "plan-opt-btn";
          badge.textContent = "Current plan";
          badge.style.cssText = "font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute)";
          el.appendChild(badge);
        }
        opts.appendChild(el);
      });
    }
  }

  $("loading").hidden = true;
  $("bl").hidden = false;
})();

async function startCheckout() {
  const status = $("status");
  status.textContent = "Opening checkout…";
  try {
    const r = await fetch("/api/billing/checkout", { method: "POST", headers: { "x-csrf-token": getCsrf() } });
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
