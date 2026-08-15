// Shared authenticated-shell behaviour: account menu, persisted desktop rail,
// and the mobile drawer used by string-rendered Help/Telegram pages.
(function () {
  var menus = document.querySelectorAll("details.gm-profile");
  var collapseKey = "yr-side-collapsed";

  function closeProfile(details) {
    details.removeAttribute("open");
    var summary = details.querySelector("summary");
    if (summary) summary.setAttribute("aria-expanded", "false");
  }

  menus.forEach(function (details) {
    var summary = details.querySelector("summary");
    if (summary) summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    details.addEventListener("toggle", function () {
      if (summary) summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    });
  });

  document.addEventListener("click", function (event) {
    menus.forEach(function (details) {
      if (details.open && !details.contains(event.target)) closeProfile(details);
    });
    document.querySelectorAll(".lb-ws-switcher").forEach(function (switcher) {
      var menu = switcher.querySelector(".lb-ws-menu");
      var card = switcher.querySelector(".lb-ws-card");
      if (menu && !menu.hidden && !switcher.contains(event.target)) {
        menu.hidden = true;
        if (card) card.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.querySelectorAll(".lb-ws-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.stopPropagation();
      var menu = card.parentElement.querySelector(".lb-ws-menu");
      if (!menu) return;
      var nextHidden = !menu.hidden;
      menu.hidden = nextHidden;
      card.setAttribute("aria-expanded", nextHidden ? "false" : "true");
    });
  });


  document.querySelectorAll(".v3-dash").forEach(function (root) {
    var buttons = root.querySelectorAll("[data-collapse-side]");
    if (!buttons.length) return;
    var collapsed = false;
    try { collapsed = localStorage.getItem(collapseKey) === "true"; } catch (error) {}

    function applyCollapse(next) {
      collapsed = Boolean(next);
      if (collapsed) root.setAttribute("data-side-collapsed", "true");
      else root.removeAttribute("data-side-collapsed");
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", collapsed ? "true" : "false");
        button.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
        button.title = collapsed ? "Expand navigation" : "Collapse navigation";
      });
    }

    applyCollapse(collapsed);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyCollapse(!collapsed);
        try { localStorage.setItem(collapseKey, collapsed ? "true" : "false"); } catch (error) {}
      });
    });
  });

  var sharedRoot = document.querySelector('.v3-dash[data-shell-drawer="shared"]');
  if (sharedRoot) {
    var side = sharedRoot.querySelector("#lbSide");
    var main = sharedRoot.querySelector(".lb-main");
    var menuButtons = sharedRoot.querySelectorAll(".lb-menu");
    var closeButtons = sharedRoot.querySelectorAll("[data-close-side]");
    var backdrop = document.querySelector(".lb-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "lb-backdrop";
      document.body.appendChild(backdrop);
    }

    function trapDrawerFocus(event) {
      if (event.key !== "Tab" || !side || !side.classList.contains("is-open")) return;
      var focusable = Array.prototype.slice.call(side.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary'))
        .filter(function (element) { return element.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function closeDrawer(returnFocus) {
      if (!side || !side.classList.contains("is-open")) return;
      side.classList.remove("is-open");
      side.removeAttribute("role");
      side.removeAttribute("aria-modal");
      backdrop.classList.remove("is-open");
      if (main) main.inert = false;
      menuButtons.forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
      if (returnFocus !== false && menuButtons[0]) menuButtons[0].focus();
    }

    function openDrawer() {
      if (!side) return;
      side.classList.add("is-open");
      side.setAttribute("role", "dialog");
      side.setAttribute("aria-modal", "true");
      backdrop.classList.add("is-open");
      if (main) main.inert = true;
      menuButtons.forEach(function (button) { button.setAttribute("aria-expanded", "true"); });
      var first = side.querySelector(".lb-nav");
      if (first) first.focus();
    }

    menuButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        openDrawer();
      });
    });
    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () { closeDrawer(true); });
    });
    backdrop.addEventListener("click", function () { closeDrawer(true); });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeDrawer(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeDrawer(true);
      else trapDrawerFocus(event);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    menus.forEach(function (details) {
      if (!details.open) return;
      closeProfile(details);
      var summary = details.querySelector("summary");
      if (summary) summary.focus();
    });
  });

  var themeToggle = document.getElementById("yrThemeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var doc = document.documentElement;
      if (doc.getAttribute("data-theme") === "dark") {
        doc.removeAttribute("data-theme");
        try { localStorage.setItem("yr-theme", "light"); } catch (error) {}
      } else {
        doc.setAttribute("data-theme", "dark");
        try { localStorage.setItem("yr-theme", "dark"); } catch (error) {}
      }
    });
  }
})();
