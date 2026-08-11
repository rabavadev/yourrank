// Account page bodies, one directly-authored template per tab.
// The surrounding chrome (sidebar, topbar, titles) lives in account.jsx.

const profileWidget = `<div class="lb-widget lb-widget--full" id="profile">
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
      </div>`;

const planWidget = `<div class="lb-widget lb-widget--full" id="plan">
        <h2>Plan &amp; billing</h2>
        <p class="card-sub">Current plan, usage and billing history.</p>

        <div class="plan-summary" id="planSummary"></div>
        <div class="plan-banner" id="planBanner" role="status" aria-live="polite" hidden></div>

        <h3 class="m-0 mt-18 mb-8">Usage &amp; limits</h3>
        <p class="card-sub">What you are using across all products. Limit messages in other dashboards link here.</p>
        <div class="plan-usage" id="planUsage"><p class="hint">Loading usage…</p></div>

        <h3 class="m-0 mt-18 mb-8">Compare plans</h3>
        <div class="plan-grid" id="planGrid"></div>
        <div class="plan-trial" id="planTrial" hidden><p class="hint">Not ready to pay? Try every Pro feature free for 7 days.</p><button class="btn btn--accent" id="trialBtn" type="button">Start free Pro trial</button><p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
        <p class="hint" id="planHint">Paid plans are billed in crypto (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms.</p>

        <div id="pendingPayment" hidden class="plan-pending">
          <h3 class="m-0 mb-8">Pending payment</h3>
          <p class="status" role="status" aria-live="polite"></p>
          <a class="btn btn--sm" id="pendingPaymentLink" href="#">Complete payment</a>
        </div>

        <div id="cancelWrap" hidden class="plan-cancel">
          <h3 class="m-0 mb-8">Cancel or change plan</h3>
          <p class="card-sub">What happens before you cancel or downgrade.</p>
          <ul class="hint plan-cancel-list">
            <li>You keep your current plan features until the expiry date shown above.</li>
            <li>After expiry, your account reverts to Free and paid features stop working.</li>
            <li>If you are over Free limits (boards, players, credit rules, items), you won't be able to add more until you upgrade again.</li>
            <li>Existing leaderboard data, viewers and redemptions are never deleted by a downgrade.</li>
          </ul>
          <p class="hint" id="cancelStatus" role="status" aria-live="polite"></p>
          <button class="btn btn--sm btn--danger" id="cancelBtn" type="button">Cancel subscription</button>
        </div>

        <div id="historyCard" hidden>
          <h3 class="m-0 mt-18 mb-4">Payment history</h3>
          <p class="card-sub">Your past payments and receipts.</p>
          <div class="admin-table-wrap"><table class="admin-table" id="historyTable"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody id="historyBody"></tbody></table></div>
          <div class="empty" id="historyEmpty" hidden>No payments yet.</div>
          <p class="hint">Receipts are also emailed to your account address after each successful payment.</p>
        </div>
      </div>`;

const postbacksWidget = `<div class="lb-widget lb-widget--full" id="postbacks">
        <h2>Attribution / Postbacks</h2>
        <p class="card-sub">Let your sponsor or affiliate manager send conversion events straight to YourRank.</p>

        <div id="postbackStatusCard" class="card card--status" hidden>
          <div class="d-flex items-center gap-8">
            <span class="status-dot" id="postbackStatusDot"></span>
            <b id="postbackStatusText">—</b>
          </div>
          <p class="hint" id="postbackStatusHint"></p>
        </div>

        <div id="postbackShareCard" hidden>
          <h3 class="m-0 mt-18 mb-8">What to send your affiliate manager</h3>
          <p class="hint">This block is safe to copy — it does <b>not</b> contain your secret key.</p>
          <div class="field">
            <label>Signed endpoint URL</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackSigned" class="overlay-url"></code>
              <button class="btn btn--sm btn--accent ic-btn" id="postbackCopySigned" type="button">Copy</button>
            </div>
          </div>
          <div class="field">
            <label>How to sign</label>
            <p class="hint">Sign the raw query string with <code>HMAC-SHA256</code> keyed by the postback key we gave you, then send it as the <code>X-Postback-Signature</code> header.</p>
            <button class="btn btn--sm btn--ghost" id="postbackCopyManager" type="button">Copy full setup for affiliate manager</button>
          </div>
          <div class="field">
            <label>Test connection</label>
            <p class="hint">Send a sample conversion to confirm the endpoint is reachable and the signature is accepted.</p>
            <button class="btn btn--sm" id="postbackTest" type="button">Send test conversion</button>
            <span class="hint" id="postbackTestStatus" role="status" aria-live="polite"></span>
          </div>
        </div>

        <div id="postbackKeyCard" hidden>
          <h3 class="m-0 mt-18 mb-8">Key management</h3>
          <p class="hint">Keep the key private. Rotating revokes the old key immediately.</p>
          <div class="field">
            <label>Postback key</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackKey" class="overlay-url"></code>
              <button class="btn btn--sm btn--accent ic-btn" id="postbackCopyKey" type="button">Copy</button>
              <button class="btn btn--sm" id="postbackRotate" type="button">Rotate key</button>
              <button class="btn btn--sm btn--danger" id="postbackRevoke" type="button">Revoke key</button>
            </div>
          </div>
        </div>

        <details class="adv" id="postbackAdvanced" hidden>
          <summary>Advanced configuration</summary>
          <div class="field mt-14">
            <label>Legacy URL (sunset {{NEXT_YEAR}})</label>
            <div class="d-flex gap-8 items-center flex-wrap">
              <code id="postbackLegacy" class="overlay-url"></code>
              <button class="btn btn--sm ic-btn" id="postbackCopyLegacy" type="button">Copy</button>
            </div>
            <p class="hint">Unsigned postbacks are deprecated and will be rejected unless your worker explicitly enables legacy mode.</p>
          </div>
        </details>

        <div id="postbackUpgrade" hidden>
          <p class="hint">Postbacks are a paid feature. Upgrade to Pro to generate keys and view conversions.</p>
          <a class="btn btn--accent" href="/account/plan">See plans</a>
        </div>

        <hr class="hr" />
        <h3 class="m-0 mt-18 mb-4">Recent conversions</h3>
        <div class="admin-table-wrap"><table class="admin-table" id="conversionsTable"><thead><tr><th>Time</th><th>Event</th><th>Amount</th><th>Currency</th><th>Offer</th></tr></thead><tbody id="conversionsBody"></tbody></table></div>
        <p class="empty" id="conversionsEmpty" hidden>No conversions yet.</p>
      </div>`;

const connectedWidget = `<div class="lb-widget lb-widget--full" id="connected">
        <h2>Connected accounts</h2>
        <p class="card-sub">Accounts and integrations linked to your streamer profile.</p>
        <div id="connectedAccounts"><p class="hint">Loading…</p></div>
        <p class="hint">Identities are not merged across providers unless you explicitly enable linking.</p>
      </div>`;

const dataWidget = `<div class="lb-widget lb-widget--full lb-widget--danger" id="data">
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
      </div>`;

const deleteAccountModal = `<div class="modal" id="deleteAccountModal" role="dialog" aria-modal="true" aria-labelledby="deleteAccountModalTitle" hidden>
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

function accountPage(tab, body) {
  if (!body) throw new Error("account page \"" + tab + "\" has an empty body");
  return `<div id="acc-app" data-acc-tab="${tab}">${body}</div>`;
}

export const profilePage = accountPage("profile", profileWidget);
export const planPage = accountPage("plan", planWidget);
export const postbacksPage = accountPage("postbacks", postbacksWidget);
export const connectedPage = accountPage("connected", connectedWidget);
export const dataPage = accountPage("data", dataWidget + deleteAccountModal);
