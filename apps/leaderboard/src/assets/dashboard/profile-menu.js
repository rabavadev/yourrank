export function updateProfileMenu(user) {
  const identity = String(user?.displayName || user?.email || "Account").trim() || "Account";
  const initial = identity.charAt(0).toUpperCase();
  document.querySelectorAll("[data-profile-name]").forEach((el) => {
    el.textContent = identity;
  });
  document.querySelectorAll(".gm-who-avatar").forEach((el) => {
    el.textContent = initial;
  });
}
