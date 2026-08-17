// CSP Violation Report Handler (Phase 8.1)
// Receives CSP violation reports and logs them for monitoring.

import { clientIp, rateLimit } from "../auth.js";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_FIELD_LENGTH = 256;

const emptyResponse = () => new Response(null, { status: 204 });

async function readBody(request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        continue;
      }
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

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
  } = deps;

  try {
    const ip = clientIpImpl(request);
    const rl = await rateLimitImpl(env, `csp-report:${ip}`, 20, 60);
    if (!rl.ok) return emptyResponse();

    const body = await readBody(request);
    if (body == null) return emptyResponse();

    let report;
    try {
      report = JSON.parse(body);
    } catch {
      return emptyResponse();
    }

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
