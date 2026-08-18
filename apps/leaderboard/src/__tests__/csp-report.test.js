import { describe, expect, it, mock } from "bun:test";
import { handleCspReport } from "../handlers/csp-report.js";

const env = {};

function post(body) {
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function deps(rateLimit = async () => ({ ok: true })) {
  return { rateLimit, clientIp: () => "test-ip" };
}

describe("handleCspReport", () => {
  it("logs a normal report and always returns 204", async () => {
    const error = mock(() => {});
    const original = console.error;
    console.error = error;
    try {
      const response = await handleCspReport(post({
        "csp-report": {
          "document-uri": "https://example.test/page",
          "violated-directive": "script-src",
          "blocked-uri": "https://bad.test/script.js",
        },
      }), env, deps());
      expect(response.status).toBe(204);
      expect(error).toHaveBeenCalledTimes(1);
      expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({
        document_uri: "https://example.test/page",
        violated_directive: "script-src",
        blocked_uri: "https://bad.test/script.js",
      });
    } finally {
      console.error = original;
    }
  });

  it("does not log reports rejected by the IP rate limit", async () => {
    const error = mock(() => {});
    const original = console.error;
    console.error = error;
    try {
      const response = await handleCspReport(post({ "document-uri": "https://example.test/page" }), env, deps(async () => ({ ok: false })));
      expect(response.status).toBe(204);
      expect(error).not.toHaveBeenCalled();
    } finally {
      console.error = original;
    }
  });

  it("does not log oversized reports", async () => {
    const error = mock(() => {});
    const original = console.error;
    console.error = error;
    try {
      const response = await handleCspReport(post("x".repeat(8 * 1024 + 1)), env, deps());
      expect(response.status).toBe(204);
      expect(error).not.toHaveBeenCalled();
    } finally {
      console.error = original;
    }
  });

  it("truncates long logged fields", async () => {
    const error = mock(() => {});
    const original = console.error;
    console.error = error;
    try {
      const response = await handleCspReport(post({ "document-uri": "x".repeat(300) }), env, deps());
      expect(response.status).toBe(204);
      expect(JSON.parse(error.mock.calls[0][0]).document_uri).toHaveLength(256);
    } finally {
      console.error = original;
    }
  });
});
