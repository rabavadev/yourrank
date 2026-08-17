// CSP Violation Report Handler (Phase 8.1)
// Receives CSP violation reports and logs them for monitoring.

import { clientIp, rateLimit, readJsonLimited } from "../auth.js";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_FIELD_LENGTH = 256;

const emptyResponse = () => new Response(null, { status: 204 });

function field(value) {
  return value == null ? undefined : String(value).slice(0, MAX_FIELD_LENGTH);
}

/**
 * POST /api/csp-report
 * Receives CSP violation reports from browsers.
 * Logs structured JSON for monitoring/alerting.
 */
export async function handleCspReport(request, env, deps = {}) {
  const {
    rateLimit: rateLimitImpl = rateLimit,
    clientIp: clientIpImpl = clientIp,
    readJsonLimited: readJsonLimitedImpl = readJsonLimited,
  } = deps;

  try {
    const ip = clientIpImpl(request);
    const rl = await rateLimitImpl(env, `csp-report:${ip}`, 20, 60);
    if (!rl.ok) return emptyResponse();

    const { value: report } = await readJsonLimitedImpl(request, MAX_BODY_BYTES);
    if (!report || typeof report !== "object") return emptyResponse();

    // Log the violation as structured JSON
    console.error(JSON.stringify({
      level: "error",
      worker: "leaderboard",
      msg: "csp_violation",
      document_uri: field(report["csp-report"]?.["document-uri"] || report["document-uri"]),
      violated_directive: field(report["csp-report"]?.["violated-directive"] || report["violated-directive"]),
      blocked_uri: field(report["csp-report"]?.["blocked-uri"] || report["blocked-uri"]),
      source_file: field(report["csp-report"]?.["source-file"] || report["source-file"]),
      line_number: field(report["csp-report"]?.["line-number"] || report["line-number"]),
      ts: new Date().toISOString(),
    }));

    return emptyResponse();
  } catch {
    return emptyResponse();
  }
}
