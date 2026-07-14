// CSP Violation Report Handler (Phase 8.1)
// Receives CSP violation reports and logs them for monitoring.

import { json } from "../auth.js";

/**
 * POST /api/csp-report
 * Receives CSP violation reports from browsers.
 * Logs structured JSON for monitoring/alerting.
 */
export async function handleCspReport(request, _env) {
  try {
    const body = await request.text();
    let report;
    try {
      report = JSON.parse(body);
    } catch {
      return json({ ok: false, error: "invalid JSON" }, 400);
    }

    // Log the violation as structured JSON
    console.error(JSON.stringify({
      level: "error",
      worker: "leaderboard",
      msg: "csp_violation",
      document_uri: report["csp-report"]?.["document-uri"] || report["document-uri"],
      violated_directive: report["csp-report"]?.["violated-directive"] || report["violated-directive"],
      blocked_uri: report["csp-report"]?.["blocked-uri"] || report["blocked-uri"],
      source_file: report["csp-report"]?.["source-file"] || report["source-file"],
      line_number: report["csp-report"]?.["line-number"] || report["line-number"],
      ts: new Date().toISOString(),
    }));

    return json({ ok: true }, 204);
  } catch {
    return json({ ok: true }, 204);
  }
}
