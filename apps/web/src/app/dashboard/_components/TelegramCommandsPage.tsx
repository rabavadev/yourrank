import { botApiGet } from "@/lib/api";
import type { TelegramBot, TelegramBotCommand } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { TelegramCommandsForm } from "./TelegramCommandsForm";

export async function TelegramCommandsPage() {
  const botsResult = await botApiGet<TelegramBot[]>("/bots");
  if (!botsResult.ok) return <ErrorState message={botsResult.error} />;

  const bots = botsResult.data;
  const commandsByBot = await Promise.all(
    bots.map(async (bot) => {
      const res = await botApiGet<TelegramBotCommand[]>(`/bots/${bot.id}/commands`);
      return { bot, commands: res.ok ? res.data : [] };
    })
  );

  return (
    <>
      <PageHeader
        title="Custom commands"
        description="Add slash commands your bot replies to in Telegram chat."
      />
      <TelegramCommandsForm bots={bots} commandsByBot={commandsByBot} />
    </>
  );
}
