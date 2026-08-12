import { describe, expect, it } from "bun:test";
import { renderNewEmbed, renderNewHallOfFame, renderNewLegalPage, renderNewStreamerProfile } from "../auxiliary-renderers.js";
import { renderPasswordGate } from "../password-gate.js";

const record = {
  slug: "demo-board",
  plan: "pro",
  data: {
    brand: { name: "Demo Board", tagline: "A sample board", period: "Monthly", prizePool: "$500" },
    players: [{ name: "Alex", wagered: 100, prize: 25 }],
    socials: [],
    pastWinners: [],
  },
};

const opts = { slug: record.slug, homeUrl: "https://test.com", nonce: "nonce" };

describe("new-shell auxiliary renderers", () => {
  it("renders legal and streamer pages in the site shell with honest empty states", async () => {
    const legal = await renderNewLegalPage(record.data, "privacy", opts);
    const profile = await renderNewStreamerProfile(record.data, opts);
    expect(legal).toContain('class="yr-site"');
    expect(legal).toContain("Privacy Policy");
    expect(profile).toContain("No channel links yet.");
    expect(profile).toContain("No public leaderboards yet.");
  });

  it("renders archive empty state and chrome-less embed", async () => {
    const hall = await renderNewHallOfFame(record.data, opts);
    const embed = renderNewEmbed(record.data, opts);
    expect(hall).toContain("No past winners yet.");
    expect(embed).toContain('class="yr-embed"');
    expect(embed).not.toContain("yr-region");
    expect(embed).toContain("Alex");
  });

  it("keeps the password gate standalone and preserves the error path", () => {
    const html = renderPasswordGate(
      { name: "Private Board", slug: "private-board" },
      opts,
      "Incorrect password.",
    );
    expect(html).toContain('class="yr-site"');
    expect(html).toContain('action="/private-board/password"');
    expect(html).toContain("Incorrect password.");
    expect(html).toContain('name="password"');
  });
});
