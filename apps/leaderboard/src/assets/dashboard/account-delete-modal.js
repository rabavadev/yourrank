// Keyboard-accessible lifecycle for the server-rendered account deletion dialog.
// This intentionally owns the modal when account.js/site.js also loads: the
// first listener stops the legacy click handlers from opening a second lifecycle.
const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

function csrfToken() {
  return document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";
}

function focusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.offsetParent !== null);
}

export function wireDeleteAccountModal() {
  const opener = document.getElementById("deleteAccountBtn");
  const modal = document.getElementById("deleteAccountModal");
  const confirmInput = document.getElementById("deleteAccountConfirm");
  const passwordWrap = document.getElementById("deleteAccountPasswordWrap");
  const passwordInput = document.getElementById("deleteAccountPassword");
  const confirmBtn = document.getElementById("deleteAccountConfirmBtn");
  const cancelBtn = document.getElementById("deleteAccountCancelBtn");
  const status = document.getElementById("deleteAccountModalStatus");
  if (!opener || !modal || !confirmInput || !confirmBtn || !cancelBtn) return;

  let restoreTarget = null;
  let busy = false;

  const setStatus = (message) => { if (status) status.textContent = message; };
  const reset = () => {
    confirmInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (passwordWrap) passwordWrap.hidden = true;
    if (status) status.textContent = "";
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Delete my account";
    busy = false;
  };
  const close = (restore = true) => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("yr-modal-open");
    document.removeEventListener("keydown", onKeyDown, true);
    reset();
    if (restore && restoreTarget && document.contains(restoreTarget)) restoreTarget.focus();
    restoreTarget = null;
  };
  const open = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    restoreTarget = event.currentTarget;
    reset();
    modal.hidden = false;
    modal.removeAttribute("aria-hidden");
    document.documentElement.classList.add("yr-modal-open");
    document.addEventListener("keydown", onKeyDown, true);
    confirmInput.focus();
  };
  const valid = () => {
    if (confirmInput.value.trim() !== "DELETE") {
      setStatus("Type DELETE exactly to confirm.");
      confirmInput.focus();
      return false;
    }
    if (passwordWrap && !passwordWrap.hidden && passwordInput && !passwordInput.value.trim()) {
      setStatus("Enter your password.");
      passwordInput.focus();
      return false;
    }
    return true;
  };
  const submit = async (event) => {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    if (busy || !valid()) return;
    busy = true;
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting…";
    setStatus("");
    const password = passwordWrap && !passwordWrap.hidden && passwordInput ? passwordInput.value.trim() : "";
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-csrf-token": csrfToken() },
        body: JSON.stringify(password ? { password } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.error && data.error.includes("Password required")) {
        if (passwordWrap) passwordWrap.hidden = false;
        setStatus("Enter your password to confirm deletion.");
        busy = false;
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Delete my account";
        passwordInput?.focus();
        return;
      }
      if (res.ok && data.ok) {
        setStatus("Account deleted. Redirecting…");
        location.href = "/";
        return;
      }
      setStatus(data.error || "Deletion failed. Try again.");
    } catch {
      setStatus("Couldn't delete account. Try again.");
    }
    busy = false;
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Delete my account";
  };
  function onKeyDown(event) {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
      return;
    }
    if (event.key === "Enter" && (event.target === confirmInput || event.target === passwordInput)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      submit(event);
      return;
    }
    if (event.key !== "Tab") return;
    const controls = focusables(modal);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!modal.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  opener.addEventListener("click", open, true);
  cancelBtn.addEventListener("click", (event) => { event.preventDefault(); event.stopImmediatePropagation(); close(); }, true);
  confirmBtn.addEventListener("click", submit, true);
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  }, true);
  modal.setAttribute("aria-hidden", "true");
}

