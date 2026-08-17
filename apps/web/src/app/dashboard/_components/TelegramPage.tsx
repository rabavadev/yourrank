import { apiGet } from "@/lib/api";
import type { TelegramStatusResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { Badge } from "./Badge";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export async function TelegramPage() {
  const result = await apiGet<TelegramStatusResponse>("/api/auth/telegram/status");

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { linked, telegram_username, telegram_user_id } = result.data;

  return (
    <>
      <PageHeader
        title="Telegram bot"
        description="Connect your Telegram account so your bot can send messages and respond to commands."
      />
      <Card>
        <div className="flex items-center gap-3">
          {linked ? <Badge variant="success">Linked</Badge> : <Badge variant="neutral">Not linked</Badge>}
        </div>
        {linked && telegram_username ? (
          <div className="mt-4">
            <p className="text-sm text-ink">
              <span className="font-semibold">@{telegram_username}</span>
              {telegram_user_id && <span className="ml-2 text-ink-soft">(ID {telegram_user_id})</span>}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No Telegram account linked"
              description="Use the Telegram Login widget on the legacy dashboard or sign in with Telegram to link this account."
            />
          </div>
        )}
      </Card>
    </>
  );
}
