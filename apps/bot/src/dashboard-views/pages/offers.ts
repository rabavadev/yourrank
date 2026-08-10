// offers dashboard page panels
export function offersPanel(publicBaseUrl: string): string {
  return `
  <div class="panel" data-page="offers"><h2>Your offers</h2>
    <p class="muted">Lifetime metrics for all offers. Set up postbacks to see conversions.</p>
    <p class="muted" id="postbackStatus">Loading postback status…</p>
    <div class="tbl-scroll"><table><thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>Unique</th><th title="Click-through rate: unique clicks / total clicks">CTR ?</th><th title="Conversion rate: conversions / unique clicks">CR ?</th><th>Conv.</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="offers"><tr><td colspan="9" class="muted">Loading…</td></tr></tbody></table></div>
    <p class="muted hint">Metrics are lifetime totals for each offer. <a href="${publicBaseUrl}/account/postbacks">Manage postbacks in Account →</a></p>
    <details class="glossary"><summary>Metric glossary</summary>
      <dl>
        <div><dt>Clicks</dt><dd>Total clicks on this offer's tracked short link.</dd></div>
        <div><dt>Unique</dt><dd>Distinct users who clicked at least once.</dd></div>
        <div><dt>CTR</dt><dd>Click-through rate: unique clicks ÷ total clicks.</dd></div>
        <div><dt>CR</dt><dd>Conversion rate: conversions ÷ unique clicks.</dd></div>
        <div><dt>Conv.</dt><dd>Reported conversions from sponsor postbacks.</dd></div>
        <div><dt>Postback</dt><dd>A server-to-server call that confirms a click led to a conversion.</dd></div>
      </dl>
    </details>
  </div>

  <div class="panel" data-page="offers"><h2>Create offer</h2>
    <p class="muted">Add an affiliate offer. YourRank creates a tracked short link you can share in your bot.</p>
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

    <div id="offerPreview" class="offer-preview" hidden>
      <h3 class="subhead">Link preview</h3>
      <p class="muted" id="offerPreviewUrl">—</p>
      <p id="offerPreviewText">—</p>
    </div>
  </div>`;
}
