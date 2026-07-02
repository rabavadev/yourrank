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
    location.href = "/dashboard";
  } catch (_) { errEl.textContent = "Network error. Try again."; submit.disabled = false; submit.textContent = orig; }
});
