import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

const accountContent = `
<div class="toast" id="status" role="status" aria-live="polite" hidden></div>
<div class="lb-shell">
  <aside class="lb-side" id="accSide" aria-label="Account sections">
    <div class="lb-side-head">
      <span class="label">Account</span>
      <div class="lb-active-name" id="accUserName">…</div>
    </div>
    <nav class="lb-side-group" aria-label="Account">
      <a class="lb-nav" href="/account#profile" data-hash="profile"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>Profile</a>
      <a class="lb-nav" href="/account#plan" data-hash="plan"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span>Plan &amp; billing</a>
      <a class="lb-nav" href="/account#postbacks" data-hash="postbacks"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>Postbacks</a>
      <a class="lb-nav" href="/account#data" data-hash="data"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg></span>Danger zone</a>
    </nav>
  </aside>
  <div class="lb-main">
    <div class="lb-bento">
      <div class="lb-widget lb-widget--full" id="profile">
        <h2>Profile</h2>
        <p class="card-sub">Your password and active sessions.</p>
        <div class="field"><label for="accCurrentPassword">Current password</label><input type="password" id="accCurrentPassword" autocomplete="current-password" /></div>
        <div class="field"><label for="accNewPassword">New password</label><input type="password" id="accNewPassword" autocomplete="new-password" minlength="8" /></div>
        <div class="d-flex gap-8 items-center flex-wrap">
          <button class="btn btn--accent" id="accChangePassword" type="button">Update password</button>
          <span class="hint" id="accPasswordStatus" role="status" aria-live="polite"></span>
        </div>
        <hr class="hr" />
        <div class="d-flex justify-between items-center mb-12"><h3 class="m-0">Active sessions</h3><button class="btn btn--ghost btn--sm" id="accRevokeSessions" type="button">Sign out other sessions</button></div>
        <div id="accSessions"><p class="hint">Loading…</p></div>
        <p class="hint" id="accSessionsStatus" role="status" aria-live="polite"></p>
      </div>

      <div class="lb-widget lb-widget--full" id="plan">
        <h2>Plan &amp; billing</h2>
        <p class="card-sub">Pick the plan that fits your stream, or start a free Pro trial.</p>
        <div class="plan-summary" id="planSummary"></div>
        <div class="plan-banner" id="planBanner" role="status" aria-live="polite" hidden></div>
        <div id="pendingPayment" hidden>
          <p class="status" role="status" aria-live="polite"></p>
          <a class="btn btn--sm" id="pendingPaymentLink" href="#">Complete payment</a>
        </div>
        <div id="cancelWrap" hidden>
          <p class="hint" id="cancelStatus" role="status" aria-live="polite"></p>
          <button class="btn btn--sm btn--danger" id="cancelBtn" type="button">Cancel subscription</button>
        </div>
        <div class="plan-grid" id="planGrid"></div>
        <div class="plan-trial" id="planTrial" hidden><p class="hint">Not ready to pay? Try every Pro feature free for 7 days.</p><button class="btn btn--accent" id="trialBtn" type="button">Start free Pro trial</button><p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
        <p class="hint" id="planHint">Paid plans are billed in crypto (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms.</p>
        <div id="historyCard" hidden>
          <h3 class="m-0 mt-18 mb-4">Payment history</h3>
          <p class="card-sub">Your past payments and receipts.</p>
          <table class="admin-table" id="historyTable"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody id="historyBody"></tbody></table>
          <div class="empty" id="historyEmpty" hidden>No payments yet.</div>
          <p class="hint">Receipts are also emailed to your account address after each successful payment.</p>
        </div>
      </div>

      <div class="lb-widget lb-widget--full" id="postbacks">
        <h2>Postbacks</h2>
        <p class="card-sub">Receive automatic score updates from your sponsor via signed postback URLs.</p>
        <div id="postbackCard" hidden>
          <div class="field">
            <label>Signed endpoint URL</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackSigned" class="overlay-url"></code>
              <button class="btn btn--sm btn--accent ic-btn" id="postbackCopySigned" type="button">Copy</button>
            </div>
          </div>
          <div class="field">
            <label>Postback key</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackKey" class="overlay-url"></code>
              <button class="btn btn--sm btn--accent ic-btn" id="postbackCopyKey" type="button">Copy</button>
            </div>
            <span class="hint">Sign the raw query string with HMAC-SHA256 keyed by this value, then send it as the <code>X-Postback-Signature</code> header.</span>
          </div>
          <div class="field">
            <label>Legacy URL (sunset ${new Date().getFullYear() + 1})</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackLegacy" class="overlay-url"></code>
              <button class="btn btn--sm ic-btn" id="postbackCopyLegacy" type="button">Copy</button>
            </div>
          </div>
          <div class="d-flex gap-8 flex-wrap mt-14">
            <button class="btn btn--sm" id="postbackRotate" type="button">Rotate key</button>
            <button class="btn btn--sm btn--danger" id="postbackRevoke" type="button">Revoke key</button>
          </div>
          <p class="hint" id="postbackStatus" role="status" aria-live="polite"></p>
          <hr class="hr" />
          <h3 class="m-0 mt-18 mb-4">Recent conversions</h3>
          <table class="admin-table" id="conversionsTable"><thead><tr><th>Time</th><th>Event</th><th>Amount</th><th>Currency</th><th>Offer</th></tr></thead><tbody id="conversionsBody"></tbody></table>
          <p class="empty" id="conversionsEmpty" hidden>No conversions yet.</p>
        </div>
        <div id="postbackUpgrade" hidden>
          <p class="hint">Postbacks are a paid feature. Upgrade to Pro to generate keys and view conversions.</p>
          <a class="btn btn--accent" href="/account#plan">See plans</a>
        </div>
      </div>

      <div class="lb-widget lb-widget--full lb-widget--danger" id="data">
        <h2>Account</h2>
        <p class="card-sub">Export your data or permanently delete your account.</p>
        <div class="d-flex gap-8 items-center flex-wrap">
          <button class="btn btn--accent" id="accExportData" type="button">Download my data</button>
          <span class="hint" id="accExportStatus" role="status" aria-live="polite"></span>
        </div>
        <hr class="hr" />
        <h3 class="m-0 mt-18 mb-4">Danger zone</h3>
        <p class="card-sub">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button class="btn btn--danger" id="deleteAccountBtn" type="button">Delete my account</button>
      </div>
    </div>
  </div>
</div>
<div class="modal" id="deleteAccountModal" role="dialog" aria-modal="true" aria-labelledby="deleteAccountModalTitle" hidden>
  <div class="modal-card">
    <h3 id="deleteAccountModalTitle">Delete your account?</h3>
    <p>This will remove all your data — leaderboards, players, archives, subscriptions, and connected bots. This cannot be undone.</p>
    <div class="field"><label for="deleteAccountConfirm">Type <b>DELETE</b> to confirm</label><input id="deleteAccountConfirm" autocomplete="off" placeholder="DELETE" /></div>
    <div class="field" id="deleteAccountPasswordWrap" hidden><label for="deleteAccountPassword">Enter your password</label><input id="deleteAccountPassword" type="password" autocomplete="current-password" placeholder="Password" /></div>
    <div class="d-flex gap-10 flex-wrap">
      <button class="btn btn--danger" id="deleteAccountConfirmBtn" type="button">Delete my account</button>
      <button class="btn btn--ghost" id="deleteAccountCancelBtn" type="button">Cancel</button>
    </div>
    <p class="status" id="deleteAccountModalStatus" role="status" aria-live="polite"></p>
  </div>
</div>
`;

export const accountPage = leaderboardPageHtml({
  title: "Account · YourRank",
  canonical: "https://yourrank.site/account",
  mainClass: "wrap v2-dash",
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v2.css"],
  scripts: ['<script src="/assets/account.js?v=3" type="module"></script>'],
  content: accountContent,
  wide: true,
});
