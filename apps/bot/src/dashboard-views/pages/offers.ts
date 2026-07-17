// offers dashboard page panels
export function offersPanel(): string {
  return `
  <div class="panel" data-page="offers"><h2>New offer</h2>
    <div class="row">
      <label class="sr-only" for="oCasino">Casino</label>
      <input id="oCasino" placeholder="Casino (e.g. Stake)">
      <label class="sr-only" for="oLabel">Label</label>
      <input id="oLabel" placeholder="Label (e.g. 200% deposit bonus)">
    </div>
    <label class="sr-only" for="oUrl">Affiliate URL</label>
    <input id="oUrl" type="url" inputmode="url" placeholder="Your affiliate URL (https://...)">
    <div class="row">
      <label class="sr-only" for="oCode">Promo Code</label>
      <input id="oCode" placeholder="Promo code (optional)">
      <label class="sr-only" for="oBonus">Bonus Text</label>
      <input id="oBonus" placeholder="Bonus text shown in bot (optional)">
    </div>
    <button data-action="createOffer" type="button">Create offer</button>
  </div>

  <div class="panel" data-page="offers"><h2>Offers</h2>
    <table><thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>Unique</th><th>CTR</th><th>CR</th><th>Conv.</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="offers"><tr><td colspan="9" class="muted">Loading…</td></tr></tbody></table>
  </div>`;
}
