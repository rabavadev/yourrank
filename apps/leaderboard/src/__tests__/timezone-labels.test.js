import { describe, expect, it, beforeAll } from "bun:test";

let timeZoneOffsetLabel, timeZoneLabel, toLocalInput, fromLocalInput;

beforeAll(async () => {
  globalThis.document = { querySelector: () => null };
  ({ timeZoneOffsetLabel, timeZoneLabel, toLocalInput, fromLocalInput } = await import("../assets/dashboard/utils.js"));
});

describe("timezone labels and datetime-local conversion", () => {
  for (const timeZone of ["Europe/Paris", "America/New_York", "UTC"]) {
    it(`round-trips wall-clock input in ${timeZone}`, () => {
      for (const value of ["2026-07-15T20:00", "2026-01-15T20:00"]) {
        const iso = fromLocalInput(value, timeZone);
        expect(toLocalInput(iso, timeZone)).toBe(value);
      }
    });
  }

  it("round-trips instants on either side of the Paris DST switch", () => {
    for (const iso of ["2026-03-29T00:30:00.000Z", "2026-03-29T02:30:00.000Z"]) {
      expect(fromLocalInput(toLocalInput(iso, "Europe/Paris"), "Europe/Paris")).toBe(iso);
    }
  });

  it("derives the offset from the displayed instant", () => {
    expect(timeZoneOffsetLabel("2026-07-15T12:00:00.000Z", "Europe/Paris")).toBe("UTC+02:00");
    expect(timeZoneOffsetLabel("2026-01-15T12:00:00.000Z", "Europe/Paris")).toBe("UTC+01:00");
    expect(timeZoneLabel("2026-07-15T12:00:00.000Z", "Europe/Paris")).toBe("Europe/Paris (UTC+02:00)");
  });

  it("does not fabricate timezone values for invalid or unavailable inputs", () => {
    expect(timeZoneOffsetLabel("not-a-date", "Europe/Paris")).toBe("");
    expect(timeZoneOffsetLabel("", "Europe/Paris")).toBe("");
    expect(timeZoneLabel("not-a-date", "")).toBe("");
    expect(toLocalInput("", "Europe/Paris")).toBe("");
    expect(fromLocalInput("", "Europe/Paris")).toBe("");
  });
});
