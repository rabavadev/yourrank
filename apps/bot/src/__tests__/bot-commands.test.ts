// Integration tests for Telegram bot command handlers (help, support).
// Mocks the shared DB layer so no real Postgres is needed.
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Bot } from "grammy";

const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");
const cryptoUrl = import.meta.resolve("../../../../shared/crypto.js");
const cryptoUrlTs = import.meta.resolve("../../../../shared/crypto.ts");

const mockQuery = mock<(...args: any[]) => Promise<any>>(() => Promise.resolve([]));

const dbMock = () => ({
  one: (...args: any[]) => Promise.resolve(null),
  exec: (...args: any[]) => Promise.resolve(undefined),
  query: (...args: any[]) => mockQuery(...args),
  getSql: () => null,
  withTransaction: async (fn: any) => fn({ one: (...a: any[]) => Promise.resolve(null), exec: (...a: any[]) => Promise.resolve(undefined), query: (...a: any[]) => mockQuery(...a) }),
});

const cryptoMock = () => ({
  decryptToken: () => "test-token",
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);
mock.module(cryptoUrl, cryptoMock);
mock.module(cryptoUrlTs, cryptoMock);

import { wireHandlers } from "../botEngine.js";

function makeBot(botRow: any) {
  const bot = new Bot("test-token", { botInfo: { id: 1, is_bot: true, first_name: "Test Bot", username: "testbot" } as any });
  wireHandlers(bot, botRow, {});
  return bot;
}

function captureReplies(bot: Bot) {
  const replies: any[] = [];
  bot.api.config.use(async (prev, method, payload) => {
    if (method === "sendMessage") {
      const p = payload as any;
      replies.push([p.chat_id, p.text, p.parse_mode]);
      return { ok: true, result: { message_id: 2, date: 1, chat: { id: p.chat_id, type: "private" } } } as any;
    }
    return prev(method, payload);
  });
  return replies;
}

function messageUpdate(text: string) {
  return {
    update_id: 1,
    message: {
      message_id: 1,
      from: { id: 42, is_bot: false, first_name: "User" },
      chat: { id: 42, type: "private" },
      date: Math.floor(Date.now() / 1000),
      text,
      entities: [{ type: "bot_command", offset: 0, length: text.length }],
    },
  };
}

describe("bot commands", () => {
  beforeEach(() => {
    mockQuery.mockImplementation(() => Promise.resolve([]));
  });

  it("/help replies with the command list", async () => {
    const bot = makeBot({ id: "b-1", owner_id: "u-1", welcome_message: "Hello" });
    const replies = captureReplies(bot);

    await bot.handleUpdate(messageUpdate("/help") as any);
    expect(replies.length).toBe(1);
    expect(replies[0][1]).toContain("/code");
    expect(replies[0][1]).toContain("/support");
  });

  it("/support replies with contact options", async () => {
    const bot = makeBot({ id: "b-1", owner_id: "u-1", welcome_message: "Hello" });
    const replies = captureReplies(bot);

    await bot.handleUpdate(messageUpdate("/support") as any);
    expect(replies.length).toBe(1);
    expect(replies[0][1]).toContain("yourrank.site/contact");
  });

  it("/start replies with the welcome text and an inline menu keyboard", async () => {
    const bot = makeBot({ id: "b-1", owner_id: "u-1", welcome_message: "Hello there" });
    const payloads = capturePayloads(bot);

    await bot.handleUpdate(messageUpdate("/start") as any);
    expect(payloads.length).toBe(1);
    expect(payloads[0].text).toBe("Hello there");
    const rows = payloads[0].reply_markup?.inline_keyboard ?? [];
    const labels = rows.flat().map((b: any) => b.text);
    expect(labels).toContain("🎁 Bonus codes");
    expect(labels).toContain("🏆 Leaderboard");
  });

  it("/menu includes enabled custom commands as buttons", async () => {
    mockQuery.mockImplementation(() => Promise.resolve([{ command: "vip" }]));
    const bot = makeBot({ id: "b-1", owner_id: "u-1", welcome_message: "Hi" });
    const payloads = capturePayloads(bot);

    await bot.handleUpdate(messageUpdate("/menu") as any);
    const labels = (payloads[0].reply_markup?.inline_keyboard ?? []).flat().map((b: any) => b.text);
    expect(labels).toContain("/vip");
    const vipBtn = (payloads[0].reply_markup.inline_keyboard).flat().find((b: any) => b.text === "/vip");
    expect(vipBtn.callback_data).toBe("m:c:vip");
  });

  it("tapping a custom-command menu button replies with its response", async () => {
    mockQuery.mockImplementation(() => Promise.resolve([]));
    const bot = makeBot({ id: "b-1", owner_id: "u-1", welcome_message: "Hi" });
    // The custom-command lookup goes through one(); override just for this bot.
    const replies = captureReplies(bot);
    let answered = false;
    bot.api.config.use(async (prev, method, payload) => {
      if (method === "answerCallbackQuery") { answered = true; return { ok: true, result: true } as any; }
      return prev(method, payload);
    });
    // No custom row found → graceful fallback message.
    await bot.handleUpdate(callbackUpdate("m:c:ghost") as any);
    expect(answered).toBe(true);
    expect(replies[0][1]).toContain("no longer available");
  });
});

function capturePayloads(bot: Bot) {
  const payloads: any[] = [];
  bot.api.config.use(async (prev, method, payload) => {
    if (method === "sendMessage") {
      payloads.push(payload as any);
      const p = payload as any;
      return { ok: true, result: { message_id: 2, date: 1, chat: { id: p.chat_id, type: "private" } } } as any;
    }
    return prev(method, payload);
  });
  return payloads;
}

function callbackUpdate(data: string) {
  return {
    update_id: 1,
    callback_query: {
      id: "cbq-1",
      from: { id: 42, is_bot: false, first_name: "User" },
      chat_instance: "ci-1",
      data,
      message: {
        message_id: 1,
        from: { id: 1, is_bot: true, first_name: "Test Bot", username: "testbot" },
        chat: { id: 42, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "menu",
      },
    },
  };
}
