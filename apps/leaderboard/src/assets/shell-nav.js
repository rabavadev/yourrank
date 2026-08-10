// Behaviour for the shared app header (shared/shell-nav.ts markup).
// Loaded by every page that renders the header — including the bot Worker's
// dashboard — so the account menu behaves the same everywhere.
(function () {
  var menus = document.querySelectorAll("details.gm-profile");
  if (!menus.length) return;

  function close(details) {
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

  document.addEventListener("click", function (e) {
    menus.forEach(function (details) {
      if (details.open && !details.contains(e.target)) close(details);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    menus.forEach(function (details) {
      if (!details.open) return;
      close(details);
      var summary = details.querySelector("summary");
      if (summary) summary.focus();
    });
  });
})();
