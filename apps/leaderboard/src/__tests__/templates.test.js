import { describe, expect, it } from "bun:test";
import { renderLeaderboard } from "../render.js";
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

describe("template catalog", () => {
  it("offers twelve registry-driven templates with curated presets", () => {
    expect(TEMPLATE_IDS).toHaveLength(12);
    for (const id of TEMPLATE_IDS) {
      expect(TEMPLATES[id].presets.length).toBeGreaterThanOrEqual(3);
      expect(TEMPLATES[id].presets.every((preset) => /^#[0-9a-f]{6}$/i.test(preset.accentA) && /^#[0-9a-f]{6}$/i.test(preset.accentB))).toBe(true);
    }
  });

  it("exposes client metadata without sending template CSS", () => {
    const catalog = templateCatalog();
    expect(catalog).toHaveLength(12);
    expect(catalog.every((template) => !Object.hasOwn(template, "css"))).toBe(true);
    expect(catalog.map((template) => template.id)).toEqual(TEMPLATE_IDS);
  });

  it("falls back to classic for unknown template ids", () => {
    expect(validTemplate("unknown")).toBe("classic");
  });
});

describe("template previews", () => {
  it("renders real board data in preview mode", () => {
    const html = renderLeaderboard(
      { ...DATA, branding: { template: "neon", accentA: "#00ffd1", accentB: "#ff2cd0" } },
      { nonce: "preview123", preview: true }
    );
    expect(html).toContain('body data-template="neon" data-preview');
    expect(html).toContain("Actual Streamer");
    expect(html).toContain("First Player");
    expect(html).toContain("body[data-preview]");
  });

  it("renders every registered skin", () => {
    for (const template of TEMPLATE_IDS) {
      const html = renderLeaderboard({ ...DATA, branding: { template } }, { nonce: "test123" });
      expect(html).toContain(`body data-template="${template}"`);
    }
  });
});

describe("theme_json / extra_json persistence (BUG: double-encoded JSONB)", () => {
  const SITE = {
    name: "Actual Streamer", tagline: "", code: "RANK", prize_pool: "$5,000",
    period: "Monthly", casino: "Stake", cta_url: "", reset_note: "", blurb: "", ends_at: null,
  };

  it("coerces a double-encoded JSONB string back to its value", () => {
    expect(fromJsonb('{"template":"neon"}')).toEqual({ template: "neon" });
    expect(fromJsonb({ template: "neon" })).toEqual({ template: "neon" });
    expect(fromJsonb(null)).toBe(null);
    expect(fromJsonb("not json")).toBe(null);
  });

  it("resolves the template from a proper JSONB object row", () => {
    const shaped = publicShape({ ...SITE, theme_json: { template: "midnight" }, extra_json: {} }, []);
    expect(shaped.branding.template).toBe("midnight");
  });

  it("resolves the template from a legacy double-encoded string row", () => {
    const shaped = publicShape({ ...SITE, theme_json: '{"template":"midnight"}', extra_json: {} }, []);
    expect(shaped.branding.template).toBe("midnight");
  });

  it("reads socials from a legacy double-encoded extra_json string", () => {
    const extra = JSON.stringify({ socials: [{ label: "X", url: "https://x.com/a" }] });
    const shaped = publicShape({ ...SITE, theme_json: {}, extra_json: extra }, []);
    expect(shaped.socials).toEqual([{ label: "X", url: "https://x.com/a" }]);
  });
});
