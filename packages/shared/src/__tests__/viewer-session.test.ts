import { describe, expect, it } from "bun:test";
import {
  resolveViewerSession,
  VIEWER_SESSION_ROTATE_AFTER_S,
  VIEWER_SESSION_ROTATE_GRACE_S,
} from "../viewer-session";

const request = (token: string) => new Request("https://example.com", {
  headers: { cookie: `yr_viewer=${token}` },
});

describe("viewer session rotation grace", () => {
  it("resolves a previous token without rotating it again", async () => {
    let phase = "current";
    let rotations = 0;
    const result = await resolveViewerSession(request("old-token"), {}, {
      query: async () => phase === "expired" ? [] : [{
        viewer_id: "viewer-1",
        age: phase === "current" ? VIEWER_SESSION_ROTATE_AFTER_S + 1 : 0,
        is_current: phase === "current",
      }],
      exec: async (sql) => {
        if (sql.includes("SET token =")) {
          rotations += 1;
          phase = "previous";
          return [{ token: "rotated" }];
        }
        return [];
      },
    });

    expect(result.viewerId).toBe("viewer-1");
    expect(result.cookie).not.toBeNull();

    const graceHit = await resolveViewerSession(request("old-token"), {}, {
      query: async () => [{
        viewer_id: "viewer-1",
        age: 0,
        is_current: false,
      }],
      exec: async (sql) => {
        if (sql.includes("SET token =")) rotations += 1;
        return [];
      },
    });

    expect(graceHit.viewerId).toBe("viewer-1");
    expect(graceHit.cookie).toBeNull();
    expect(rotations).toBe(1);
  });

  it("rejects a previous token after the grace window", async () => {
    const result = await resolveViewerSession(request("old-token"), {}, {
      query: async (_sql, params) => {
        expect(params[1]).toBe(VIEWER_SESSION_ROTATE_GRACE_S);
        return [];
      },
      exec: async () => [],
    });

    expect(result.viewerId).toBeNull();
    expect(result.cookie).toBeNull();
  });
});
