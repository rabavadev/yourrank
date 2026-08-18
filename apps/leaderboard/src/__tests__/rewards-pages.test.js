import { describe, it, expect } from "bun:test";
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

  it("uses Rewards as the canonical group for creator destinations", () => {
    for (const config of [rewardsChannelConfig, rewardsRulesConfig, rewardsShopConfig, rewardsViewersConfig, rewardsRedemptionsConfig, rewardsHistoryConfig]) {
      expect(config.title).toContain("· Rewards ·");
    }
  });
});
