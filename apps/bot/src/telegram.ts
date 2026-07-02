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

export const setWebhook = (token: string, url: string, secret: string) =>
  call<boolean>(token, "setWebhook", {
    url,
    secret_token: secret, // Telegram echoes this back on every update
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });

export const deleteWebhook = (token: string) =>
  call<boolean>(token, "deleteWebhook");
