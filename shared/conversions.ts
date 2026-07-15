// Conversions data operations shared by the leaderboard and bot Workers.
import { withTransaction } from "./db.js";

/**
 * Parsed query type for casino postbacks.
 */
export type PostbackQuery = Record<string, string | string[]>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function normalizePlayerName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function eventToPlayerColumn(event: string): "wagered" | "prize" {
  const e = event.toLowerCase();
  if (["win", "prize", "withdrawal", "reward", "cashback", "payout"].includes(e)) {
    return "prize";
  }
  return "wagered";
}

function extractPlayerName(q: PostbackQuery): string | null {
  const raw = first(q.player) ?? first(q.username) ?? first(q.user) ?? first(q.player_name);
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

/**
 * Insert a conversion row from a casino postback and project it onto the
 * matching player row(s). Shared by the legacy GET|POST /pb/:key path, the
 * signed POST /pb path, and the leaderboard POST /api/postback endpoint.
 * `ownerId` is resolved by the caller; `q` is the parsed query object.
 *
 * C-02: Conversion amounts are idempotently projected onto `players` using the
 * same normalized-name identity as saveSite, so postbacks actually update ranks.
 */
export async function recordConversion(ownerId: string, q: PostbackQuery): Promise<void> {
  const clickRef = first(q.click_ref) ?? first(q.clickid) ?? first(q.subid) ?? first(q.sub_id) ?? null;
  const event = (first(q.event) ?? first(q.goal) ?? "deposit").toLowerCase().slice(0, 32);
  const rawAmt = first(q.amount) == null ? NaN : Number(first(q.amount));
  const amount = Number.isFinite(rawAmt) && rawAmt >= 0 && rawAmt <= 1e12 ? rawAmt : null;
  const currency = (first(q.currency) ?? "USD").toUpperCase().slice(0, 8);
  const playerName = extractPlayerName(q);
  const playerNormalized = playerName ? normalizePlayerName(playerName) : null;
  const column = eventToPlayerColumn(event);

  await withTransaction(async (tx) => {
    // Attribute to an offer via the click ref when possible.
    let offerId: string | null = null;
    if (clickRef) {
      const hit = await tx.one<{ offer_id: string }>(
        `SELECT sl.offer_id FROM clicks cl
           JOIN short_links sl ON sl.id = cl.short_link_id
          WHERE cl.click_ref = $1 LIMIT 1`,
        [clickRef]
      );
      offerId = hit?.offer_id ?? null;
    }

    // Idempotency guard inside the transaction so the projection is atomic
    // with the insert and a retry cannot double-apply a conversion.
    if (clickRef) {
      const existing = await tx.one<{ id: string }>(
        `SELECT id FROM conversions
         WHERE owner_id = $1 AND click_ref = $2 AND event = $3
           AND (($4::numeric IS NULL AND amount IS NULL) OR amount = $4)
         LIMIT 1`,
        [ownerId, clickRef, event, amount]
      );
      if (existing) return;
    }

    const raw: Record<string, unknown> = { ...q };
    if ("key" in raw) delete raw.key;
    if ("signature" in raw) delete raw.signature;

    await tx.unsafe(
      `INSERT INTO conversions (owner_id, offer_id, click_ref, event, amount, currency, raw, player_name, player_normalized)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [ownerId, offerId, clickRef, event, amount, currency, JSON.stringify(raw), playerName, playerNormalized]
    );

    if (playerNormalized) {
      // C-02: Try to map this conversion to the site the original click came
      // from via the player subscription. If we cannot, fall back to all sites
      // for this owner (the common single-board case).
      const siteHit = await tx.one<{ site_id: string }>(
        `SELECT ps.site_id
           FROM clicks cl
           JOIN player_subscriptions ps ON ps.tg_user_id = cl.tg_user_id
          WHERE cl.click_ref = $1
            AND normalize_player_name(ps.player_name) = $2
          LIMIT 1`,
        [clickRef, playerNormalized]
      );
      const targetSiteId: string | null = siteHit?.site_id ?? null;

      const upsert = await tx.unsafe(
        `WITH ins AS (
           INSERT INTO players (id, site_id, name, normalized_name, ${column}, updated_at, version)
           SELECT gen_random_uuid(), s.id, $2, $3, $4::numeric, now(), 1
             FROM sites s
            WHERE s.user_id = $1
              AND ($5::uuid IS NULL OR s.id = $5::uuid)
           ON CONFLICT (site_id, normalized_name) DO UPDATE
           SET ${column} = players.${column} + EXCLUDED.${column},
               updated_at = now(),
               version = players.version + 1
           RETURNING site_id
         )
         UPDATE sites SET updated_at = now() WHERE id IN (SELECT site_id FROM ins)`,
        [ownerId, playerName, playerNormalized, amount ?? 0, targetSiteId]
      );
      // `upsert` result is not needed; the side effect is the projection.
      void upsert;
    }
  });
}
