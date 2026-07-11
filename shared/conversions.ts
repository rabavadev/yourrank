// Conversions data operations shared by the leaderboard and bot Workers.
import { exec, one } from "./db.js";

/**
 * Parsed query type for casino postbacks.
 */
export type PostbackQuery = Record<string, string | string[]>;

/**
 * Insert a conversion row from a casino postback. Shared by the legacy
 * GET|POST /pb/:key path (key in the URL, no signature), the signed
 * POST /pb path (key in X-Postback-Key header + HMAC in X-Postback-Signature),
 * and the leaderboard POST /api/postback endpoint.
 * `ownerId` is resolved by the caller; `q` is the parsed query object.
 */
export async function recordConversion(ownerId: string, q: PostbackQuery): Promise<void> {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const clickRef = first(q.click_ref) ?? first(q.clickid) ?? first(q.subid) ?? first(q.sub_id) ?? null;
  const event = (first(q.event) ?? first(q.goal) ?? "deposit").toLowerCase().slice(0, 32);
  // Clamp amount to a non-negative bounded number. Negatives / NaN / absurd
  // values feed revenue/conversion stats and could drive affiliate payouts.
  const rawAmt = first(q.amount) == null ? NaN : Number(first(q.amount));
  const amount = Number.isFinite(rawAmt) && rawAmt >= 0 && rawAmt <= 1e12 ? rawAmt : null;
  const currency = (first(q.currency) ?? "USD").toUpperCase().slice(0, 8);

  // Attribute to an offer via the click ref when possible.
  let offerId: string | null = null;
  if (clickRef) {
    const hit = await one<{ offer_id: string }>(
      `SELECT sl.offer_id FROM clicks cl
         JOIN short_links sl ON sl.id = cl.short_link_id
        WHERE cl.click_ref = $1 LIMIT 1`,
      [clickRef]
    );
    offerId = hit?.offer_id ?? null;
  }

  // BE-006: Idempotency guard — check for an existing conversion with the same
  // click_ref + event + amount to prevent duplicate postbacks from creating
  // duplicate rows (e.g. casino retries, webhook replays).
  if (clickRef) {
    const existing = await one<{ id: string }>(
      `SELECT id FROM conversions
       WHERE owner_id = $1 AND click_ref = $2 AND event = $3
         AND (($4::numeric IS NULL AND amount IS NULL) OR amount = $4)
       LIMIT 1`,
      [ownerId, clickRef, event, amount]
    );
    if (existing) return; // Already recorded — skip silently.
  }

  const raw = { ...q };
  if ("key" in raw) delete (raw as any).key;
  if ("signature" in raw) delete (raw as any).signature;

  // exec() — semantically a write/mutation, not a read query.
  // QA-003: ON CONFLICT DO NOTHING makes the INSERT idempotent.
  await exec(
    `INSERT INTO conversions (owner_id, offer_id, click_ref, event, amount, currency, raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING`,
    [ownerId, offerId, clickRef, event, amount, currency, JSON.stringify(raw)]
  );
}
