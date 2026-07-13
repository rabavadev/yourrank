/* Shared logic for login / signup / forgot / reset pages.
 * Mode is derived from the URL path so no inline <script> is needed (the
 * auth pages run under a strict CSP with script-src 'self', which blocks
 * the previous inline window.__MODE__ assignment). */
/* Password show/hide toggle */
document.querySelectorAll("[data-pw-toggle]").forEach(btn => {
  btn.addEventListener("click", () => {
    const wrap = btn.closest(".pw-wrap");
    const input = wrap.querySelector("input");
    const eye = btn.querySelector("[data-eye]");
    const eyeOff = btn.querySelector("[data-eye-off]");
    if (input.type === "password") {
      input.type = "text";
      eye.hidden = true;
      eyeOff.hidden = false;
      btn.setAttribute("aria-label", "Hide password");
    } else {
      input.type = "password";
      eye.hidden = false;
      eyeOff.hidden = true;
      btn.setAttribute("aria-label", "Show password");
    }
  });
});

const mode = { "/signup": "signup", "/forgot": "forgot", "/reset": "reset" }[location.pathname] || "login";
const form = document.getElementById("form");
const errEl = document.getElementById("err");
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }
const msgEl = document.getElementById("msg");
// BUG-003: If reset page has no token, show error instead of a form that will fail
if (mode === "reset" && !new URLSearchParams(location.search).get("token")) {
  if (form) form.hidden = true;
  if (errEl) { errEl.hidden = false; errEl.textContent = "This reset link is invalid or expired. Request a new one below."; }
  const backLink = document.createElement("a");
  backLink.href = "/forgot";
  backLink.textContent = "Request a new reset link";
  backLink.className = "back-link";
  if (errEl && errEl.parentNode) errEl.parentNode.appendChild(backLink);
}
form.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => { if (errEl.textContent) errEl.textContent = ""; }));
const submit = document.getElementById("submit");
const nameInput = document.getElementById("name");
const slugPreview = document.getElementById("slugPreview");
function slugify(s){return String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);}
if (nameInput && slugPreview) nameInput.addEventListener("input", () => { const s = slugify(nameInput.value); slugPreview.textContent = s ? "yourrank.site/" + s : "yourrank.site/…"; });
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
    if (mode === "signup") payload.name = nameInput.value.trim();
  }
  if (mode === "signup") {
    if (!payload.name || payload.name.length < 2) { errEl.textContent = "Display name must be at least 2 characters"; submit.disabled = false; submit.textContent = orig; return; }
    if (!payload.email) { errEl.textContent = "Enter a valid email"; submit.disabled = false; submit.textContent = orig; return; }
    if (payload.password.length < 8) { errEl.textContent = "Password must be at least 8 characters"; submit.disabled = false; submit.textContent = orig; return; }
  }
  try {
    const res = await fetch(endpoint, { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrf-token": getCsrf() }, body: JSON.stringify(payload) });
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
