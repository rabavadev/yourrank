// Simple cookie consent banner for GDPR/CCPA compliance.
// Sets a localStorage flag only; does not drop cookies itself.
(function () {
  const key = "yr_consent";
  if (localStorage.getItem(key)) return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <span>We use only essential cookies to keep you signed in and secure — no advertising or third-party tracking cookies. See our <a href="/cookies">cookie policy</a>.</span>
    <button class="btn btn--sm btn--accent" id="cookieAccept" type="button">Got it</button>
  `;
  document.body.appendChild(banner);

  banner.querySelector("#cookieAccept").addEventListener("click", () => {
    localStorage.setItem(key, "1");
    banner.remove();
  });
})();
