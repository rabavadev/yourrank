import { Reveal, Stagger, StaggerItem } from "./reveal";

const MARQUEE_ITEMS = [
  "Sites",
  "Telegram",
  "Credits & Shop",
  "OBS Overlay",
  "Provably Fair Games",
  "Edge Network",
];

export function PillarMarquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section className="border-y border-devin-line bg-devin-surface py-5">
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center gap-10">
          {doubled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap font-mono text-sm text-devin-ink-soft"
            >
              {item}
              <span className="h-1 w-1 rounded-full bg-devin-ink-soft/40" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Attract on Stream & Site",
    body: "Viewers visit your branded site to check live standings, upcoming challenges, and mini-games.",
  },
  {
    n: "02",
    title: "Retain via Telegram",
    body: "Between streams, subscribers use Telegram commands and get alerts for new shop drops.",
  },
  {
    n: "03",
    title: "Reward with Credits & Shop",
    body: "Kick channel points convert into credits. Viewers redeem rewards and return to your next broadcast.",
  },
];

export function LoopSection() {
  return (
    <section className="bg-devin-surface px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-devin-primary">
            The closed engagement loop
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-devin-ink sm:text-5xl">
            The community loop stays connected.
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-lg border border-devin-line bg-devin-line sm:grid-cols-3">
          {STEPS.map((step) => (
            <StaggerItem key={step.n} className="bg-devin-surface p-8">
              <p className="font-mono text-xs text-devin-ink-soft">{step.n}</p>
              <h3 className="mt-3 text-lg font-medium text-devin-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-devin-ink-soft">{step.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const PRODUCTS = [
  {
    tag: "SITES",
    title: "Give your community a public home.",
    body: "Live leaderboards, countdowns, offers, games, and an OBS-ready overlay at a shareable address.",
    href: "/sites",
    cta: "Build your site",
  },
  {
    tag: "TELEGRAM",
    title: "Bring viewers back between streams.",
    body: "Commands, broadcasts, and tracked offers that give viewers a reason to return.",
    href: "/telegram",
    cta: "Connect Telegram",
  },
  {
    tag: "CREDITS & SHOP",
    title: "Make participation count.",
    body: "Kick point mapping, viewer balances, reward catalog, and a transparent fulfilment ledger.",
    href: "/credits",
    cta: "Configure credits",
  },
];

export function ProductsSection() {
  return (
    <section className="border-t border-devin-line bg-devin-secondary/40 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-devin-primary">
            Product pillars
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-devin-ink sm:text-5xl">
            Three products. One continuous community.
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-4 sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <StaggerItem key={p.tag}>
              <a
                href={p.href}
                className="group flex h-full flex-col rounded-lg border border-devin-line bg-devin-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-devin-ink/30 hover:shadow-[0_16px_48px_-16px_rgba(25,25,25,0.18)]"
              >
                <p className="font-mono text-[11px] tracking-widest text-devin-ink-soft">{p.tag}</p>
                <h3 className="mt-4 text-xl font-medium leading-snug text-devin-ink">{p.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-devin-ink-soft">
                  {p.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-devin-primary">
                  {p.cta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-devin-line bg-devin-surface px-6 py-28 sm:py-36">
      <div className="hero-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-devin-ink sm:text-6xl">
            Choose the first cue. Keep the whole loop in reach.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-devin-ink-soft">
            No code, no hosting, no card required.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="rounded bg-devin-primary px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-devin-primary-hover"
            >
              Start free
            </a>
            <a
              href="/demo"
              className="rounded border border-devin-line bg-devin-surface px-5 py-2.5 text-[15px] font-medium text-devin-ink transition-colors hover:border-devin-ink/40"
            >
              Explore the live demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
