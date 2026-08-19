/**
 * Canonical YourRank identity.
 *
 * The published mark is the geometry source: three bars in a 24 × 24 viewBox.
 * Wordmarks and badges scale and translate these same bars rather than
 * redrawing a second approximation. Product surfaces use `currentColor` by
 * default so treatment follows the surface.
 */
export const BRAND_NAME = "YourRank";
export const BRAND_COLORS = {
  dark: "#0A0A0A",
  light: "#FFFFFF",
  blue: "#2200FF",
  // The same brand blue lightened for readable text and focus on dark surfaces.
  darkSurface: "#756CFF",
} as const;
export type BrandVariant = "dark" | "light" | "blue";

export const BRAND_MARK_GEOMETRY = [
  { x: 3, y: 13, width: 6, height: 8, rx: 1 },
  { x: 10, y: 8, width: 6, height: 13, rx: 1 },
  { x: 17, y: 3, width: 4, height: 18, rx: 1 },
] as const;

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function markRectsSvg({ scale = 1, translateX = 0, translateY = 0 }: { scale?: number; translateX?: number; translateY?: number } = {}): string {
  return BRAND_MARK_GEOMETRY.map(
    ({ x, y, width, height, rx }) =>
      `<rect x="${formatNumber(x * scale + translateX)}" y="${formatNumber(y * scale + translateY)}" width="${formatNumber(width * scale)}" height="${formatNumber(height * scale)}" rx="${formatNumber(rx * scale)}"/>`,
  ).join("");
}

function fillForVariant(variant: BrandVariant | "currentColor"): string {
  return variant === "currentColor" ? "currentColor" : BRAND_COLORS[variant];
}

export function brandMarkSvg({
  className = "lb-brand-mark-svg",
  variant = "currentColor",
  title,
  width = "100%",
  height = "100%",
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
  title?: string;
  width?: string;
  height?: string;
} = {}): string {
  const fill = fillForVariant(variant);
  const titleMarkup = title ? `<title>${title}</title>` : "";
  return `<svg class="${className}" viewBox="0 0 24 24" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="${title ? "false" : "true"}"${title ? ` role="img"` : ""}>${titleMarkup}<g fill="${fill}">${markRectsSvg()}</g></svg>`;
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
  const wordmarkBars = markRectsSvg({ scale: 4 / 3 });
  return `<svg class="${className}" viewBox="0 0 176 32" width="176" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}"><g fill="${fill}">${wordmarkBars}</g><text x="36" y="23" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="600" letter-spacing="-0.4">${BRAND_NAME}</text></svg>`;
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

export function brandLoaderHtml({ className = "yr-loader-brand" }: { className?: string } = {}): string {
  return brandLockupHtml({
    className,
    markClassName: "yr-loader-brand-mark",
    wordClassName: "yr-loader-brand-word",
    variant: "light",
  });
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
  background,
}: {
  className?: string;
  variant?: BrandVariant | "currentColor";
  background?: { fill: string; stroke: string };
} = {}): string {
  const fill = fillForVariant(variant);
  const backgroundMarkup = background ? `<rect x="0.5" y="0.5" width="219" height="43" rx="6" fill="${background.fill}" stroke="${background.stroke}"/>` : "";
  return `<svg class="${className}" viewBox="0 0 220 44" width="220" height="44" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Powered by ${BRAND_NAME}">${backgroundMarkup}<text x="42" y="20" fill="${fill}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10" font-weight="500" letter-spacing="1.2">POWERED BY</text><g transform="translate(14 11)" fill="${fill}">${markRectsSvg()}</g><text x="42" y="34" fill="${fill}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="14" font-weight="600">${BRAND_NAME}</text></svg>`;
}

export function brandPoweredByHtml({ className = "yr-powered-by" }: { className?: string } = {}): string {
  return `<span class="${className}" aria-label="Powered by ${BRAND_NAME}"><span class="yr-powered-by-label">Powered by</span>${brandLockupHtml({ className: "yr-powered-by-lockup", markClassName: "yr-powered-by-mark", wordClassName: "yr-powered-by-word" })}</span>`;
}

export function brandLoaderLogoSvg({ className = "yr-loader-logo-svg" }: { className?: string } = {}): string {
  return brandWordmarkSvg({ className, variant: "light" });
}
