// Outbound email via Resend. Degrades to a silent no-op when no key is set —
// password reset then falls back to admin-generated links from /admin.
export async function sendEmail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "not_configured" };
  const from = env.MAIL_FROM || "RankUp <onboarding@resend.dev>";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    return r.ok ? { sent: true } : { sent: false, reason: `http_${r.status}` };
  } catch (err) {
    console.error("[email]: resend API call failed", err);
    return { sent: false, reason: "network" };
  }
}

export function resetEmail(link) {
  const text = `Reset your RankUp password:\n\n${link}\n\nThis link works for 1 hour. If you didn't ask for this, ignore this email.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Reset your RankUp password</h2>
<p style="color:#555;line-height:1.5">Someone (hopefully you) asked to reset the password for this account. The link works for 1 hour.</p>
<p style="margin:24px 0"><a href="${link}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Set a new password</a></p>
<p style="color:#999;font-size:13px">If you didn't ask for this, you can ignore this email — nothing changes.</p></div>`;
  return { subject: "Reset your RankUp password", html, text };
}
