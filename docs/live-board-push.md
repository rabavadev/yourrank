# Live-board stream controls

The public stream keeps its existing unnamed SSE message contract:
`{ players, total, updatedAt }`, limited to the first 100 players. Push is
disabled by default until it has been measured in staging and enabled
deliberately.

These are Wrangler variables, so operators can change them in the Worker
environment without changing application code or the wire format:

| Variable | Default | Purpose |
| --- | --- | --- |
| `LIVE_BOARD_PUSH_ENABLED` | `false` | When `true`, routes each board's stream through its board Durable Object. When `false`, the existing per-connection polling path is used. |
| `LIVE_BOARD_FALLBACK_POLL_MS` | `60000` | Durable Object self-healing poll interval while a board has subscribers. The poll re-checks authorization and visibility as well as board data. |
| `LIVE_BOARD_MAX_SUBSCRIBERS` | `10000` | Maximum concurrent SSE subscribers for one board Durable Object. Additional connections receive `503` and `Retry-After: 30`. |
| `LIVE_BOARD_STREAM_KILL_SWITCH` | `false` | When `true`, all public SSE connections receive `503` and `Retry-After: 30`, causing clients to use their existing backoff rather than holding streams open. |

The per-IP stream connection rate limit remains in force regardless of these
settings. Push notifications are best-effort: a notification failure never
fails or delays the database write. The Durable Object's bounded fallback poll
covers writes that cannot send a board-specific notification, including queued
bot conversions whose queue payload does not contain `siteId`.

When a writer sends a version newer than the read returned through Hyperdrive,
the Durable Object retries with bounded backoff rather than broadcasting stale
data as the update. After the bounded retry window, the ordinary fallback poll
remains the recovery path.

## Rollout

1. Measure the existing stream and database load in staging.
2. Enable `LIVE_BOARD_PUSH_ENABLED=true` for staging.
3. Exercise fan-out, authorization changes, subscriber caps, and notification
   loss before production.
4. Enable the same variable in production deliberately.
5. Set `LIVE_BOARD_STREAM_KILL_SWITCH=true` if an incident requires SSE to be
   shed without a code deployment.
