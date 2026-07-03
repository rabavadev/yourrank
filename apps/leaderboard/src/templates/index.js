// Registry of public-page templates. Each template is a CSS "skin" layered on
// top of /assets/leaderboard.css. Every template keeps the SAME markup and
// data-* hooks, so leaderboard.js (countdown, rows, top3, socials, postback
// live updates) works unchanged regardless of the selected template.
// The chosen template id is stored in sites.theme_json.template and reaches
// the renderer via data.branding.template.
import { MIDNIGHT_CSS } from "./midnight.js";

export const TEMPLATES = {
  // The original look — base stylesheet only, no override layer.
  classic: { id: "classic", name: "Classic", css: "" },
  // Template #1: black felt, molten gold.
  midnight: { id: "midnight", name: "Midnight Gold", css: MIDNIGHT_CSS },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES);

export const validTemplate = (id) => (TEMPLATES[id] ? id : "classic");
export const templateCss = (id) => TEMPLATES[validTemplate(id)].css;
