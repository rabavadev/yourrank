"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const DEVIN_EASE = [0.2, 0.7, 0.2, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

/** Fade + rise on scroll into view. The core devin.ai section motion. */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: DEVIN_EASE }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

/** Staggers direct children by 90ms each when the group scrolls into view. */
export function Stagger({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: DEVIN_EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
