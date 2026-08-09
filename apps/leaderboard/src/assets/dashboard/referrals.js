// Referrals page in the dashboard.
import { $, logError, copyToClipboard, flashButton } from "./utils.js";

export async function renderReferrals() {
  const linkEl = $("refLink");
  const copyBtn = $("refCopy");
  const statusEl = $("refStatus");
  if (!linkEl) return;
  try {
    const r = await fetch("/api/referrals");
    const d = await r.json();
    if (!r.ok || !d.ok) {
      if (r.status === 401) { location.href = "/login"; return; }
      statusEl.textContent = d.error || "Could not load referrals.";
      return;
    }
    linkEl.value = d.link;
    $("refCount").textContent = d.count || "0";
    $("refDays").textContent = d.totalDays || "0";
    $("refSaved").textContent = `$${d.savedUsd || 0}`;
    if (copyBtn && !copyBtn._wired) {
      copyBtn._wired = true;
      copyBtn.addEventListener("click", async () => {
        const ok = await copyToClipboard(linkEl.value);
        if (ok) {
          flashButton(copyBtn, "Copied!");
        } else {
          logError("copy-referral", new Error("clipboard write failed"));
          if (statusEl) statusEl.textContent = "Copy failed. Select the link and copy manually.";
        }
      });
    }
  } catch (err) {
    logError("referrals", err);
    if (statusEl) statusEl.textContent = "Network error. Refresh.";
  }
}
