import { botApiGet } from "@/lib/api";
import type { TelegramOffer } from "@/lib/types";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { TelegramOffersForm } from "./TelegramOffersForm";

export async function TelegramOffersPage() {
  const result = await botApiGet<TelegramOffer[]>("/offers");
  if (!result.ok) return <ErrorState message={result.error} />;

  return (
    <>
      <PageHeader
        title="Offers"
        description="Tracked referral links you share through your Telegram bot."
      />
      <TelegramOffersForm offers={result.data} />
    </>
  );
}
