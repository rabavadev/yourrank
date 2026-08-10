import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

export const creditsContent = `
<div class="an-head">
  <div>
    <div class="an-eyebrow">Kick channel points</div>
    <h1 class="an-title">Credits &amp; shop</h1>
    <p class="an-sub">Link your Kick channel, map rewards to credits, and manage viewer redemptions.</p>
  </div>
</div>

<div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>

<div id="cr-app" hidden>
  <section class="card" id="cr-onboarding" hidden>
    <div class="cr-section-head">
      <div>
        <h2>Get started</h2>
        <p class="card-sub">Kick points → reward → YourRank credits → shop item → redemption</p>
      </div>
      <button class="btn btn--ghost btn--sm" id="cr-onboarding-hide" type="button">Hide</button>
    </div>
    <ol class="cr-steps">
      <li class="cr-step" id="cr-step-1">
        <div class="cr-step-text">
          <b>1. Connect Kick</b>
          <span class="hint">Link your channel so redemptions on Kick become credits here.</span>
        </div>
        <a class="btn btn--sm" href="#cr-channel">Connect</a>
      </li>
      <li class="cr-step" id="cr-step-2">
        <div class="cr-step-text">
          <b>2. Create reward mapping</b>
          <span class="hint">Map a Kick reward to the credits a viewer earns.</span>
        </div>
        <a class="btn btn--sm" href="#cr-maps">Add mapping</a>
      </li>
      <li class="cr-step" id="cr-step-3">
        <div class="cr-step-text">
          <b>3. Create shop item</b>
          <span class="hint">Add something viewers can buy with their credits.</span>
        </div>
        <a class="btn btn--sm" href="#cr-shop">Add item</a>
      </li>
      <li class="cr-step" id="cr-step-4">
        <div class="cr-step-text">
          <b>4. Test live</b>
          <span class="hint">Redeem a Kick reward on stream, then approve the redemption below.</span>
        </div>
      </li>
      <li class="cr-step" id="cr-step-5">
        <div class="cr-step-text">
          <b>5. Ready to use</b>
          <span class="hint">Your credits &amp; shop program is live.</span>
        </div>
      </li>
    </ol>
  </section>

  <section class="card" id="cr-channel">
    <h2>Connected Kick channel</h2>
    <p class="card-sub">Link your Kick account so reward redemptions from your channel credit your viewers.</p>
    <div id="cr-channel-connected" hidden>
      <p class="card-sub">Connected: <b id="cr-channel-name"></b> (<code id="cr-channel-id"></code>) <span class="hint" id="cr-channel-linked"></span></p>
      <a id="cr-channel-reconnect" class="btn" href="/auth/kick">Reconnect Kick</a>
      <button id="cr-channel-disconnect" class="btn btn--danger" type="button">Disconnect</button>
    </div>
    <div id="cr-channel-connect-wrap">
      <a id="cr-channel-connect" class="btn btn--accent" href="/auth/kick">Connect with Kick</a>
      <details class="cr-advanced">
        <summary>Manual channel ID</summary>
        <form class="grid2" id="cr-channel-form">
          <div class="field">
            <label for="cr-channel-id-input">Kick channel/broadcaster ID</label>
            <input id="cr-channel-id-input" type="text" placeholder="12345678" />
          </div>
          <div class="field">
            <label for="cr-channel-name-input">Channel name (optional)</label>
            <input id="cr-channel-name-input" type="text" placeholder="yourchannel" />
          </div>
          <div class="field" style="grid-column:1/-1">
            <button class="btn" type="submit">Save channel</button>
            <p class="status" id="cr-channel-status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </details>
    </div>
  </section>

  <section class="card">
    <h2>Plan usage</h2>
    <div id="cr-usage" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px"></div>
  </section>

  <section class="card">
    <h2>Viewer login</h2>
    <p class="card-sub">Choose how viewers can access their credits and redeem items.</p>
    <form id="cr-viewer-auth-form" class="grid2">
      <label class="chk"><input type="checkbox" id="cr-viewer-auth-kick" checked /> Allow "Log in with Kick"</label>
      <label class="chk"><input type="checkbox" id="cr-viewer-auth-discord" checked /> Allow "Log in with Discord"</label>
      <label class="chk"><input type="checkbox" id="cr-viewer-auth-public" checked /> Allow public username lookup &amp; redeem</label>
      <div class="field" style="grid-column:1/-1">
        <button class="btn" type="submit" id="cr-viewer-auth-submit">Save settings</button>
        <p class="status" id="cr-viewer-auth-status" role="status" aria-live="polite"></p>
      </div>
    </form>
  </section>

  <section class="card" id="cr-maps">
    <h2>Reward mappings</h2>
    <p class="card-sub">When a viewer redeems one of these Kick channel rewards, they get the matching YourRank credits.</p>
    <p class="hint" id="cr-reward-usage"></p>
    <details class="cr-advanced">
      <summary>Manual reward mapping</summary>
      <form class="grid2" id="cr-reward-form">
        <input type="hidden" id="cr-reward-id" />
        <div class="field">
          <label for="cr-reward-kick-id">Kick reward ID</label>
          <input id="cr-reward-kick-id" type="text" required />
        </div>
        <div class="field">
          <label for="cr-reward-title">Reward title</label>
          <input id="cr-reward-title" type="text" required />
        </div>
        <div class="field">
          <label for="cr-reward-cost">Kick point cost</label>
          <input id="cr-reward-cost" type="number" min="0" value="100" required />
        </div>
        <div class="field">
          <label for="cr-reward-credits">Credits granted</label>
          <input id="cr-reward-credits" type="number" min="1" value="50" required />
        </div>
        <div class="field" style="grid-column:1/-1">
          <button class="btn" type="submit" id="cr-reward-submit">Save mapping</button>
          <p class="status" id="cr-reward-status" role="status" aria-live="polite"></p>
        </div>
      </form>
    </details>

    <h3>Create reward in Kick</h3>
    <form class="grid2" id="cr-reward-create-form">
      <div class="field">
        <label for="cr-reward-create-title">Title</label>
        <input id="cr-reward-create-title" type="text" required maxlength="50" />
      </div>
      <div class="field">
        <label for="cr-reward-create-cost">Kick point cost</label>
        <input id="cr-reward-create-cost" type="number" min="1" value="100" required />
      </div>
      <div class="field">
        <label for="cr-reward-create-credits">Credits granted</label>
        <input id="cr-reward-create-credits" type="number" min="1" value="50" required />
      </div>
      <div class="field">
        <label for="cr-reward-create-color">Background color</label>
        <input id="cr-reward-create-color" type="color" value="#00e701" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <label for="cr-reward-create-desc">Description</label>
        <input id="cr-reward-create-desc" type="text" maxlength="200" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <button class="btn btn--accent" type="submit" id="cr-reward-create-submit">Create in Kick</button>
        <p class="status" id="cr-reward-create-status" role="status" aria-live="polite"></p>
      </div>
    </form>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Reward</th><th>Kick cost</th><th>Credits</th><th>Active</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-reward-list"></tbody>
      </table>
    </div>
  </section>

  <section class="card" id="cr-shop">
    <h2>Shop items</h2>
    <p class="card-sub">Items viewers can buy with credits. Redemptions appear below for you to fulfill off-platform.</p>
    <p class="hint" id="cr-shop-usage"></p>
    <form class="grid2" id="cr-shop-form">
      <input type="hidden" id="cr-shop-item-id" />
      <div class="field">
        <label for="cr-shop-name">Item name</label>
        <input id="cr-shop-name" type="text" required />
      </div>
      <div class="field">
        <label for="cr-shop-cost">Credit cost</label>
        <input id="cr-shop-cost" type="number" min="1" value="100" required />
      </div>
      <div class="field" style="grid-column:1/-1">
        <label for="cr-shop-desc">Description</label>
        <textarea id="cr-shop-desc" rows="2"></textarea>
      </div>
      <div class="field">
        <label for="cr-shop-stock">Stock (leave blank for unlimited)</label>
        <input id="cr-shop-stock" type="number" min="0" />
      </div>
      <div class="field">
        <label class="chk"><input type="checkbox" id="cr-shop-active" checked /> Active</label>
      </div>
      <div class="field" style="grid-column:1/-1">
        <button class="btn btn--accent" type="submit" id="cr-shop-submit">Save item</button>
        <p class="status" id="cr-shop-status" role="status" aria-live="polite"></p>
      </div>
    </form>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Item</th><th>Cost</th><th>Stock</th><th>Active</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-shop-list"></tbody>
      </table>
    </div>
  </section>

  <section class="card" id="cr-viewers">
    <h2>Viewer balances</h2>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Kick user</th><th>Balance</th><th>Total earned</th><th>Total spent</th><th>Last earned</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-viewer-list"></tbody>
      </table>
      <p class="empty" id="cr-viewer-empty" hidden>No viewers yet.</p>
    </div>
  </section>

  <section class="card" id="cr-redemptions">
    <h2>Redemptions</h2>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Viewer</th><th>Item</th><th>Cost</th><th>Status</th><th>Time</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-redemption-list"></tbody>
      </table>
      <p class="empty" id="cr-redemption-empty" hidden>No redemptions yet.</p>
    </div>
  </section>

  <section class="card" id="cr-history">
    <h2>Cross-board viewer history</h2>
    <p class="card-sub">Search a Kick viewer across all of your boards.</p>
    <form class="grid2" id="cr-history-form" style="margin-bottom:14px">
      <div class="field">
        <label for="cr-history-username">Kick username</label>
        <input id="cr-history-username" type="text" placeholder="viewer123" />
      </div>
      <div class="field" style="display:flex;align-items:flex-end">
        <button class="btn" type="submit" id="cr-history-search">Search</button>
      </div>
    </form>
    <p class="status" id="cr-history-status" role="status" aria-live="polite"></p>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Board</th><th>Balance</th><th>Earned</th><th>Spent</th><th>Pending</th><th>Total</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-history-list"></tbody>
      </table>
      <p class="empty" id="cr-history-empty" hidden>No boards found for this viewer.</p>
    </div>
  </section>

  <section class="card">
    <h2>Analytics</h2>
    <div class="field" style="margin-bottom:16px">
      <label for="cr-analytics-days">Last</label>
      <select id="cr-analytics-days">
        <option value="7">7 days</option>
        <option value="30" selected>30 days</option>
        <option value="90">90 days</option>
      </select>
    </div>
    <div class="cr-analytics-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:18px">
      <div class="cr-stat"><div class="cr-stat-label">Credits earned</div><div class="cr-stat-value" id="cr-stat-earned">–</div></div>
      <div class="cr-stat"><div class="cr-stat-label">Credits spent</div><div class="cr-stat-value" id="cr-stat-spent">–</div></div>
      <div class="cr-stat"><div class="cr-stat-label">Redemptions</div><div class="cr-stat-value" id="cr-stat-redemptions">–</div></div>
      <div class="cr-stat"><div class="cr-stat-label">Pending</div><div class="cr-stat-value" id="cr-stat-pending">–</div></div>
      <div class="cr-stat"><div class="cr-stat-label">Viewer balance</div><div class="cr-stat-value" id="cr-stat-balance">–</div></div>
    </div>
    <h3>Top earners</h3>
    <div class="board-table-wrap">
      <table class="board-table" id="cr-top-earners">
        <thead><tr><th>Viewer</th><th>Balance</th><th>Earned</th><th>Spent</th></tr></thead>
        <tbody id="cr-top-earners-list"></tbody>
      </table>
      <p class="empty" id="cr-top-earners-empty" hidden>No data yet.</p>
    </div>
    <h3>Top items</h3>
    <div class="board-table-wrap">
      <table class="board-table" id="cr-top-items">
        <thead><tr><th>Item</th><th>Redemptions</th><th>Credits spent</th></tr></thead>
        <tbody id="cr-top-items-list"></tbody>
      </table>
      <p class="empty" id="cr-top-items-empty" hidden>No data yet.</p>
    </div>
    <h3>Credits by day</h3>
    <div id="cr-credits-by-day" class="cr-bars" style="display:flex;align-items:flex-end;gap:4px;height:120px;margin-bottom:8px"></div>
    <p class="empty" id="cr-credits-by-day-empty" hidden>No data for this period.</p>
  </section>
</div>

<div id="cr-empty" class="empty" hidden>
  <p>Loading your credits dashboard…</p>
</div>
<div id="cr-standalone" hidden></div>
`;

export const creditsPage = leaderboardPageHtml({
  title: "Credits · YourRank",
  canonical: "https://yourrank.site/dashboard/credits",
  mainClass: "wrap cr-wrap",
  scripts: ['<script src="/assets/credits.js?v=2" type="module"></script>'],
  content: creditsContent,
});
