import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

// billing page
export const billingPage = leaderboardPageHtml({
  title: "Billing · YourRank",
  canonical: "https://yourrank.site/dashboard/billing",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to manage billing.</p>",
  scripts: ['<script src="/assets/billing.js?v=3"></script>'],
  content: `<div class="dash-head"><div><h1>Billing</h1><p class="live-link">Your YourRank plan</p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div id="bl" hidden>
<div class="card" id="currentCard"><h2>Current plan</h2><p class="card-sub"><span id="planLine">Free — up to 10 players, one leaderboard.</span></p>
<p class="hint" id="expLine" hidden></p>
<div id="cancelBox" class="mt-18" hidden><p class="hint">Paid subscription? You can cancel it at any time. You'll keep features until the end of the current billing period.</p>
<button class="btn btn--danger" id="cancelBtn" type="button">Cancel subscription</button>
<p class="status" id="cancelStatus" role="status" aria-live="polite"></p></div></div>
<div class="card" id="trialCard" hidden><h2>Try Pro free for 7 days</h2><p class="card-sub">Experience all Pro features — unlimited players, custom domain, OBS overlay, notifications — with no commitment.</p>
<button class="btn btn--accent" id="trialBtn" type="button">Start free trial</button>
<p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
<div class="card" id="trialStatusCard" hidden><h2>Trial active</h2><p class="card-sub" id="trialInfo">Your Pro trial is running.</p>
<p class="hint">After the trial ends, your plan will revert to Free. Upgrade anytime to keep Pro features.</p></div>
<div class="card" id="upgradeCard"><h2>Upgrade</h2><p class="card-sub" id="upgradeSub">Choose the plan that fits your needs.</p>
<div id="planOptions"></div>
<div id="lifetimeBox" class="lifetime-box">
<div class="lifetime-inner">
<div><div class="lifetime-title">⚡ Lifetime Pro — $149</div>
<div class="hint mt-4">Pay once, use forever. All Pro features, no monthly bills. No expiry.</div></div>
<button class="btn btn--accent" id="lifetimeBtn" type="button">Get Lifetime Pro</button>
</div>
<p class="status" id="lifetimeStatus" role="status" aria-live="polite"></p></div>
<p class="hint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes.</p>
<p class="status" id="status" role="status" aria-live="polite"></p></div>
<div class="card" id="proCard" hidden><h2>You're on <span id="currentPlanName">Pro</span></h2><p class="card-sub">Thanks for supporting YourRank. Manage everything from the Leaderboard tab.</p>
<p class="hint" id="proExp"></p>
<p class="hint c-accent fw-600" id="lifetimeNotice" hidden>⭐ Lifetime Pro — no expiry. You own this forever.</p></div>
  <div class="card card--danger" id="dangerZone"><h2> Danger zone</h2><p class="card-sub">Permanently delete your account and all associated data. This action cannot be undone.</p>
  <button class="btn btn--danger" id="deleteAccountBtn" type="button">Delete my account</button>
  <p class="status" id="deleteStatus" role="status" aria-live="polite"></p>
  <div class="modal" id="deleteModal" hidden>
    <div class="modal-card">
      <h3>Delete your account?</h3>
      <p>This will remove all your data — leaderboards, players, archives, subscriptions, and connected bots. This cannot be undone.</p>
      <div class="field"><label for="deleteConfirm">Type <b>DELETE</b> to confirm</label><input id="deleteConfirm" autocomplete="off" placeholder="DELETE" /></div>
      <div class="field" id="deletePasswordWrap" hidden><label for="deletePassword">Enter your password</label><input id="deletePassword" type="password" autocomplete="current-password" placeholder="Password" /></div>
      <div class="d-flex gap-10 flex-wrap">
        <button class="btn btn--danger" id="deleteConfirmBtn" type="button">Delete my account</button>
        <button class="btn btn--ghost" id="deleteCancelBtn" type="button">Cancel</button>
      </div>
      <p class="status" id="deleteModalStatus" role="status" aria-live="polite"></p>
    </div>
  </div>
  </div></div>
  <div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-100"></div><div class="skeleton skeleton-text--sm skel-w-160 mt-8"></div></div><div class="skeleton skeleton-text skel-w-100"></div></div>
<div class="card"><div class="skeleton skeleton-block skel-h-60"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-120"></div></div>
</div>`
});
