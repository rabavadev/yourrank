import { Fragment } from "react";

const HEADLINE = "Turn viewers into a community that returns.";

/**
 * Word-by-word headline reveal, pure CSS.
 * Words render visible in SSR and animate on first paint via keyframes,
 * so the headline can never be stuck invisible behind dead client JS.
 */
function WordStagger({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            className="anim-word"
            style={{ "--d": `${0.1 + i * 0.06}s` } as React.CSSProperties}
          >
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

const LEADERBOARD_ROWS = [
  { rank: "#1", name: "Alex", points: "9,500" },
  { rank: "#2", name: "Bree", points: "7,200" },
  { rank: "#3", name: "Casey", points: "5,400" },
  { rank: "#4", name: "Drew", points: "3,100" },
  { rank: "#5", name: "Ellis", points: "1,800" },
];

function DashboardMock() {
  return (
    <div
      className="anim-enter-scale relative mx-auto mt-16 w-full max-w-3xl overflow-hidden rounded-2xl border border-devin-line bg-devin-surface text-left"
      style={{ "--d": "0.85s" } as React.CSSProperties}
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-devin-line-soft px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="ml-3 truncate font-mono text-xs text-devin-muted">
          yourrank.site/dashboard
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest text-devin-muted">
              Creator workspace
            </p>
            <p className="truncate text-sm font-medium text-devin-ink">Demo Board</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-devin-line px-2.5 py-1 font-mono text-[11px] text-devin-ink">
            <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-devin-primary" />
            LIVE
          </span>
        </div>

        <div className="divide-y divide-devin-line-soft rounded-md border border-devin-line-soft">
          {LEADERBOARD_ROWS.map((row, i) => (
            <div
              key={row.rank}
              className="anim-enter grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5"
              style={{ "--d": `${1.15 + i * 0.12}s` } as React.CSSProperties}
            >
              <span className="font-mono text-xs text-devin-muted">{row.rank}</span>
              <span className="truncate text-sm text-devin-ink">{row.name}</span>
              <span className="font-mono text-sm whitespace-nowrap text-devin-ink">
                {row.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-devin-surface px-6 pb-24 pt-36 sm:pt-44">
      <div className="hero-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-2/3 h-[420px] w-[820px] -translate-x-1/2"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="anim-enter">
          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-devin-line bg-devin-surface px-3.5 py-1.5 text-[13px] text-devin-ink transition-colors hover:border-devin-ink/40"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-devin-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-devin-primary" />
            </span>
            The Streamer Community Suite · V4 Live
          </a>
        </div>

        <h1 className="mt-7 text-[clamp(2.5rem,6.5vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.02em] text-devin-ink">
          <WordStagger text={HEADLINE} />
        </h1>

        <p
          className="anim-enter mx-auto mt-6 max-w-xl text-lg leading-relaxed text-devin-ink-soft"
          style={{ "--d": "0.55s" } as React.CSSProperties}
        >
          YourRank connects your public site, Telegram community, and Kick-powered
          viewer credits and shop in one unified workspace.
        </p>

        <div
          className="anim-enter mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ "--d": "0.7s" } as React.CSSProperties}
        >
          <a
            href="/signup"
            className="rounded-sm bg-devin-primary px-[15px] py-2 text-[15px] font-medium text-white transition-colors hover:bg-devin-primary-hover"
          >
            Build your community hub
          </a>
          <a
            href="/demo"
            className="rounded-sm border border-devin-line bg-devin-surface px-[15px] py-2 text-[15px] font-medium text-devin-ink transition-colors hover:border-devin-ink/40"
          >
            Explore the live demo
          </a>
        </div>

        <p
          className="anim-enter mt-6 font-mono text-xs text-devin-muted"
          style={{ "--d": "0.85s" } as React.CSSProperties}
        >
          For entertainment and community engagement only. No bets, no cash prizes.
        </p>
      </div>

      <div className="relative">
        <DashboardMock />
      </div>
    </section>
  );
}
