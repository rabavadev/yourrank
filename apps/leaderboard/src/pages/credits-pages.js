// Per-route Rewards & Shop page bodies generated from the legacy monolithic creditsContent.
// This keeps the markup source-of-truth in pages/credits.js while producing separate pages.
import { creditsContent } from "./credits.js";

function between(html, start, end) {
  const i = html.indexOf(start);
  if (i < 0) throw new Error("credits-pages: start not found: " + start.slice(0, 60));
  const j = html.indexOf(end, i + start.length);
  if (j < 0) throw new Error("credits-pages: end not found after " + start.slice(0, 60));
  return html.slice(i, j + end.length);
}

function wrap(tab, body) {
  return `<div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>

<div id="cr-app" data-cr-tab="${tab}" hidden>
${body}
</div>

<div id="cr-empty" class="empty" hidden>
  <p>Loading your credits dashboard…</p>
</div>`;
}

const raw = creditsContent.replace(/<div class="an-head">[\s\S]*?<\/div>\s*/, "");

const statusHero = between(raw, '<section class="card card--status" id="cr-status">', '</section>');

let onboarding = between(raw, '<section class="card" id="cr-onboarding" hidden>', '</section>');
onboarding = onboarding.replace(
  /<button class="btn btn--sm" data-cr-jump="([^"]+)" type="button">([^<]+)<\/button>/g,
  (_, jump, text) => {
    const href =
      jump === "cr-channel" ? "/dashboard/rewards/channel" :
      jump === "cr-maps" ? "/dashboard/rewards/rewards" :
      jump === "cr-shop" ? "/dashboard/rewards/shop" :
      "#";
    return `<a class="btn btn--sm" href="${href}">${text}</a>`;
  }
);

const channelSection = between(raw, '<section class="card" id="cr-channel">', '</section>');
const mapsSection = between(raw, '<section class="card" id="cr-maps">', '</section>');
const shopSection = between(raw, '<section class="card" id="cr-shop">', '</section>');
const redemptionsSection = between(raw, '<section class="card" id="cr-redemptions">', '</section>');
const viewersSection = between(raw, '<section class="card" id="cr-viewers">', '</section>');

const settingsDetails = between(raw, '<details class="card cr-advanced" id="cr-settings">', '</details>');
const settingsSections = [...settingsDetails.matchAll(/<section class="cr-settings-section"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[0]);
if (settingsSections.length < 3) throw new Error("credits-pages: expected 3 settings sections");
const [planUsageSection, viewerLoginSection, historySectionRaw] = settingsSections;

const settingsForChannel = `<details class="card cr-advanced" id="cr-settings">
<summary>Settings &amp; tools</summary>
${planUsageSection}
${viewerLoginSection}
</details>`;

const historySection = historySectionRaw.replace(
  'class="cr-settings-section" id="cr-history"',
  'class="card" id="cr-history"'
);

// Split the legacy cr-maps section into auto-create rewards (cr-rewards) and manual mapping (cr-maps).
const h3Marker = '<h3>Create reward in Kick</h3>';
const h3Idx = mapsSection.indexOf(h3Marker);
if (h3Idx < 0) throw new Error("credits-pages: create reward heading not found");
const manualWithOpen = mapsSection.slice(0, h3Idx);
const createWithClose = mapsSection.slice(h3Idx);

const manualForm = between(manualWithOpen, '<form class="grid2" id="cr-reward-form">', '</form>');
const mapsPageSection = `<section class="card" id="cr-maps">
  <h2>Reward mapping</h2>
  <p class="card-sub">Manually map an existing Kick reward to YourRank credits.</p>
  <p class="hint" id="cr-reward-usage"></p>
  ${manualForm}
</section>`;

const rewardsPageSection = `<section class="card" id="cr-rewards">
  <h2>Kick rewards</h2>
  <p class="card-sub">Create and manage Kick channel rewards that grant YourRank credits.</p>
  <p class="hint" id="cr-reward-usage"></p>
  ${createWithClose}`;

export const channelPage = wrap("channel", [statusHero, onboarding, channelSection, settingsForChannel].join("\n"));
export const rewardsPage = wrap("rewards", [statusHero, rewardsPageSection].join("\n"));
export const mapsPage = wrap("maps", [statusHero, mapsPageSection].join("\n"));
export const shopPage = wrap("shop", [statusHero, shopSection].join("\n"));
export const viewersPage = wrap("viewers", [statusHero, viewersSection].join("\n"));
export const redemptionsPage = wrap("redemptions", [statusHero, redemptionsSection].join("\n"));
export const historyPage = wrap("history", [statusHero, historySection].join("\n"));
