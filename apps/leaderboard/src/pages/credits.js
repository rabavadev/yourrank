import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

export const creditsPage = leaderboardPageHtml({
  title: "Credits · YourRank",
  canonical: "https://yourrank.site/dashboard/credits",
  mainClass: "wrap cr-wrap",
  scripts: ['<script src="/assets/credits.js?v=1" type="module"></script>'],
  content: `
<div class="an-head">
  <div>
    <div class="an-eyebrow">Kick channel points</div>
    <h1 class="an-title">Credits &amp; shop</h1>
    <p class="an-sub">Link your Kick channel, map rewards to credits, and manage viewer redemptions.</p>
  </div>
</div>

<div id="cr-app" hidden>
  <section class="card">
    <h2>Connected Kick channel</h2>
    <p class="card-sub">The broadcaster user ID from Kick. Reward redemptions from this channel will credit your viewers.</p>
    <form class="grid2" id="cr-channel-form">
      <div class="field">
        <label for="cr-channel-id">Kick channel/broadcaster ID</label>
        <input id="cr-channel-id" type="text" placeholder="12345678" required />
      </div>
      <div class="field">
        <label for="cr-channel-name">Channel name (optional)</label>
        <input id="cr-channel-name" type="text" placeholder="yourchannel" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <button class="btn btn--accent" type="submit">Save channel</button>
        <p class="status" id="cr-channel-status" role="status" aria-live="polite"></p>
      </div>
    </form>
  </section>

  <section class="card">
    <h2>Reward mappings</h2>
    <p class="card-sub">When a viewer redeems one of these Kick channel rewards, they get the matching YourRank credits.</p>
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
        <button class="btn btn--accent" type="submit">Save mapping</button>
        <p class="status" id="cr-reward-status" role="status" aria-live="polite"></p>
      </div>
    </form>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Reward</th><th>Kick cost</th><th>Credits</th><th>Active</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-reward-list"></tbody>
      </table>
    </div>
  </section>

  <section class="card">
    <h2>Shop items</h2>
    <p class="card-sub">Items viewers can buy with credits. Redemptions appear below for you to fulfill off-platform.</p>
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
        <button class="btn btn--accent" type="submit">Save item</button>
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

  <section class="card">
    <h2>Viewer balances</h2>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Kick user</th><th>Balance</th><th>Total earned</th><th>Total spent</th><th>Last earned</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-viewer-list"></tbody>
      </table>
      <p class="empty" id="cr-viewer-empty" hidden>No viewers yet.</p>
    </div>
  </section>

  <section class="card">
    <h2>Redemptions</h2>
    <div class="board-table-wrap">
      <table class="board-table">
        <thead><tr><th>Viewer</th><th>Item</th><th>Cost</th><th>Status</th><th>Time</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="cr-redemption-list"></tbody>
      </table>
      <p class="empty" id="cr-redemption-empty" hidden>No redemptions yet.</p>
    </div>
  </section>
</div>

<div id="cr-empty" class="empty" hidden>
  <p>Loading your credits dashboard…</p>
</div>
`});
