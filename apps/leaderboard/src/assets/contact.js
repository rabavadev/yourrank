// Contact form handling
const form = document.getElementById("contactForm");
const err = document.getElementById("c_err");
const success = document.getElementById("c_success");
const submit = document.getElementById("c_submit");

function getCsrf() {
  const m = document.cookie.match(/(?:^|;\\s*)__csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

function setLoading(loading) {
  submit.disabled = loading;
  submit.textContent = loading ? "Sending..." : "Send message";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    success.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrf(),
        },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        success.hidden = false;
        success.textContent = body.message || "Message received. We'll reply by email.";
        form.reset();
      } else {
        err.textContent = body.error || "Something went wrong. Try again.";
      }
    } catch {
      err.textContent = "Network error. Please try again.";
    } finally {
      setLoading(false);
    }
  });
}

const yr = document.getElementById("yr");
if (yr) yr.textContent = new Date().getFullYear();
