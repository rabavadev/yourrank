import { Reveal, Stagger } from "./reveal";

const MARQUEE_ITEMS = [
  "Sites",
  "Telegram",
  "Credits & Shop",
  "OBS Overlay",
  "Provably Fair Games",
  "Edge Network",
];

export function PillarMarquee() {
  return (
    <section
      aria-label="Product pillars"
      className="overflow-hidden border-y border-devin-line-soft bg-devin-surface py-5"
    >
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center" aria-hidden={half === 1}>
              {MARQUEE_ITEMS.map((item) => (
                <span
                  key={`${half}-${item}`}
                  className="flex items-center whitespace-nowrap font-mono text-sm text-devin-ink-soft"
                >
                  <span className="px-6">{item}</span>
                  <span className="h-1 w-1 rounded-full bg-devin-muted/50" aria-hidden="true" />
                </span>
              ))}
            </div>
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
    <section className="bg-devin-surface px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-devin-primary">
            The closed engagement loop
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-medium leading-[1.1] tracking-[-0.01em] text-devin-ink sm:text-5xl">
            The community loop stays connected.
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-devin-line-soft bg-devin-line-soft sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-devin-surface p-6 sm:p-8">
              <p className="font-mono text-xs text-devin-muted">{step.n}</p>
              <h3 className="mt-3 text-lg font-medium text-devin-ink">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-devin-ink-soft">{step.body}</p>
            </div>
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
    <section className="border-t border-devin-line-soft bg-devin-secondary/40 px-6 py-24 sm:py-28">
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
            <a
              key={p.tag}
              href={p.href}
              className="group flex h-full flex-col rounded-2xl border border-devin-line-soft bg-devin-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-devin-ink/30 sm:p-8"
            >
              <p className="font-mono text-[11px] tracking-widest text-devin-muted">{p.tag}</p>
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
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-devin-line-soft bg-devin-surface px-6 py-24 sm:py-28">
      <div className="hero-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-devin-ink sm:text-6xl">
            Choose the first cue. Keep the whole loop in reach.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-devin-ink-soft">
            No code, no hosting, no card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              className="rounded-sm bg-devin-primary px-[15px] py-2 text-[15px] font-medium text-white transition-colors hover:bg-devin-primary-hover"
            >
              Start free
            </a>
            <a
              href="/demo"
              className="rounded-sm border border-devin-line bg-devin-surface px-[15px] py-2 text-[15px] font-medium text-devin-ink transition-colors hover:border-devin-ink/40"
            >
              Explore the live demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
