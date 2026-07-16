// Registry of public-page templates, layered on top of /assets/leaderboard.css.
// All templates share the SAME markup and data-* hooks, so leaderboard.js
// (countdown, rows, top3, socials, postback live updates) works unchanged.
// Most templates are colour/typography skins; the "layout" templates
// (podium/broadcast/cards/arena) and the reference-based set
// (quest/vault/tournament/champion/terminal/rewards/amber/copper) additionally
// rearrange the shared blocks via CSS grid/flex for genuinely different page
// compositions.
// The chosen template id is stored in sites.theme_json.template and reaches
// the renderer via data.branding.template.
import { MIDNIGHT_CSS } from "./midnight.js";
import { NEON_CSS } from "./neon.js";
import { MINIMAL_CSS } from "./minimal.js";
import { SPONSOR_CSS } from "./sponsor.js";
import { ESPORTS_CSS } from "./esports.js";
import { ROYALE_CSS } from "./royale.js";
import { OCEAN_CSS } from "./ocean.js";
import { PODIUM_CSS } from "./podium.js";
import { BROADCAST_CSS } from "./broadcast.js";
import { CARDS_CSS } from "./cards.js";
import { ARENA_CSS } from "./arena.js";
import { QUEST_CSS } from "./quest.js";
import { VAULT_CSS } from "./vault.js";
import { TOURNAMENT_CSS } from "./tournament.js";
import { CHAMPION_CSS } from "./champion.js";
import { TERMINAL_CSS } from "./terminal.js";
import { REWARDS_CSS } from "./rewards.js";
import { AMBER_CSS } from "./amber.js";
import { COPPER_CSS } from "./copper.js";

export const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Purple night with a clean cyan glow.",
    css: "",
    presets: [
      { id: "electric", name: "Electric", accentA: "#5ad9ff", accentB: "#7b8cff" },
      { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
      { id: "emerald", name: "Emerald", accentA: "#3cf2b1", accentB: "#35a7ff" },
    ],
  },
  midnight: {
    id: "midnight",
    name: "Midnight Gold",
    description: "Black felt, molten gold, premium casino energy.",
    css: MIDNIGHT_CSS,
    presets: [
      { id: "molten", name: "Molten", accentA: "#f8e7a0", accentB: "#c8871c" },
      { id: "champagne", name: "Champagne", accentA: "#fff1bd", accentB: "#d3a84f" },
      { id: "copper", name: "Copper", accentA: "#ffbe7a", accentB: "#a8582c" },
    ],
  },
  neon: {
    id: "neon",
    name: "Neon Casino",
    description: "Cyber casino lights with high-energy contrast.",
    css: NEON_CSS,
    presets: [
      { id: "cyber", name: "Cyber", accentA: "#00ffd1", accentB: "#ff2cd0" },
      { id: "ultraviolet", name: "Ultraviolet", accentA: "#7b61ff", accentB: "#ff3ea5" },
      { id: "laser", name: "Laser", accentA: "#d7ff32", accentB: "#00c2ff" },
    ],
  },
  minimal: {
    id: "minimal",
    name: "Minimal Light",
    description: "Editorial, sponsor-safe, and intentionally quiet.",
    css: MINIMAL_CSS,
    presets: [
      { id: "studio", name: "Studio", accentA: "#15171a", accentB: "#0066ff" },
      { id: "forest", name: "Forest", accentA: "#14532d", accentB: "#00a884" },
      { id: "plum", name: "Plum", accentA: "#572b67", accentB: "#d1498b" },
    ],
  },
  sponsor: {
    id: "sponsor",
    name: "Sponsor Dark",
    description: "Polished brand campaign styling for sponsor activations.",
    css: SPONSOR_CSS,
    presets: [
      { id: "ember", name: "Ember", accentA: "#ff4d4d", accentB: "#ff9f43" },
      { id: "enterprise", name: "Enterprise", accentA: "#4f8cff", accentB: "#7357ff" },
      { id: "mint", name: "Mint", accentA: "#42e6a4", accentB: "#16a6d9" },
    ],
  },
  esports: {
    id: "esports",
    name: "Arena Esports",
    description: "Angular match-day graphics with competitive punch.",
    css: ESPORTS_CSS,
    presets: [
      { id: "lime", name: "Lime", accentA: "#cdff1f", accentB: "#72ff3d" },
      { id: "redline", name: "Redline", accentA: "#ff3b3b", accentB: "#ff7a1a" },
      { id: "ice", name: "Ice", accentA: "#7de8ff", accentB: "#4c68ff" },
    ],
  },
  royale: {
    id: "royale",
    name: "Royal Velvet",
    description: "Deep velvet, warm gold, and high-roller polish.",
    css: ROYALE_CSS,
    presets: [
      { id: "velvet", name: "Velvet", accentA: "#ffcc7c", accentB: "#ff6a9f" },
      { id: "amethyst", name: "Amethyst", accentA: "#e6c6ff", accentB: "#a855f7" },
      { id: "ruby", name: "Ruby", accentA: "#ffd0c9", accentB: "#d92f5a" },
    ],
  },
  ocean: {
    id: "ocean",
    name: "Electric Blue",
    description: "Deep ocean gradients with crisp electric highlights.",
    css: OCEAN_CSS,
    presets: [
      { id: "current", name: "Current", accentA: "#51dbff", accentB: "#4776ff" },
      { id: "lagoon", name: "Lagoon", accentA: "#4fffd2", accentB: "#1697d5" },
      { id: "arctic", name: "Arctic", accentA: "#d8fbff", accentB: "#68a4ff" },
    ],
  },
  podium: {
    id: "podium",
    name: "Podium Spotlight",
    description: "A raised winner podium up top; the ranked list starts at #4.",
    css: PODIUM_CSS,
    presets: [
      { id: "violet", name: "Violet", accentA: "#8b6bff", accentB: "#42e6ff" },
      { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
      { id: "gold", name: "Gold", accentA: "#ffd15c", accentB: "#ff9f43" },
    ],
  },
  broadcast: {
    id: "broadcast",
    name: "Split Broadcast",
    description: "Sticky stream + brand rail on the left, full standings on the right.",
    css: BROADCAST_CSS,
    presets: [
      { id: "signal", name: "Signal", accentA: "#3b82ff", accentB: "#38e1c6" },
      { id: "ember", name: "Ember", accentA: "#ff5f6d", accentB: "#ffc371" },
      { id: "aurora", name: "Aurora", accentA: "#7b61ff", accentB: "#42e6ff" },
    ],
  },
  cards: {
    id: "cards",
    name: "Card Grid",
    description: "Top 3 as big cards, everyone else as a responsive grid of player cards.",
    css: CARDS_CSS,
    presets: [
      { id: "blossom", name: "Blossom", accentA: "#ff5fae", accentB: "#ffb347" },
      { id: "grape", name: "Grape", accentA: "#a855f7", accentB: "#ff5fae" },
      { id: "reef", name: "Reef", accentA: "#42e6ff", accentB: "#ff5fae" },
    ],
  },
  arena: {
    id: "arena",
    name: "Neon Arena",
    description: "Angular esports rows with wager bars showing the gap to the leader.",
    css: ARENA_CSS,
    presets: [
      { id: "lime", name: "Lime", accentA: "#cdff1f", accentB: "#72ff3d" },
      { id: "redline", name: "Redline", accentA: "#ff3b3b", accentB: "#ff7a1a" },
      { id: "ice", name: "Ice", accentA: "#7de8ff", accentB: "#4c68ff" },
    ],
  },
  quest: {
    id: "quest",
    name: "Quest Light",
    description: "Light app-style page: compact header with info chips, standings first.",
    css: QUEST_CSS,
    presets: [
      { id: "sky", name: "Sky", accentA: "#2f6bff", accentB: "#00b3a4" },
      { id: "grape", name: "Grape", accentA: "#7c5cff", accentB: "#ff5fae" },
      { id: "leaf", name: "Leaf", accentA: "#10b981", accentB: "#2f6bff" },
    ],
  },
  vault: {
    id: "vault",
    name: "Prize Vault",
    description: "Split hero with a boxed prize-pool race card, stat strip, gold podium.",
    css: VAULT_CSS,
    presets: [
      { id: "gold", name: "Gold", accentA: "#ffd15c", accentB: "#f0a93a" },
      { id: "emerald", name: "Emerald", accentA: "#4bd48a", accentB: "#2f9d67" },
      { id: "ruby", name: "Ruby", accentA: "#ff8aa0", accentB: "#d92f5a" },
    ],
  },
  tournament: {
    id: "tournament",
    name: "Tournament",
    description: "Countdown-first: a giant race clock hero, trophy top 3, numbered list.",
    css: TOURNAMENT_CSS,
    presets: [
      { id: "signal", name: "Signal", accentA: "#4fc3f7", accentB: "#3b82f6" },
      { id: "lime", name: "Lime", accentA: "#a3e635", accentB: "#22c55e" },
      { id: "flare", name: "Flare", accentA: "#ff9f43", accentB: "#ff5f6d" },
    ],
  },
  champion: {
    id: "champion",
    name: "Champion Stage",
    description: "Broadcast banner hero with prize facts, then a stepped pedestal stage.",
    css: CHAMPION_CSS,
    presets: [
      { id: "gold", name: "Gold", accentA: "#f4c85a", accentB: "#f0972f" },
      { id: "violet", name: "Violet", accentA: "#8b6bff", accentB: "#42e6ff" },
      { id: "mint", name: "Mint", accentA: "#42e6a4", accentB: "#16a6d9" },
    ],
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    description: "The whole board inside a terminal window: prompt lines, dense table.",
    css: TERMINAL_CSS,
    presets: [
      { id: "matrix", name: "Matrix", accentA: "#39d98a", accentB: "#2fae6e" },
      { id: "amber", name: "Amber", accentA: "#e8c14c", accentB: "#c8871c" },
      { id: "ice", name: "Ice", accentA: "#5ad9ff", accentB: "#3b82f6" },
    ],
  },
  rewards: {
    id: "rewards",
    name: "Rewards",
    description: "One centered treasure card holds prize, clock and CTA; pedestals below.",
    css: REWARDS_CSS,
    presets: [
      { id: "violet", name: "Violet", accentA: "#7c5cff", accentB: "#4aa0ff" },
      { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
      { id: "reef", name: "Reef", accentA: "#42e6ff", accentB: "#7c5cff" },
    ],
  },
  amber: {
    id: "amber",
    name: "Amber Arena",
    description: "Two-column: sticky rail with prize, clock and code; standings beside it.",
    css: AMBER_CSS,
    presets: [
      { id: "amber", name: "Amber", accentA: "#ffb84d", accentB: "#ff8a1e" },
      { id: "ember", name: "Ember", accentA: "#ff6a4d", accentB: "#ffb347" },
      { id: "sun", name: "Sun", accentA: "#ffd15c", accentB: "#ff9f43" },
    ],
  },
  copper: {
    id: "copper",
    name: "Copper Glow",
    description: "Winners' gallery: the podium is the hero centerpiece, quiet ledger below.",
    css: COPPER_CSS,
    presets: [
      { id: "copper", name: "Copper", accentA: "#f0a95a", accentB: "#d1702a" },
      { id: "rose", name: "Rose", accentA: "#ff9a8b", accentB: "#d1702a" },
      { id: "brass", name: "Brass", accentA: "#f0b45a", accentB: "#b8862c" },
    ],
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const validTemplate = (id) => (Object.hasOwn(TEMPLATES, id) ? id : "classic");
export const templateCss = (id) => TEMPLATES[validTemplate(id)].css;
export const templateCatalog = () => TEMPLATE_IDS.map((id) => ({
  id: TEMPLATES[id].id,
  name: TEMPLATES[id].name,
  description: TEMPLATES[id].description,
  presets: TEMPLATES[id].presets,
}));
