// settings dashboard page panels
export function settingsPanel(publicBaseUrl: string): string {
  return `
  <div class="panel" data-page="settings"><h2>Postbacks</h2>
    <div id="postbackStatus" class="muted">Loading…</div>
    <p class="style-21"><a class="style-22 style-34" href="${publicBaseUrl}/account/postbacks">Manage postbacks in Account →</a></p>
  </div>

  <div class="panel" data-page="settings"><h2>Plan</h2>
    <p class="muted style-21">Manage your plan, payment history, and Pro trial in your Account.</p>
    <p class="style-21"><a class="style-22 style-34" href="${publicBaseUrl}/account/plan">Manage plan &amp; billing →</a></p>
  </div>`;
}
