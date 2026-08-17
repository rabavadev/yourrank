import { PageHeader } from "./PageHeader";
import { GiveawayLookup } from "./GiveawayLookup";

export function GiveawaysPage() {
  return (
    <>
      <PageHeader
        title="Live giveaways"
        description="Look up a Kick chatroom to run giveaway draws and bot commands."
      />
      <GiveawayLookup />
    </>
  );
}
