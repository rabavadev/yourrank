/**
 * Deterministic Gamer & Streamer Avatar Generator
 * Creates unique, neon-esports SVG avatars for streamers, viewers, and racers
 * based on their name, ID, or wallet seed.
 */

export interface AvatarTheme {
  from: string;
  to: string;
  accent: string;
  bg: string;
  glyph: string;
}

const PALETTES: Array<{ from: string; to: string; accent: string; bg: string }> = [
  { from: "#315CFF", to: "#00D2FF", accent: "#FFFFFF", bg: "#0B1536" }, // Cobalt Cyber
  { from: "#FF5E3A", to: "#FF2A6D", accent: "#FFFFFF", bg: "#2E0814" }, // Sunset Neon
  { from: "#05D550", to: "#00FFA3", accent: "#0A1F14", bg: "#042B16" }, // Acid Emerald
  { from: "#8A2BE2", to: "#DA70D6", accent: "#FFFFFF", bg: "#230A38" }, // Vapor Violet
  { from: "#FFB800", to: "#FF6B00", accent: "#261300", bg: "#361B00" }, // Champion Gold
  { from: "#00F2FE", to: "#4FACFE", accent: "#041C33", bg: "#031F3B" }, // Electric Blue
  { from: "#F857A6", to: "#FF5858", accent: "#FFFFFF", bg: "#380619" }, // Crimson Laser
  { from: "#11998E", to: "#38EF7D", accent: "#07241A", bg: "#06291C" }, // Matrix Mint
  { from: "#4E54C8", to: "#8F94FB", accent: "#FFFFFF", bg: "#131638" }, // Deep Space
  { from: "#F12711", to: "#F5AF19", accent: "#FFFFFF", bg: "#380E08" }, // Solar Flare
];

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  const str = String(seed || "gamer").trim();
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

export function getAvatarTheme(seed: string): AvatarTheme {
  const hash = hashSeed(seed);
  const palette = PALETTES[hash % PALETTES.length];
  const glyphs = ["crown", "shield", "hex", "lightning", "gem", "crest", "star", "initial"];
  const glyph = glyphs[(hash >> 3) % glyphs.length];
  return { ...palette, glyph };
}

function renderGlyph(glyph: string, initial: string, accent: string): string {
  switch (glyph) {
    case "crown":
      return `<path d="M7 16L5 8l4.5 3.5L12 6l2.5 5.5L19 8l-2 8H7z" fill="${accent}" opacity="0.95"/>`;
    case "shield":
      return `<path d="M12 4L5 7v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V7l-7-3z" fill="${accent}" opacity="0.9"/>`;
    case "hex":
      return `<polygon points="12,4 19,8 19,16 12,20 5,16 5,8" fill="${accent}" opacity="0.92"/>`;
    case "lightning":
      return `<polygon points="13,3 6,13 11,13 10,21 18,10 13,10" fill="${accent}" opacity="0.95"/>`;
    case "gem":
      return `<polygon points="12,4 19,9 12,20 5,9" fill="${accent}" opacity="0.92"/>`;
    case "star":
      return `<polygon points="12,3 14.8,8.5 21,9.3 16.5,13.7 17.6,19.8 12,16.8 6.4,19.8 7.5,13.7 3,9.3 9.2,8.5" fill="${accent}" opacity="0.95"/>`;
    case "crest":
      return `<circle cx="12" cy="12" r="7" fill="none" stroke="${accent}" stroke-width="2.5"/><circle cx="12" cy="12" r="3.5" fill="${accent}"/>`;
    case "initial":
    default:
      return `<text x="12" y="16" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="11" fill="${accent}" letter-spacing="-0.02em">${initial}</text>`;
  }
}

/**
 * Generates an SVG string of a customized identity avatar.
 */
export function generateAvatarSvg(seed: string, size = 32): string {
  const hash = hashSeed(seed);
  const theme = getAvatarTheme(seed);
  const initial = (seed.trim().charAt(0) || "Y").toUpperCase();
  const gradId = `yr_av_${hash % 10000}`;
  const angle = (hash % 4) * 45;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" class="yr-avatar-svg" aria-hidden="true">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
    <filter id="${gradId}_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="${theme.from}" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="24" height="24" rx="7" fill="${theme.bg}"/>
  <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="url(#${gradId})" filter="url(#${gradId}_glow)"/>
  <g transform="translate(0, 0)">
    ${renderGlyph(theme.glyph, initial, theme.accent)}
  </g>
</svg>`;
}

/**
 * Generates an SVG Data URI suitable for <img src="..."> or CSS backgrounds.
 */
export function generateAvatarDataUri(seed: string): string {
  const svg = generateAvatarSvg(seed, 48);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
