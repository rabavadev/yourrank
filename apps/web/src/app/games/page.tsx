import type { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "Games — YourRank",
  description: "Community mini-games for stream breaks: Mines, Plinko, and Dice, played with site credits only — provably fair, no deposits, no cashouts.",
  alternates: { canonical: "https://yourrank.site/games" },
};

export default function GamesPage() {
  return <ProductPage content={{
    kind: "games",
    title: "Keep the chat playing between rounds.",
    intro: "Mines, Plinko, and Dice on your community site — played with the credits viewers earn, never with money. No deposits, no cashouts, provably fair.",
    outcome: "From idle stream breaks to a community that plays together.",
    steps: [
      { number: "01", title: "Turn games on", body: "Enable the games section on your site. Viewers play with the same credits they earn from your rewards — nothing to install." },
      { number: "02", title: "Every round is checkable", body: "Each round is generated from a server seed and the viewer's own seed. The seed hash is shown before the round and revealed after, so anyone can verify the result." },
      { number: "03", title: "Entertainment only", body: "Credits have no cash value: there are no deposits and no cashouts anywhere. Games exist to keep your community engaged, not to gamble." },
    ],
  }} />;
}
