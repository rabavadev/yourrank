import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Hero } from "@/components/home/hero";
import {
  FinalCta,
  LoopSection,
  PillarMarquee,
  ProductsSection,
} from "@/components/home/sections";
import { MarketingShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YourRank — Keep your community loop moving",
  description:
    "Launch a streamer site, activate viewers on Telegram, and bring them back with Credits & Shop.",
  openGraph: {
    title: "YourRank — Keep your community loop moving",
    description:
      "Launch a streamer site, activate viewers on Telegram, and bring them back with Credits & Shop.",
    url: "https://yourrank.site/",
    type: "website",
    images: ["https://yourrank.site/og.png"],
  },
  alternates: {
    canonical: "https://yourrank.site/",
  },
};

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <MarketingShell>
      <Hero />
      <PillarMarquee />
      <div id="loop"><LoopSection /></div>
      <div id="products"><ProductsSection /></div>
      <FinalCta />
    </MarketingShell>
  );
}
