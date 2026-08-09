// settings dashboard page panels
export function settingsPanel(publicBaseUrl: string): string {
  return `
  <div class="panel" data-page="settings"><h2>Postbacks</h2>
    <p class="muted style-21">Manage postback keys, signed endpoints, and the conversion log in your Account.</p>
    <p class="style-21"><a class="style-22 style-34" href="/account#postbacks">Open postback management →</a></p>
    <hr class="style-20" />
    <p class="muted style-21">See which of your clicks turn into real deposits. You don't need to do anything technical —
      send the setup details below to your affiliate manager and they'll connect it for you.</p>
    <details class="adv"><summary>Setup details for your affiliate manager (technical)</summary>
    <p class="muted style-21">Add <code>{click_ref}</code> anywhere in the affiliate URL to attribute deposits to clicks.</p>
    <p class="muted style-29">Use <code>POST ${publicBaseUrl}/pb</code> with headers
      <code>X-Postback-Key</code> (your key, below) + <code>X-Postback-Signature</code> (hex HMAC-SHA256 of the query string, keyed by that same key). It's the secure option — the key never rides the URL and the signature blocks tampering.</p>
    <div class="style-21"><button class="ghost" data-action="revealPostback" type="button">Show signed postback setup</button>
      <span id="pbUrl" class="copy style-30" data-action="copyPostback" data-url=""></span>
      <button class="ghost style-31" data-action="rotatePostback" type="button">Rotate key</button>
      <button class="ghost style-32" data-action="revokePostback" type="button">Revoke key</button></div>
    </details>
    <table><thead><tr><th>When</th><th>Event</th><th>Amount</th><th>Offer</th></tr></thead>
    <tbody id="convList"></tbody></table>
  </div>

  <div class="panel" data-page="settings"><h2>Plan</h2>
    <p class="muted style-21">Manage your plan, payment history, and Pro trial in your Account.</p>
    <p class="style-21"><a class="style-22 style-34" href="/account#plan">Manage plan &amp; billing →</a></p>
    <hr class="style-20" />
    <div id="planInfo" class="muted">Loading…</div>
    <div class="style-10" id="planButtons"></div>
  </div>`;
}
