import { describe, it, expect } from "bun:test";
import {
  profilePage,
  planPage,
  postbacksPage,
  connectedPage,
  dataPage,
} from "../pages/account-pages.js";

const pages = [
  {
    key: "profile",
    html: profilePage,
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
    html: planPage,
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
    html: postbacksPage,
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
    html: connectedPage,
    ids: ["connected", "connectedAccounts"],
  },
  {
    key: "data",
    html: dataPage,
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

describe("account pages", () => {
  for (const { key, html, ids } of pages) {
    it(`${key} renders its wrapper and client hooks`, () => {
      expect(html).toContain(`<div id="acc-app" data-acc-tab="${key}">`);
      expect(html.length).toBeGreaterThan(100);
      for (const id of ids) expect(html).toContain(`id="${id}"`);
    });
  }

  it("renders the delete-account modal only on the data page", () => {
    expect(dataPage).toContain('id="deleteAccountModal"');
    expect(dataPage).toContain('id="deleteAccountConfirm"');
    for (const { key, html } of pages) {
      if (key === "data") continue;
      expect(html).not.toContain('id="deleteAccountModal"');
      expect(html).not.toContain('id="deleteAccountConfirm"');
    }
  });
});
