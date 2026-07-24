import { describe, expect, it } from "bun:test";
import { renderLeaderboard } from "../render.jsx";
import { TEMPLATE_IDS, TEMPLATES, templateCatalog, validTemplate } from "../templates/index.js";
import { fromJsonb, publicShape } from "../site.js";

const DATA = {
  brand: {
    name: "Actual Streamer",
    casino: "Stake",
    code: "RANK",
    prizePool: "$5,000",
    period: "Monthly",
  },
  branding: {},
  players: [
    { name: "First Player", wagered: 50000, prize: 1000 },
    { name: "Second Player", wagered: 30000, prize: 500 },
  ],
  partner: {},
  whyStats: [],
  rules: [],
  socials: [],
};

describe("template catalog", async () => {
  it("offers a curated registry of distinct templates with curated presets", async () => {
    expect(TEMPLATE_IDS.length).toBeGreaterThanOrEqual(20);
    for (const id of TEMPLATE_IDS) {
      expect(TEMPLATES[id].presets.length).toBeGreaterThanOrEqual(3);
      expect(TEMPLATES[id].presets.every((preset) => /^#[0-9a-f]{6}$/i.test(preset.accentA) && /^#[0-9a-f]{6}$/i.test(preset.accentB))).toBe(true);
    }
  });

  it("exposes client metadata without sending template CSS", async () => {
    const catalog = templateCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(20);
    expect(catalog.every((template) => !Object.hasOwn(template, "css"))).toBe(true);
    expect(catalog.map((template) => template.id)).toEqual(TEMPLATE_IDS);
  });

  it("falls back to classic for unknown template ids", async () => {
    expect(validTemplate("unknown")).toBe("classic");
  });
});

describe("template previews", async () => {
  it("renders real board data in preview mode", async () => {
    const html = await renderLeaderboard(
      { ...DATA, branding: { template: "neon", accentA: "#00ffd1", accentB: "#ff2cd0" } },
      { nonce: "preview123", preview: true }
    );
    expect(html).toContain('body data-template="neon" data-preview');
    expect(html).toContain("Actual Streamer");
    expect(html).toContain("First Player");
    expect(html).toContain("body[data-preview]");
  });

  it("renders every registered skin", async () => {
    for (const template of TEMPLATE_IDS) {
      const html = await renderLeaderboard({ ...DATA, branding: { template } }, { nonce: "test123" });
      expect(html).toContain(`body data-template="${template}"`);
    }
  });

  it("uses div-based ARIA table rows (aria-allowed-role fix, not ol/li)", async () => {
    const html = await renderLeaderboard({ ...DATA }, { nonce: "test123" });
    expect(html).toContain('<div class="t-rows" role="rowgroup" data-rows></div>');
    expect(html).not.toContain('<ol class="t-rows"');
  });

  it("shows a referral banner with a signup CTA only on the demo board (C2)", async () => {
    const demo = await renderLeaderboard({ ...DATA }, { nonce: "n", demo: true, homeUrl: "https://yourrank.site" });
    expect(demo).toContain("class=\"demo-bar\"");
    expect(demo).toContain('href="https://yourrank.site/signup"');
    const normal = await renderLeaderboard({ ...DATA }, { nonce: "n" });
    expect(normal).not.toContain("class=\"demo-bar\"");
  });
});

describe("theme_json / extra_json persistence (BUG: double-encoded JSONB)", async () => {
  const SITE = {
    name: "Actual Streamer", tagline: "", code: "RANK", prize_pool: "$5,000",
    period: "Monthly", casino: "Stake", cta_url: "", reset_note: "", blurb: "", ends_at: null,
  };

  it("coerces a double-encoded JSONB string back to its value", async () => {
    expect(fromJsonb('{"template":"neon"}')).toEqual({ template: "neon" });
    expect(fromJsonb({ template: "neon" })).toEqual({ template: "neon" });
    expect(fromJsonb(null)).toBe(null);
    expect(fromJsonb("not json")).toBe(null);
  });

  it("resolves the template from a proper JSONB object row", async () => {
    const shaped = publicShape({ ...SITE, theme_json: { template: "midnight" }, extra_json: {} }, []);
    expect(shaped.branding.template).toBe("midnight");
  });

  it("resolves the template from a legacy double-encoded string row", async () => {
    const shaped = publicShape({ ...SITE, theme_json: '{"template":"midnight"}', extra_json: {} }, []);
    expect(shaped.branding.template).toBe("midnight");
  });

  it("reads socials from a legacy double-encoded extra_json string", async () => {
    const extra = JSON.stringify({ socials: [{ label: "X", url: "https://x.com/a" }] });
    const shaped = publicShape({ ...SITE, theme_json: {}, extra_json: extra }, []);
    expect(shaped.socials).toEqual([{ label: "X", url: "https://x.com/a" }]);
  });

  it("hides disabled socials and surfaces enabled socials even without a real url", async () => {
    const socials = [
      { brand: "x", name: "X", url: "https://x.com/a", enabled: true },
      { brand: "kick", name: "Kick", url: "https://kick.com/a", enabled: false },
      { brand: "discord", name: "Discord", url: "", enabled: true },
      { brand: "twitch", name: "Twitch", url: "#", enabled: true },
      { brand: "telegram", name: "Telegram", url: "https://t.me/a", enabled: true },
    ];
    const shaped = publicShape({ ...SITE, theme_json: {}, extra_json: { socials } }, []);
    expect(shaped.socials.map((s) => s.brand)).toEqual(["x", "discord", "twitch", "telegram"]);
  });
});
