"use client";

import { motion } from "framer-motion";
import { DEVIN_EASE } from "./reveal";

const HEADLINE = "Turn viewers into a community that returns.";

function WordStagger({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block will-change-transform"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 + i * 0.06, ease: DEVIN_EASE }}
        >
          {word}
          {i < text.split(" ").length - 1 ? " " : ""}
        </motion.span>
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
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.85, ease: DEVIN_EASE }}
      className="relative mx-auto mt-16 w-full max-w-3xl overflow-hidden rounded-lg border border-devin-line bg-white text-left"
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-devin-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="h-2.5 w-2.5 rounded-full bg-devin-secondary" />
        <span className="ml-3 font-mono text-xs text-devin-ink-soft">Illustrative preview · synthetic data</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-devin-ink-soft">
              Creator workspace
            </p>
            <p className="text-sm font-medium text-devin-ink">Demo Board</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-devin-line px-2.5 py-1 font-mono text-[11px] text-devin-ink">
            <motion.span
              className="yr-live-dot h-1.5 w-1.5 rounded-full bg-devin-primary"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            LIVE
          </span>
        </div>

        <div className="divide-y divide-devin-line/60 rounded-md border border-devin-line">
          {LEADERBOARD_ROWS.map((row, i) => (
            <motion.div
              key={row.rank}
              className="flex items-center justify-between px-4 py-2.5"
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.15 + i * 0.12, ease: DEVIN_EASE }}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-devin-ink-soft">{row.rank}</span>
                <span className="text-sm text-devin-ink">{row.name}</span>
              </span>
              <span className="font-mono text-sm text-devin-ink">{row.points} pts</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
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
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: DEVIN_EASE }}
        >
          <a
            href="/demo"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-devin-line bg-white px-3.5 py-1.5 text-[13px] text-devin-ink transition-colors hover:border-devin-ink/40"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-devin-primary opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-devin-primary" />
            </span>
            The Streamer Community Suite · V4 Live
          </a>
        </motion.div>

        <h1 className="mt-7 text-[clamp(2.75rem,6.5vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.02em] text-devin-ink">
          <WordStagger text={HEADLINE} />
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-devin-ink-soft"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: DEVIN_EASE }}
        >
          YourRank connects your public site, Telegram community, and Kick-powered
          viewer credits and shop in one unified workspace.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: DEVIN_EASE }}
        >
          <a
            href="/signup"
            className="inline-flex min-h-11 items-center rounded bg-devin-primary px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-devin-primary-hover"
          >
            Build your community hub
          </a>
          <a
            href="/demo"
            className="inline-flex min-h-11 items-center rounded border border-devin-line bg-devin-surface px-5 py-2.5 text-[15px] font-medium text-devin-ink transition-colors hover:border-devin-ink/40"
          >
            Explore the live demo
          </a>
        </motion.div>

        <motion.p
          className="mt-6 font-mono text-xs text-devin-ink-soft"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          For entertainment and community engagement only. No bets, no cash prizes.
        </motion.p>
      </div>

      <div className="relative">
        <DashboardMock />
      </div>
    </section>
  );
}
