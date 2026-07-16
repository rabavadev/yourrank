import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

export const securityPage = leaderboardPageHtml({
  title: "Security · YourRank",
  canonical: "https://yourrank.site/dashboard/security",
  scripts: ['<script src="/assets/security.js?v=1" type="module"></script>'],
  content: `<div class="wrap">
<div class="mb-16"><h1>Security center</h1><p class="hint">Password, active sessions, and your data.</p></div>

<div class="card">
  <h2>Change password</h2>
  <p class="card-sub">A password change signs out every other device.</p>
  <div class="grid2">
    <div class="field"><label for="cp_current">Current password</label><input type="password" id="cp_current" autocomplete="current-password" /></div>
    <div class="field"><label for="cp_new">New password</label><input type="password" id="cp_new" autocomplete="new-password" minlength="8" /></div>
  </div>
  <div class="d-flex gap-8 flex-wrap items-center">
    <button class="btn btn--accent" id="cp_save" type="button">Update password</button>
    <span class="hint" id="cp_status" role="status" aria-live="polite"></span>
  </div>
</div>

<div class="card">
  <div class="d-flex justify-between items-center" style="margin-bottom:12px"><h2 style="margin:0">Active sessions</h2><button class="btn btn--ghost btn--sm" id="sess_revoke" type="button">Sign out other sessions</button></div>
  <p class="card-sub">Devices currently signed in to YourRank.</p>
  <div id="sess_list"><p class="hint">Loading…</p></div>
  <p class="hint" id="sess_status" role="status" aria-live="polite"></p>
</div>

<div class="card">
  <h2>Your data</h2>
  <p class="card-sub">Download a copy of your account data in JSON format (GDPR/CCPA).</p>
  <div class="d-flex gap-8 flex-wrap items-center">
    <button class="btn btn--accent" id="export_btn" type="button">Download my data</button>
    <span class="hint" id="export_status" role="status" aria-live="polite"></span>
  </div>
</div>
</div>`,
});
