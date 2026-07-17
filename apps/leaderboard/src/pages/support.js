import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

export const supportPage = leaderboardPageHtml({
  title: "Support · YourRank",
  canonical: "https://yourrank.site/dashboard/support",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to view your support tickets.</p>",
  scripts: ['<script src="/assets/support.js?v=1"></script>'],
  content: `<div class="dash-head"><div><h1>Support</h1><p class="live-link">Open a ticket or check replies</p></div></div>
<div id="support">
  <div class="card">
    <h2>New ticket</h2>
    <p class="card-sub">Describe what you need help with and we will reply by email.</p>
    <form id="ticketForm">
      <div class="field"><label for="ticketSubject">Subject</label><input id="ticketSubject" placeholder="e.g. Billing question" maxlength="120" required /></div>
      <div class="field"><label for="ticketMessage">Message</label><textarea id="ticketMessage" rows="5" minlength="10" maxlength="4000" placeholder="Tell us the details..." required></textarea></div>
      <button class="btn btn--accent" type="submit">Send ticket</button>
      <p class="status" id="ticketStatus" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="card" id="ticketsCard">
    <h2>Your tickets</h2>
    <p class="card-sub" id="ticketsSub">Loading…</p>
    <div id="ticketsList"></div>
    <p class="hint" id="ticketsEmpty" hidden>No tickets yet.</p>
  </div>
</div>
<div id="loading" class="py-26">
  <div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-120"></div><div class="skeleton skeleton-text--sm skel-w-200 mt-8"></div></div></div>
  <div class="card mt-18"><div class="skeleton skeleton-block skel-h-120"></div></div>
  <div class="card mt-18"><div class="skeleton skeleton-block skel-h-120"></div></div>
</div>`
});
