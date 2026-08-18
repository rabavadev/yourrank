// offers dashboard page panels
export function offersPanel(publicBaseUrl: string): string {
  return `
  <div class="lb-bento" data-page="offers">
    <div class="lb-widget lb-widget--full">
      <div class="mb-md"><h2>Your offers</h2></div>
      <p class="muted text-sm mb-sm">Click metrics cover the last 90 days. Reported sign-ups and revenue reflect available deposit tracking.</p>
      <p class="muted text-sm font-600 mb-md" id="postbackStatusOffers">Loading deposit tracking status…</p>
      
      <div class="v3-table-scroll">
        <table class="v3-table">
          <thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>People who clicked</th><th title="People who clicked divided by total clicks">Click rate</th><th title="People who signed up divided by people who clicked">Sign-up rate</th><th>Signed up</th><th>Reported revenue</th><th>Last activity</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody id="offers"><tr><td colspan="11" class="muted">Loading…</td></tr></tbody>
        </table>
      </div>
      
      <p class="muted hint text-xs mt-md">Clicks and click-derived rates use the rolling 90-day window. Revenue is reported through deposit tracking and is not verified receipt. <a href="${publicBaseUrl}/dashboard/settings/connections">Manage deposit tracking in settings →</a></p>
      
      <details class="metric-glossary mt-lg">
        <summary class="muted font-600 cursor-pointer">Metric glossary</summary>
        <dl class="d-flex flex-col gap-8 mt-sm text-sm">
          <div><dt class="font-600 d-inline">Clicks:</dt> <dd class="d-inline muted m-0">Total clicks on this offer's tracked short link.</dd></div>
          <div><dt class="font-600 d-inline">People who clicked:</dt> <dd class="d-inline muted m-0">People who clicked this offer at least once.</dd></div>
          <div><dt class="font-600 d-inline">Click rate:</dt> <dd class="d-inline muted m-0">People who clicked divided by total clicks.</dd></div>
          <div><dt class="font-600 d-inline">Sign-up rate:</dt> <dd class="d-inline muted m-0">People who signed up divided by people who clicked.</dd></div>
          <div><dt class="font-600 d-inline">Signed up:</dt> <dd class="d-inline muted m-0">People who signed up after clicking this offer.</dd></div>
          <div><dt class="font-600 d-inline">Reported revenue:</dt> <dd class="d-inline muted m-0">Amounts reported through deposit tracking, shown separately by currency.</dd></div>
          <div><dt class="font-600 d-inline">Last activity:</dt> <dd class="d-inline muted m-0">Most recent retained click or reported conversion.</dd></div>
        </dl>
      </details>
    </div>

    <div class="lb-widget lb-widget--full">
      <div class="mb-md"><h2>Create offer</h2></div>
      <p class="muted text-sm mb-md">Add an affiliate offer. YourRank creates a tracked short link you can share in your bot.</p>
      <div id="offerPlanState" class="v3-note mb-md" aria-live="polite">Loading offer allowance…</div>
      
      <div class="d-flex flex-col gap-12 offer-create-form" id="offerCreateForm">
        <div class="d-flex gap-12 flex-wrap">
          <div class="flex-1 offer-form-field">
            <label class="sr-only" for="oCasino">Casino</label>
            <input class="v3-input w-full" id="oCasino" placeholder="Casino (e.g. Stake)">
          </div>
          <div class="flex-1 offer-form-field">
            <label class="sr-only" for="oLabel">Label</label>
            <input class="v3-input w-full" id="oLabel" placeholder="Label (e.g. 200% deposit bonus)">
          </div>
        </div>
        
        <label class="sr-only" for="oUrl">Affiliate URL</label>
        <input class="v3-input w-full" id="oUrl" type="url" inputmode="url" placeholder="Your affiliate URL (https://...)">
        
        <div class="d-flex gap-12 flex-wrap">
          <div class="flex-1 offer-form-field">
            <label class="sr-only" for="oCode">Promo Code</label>
            <input class="v3-input w-full" id="oCode" placeholder="Promo code (optional)">
          </div>
          <div class="flex-1 offer-form-field">
            <label class="sr-only" for="oBonus">Bonus Text</label>
            <input class="v3-input w-full" id="oBonus" placeholder="Bonus text shown in bot (optional)">
          </div>
        </div>
        
        <div class="mt-sm">
          <button class="btn btn--accent" data-action="createOffer" type="button">Create offer</button>
        </div>
      </div>

      <div id="offerPreview" class="bg-panel border radius-md p-16 mt-md offer-result" hidden>
        <div class="mb-sm"><h3 id="offerPreviewTitle">Link preview</h3></div>
        <a class="text-sm mb-xs font-mono tracked-link" id="offerPreviewUrl">—</a>
        <p id="offerPreviewText" class="text-sm">—</p>
        <div id="offerCreatedActions" class="d-flex flex-wrap gap-8 mt-md" hidden>
          <button class="btn btn--accent" data-action="copyCreatedOffer" type="button">Copy tracked link</button>
          <a class="btn btn--ghost" href="/dashboard/telegram/commands">Add it to a reply</a>
        </div>
      </div>
    </div>
  </div>`;
}
