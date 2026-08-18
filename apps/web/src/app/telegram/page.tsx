import type { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "Telegram — YourRank",
  description: "Connect a Telegram bot, create commands and broadcasts, and track the offers that bring viewers back.",
  alternates: { canonical: "https://yourrank.site/telegram" },
};

export default function TelegramPage() {
  return <ProductPage content={{
    kind: "telegram",
    title: "Keep the community moving between streams.",
    intro: "Connect a bot, answer repeat questions with commands, send clear broadcasts, and understand which tracked offers earn attention.",
    outcome: "A direct line from the next message to the next visit.",
    steps: [
      { number: "01", title: "Connect your bot", body: "Bring the Telegram community into the same operator account you use for sites and rewards." },
      { number: "02", title: "Prepare the response", body: "Create commands, replies, tracked links, and broadcasts with an honest draft-to-delivery state." },
      { number: "03", title: "Bring viewers back", body: "Point subscribers to current standings, new offers, or available rewards and measure the resulting actions." },
    ],
  }} />;
}
