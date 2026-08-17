import type { CSSProperties, ReactNode } from "react";

/**
 * Scroll-reveal primitives with zero client JS.
 *
 * Browsers with CSS scroll-driven animations (Chrome, Edge, Safari) fade-rise
 * these elements as they enter the viewport. Every other browser, and any
 * broken-JS scenario, simply shows the content. Visibility is never gated
 * behind hydration.
 */

interface RevealProps {
  children: ReactNode;
  className?: string;
}

export function Reveal({ children, className }: RevealProps) {
  return <div className={className ? `reveal ${className}` : "reveal"}>{children}</div>;
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Stagger({ children, className, style }: StaggerProps) {
  return (
    <div className={className ? `reveal-stagger ${className}` : "reveal-stagger"} style={style}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
