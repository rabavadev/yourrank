import { Bot, Context, InlineKeyboard } from "grammy";
import type { Update } from "grammy/types";

/** Escape user content for Telegram HTML parse_mode */
export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? "")
  );
import { one, query } from "../../../shared/db.js";
import { decryptToken } from "../../../shared/crypto.js";
import { config } from "./config.js";
import { rateLimit, type RateLimitKV } from "./ratelimit.js";

export interface BotRow {
  id: string;
  owner_id: string;
  tg_bot_id: string;
  username: string | null;
  token_encrypted: Buffer;
  webhook_secret: string;
  status: string;
  welcome_message: string | null;
}

interface OfferRow {
  id: string;
  label: string;
  promo_code: string | null;
  bonus_text: string | null;
  referral_url: string;
  casino_name: string;
  slug: string | null;
}

// ---------------------------------------------------------------
// Stateless webhook handling — one Bot per request, no cache.
// Works identically on Node (Fastify) and Workers (Hono).
// Creating a Bot is cheap (object construction + handler wiring,
// zero network calls when botInfo is passed).
// ---------------------------------------------------------------

export async function getBotBySecret(secret: string): Promise<BotRow | undefined> {
  // JOIN on users so a suspended owner's bots are automatically rejected.
  return one<BotRow>(
    `SELECT b.id, b.owner_id, b.tg_bot_id, b.username, b.token_encrypted,
            b.webhook_secret, b.status, b.welcome_message
       FROM bots b JOIN users u ON u.id = b.owner_id
      WHERE b.webhook_secret = $1 AND u.status = 'active'`,
    [secret]
  );
}

export async function handleUpdateForBot(row: BotRow, update: Update, env?: any): Promise<void> {
  const token = await decryptToken(Buffer.from(row.token_encrypted));
  const botInfo: Record<string, unknown> = {
    id: Number(row.tg_bot_id),
    is_bot: true,
    first_name: row.username ?? "Bot",
  };
  if (row.username) botInfo.username = row.username;
  const bot = new Bot(token, { botInfo: botInfo as any });
  wireHandlers(bot, row, env);
  await bot.handleUpdate(update);
}

// ---------------------------------------------------------------
// Handlers — the actual bot behavior, same code for every tenant.
// ---------------------------------------------------------------
export function wireHandlers(bot: Bot, botRow: BotRow, env?: any): void {
  bot.use(async (ctx, next) => {
    const from = ctx.from;
    if (from && !from.is_bot) {
      await query(
        `INSERT INTO bot_subscribers (bot_id, tg_user_id, tg_username, first_name, language)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (bot_id, tg_user_id) DO UPDATE
           SET last_seen = now(),
               tg_username = EXCLUDED.tg_username,
               is_blocked = false`,
        [botRow.id, from.id, from.username ?? null, from.first_name ?? null, from.language_code ?? null]
      );
    }
    await next();
  });

  bot.command("start", async (ctx) => {
    const welcome =
      botRow.welcome_message ??
      "Welcome! Send /code to get my current bonus codes and links.";
    await ctx.reply(welcome);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "<b>Available commands</b>\n\n" +
      "/code — get bonus codes and referral links\n" +
      "/subscribe &lt;player name&gt; — get DMs when your rank changes\n" +
      "/unsubscribe — stop rank-change DMs\n" +
      "/support — contact the YourRank team\n" +
      "/help — show this list",
      { parse_mode: "HTML" }
    );
  });

  bot.command("support", async (ctx) => {
    await ctx.reply(
      "Need help?\n\n" +
      "1. Visit the dashboard: https://yourrank.site/dashboard\n" +
      "2. Email us: contact@yourrank.site\n" +
      "3. Use the contact form: https://yourrank.site/contact\n\n" +
      "For account or billing issues, include your registered email so we can find you faster.",
      { parse_mode: "HTML" }
    );
  });

  bot.command(["code", "codes"], async (ctx) => {
    await sendOffers(ctx, botRow);
  });

  // /subscribe <player_name> — opt into rank-change DMs on this leaderboard.
  bot.command("subscribe", async (ctx) => {
    const from = ctx.from;
    if (!from || from.is_bot) return;

    // Parse the player name from the command text
    const text = ctx.message?.text ?? "";
    const playerName = text.replace(/^\/subscribe(@\S+)?\s*/i, "").trim();
    if (!playerName) {
      await ctx.reply(
        "Usage: /subscribe <your player name>\n\n" +
        "Example: /subscribe *****ess\n\n" +
        "This subscribes you to DMs when your rank changes on this leaderboard."
      );
      return;
    }

    // Find the site(s) owned by this bot's owner
    const sites = await query<{ id: string; name: string }>(
      `SELECT id, name FROM sites WHERE user_id = $1 AND published = true`,
      [botRow.owner_id]
    );
    if (!sites.length) {
      await ctx.reply("This bot doesn't have an active leaderboard yet.");
      return;
    }

    // Subscribe to the first site (primary board)
    const site = sites[0];
    try {
      await query(
        `INSERT INTO player_subscriptions (bot_id, site_id, tg_user_id, player_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (bot_id, tg_user_id, site_id) DO UPDATE SET player_name = EXCLUDED.player_name`,
        [botRow.id, site.id, from.id, playerName]
      );
      await ctx.reply(
        `✅ Subscribed! You'll get a DM when "${playerName}" changes rank on the ${site.name || "leaderboard"}.\n\n` +
        "Send /unsubscribe to stop notifications."
      );
    } catch (err) {
      console.error("[subscribe]", err);
      await ctx.reply("Something went wrong. Try again later.");
    }
  });

  // /unsubscribe — stop receiving rank-change DMs.
  bot.command("unsubscribe", async (ctx) => {
    const from = ctx.from;
    if (!from || from.is_bot) return;
    const deleted = await query(
      `DELETE FROM player_subscriptions WHERE bot_id = $1 AND tg_user_id = $2 RETURNING id`,
      [botRow.id, from.id]
    );
    if (deleted.length) {
      await ctx.reply("✅ Unsubscribed. You won't receive rank change notifications anymore.");
    } else {
      await ctx.reply("You weren't subscribed. Use /subscribe <player name> to start.");
    }
  });

  // ------------------------------------------------------------------
  // Chat commands: !rank, !board, !leaderboard
  // These work in GROUP chats where the bot is a member.
  // They look up the streamer's leaderboard (via bots.owner_id -> sites)
  // and respond with rank / top-5.
  // ------------------------------------------------------------------

  // Helper: format a number as $12,345
  const fmtMoney = (n: number | string): string => {
    const v = Number(n) || 0;
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Helper: get the primary site for this bot's owner
  async function getOwnerSite(): Promise<{ id: string; name: string; slug: string } | null> {
    const site = await one<{ id: string; name: string; slug: string }>(
      `SELECT id, name, slug FROM sites WHERE user_id = $1 AND published = true ORDER BY id ASC LIMIT 1`,
      [botRow.owner_id]
    );
    return site ?? null;
  }

  // Rate limit for chat commands: 5 per minute per chat
  const CHAT_CMD_LIMIT = 5;
  const CHAT_CMD_WINDOW = 60; // seconds

  async function chatCmdRateLimited(chatId: number): Promise<boolean> {
    if (!env) return false; // no KV = no rate limit
    const result = await rateLimit(env, `chatcmd:${chatId}`, CHAT_CMD_LIMIT, CHAT_CMD_WINDOW);
    return !result.ok;
  }

  // !rank — show the sender's rank on the leaderboard
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message?.text?.trim() ?? "";
    // Match !rank, /rank, or @botname variants — case-insensitive
    if (!/^!rank\b/i.test(text)) return next();

    // Only respond in group/supergroup chats
    const chatType = ctx.chat?.type;
    if (chatType !== "group" && chatType !== "supergroup") return next();

    // Rate limit
    if (await chatCmdRateLimited(ctx.chat.id)) return next();

    const from = ctx.from;
    if (!from || from.is_bot) return next();

    const site = await getOwnerSite();
    if (!site) {
      await ctx.reply("No leaderboard linked to this chat.", {
        reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
      });
      return;
    }

    const username = (from.username ?? "").toLowerCase().replace(/^@/, "");
    if (!username) {
      await ctx.reply("You need a Telegram username to use !rank. Set one in Telegram Settings → Username.", {
        reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
      });
      return;
    }

    // Get all players sorted by wagered DESC, assign rank
    // DB-004: LIMIT 1000 to prevent unbounded result sets on large leaderboards
    const players = await query<{ name: string; wagered: number }>(
      `SELECT name, wagered FROM players WHERE site_id = $1 ORDER BY wagered DESC LIMIT 1000`,
      [site.id]
    );

    // Match by case-insensitive username against player names
    const idx = players.findIndex(
      (p) => p.name.toLowerCase().replace(/^@/, "") === username
    );

    if (idx === -1) {
      await ctx.reply("You're not on this leaderboard yet. Ask the streamer to add you! 🎯", {
        reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
      });
      return;
    }

    const rank = idx + 1;
    const player = players[idx];
    const displayName = site.name || "this streamer";
    const url = config.publicBaseUrl ? `${config.publicBaseUrl}/${site.slug}` : "";

    let msg = `🏆 @${username} is ranked #${rank} of ${players.length} on ${displayName}'s leaderboard! Wagered: ${fmtMoney(player.wagered)}`;
    if (url) msg += `\n\n🔗 ${url}`;

    await ctx.reply(msg, {
      reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
    });
  });

  // !board / !leaderboard — show top 5 players
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message?.text?.trim() ?? "";
    if (!/^!(board|leaderboard)\b/i.test(text)) return next();

    const chatType = ctx.chat?.type;
    if (chatType !== "group" && chatType !== "supergroup") return next();

    if (await chatCmdRateLimited(ctx.chat.id)) return next();

    const site = await getOwnerSite();
    if (!site) {
      await ctx.reply("No leaderboard linked to this chat.", {
        reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
      });
      return;
    }

    const players = await query<{ name: string; wagered: number }>(
      `SELECT name, wagered FROM players WHERE site_id = $1 ORDER BY wagered DESC LIMIT 5`,
      [site.id]
    );

    if (!players.length) {
      await ctx.reply("This leaderboard is empty. Ask the streamer to add players!", {
        reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
      });
      return;
    }

    const displayName = site.name || "Leaderboard";
    const lines = players.map(
      (p, i) => `${i + 1}. ${p.name} — ${fmtMoney(p.wagered)}`
    );

    const url = config.publicBaseUrl ? `${config.publicBaseUrl}/${site.slug}` : "";
    let msg = `🏆 ${displayName}'s Leaderboard\n${lines.join("\n")}`;
    if (url) msg += `\n\n🔗 ${url}`;

    await ctx.reply(msg, {
      reply_parameters: { message_id: ctx.message!.message_id, allow_sending_without_reply: true },
    });
  });

  bot.on("message::bot_command", async (ctx) => {
    const text = ctx.message?.text ?? "";
    const cmd = text.split(/\s/)[0]?.replace(/^\//, "").split("@")[0]?.toLowerCase();
    if (!cmd || ["start", "code", "codes", "subscribe", "unsubscribe"].includes(cmd)) return;

    const custom = await one<{ response: string | null }>(
      `SELECT response FROM bot_commands
        WHERE bot_id = $1 AND command = $2 AND is_enabled`,
      [botRow.id, cmd]
    );
    if (custom?.response) await ctx.reply(esc(custom.response), { parse_mode: "HTML" });
  });

  bot.catch((err) => {
    console.error(`[bot ${botRow.username ?? botRow.id}]`, err.error);
  });
}

async function sendOffers(ctx: Context, botRow: BotRow): Promise<void> {
  const offers = await query<OfferRow>(
    `SELECT o.id, o.label, o.promo_code, o.bonus_text, o.referral_url,
            c.name AS casino_name, sl.slug
       FROM offers o
       JOIN casinos c ON c.id = o.casino_id
       LEFT JOIN LATERAL (
         SELECT slug FROM short_links
          WHERE offer_id = o.id AND source = 'telegram'
          ORDER BY created_at LIMIT 1
       ) sl ON true
      WHERE o.owner_id = $1 AND o.is_active
      ORDER BY o.priority DESC, o.created_at`,
    [botRow.owner_id]
  );

  if (offers.length === 0) {
    await ctx.reply("No active offers right now. Check back soon!");
    return;
  }

  for (const offer of offers) {
    const lines = [`<b>${esc(offer.label)}</b>`];
    if (offer.bonus_text) lines.push(esc(offer.bonus_text));
    if (offer.promo_code) lines.push(`Code: <code>${esc(offer.promo_code)}</code>`);

    const trackable =
      offer.slug &&
      /^https:\/\//.test(config.publicBaseUrl) &&
      !/localhost|127\.0\.0\.1|example\.com/.test(config.publicBaseUrl);
    const u = ctx.from?.id ? `?u=${ctx.from.id}` : "";
    const buttonUrl = trackable
      ? `${config.publicBaseUrl}/r/${offer.slug}${u}`
      : offer.referral_url;
    const kb = new InlineKeyboard().url(
      `Claim on ${offer.casino_name}`,
      buttonUrl
    );

    await ctx.reply(lines.join("\n"), { parse_mode: "HTML", reply_markup: kb });
  }
}
