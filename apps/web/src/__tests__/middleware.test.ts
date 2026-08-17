/// <reference types="@types/bun" />

import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("frontend host policy", () => {
  it("redirects unmarked app and next hosts to the apex", () => {
    for (const host of ["app.yourrank.site", "next.yourrank.site"]) {
      const response = middleware(new NextRequest(`https://${host}/dashboard?tab=1`, {
        headers: { host },
      }));
      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(
        "https://yourrank.site/dashboard?tab=1",
      );
    }
  });

  it("serves marked requests without redirecting", () => {
    const response = middleware(
      new NextRequest("https://app.yourrank.site/?utm_source=apex", {
        headers: { "x-yr-marketing": "1" },
      }),
    );
    expect(response.status).toBe(200);
  });
});
