// Public contact/support form handler.
// Stores the message and emails the support inbox when RESEND_API_KEY is set.
import { json, bad, clientIp, rateLimit } from "../auth.js";
import { sendEmail } from "../email.js";
import { exec } from "../../../../shared/db.js";

const MAX_LEN = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KIND_LABELS = { support: "Support", feedback: "Feedback" };
const CONTEXT_LABELS = {
  dashboard: "Dashboard",
  leaderboard: "Leaderboard",
  bot: "Bot",
  analytics: "Analytics",
  attribution: "Attribution",
  billing: "Billing",
};

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
  const kind = String(body?.kind || "").trim().toLowerCase();
  const context = String(body?.context || "").trim().toLowerCase();

  if (!name || name.length > 120) return bad("Name is required (max 120 characters).", 400);
  if (!email || !EMAIL_RE.test(email) || email.length > 254) return bad("A valid email is required.", 400);
  if (subject.length > 120) return bad("Subject must be 120 characters or fewer.", 400);
  if (!message || message.length < 10 || message.length > MAX_LEN) return bad("Message must be between 10 and 4000 characters.", 400);
  if (kind && !KIND_LABELS[kind]) return bad("Choose a valid message type.", 400);
  if (context && !CONTEXT_LABELS[context]) return bad("Choose a valid message context.", 400);

  const defaultSubject = kind === "feedback" ? "Product feedback" : "Contact form";
  const category = kind
    ? `${KIND_LABELS[kind]}${context ? ` · ${CONTEXT_LABELS[context]}` : ""}`
    : "";
  const storedSubject = `${category ? `[${category}] ` : ""}${subject || defaultSubject}`;

  try {
    await exec(
      `INSERT INTO support_messages (name, email, subject, message, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, storedSubject, message, await hashIp(ip)]
    );
  } catch (err) {
    console.error("[contact] failed to store message:", err);
    return bad("Could not save your message. Please try again.", 500);
  }

  const supportEmail = env.SUPPORT_EMAIL || "contact@yourrank.site";
  await sendEmail(env, {
    to: supportEmail,
    subject: `[YourRank] ${storedSubject} from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${storedSubject}\n\n${message}`,
    html: `<p><b>Name:</b> ${esc(name)}</p>
<p><b>Email:</b> ${esc(email)}</p>
<p><b>Subject:</b> ${esc(storedSubject)}</p>
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
