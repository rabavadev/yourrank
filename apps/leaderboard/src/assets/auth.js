/* Shared logic for login / signup / forgot / reset pages.
 * Mode is derived from the URL path so no inline <script> is needed (the
 * auth pages run under a strict CSP with script-src 'self', which blocks
 * the previous inline window.__MODE__ assignment). */
const mode = { "/signup": "signup", "/forgot": "forgot", "/reset": "reset" }[location.pathname] || "login";
const form = document.getElementById("form");
const errEl = document.getElementById("err");
const msgEl = document.getElementById("msg");
const submit = document.getElementById("submit");
const nameInput = document.getElementById("name");
const slugPreview = document.getElementById("slugPreview");
function slugify(s){return String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);}
if (nameInput && slugPreview) nameInput.addEventListener("input", () => { const s = slugify(nameInput.value); slugPreview.textContent = s ? "yourrank.site/" + s : "yourrank.site/…"; });
// Show referral banner if ?ref= is in the URL
(function(){
  const refParam = new URLSearchParams(location.search).get("ref");
  if (refParam && mode === "signup") {
    const errEl2 = document.getElementById("err");
    const banner = document.createElement("div");
    banner.style.cssText = "background:#1a2e0a;border:1px solid #3a5218;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#c8ff00";
    banner.innerHTML = "🎁 <b>You've been referred!</b> Sign up and you both get <b>31 days of Pro</b> free.";
    errEl2.parentNode.insertBefore(banner, errEl2);
  }
})();
if (mode === "login" || mode === "signup") {
  fetch("/api/auth/me").then(r => r.json()).then(d => { if (d && d.ok && d.user) location.href = "/dashboard"; }).catch(() => {});
}
form.addEventListener("submit", async (e) => {
  e.preventDefault(); errEl.textContent = ""; submit.disabled = true;
  const orig = submit.textContent;
  submit.textContent = { signup: "Creating…", login: "Signing in…", forgot: "Sending…", reset: "Saving…" }[mode] || "Working…";
  let endpoint = "/api/auth/" + mode;
  let payload;
  if (mode === "forgot") {
    payload = { email: document.getElementById("email").value.trim() };
  } else if (mode === "reset") {
    const token = new URLSearchParams(location.search).get("token") || "";
    payload = { token, password: document.getElementById("password").value };
  } else {
    payload = { email: document.getElementById("email").value.trim(), password: document.getElementById("password").value };
    if (mode === "signup") {
      payload.name = nameInput.value.trim();
      // Capture ?ref= query param for the referral program.
      const refParam = new URLSearchParams(location.search).get("ref");
      if (refParam) payload.ref = refParam;
    }
  }
  try {
    const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok || !data.ok) { errEl.textContent = data.error || "Something went wrong."; submit.disabled = false; submit.textContent = orig; return; }
    if (mode === "forgot") {
      if (msgEl) { msgEl.hidden = false; msgEl.textContent = "Done. If that account exists, a reset link is on its way. Check spam too."; }
      form.querySelector("input").disabled = true;
      submit.textContent = "Sent";
      return;
    }
    location.href = mode === "signup" ? "/dashboard/setup" : "/dashboard";
  } catch (_) { errEl.textContent = "Network error. Try again."; submit.disabled = false; submit.textContent = orig; }
});
