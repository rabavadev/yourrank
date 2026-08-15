function getCsrf() {
  return document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";
}

const btn = document.getElementById("btnAcceptInvite");
if (btn) {
  btn.addEventListener("click", async () => {
    const token = btn.getAttribute("data-token");
    btn.disabled = true;
    btn.textContent = "Accepting...";
    try {
      const res = await fetch("/api/site/team/accept-invite", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrf(),
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.assign("/dashboard");
        return;
      }
      alert(data.error || "Failed to accept invitation");
    } catch {
      alert("Network error. Please try again.");
    }
    btn.disabled = false;
    btn.textContent = "Accept Invitation & Open Dashboard";
  });
}
