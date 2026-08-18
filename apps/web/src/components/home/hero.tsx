"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DEVIN_EASE } from "./reveal";

const HEADLINE = ["Turn viewers into a", "community that returns."];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-devin-surface px-6 pb-20 pt-28 sm:pb-44 sm:pt-44">
      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="mx-auto max-w-[14ch] text-[clamp(3rem,7vw,5.8rem)] font-medium leading-[0.96] tracking-[-0.04em] text-devin-ink">
          {HEADLINE.map((line, index) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: "105%", opacity: 0.35 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.82, delay: 0.08 + index * 0.09, ease: DEVIN_EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: DEVIN_EASE }}
          className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-devin-ink-soft sm:mt-7 sm:text-lg"
        >
          Publish a branded site, keep the conversation active on Telegram, and turn viewer participation into rewards—all from one workspace.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.46, ease: DEVIN_EASE }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-9"
        >
          <a href="/signup" data-magnetic className="inline-flex min-h-12 items-center rounded-[2px] bg-devin-ink px-6 text-sm font-medium text-white transition-colors hover:bg-black">
            Get started
          </a>
          <a href="/demo" data-magnetic className="inline-flex min-h-12 items-center rounded-[2px] border border-devin-line bg-white px-6 text-sm font-medium text-devin-ink transition-colors hover:border-devin-ink/40">
            Explore the live demo
          </a>
        </motion.div>

        <motion.a
          href="/sites"
          data-magnetic
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.58, ease: DEVIN_EASE }}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-devin-line bg-white py-1.5 pl-2 pr-4 text-xs text-devin-ink"
        >
          <span className="rounded-full bg-devin-primary px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white">Live</span>
          See the connected suite
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 text-devin-ink-soft" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </div>
    </section>
  );
}
