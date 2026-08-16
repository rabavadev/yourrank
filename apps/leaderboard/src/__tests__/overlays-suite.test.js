import { describe, it, expect, mock } from "bun:test";
import {
  handleOverlayPredictionPage,
  handleOverlayAlertsPage,
  handleGetActiveEvents,
} from "../handlers/overlays.js";

function mockEnv() {
  return { DB: {} };
}

const SITE = { id: "site-456", user_id: "user-123", slug: "streamer", name: "Streamer Hub" };

describe("OBS Live Overlays Suite", () => {
  it("renders transparent Prediction HUD overlay page with site slug", async () => {
    const deps = {
      one: mock().mockResolvedValueOnce(SITE),
    };

    const req = new Request("http://localhost/overlay/prediction?site=streamer");
    const res = await handleOverlayPredictionPage(req, mockEnv(), deps);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Live Prediction HUD");
    expect(html).toContain("hud-card");
    expect(html).toContain("streamer");
  });

  it("renders transparent Alerts overlay page with sound synthesizer", async () => {
    const deps = {
      one: mock().mockResolvedValueOnce(SITE),
    };

    const req = new Request("http://localhost/overlay/alerts?site=streamer");
    const res = await handleOverlayAlertsPage(req, mockEnv(), deps);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("Stream Alerts &amp; Sounds");
    expect(html).toContain("playAlertChime");
    expect(html).toContain("alert-container");
  });

  it("returns active prediction and latest alert data for overlay polling", async () => {
    const deps = {
      one: mock()
        .mockResolvedValueOnce(SITE) // find site
        .mockResolvedValueOnce({ id: "pred-1", title: "Win game?", status: "open", total_pool: 200 }) // active pred
        .mockResolvedValueOnce({ id: "red-1", username: "alice", title: "VIP Badge", created_at: new Date().toISOString() }), // latest redemption
      query: mock(),
    };

    const req = new Request("http://localhost/api/overlays/active-events?site=streamer");
    const res = await handleGetActiveEvents(req, mockEnv(), deps);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.activePrediction.title).toBe("Win game?");
    expect(body.latestAlert.username).toBe("alice");
  });
});
