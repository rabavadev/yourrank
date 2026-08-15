import { describe, expect, it } from "bun:test";
import { requestPublicationChange } from "../assets/dashboard/publication.js";

function response(body, ok = true) {
  return { ok, json: async () => body };
}

describe("dashboard publication command", () => {
  it("publishes through the dedicated finish endpoint", async () => {
    const calls = [];
    const result = await requestPublicationChange({
      published: true,
      siteId: "site-1",
      csrfToken: "csrf",
      fetchImpl: async (...args) => {
        calls.push(args);
        return response({ ok: true, publishedAt: "2026-08-14T12:00:00.000Z" });
      },
    });

    expect(result.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("/api/site/finish");
    expect(calls[0][1].method).toBe("POST");
    expect(calls[0][1].headers["x-csrf-token"]).toBe("csrf");
    expect(JSON.parse(calls[0][1].body)).toEqual({ siteId: "site-1" });
  });

  it("unpublishes without replacing unrelated site data", async () => {
    const calls = [];
    await requestPublicationChange({
      published: false,
      siteId: "site-1",
      expectedUpdatedAt: "2026-08-14T11:00:00.000Z",
      fetchImpl: async (...args) => {
        calls.push(args);
        return response({ ok: true });
      },
    });

    expect(calls[0][0]).toBe("/api/site");
    expect(calls[0][1].method).toBe("PUT");
    expect(JSON.parse(calls[0][1].body)).toEqual({
      siteId: "site-1",
      published: false,
      expectedUpdatedAt: "2026-08-14T11:00:00.000Z",
    });
  });

  it("returns the server's actionable failure", async () => {
    await expect(requestPublicationChange({
      published: true,
      fetchImpl: async () => response({ ok: false, error: "Add a site name first." }, false),
    })).rejects.toThrow("Add a site name first.");
  });
});
