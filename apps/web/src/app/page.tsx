import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Hero } from "@/components/home/hero";
import {
  FinalCta,
  LoopSection,
  PillarMarquee,
  ProductsSection,
} from "@/components/home/sections";
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
    url: "https://app.yourrank.site/",
    type: "website",
    images: ["https://yourrank.site/og.png"],
  },
};

const NAV_LINKS = [
  { label: "How it works", href: "/#loop" },
  { label: "Products", href: "/#products" },
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-devin-surface text-devin-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-devin-line bg-devin-surface/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" className="text-[15px] font-semibold tracking-tight text-devin-ink">
            YourRank
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-devin-ink-soft transition-colors hover:text-devin-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden text-sm text-devin-ink-soft transition-colors hover:text-devin-ink sm:block"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded bg-devin-ink px-3.5 py-1.5 text-sm font-medium text-devin-surface transition-colors hover:bg-black"
            >
              Start free
            </a>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <PillarMarquee />
        <div id="loop">
          <LoopSection />
        </div>
        <div id="products">
          <ProductsSection />
        </div>
        <FinalCta />
      </main>

      <footer className="border-t border-devin-line bg-devin-surface px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-devin-ink-soft sm:flex-row">
          <span>© YourRank · contact@yourrank.site</span>
          <span className="font-mono text-xs">
            18+ · For entertainment purposes only. Play responsibly.
          </span>
        </div>
      </footer>
    </div>
  );
}
