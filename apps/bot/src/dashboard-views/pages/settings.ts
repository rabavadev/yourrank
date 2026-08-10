// settings dashboard page panels
export function settingsPanel(publicBaseUrl: string): string {
  return `
  <div class="panel" data-page="settings"><h2>Postbacks</h2>
    <div id="postbackStatus" class="muted">Loading…</div>
    <p class="mb-sm"><a class="link-block" href="${publicBaseUrl}/account/postbacks">Manage postbacks in Account →</a></p>
  </div>

  <div class="panel" data-page="settings"><h2>Plan</h2>
    <p class="muted mb-sm">Manage your plan, payment history, and Pro trial in your Account.</p>
    <p class="mb-sm"><a class="link-block" href="${publicBaseUrl}/account/plan">Manage plan &amp; billing →</a></p>
  </div>`;
}
