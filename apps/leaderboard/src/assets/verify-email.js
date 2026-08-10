/* Verify email landing page */
import { showPromptModal } from "./dashboard/utils.js";
const $ = (id) => document.getElementById(id);
const url = new URLSearchParams(location.search);
const token = url.get("token");
const msg = $("msg");
const err = $("err");
const resendWrap = $("resendWrap");
const resendBtn = $("resendBtn");

function showError(text, showResend) {
  msg.textContent = text;
  msg.style.color = "var(--bad, #c00)";
  err.hidden = false;
  err.textContent = text;
  if (showResend) resendWrap.hidden = false;
}

async function verify(t) {
  try {
    const r = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: t })
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      msg.textContent = "Email verified! Redirecting to your dashboard…";
      msg.style.color = "var(--good, #0a0)";
      setTimeout(() => { location.href = "/dashboard"; }, 1500);
      return;
    }
    const isExpired = r.status === 410;
    showError(d.error || "This link didn't work. Please sign in to request a new one.", isExpired || r.status >= 400);
  } catch {
    showError("Network error. Please try again.", true);
  }
}

resendBtn?.addEventListener("click", async () => {
  resendBtn.disabled = true;
  resendBtn.textContent = "Sending…";
  const email = await showPromptModal("Resend verification link", "Enter your email address:", { confirmText: "Send", inputType: "email", placeholder: "you@example.com" });
  if (!email || !email.includes("@")) {
    resendBtn.disabled = false;
    resendBtn.textContent = "Send again";
    return;
  }
  try {
    const r = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.ok) {
      msg.textContent = "If that account needs verification, a new link is on its way.";
      msg.style.color = "";
      err.hidden = true;
    } else {
      showError(d.error || "Could not resend. Try again later.", true);
    }
  } catch {
    showError("Network error. Try again.", true);
  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = "Send again";
  }
});

if (token) {
  verify(token);
} else {
  showError("No verification link found. Sign in and we can resend it.", true);
}
