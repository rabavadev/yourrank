import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RewardsChannelPage,
  RewardsRulesPage,
  RewardsShopPage,
  RewardsViewersPage,
  RewardsRedemptionsPage,
  RewardsHistoryPage,
  rewardsChannelConfig,
  rewardsRulesConfig,
  rewardsShopConfig,
  rewardsViewersConfig,
  rewardsRedemptionsConfig,
  rewardsHistoryConfig,
} from "../pages/rewards.jsx";

const rewardsUxSource = readFileSync(new URL("../assets/rewards-ux.js", import.meta.url), "utf8");

const pages = [
  ["channel", RewardsChannelPage],
  ["rules", RewardsRulesPage],
  ["shop", RewardsShopPage],
  ["viewers", RewardsViewersPage],
  ["redemptions", RewardsRedemptionsPage],
  ["history", RewardsHistoryPage],
];

describe("server-rendered rewards pages", () => {
  for (const [tab, render] of pages) {
    it(`puts the ${tab} tab marker on #cr-app`, () => {
      const html = render().toString();
      expect(html).toContain(`<div id="cr-app" data-cr-tab="${tab}"`);
      expect(html).not.toContain(`<div data-cr-tab="${tab}">`);
    });
  }

  it("groups the rewards workspace around creator tasks", () => {
    const rules = RewardsRulesPage().toString();
    for (const label of ["Prize orders", "Shop", "Credits", "Activity"]) {
      expect(rules).toContain(`>${label}</a>`);
    }
    for (const label of ["Earning rules", "Kick connection", "Viewer balances"]) {
      expect(rules).toContain(`>${label}</a>`);
    }
    expect(rules).not.toContain(">How viewers earn points</a>");
  });

  it("keeps raw Kick identifiers inside the existing-reward path", () => {
    const rules = RewardsRulesPage().toString();
    expect(rules).toContain("Use existing Kick reward");
    expect(rules).toContain("Create a new Kick reward");
    expect(rules).toContain("This technical ID is only needed when linking an existing reward manually.");
    expect(rules).not.toContain("Where to find your Kick Reward ID?");
    expect(rules).not.toContain("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
  });

  it("uses credits terminology consistently on viewer balance actions", () => {
    const viewers = RewardsViewersPage().toString();
    expect(viewers).toContain(">+ Add credits</button>");
    expect(viewers).toContain(">Add credits</h2>");
    expect(viewers).not.toContain("Tip viewer points");
    expect(viewers).not.toContain("Send credits 🎁");
  });

  it("cleans up client-rendered reward IDs and credit actions", () => {
    expect(rewardsRulesConfig.scripts.join("\n")).toContain("/assets/rewards-ux.js");
    expect(rewardsUxSource).toContain('technicalId.hidden = true');
    expect(rewardsUxSource).toContain('button.textContent = "Add credits"');
    expect(rewardsUxSource).toContain("Enter a positive credit amount.");
    expect(rewardsUxSource).toContain("Added +${success[1]} credits");
  });

  it("uses Rewards as the canonical group for creator destinations", () => {
    for (const config of [rewardsChannelConfig, rewardsRulesConfig, rewardsShopConfig, rewardsViewersConfig, rewardsRedemptionsConfig, rewardsHistoryConfig]) {
      expect(config.title).toContain("· Rewards ·");
    }
  });
});
