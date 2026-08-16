import { describe, expect, it, spyOn } from "bun:test";
import {
  logPostbackIntake,
  unsignedPostbacksEnabled,
} from "../postback.js";

describe("postback sunset policy", () => {
  it("keeps unsigned postbacks enabled unless explicitly disabled", () => {
    expect(unsignedPostbacksEnabled()).toBe(true);
    expect(unsignedPostbacksEnabled("true")).toBe(true);
    expect(unsignedPostbacksEnabled("false")).toBe(false);
    expect(unsignedPostbacksEnabled("0")).toBe(false);
  });

  it("emits structured signed-versus-unsigned intake telemetry", () => {
    const info = spyOn(console, "info").mockImplementation(() => {});
    logPostbackIntake("pb_legacy", { id: "key-1", userId: "user-1" }, false);

    const event = JSON.parse(String(info.mock.calls[0][0]));
    expect(event).toMatchObject({
      event: "postback_intake",
      path: "pb_legacy",
      signed: false,
      owner_id: "user-1",
      key_id: "key-1",
    });
    info.mockRestore();
  });
});
