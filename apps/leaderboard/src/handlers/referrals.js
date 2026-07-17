// Referral dashboard API: returns the authenticated user's referral link and stats.
import { requireUser, json, bad } from "../auth.js";
import { query, one } from "../../../../shared/db.js";
import { PLAN_PRICES } from "../../../../shared/plans.js";

const REWARD_DAYS = 31;

export async function handleReferrals(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (!user.referral_code) {
      await one("UPDATE users SET referral_code=LOWER(SUBSTRING(id::text FROM 1 FOR 8)) WHERE id=$1 AND referral_code IS NULL", [user.id]);
      user.referral_code = await one("SELECT referral_code FROM users WHERE id=$1", [user.id]).then(r => r?.referral_code);
    }
    const url = new URL(request.url);
    const code = user.referral_code;
    const link = `${url.origin}/ref/${encodeURIComponent(code)}`;

    const rows = await query(
      `SELECT COUNT(*)::int AS count, COALESCE(SUM(reward_days), 0) AS total_days
         FROM referral_rewards WHERE referrer_id=$1`,
      [user.id]
    );
    const count = rows?.[0]?.count || 0;
    const totalDays = rows?.[0]?.total_days || 0;
    // Approximate saved value: count × monthly Pro price prorated to reward days.
    const monthlyPro = PLAN_PRICES.pro;
    const saved = Math.round((count * REWARD_DAYS * monthlyPro) / 30);

    return json({
      ok: true,
      code,
      link,
      count,
      totalDays,
      savedUsd: saved,
    });
  } catch (e) {
    console.error("[handleReferrals] failed:", String(e?.message || e));
    return bad("Could not load referrals.", 500);
  }
}
