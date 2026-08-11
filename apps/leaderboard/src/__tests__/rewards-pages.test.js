import { describe, it, expect } from "bun:test";
import {
  RewardsChannelPage,
  RewardsRewardsPage,
  RewardsMapsPage,
  RewardsShopPage,
  RewardsViewersPage,
  RewardsRedemptionsPage,
  RewardsHistoryPage,
} from "../pages/rewards.jsx";

const pages = [
  ["channel", RewardsChannelPage],
  ["rewards", RewardsRewardsPage],
  ["maps", RewardsMapsPage],
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
});
