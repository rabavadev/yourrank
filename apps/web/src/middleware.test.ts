import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

test("redirects unmarked app and next hosts to the apex", () => {
  for (const host of ["app.yourrank.site", "next.yourrank.site"]) {
    const response = middleware(new NextRequest(`https://${host}/dashboard?tab=1`, {
      headers: { host },
    }));
    assert.equal(response.status, 301);
    assert.equal(
      response.headers.get("location"),
        "https://yourrank.site/dashboard?tab=1",
      );
  }
});

test("serves marked requests without redirecting", () => {
  const response = middleware(
    new NextRequest("https://app.yourrank.site/?utm_source=apex", {
      headers: { "x-yr-marketing": "1" },
    }),
  );
  assert.equal(response.status, 200);
});
