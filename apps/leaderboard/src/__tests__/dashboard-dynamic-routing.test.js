// Dynamic sections must route identically on both sides of the wire.
//
// Rewards, Engagement, Audience and Account load as content fragments inside
// the persistent dashboard shell: the client asks for
// /dashboard/_content?path=<url> and the Worker renders the same page
// component the full document route would serve. Two routing tables make that
// work — DYNAMIC_SECTIONS in assets/dashboard/routes.js (client) and
// resolveFragment() in index.js (server). If they drift, a tab either 404s in
// the shell or renders the wrong panel. These tests pin them together.
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";
import { DYNAMIC_SECTIONS, dynamicPath, dynamicTitle, isDynamicSection, parseDynamicPath, trimTrailingSlashes } from "../assets/dashboard/routes.js";
import { resolveFragment } from "../index.js";

const user = { display_name: "Test operator", plan: "pro" };

// Every dynamic section, its server page key per tab, and its boot module.
// `boot` is what dynamic-section.js imports when the section is entered.
const EXPECTED = {
  rewards: {
    boot: "credits",
    tabs: {
      overview: "rewardsOverview",
      shop: "rewardsShop",
      rules: "rewardsRules",
      redemptions: "rewardsRedemptions",
      history: "rewardsHistory",
      channel: "rewardsChannel",
    },
  },
  giveaways: {
    boot: "giveaways",
    tabs: {
      chat: "giveaways",
      raffles: "giveaways",
      drops: "giveaways",
      preds: "giveaways",
      tournaments: "giveaways",
    },
  },
  audience: {
    boot: "credits",
    tabs: { viewers: "audienceMembers" },
  },
  settings: {
    boot: "account",
    tabs: {
      account: "settingsUnified",
      team: "settingsUnified",
      plan: "settingsUnified",
      connections: "settingsUnified",
      data: "settingsUnified",
    },
  },
};

describe("dynamic section routing parity", () => {
  it("knows exactly the four dynamic sections", () => {
    expect(Object.keys(DYNAMIC_SECTIONS).sort()).toEqual(["audience", "giveaways", "rewards", "settings"]);
    for (const page of Object.keys(DYNAMIC_SECTIONS)) expect(isDynamicSection(page)).toBe(true);
    expect(isDynamicSection("home")).toBe(false);
    expect(isDynamicSection("telegram")).toBe(false);
  });

  it("trims trailing slashes in linear time with sane edge cases", () => {
    expect(trimTrailingSlashes("/dashboard///")).toBe("/dashboard");
    expect(trimTrailingSlashes("/".repeat(1000))).toBe("");
    expect(trimTrailingSlashes("")).toBe("");
    expect(trimTrailingSlashes(undefined)).toBe("");
    expect(trimTrailingSlashes("/dashboard")).toBe("/dashboard");
    // All-slash input falls back to /dashboard at the call site, like the old regex.
    expect(parseDynamicPath("/dashboard/rewards///")).toEqual({ page: "rewards", tab: "overview", dynamic: true });
  });

  it("round-trips every tab through dynamicPath → parseDynamicPath", () => {
    for (const [page, section] of Object.entries(DYNAMIC_SECTIONS)) {
      for (const tab of section.tabs) {
        const path = dynamicPath(page, tab);
        expect(path, `${page}/${tab} has no path`).toBeTruthy();
        const parsed = parseDynamicPath(path);
        expect(parsed, `${path} does not parse`).toEqual({ page, tab, dynamic: true });
      }
    }
  });

  it("resolves every tab path on the server to a real page component", () => {
    for (const [page, section] of Object.entries(EXPECTED)) {
      expect(DYNAMIC_SECTIONS[page].boot, `${page} boot module`).toBe(section.boot);
      expect(Object.keys(section.tabs), `${page} tab set`).toEqual(DYNAMIC_SECTIONS[page].tabs);
      for (const [tab, pageKey] of Object.entries(section.tabs)) {
        const path = dynamicPath(page, tab);
        const fragment = resolveFragment(path);
        expect(fragment, `${path} resolves on the server`).toEqual({ pageKey, tab });
        const entry = PAGES[pageKey];
        expect(entry?.Component, `${path} has a page component`).toBeTruthy();
      }
    }
  });

  it("accepts the bare section prefix as its first tab", () => {
    expect(parseDynamicPath("/dashboard/rewards")).toEqual({ page: "rewards", tab: "overview", dynamic: true });
    expect(parseDynamicPath("/dashboard/giveaways")).toEqual({ page: "giveaways", tab: "chat", dynamic: true });
    expect(parseDynamicPath("/dashboard/settings")).toEqual({ page: "settings", tab: "account", dynamic: true });
    expect(resolveFragment("/dashboard/rewards")).toEqual({ pageKey: "rewardsOverview", tab: "overview" });
    expect(resolveFragment("/dashboard/settings")).toEqual({ pageKey: "settingsUnified", tab: "account" });
  });

  it("maps the URL aliases to their internal tab keys", () => {
    expect(parseDynamicPath("/dashboard/giveaways/predictions").tab).toBe("preds");
    expect(parseDynamicPath("/dashboard/rewards/activity").tab).toBe("history");
    expect(parseDynamicPath("/dashboard/settings/billing").tab).toBe("plan");
    expect(resolveFragment("/dashboard/giveaways/predictions")).toEqual({ pageKey: "giveaways", tab: "preds" });
    expect(resolveFragment("/dashboard/rewards/activity")).toEqual({ pageKey: "rewardsHistory", tab: "history" });
    expect(resolveFragment("/dashboard/settings/billing")).toEqual({ pageKey: "settingsUnified", tab: "plan" });
  });

  it("rejects unknown dynamic sub-paths on both sides", () => {
    expect(parseDynamicPath("/dashboard/rewards/nope")).toBeNull();
    expect(parseDynamicPath("/dashboard/settings/nope")).toBeNull();
    expect(resolveFragment("/dashboard/rewards/nope")).toBeNull();
    expect(resolveFragment("/dashboard/settings/nope")).toBeNull();
  });

  it("strips query strings before resolving fragments", () => {
    // The edit-reward flow re-routes to /dashboard/rewards/rules?edit=<id>.
    expect(resolveFragment("/dashboard/rewards/rules?edit=12&siteId=abc")).toEqual({ pageKey: "rewardsRules", tab: "rules" });
    expect(resolveFragment("/dashboard/audience/members?siteId=abc")).toEqual({ pageKey: "audienceMembers", tab: "viewers" });
  });

  it("titles every dynamic route", () => {
    for (const [page, section] of Object.entries(DYNAMIC_SECTIONS)) {
      for (const tab of section.tabs) {
        const title = dynamicTitle(page, tab);
        expect(title, `${page}/${tab} is untitled`).toMatch(/YourRank$/);
      }
    }
  });

  it("renders every tab as a fragment without the document shell scripts", () => {
    // Fragment mode must not re-emit the boot <script> tags: the persistent
    // shell already imported those modules, and a second <script> for the
    // same src would re-run auto-init against a duplicated DOM.
    for (const [page, section] of Object.entries(EXPECTED)) {
      for (const [tab, pageKey] of Object.entries(section.tabs)) {
        const path = dynamicPath(page, tab);
        const html = PAGES[pageKey].Component({ user, tab, fragment: true }).toString();
        expect(html, `${path} fragment is empty`).toMatch(/\S/);
        expect(html, `${path} fragment must not carry boot scripts`).not.toContain("<script");
        expect(html, `${path} fragment must not carry a doctype`).not.toContain("<!DOCTYPE");
      }
    }
  });
});

describe("dynamic section shell integration", () => {
  const shellJs = readFileSync(new URL("../assets/dashboard/shell.js", import.meta.url), "utf8");
  const dynamicJs = readFileSync(new URL("../assets/dashboard/dynamic-section.js", import.meta.url), "utf8");
  const paletteJs = readFileSync(new URL("../assets/dashboard/command-palette.js", import.meta.url), "utf8");

  it("only loads fragments when this document is the persistent shell", () => {
    // The command palette imports the router on standalone document pages;
    // without the guard a palette click there would pushState into a URL the
    // document cannot render.
    expect(shellJs).toContain("hasDynamicRegion()");
    expect(shellJs).toMatch(/isDynamicSection\(page\) && hasDynamicRegion\(\)/);
  });

  it("routes link clicks through one delegated handler instead of per-fragment wiring", () => {
    // Late-rendered links (panels the boot modules re-render after data
    // loads) must be caught by document-level delegation, not by wiring the
    // fragment once at injection time.
    expect(shellJs).toMatch(/document\.addEventListener\("click"/);
    expect(dynamicJs).not.toContain("wireDynamicSubTabs");
  });

  it("keeps the command palette inside the shell except for cross-worker Telegram", () => {
    // Every Navigation entry either routes via requestDashboardRoute or is
    // the deliberate Telegram document load.
    const entries = [...paletteJs.matchAll(/\{ id: "(nav-[^"]+)".*?action: \(\) => (.*?) \},/g)];
    expect(entries.length).toBeGreaterThan(10);
    for (const [, id, action] of entries) {
      if (id === "nav-telegram") {
        expect(action).toContain("location.href");
      } else {
        expect(action, `${id} must route through the shell`).toContain("requestDashboardRoute");
        expect(action, `${id} must not trigger a document reload`).not.toContain("location.href");
      }
    }
  });

  it("re-routes the reward edit flow in-shell with force, keeping document mode intact", () => {
    const creditsJs = readFileSync(new URL("../assets/credits.js", import.meta.url), "utf8");
    expect(creditsJs).toMatch(/__yrSpaShell[\s\S]*?force: true/);
    expect(creditsJs).toMatch(/location\.href = `\/dashboard\/rewards\/rules\$\{query\}`/);
  });
});
