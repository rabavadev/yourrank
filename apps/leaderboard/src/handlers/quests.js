// Daily Quests & Streaks Engine Handlers.
import { ok, bad, readJson } from "../auth.js";
import {
  one as defaultOne,
  query as defaultQuery,
  withTransaction as defaultWithTransaction,
} from "../../../../shared/db.js";

const DEFAULT_DAILY_QUEST_TEMPLATES = [
  { quest_key: "watch_30m", title: "⏱️ Watch stream for 30 minutes", target_count: 30, reward_xp: 60, reward_points: 25 },
  { quest_key: "chat_5_msgs", title: "💬 Send 5 active chat messages", target_count: 5, reward_xp: 40, reward_points: 15 },
  { quest_key: "event_participate", title: "🔮 Enter a Prediction, Raffle or Wheel", target_count: 1, reward_xp: 50, reward_points: 30 },
];

/**
 * GET /api/quests/daily — Get today's quests and viewer progress
 */
export async function handleGetDailyQuests(request, env, deps = {}) {
  const {
    one = defaultOne,
    query = defaultQuery,
  } = deps;

  const url = new URL(request.url);
  const siteSlugOrId = url.searchParams.get("site") || url.searchParams.get("siteId");
  const viewerId = url.searchParams.get("viewerId");

  if (!siteSlugOrId) return bad("Site identifier is required.");

  const site = await one("SELECT id, name FROM sites WHERE slug=$1 OR id::text=$1", [siteSlugOrId]);
  if (!site) return bad("Site not found.", 404);

  // 1. Ensure today's quests exist
  let quests = await query(
    "SELECT id, quest_key, title, target_count, reward_xp, reward_points, active_date FROM daily_quests WHERE site_id=$1 AND active_date = CURRENT_DATE",
    [site.id]
  );

  if (!quests || quests.length === 0) {
    for (const tpl of DEFAULT_DAILY_QUEST_TEMPLATES) {
      await one(
        `INSERT INTO daily_quests (site_id, quest_key, title, target_count, reward_xp, reward_points, active_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
         ON CONFLICT (site_id, quest_key, active_date) DO NOTHING
         RETURNING id`,
        [site.id, tpl.quest_key, tpl.title, tpl.target_count, tpl.reward_xp, tpl.reward_points]
      );
    }
    quests = await query(
      "SELECT id, quest_key, title, target_count, reward_xp, reward_points, active_date FROM daily_quests WHERE site_id=$1 AND active_date = CURRENT_DATE",
      [site.id]
    );
  }

  // 2. Viewer Progress & Streak
  let viewerQuests = [];
  let streakInfo = { currentStreak: 1, longestStreak: 1, multiplier: 1.0 };

  if (viewerId) {
    const progressList = await query(
      `SELECT vq.quest_id, vq.current_progress, vq.completed, vq.claimed
         FROM viewer_daily_quests vq
         JOIN daily_quests dq ON dq.id = vq.quest_id
        WHERE dq.site_id=$1 AND vq.viewer_id=$2 AND dq.active_date = CURRENT_DATE`,
      [site.id, viewerId]
    );

    const progMap = new Map((progressList || []).map((p) => [p.quest_id, p]));

    viewerQuests = (quests || []).map((q) => {
      const p = progMap.get(q.id) || { current_progress: 0, completed: false, claimed: false };
      return {
        id: q.id,
        questKey: q.quest_key,
        title: q.title,
        targetCount: q.target_count,
        rewardXp: q.reward_xp,
        rewardPoints: q.reward_points,
        progress: p.current_progress || 0,
        completed: p.completed || false,
        claimed: p.claimed || false,
      };
    });

    const streak = await one(
      "SELECT current_streak, longest_streak, last_active_date FROM viewer_streaks WHERE site_id=$1 AND viewer_id=$2",
      [site.id, viewerId]
    );

    if (streak) {
      const mult = 1.0 + Math.min(0.5, (streak.current_streak - 1) * 0.05);
      streakInfo = {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        multiplier: parseFloat(mult.toFixed(2)),
      };
    }
  } else {
    viewerQuests = (quests || []).map((q) => ({
      id: q.id,
      questKey: q.quest_key,
      title: q.title,
      targetCount: q.target_count,
      rewardXp: q.reward_xp,
      rewardPoints: q.reward_points,
      progress: 0,
      completed: false,
      claimed: false,
    }));
  }

  return ok({
    quests: viewerQuests,
    streak: streakInfo,
  });
}

/**
 * POST /api/quests/claim — Viewer claims reward for completed quest
 */
export async function handleClaimQuestReward(request, env, deps = {}) {
  const {
    one = defaultOne,
    withTransaction = defaultWithTransaction,
  } = deps;

  const body = await readJson(request);
  const questId = String(body?.questId || "").trim();
  const viewerId = String(body?.viewerId || "").trim();

  if (!questId || !viewerId) {
    return bad("questId and viewerId are required.");
  }

  const quest = await one(
    "SELECT id, site_id, title, reward_xp, reward_points FROM daily_quests WHERE id=$1",
    [questId]
  );
  if (!quest) return bad("Quest not found.", 404);

  const siteViewer = await one("SELECT id, balance FROM site_viewers WHERE site_id=$1 AND viewer_id=$2", [quest.site_id, viewerId]);
  if (!siteViewer) return bad("Viewer not found on site.", 404);

  const vq = await one(
    "SELECT id, current_progress, completed, claimed FROM viewer_daily_quests WHERE quest_id=$1 AND viewer_id=$2",
    [questId, viewerId]
  );

  if (!vq || !vq.completed) {
    return bad("Quest is not yet completed!", 400);
  }
  if (vq.claimed) {
    return bad("You have already claimed this quest reward today!", 400);
  }

  const outcome = await withTransaction(async (tx) => {
    await tx.unsafe("UPDATE viewer_daily_quests SET claimed=true, updated_at=now() WHERE id=$1", [vq.id]);

    if (quest.reward_points > 0) {
      await tx.unsafe(
        "UPDATE site_viewers SET balance = balance + $1, total_earned = total_earned + $1, updated_at=now() WHERE id=$2",
        [quest.reward_points, siteViewer.id]
      );

      await tx.unsafe(
        `INSERT INTO credit_ledger (site_viewer_id, type, amount, description)
         VALUES ($1, 'reward', $2, $3)`,
        [siteViewer.id, quest.reward_points, `Daily Quest Claim: ${quest.title}`]
      );
    }

    return {
      newBalance: (siteViewer.balance || 0) + quest.reward_points,
    };
  });

  return ok({
    questId,
    rewardXp: quest.reward_xp,
    rewardPoints: quest.reward_points,
    newBalance: outcome.newBalance,
    message: `🎉 Quest claimed! +${quest.reward_xp} XP & +${quest.reward_points} credits!`,
  });
}

/**
 * POST /api/quests/progress — Track activity progress for viewer
 */
export async function handleTrackQuestProgress(request, env, deps = {}) {
  const {
    one = defaultOne,
    withTransaction = defaultWithTransaction,
  } = deps;

  const body = await readJson(request);
  const siteId = String(body?.siteId || "").trim();
  const viewerId = String(body?.viewerId || "").trim();
  const questKey = String(body?.questKey || "").trim();
  const amount = Math.max(1, parseInt(body?.amount, 10) || 1);

  if (!siteId || !viewerId || !questKey) return bad("siteId, viewerId, and questKey are required.");

  const quest = await one(
    "SELECT id, target_count FROM daily_quests WHERE site_id=$1 AND quest_key=$2 AND active_date = CURRENT_DATE",
    [siteId, questKey]
  );
  if (!quest) return ok({ message: "No active quest for this key today." });

  const siteViewer = await one("SELECT id FROM site_viewers WHERE site_id=$1 AND viewer_id=$2", [siteId, viewerId]);
  if (!siteViewer) return bad("Viewer not found.", 404);

  const result = await withTransaction(async (tx) => {
    let vq = await tx.one(
      "SELECT id, current_progress, completed FROM viewer_daily_quests WHERE quest_id=$1 AND viewer_id=$2 FOR UPDATE",
      [quest.id, viewerId]
    );

    if (!vq) {
      vq = await tx.one(
        `INSERT INTO viewer_daily_quests (quest_id, site_viewer_id, viewer_id, current_progress, completed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, current_progress, completed`,
        [quest.id, siteViewer.id, viewerId, amount, amount >= quest.target_count]
      );
    } else if (!vq.completed) {
      const newProg = vq.current_progress + amount;
      const isComplete = newProg >= quest.target_count;
      await tx.unsafe(
        "UPDATE viewer_daily_quests SET current_progress=$1, completed=$2, updated_at=now() WHERE id=$3",
        [newProg, isComplete, vq.id]
      );
      vq.current_progress = newProg;
      vq.completed = isComplete;
    }

    return vq;
  });

  return ok({ questId: quest.id, progress: result.current_progress, completed: result.completed });
}
