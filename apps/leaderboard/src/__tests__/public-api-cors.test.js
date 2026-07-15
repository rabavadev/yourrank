import { describe, expect, test } from "bun:test";
import { handlePublicApiPreflight, withPublicApiCors } from "../middleware/public-api.js";

describe("public API CORS", () => {
  test("allows browser reads and conditional requests", () => {
    const response = withPublicApiCors(
      new Response("ok", { headers: { etag: '"v1"' } }),
      "/api/public/example/players"
    );

    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-allow-methods")).toContain("GET");
    expect(response.headers.get("access-control-allow-headers")).toContain("If-None-Match");
    expect(response.headers.get("access-control-expose-headers")).toContain("ETag");
    expect(response.headers.get("etag")).toBe('"v1"');
  });

  test("allows signed score API headers", () => {
    const response = handlePublicApiPreflight("/api/scores");

    expect(response?.status).toBe(204);
    expect(response?.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
    expect(response?.headers.get("access-control-allow-headers")).toContain("X-Postback-Signature");
    expect(response?.headers.get("access-control-max-age")).toBe("86400");
  });

  test("does not add CORS to private dashboard APIs", () => {
    const response = new Response("private");

    expect(handlePublicApiPreflight("/api/site")).toBeNull();
    expect(withPublicApiCors(response, "/api/site")).toBe(response);
  });
});
