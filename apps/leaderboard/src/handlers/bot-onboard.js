// One-paste bot onboarding handler (Phase 5.2)
// Streamlined flow: paste token → validate → create bot → set webhook → generate link

import { requireUser, json, bad, readJson, rateLimit } from "../auth.js";
import { trackActivation } from "../../../../shared/activation-funnel.js";
import { one, query } from "../../../../shared/db.js";
import { randomBytes } from "node:crypto";

/**
 * POST /api/bot/onboard
 * One-paste bot onboarding. Validates token, creates bot record, sets webhook.
 * Body: { token: string }
 * Returns: { ok, botId, botName, botUsername, webhookUrl }
 */
export async function handleBotOnboard(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);

    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const token = String(body.token || "").trim();

    // Basic format check
    if (!/^\d{8,}:[A-Za-z0-9_-]{30,}$/.test(token)) {
      return bad("That doesn't look like a valid bot token. Copy the full string from BotFather.");
    }

    if (!(await rateLimit(env, `bot-onboard:${user.id}`, 10, 3600)).ok) {
      return bad("Too many attempts. Try again later.", 429);
    }

    // Step 1: Validate token via Telegram getMe
    let meData;
    try {
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        signal: AbortSignal.timeout(10_000),
      });
      meData = await meRes.json();
    } catch (e) {
      return bad("Couldn't reach Telegram. Try again in a moment.", 502);
    }
    if (!meData.ok) {
      return bad("Telegram says this token is invalid. Double-check it from BotFather.");
    }

    const botTelegramId = meData.result.id;
    const botName = meData.result.first_name || "Bot";
    const botUsername = meData.result.username || "";

    // Step 2: Check if this bot is already connected (by telegram bot id)
    const existing = await one(
      "SELECT id, owner_id, status FROM bots WHERE telegram_bot_id = $1",
      [botTelegramId]
    );

    if (existing) {
      if (existing.owner_id === user.id) {
        return bad("You've already connected this bot.", 409);
      }
      return bad("This bot is already connected to another account.", 409);
    }

    // Step 3: Generate webhook secret and create bot record
    const webhookSecret = randomBytes(24).toString("hex");
    const botId = randomBytes(16).toString("hex");

    await query(
      `INSERT INTO bots (id, owner_id, telegram_bot_id, bot_username, bot_name, webhook_secret, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', now(), now())`,
      [botId, user.id, botTelegramId, botUsername, botName, webhookSecret]
    );

    // Step 4: Set the webhook
    const webhookUrl = `https://yourrank.site/hook/${webhookSecret}`;
    try {
      const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          secret_token: webhookSecret,
        }),
      });
      const whData = await whRes.json();
      if (!whData.ok) {
        // Bot created but webhook failed — still return success with a warning
        return json({
          ok: true,
          botId,
          botName,
          botUsername,
          webhookUrl,
          warning: `Webhook setup failed: ${whData.description || "unknown error"}. You can retry from the dashboard.`,
        });
      }
    } catch (e) {
      return json({
        ok: true,
        botId,
        botName,
        botUsername,
        webhookUrl,
        warning: "Couldn't set the webhook. You can retry from the dashboard.",
      });
    }

    // Step 5: Get or create a default tracked link for the user
    const defaultLink = await one(
      "SELECT id, slug FROM sites WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    let trackedLink = null;
    if (defaultLink) {
      trackedLink = `https://yourrank.site/r/${defaultLink.slug}`;
    }

    trackActivation("leaderboard", user.id, "bot_connected", { botId, botUsername });

    return json({
      ok: true,
      botId,
      botName,
      botUsername,
      webhookUrl,
      trackedLink,
      message: trackedLink
        ? `Bot @${botUsername} is live! Share this link: ${trackedLink}`
        : `Bot @${botUsername} is live! Create a leaderboard to get a tracked link.`,
    });
  } catch (e) {
    console.error("bot onboard failed:", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}
