const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("nav.top .links");
if (navToggle && navLinks) {
  const closeNav = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) navLinks.querySelector("a")?.focus();
  });
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      closeNav();
      navToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (navLinks.classList.contains("open") && !event.target.closest("nav.top")) closeNav();
  });
}

const year = document.getElementById("yr");
if (year) year.textContent = new Date().getFullYear();
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const heroRotator = document.getElementById("heroRotator");
let wordIndex = 0;
if (heroRotator) {
  if (!reduceMotion) {
    window.setInterval(() => {
      const words = [...heroRotator.querySelectorAll(".hero-word")];
      const current = words[wordIndex];
      wordIndex = (wordIndex + 1) % words.length;
      const next = words[wordIndex];
      current?.classList.remove("is-active");
      current?.classList.add("is-leaving");
      next?.classList.add("is-entering");
      window.setTimeout(() => {
        current?.classList.remove("is-leaving");
        next?.classList.remove("is-entering");
        next?.classList.add("is-active");
      }, 620);
    }, 2200);
  }
}

const board = document.getElementById("boardRows");
const flipClock = document.getElementById("flipClock");
const boardStates = [
  [
    { handle: "nightowl", points: 12560 },
    { handle: "pixelpilot", points: 9870 },
    { handle: "moxie_live", points: 7230 },
    { handle: "arcade_ally", points: 6410 },
  ],
  [
    { handle: "pixelpilot", points: 13040, moved: true },
    { handle: "nightowl", points: 12560 },
    { handle: "moxie_live", points: 7230 },
    { handle: "arcade_ally", points: 6410 },
  ],
  [
    { handle: "moxie_live", points: 11840, moved: true },
    { handle: "pixelpilot", points: 10120 },
    { handle: "nightowl", points: 9820 },
    { handle: "arcade_ally", points: 6410 },
  ],
  [
    { handle: "arcade_ally", points: 10920, moved: true },
    { handle: "moxie_live", points: 10420 },
    { handle: "pixelpilot", points: 10120 },
    { handle: "nightowl", points: 9820 },
  ],
];
let boardStateIndex = 0;
let nextFlipAt = Date.now() + 12000;
const formatPoints = (value) => value.toLocaleString("en-US");
const countPoints = (element, from, to) => {
  if (reduceMotion || from === to) {
    element.textContent = formatPoints(to);
    return;
  }
  const startedAt = performance.now();
  const duration = 720;
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = formatPoints(Math.round(from + (to - from) * eased));
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
};
const reorderBoard = () => {
  if (!board) return;
  boardStateIndex = (boardStateIndex + 1) % boardStates.length;
  const state = boardStates[boardStateIndex];
  const current = new Map([...board.children].map((row) => [
    row.querySelector(".handle")?.textContent.toLowerCase(),
    Number(row.querySelector(".points")?.textContent.replace(/,/g, "")),
  ]));
  state.forEach((entry, index) => {
    const row = [...board.children].find((candidate) => candidate.querySelector(".handle")?.textContent.toLowerCase() === entry.handle);
    if (!row) return;
    row.querySelector(".rank").textContent = String(index + 1).padStart(2, "0");
    const movement = row.querySelector(".movement");
    movement.textContent = entry.moved ? "▲" : "";
    movement.setAttribute("aria-label", entry.moved ? "Moved up" : "");
    movement.classList.toggle("is-hidden", !entry.moved);
    row.classList.toggle("board-row--up", Boolean(entry.moved));
    countPoints(row.querySelector(".points"), current.get(entry.handle) ?? entry.points, entry.points);
    board.append(row);
  });
  board.querySelector(".board-row--up")?.classList.add("is-flipping");
  window.setTimeout(() => board.querySelector(".board-row--up")?.classList.remove("is-flipping"), 520);
};
const updateClock = () => {
  if (!flipClock) return;
  const remaining = Math.max(0, Math.ceil((nextFlipAt - Date.now()) / 1000));
  flipClock.textContent = `00:${String(remaining).padStart(2, "0")}`;
  if (remaining === 0) {
    reorderBoard();
    nextFlipAt = Date.now() + 12000;
  }
};
if (flipClock && !reduceMotion) {
  updateClock();
  window.setInterval(updateClock, 100);
}

const featureGallery = document.querySelector("[data-gallery]");
if (featureGallery) {
  const panels = [...featureGallery.querySelectorAll(".feature-panel")];
  const activatePanel = (panel) => {
    panels.forEach((candidate) => candidate.classList.toggle("is-active", candidate === panel));
  };
  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => activatePanel(panel));
    panel.addEventListener("focus", () => activatePanel(panel));
    panel.addEventListener("click", () => activatePanel(panel));
  });
}

const faqPreview = document.querySelector(".faq-preview .faq-list");
if (faqPreview) {
  const categories = ["Getting started", "Credits & Shop", "Payments"];
  const categoryFor = (index) => index < 2 ? categories[0] : index < 4 ? categories[1] : categories[2];
  const items = [...faqPreview.querySelectorAll(".faq-item")];
  const tabs = document.createElement("div");
  tabs.className = "faq-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "FAQ categories");
  categories.forEach((category, index) => {
    const tab = document.createElement("button");
    tab.className = "faq-tab";
    tab.type = "button";
    tab.textContent = category;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(index === 0));
    tab.setAttribute("tabindex", index === 0 ? "0" : "-1");
    tab.id = `faq-tab-${index}`;
    tab.addEventListener("click", () => {
      tabs.querySelectorAll(".faq-tab").forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute("aria-selected", String(selected));
        candidate.setAttribute("tabindex", selected ? "0" : "-1");
      });
      items.forEach((item, itemIndex) => {
        item.hidden = categoryFor(itemIndex) !== category;
      });
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = [...tabs.children].indexOf(tab);
      const next = event.key === "Home" ? 0 : event.key === "End" ? categories.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length;
      tabs.children[next].focus();
      tabs.children[next].click();
    });
    tabs.append(tab);
  });
  faqPreview.before(tabs);
}

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-enabled");
  const targets = [...document.querySelectorAll(".reveal, .section-heading h2")];
  const reveal = (element, observer) => {
    element.classList.add("is-visible");
    observer?.unobserve(element);
  };
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) reveal(entry.target, instance);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  targets.forEach((element) => {
    element.classList.add("reveal");
    const rect = element.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) reveal(element, observer);
    else observer.observe(element);
  });
  const revealAll = () => targets.forEach((element) => reveal(element, observer));
  window.addEventListener("load", revealAll, { once: true });
  window.addEventListener("pageshow", revealAll);
  window.setTimeout(revealAll, 700);
}
