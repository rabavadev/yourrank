// Thin raw Bot API wrappers used during onboarding,
// before a grammY instance exists for the bot.

export interface TgBotInfo {
  id: number;
  username: string;
  first_name: string;
}

async function call<T>(
  token: string,
  method: string,
  params?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: params ? JSON.stringify(params) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json()) as {
    ok: boolean;
    result?: T;
    description?: string;
  };
  if (!body.ok || body.result === undefined) {
    throw new Error(`Telegram ${method} failed: ${body.description ?? res.status}`);
  }
  return body.result;
}

/** Validates a token and returns the bot's identity. Throws on a bad token. */
export const getMe = (token: string) => call<TgBotInfo>(token, "getMe");

export const setWebhook = (token: string, url: string, secret: string, options?: { dropPendingUpdates?: boolean; allowedUpdates?: string[] }) =>
  call<boolean>(token, "setWebhook", {
    url,
    secret_token: secret, // Telegram echoes this back on every update
    allowed_updates: options?.allowedUpdates || ["message", "callback_query", "pre_checkout_query"],
    drop_pending_updates: options?.dropPendingUpdates ?? true, // default true for onboarding safety
  });

export const deleteWebhook = (token: string) =>
  call<boolean>(token, "deleteWebhook");

export interface BotCommandSpec {
  command: string;
  description: string;
}

/**
 * Registers the bot's command list with Telegram. This populates the native
 * "Menu" button shown next to the chat input, so viewers can browse and tap
 * commands instead of remembering them.
 */
export const setMyCommands = (token: string, commands: BotCommandSpec[]) =>
  call<boolean>(token, "setMyCommands", { commands });

export interface WebhookInfo {
  url?: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  ip_address?: string;
  allowed_updates?: string[];
}

/** Returns the bot's current webhook info from Telegram Bot API. */
export const getWebhookInfo = (token: string) => call<WebhookInfo>(token, "getWebhookInfo");

export interface TgMessage {
  message_id: number;
  chat: { id: number };
}

/** Sends a text message to a specific chat. */
export const sendMessage = (token: string, chatId: number, text: string) =>
  call<TgMessage>(token, "sendMessage", { chat_id: chatId, text, parse_mode: "Markdown" });

