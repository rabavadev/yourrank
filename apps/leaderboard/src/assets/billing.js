/* Billing page — show current plan + (if free) a checkout button, (if pro) the
 * Pro card. Reuses /api/site (for plan + expiry) and /api/billing/checkout. */
const $ = (s) => document.getElementById(s);

const PRO_DAYS = 31;

function fmtExp(ms) {
  if (!ms) return "Lifetime — no expiry.";
  const d = new Date(Number(ms));
  const left = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (left <= 0) return "Expired. Your plan has reverted to Free.";
  return `Pro is active until ${d.toUTCString().slice(5, 16)} (${left} day${left === 1 ? "" : "s"} left).`;
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
  $("planBadge").textContent = plan === "pro" ? "PRO PLAN" : plan === "agency" ? "AGENCY PLAN" : "FREE PLAN";

  if (plan === "pro" || plan === "agency") {
    $("upgradeCard").hidden = true;
    $("proCard").hidden = false;
    $("proExp").textContent = fmtExp(site.data && site.data.endsAt ? null : null);
    // site.js returns plan_expires_at as epoch-ms via effectivePlan; /api/site
    // doesn't currently surface it, so show a graceful generic line.
    $("proExp").textContent = "Thanks for being on Pro. Manage your leaderboard from the Leaderboard tab.";
  } else {
    $("planLine").textContent = "Free — up to 10 players, one leaderboard. Upgrade for 50 players + branding.";
  }

  $("loading").hidden = true;
  $("bl").hidden = false;

  $("checkout").addEventListener("click", async () => {
    const btn = $("checkout");
    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = "Opening checkout…";
    try {
      const r = await fetch("/api/billing/checkout", { method: "POST" });
      const d = await r.json();
      if (r.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      $("status").textContent = d.error || "Couldn't start checkout.";
    } catch {
      $("status").textContent = "Couldn't start checkout. Try again in a minute.";
    }
    btn.disabled = false;
    btn.textContent = orig;
  });
})();
