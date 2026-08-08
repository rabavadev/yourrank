// Outbound email helpers shared by both Workers (Resend).
import { query, one } from "./db.js";

export interface EmailEnv {
  RESEND_API_KEY?: string;
  SUPPORT_EMAIL?: string;
  MAIL_FROM?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface SendResult {
  sent: boolean;
  reason?: string;
}

export async function sendEmail(env: EmailEnv, { to, subject, html, text, from }: EmailPayload): Promise<SendResult> {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "not_configured" };
  const supportEmail = env.SUPPORT_EMAIL || "contact@yourrank.site";
  const fromAddr = from || env.MAIL_FROM || supportEmail || "YourRank <onboarding@resend.dev>";
  const toAddr = String(to).match(/<([^>]+)>/g)?.map((m) => m.slice(1, -1)).pop() || String(to).trim();
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: fromAddr, to: [toAddr], subject, html, text }),
    });
    return r.ok ? { sent: true } : { sent: false, reason: `http_${r.status}` };
  } catch (err) {
    console.error("[email]: resend API call failed", err);
    return { sent: false, reason: "network" };
  }
}

export function resetEmail(link: string) {
  const text = `Reset your YourRank password:\n\n${link}\n\nThis link works for 1 hour. If you didn't ask for this, ignore this email.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Reset your YourRank password</h2>
<p style="color:#555;line-height:1.5">Someone (hopefully you) asked to reset the password for this account. The link works for 1 hour.</p>
<p style="margin:24px 0"><a href="${link}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Set a new password</a></p>
<p style="color:#999;font-size:13px">If you didn't ask for this, you can ignore this email — nothing changes.</p></div>`;
  return { subject: "Reset your YourRank password", html, text };
}

export interface OnboardingUser {
  id: string;
  email: string;
  display_name?: string | null;
  slug?: string | null;
}

export interface OnboardingOptions extends OnboardingUser {
  origin?: string;
}

export function onboardingEmail(day: 0 | 3 | 7, user: OnboardingOptions) {
  const name = user.display_name || String(user.email).split("@")[0] || "there";
  const origin = user.origin || "https://yourrank.site";
  const dashboard = `${origin}/dashboard`;
  const billing = `${origin}/dashboard/billing`;
  const botDashboard = `${origin}/bot/dashboard`;

  if (day === 0) {
    const subject = "Welcome to YourRank — set up your first leaderboard";
    const text = `Hi ${name},\n\nWelcome to YourRank. Your leaderboard is live at ${origin}/${user.slug || ""}\n\nNext steps:\n1. Add players or import them from CSV in ${dashboard}\n2. Customize the design and sections\n3. Share your page with viewers\n\nNeed help? Reply to this email or use /support in Telegram.\n\nYourRank team`;
    const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Welcome to YourRank, ${name}</h2>
<p style="color:#555;line-height:1.5">Your leaderboard is live. Here are the fastest ways to get value:</p>
<ul style="color:#555;line-height:1.6;padding-left:20px">
  <li><a href="${dashboard}">Add players</a> or import a CSV</li>
  <li>Pick a design and toggle sections in the dashboard</li>
  <li>Share your public page: ${origin}/${user.slug || ""}</li>
</ul>
<p style="margin:24px 0"><a href="${dashboard}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Open dashboard</a></p>
<p style="color:#999;font-size:13px">Need help? Reply to this email.</p></div>`;
    return { subject, html, text };
  }

  if (day === 3) {
    const subject = "YourRank tip: connect your Telegram bot + offers";
    const text = `Hi ${name},\n\nBy now you have a leaderboard. The next growth loop is Telegram:\n\n1. Connect a bot at ${botDashboard}\n2. Add casino offers so viewers can click tracked links\n3. Set up postback URLs in Settings so deposits count automatically\n\nYourRank team`;
    const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Turn clicks into conversions</h2>
<p style="color:#555;line-height:1.5">Your leaderboard is running. The next growth loop is Telegram + offers:</p>
<ul style="color:#555;line-height:1.6;padding-left:20px">
  <li><a href="${botDashboard}">Connect a Telegram bot</a></li>
  <li>Add casino offers with tracked links</li>
  <li>Set up postback URLs in Settings so deposits count automatically</li>
</ul>
<p style="margin:24px 0"><a href="${botDashboard}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Open bot dashboard</a></p>
<p style="color:#999;font-size:13px">Need help? Reply to this email.</p></div>`;
    return { subject, html, text };
  }

  // day === 7
  const subject = "YourRank Pro: custom domain, OBS overlay + free trial";
  const text = `Hi ${name},\n\nYou've been using YourRank for a week. Upgrade to Pro to unlock:\n\n- Custom domain\n- Up to 3 leaderboards\n- OBS overlay\n- Unlimited players\n\nStart with a free 7-day Pro trial or grab a lifetime license.\n\n${billing}\n\nYourRank team`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Ready to upgrade, ${name}?</h2>
<p style="color:#555;line-height:1.5">You've been using YourRank for a week. Pro unlocks:</p>
<ul style="color:#555;line-height:1.6;padding-left:20px">
  <li>Custom domain</li>
  <li>Up to 3 leaderboards</li>
  <li>OBS overlay</li>
  <li>Unlimited players</li>
</ul>
<p style="margin:24px 0"><a href="${billing}" style="background:#c8ff00;color:#000;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">Start free Pro trial</a></p>
<p style="color:#999;font-size:13px">Prefer to own it forever? There's also a one-time lifetime option on the billing page.</p></div>`;
  return { subject, html, text };
}

export async function sendOnboardingEmail(
  env: EmailEnv,
  day: 0 | 3 | 7,
  user: OnboardingOptions,
  waitUntil?: (p: Promise<unknown>) => void
): Promise<SendResult> {
  const task = async (): Promise<SendResult> => {
    const mail = onboardingEmail(day, user);
    const result = await sendEmail(env, { to: user.email, ...mail });
    if (!result.sent) return result;
    await one(
      `INSERT INTO user_onboarding_emails (user_id, day, sent_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id, day) DO NOTHING
       RETURNING id`,
      [user.id, day]
    );
    return { sent: true };
  };

  if (waitUntil) {
    waitUntil(task().catch((err) => console.error(`[onboarding] day ${day} failed for ${user.email}:`, err)));
    return { sent: true, reason: "deferred" };
  }
  return task();
}

export async function sendPendingOnboardingEmails(env: EmailEnv): Promise<{ sent: number; skipped: number }> {
  if (!env.RESEND_API_KEY) return { sent: 0, skipped: 0 };

  const candidates = await query<{ id: string; email: string; display_name: string | null; slug: string | null; day: number }>(
    `SELECT u.id, u.email, u.display_name, s.slug,
            (CURRENT_DATE - u.created_at::date) AS day
       FROM users u
       LEFT JOIN sites s ON s.user_id = u.id
      WHERE u.status = 'active'
        AND (CURRENT_DATE - u.created_at::date) IN (0, 3, 7)
        AND NOT EXISTS (
          SELECT 1 FROM user_onboarding_emails e
           WHERE e.user_id = u.id AND e.day = (CURRENT_DATE - u.created_at::date)
        )
      ORDER BY u.created_at DESC
      LIMIT 500`,
    []
  );

  let sent = 0;
  let skipped = 0;
  for (const c of candidates) {
    const result = await sendOnboardingEmail(env, c.day as 0 | 3 | 7, {
      id: c.id,
      email: c.email,
      display_name: c.display_name,
      slug: c.slug,
    });
    if (result.sent) sent++;
    else skipped++;
  }
  return { sent, skipped };
}

export interface ReceiptInput {
  email: string;
  orderId: string;
  plan: string;
  amount: number;
  currency?: string;
  provider: "nowpayments" | "telegram_stars" | "manual";
  isLifetime?: boolean;
  expiresAt?: string; // ISO date string
  origin?: string;
}

export function receiptEmail({ orderId, plan, amount, currency, provider, isLifetime, expiresAt, origin }: Omit<ReceiptInput, "email">) {
  const ccy = currency ? ` ${currency.toUpperCase()}` : "";
  const amountText = Number.isFinite(amount) ? `$${amount.toFixed(2)}${ccy}` : `${provider === "telegram_stars" ? "Telegram Stars" : "Crypto"}`;
  const period = isLifetime ? "Lifetime" : expiresAt ? `until ${new Date(expiresAt).toLocaleDateString()}` : "30-day";
  const dashboard = `${origin || "https://yourrank.site"}/dashboard/billing`;
  const subject = `YourRank receipt — ${plan}${isLifetime ? " Lifetime" : ""}`;
  const text = `Thanks for your payment.\n\nPlan: ${plan}${isLifetime ? " Lifetime" : ""}\nAmount: ${amountText}\nOrder: ${orderId}\nProvider: ${provider}\nAccess: ${period}\n\nView your billing history: ${dashboard}\n\nYourRank`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Payment receipt</h2>
<p style="color:#555;line-height:1.5">Thanks for your payment. Here are the details:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee"><b>Plan</b></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${plan}${isLifetime ? " Lifetime" : ""}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee"><b>Amount</b></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${amountText}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee"><b>Order</b></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:12px">${orderId}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee"><b>Provider</b></td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${provider}</td></tr>
  <tr><td style="padding:8px 0"><b>Access</b></td><td style="padding:8px 0;text-align:right">${period}</td></tr>
</table>
<p style="margin:24px 0"><a href="${dashboard}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">View billing history</a></p>
<p style="color:#999;font-size:13px">Questions? Reply to this email or use the support form.</p></div>`;
  return { subject, html, text };
}

export async function sendReceiptEmail(env: EmailEnv, input: ReceiptInput, waitUntil?: (p: Promise<SendResult>) => void): Promise<SendResult> {
  const { email, ...rest } = input;
  const task = sendEmail(env, { to: email, ...receiptEmail(rest) });
  if (waitUntil) {
    waitUntil(task);
    return { sent: true, reason: "deferred" };
  }
  return task;
}
