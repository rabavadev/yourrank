import type { Metadata } from "next";
import { MagneticCursor } from "@/components/home/magnetic-cursor";
import { MarketingShell } from "@/components/site-shell";
import { BRAND_COLORS } from "@yourrank/shared/brand-assets";

export const metadata: Metadata = {
  title: "Brand — YourRank",
  description: "Official YourRank brand assets: logos, wordmarks, colors, and Powered by YourRank badges for streamer panels.",
  alternates: { canonical: "https://yourrank.site/brand" },
};

const LOGOS = [
  { name: "Mark — dark", file: "yourrank-mark-dark.svg", bg: "bg-white", note: "For light backgrounds" },
  { name: "Mark — light", file: "yourrank-mark-light.svg", bg: "bg-devin-ink", note: "For dark backgrounds" },
  { name: "Mark — blue", file: "yourrank-mark-blue.svg", bg: "bg-white", note: "Accent variant" },
  { name: "Wordmark — dark", file: "yourrank-wordmark-dark.svg", bg: "bg-white", note: "For light backgrounds" },
  { name: "Wordmark — light", file: "yourrank-wordmark-light.svg", bg: "bg-devin-ink", note: "For dark backgrounds" },
];

const BADGES = [
  { name: "Powered by YourRank — dark", file: "powered-by-yourrank-dark.svg", bg: "bg-devin-ink" },
  { name: "Powered by YourRank — light", file: "powered-by-yourrank-light.svg", bg: "bg-white" },
];

const COLORS = [
  { name: "Primary blue", hex: BRAND_COLORS.blue, className: "bg-devin-primary" },
  { name: "Ink", hex: BRAND_COLORS.dark, className: "bg-devin-ink" },
  { name: "Surface", hex: "#FCFCFC", className: "bg-devin-surface border border-devin-line" },
];

export default function BrandPage() {
  return (
    <MagneticCursor>
      <MarketingShell>
        <section className="px-6 pb-12 pt-32 sm:pt-40">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-devin-primary">Brand</p>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              Brand assets.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-devin-ink-soft">
              Official logos, colors, and badges. Free to use when referring to YourRank or linking to your community
              site — please don&apos;t alter the marks or imply endorsement.
            </p>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-medium tracking-[-0.02em]">Logos</h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-[16px] border border-devin-line bg-devin-line sm:grid-cols-2 lg:grid-cols-3">
              {LOGOS.map((logo) => (
                <div key={logo.name} className="bg-white">
                  <div className={`flex h-36 items-center justify-center ${logo.bg}`}>
                    <img src={`/brand/${logo.file}`} alt={logo.name} className="max-h-16 w-auto max-w-[240px]" />
                  </div>
                  <div className="flex items-center justify-between border-t border-devin-line px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{logo.name}</p>
                      <p className="text-xs text-devin-ink-soft">{logo.note}</p>
                    </div>
                    <a
                      className="text-xs text-devin-ink underline underline-offset-4 hover:text-devin-primary"
                      href={`/brand/${logo.file}`}
                      download={logo.file}
                    >
                      Download SVG
                    </a>
                  </div>
                </div>
              ))}
              <div aria-hidden="true" className="hidden bg-white lg:block" />
            </div>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-medium tracking-[-0.02em]">Streamer badges</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-devin-ink-soft">
              Drop a &quot;Powered by YourRank&quot; badge in your Twitch or Kick panels and link it to your community site.
            </p>
            <div className="mt-6 grid gap-px overflow-hidden rounded-[16px] border border-devin-line bg-devin-line sm:grid-cols-2">
              {BADGES.map((badge) => (
                <div key={badge.name} className="bg-white">
                  <div className={`flex h-28 items-center justify-center ${badge.bg}`}>
                    <img src={`/brand/${badge.file}`} alt={badge.name} className="h-11 w-auto" />
                  </div>
                  <div className="flex items-center justify-between border-t border-devin-line px-4 py-3">
                    <p className="text-sm font-medium">{badge.name}</p>
                    <a
                      className="text-xs text-devin-ink underline underline-offset-4 hover:text-devin-primary"
                      href={`/brand/${badge.file}`}
                      download={badge.file}
                    >
                      Download SVG
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 sm:pb-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-medium tracking-[-0.02em]">Colors &amp; type</h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-[16px] border border-devin-line bg-devin-line sm:grid-cols-3">
              {COLORS.map((color) => (
                <div key={color.hex} className="bg-white p-5">
                  <div className={`h-16 rounded-[8px] ${color.className}`} />
                  <p className="mt-3 text-sm font-medium">{color.name}</p>
                  <p className="font-mono text-xs text-devin-ink-soft">{color.hex}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-2xl leading-relaxed text-devin-ink-soft">
              Typography is <span className="font-medium text-devin-ink">Inter</span> for interface and headings, with a
              monospace face for labels and data. Questions about usage?{" "}
              <a href="/contact" className="text-devin-ink underline underline-offset-4 hover:text-devin-primary">Contact us</a>.
            </p>
          </div>
        </section>
      </MarketingShell>
    </MagneticCursor>
  );
}
