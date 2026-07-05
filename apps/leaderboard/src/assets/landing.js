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
