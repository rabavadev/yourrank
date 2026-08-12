import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const TARGET_URL = String(__ENV.TARGET_URL || "").trim().replace(/\/+$/, "");
const BOARD_SLUG = String(__ENV.BOARD_SLUG || "").trim();
const STAGE = String(__ENV.STAGE || "").trim().toUpperCase();

if (!TARGET_URL) throw new Error("TARGET_URL is required; refusing to choose a target");
if (!BOARD_SLUG) throw new Error("BOARD_SLUG is required; refusing to choose a board");

const target = new URL(TARGET_URL);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("TARGET_URL must use http or https");
}
if (["yourrank.site", "www.yourrank.site"].includes(target.hostname.toLowerCase())) {
  throw new Error("Refusing to load-test the production hostname");
}
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalTarget = localHostnames.has(target.hostname.toLowerCase())
  || target.hostname.toLowerCase().endsWith(".localhost");
if (
  !isLocalTarget
  && String(__ENV.I_KNOW_THIS_IS_NOT_PRODUCTION || "").toLowerCase() !== "true"
) {
  throw new Error(
    "Custom domains require I_KNOW_THIS_IS_NOT_PRODUCTION=true; verify this is an isolated staging target",
  );
}

const stages = {
  T1: { target: 100, ramp: "30s", hold: "5m" },
  T2: { target: 250, ramp: "1m", hold: "10m" },
  T3: { target: 500, ramp: "2m", hold: "10m" },
  T4: { target: 1000, ramp: "3m", hold: "15m" },
  T5: { target: 2500, ramp: "5m", hold: "15m" },
  T6: { target: 5000, ramp: "5m", hold: "10m" },
  T7: { target: 10000, ramp: "10m", hold: "15m" },
};

function mixedStages() {
  const selected = STAGE && STAGE !== "ALL" ? stages[STAGE] : null;
  if (STAGE && !selected && STAGE !== "T0" && STAGE !== "ALL") {
    throw new Error(`Unknown STAGE ${STAGE}; use T0, T1-T7, or ALL`);
  }
  if (selected) {
    return [
      { duration: selected.ramp, target: selected.target },
      { duration: selected.hold, target: selected.target },
      { duration: "30s", target: 0 },
    ];
  }
  return Object.values(stages).flatMap(({ target: vus, ramp, hold }) => [
    { duration: ramp, target: vus },
    { duration: hold, target: vus },
  ]).concat({ duration: "30s", target: 0 });
}

function sseStages() {
  if (STAGE && STAGE !== "T0") throw new Error("SSE-only mode requires STAGE=T0");
  return [100, 250, 500, 1000].flatMap((target) => [
    { duration: "60s", target },
    { duration: "10m", target },
  ]).concat({ duration: "30s", target: 0 });
}

const boardRender = new Trend("board_render_duration", true);
const sseUnhealthy = new Rate("sse_unhealthy_rate");
const rateLimited = new Rate("rate_limited");

// k6 normally counts HTTP 429 responses as request failures. They are an
// expected capacity-shedding outcome for this harness, so exclude only 429
// from the built-in failure metric and track it separately below.
http.setResponseCallback((response) => (
  response.status === 429 || (response.status >= 200 && response.status < 400)
));

export const options = {
  stages: STAGE === "T0" ? sseStages() : mixedStages(),
  thresholds: {
    board_render_duration: ["p(95)<1500"],
    "http_req_failed{kind:regular}": ["rate<0.01"],
    sse_unhealthy_rate: ["rate<0.05"],
  },
};

const base = TARGET_URL;
const boardUrl = `${base}/${encodeURIComponent(BOARD_SLUG)}`;
const apiUrl = `${base}/api/public/${encodeURIComponent(BOARD_SLUG)}`;

function regularRequest(response, label, expected) {
  const limited = response.status === 429;
  rateLimited.add(limited, { surface: label });
  check(response, {
    [`${label}: expected status or limiter shed`]: (r) => limited || expected(r.status),
  }, { kind: "regular", surface: label });
}

function holdSse() {
  // A healthy stream stays open until timeout. Early non-zero closes indicate
  // reconnect pressure; status 0 at the timeout is expected for a held stream.
  const response = http.get(`${apiUrl}/stream`, {
    timeout: "35s",
    tags: { kind: "sse", surface: "sse" },
  });
  const earlyClose = response.status !== 0
    && (response.status !== 200 || response.timings.duration < 10000);
  sseUnhealthy.add(earlyClose);
  check(response, { "sse: opened": (r) => r.status === 200 || r.status === 0 }, { kind: "sse" });
}

export default function () {
  if (STAGE === "T0") {
    holdSse();
    return;
  }

  const board = http.get(boardUrl, { tags: { kind: "regular", surface: "board" } });
  boardRender.add(board.timings.duration);
  regularRequest(board, "board", (status) => status === 200);

  const pageTwo = http.get(`${apiUrl}/players?limit=100&offset=100`, {
    tags: { kind: "regular", surface: "pagination" },
  });
  regularRequest(pageTwo, "pagination", (status) => status === 200);

  const search = http.get(`${apiUrl}/players?limit=100&search=a`, {
    tags: { kind: "regular", surface: "search" },
  });
  regularRequest(search, "search", (status) => status === 200);

  const redirect = http.get(`${base}/go/${encodeURIComponent(BOARD_SLUG)}`, {
    redirects: "none",
    tags: { kind: "regular", surface: "redirect" },
  });
  regularRequest(redirect, "redirect", (status) => status >= 300 && status < 400);

  sleep(1);
  holdSse();
}
