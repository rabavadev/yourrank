import { query } from "../../../shared/db.js";
import type { Update } from "grammy/types";

export async function claimTelegramUpdate(botId: string, updateId: number): Promise<boolean> {
  const rows = await query(
    `INSERT INTO telegram_webhook_updates (bot_id, update_id)
     VALUES ($1, $2)
     ON CONFLICT (bot_id, update_id) DO NOTHING
     RETURNING bot_id`,
    [botId, updateId]
  );
  return rows.length > 0;
}

export async function gateAndDeferTelegramUpdate({
  botId,
  update,
  claim = claimTelegramUpdate,
  process,
  waitUntil,
  logger = console,
}: {
  botId: string;
  update: Update;
  claim?: (botId: string, updateId: number) => Promise<boolean>;
  process: () => Promise<void>;
  waitUntil: (promise: Promise<unknown>) => void;
  logger?: Pick<Console, "error">;
}): Promise<"claimed" | "duplicate"> {
  const updateId = update.update_id;
  if (!Number.isSafeInteger(updateId)) {
    throw new Error("Telegram update_id is missing or invalid");
  }

  const claimed = await claim(botId, updateId);
  if (!claimed) return "duplicate";

  const deferred = Promise.resolve()
    .then(process)
    .catch((err) => {
      logger.error(
        `[telegram webhook] deferred update failed for bot ${botId}, update ${updateId}:`,
        err
      );
    });
  waitUntil(deferred);
  return "claimed";
}
