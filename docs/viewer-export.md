# Viewer export artifact

Viewer exports are separate from streamer/account exports. A viewer must be
authenticated with the `yr_viewer` session cookie; `public_token`, usernames,
provider IDs supplied by the client, and other viewer-supplied identifiers are
never authorization inputs.

The export is queued, written as an NDJSON artifact in R2, and downloaded only
after the Worker re-checks that the authenticated viewer owns the job. It
expires after seven days. One pending or processing export is reused, and
creation is limited to two requests per viewer per hour. Status and download
requests are limited to 60 per viewer per minute.

## Collections

The viewer artifact contains only the requesting viewer's records:

- `exportedAt`
- `viewer`
- `sites` — only site slug, name, and channel name for context
- `siteViewers` — the viewer's balances and site relationship
- `creditLedger` — the viewer's own ledger rows with allowlisted metadata
- `redemptions` — the viewer's own redemptions with item context
- `gameRounds` — the viewer's own rounds with allowlisted JSON fields
- `gameSeeds` — public current fairness fields only
- `gameSeedReveals` — intentionally revealed historical seeds
- `kickRewardEvents` — sanitized events attributable to the viewer's Kick ID
- `viewerUsernameHistory`
- `viewerFeedback` — the viewer's own messages without `ip_hash`

The artifact has a first-line manifest and a final `complete: true` trailer.
The trailer's row counts are authoritative; a missing trailer means the
artifact is incomplete.

## Deliberate exclusions

The following are intentionally absent:

- `viewer_sessions`, session tokens, and token hashes: authentication
  credentials.
- `site_viewers.public_token`: a site-specific bearer credential.
- Kick and Discord OAuth access or refresh tokens, including encrypted values.
- Active `game_seeds.server_seed`: unrevealed provably-fair game material.
- Raw `kick_reward_events.payload`: provider payloads may contain unrelated
  third-party data.
- `provider_events`: raw, difficult-to-attribute provider callbacks.
- `site_visitors`: browser-level pseudonymous identifiers are not viewer-owned
  records.
- `viewer_feedback.ip_hash`: an unnecessary tracking derivative.
- Other viewers' identity, balances, ledger entries, redemptions, or games.
- Streamer business data such as shop catalogs, reward mappings, game settings,
  stream integrations, and site-wide analytics.
- `player_subscriptions`: the current product has no verified
  Telegram-to-viewer identity link. This is a known scope gap, not an
  accidental omission.
