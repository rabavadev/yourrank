// Unit tests for the withHandler middleware.
// Verifies that unexpected throws are caught and returned as JSON 500,
// and that normal responses pass through unchanged.
//
// Run: bun test src/__tests__/handler.test.js

import { test, expect, describe } from "bun:test";
import { withHandler } from "../middleware/handler.js";

// withHandler only imports { bad } from "../auth.js".
// auth.js loads fine in the bun test environment now that postgres is installed
// and session.js is plain CJS. No mocks needed for this test file.

describe("withHandler", () => {
  test("passes response through when handler succeeds", async () => {
    const handler = withHandler(async (_req, _env) => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const req = new Request("https://example.com/");
    const res = await handler(req, {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("converts an unexpected throw into a JSON 500", async () => {
    const handler = withHandler(async (_req, _env) => {
      throw new Error("something exploded");
    });

    const req = new Request("https://example.com/");
    const res = await handler(req, {});
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(typeof body.error).toBe("string");
    expect(body.error.length).toBeGreaterThan(0);
  });

  test("converts a thrown string into a JSON 500", async () => {
    const handler = withHandler(async () => {
      throw "plain string throw";
    });

    const res = await handler(new Request("https://example.com/"), {});
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test("converts a thrown non-Error object into a JSON 500", async () => {
    const handler = withHandler(async () => {
      throw { code: "INTERNAL", reason: "bad state" };
    });

    const res = await handler(new Request("https://example.com/"), {});
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test("does NOT catch errors returned as Response bodies (only thrown)", async () => {
    // Handlers that return bad(..., 400) explicitly should pass through unchanged.
    const handler = withHandler(async (_req, _env) => {
      return new Response(JSON.stringify({ ok: false, error: "bad input" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    });

    const res = await handler(new Request("https://example.com/"), {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("bad input");
  });

  test("forwards request and env to the inner handler", async () => {
    const handler = withHandler(async (req, env) => {
      return new Response(JSON.stringify({ url: req.url, key: env.KEY }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const req = new Request("https://example.com/test");
    const res = await handler(req, { KEY: "value" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe("https://example.com/test");
    expect(body.key).toBe("value");
  });
});
