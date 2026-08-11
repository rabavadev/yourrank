// Referrals page in the dashboard.
import { $, logError, copyToClipboard, flashButton } from "./utils.js";
import { setState } from "./state.js";
import { setMetricLoading, setMetricValue } from "./states.js";

export async function renderReferrals() {
  const linkEl = $("refLink");
  const copyBtn = $("refCopy");
  const statusEl = $("refStatus");
  if (!linkEl) return;
  setState({ REFERRALS_STATUS: "loading" });
  setMetricLoading($("refCount"));
  setMetricLoading($("refDays"));
  setMetricLoading($("refSaved"));
  try {
    const r = await fetch("/api/referrals");
    const d = await r.json();
    if (!r.ok || !d.ok) {
      if (r.status === 401) { location.href = "/login"; return; }
      setState({ REFERRALS_STATUS: "error" });
      statusEl.textContent = d.error || "Could not load referrals.";
      return;
    }
    setState({ REFERRALS_STATUS: "ready" });
    linkEl.value = d.link;
    setMetricValue($("refCount"), d.count == null ? "—" : d.count);
    setMetricValue($("refDays"), d.totalDays == null ? "—" : d.totalDays);
    setMetricValue($("refSaved"), d.savedUsd == null ? "—" : `$${d.savedUsd}`);
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
    setState({ REFERRALS_STATUS: "error" });
    logError("referrals", err);
    if (statusEl) statusEl.textContent = "Network error. Refresh.";
  }
}
