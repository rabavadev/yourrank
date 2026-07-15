// ============================================================================
//  YourRank — SHARED NOTIFICATION HELPERS (TypeScript)
//
//  Consolidated notification utilities used by BOTH Workers:
//    * Discord webhook sending
//    * Telegram bot message sending
//    * Top-3 change detection
//    * Notification firing logic
//
//  Moves Telegram-send logic from leaderboard Worker to shared module.
//  Telegram delivery is conceptually the bot Worker's domain, but this shared
//  module allows both Workers to send notifications consistently.
// ============================================================================

import { decryptToken } from "./crypto.js";

// ----------------------------------------------------------------------------
// Telegram Markdown escaping
// ----------------------------------------------------------------------------

const TG_MD_RESERVED = /([_*[\]()~`>#+\-=|{}.!\\])/g;

/** Escape a string for Telegram Markdown message content. */
export function escapeTgMarkdown(text: string | number | null | undefined): string {
  return String(text ?? "").replace(TG_MD_RESERVED, "\\$1");
}

// ----------------------------------------------------------------------------
// Discord webhook helpers
// ----------------------------------------------------------------------------

/**
 * Send a Discord webhook with an embed payload.
 * @param webhookUrl — full Discord webhook URL
 * @param embed — Discord embed object
 * @returns {{ ok: boolean, error?: string }}
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  embed: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl) return { ok: false, error: "No webhook URL" };
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        username: "YourRank",
        avatar_url: (typeof process !== "undefined" && process.env.PUBLIC_BASE_URL || "https://yourrank.site") + "/favicon.ico",
        embeds: [embed],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Discord ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String((err as any)?.message || err) };
  }
}

/**
 * Build a Discord embed for a leaderboard reset event.
 */
export function buildResetEmbed(
  siteName: string,
  players: Array<{ name: string; wagered: number; prize?: number }>,
  period: string
): Record<string, unknown> {
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
export function buildTop3Embed(
  siteName: string,
  playerName: string,
  rank: number,
  wagered: number
): Record<string, unknown> {
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

// ----------------------------------------------------------------------------
// Telegram helpers
// ----------------------------------------------------------------------------

/**
 * Send a Telegram message via the Bot API.
 * @param botToken — Telegram bot token
 * @param chatId — target chat/group ID
 * @param text — message text (supports Markdown)
 * @returns {{ ok: boolean, error?: string }}
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string
): Promise<{ ok: boolean; error?: string }> {
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
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) return { ok: false, error: data.description || "Telegram API error" };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String((err as any)?.message || err) };
  }
}

// ----------------------------------------------------------------------------
// Top-3 change detection
// ----------------------------------------------------------------------------

/**
 * Compare old and new player lists and return any new top-3 entries.
 * @param oldPlayers — previous players (sorted by wagered desc)
 * @param newPlayers — new players (sorted by wagered desc)
 * @returns Array of top-3 changes
 */
export function detectTop3Changes(
  oldPlayers: Array<{ name: string; wagered: number }>,
  newPlayers: Array<{ name: string; wagered: number }>
): Array<{ name: string; rank: number; wagered: number }> {
  const oldTop3Names = new Set((oldPlayers || []).slice(0, 3).map((p) => p.name));
  const changes: Array<{ name: string; rank: number; wagered: number }> = [];
  const sorted = (newPlayers || []).slice().sort((a, b) => b.wagered - a.wagered);
  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const p = sorted[i];
    if (!oldTop3Names.has(p.name)) {
      changes.push({ name: p.name, rank: i + 1, wagered: p.wagered });
    }
  }
  return changes;
}

// ----------------------------------------------------------------------------
// Notification firing functions
// ----------------------------------------------------------------------------

/**
 * Fire all configured notifications for a top-3 change event.
 * Reads the site's extra_json for notification config and bot token.
 * @param db — Database helpers ({ one, query })
 * @param env — Worker env (for DB access)
 * @param siteId
 * @param siteName
 * @param top3Changes — from detectTop3Changes()
 */
export async function notifyTop3Change(
  db: { one: (sql: string, params: any[]) => Promise<any>; query: (sql: string, params: any[]) => Promise<any[]> },
  env: any,
  siteId: string,
  siteName: string,
  top3Changes: Array<{ name: string; rank: number; wagered: number }>
): Promise<void> {
  if (!top3Changes.length) return;

  // Load site config + user's bot token
  const site = await db.one("SELECT extra_json, user_id FROM sites WHERE id=$1", [siteId]);
  if (!site) return;
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const discordUrl = extra.discord_webhook_url;
  const tgEnabled = extra.telegram_notify;
  const tgChatId = extra.telegram_chat_id;

  // Discord: one embed per new top-3 player
  if (discordUrl) {
    for (const change of top3Changes) {
      const embed = buildTop3Embed(siteName, change.name, change.rank, change.wagered);
      await sendDiscordWebhook(discordUrl, embed).catch((e: any) => { console.error("[notify] Discord webhook failed:", e?.message); });
            }
          }

          // Telegram: one message listing all new top-3 entries
          if (tgEnabled && tgChatId) {
    // Find the bot token for this site's owner from bots table (encrypted)
    const bot = await db.one(
      "SELECT token_encrypted FROM bots WHERE owner_id=$1 AND status='active' LIMIT 1",
      [site.user_id]
    );
    if (bot?.token_encrypted) {
      try {
        const botToken = await decryptToken(Buffer.from(bot.token_encrypted));
        const safeSiteName = escapeTgMarkdown(siteName);
        const lines = top3Changes.map((c) => {
          const medal = ["🥇", "🥈", "🥉"][c.rank - 1] || "🏆";
          return `${medal} *${escapeTgMarkdown(c.name)}* entered #${c.rank} — $${Number(c.wagered).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
        });
        const text = `⚡ *${safeSiteName}* — New Top 3!\n\n${lines.join("\n")}`;
                  await sendTelegramMessage(botToken, tgChatId, text).catch((e: any) => { console.error("[notify] Telegram send failed:", e?.message); });
                } catch (e: any) {
                  console.error("[notify] failed to decrypt bot token:", String(e?.message || e));
      }
    }
  }
}

/**
 * Fire Discord webhook for a leaderboard reset event.
 */
export async function notifyReset(
  db: { one: (sql: string, params: any[]) => Promise<any> },
  env: any,
  siteId: string,
  siteName: string,
  players: Array<{ name: string; wagered: number; prize?: number }>,
  period: string
): Promise<void> {
  const site = await db.one("SELECT extra_json FROM sites WHERE id=$1", [siteId]);
  if (!site) return;
  const extra = (site.extra_json && typeof site.extra_json === "object") ? site.extra_json : {};
  const discordUrl = extra.discord_webhook_url;
  if (!discordUrl) return;
  const embed = buildResetEmbed(siteName, players, period);
      await sendDiscordWebhook(discordUrl, embed).catch((e: any) => { console.error("[notify] Discord reset webhook failed:", e?.message); });
    }

/**
 * Detect rank changes for ALL players (not just top-3) and send DMs
 * to players who subscribed via /subscribe on the streamer's Telegram bot.
 *
 * @param db — Database helpers ({ one, query })
 * @param env — Worker env (for DB access)
 * @param siteId
 * @param siteName
 * @param oldPlayers — previous players sorted by wagered desc
 * @param newPlayers — new players sorted by wagered desc
 */
export async function notifySubscribedPlayers(
  db: { one: (sql: string, params: any[]) => Promise<any>; query: (sql: string, params: any[]) => Promise<any[]> },
  env: any,
  siteId: string,
  siteName: string,
  oldPlayers: Array<{ name: string; wagered: number }>,
  newPlayers: Array<{ name: string; wagered: number }>
): Promise<void> {
  // Build old rank map: player name → position (1-indexed)
  const oldRankMap = new Map();
  (oldPlayers || []).forEach((p, i) => oldRankMap.set(p.name, i + 1));

  // Build new rank map
  const newRankMap = new Map();
  const newSorted = (newPlayers || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
  newSorted.forEach((p, i) => newRankMap.set(p.name, i + 1));

  // Find subscribed players who changed rank
  const subs = await db.query(
    `SELECT ps.tg_user_id, ps.player_name, ps.bot_id FROM player_subscriptions ps WHERE ps.site_id = $1`,
    [siteId]
  );
  if (!subs.length) return;

  // Find the bot token for sending DMs (from the site owner's bots table)
  const site = await db.one("SELECT user_id FROM sites WHERE id=$1", [siteId]);
  if (!site) return;
  const bot = await db.one(
    "SELECT token_encrypted FROM bots WHERE owner_id=$1 AND status='active' LIMIT 1",
    [site.user_id]
  );
  if (!bot?.token_encrypted) return;

  let botToken: string;
  try {
    botToken = await decryptToken(Buffer.from(bot.token_encrypted));
  } catch (e: any) {
    console.error("[notify] failed to decrypt bot token:", String(e?.message || e));
    return;
  }

  for (const sub of subs) {
    const playerName = sub.player_name;
    const oldRank = oldRankMap.get(playerName);
    const newRank = newRankMap.get(playerName);

    // Player not found in new list — skip
    if (!newRank) continue;

    // Player was not in old list (new entry) — notify if in top 20
    const safeSiteName = escapeTgMarkdown(siteName);
    if (!oldRank && newRank <= 20) {
      const text = `🎉 You entered the *${safeSiteName}* leaderboard at #${newRank}!`;
              await sendTelegramMessage(botToken, sub.tg_user_id, text).catch((e: any) => { console.error("[notify] Telegram subscriber DM failed:", e?.message); });
              continue;
            }

            // Player changed rank
            if (oldRank && newRank !== oldRank) {
              const direction = newRank < oldRank ? "📈" : "📉";
              const text = `${direction} You moved from #${oldRank} to #${newRank} on the *${safeSiteName}* leaderboard!`;
              await sendTelegramMessage(botToken, sub.tg_user_id, text).catch((e: any) => { console.error("[notify] Telegram subscriber DM failed:", e?.message); });
    }
  }
}
