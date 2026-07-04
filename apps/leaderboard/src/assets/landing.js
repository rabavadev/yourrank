// A11Y-103: hamburger nav toggle for mobile
const navToggle = document.querySelector(".nav-toggle"), navLinks = document.querySelector("nav.top .links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) { navLinks.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
  });
}

document.getElementById("yr").textContent = new Date().getFullYear();
const form = document.getElementById("leadForm"), status = document.getElementById("l_status"), submit = document.getElementById("l_submit");
if (form) form.addEventListener("submit", async (e) => {
  e.preventDefault(); status.textContent = "";
  const payload = { handle: document.getElementById("l_handle").value.trim(), casino: document.getElementById("l_casino").value.trim(), contact: document.getElementById("l_contact").value.trim(), note: document.getElementById("l_note").value.trim() };
  if (!payload.handle || !payload.contact) { status.textContent = "Add your handle and how to reach you."; return; }
  submit.disabled = true; submit.textContent = "Sending…";
  try {
    const res = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (res.ok && d.ok) { form.reset(); status.textContent = "Got it. We'll be in touch soon."; } else { status.textContent = d.error || "Something went wrong."; }
  } catch { status.textContent = "Network error. Try again."; }
  submit.disabled = false; submit.textContent = "Send request";
});
