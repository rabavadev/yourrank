// Granular cookie consent banner for GDPR/CCPA/ePrivacy compliance.
// Sets both localStorage and a first-party cookie so the backend can read it.
(function () {
  // Keep the shell footer year current even if the server-rendered year is stale.
  const footerCopy = document.querySelector(".gm-shell-footer-copy");
  if (footerCopy) footerCopy.textContent = "© " + new Date().getFullYear() + " YourRank";

  const KEY = "yr_consent";
  const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

  function setConsent(value) {
    localStorage.setItem(KEY, value);
    document.cookie = `${KEY}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  }

  const existing = localStorage.getItem(KEY);
  if (existing) {
    // Make sure the cookie is in sync with localStorage.
    if (!document.cookie.includes(`${KEY}=`)) setConsent(existing);
    return;
  }

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <span>We use essential cookies to keep you signed in and secure. With your consent, we also use analytics cookies to improve leaderboards. See our <a href="/cookies">cookie policy</a>.</span>
    <div class="cookie-banner-actions">
      <button class="btn btn--sm btn--ghost" id="cookieReject" type="button">Essential only</button>
      <button class="btn btn--sm btn--accent" id="cookieAccept" type="button">Accept all</button>
    </div>
  `;
  document.body.appendChild(banner);
  document.body.classList.add("cookie-open");

  banner.querySelector("#cookieAccept").addEventListener("click", () => {
    setConsent("all");
    banner.remove();
    document.body.classList.remove("cookie-open");
  });
  banner.querySelector("#cookieReject").addEventListener("click", () => {
    setConsent("essential");
    banner.remove();
    document.body.classList.remove("cookie-open");
  });
})();
