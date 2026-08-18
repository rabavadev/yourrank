import { describe, it, expect } from "bun:test";
import { settingsWidgets } from "../pages/account-pages.js";
import { UnifiedSettingsPage } from "../pages/account.jsx";

// The widgets are the settings page's panels; the standalone `/account/*`
// documents they used to also render are gone, so these assert the hooks on
// the widget bodies themselves.
const pages = [
  {
    key: "account",
    html: settingsWidgets.account,
    ids: [
      "profile",
      "accCurrentPassword",
      "accNewPassword",
      "accChangePassword",
      "accPasswordStatus",
      "accRevokeSessions",
      "accSessions",
      "accSessionsStatus",
    ],
  },
  {
    key: "plan",
    html: settingsWidgets.plan,
    ids: [
      "plan",
      "planSummary",
      "planBanner",
      "planUsage",
      "planGrid",
      "planTrial",
      "trialBtn",
      "trialStatus",
      "pendingPayment",
      "pendingPaymentLink",
      "cancelWrap",
      "cancelStatus",
      "cancelBtn",
      "historyCard",
      "historyTable",
      "historyBody",
      "historyEmpty",
    ],
  },
  {
    key: "postbacks",
    html: settingsWidgets.postbacks,
    ids: [
      "postbacks",
      "postbackStatusCard",
      "postbackStatusDot",
      "postbackStatusText",
      "postbackStatusHint",
      "postbackShareCard",
      "postbackSigned",
      "postbackCopySigned",
      "postbackCopyManager",
      "postbackTest",
      "postbackTestStatus",
      "postbackKeyCard",
      "postbackKey",
      "postbackCopyKey",
      "postbackRotate",
      "postbackRevoke",
      "postbackAdvanced",
      "postbackLegacy",
      "postbackCopyLegacy",
      "postbackUpgrade",
      "conversionsTable",
      "conversionsBody",
      "conversionsEmpty",
    ],
  },
  {
    key: "connected",
    html: settingsWidgets.connected,
    ids: ["connected", "connectedAccounts"],
  },
  {
    key: "data",
    html: settingsWidgets.data,
    ids: [
      "data",
      "accExportData",
      "accExportStatus",
      "deleteAccountBtn",
      "deleteAccountModal",
      "deleteAccountConfirm",
      "deleteAccountPasswordWrap",
      "deleteAccountPassword",
      "deleteAccountConfirmBtn",
      "deleteAccountCancelBtn",
      "deleteAccountModalStatus",
    ],
  },
];

describe("settings panels", () => {
  for (const { key, html, ids } of pages) {
    it(`${key} renders its client hooks`, () => {
      expect(html.length).toBeGreaterThan(100);
      for (const id of ids) expect(html).toContain(`id="${id}"`);
    });
  }

  it("renders the delete-account modal only in the data panel", () => {
    expect(settingsWidgets.data).toContain('id="deleteAccountModal"');
    expect(settingsWidgets.data).toContain('id="deleteAccountConfirm"');
    for (const { key, html } of pages) {
      if (key === "data") continue;
      expect(html).not.toContain('id="deleteAccountModal"');
      expect(html).not.toContain('id="deleteAccountConfirm"');
    }
  });

  it("serves every panel from the one settings document", async () => {
    const html = await UnifiedSettingsPage({ activePath: "/dashboard/settings/plan", tab: "plan", user: { email: "a@b.c" } }).toString();
    for (const key of ["account", "plan", "connections", "data"]) {
      expect(html).toContain(`href="/dashboard/settings/${key}"`);
      expect(html).toContain(`data-settings-panel="${key}"`);
    }
    // Site-level settings are a separate destination, not a fifth tab.
    expect(html).toContain('href="/dashboard/settings/board"');
    expect(html).not.toContain("/account/profile");
  });

  it("keeps account settings creator-facing instead of exposing scope jargon", async () => {
    const html = await UnifiedSettingsPage({ activePath: "/dashboard/settings/account", tab: "account", user: { email: "a@b.c", plan: "pro" } }).toString();
    expect(html).toContain("Open site settings");
    expect(html).toContain("Open Help &amp; feedback");
    expect(html).not.toContain("Global Account Scope");
    expect(html).not.toContain("Owner / Master");
    expect(html).not.toContain("Security Posture");
    expect(html).not.toContain('id="accSummaryAvatar"');
  });
});
