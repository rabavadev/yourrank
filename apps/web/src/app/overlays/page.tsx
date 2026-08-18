import type { Metadata } from "next";
import { ProductPage } from "@/components/product-page";

export const metadata: Metadata = {
  title: "Overlays — YourRank",
  description: "Put your live leaderboard on stream with a lightweight OBS browser source — card, ticker, or bar layouts that update on their own.",
  alternates: { canonical: "https://yourrank.site/overlays" },
};

export default function OverlaysPage() {
  return <ProductPage content={{
    kind: "overlays",
    title: "Your leaderboard, live on stream.",
    intro: "A browser-source overlay that shows the current standings on top of your broadcast — plain HTML and CSS, so it stays light while you stream.",
    outcome: "From your dashboard to a live on-screen leaderboard.",
    steps: [
      { number: "01", title: "Copy the overlay link", body: "Every published site gets an overlay URL. Pick the layout that fits your scene: card, ticker, or bar." },
      { number: "02", title: "Add it to OBS", body: "Paste the link as a browser source in OBS Studio or Streamlabs. The transparent background sits over your gameplay." },
      { number: "03", title: "It updates itself", body: "Ranks, points, and the countdown refresh from your live standings — no scene switching, no manual edits mid-stream." },
    ],
  }} />;
}
