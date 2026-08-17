import { botApiGet } from "@/lib/api";
import type { TelegramBroadcast, TelegramBot } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { TelegramBroadcastsForm } from "./TelegramBroadcastsForm";

export async function TelegramBroadcastsPage() {
  const [broadcastsResult, botsResult] = await Promise.all([
    botApiGet<TelegramBroadcast[]>("/broadcasts"),
    botApiGet<TelegramBot[]>("/bots"),
  ]);

  if (!broadcastsResult.ok) return <ErrorState message={broadcastsResult.error} />;

  const bots = botsResult.ok ? botsResult.data : [];

  return (
    <>
      <PageHeader
        title="Broadcasts"
        description="Send a scheduled message to all active subscribers of a bot."
      />
      <TelegramBroadcastsForm broadcasts={broadcastsResult.data} bots={bots} />
    </>
  );
}
