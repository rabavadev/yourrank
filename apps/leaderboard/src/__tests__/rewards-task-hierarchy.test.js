import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
  RewardsRulesPage,
  RewardsViewersPage,
  rewardsRulesConfig,
} from "../pages/rewards.jsx";

const rewardsUx = readFileSync(new URL("../assets/rewards-ux.js", import.meta.url), "utf8");

describe("Rewards task hierarchy", () => {
  it("groups Rewards into creator tasks instead of six peer tabs", () => {
    const html = RewardsRulesPage().toString();
    for (const label of ["Prize orders", "Shop", "Credits", "Activity"]) {
      expect(html).toContain(`>${label}</a>`);
    }
    for (const label of ["Earning rules", "Kick connection", "Viewer balances"]) {
      expect(html).toContain(`>${label}</a>`);
    }
    expect(html).toContain('aria-label="Credits pages"');
  });

  it("uses Credits as the parent breadcrumb for earning and balance tasks", () => {
    const html = RewardsViewersPage().toString();
    expect(html).toContain('<a href="/dashboard/rewards/redemptions">Rewards</a>');
    expect(html).toContain('<a href="/dashboard/rewards/rules">Credits</a>');
    expect(html).toContain('<span aria-current="page">Viewer balances</span>');
  });

  it("loads the creator-facing client cleanup", () => {
    expect(rewardsRulesConfig.scripts.join("\n")).toContain("/assets/rewards-ux.js");
    expect(rewardsUx).toContain('technicalId.hidden = true');
    expect(rewardsUx).toContain('button.textContent = "Add credits"');
    expect(rewardsUx).toContain("Enter a positive credit amount.");
  });

  it("keeps the existing routes while improving labels", () => {
    const html = RewardsRulesPage().toString();
    expect(html).toContain('href="/dashboard/rewards/rules"');
    expect(html).toContain('href="/dashboard/rewards/channel"');
    expect(html).toContain('href="/dashboard/audience/viewers"');
    expect(html).toContain('href="/dashboard/rewards/redemptions"');
  });
});
