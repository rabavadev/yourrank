import { describe, expect, it } from "bun:test";
import { decideBoardView } from "../board-views.js";

const hashToken = async (value: string) => `hash:${value}`;

describe("decideBoardView", () => {
  it("does not track a view without analytics consent", async () => {
    const result = await decideBoardView({
      request: new Request("https://example.com/board"),
      siteId: "site-1",
      slug: "board",
      hashToken,
      createVisitorId: () => "visitor-1",
    });

    expect(result).toEqual({
      allowed: false,
      shouldBump: false,
      visitorHash: null,
      referer: "",
      setCookies: [],
    });
  });

  it("mints the visitor and dedupe cookies for the first view", async () => {
    const result = await decideBoardView({
      request: new Request("https://example.com/board", {
        headers: { cookie: "yr_consent=all", referer: "https://ref.example/" },
      }),
      siteId: "site-1",
      slug: "board",
      hashToken,
      createVisitorId: () => "visitor-1",
    });

    expect(result).toEqual({
      allowed: true,
      shouldBump: true,
      visitorHash: "hash:visitor-1:site-1",
      referer: "https://ref.example/",
      setCookies: [
        "yr_vid=visitor-1; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
        "__v_board=1; Path=/board; Max-Age=86400; SameSite=Lax; Secure",
      ],
    });
  });

  it("does not bump a repeat view within the dedupe window", async () => {
    const result = await decideBoardView({
      request: new Request("https://example.com/board", {
        headers: { cookie: "yr_consent=all; yr_vid=visitor-1; __v_board=1" },
      }),
      siteId: "site-1",
      slug: "board",
      hashToken,
      createVisitorId: () => "unused",
    });

    expect(result).toEqual({
      allowed: true,
      shouldBump: false,
      visitorHash: "hash:visitor-1:site-1",
      referer: "",
      setCookies: [],
    });
  });
});
