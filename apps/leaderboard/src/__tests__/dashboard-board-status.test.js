import { beforeAll, describe, expect, it } from "bun:test";

const elements = new Map();
const sessionValues = new Map();
const navigation = { href: "http://localhost/dashboard/leaderboard/share" };

function element() {
  return {
    hidden: false,
    textContent: "",
    className: "",
    title: "",
    attributes: {},
    listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) { this.listeners[name] = listener; },
    click() {
      this.onclick?.();
      this.listeners.click?.();
    },
  };
}

function resetDom() {
  elements.clear();
  ["verifyBanner", "verifyBannerEmail", "verifyDismiss", "verifyResend",
    "verifyBannerStatus", "sharePublishWarning", "sharePublishWarningTitle",
    "sharePublishWarningBody", "sharePublishAction", "publishAction"].forEach((id) => {
    elements.set(id, element());
  });
  sessionValues.clear();
}

let renderBoardStatus;
let setState;

beforeAll(async () => {
  globalThis.document = {
    cookie: "",
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById(id) { return elements.get(id) || null; },
  };
  globalThis.location = navigation;
  globalThis.sessionStorage = {
    getItem(key) { return sessionValues.get(key) || null; },
    setItem(key, value) { sessionValues.set(key, String(value)); },
    removeItem(key) { sessionValues.delete(key); },
  };
  ({ renderBoardStatus } = await import("../assets/dashboard/site.js"));
  ({ setState } = await import("../assets/dashboard/state.js"));
});

function render({ published, emailVerified }) {
  resetDom();
  setState({
    ME: { id: "user-1", email: "operator@example.com", emailVerified },
    PUBLISHED: published,
    IS_DRAFT: !published,
    SITE_UPDATED_AT: null,
    PUBLISHED_AT: null,
  });
  renderBoardStatus();
  return Object.fromEntries([...elements].map(([id, node]) => [id, node]));
}

describe("dashboard publication status rendering", () => {
  it("shows the verification consequence and routes Share to verification", () => {
    const nodes = render({ published: true, emailVerified: false });

    expect(nodes.verifyBanner.hidden).toBe(false);
    expect(nodes.verifyBannerEmail.textContent).toBe("operator@example.com");
    expect(nodes.sharePublishWarning.hidden).toBe(false);
    expect(nodes.sharePublishWarningTitle.textContent)
      .toBe("Your site is published, but offline to visitors.");
    expect(nodes.sharePublishWarningBody.textContent)
      .toBe("Confirm your email address before visitors can open this leaderboard.");
    expect(nodes.sharePublishAction.textContent).toBe("Verify email");
    nodes.sharePublishAction.click();
    expect(navigation.href).toBe("/verify-email");
  });

  it("hides the verification banner and share warning for a published verified board", () => {
    const nodes = render({ published: true, emailVerified: true });

    expect(nodes.verifyBanner.hidden).toBe(true);
    expect(nodes.sharePublishWarning.hidden).toBe(true);
  });

  it("shows the unpublished Share state and delegates its action to Publish", () => {
    const nodes = render({ published: false, emailVerified: true });
    let publishClicks = 0;
    nodes.publishAction.click = () => { publishClicks += 1; };

    expect(nodes.verifyBanner.hidden).toBe(true);
    expect(nodes.sharePublishWarning.hidden).toBe(false);
    expect(nodes.sharePublishWarningTitle.textContent).toBe("This site is not published.");
    expect(nodes.sharePublishWarningBody.textContent)
      .toBe("Visitors will receive a 404 until you publish it.");
    expect(nodes.sharePublishAction.textContent).toBe("Publish site");
    nodes.sharePublishAction.click();
    expect(publishClicks).toBe(1);
  });
});
