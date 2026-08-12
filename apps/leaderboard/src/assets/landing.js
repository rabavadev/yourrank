// A11Y-103: hamburger nav toggle for mobile
const navToggle = document.querySelector(".nav-toggle"), navLinks = document.querySelector("nav.top .links");
if (navToggle && navLinks) {
  const closeNav = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.focus();
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) navLinks.querySelector("a")?.focus();
    else navToggle.focus();
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      e.preventDefault();
      closeNav();
    }
  });
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !e.target.closest("nav.top")) closeNav();
  });
}

const yrEl = document.getElementById("yr");
if (yrEl) yrEl.textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// L4: scroll-reveal is a non-blocking enhancement. Content remains visible if
// the observer is unavailable, delayed, or motion is reduced.
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealEls = document.querySelectorAll(".step, .price-card, .lifetime-banner, .testimonial .quote, .proof-metric");
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (typeof e.target.animate === "function") {
        e.target.animate([
          { opacity: 0.01, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 500, easing: "ease", fill: "none" });
      }
      obs.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  revealEls.forEach((el) => io.observe(el));
}

// M-3/§3: hide the sticky mobile CTA while the pricing section (own CTAs) is on screen
const pricingSec = document.getElementById("pricing");
if (pricingSec && "IntersectionObserver" in window) {
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => document.body.classList.toggle("hide-sticky-cta", e.isIntersecting));
  }, { threshold: 0.15 });
  io2.observe(pricingSec);
}
