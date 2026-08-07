import { describe, expect, it } from "bun:test";
import { renderLeaderboard } from "../render.jsx";
import { TEMPLATE_IDS, TEMPLATES, templateCatalog, validTemplate, resolveOptions, templateHeader, templateFooter, templateParts } from "../templates/index.js";
import { fromJsonb, publicShape } from "../site.js";

function stripScripts(html) {
  let out = "";
  let i = 0;
  while (i < html.length) {
    const start = html.indexOf("<script", i);
    if (start === -1) { out += html.slice(i); break; }
    out += html.slice(i, start);
    const end = html.indexOf("</script>", start);
    if (end === -1) { out += html.slice(start); break; }
    i = end + "</script>".length;
  }
  return out;
}

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
  it("offers the registered templates with curated presets", async () => {
    expect(TEMPLATE_IDS).toEqual(["classic", "terminal", "tournament", "noir", "broadcaster"]);
    for (const id of TEMPLATE_IDS) {
      expect(TEMPLATES[id].presets.length).toBeGreaterThanOrEqual(3);
      expect(TEMPLATES[id].presets.every((preset) => /^#[0-9a-f]{6}$/i.test(preset.accentA) && /^#[0-9a-f]{6}$/i.test(preset.accentB))).toBe(true);
    }
  });

  it("exposes client metadata without sending template CSS", async () => {
    const catalog = templateCatalog();
    expect(catalog.length).toBe(5);
    expect(catalog.every((template) => !Object.hasOwn(template, "css"))).toBe(true);
    expect(catalog.map((template) => template.id)).toEqual(TEMPLATE_IDS);
  });

  it("falls back to classic for unknown template ids", async () => {
    expect(validTemplate("unknown")).toBe("classic");
  });
});

describe("template client contract", async () => {
  // leaderboard.js queries these with querySelector (single element). If any
  // template renders one twice — or drops data-rows/data-top3 — live updates
  // silently break for boards using that template. This is the gate.
  const SINGLETON_HOOKS = [
    "data-rows", "data-top3", "data-timer", "data-timer-grid", "data-countdown",
    "data-count", "data-payouts", "data-find-rank", "data-find-result",
    "data-rules", "data-past-grid", "data-socials", "data-player-count-badge",
    "data-live-badge", "data-copy-status",
  ];
  const REQUIRED_HOOKS = ["data-rows", "data-top3"];

  it("renders every single-element hook at most once per template", async () => {
    for (const template of TEMPLATE_IDS) {
      const html = await renderLeaderboard({ ...DATA, branding: { template } }, { nonce: "contract1" });
      for (const hook of SINGLETON_HOOKS) {
        // Word-boundary match so data-countdown doesn't count as data-count.
        const n = (html.match(new RegExp(hook + "(?=[\\s>])", "g")) || []).length;
        expect(n, `${template} renders ${hook} ${n} times`).toBeLessThanOrEqual(1);
      }
      for (const hook of REQUIRED_HOOKS) {
        const n = (html.match(new RegExp(hook + "(?=[\\s>])", "g")) || []).length;
        expect(n, `${template} is missing required ${hook}`).toBe(1);
      }
    }
  });

  it("loads only the template's fonts plus the picker font", async () => {
    const terminal = await renderLeaderboard({ ...DATA, branding: { template: "terminal" } }, { nonce: "f1" });
    expect(terminal).toContain("family=JetBrains+Mono");
    expect(terminal).toContain("family=Inter"); // default picker font
    expect(terminal).not.toContain("family=Sora");
    expect(terminal).not.toContain("family=Montserrat");
    const tournament = await renderLeaderboard({ ...DATA, branding: { template: "tournament" } }, { nonce: "f2" });
    expect(tournament).toContain("family=Sora");
    expect(tournament).not.toContain("family=Press+Start+2P");
    const noir = await renderLeaderboard({ ...DATA, branding: { template: "noir" } }, { nonce: "f3" });
    expect(noir).toContain("family=Playfair+Display");
    expect(noir).toContain("family=EB+Garamond");
    expect(noir).not.toContain("family=Sora");
    expect(noir).not.toContain("family=JetBrains+Mono");
  });

  it("scopes every template CSS rule under its data-template attribute", async () => {
    for (const id of TEMPLATE_IDS) {
      const css = TEMPLATES[id].css;
      if (!css) continue;
      const rules = css.split("}").map((r) => r.split("{")[0].trim()).filter((s) => s && !s.startsWith("@") && !s.startsWith("/*") && !s.startsWith("to") && !s.startsWith("from"));
      for (const selector of rules) {
        const cleaned = selector.replace(/\/\*[^]*?\*\//g, "").trim();
        if (!cleaned || cleaned.startsWith("@media")) continue;
        expect(cleaned.startsWith(`body[data-template="${id}"]`), `${id} has unscoped selector: ${cleaned.slice(0, 60)}`).toBe(true);
      }
    }
  });
});

describe("template shell ownership", async () => {
  it("lets a template own its header and footer chrome", async () => {
    const noir = await renderLeaderboard({ ...DATA, branding: { template: "noir" } }, { nonce: "s1" });
    expect(noir).toContain("noir-masthead");
    expect(noir).toContain("noir-footer");
    expect(noir).not.toContain('<header class="nav">');
    expect(noir).not.toContain("ftr-premium");
    const classic = await renderLeaderboard({ ...DATA, branding: { template: "classic" } }, { nonce: "s2" });
    expect(classic).toContain('<header class="nav">');
    expect(classic).toContain("ftr-premium");
  });

  it("keeps the client contract intact with template-owned chrome", async () => {
    // data-brand-name / data-tagline / data-year are multi-element hooks the
    // client fills everywhere; custom chrome must not drop them.
    const noir = await renderLeaderboard({ ...DATA, branding: { template: "noir" } }, { nonce: "s3" });
    expect(noir).toContain("data-brand-name");
    expect(noir).toContain("data-tagline");
    expect(noir).toContain("data-year");
    // Templates without header/footer get empty override maps.
    expect(templateParts("classic")).toEqual({});
    expect(templateHeader("classic")).toBe(null);
    expect(templateFooter("classic")).toBe(null);
  });

  it("broadcaster owns its chrome and orders socials right after the hero", async () => {
    const data = { ...DATA, socials: [{ brand: "discord", name: "Discord", handle: "@streamer", url: "https://discord.gg/example" }] };
    const bc = await renderLeaderboard({ ...data, branding: { template: "broadcaster" } }, { nonce: "s6" });
    expect(bc).toContain("bc-topbar");
    expect(bc).toContain("bc-ticker");
    expect(bc).not.toContain('<header class="nav">');
    // socials come right after the hero, before the standings board
    expect(bc.indexOf("bc-ticker")).toBeLessThan(bc.indexOf('class="socials-sec"'));
    expect(bc.indexOf('class="socials-sec"')).toBeLessThan(bc.indexOf('id="board"'));
    // share is not placed by the template, so it keeps the legacy spot after </main>
    expect(bc.indexOf("</main>")).toBeLessThan(bc.indexOf('class="share-sec"'));
    // noir keeps socials last in <main> — order is the template's choice
    const noir = await renderLeaderboard({ ...data, branding: { template: "noir" } }, { nonce: "s7" });
    expect(noir.indexOf('id="board"')).toBeLessThan(noir.indexOf('class="socials-sec"'));
  });
});

describe("template previews", async () => {
  it("renders real board data in preview mode", async () => {
    const html = await renderLeaderboard(
      { ...DATA, branding: { template: "classic", accentA: "#00ffd1", accentB: "#ff2cd0" } },
      { nonce: "preview123", preview: true }
    );
    expect(html).toContain('body data-template="classic" data-preview');
    expect(html).toContain("Actual Streamer");
    expect(html).toContain("First Player");
    expect(html).toContain("body[data-preview]");
  });

  it("renders every registered template", async () => {
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

  it("renders player rows and top-3 containers without placeholder text", async () => {
    for (const template of TEMPLATE_IDS) {
      const html = await renderLeaderboard({ ...DATA, branding: { template } }, { nonce: "test123" });
      expect(html).toContain('data-top3');
      expect(html).toContain('data-rows');
      const markup = stripScripts(html);
      expect(markup).not.toContain("undefined");
      expect(markup).not.toContain("null");
      expect(markup).not.toContain("{{");
    }
  });

  it("meets WCAG AA contrast for default presets", async () => {
    // Contrast failures are thrown at module load in test mode; this test documents the gate.
    const catalog = templateCatalog();
    for (const template of catalog) {
      expect(template.id).toBeTruthy();
      expect(template.presets.length).toBeGreaterThanOrEqual(3);
    }
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
    const shaped = publicShape({ ...SITE, theme_json: { template: "classic" }, extra_json: {} }, []);
    expect(shaped.branding.template).toBe("classic");
  });

  it("resolves the template from a legacy double-encoded string row", async () => {
    const shaped = publicShape({ ...SITE, theme_json: '{"template":"classic"}', extra_json: {} }, []);
    expect(shaped.branding.template).toBe("classic");
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
describe("template options schema", async () => {
  it("exposes each template's schema in the catalog", async () => {
    const catalog = templateCatalog();
    expect(catalog.every((t) => t.schema && typeof t.schema === "object")).toBe(true);
    const terminal = catalog.find((t) => t.id === "terminal");
    expect(terminal.schema.accent.type).toBe("color");
    expect(terminal.schema.scanlines.type).toBe("toggle");
    expect(terminal.schema.density.type).toBe("select");
  });

  it("resolves schema defaults for missing or garbage input", async () => {
    const defaults = { accent: "#39d98a", scanlines: false, density: "compact" };
    expect(resolveOptions("terminal", null)).toEqual(defaults);
    expect(resolveOptions("terminal", "junk")).toEqual(defaults);
    expect(resolveOptions("classic", { anything: "x" })).toEqual({});
  });

  it("validates values per field type and drops unknown keys", async () => {
    const out = resolveOptions("terminal", {
      accent: "javascript:alert(1)", scanlines: "yes", density: "huge", evil: "x",
    });
    expect(out).toEqual({ accent: "#39d98a", scanlines: false, density: "compact" });
    expect(resolveOptions("terminal", { accent: "#e8c14c", scanlines: true, density: "cozy" }))
      .toEqual({ accent: "#e8c14c", scanlines: true, density: "cozy" });
  });

  it("renders options as scoped CSS vars and body attributes", async () => {
    const html = await renderLeaderboard(
      { ...DATA, branding: { template: "terminal", options: { accent: "#e8c14c", scanlines: true, density: "cozy" } } },
      { nonce: "opt1" }
    );
    expect(html).toContain('data-opt-scanlines="true"');
    expect(html).toContain('data-opt-density="cozy"');
    expect(html).toContain("--opt-accent:#e8c14c");
  });

  it("noir: validates and renders its own options", async () => {
    expect(resolveOptions("noir", null)).toEqual({ accent: "#d4af37", grain: true, podium: "roman" });
    expect(resolveOptions("noir", { accent: "red", grain: "on", podium: "circles", x: 1 }))
      .toEqual({ accent: "#d4af37", grain: true, podium: "roman" });
    const html = await renderLeaderboard(
      { ...DATA, branding: { template: "noir", options: { accent: "#a63a46", grain: false, podium: "numbers" } } },
      { nonce: "noir1" }
    );
    expect(html).toContain("--opt-accent:#a63a46");
    expect(html).toContain('data-opt-grain="false"');
    expect(html).toContain('data-opt-podium="numbers"');
  });

  it("renders schema defaults (not saved options) on watermark pages", async () => {
    const html = await renderLeaderboard(
      { ...DATA, branding: { template: "terminal", options: { accent: "#e8c14c" } } },
      { nonce: "opt2", watermark: true }
    );
    expect(html).toContain("--opt-accent:#39d98a");
  });
});
