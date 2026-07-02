/* Referral dashboard: loads referral code, stats, and history. */
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }
const $ = (id) => document.getElementById(id);

async function init() {
  try {
    const me = await (await fetch("/api/auth/me")).json();
    if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  } catch { location.href = "/login"; return; }

  // Load referral code + summary
  try {
    const codeRes = await fetch("/api/referral/code");
    const codeData = await codeRes.json();
    if (codeRes.ok && codeData.ok) {
      $("rf_link").value = codeData.url;
      $("rf_count").textContent = codeData.referrals_count;
      $("rf_days").textContent = codeData.rewards_earned;
    }
  } catch {}

  // Load referral history
  try {
    const statsRes = await fetch("/api/referral/stats");
    const statsData = await statsRes.json();
    if (statsRes.ok && statsData.ok) {
      renderReferrals(statsData.referrals || []);
    }
  } catch {}

  $("loading").hidden = true;
  $("rf").hidden = false;
}

function renderReferrals(list) {
  const tbody = $("rf_rows");
  tbody.innerHTML = "";
  $("rf_empty").hidden = list.length > 0;
  list.forEach(r => {
    const tr = document.createElement("tr");
    const email = esc(r.referred_email || "—");
    const slug = r.referred_slug ? `<a href="/${esc(r.referred_slug)}" target="_blank">${esc(r.referred_slug)}</a>` : "—";
    const days = r.reward_days + "d Pro";
    const when = r.created_at ? new Date(r.created_at).toLocaleDateString() : "—";
    tr.innerHTML = `<td>${email}</td><td>${slug}</td><td>${days}</td><td>${when}</td>`;
    tbody.appendChild(tr);
  });
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Copy referral link
$("rf_copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("rf_link").value);
    $("rf_copy").textContent = "✓ Copied!";
    setTimeout(() => { $("rf_copy").textContent = "📋 Copy link"; }, 2000);
  } catch {
    $("rf_link").select();
    document.execCommand("copy");
    $("rf_copy").textContent = "✓ Copied!";
    setTimeout(() => { $("rf_copy").textContent = "📋 Copy link"; }, 2000);
  }
});

init();
