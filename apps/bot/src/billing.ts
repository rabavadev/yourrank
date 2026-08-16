import { query } from "@yourrank/shared/db";

/**
 * Subscription expiry management.
 *
 * Downgrade users whose paid period has ended and who have no active
 * subscription row. This is a safety net; the plan limit helpers also check
 * expiry on every request.
 */
export async function downgradeExpired(): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE users u SET plan = 'free', updated_at = now()
      WHERE u.plan <> 'free'
        AND (u.plan_expires_at IS NULL OR u.plan_expires_at <= now())
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions s
           WHERE s.user_id = u.id AND s.status = 'active'
             AND s.current_period_end > now()
        )
      RETURNING u.id`
  );
  return rows.length;
}
