# Per-tenant request metrics

When enabled with `REQUEST_METRICS=true`, the leaderboard Worker emits one
structured `request_metrics` log line after each request. The explicit wrapper
option and this environment flag can disable emission without a code change.
The fields are:

- `site`: public board slug when the request is tenant-scoped (no viewer ID,
  email, player name, cookie, or secret is included).
- `route`: normalized route template without tenant or player path values;
  unrecognised paths are grouped as `other` to keep cardinality bounded.
- `db_queries`: SQL statements issued by the shared database layer, including
  transaction statements and retry attempts.
- `duration_ms`: wall-clock request duration.
- `cache`: `hit`, `miss`, or `bypass` for the public HTML cache.
- `payload_bytes`: rendered public HTML byte length when applicable.

These are console JSON logs, so query them through the Worker’s existing
Cloudflare Logs/observability view. For example, filter `msg =
"request_metrics"` and `worker = "leaderboard"`, then group by `site` and
`route`. Average or percentile `duration_ms`, sum `db_queries`, and inspect
`cache` and `payload_bytes` to answer per-tenant capacity questions. Requests
without a public board site use `site: null`; all fields are safe operational
metadata rather than user identifiers.
