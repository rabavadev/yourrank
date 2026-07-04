// Bot connection handler
import { requireUser, json, bad, readJson, rateLimit } from "../auth.js";
import { one } from "../../../../shared/db.js";

// POST /api/bot/connect — validate a Telegram bot token via getMe, then set the webhook.
export async function handleBotConnect(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);

    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const token = String(body.token || "").trim();
    // Basic format check: digits:alphanumeric
    if (!/^\d{8,}:[A-Za-z0-9_-]{30,}$/.test(token)) return bad("That doesn't look like a valid bot token. Copy the full string from BotFather.");

    if (!(await rateLimit(env, `bot-connect:${user.id}`, 5, 3600))) return bad("Too many attempts. Try again later.", 429);

    // Step 1: Validate the token by calling Telegram getMe
    let meData;
    try {
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        signal: AbortSignal.timeout(10_000),
      });
      meData = await meRes.json();
    } catch (e) { console.error("[bot-connect] getMe fetch failed:", e);
      return bad("Couldn't reach Telegram. Try again in a moment.", 502);
    }
    if (!meData.ok) return bad("Telegram says this token is invalid. Double-check it from BotFather and try again.");

    const botName = meData.result.first_name || "Bot";
    const botUsername = meData.result.username || "";

    // Step 2: Look up the bot's webhook secret from the bots table (set during
    // the full bot-setup flow in the bot Worker). The secret is required so
    // Telegram sends updates to the correct /hook/:secret endpoint.
    const botRow = await one(
      "SELECT webhook_secret FROM bots WHERE owner_id=$1 AND status='active' ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );
    if (!botRow?.webhook_secret) {
      return bad("No bot record found. Please complete bot setup from the dashboard first.");
    }

    // Step 3: Set the webhook to the bot Worker's hook endpoint
    const webhookUrl = `https://yourrank.site/hook/${botRow.webhook_secret}`;
    try {
      const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          secret_token: botRow.webhook_secret,
        }),
      });
      const whData = await whRes.json();
      if (!whData.ok) return bad(`Webhook setup failed: ${whData.description || "unknown error"}. You may need to retry.`);
    } catch (e) { console.error("[bot-connect] setWebhook fetch failed:", e);
      return bad("Couldn't set the webhook. Try again in a moment.", 502);
    }

    return json({ ok: true, botName, botUsername });
  } catch (e) {
    console.error("bot connect failed:", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}
