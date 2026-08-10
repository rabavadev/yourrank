// Boot metadata reaches href/src attributes through the DOM, so every URL is
// validated against an allow-list before it is rendered.
import { describe, expect, test } from "bun:test";
import { safeImageUrl, safePath } from "../games/url.ts";

describe("safePath", () => {
  test("keeps site-relative paths", () => {
    expect(safePath("/acme", "/")).toBe("/acme");
    expect(safePath("/acme/credits?tab=shop#top", "/")).toBe("/acme/credits?tab=shop#top");
  });

  test("rejects scripts, schemes, protocol-relative and non-strings", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "//evil.example.com/acme",
      "https://evil.example.com",
      "acme",
      "",
      null,
      undefined,
      42,
    ]) {
      expect(safePath(bad, "/fallback")).toBe("/fallback");
    }
  });
});

describe("safeImageUrl", () => {
  test("allows relative paths and https hosts", () => {
    expect(safeImageUrl("/assets/logo.png")).toBe("/assets/logo.png");
    expect(safeImageUrl("https://cdn.example.com/logo.png")).toBe("https://cdn.example.com/logo.png");
  });

  test("rejects anything else", () => {
    expect(safeImageUrl("http://cdn.example.com/logo.png")).toBeNull();
    expect(safeImageUrl("javascript:alert(1)")).toBeNull();
    expect(safeImageUrl("//evil.example.com/logo.png")).toBeNull();
    expect(safeImageUrl(null)).toBeNull();
  });
});
