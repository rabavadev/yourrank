// Simple cookie consent banner for GDPR/CCPA compliance.
// Sets a localStorage flag only; does not drop cookies itself.
(function () {
  const key = "yr_consent";
  if (localStorage.getItem(key)) return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <span>We use essential cookies to keep you signed in and optional analytics cookies to improve the site. By continuing, you agree to our <a href="/cookies">cookie policy</a>.</span>
    <button class="btn btn--sm btn--accent" id="cookieAccept" type="button">Accept</button>
    <button class="btn btn--sm btn--ghost" id="cookieReject" type="button">Reject</button>
  `;
  document.body.appendChild(banner);

  banner.querySelector("#cookieAccept").addEventListener("click", () => {
    localStorage.setItem(key, "1");
    banner.remove();
  });

  banner.querySelector("#cookieReject").addEventListener("click", () => {
    localStorage.setItem(key, "0");
    banner.remove();
  });
})();
