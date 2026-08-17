import { botApiGet } from "@/lib/api";
import type { TelegramBot, TelegramSubscriberStats } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { TelegramBotsForm } from "./TelegramBotsForm";

export async function TelegramBotsPage() {
  const [botsResult, statsResult] = await Promise.all([
    botApiGet<TelegramBot[]>("/bots"),
    botApiGet<TelegramSubscriberStats>("/stats/subscribers"),
  ]);

  if (!botsResult.ok) return <ErrorState message={botsResult.error} />;

  const bots = botsResult.data;
  const stats = statsResult.ok ? statsResult.data : { total: 0, active: 0, new_7d: 0, new_30d: 0 };

  return (
    <>
      <PageHeader
        title="Telegram bots"
        description="Connect a bot to send messages and respond to chat commands."
      />
      <TelegramBotsForm bots={bots} stats={stats} />
    </>
  );
}
