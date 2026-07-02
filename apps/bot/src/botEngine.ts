import { Bot, Context, InlineKeyboard } from "grammy";
import type { Update } from "grammy/types";
import { one, query } from "./db.js";
import { decryptToken } from "./crypto.js";
import { config } from "./config.js";

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
  return one<BotRow>(
    `SELECT id, owner_id, tg_bot_id, username, token_encrypted, webhook_secret, status, welcome_message
       FROM bots
      WHERE webhook_secret = $1`,
    [secret]
  );
}

export async function handleUpdateForBot(row: BotRow, update: Update): Promise<void> {
  const token = await decryptToken(Buffer.from(row.token_encrypted));
  const botInfo: Record<string, unknown> = {
    id: Number(row.tg_bot_id),
    is_bot: true,
    first_name: row.username ?? "Bot",
  };
  if (row.username) botInfo.username = row.username;
  const bot = new Bot(token, { botInfo: botInfo as any });
  wireHandlers(bot, row);
  await bot.handleUpdate(update);
}

// ---------------------------------------------------------------
// Handlers — the actual bot behavior, same code for every tenant.
// ---------------------------------------------------------------
export function wireHandlers(bot: Bot, botRow: BotRow): void {
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

  bot.command(["code", "codes"], async (ctx) => {
    await sendOffers(ctx, botRow);
  });

  bot.on("message::bot_command", async (ctx) => {
    const text = ctx.message?.text ?? "";
    const cmd = text.split(/\s/)[0]?.replace(/^\//, "").split("@")[0]?.toLowerCase();
    if (!cmd || ["start", "code", "codes"].includes(cmd)) return;

    const custom = await one<{ response: string | null }>(
      `SELECT response FROM bot_commands
        WHERE bot_id = $1 AND command = $2 AND is_enabled`,
      [botRow.id, cmd]
    );
    if (custom?.response) await ctx.reply(custom.response);
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
    const lines = [`*${offer.label}*`];
    if (offer.bonus_text) lines.push(offer.bonus_text);
    if (offer.promo_code) lines.push(`Code: \`${offer.promo_code}\``);

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

    await ctx.reply(lines.join("\n"), { parse_mode: "Markdown", reply_markup: kb });
  }
}
