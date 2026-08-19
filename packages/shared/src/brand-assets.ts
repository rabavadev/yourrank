/**
 * Canonical YourRank identity.
 *
 * Product surfaces use this module for the mark geometry. The mark inherits
 * `currentColor` by default so dark/light treatment follows its surface.
 */
export const BRAND_NAME = "YourRank";
export const BRAND_COLORS = {
  dark: "#0A0A0A",
  light: "#FFFFFF",
  blue: "#2200FF",
} as const;
export type BrandVariant = "dark" | "light" | "blue";

const MARK_RECTS = `
  <rect x="3" y="13" width="6" height="8" rx="1"/>
  <rect x="10" y="8" width="6" height="13" rx="1"/>
  <rect x="17" y="3" width="4" height="18" rx="1"/>`;

function fillForVariant(variant: BrandVariant | "currentColor"): string {
  return variant === "currentColor" ? "currentColor" : BRAND_COLORS[variant];
}

export function brandMarkSvg({
  className = "lb-brand-mark-svg",
  variant = "currentColor",
  title,
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
  title?: string;
} = {}): string {
  const fill = fillForVariant(variant);
  const titleMarkup = title ? `<title>${title}</title>` : "";
  return `<svg class="${className}" viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="${title ? "false" : "true"}"${title ? ` role="img"` : ""}>${titleMarkup}<g fill="${fill}">${MARK_RECTS}</g></svg>`;
}

export function brandWordmarkSvg({
  className = "yr-wordmark",
  variant = "currentColor",
  title = BRAND_NAME,
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
  title?: string;
} = {}): string {
  const fill = fillForVariant(variant);
  return `<svg class="${className}" viewBox="0 0 164 32" width="164" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}"><g fill="${fill}"><rect x="1" y="17" width="8" height="12" rx="1"/><rect x="10" y="10" width="8" height="19" rx="1"/><rect x="20" y="1" width="6" height="28" rx="1"/></g><text x="35" y="23" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="600" letter-spacing="-0.6">${BRAND_NAME}</text></svg>`;
}

export function brandLockupHtml({
  className = "yr-brand-lockup",
  markClassName = "yr-brand-lockup-mark",
  wordClassName = "yr-brand-lockup-word",
  variant = "currentColor",
  href,
  ariaLabel = BRAND_NAME,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  variant?: BrandVariant | "currentColor";
  href?: string;
  ariaLabel?: string;
} = {}): string {
  const content = `<span class="${markClassName}">${brandMarkSvg({ variant })}</span><span class="${wordClassName}">${BRAND_NAME}</span>`;
  return href
    ? `<a class="${className}" href="${href}" aria-label="${ariaLabel}">${content}</a>`
    : `<span class="${className}" aria-label="${ariaLabel}">${content}</span>`;
}

export function brandLogoSvg({
  className = "yr-logo-full",
  variant = "currentColor",
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
} = {}): string {
  return brandWordmarkSvg({ className, variant });
}

export function brandPoweredBySvg({
  className = "yr-powered-by",
  variant = "currentColor",
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
} = {}): string {
  const fill = fillForVariant(variant);
  return `<svg class="${className}" viewBox="0 0 220 40" width="220" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Powered by ${BRAND_NAME}"><text x="0" y="16" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="500" letter-spacing="1.2">POWERED BY</text><g transform="translate(0 19)" fill="${fill}"><rect x="0" y="13" width="6" height="8" rx="1"/><rect x="9" y="8" width="6" height="13" rx="1"/><rect x="18" y="3" width="4" height="18" rx="1"/></g><text x="29" y="38" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" letter-spacing="-0.5">${BRAND_NAME}</text></svg>`;
}

export function brandLoaderLogoSvg({ className = "yr-loader-logo-svg" }: { className?: string } = {}): string {
  return brandWordmarkSvg({ className, variant: "light" });
}
