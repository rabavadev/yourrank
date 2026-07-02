// Notification helpers: Discord webhooks + Telegram bot messages.
// All notifications are Pro-gated — callers must check plan before invoking.
import { one } from "./db.js";
import { effectivePlan } from "./billing.js";

// ── Discord ──────────────────────────────────────────────────────────────────

/**
 * Send a Discord webhook with an embed payload.
 * @param {string} webhookUrl — full Discord webhook URL
 * @param {object} embed — Discord embed object
 * @returns {{ ok: boolean, error?: string }}
 */
export async function sendDiscordWebhook(webhookUrl, embed) {
  if (!webhookUrl) return { ok: false, error: "No webhook URL" };
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        username: "YourRank",
        avatar_url: "https://yourrank.site/favicon.ico",
        embeds: [embed],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Discord ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/**
 * Build a Discord embed for a leaderboard reset event.
 */
export function buildResetEmbed(siteName, players, period) {
  const top3 = players.slice(0, 3);
  const fields = top3.map((p, i) => {
    const medal = ["🥇", "🥈", "🥉"][i];
    return {
      name: `${medal} #${i + 1} — ${p.name}`,
      value: `$${Number(p.wagered).toLocaleString("en-US", { maximumFractionDigits: 0 })}${p.prize ? ` (prize: $${Number(p.prize).toLocaleString()})` : ""}`,
      inline: false,
    };
  });
  return {
    title: `🔄 ${siteName} — Leaderboard Reset!`,
    description: `The ${period || "current"} period has ended. Here are the final standings:`,
    color: 0xc8ff00, // YourRank accent green
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank" },
  };
}

/**
 * Build a Discord embed for a top-3 rank change event.
 */
export function buildTop3Embed(siteName, playerName, rank, wagered) {
  const medal = ["🥇", "🥈", "🥉"][rank - 1] || "🏆";
  return {
    title: `${medal} ${playerName} just entered Top 3!`,
    description: `**${siteName}** leaderboard update`,
    color: 0xffcb45, // gold
    fields: [
      { name: "New Rank", value: `#${rank}`, inline: true },
      { name: "Wagered", value: `$${Number(wagered).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank" },
  };
}

// ── Telegram ─────────────────────────────────────────────────────────────────

/**
 * Send a Telegram message via the Bot API.
 * @param {string} botToken — Telegram bot token
 * @param {string|number} chatId — target chat/group ID
 * @param {string} text — message text (supports Markdown)
 * @returns {{ ok: boolean, error?: string }}
 */
export async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId) return { ok: false, error: "Missing bot token or chat ID" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.description || "Telegram API error" };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

// ── Top-3 change detection ───────────────────────────────────────────────────

/**
 * Compare old and new player lists and return any new top-3 entries.
 * @param {Array} oldPlayers — previous players (sorted by wagered desc)
 * @param {Array} newPlayers — new players (sorted by wagered desc)
 * @returns {Array<{ name: string, rank: number, wagered: number }>}
 */
export function detectTop3Changes(oldPlayers, newPlayers) {
  const oldTop3Names = new Set((oldPlayers || []).slice(0, 3).map((p) => p.name));
  const changes = [];
  const sorted = (newPlayers || []).slice().sort((a, b) => b.wagered - a.wagered);
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const p = sorted[i];
    if (!oldTop3Names.has(p.name)) {
      changes.push({ name: p.name, rank: i + 1, wagered: p.wagered });
    }
  }
  return changes;
}

// ── Fire notifications for a site ────────────────────────────────────────────

/**
 * Fire all configured notifications for a top-3 change event.
 * Reads the site's extra_json for notification config and bot token.
 * @param {object} env — Worker env (for DB access)
 * @param {string} siteId
 * @param {string} siteName
 * @param {Array} top3Changes — from detectTop3Changes()
 */
export async function notifyTop3Change(env, siteId, siteName, top3Changes) {
  if (!top3Changes.length) return;

  // Load site config + user's bot token
  const site = await one("SELECT extra_json FROM sites WHERE id=$1", [siteId]);
  if (!site) return;
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const discordUrl = extra.discord_webhook_url;
  const tgEnabled = extra.telegram_notify;
  const tgChatId = extra.telegram_chat_id;

  // Discord: one embed per new top-3 player
  if (discordUrl) {
    for (const change of top3Changes) {
      const embed = buildTop3Embed(siteName, change.name, change.rank, change.wagered);
      await sendDiscordWebhook(discordUrl, embed).catch(() => {});
    }
  }

  // Telegram: one message listing all new top-3 entries
  if (tgEnabled && tgChatId) {
    // Find the bot token for this site's owner
    const siteRow = await one("SELECT user_id FROM sites WHERE id=$1", [siteId]);
    if (siteRow) {
      const user = await one("SELECT bot_token FROM users WHERE id=$1", [siteRow.user_id]);
      if (user?.bot_token) {
        const lines = top3Changes.map((c) => {
          const medal = ["🥇", "🥈", "🥉"][c.rank - 1] || "🏆";
          return `${medal} *${c.name}* entered #${c.rank} — $${Number(c.wagered).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
        });
        const text = `⚡ *${siteName}* — New Top 3!\n\n${lines.join("\n")}`;
        await sendTelegramMessage(user.bot_token, tgChatId, text).catch(() => {});
      }
    }
  }
}

/**
 * Fire Discord webhook for a leaderboard reset event.
 */
export async function notifyReset(env, siteId, siteName, players, period) {
  const site = await one("SELECT extra_json FROM sites WHERE id=$1", [siteId]);
  if (!site) return;
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const discordUrl = extra.discord_webhook_url;
  if (!discordUrl) return;
  const embed = buildResetEmbed(siteName, players, period);
  await sendDiscordWebhook(discordUrl, embed).catch(() => {});
}

// ── Player rank-change subscriptions ────────────────────────────────────

/**
 * Detect rank changes for ALL players (not just top-3) and send DMs
 * to players who subscribed via /subscribe on the streamer's Telegram bot.
 *
 * @param {object} siteData — the site row (extra_json, user_id, etc.)
 * @param {string} siteId
 * @param {string} siteName
 * @param {Array} oldPlayers — previous players sorted by wagered desc
 * @param {Array} newPlayers — new players sorted by wagered desc
 */
export async function notifySubscribedPlayers(env, siteId, siteName, oldPlayers, newPlayers) {
  // Build old rank map: player name → position (1-indexed)
  const oldRankMap = new Map();
  (oldPlayers || []).forEach((p, i) => oldRankMap.set(p.name, i + 1));

  // Build new rank map
  const newRankMap = new Map();
  const newSorted = (newPlayers || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
  newSorted.forEach((p, i) => newRankMap.set(p.name, i + 1));

  // Find subscribed players who changed rank
  const subs = await query(
    `SELECT ps.tg_user_id, ps.player_name, ps.bot_id FROM player_subscriptions ps WHERE ps.site_id = $1`,
    [siteId]
  );
  if (!subs.length) return;

  // Find the bot token for sending DMs (from the site owner)
  const siteRow = await one("SELECT user_id FROM sites WHERE id=$1", [siteId]);
  if (!siteRow) return;
  const user = await one("SELECT bot_token FROM users WHERE id=$1", [siteRow.user_id]);
  if (!user?.bot_token) return;

  for (const sub of subs) {
    const playerName = sub.player_name;
    const oldRank = oldRankMap.get(playerName);
    const newRank = newRankMap.get(playerName);

    // Player not found in new list — skip
    if (!newRank) continue;

    // Player was not in old list (new entry) — notify if in top 20
    if (!oldRank && newRank <= 20) {
      const text = `🎉 You entered the *${siteName}* leaderboard at #${newRank}!`;
      await sendTelegramMessage(user.bot_token, sub.tg_user_id, text).catch(() => {});
      continue;
    }

    // Player changed rank
    if (oldRank && newRank !== oldRank) {
      const direction = newRank < oldRank ? "📈" : "📉";
      const text = `${direction} You moved from #${oldRank} to #${newRank} on the *${siteName}* leaderboard!`;
      await sendTelegramMessage(user.bot_token, sub.tg_user_id, text).catch(() => {});
    }
  }
}
