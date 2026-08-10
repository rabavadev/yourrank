import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

export const viewerDashboardPage = leaderboardPageHtml({
  title: "My credits · YourRank",
  canonical: "https://yourrank.site/me",
  mainClass: "wrap cr-wrap",
  nav: false,
  scripts: ['<script src="/assets/viewer-dashboard.js?v=1" type="module"></script>'],
  content: `
<header class="gm-shell-nav"><div class="gm-shell-inner">
  <a class="gm-brand" href="/"><span class="gm-brand-mark">YR</span><span class="gm-brand-word">YourRank</span></a>
  <nav id="vd-nav" aria-label="Viewer"></nav>
</div></header>

<main class="wrap cr-wrap" id="main-content">
  <div id="vd-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>
  <div class="an-head">
    <div>
      <div class="an-eyebrow">Viewer dashboard</div>
      <h1 class="an-title" id="vd-title">My credits</h1>
      <p class="an-sub">See your credits across all streamer boards and redeem shop items.</p>
    </div>
  </div>

  <section class="card" id="vd-login-card">
    <h2>Log in to YourRank</h2>
    <p class="card-sub">Connect the account you use to earn channel points.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn btn--accent" id="vd-login-kick" href="/api/viewer/auth/kick">Log in with Kick</a>
      <a class="btn" id="vd-login-discord" href="/api/viewer/auth/discord">Log in with Discord</a>
    </div>
    <p class="status" id="vd-login-status" role="status" aria-live="polite"></p>
  </section>

  <section class="card" id="vd-profile" hidden>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <img id="vd-avatar" src="" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover" hidden />
      <div>
        <h2 id="vd-username">Viewer</h2>
        <p class="card-sub" id="vd-identity">Loading identity…</p>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <button class="btn btn--sm" id="vd-logout" type="button">Log out</button>
      </div>
    </div>
    <p class="hint" id="vd-wrong-account" hidden>Wrong account? <button class="btn btn--ghost btn--sm" id="vd-switch" type="button">Use a different login</button></p>
  </section>

  <section class="card" id="vd-boards-card" hidden>
    <h2>Your boards</h2>
    <p class="card-sub">Each card shows your credits for a streamer's board. Select one to view the shop and your redemptions.</p>
    <div id="vd-boards"></div>
    <p class="empty" id="vd-boards-empty" hidden>You don't have credits on any board yet. Redeem a Kick channel reward that is mapped to YourRank credits to earn some.</p>
  </section>

  <section class="card" id="vd-site-card" hidden>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <div>
        <h2 id="vd-site-name">Board</h2>
        <p class="card-sub" id="vd-site-streamer">Streamer board</p>
      </div>
      <button class="btn btn--sm" id="vd-back" type="button">Back to boards</button>
    </div>
    <p class="card-sub">Balance: <b id="vd-site-balance">0</b> credits</p>
    <p class="hint" id="vd-earn-hint">Earn credits by redeeming the streamer's mapped Kick channel rewards during a live stream.</p>

    <h3>Shop</h3>
    <div id="vd-shop-list"></div>
    <p class="empty" id="vd-shop-empty" hidden>No items available.</p>

    <h3 style="margin-top:24px">Your redemptions</h3>
    <div id="vd-redemptions-list"></div>
    <p class="empty" id="vd-redemptions-empty" hidden>No redemptions yet.</p>
    <p class="hint"><b>Pending</b> = waiting for the streamer; <b>Fulfilled</b> = approved; <b>Cancelled</b> = refunded.</p>
  </section>
</main>
`,
});
