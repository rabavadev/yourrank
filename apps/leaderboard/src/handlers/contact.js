// Public contact/support form handler.
// Stores the message and emails the support inbox when RESEND_API_KEY is set.
import { json, bad, clientIp, rateLimit } from "../auth.js";
import { sendEmail } from "../email.js";
import { exec } from "../../../../shared/db.js";

const MAX_LEN = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleContact(request, env) {
  // Rate-limit by IP: 3 submissions per 5 minutes.
  const ip = clientIp(request);
  if (!(await rateLimit(env, `contact:${ip}`, 3, 300)).ok) {
    return bad("Too many messages. Please wait a few minutes.", 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON.", 400);
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || name.length > 120) return bad("Name is required (max 120 characters).", 400);
  if (!email || !EMAIL_RE.test(email) || email.length > 254) return bad("A valid email is required.", 400);
  if (!message || message.length < 10 || message.length > MAX_LEN) return bad("Message must be between 10 and 4000 characters.", 400);

  try {
    await exec(
      `INSERT INTO support_messages (name, email, subject, message, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, subject || "Contact form", message, await hashIp(ip)]
    );
  } catch (err) {
    console.error("[contact] failed to store message:", err);
    return bad("Could not save your message. Please try again.", 500);
  }

  const supportEmail = env.SUPPORT_EMAIL || "contact@yourrank.site";
  await sendEmail(env, {
    to: supportEmail,
    subject: `[YourRank] ${subject || "Contact form"} from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "Contact form"}\n\n${message}`,
    html: `<p><b>Name:</b> ${esc(name)}</p>
<p><b>Email:</b> ${esc(email)}</p>
<p><b>Subject:</b> ${esc(subject || "Contact form")}</p>
<pre style="white-space:pre-wrap">${esc(message)}</pre>`,
  });

  return json({ ok: true, message: "Message received. We'll reply by email." });
}

async function hashIp(ip) {
  const enc = new TextEncoder().encode(ip || "");
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
