import type { Metadata } from "next";
import { MagneticCursor } from "@/components/home/magnetic-cursor";
import { MarketingShell } from "@/components/site-shell";
import { StatusPanel } from "./status-panel";

export const metadata: Metadata = {
  title: "Status — YourRank",
  description: "Live system status for YourRank: sites, dashboard, database, and analytics pipeline.",
  alternates: { canonical: "https://yourrank.site/status" },
};

export default function StatusPage() {
  return (
    <MagneticCursor>
      <MarketingShell>
        <section className="px-6 pb-12 pt-32 sm:pt-40">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-devin-primary">Status</p>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
              System status.
            </h1>
          </div>
        </section>
        <section className="px-6 pb-24 sm:pb-32">
          <div className="mx-auto max-w-3xl">
            <StatusPanel />
          </div>
        </section>
      </MarketingShell>
    </MagneticCursor>
  );
}
