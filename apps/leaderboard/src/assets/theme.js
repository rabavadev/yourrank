try {
  const theme = localStorage.getItem("yr-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
} catch {}
