// k6 load test script for YourRank (Phase 8.2)
// Run: k6 run --vus 50 --duration 60s docs/load-test.js
// Requires: k6 installed (https://k6.io)

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://yourrank.site";
const KNOWN_SLUG = __ENV.KNOWN_SLUG || "demo";

export const options = {
  stages: [
    { duration: "30s", target: 50 },  // Ramp up
    { duration: "60s", target: 50 },  // Stay at 50 VUs
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(99)<500"], // 99th percentile under 500ms
    http_req_failed: ["rate<0.01"],   // Less than 1% errors
  },
};

export default function () {
  // Test 1: Landing page
  const landing = http.get(`${BASE_URL}/`);
  check(landing, {
    "landing: status 200": (r) => r.status === 200,
    "landing: p99 < 500ms": (r) => r.timings.duration < 500,
  });

  // Test 2: Health endpoint
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    "health: status 200": (r) => r.status === 200,
    "health: has db=true": (r) => r.body.includes('"db":true'),
  });

  // Test 3: Redirect (hot path)
  const redirect = http.get(`${BASE_URL}/r/${KNOWN_SLUG}`, {
    redirects: "none",
  });
  check(redirect, {
    "redirect: status 302 or 404": (r) => [302, 404].includes(r.status),
    "redirect: p99 < 15ms": (r) => r.timings.duration < 15,
  });

  // Test 4: Public board API
  const board = http.get(`${BASE_URL}/${KNOWN_SLUG}/api/standings`);
  check(board, {
    "board: status 200 or 404": (r) => [200, 404].includes(r.status),
  });

  sleep(1);
}
