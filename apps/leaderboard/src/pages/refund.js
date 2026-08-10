import { legal } from "./legal-helper.js";

// refund page
export const refundPage = legal("Refund & Cancellation Policy", "July 2026", `
<p><b>Free plan</b> — YourRank can be used free of charge, forever. No payment or credit card is required to create a page and test the service.</p>
<h2>Subscriptions</h2>
<p>Paid subscriptions are billed in advance. If you upgrade and change your mind, you can cancel at any time from your dashboard. After cancelling, you keep your paid features until the end of the current billing period. We do not offer partial refunds for unused days.</p>
<h2>Crypto payments</h2>
<p>Payments made in cryptocurrency are non-refundable because of blockchain irreversibility. Make sure the selected plan and amount are correct before sending any transaction.</p>
<h2>Lifetime plans</h2>
<p>Lifetime plans are a one-time purchase. They are non-refundable because they include immediate, permanent access to Pro features.</p>
<h2>Failed or duplicate charges</h2>
<p>If a charge was duplicated by mistake, contact us within 14 days and we will review the transaction. Approved duplicate charges are refunded to the original wallet or payment method.</p>
<h2>How to cancel</h2>
<p>Visit your <a href="/dashboard/settings">Plan &amp; billing</a> section and choose "Cancel subscription". Your page will downgrade to the Free plan at the end of the 30-day period.</p>
<h2>Contact</h2>
<p>Questions about billing or refunds: <a href="/help/support">contact us</a> or email <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a>.</p>`, "refund", "YourRank refund and cancellation policy. Crypto payments are non-refundable; subscriptions can be cancelled at any time.");
