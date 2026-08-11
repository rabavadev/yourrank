// Multi-section, branded streamer site shell. Reuses the leaderboard design tokens
// and template CSS while wrapping every public section (Home, Leaderboard, Shop,
// Games, My Credits) in a shared header, navigation, mobile tab bar and footer.
import {
  buildParts,
  composeMain,
  shareSection,
  shareScriptNonce,
  fontsHref,
  fontCss,
  logoSrcSet,
  renderLegalSidebar,
  footerDisclaimer,
  esc as renderEsc,
  safeUrl as renderSafeUrl,
} from "./render.jsx";
import { DEFAULT_EXTRA } from "./site.js";
import { validTemplate, templateCss, resolveOptions, templateHeader, templateFooter, templateParts } from "./templates/index.js";

const esc = renderEsc;
const safeUrl = renderSafeUrl;

const SECTION_LABELS = {
  home: "Home",
  leaderboard: "Leaderboard",
  shop: "Shop",
  games: "Games",
  me: "My Credits",
};

const SECTION_DESCRIPTIONS = {
  leaderboard: "See who is on top and chase the prize pool.",
  shop: "Spend your free credits on streamer rewards.",
  games: "Play original games and win more credits.",
  me: "Check your balance, history and redemptions.",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function siteSectionHref(section, slug, isCustomDomain) {
  if (isCustomDomain) return section === "home" ? "/" : `/${section}`;
  return section === "home" ? `/${slug}` : `/${slug}/${section}`;
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function sectionList(sections) {
  return ["home", "leaderboard", "shop", "games", "me"].filter((s) => sections[s] !== false);
}

function siteShellCss() {
  return `:root{
  --site-topbar-h: 60px;
  --site-bottom-h: 64px;
}
.btn--sm{font-size:.85rem;padding:.4rem .75rem}
.btn--kick{background:var(--kick,#10a37f);color:#fff;border-color:transparent}
.btn--success{background:var(--green,#10a37f);color:#003915}
@media (prefers-reduced-motion: reduce){
  .site-topbar *,.site-bottom-tabs *,.site-menu-panel *{animation:none!important;transition:none!important}
}
.site-topbar{position:sticky;top:0;z-index:100;width:100%;background:rgba(15,15,17,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--line,rgba(255,255,255,.06));box-sizing:border-box}
.site-topbar-inner{width:min(var(--wrap,1200px),100% - 2rem);margin:0 auto;height:var(--site-topbar-h);display:flex;align-items:center;gap:1rem;justify-content:space-between}
.site-brand{display:flex;align-items:center;gap:.6rem;color:var(--ink,#ededf0);text-decoration:none;font-weight:700;overflow:hidden;min-width:0}
.site-brand-logo{width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0}
.site-brand-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.site-topbar-nav{display:none;align-items:center;gap:.4rem}
.site-topbar-actions{display:none;align-items:center;gap:.6rem;flex-shrink:0}
.site-nav-link,.site-nav-link--active{display:inline-flex;align-items:center;padding:.45rem .75rem;border-radius:8px;color:var(--ink-soft,#a7a6a6);text-decoration:none;font-size:.92rem;font-weight:500;transition:color .15s,background .15s;white-space:nowrap}
.site-nav-link:hover,.site-nav-link:focus-visible{color:var(--ink,#ededf0);background:var(--panel-2,#1f1f1f);outline:none}
.site-nav-link--active{color:var(--ink,#ededf0);background:var(--panel-2,#1f1f1f)}
.site-balance-chip{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem .7rem .35rem .85rem;background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:999px;color:var(--ink,#ededf0);text-decoration:none;font-weight:600;font-size:.88rem;flex-shrink:0;max-width:220px}
.site-balance-chip:hover{border-color:var(--accent,#5771ff)}
.site-balance-amount{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.site-avatar{width:26px;height:26px;border-radius:50%;background:var(--primary-strong,#2200ff);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700;flex-shrink:0;overflow:hidden}
.site-avatar img{width:100%;height:100%;object-fit:cover}
.site-signin{display:flex;align-items:center;gap:.5rem}
.site-signin .btn{font-size:.82rem;padding:.4rem .75rem}
.site-menu{position:relative;display:flex;align-items:center;margin-left:auto}
.site-menu summary{list-style:none;cursor:pointer;display:grid;place-items:center;width:40px;height:40px;border-radius:8px;color:var(--ink,#ededf0);background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06))}
.site-menu summary::-webkit-details-marker{display:none}
.site-menu summary svg{width:22px;height:22px}
.site-menu[open] summary{background:var(--panel-2,#1f1f1f)}
.site-menu-panel{position:absolute;top:calc(100% + 8px);right:0;min-width:220px;background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:12px;padding:.6rem;box-shadow:0 20px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:.25rem;z-index:101}
.site-menu-panel .site-nav-link{justify-content:flex-start;padding:.65rem .8rem}
.site-menu-actions{display:flex;flex-direction:column;gap:.5rem;padding-top:.5rem;margin-top:.25rem;border-top:1px solid var(--line,rgba(255,255,255,.06))}
.site-bottom-tabs{position:fixed;bottom:0;left:0;right:0;z-index:99;background:rgba(15,15,17,.92);backdrop-filter:blur(12px);border-top:1px solid var(--line,rgba(255,255,255,.06));display:flex;justify-content:safe center;overflow-x:auto;scrollbar-width:none;padding-bottom:env(safe-area-inset-bottom,0)}
.site-bottom-tabs::-webkit-scrollbar{display:none}
.site-bottom-tabs-inner{display:flex;width:100%;max-width:var(--wrap,1200px);margin:0 auto}
.site-bottom-tab{flex:1 1 0;min-width:64px;max-width:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;height:var(--site-bottom-h);color:var(--ink-soft,#a7a6a6);text-decoration:none;font-size:11px;font-weight:500;white-space:nowrap;transition:color .15s,background .15s}
.site-bottom-tab:hover,.site-bottom-tab:focus-visible{color:var(--ink,#ededf0);background:var(--panel-2,#1f1f1f);outline:none}
.site-bottom-tab--active{color:var(--ink,#ededf0);background:var(--panel-2,#1f1f1f);position:relative}
.site-bottom-tab--active::before{content:"";position:absolute;top:0;left:12px;right:12px;height:3px;background:var(--accent,#5771ff);border-radius:0 0 4px 4px}
.site-main{width:min(var(--wrap,1200px),100% - 2rem);margin:0 auto;padding:1.5rem 0 5rem}
.site-main--leaderboard{padding-top:0}
.site-footer{border-top:1px solid var(--line,rgba(255,255,255,.06));padding:2rem 0 2.5rem;background:var(--surface,#141414);margin-bottom:var(--site-bottom-h)}
.site-footer-inner{width:min(var(--wrap,1200px),100% - 2rem);margin:0 auto;display:flex;flex-direction:column;gap:1rem;text-align:center;color:var(--ink-mute,#82828a);font-size:.85rem}
.site-footer-legal{font-size:.8rem;max-width:720px;margin:0 auto;line-height:1.5}
.site-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem 1rem;margin-top:.5rem}
.site-footer-links a{color:var(--ink-soft,#a7a6a6);text-decoration:none}
.site-footer-links a:hover{color:var(--ink,#ededf0);text-decoration:underline}
.site-powered{position:fixed;right:12px;bottom:calc(var(--site-bottom-h) + 12px);z-index:90}
.site-powered a{display:inline-flex;align-items:center;gap:.35rem;padding:.35rem .6rem;background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:999px;color:var(--ink-mute,#82828a);text-decoration:none;font-size:11px;font-weight:600}
.site-powered a:hover{color:var(--ink,#ededf0)}
.site-feedback{border:none;border-radius:var(--radius,12px);background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));color:var(--ink,#ededf0);padding:0;width:min(460px,calc(100% - 2rem));max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,.45)}
.site-feedback::backdrop{background:rgba(0,0,0,.55);backdrop-filter:blur(2px)}
.site-feedback-form{padding:1.25rem;display:flex;flex-direction:column;gap:.75rem}
.site-feedback-form h2{margin:0;font-size:1.25rem}
.site-feedback-hint{margin:0;color:var(--ink-soft,#a7a6a6);font-size:.9rem}
.site-feedback-form textarea{width:100%;box-sizing:border-box;resize:vertical;background:var(--surface,#141414);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius-sm,8px);padding:.75rem;color:var(--ink,#ededf0);font:inherit}
.site-feedback-form textarea:focus-visible{outline:2px solid var(--accent,#5771ff);outline-offset:2px}
.site-feedback-actions{display:flex;justify-content:flex-end;gap:.5rem}
.site-feedback-status{min-height:1.25em;margin:0;font-size:.9rem}
@media (min-width: 720px){
  .site-topbar-nav{display:flex}
  .site-topbar-actions{display:flex}
  .site-menu{display:none}
  .site-bottom-tabs{display:none}
  .site-main{padding-bottom:2rem}
  .site-footer{margin-bottom:0}
  .site-powered{bottom:12px}
}
@media (max-width: 719px){
  .site-brand-name{max-width:26vw;font-size:.9rem}
  .site-main{padding-bottom:calc(var(--site-bottom-h) + 1.5rem)}
}
`;
}

function homeAndSectionCss() {
  return `.site-hero{position:relative;padding:2.5rem 1rem 2rem;border-radius:var(--radius,12px);border:1px solid var(--line,rgba(255,255,255,.06));background:linear-gradient(180deg,rgba(255,255,255,.04),transparent),var(--panel,#1c1c1c);text-align:center;overflow:hidden}
.site-hero-content{position:relative;z-index:1}
.site-hero h1{font-size:clamp(2rem,6vw,3.6rem);font-weight:800;letter-spacing:-.03em;margin:0 0 .5rem;background:var(--grad-name,linear-gradient(100deg,var(--cy,#e4ecf4),var(--bl,#5771ff)));-webkit-background-clip:text;background-clip:text;color:transparent}
.site-hero-tagline{color:var(--ink-soft,#a7a6a6);font-size:clamp(1rem,2.5vw,1.25rem);max-width:560px;margin:0 auto 1.5rem}
.site-hero-cta{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.site-hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1rem;max-width:680px;margin:2rem auto 0}
.site-stat{background:var(--panel-2,#1f1f1f);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius-sm,8px);padding:1rem;text-align:center}
.site-stat-label{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-mute,#82828a);margin-bottom:.35rem}
.site-stat-value{font-size:1.5rem;font-weight:700;color:var(--ink,#ededf0);display:block}
.site-stat-value [data-pool]{font-size:inherit;color:var(--ink,#ededf0)}
.site-stat .timer-grid{justify-content:center;background:transparent;border:none;backdrop-filter:none;padding:0;margin:0}
.site-section-title{font-size:1.35rem;font-weight:700;margin:0 0 .4rem;color:var(--ink,#ededf0)}
.site-section-header{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.site-section-header a{font-size:.9rem;color:var(--accent,#5771ff);text-decoration:none}
.site-section{margin-top:2.5rem}
.site-podium .top3{grid-template-columns:repeat(3,1fr);gap:14px;margin-top:1rem}
@media (max-width: 640px){.site-podium .top3{grid-template-columns:1fr}}
.site-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:1rem}
.site-card{background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius,12px);padding:1.25rem;color:var(--ink,#ededf0);text-decoration:none;transition:transform .1s,border-color .15s;display:flex;flex-direction:column;gap:.35rem}
.site-card:hover,.site-card:focus-visible{border-color:var(--accent,#5771ff);transform:translateY(-2px);outline:none}
.site-card h3{margin:0;font-size:1.05rem}
.site-card p{margin:0;color:var(--ink-soft,#a7a6a6);font-size:.9rem}
.site-empty{text-align:center;color:var(--ink-mute,#82828a);padding:2.5rem 1rem;background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius,12px)}
`;
}

function shopAndMeCss() {
  return `.site-shop-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap}
.site-shop-head h1{margin:0;font-size:clamp(1.5rem,4vw,2rem)}
.site-balance-large{font-size:2rem;font-weight:700;color:var(--accent,#5771ff)}
.site-shop-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.site-shop-item{background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius,12px);padding:1.1rem;display:flex;flex-direction:column;gap:.6rem}
.site-shop-item h3{margin:0;font-size:1.05rem}
.site-shop-item p{margin:0;color:var(--ink-soft,#a7a6a6);font-size:.9rem}
.site-shop-meta{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-top:auto;flex-wrap:wrap}
.site-shop-cost{font-weight:700;color:var(--accent,#5771ff)}
.site-shop-stock{font-size:.8rem;color:var(--ink-mute,#82828a)}
.site-signin-prompt{background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius,12px);padding:2rem;text-align:center;max-width:480px;margin:2rem auto}
.site-signin-prompt h2{margin:0 0 .5rem}
.site-signin-prompt p{color:var(--ink-soft,#a7a6a6);margin:0 0 1.25rem}
.site-ledger{border-collapse:collapse;width:100%;font-size:.9rem}
.site-ledger th,.site-ledger td{padding:.7rem .5rem;text-align:left;border-bottom:1px solid var(--line,rgba(255,255,255,.06))}
.site-ledger th{color:var(--ink-mute,#82828a);font-weight:600;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em}
.site-ledger td{color:var(--ink-soft,#a7a6a6)}
.site-ledger tr:last-child td{border-bottom:none}
`;
}

function gamesCss() {
  return `.site-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}
.site-game-card{background:var(--panel,#1c1c1c);border:1px solid var(--line,rgba(255,255,255,.06));border-radius:var(--radius,12px);padding:1.25rem;text-align:center;display:flex;flex-direction:column;gap:.5rem}
.site-game-card h3{margin:0}
.site-game-card p{margin:0;color:var(--ink-soft,#a7a6a6);font-size:.9rem;flex:1}
`;
}

export async function renderSite({ r, section, viewer, viewerData, opts }) {
  const data = r.data || {};
  const b = data.brand || {};
  const br = data.branding || {};
  const tpl = validTemplate(br.template);
  const siteSections = data.siteSections || { home: true, leaderboard: true, shop: true, games: false, me: true };
  const nonce = opts.nonce;
  const slug = opts.slug || "";
  const isCustomDomain = !!opts.isCustomDomain;
  const homeUrl = String(opts.homeUrl || "https://yourrank.site").replace(/\/$/, "");
  const logoUrl = opts.logoUrl || null;
  const paid = r.plan !== "free";
  const watermark = !paid;

  const casino = String(b.casino || "").trim();
  const code = String(b.code || "").trim();
  const pool = String(b.prizePool || "").trim();
  const period = String(b.period || "Monthly");
  const blurb = String((data.partner && data.partner.blurb) || "").trim();
  const chips = Array.isArray(data.partner?.chips) ? data.partner.chips : [];
  const whyStats = Array.isArray(data.whyStats) ? data.whyStats : [];
  const socials = Array.isArray(data.socials) ? data.socials : [];
  const hasCasino = !!casino;
  const hasCode = !!code;
  const ctaDest = b.ctaUrl;
  const ctaHref = slug ? esc(`/go/${slug}`) : safeUrl(ctaDest);
  const hasCta = !!(ctaDest || hasCasino || hasCode);
  const hasPartner = hasCasino || hasCode || !!blurb || chips.length > 0 || whyStats.length > 0;

  const tplOptions = resolveOptions(tpl, !watermark ? br.options : null);
  const optVars = Object.entries(tplOptions).map(([k, v]) => `--opt-${k}:${typeof v === "boolean" ? (v ? 1 : 0) : v};`).join("");
  const optCss = optVars ? `<style nonce="${nonce}" data-template-options>body[data-template="${tpl}"]{${optVars}}</style>` : "";
  const optAttrs = Object.entries(tplOptions).map(([k, v]) => ` data-opt-${k}="${esc(String(v))}"`).join("");

  const themeCss = (!watermark && HEX.test(br.accentA || "") && HEX.test(br.accentB || ""))
    ? `<style nonce="${nonce}">:root{--cy:${br.accentA};--bl:${br.accentB};--grad-name:linear-gradient(100deg,${br.accentA} 0%,${br.accentB} 100%);--grad-cta:linear-gradient(100deg,${br.accentA},${br.accentB})}</style>`
    : "";

  const sections = { ...DEFAULT_EXTRA.sections, ...(data.sections || {}) };
  if (socials.length > 0 && sections.socials === false) sections.socials = true;
  const sectionAttrs = Object.entries(sections).map(([k, v]) => `data-sections-${k}="${String(v)}"`).join(" ");
  const sectionCss = `<style nonce="${nonce}">
body[data-sections-hero="false"] .hero,
body[data-sections-leaderboard="false"] #board,
body[data-sections-top3="false"] .top3,
body[data-sections-search="false"] .find-rank-bar,
body[data-sections-rules="false"] .rules,
body[data-sections-partner="false"] #partner,
body[data-sections-socials="false"] .socials-sec,
body[data-sections-share="false"] .share-sec,
body[data-sections-pastWinners="false"] .past-sec,
body[data-sections-countdown="false"] .hero-timer,
body[data-sections-countdown="false"] .countdown,
body[data-sections-cta="false"] .hero-cta,
body[data-sections-payouts="false"] .payouts { display: none !important; }
</style>`;

  const sectionUrl = `${homeUrl}${siteSectionHref(section, slug, isCustomDomain)}`;
  const canonicalUrl = esc(sectionUrl);
  const returnTo = encodeURIComponent(sectionUrl);

  const titleBase = esc(b.name || slug);
  let title;
  let ogTitle;
  let desc;
  if (section === "home") {
    title = `${titleBase} — ${esc(b.tagline || "Leaderboard & Rewards")}`;
    ogTitle = titleBase;
    desc = `${titleBase}'s viewer site — ${esc(b.tagline || "compete on the leaderboard, earn credits and redeem rewards.")}`;
  } else if (section === "leaderboard") {
    title = hasCasino ? `${titleBase} | ${esc(casino)} Leaderboard` : `${titleBase} — Leaderboard`;
    ogTitle = hasCasino ? `${titleBase} | ${esc(casino)}` : `${titleBase} — Leaderboard`;
    const prizePoolLabel = esc((data.prizes?.prizePoolLabel) || b.prizePoolLabel || "Prize pool");
    desc = (hasCasino && hasCode)
      ? `${titleBase} x ${esc(casino)}. Use code ${esc(code)} and compete in the ${esc(pool ? pool + " " : "")}${esc(period.toLowerCase())} leaderboard.`
      : `${titleBase}'s ${esc(period.toLowerCase())} leaderboard${pool ? ` — compete for the ${esc(pool)} ${prizePoolLabel.toLowerCase()}` : ""}.`;
  } else {
    const label = SECTION_LABELS[section] || section;
    title = `${label} · ${titleBase}`;
    ogTitle = title;
    desc = `${label} for ${titleBase}'s viewer site.`;
  }

  const ogFallback = `${homeUrl}/og.png`;
  const ogImageUrl = logoUrl ? esc(logoUrl) : ogFallback;
  const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");

  const parts = (section === "home" || section === "leaderboard")
    ? buildParts({
        b, esc, heroLogo: logoUrl ? `<img class="hero-logo" src="${esc(logoUrl)}" srcset="${logoSrcSet(logoUrl)}" sizes="(max-width: 640px) 120px, 200px" alt="${esc(b.name)} logo" />` : "",
        hasCasino, casino, period, pool, hasCta, ctaHref, hasPartner, hasCode, code, blurb, chips, whyStats, socials,
        prizes: data.prizes, currency: data.brand?.currency, hidePrizeAmounts: data.brand?.hidePrizeAmounts,
        players: data.players, slug, isCustomDomain, options: tplOptions,
      }, templateParts(tpl))
    : null;

  const mainHtml = await renderMainForSection({
    section, r, data, b, siteSections, parts, viewer, viewerData, slug, isCustomDomain, homeUrl, ctaHref, hasCta, hasCasino, casino, period, hasPartner, socials, logoUrl,
  });

  const siteName = r.data?.brand?.name || slug;
  const siteTopbarHtml = siteTopbar({ r, section, siteSections, slug, isCustomDomain, homeUrl, logoUrl, viewer, viewerData, returnTo });
  const feedbackModalHtml = feedbackModal({ slug, siteName });
  const bottomTabsHtml = siteBottomTabs({ section, siteSections, slug, isCustomDomain });
  const siteFooterHtml = siteFooter({ data, b, siteSections, slug, isCustomDomain, watermark, homeUrl });
  const badge = watermark
    ? `<aside class="site-powered" aria-label="YourRank branding"><a href="${esc(homeUrl || "/")}" target="_blank" rel="noopener">Powered by <b>YourRank</b></a></aside>`
    : "";

  const scripts = [];
  if (section === "leaderboard") {
    scripts.push(`<script nonce="${nonce}">window.__SITE_DATA__=${dataJson};window.__SLUG__=${JSON.stringify(slug)};window.__IS_CUSTOM_DOMAIN__=${JSON.stringify(isCustomDomain)};window.__IS_PREVIEW__=false;</script>`);
    scripts.push(`<script src="/assets/leaderboard.js" nonce="${nonce}"></script>`);
  }
  scripts.push(siteScript({ section, nonce, dataJson, slug, homeUrl, returnTo, viewerData }));

  const head = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title><meta name="description" content="${esc(desc)}" />
<meta property="og:title" content="${esc(ogTitle)}" /><meta property="og:description" content="${esc(desc)}" /><meta property="og:type" content="website" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta name="twitter:card" content="${logoUrl ? "summary_large_image" : "summary"}" /><meta name="twitter:title" content="${esc(ogTitle)}" /><meta name="twitter:description" content="${esc(desc)}" /><meta property="og:image" content="${ogImageUrl}" /><meta name="twitter:image" content="${ogImageUrl}" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${fontsHref(tpl, br)}" rel="stylesheet" media="print" data-async />
<script nonce="${nonce}">document.querySelector('link[data-async]').onload=function(){this.media='all'};</script>
<noscript><link href="${fontsHref(tpl, br)}" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="/assets/leaderboard.css" />
<style nonce="${nonce}">${siteShellCss()}${homeAndSectionCss()}${shopAndMeCss()}${gamesCss()}</style>
${templateCss(tpl) ? `<style nonce="${nonce}" data-template="${tpl}">${templateCss(tpl)}</style>` : ""}
${optCss}
${themeCss}
${sectionCss}
${fontCss(br, nonce)}
${section === "leaderboard" ? `<style nonce="${nonce}">${/* shareCss inlined */ shareCssInline()}</style>` : ""}
${opts.csrfToken ? `<meta name="csrf-token" content="${esc(opts.csrfToken)}" />` : ""}
</head>`;

  const body = `<body data-template="${tpl}"${optAttrs} ${sectionAttrs} data-section="${section}" data-slug="${esc(slug)}">
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="field" aria-hidden="true"></div><div class="watermarks" data-watermarks aria-hidden="true"></div>
${siteTopbarHtml}
${feedbackModalHtml}
${mainHtml}
${badge}
${siteFooterHtml}
${bottomTabsHtml}
${scripts.join("")}
</body></html>`;

  return head + body;
}

function shareCssInline() {
  return `.share-sec{padding:24px 4vw;max-width:var(--wrap,1200px);margin:0 auto;text-align:center}.share-title{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute,#9a9aa2);margin:0 0 12px}.share-btns{display:inline-flex;flex-wrap:wrap;gap:10px;justify-content:center}.share-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 16px;border-radius:8px;border:1px solid var(--line,rgba(87,113,255,.3));background:var(--panel-2,#141417);color:var(--ink,#ededf0);font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;transition:border-color .15s,transform .05s}.share-btn:hover{border-color:var(--accent,#2200ff);color:var(--accent,#2200ff)}.share-btn:active{transform:translateY(1px)}`;
}

function siteTopbar({ r, section, siteSections, slug, isCustomDomain, homeUrl, logoUrl, viewer, viewerData, returnTo }) {
  const enabled = sectionList(siteSections);
  const links = enabled.map((s) => {
    const cls = s === section ? "site-nav-link--active" : "site-nav-link";
    return `<a class="${cls}" href="${homeUrl}${siteSectionHref(s, slug, isCustomDomain)}">${esc(SECTION_LABELS[s])}</a>`;
  }).join("");

  const viewerOnSite = viewerData?.viewerOnSite;
  const balance = viewerOnSite?.balance ?? 0;
  const avatar = viewer?.avatar_url
    ? `<img src="${esc(viewer.avatar_url)}" alt="" />`
    : `<span>${esc(initials(viewer?.kick_username || viewer?.discord_username || "You"))}</span>`;
  const authActions = viewer
    ? `<a class="site-balance-chip" href="${homeUrl}${siteSectionHref("me", slug, isCustomDomain)}"><span class="site-balance-amount">${formatNumber(balance)} credits</span><span class="site-avatar">${avatar}</span></a>`
    : signInLinks(r, returnTo);
  const feedbackBtn = `<button class="btn btn--sm" id="yr-feedback-open-d" type="button" aria-label="Send feedback">Feedback</button>`;
  const feedbackBtnMobile = `<button class="site-nav-link" id="yr-feedback-open-m" type="button">Feedback</button>`;
  const actions = `${authActions}${feedbackBtn}`;

  const homeHref = `${homeUrl}${siteSectionHref("home", slug, isCustomDomain)}`;
  const brandLogo = logoUrl ? `<img class="site-brand-logo" src="${esc(logoUrl)}" alt="" />` : "";

  return `<header class="site-topbar">
<div class="site-topbar-inner">
<a class="site-brand" href="${homeHref}">${brandLogo}<span class="site-brand-name">${esc(r.data?.brand?.name || slug)}</span></a>
<nav class="site-topbar-nav" aria-label="Site sections">${links}</nav>
<div class="site-topbar-actions">${actions}</div>
<details class="site-menu">
<summary aria-label="Open menu" type="button"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></summary>
<div class="site-menu-panel" role="menu" aria-label="Site sections">
${enabled.map((s) => `<a class="${s === section ? "site-nav-link--active" : "site-nav-link"}" href="${homeUrl}${siteSectionHref(s, slug, isCustomDomain)}" role="menuitem">${esc(SECTION_LABELS[s])}</a>`).join("")}
${feedbackBtnMobile}
<div class="site-menu-actions">${authActions}</div>
</div>
</details>
</div>
</header>`;
}

function feedbackModal({ slug, siteName }) {
  return `<dialog id="yr-feedback" class="site-feedback" aria-label="Send feedback">
<form class="site-feedback-form" method="dialog">
<h2>Send feedback</h2>
<p class="site-feedback-hint">Tell us what you think about ${esc(siteName)}. No contact info needed — just type your message.</p>
<textarea name="message" rows="5" minlength="10" maxlength="2000" placeholder="What's working? What's not?" required aria-label="Your feedback"></textarea>
<div class="site-feedback-actions">
<button class="btn btn--sm btn--success" type="submit">Send feedback</button>
<button class="btn btn--sm" type="button" id="yr-feedback-close">Cancel</button>
</div>
<p class="site-feedback-status" id="yr-feedback-status" role="status" aria-live="polite"></p>
<input type="hidden" name="slug" value="${esc(slug)}" />
</form>
</dialog>`;
}

function signInLinks(r, returnTo) {
  if (r.viewerKickAuthEnabled) {
    return `<a class="btn btn--sm btn--kick" href="/api/viewer/auth/kick?returnTo=${encodeURIComponent(returnTo)}">Sign in with Kick</a>`;
  }
  if (r.viewerDiscordAuthEnabled) {
    return `<a class="btn btn--sm" href="/api/viewer/auth/discord?returnTo=${encodeURIComponent(returnTo)}">Sign in with Discord</a>`;
  }
  return `<a class="btn btn--sm" href="/me">Sign in</a>`;
}

function siteBottomTabs({ section, siteSections, slug, isCustomDomain }) {
  const enabled = sectionList(siteSections);
  return `<nav class="site-bottom-tabs" aria-label="Mobile sections">
<div class="site-bottom-tabs-inner">
${enabled.map((s) => `<a class="site-bottom-tab${s === section ? " site-bottom-tab--active" : ""}" href="${siteSectionHref(s, slug, isCustomDomain)}"><span>${esc(SECTION_LABELS[s])}</span></a>`).join("")}
</div>
</nav>`;
}

function siteFooter({ data, b, siteSections, slug, isCustomDomain, homeUrl }) {
  const enabled = sectionList(siteSections);
  const legalHref = (page) => `${homeUrl}${siteSectionHref(page, slug, isCustomDomain)}`;
  const legalLinks = renderLegalSidebar(data, legalHref).split("\n").filter(Boolean).join("");
  return `<footer class="site-footer">
<div class="site-footer-inner">
<p class="site-footer-legal">Credits are free loyalty points earned from channel-point redemptions. No purchase, no cash value, no cashout.</p>
<div class="site-footer-links">${enabled.map((s) => `<a href="${homeUrl}${siteSectionHref(s, slug, isCustomDomain)}">${esc(SECTION_LABELS[s])}</a>`).join("")}${legalLinks}</div>
<p class="site-footer-copy">&copy; ${new Date().getFullYear()} ${esc(b.name || slug)}. All rights reserved.</p>
</div>
</footer>`;
}

async function renderMainForSection(ctx) {
  const { section } = ctx;
  switch (section) {
    case "home": return renderHomeMain(ctx);
    case "leaderboard": return await renderLeaderboardMain(ctx);
    case "shop": return renderShopMain(ctx);
    case "me": return renderMeMain(ctx);
    case "games": return renderGamesMain(ctx);
    default: return `<main id="main-content" class="site-main"><div class="site-empty">Section not found.</div></main>`;
  }
}

function renderHomeMain({ data, b, siteSections, parts, slug, isCustomDomain, homeUrl, hasCta, hasCasino, casino, period, pool, viewer, viewerData }) {
  const poolHtml = parts.poolSpan;
  const endsAt = data.endsAt ? new Date(data.endsAt).getTime() : null;
  const endsNow = endsAt && Number.isNaN(endsAt) === false ? endsAt : null;
  const heroTimer = endsNow && parts.timerGrid ? `<div class="site-stat" id="hero-timer" data-ends-at="${endsNow}"><span class="site-stat-label">Ends in</span>${parts.timerGrid}</div>` : "";
  const viewerBalance = viewerData?.viewerOnSite;
  const yourCredits = viewer
    ? `<div class="site-stat"><span class="site-stat-label">Your credits</span><span class="site-stat-value">${formatNumber(viewerBalance?.balance || 0)}</span></div>`
    : `<div class="site-stat"><span class="site-stat-label">Your credits</span><span class="site-stat-value">—</span></div>`;

  const primaryCta = hasCta
    ? parts.ctaBtn(hasCasino ? `Join ${esc(casino)}` : "Join now", "btn btn--grad")
    : `<a class="btn btn--grad" href="${homeUrl}${siteSectionHref("leaderboard", slug, isCustomDomain)}">View Leaderboard</a>`;

  const tagline = b.tagline || (hasCasino ? `Compete in the ${esc(period)} leaderboard${pool ? ` for the ${esc(pool)} prize pool` : ""}.` : `Compete on the leaderboard and redeem free credits.`);

  const enabled = sectionList(siteSections).filter((s) => s !== "home");
  const cards = enabled.map((s) => `
<a class="site-card" href="${homeUrl}${siteSectionHref(s, slug, isCustomDomain)}">
<h3>${esc(SECTION_LABELS[s])}</h3>
<p>${esc(SECTION_DESCRIPTIONS[s] || "")}</p>
</a>`).join("");

  return `<main id="main-content" class="site-main site-main--home">
<section class="site-hero" aria-labelledby="site-hero-title">
<div class="site-hero-content">
<h1 id="site-hero-title">${esc(b.name || slug)}</h1>
<p class="site-hero-tagline">${esc(tagline)}</p>
<div class="site-hero-cta">${primaryCta}</div>
<div class="site-hero-stats">
<div class="site-stat"><span class="site-stat-label">${parts.prizePoolLabel || "Prize pool"}</span><span class="site-stat-value">${poolHtml}</span></div>
${heroTimer}
<div class="site-stat"><span class="site-stat-label">Players</span><span class="site-stat-value">${parts.sCount}</span></div>
${yourCredits}
</div>
</div>
</section>
<section class="site-section site-podium" aria-labelledby="site-podium-title">
<div class="site-section-header"><h2 id="site-podium-title" class="site-section-title">Top players</h2><a href="${homeUrl}${siteSectionHref("leaderboard", slug, isCustomDomain)}">View full leaderboard &rarr;</a></div>
${parts.top3}
</section>
<section class="site-section" aria-labelledby="site-explore-title">
<h2 id="site-explore-title" class="site-section-title">Explore</h2>
<div class="site-cards">${cards}</div>
</section>
</main>`;
}

async function renderLeaderboardMain({ data, b, parts, slug, isCustomDomain, homeUrl, logoUrl }) {
  const tpl = validTemplate(data.branding?.template);
  const logo = logoUrl ? esc(logoUrl) : null;
  const logoSet = logoSrcSet(logoUrl);
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" srcset="${logoSet}" sizes="64px" alt="" />` : "";
  const shellParts = {
    b, esc, navLogo,
    hasPartner: parts.hasPartner, hasCasino: parts.hasCasino, casino: parts.casino, socials: data.socials || [],
    legalLinks: renderLegalSidebar(data, (page) => siteSectionHref(page, slug, isCustomDomain)),
    disclaimer: footerDisclaimer(parts.hasCasino, b.name, parts.casino),
    options: parts.options || {},
  };
  const headerHtml = templateHeader(tpl) ? templateHeader(tpl)(shellParts) : "";
  const footerHtml = templateFooter(tpl) ? templateFooter(tpl)(shellParts) : "";
  const textOverrides = (data.branding?.text) || {};
  const compose = await composeMain(tpl, parts, textOverrides);
  const pageUrl = `${homeUrl}${siteSectionHref("leaderboard", slug, isCustomDomain)}`;
  return `<main id="main-content" class="site-main site-main--leaderboard">
${headerHtml}
${compose}
${shareSection(pageUrl)}
${footerHtml}
</main>`;
}

function renderShopMain({ r, slug, isCustomDomain, homeUrl, viewer, viewerData }) {
  const items = viewerData?.shopItems || [];
  const active = items.filter((i) => i.active !== false);
  const viewerOnSite = viewerData?.viewerOnSite;
  const balance = viewerOnSite?.balance || 0;
  const blocked = viewerOnSite?.blocked;

  const header = viewer
    ? `<div class="site-shop-head"><h1>Shop</h1><div class="site-balance-large">${formatNumber(balance)} credits</div></div>`
    : `<div class="site-shop-head"><h1>Shop</h1>${signInLinks(r, `${homeUrl}${siteSectionHref("shop", slug, isCustomDomain)}`)}</div>`;

  if (active.length === 0) {
    return `<main id="main-content" class="site-main">${header}<div class="site-empty">No rewards in the shop right now.</div></main>`;
  }

  const cards = active.map((item) => {
    const inStock = item.stock === null || item.stock > 0;
    let action;
    if (!viewer) {
      action = signInLinks(r, `${homeUrl}${siteSectionHref("shop", slug, isCustomDomain)}`);
    } else if (blocked) {
      action = `<span class="hint">Credits blocked</span>`;
    } else if (!inStock) {
      action = `<button class="btn btn--sm" disabled>Out of stock</button>`;
    } else if (balance < item.cost) {
      action = `<button class="btn btn--sm" disabled>Need ${formatNumber(item.cost - balance)} more</button>`;
    } else {
      action = `<button class="btn btn--sm btn--grad" data-redeem="${esc(item.id)}" data-name="${esc(item.name)}" type="button">Redeem</button>`;
    }
    const stockText = item.stock !== null ? `<span class="site-shop-stock">${formatNumber(item.stock)} left</span>` : "";
    return `<article class="site-shop-item">
<h3>${esc(item.name)}</h3>
<p>${esc(item.description || "")}</p>
<div class="site-shop-meta"><span class="site-shop-cost">${formatNumber(item.cost)} credits</span>${stockText}${action}</div>
</article>`;
  }).join("");

  return `<main id="main-content" class="site-main">${header}<div class="site-shop-list">${cards}</div></main>`;
}

function renderMeMain({ r, slug, isCustomDomain, homeUrl, viewer, viewerData }) {
  if (!viewer) {
    return `<main id="main-content" class="site-main"><section class="site-signin-prompt"><h2>My Credits</h2><p>Sign in to see your balance, history and redemptions.</p>${signInLinks(r, `${homeUrl}${siteSectionHref("me", slug, isCustomDomain)}`)}</section></main>`;
  }

  const viewerOnSite = viewerData?.viewerOnSite;
  const balance = viewerOnSite?.balance || 0;
  const ledger = viewerData?.ledger || [];
  const redemptions = viewerData?.redemptions || [];

  const ledgerRows = ledger.length
    ? ledger.map((row) => `<tr><td>${formatDate(row.created_at)}</td><td>${esc(row.type)}</td><td>${formatNumber(row.amount)}</td><td>${esc(row.description || "")}</td></tr>`).join("")
    : `<tr><td colspan="4" style="text-align:center">No credit history yet.</td></tr>`;

  const redemptionsRows = redemptions.length
    ? redemptions.map((row) => `<tr><td>${formatDate(row.created_at)}</td><td>${esc(row.item_name || "")}</td><td>${formatNumber(row.cost)}</td><td>${esc(row.status)}</td></tr>`).join("")
    : `<tr><td colspan="4" style="text-align:center">No redemptions yet.</td></tr>`;

  return `<main id="main-content" class="site-main">
<section class="site-section">
<div class="site-shop-head"><h1>My Credits</h1><div class="site-balance-large">${formatNumber(balance)} credits</div></div>
</section>
<section class="site-section">
<h2 class="site-section-title">History</h2>
<table class="site-ledger"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead><tbody>${ledgerRows}</tbody></table>
</section>
<section class="site-section">
<h2 class="site-section-title">Redemptions</h2>
<table class="site-ledger"><thead><tr><th>Date</th><th>Item</th><th>Cost</th><th>Status</th></tr></thead><tbody>${redemptionsRows}</tbody></table>
</section>
</main>`;
}

function renderGamesMain({ r, slug, isCustomDomain, homeUrl, viewer }) {
  const games = [
    { key: "mines", name: "Mines", desc: "Clear the grid without hitting a mine." },
    { key: "plinko", name: "Plinko", desc: "Drop the chip and multiply your credits." },
    { key: "dice", name: "Dice", desc: "Roll over or under the target." },
    { key: "limbo", name: "Limbo", desc: "Guess how high the multiplier will go." },
  ];

  const locked = !viewer
    ? `<div class="site-signin-prompt"><h2>Games are for signed-in viewers</h2><p>Sign in to play originals and win credits.</p>${signInLinks(r, `${homeUrl}${siteSectionHref("games", slug, isCustomDomain)}`)}</div>`
    : "";

  const cards = games.map((g) => `<article class="site-game-card"><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p>${viewer ? `<button class="btn btn--sm" disabled>Coming soon</button>` : `<span class="hint">Sign in to play</span>`}</article>`).join("");

  return `<main id="main-content" class="site-main">
${locked}
<section class="site-section">
<h1 class="site-section-title">Originals</h1>
<div class="site-games-grid">${cards}</div>
</section>
</main>`;
}

function siteScript({ section, nonce, slug }) {
  const base = `<script nonce="${nonce}">
(function(){
  const dialog=document.getElementById("yr-feedback");
  const openD=document.getElementById("yr-feedback-open-d");
  const openM=document.getElementById("yr-feedback-open-m");
  const closeBtn=document.getElementById("yr-feedback-close");
  const statusEl=document.getElementById("yr-feedback-status");
  function show(){ if(dialog){ dialog.showModal(); if(statusEl)statusEl.textContent=""; const menu=document.querySelector(".site-menu"); if(menu)menu.removeAttribute("open"); } }
  function hide(){ if(dialog){ dialog.close(); } }
  if(openD)openD.addEventListener("click",show);
  if(openM)openM.addEventListener("click",show);
  if(closeBtn)closeBtn.addEventListener("click",hide);
  const form=document.querySelector("#yr-feedback form");
  if(form){
    form.addEventListener("submit",async function(e){
      e.preventDefault();
      const btn=form.querySelector('button[type="submit"]');
      const message=form.message.value.trim();
      if(message.length<10){ if(statusEl)statusEl.textContent="Please write at least 10 characters."; return; }
      const csrf=document.querySelector('meta[name="csrf-token"]')?.content;
      const siteSlug=form.slug.value;
      btn.disabled=true; btn.textContent="Sending...";
      try{
        const res=await fetch("/api/feedback",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json","x-csrf-token":csrf||""},body:JSON.stringify({slug:siteSlug,message:message})});
        const data=await res.json().catch(function(){return {}});
        if(res.ok && data.ok){ if(statusEl)statusEl.textContent="Thanks! Your feedback was sent."; form.message.value=""; setTimeout(hide,1400); }
        else { if(statusEl)statusEl.textContent=data.error||"Could not send feedback. Try again."; btn.disabled=false; btn.textContent="Send feedback"; }
      }catch(err){ if(statusEl)statusEl.textContent="Network error. Please try again."; btn.disabled=false; btn.textContent="Send feedback"; }
    });
  }
})();
</script>`;
  if (section === "shop") {
    return base + `<script nonce="${nonce}">
(function(){
  document.querySelectorAll("[data-redeem]").forEach(function(btn){
    btn.addEventListener("click", async function(){
      btn.disabled=true; btn.textContent="Redeeming…";
      try{
        const res=await fetch("/api/viewer/redeem",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({slug:${JSON.stringify(slug)},shopItemId:btn.dataset.redeem})});
        const data=await res.json().catch(function(){return {}});
        if(res.ok && data.ok){ btn.textContent="Redeemed!"; btn.classList.add("btn--success"); setTimeout(function(){location.reload()},900); }
        else { btn.textContent=data.error||"Failed"; btn.disabled=false; }
      }catch(e){ btn.textContent="Error"; btn.disabled=false; }
    });
  });
})();
</script>`;
  }
  if (section === "home") {
    return base + `<script nonce="${nonce}">
(function(){
  const el=document.getElementById("hero-timer"); if(!el)return; const end=Number(el.dataset.endsAt); if(!end)return;
  function fmt(n){return String(Math.max(0,Math.floor(n))).padStart(2,"0")}
  function tick(){const left=Math.max(0,end-Date.now()); const d=fmt(left/86400000),h=fmt((left%86400000)/3600000),m=fmt((left%3600000)/60000),s=fmt((left%60000)/1000); el.querySelectorAll("[data-t]").forEach(function(c){const t=c.dataset.t;if(t==="d")c.textContent=d;if(t==="h")c.textContent=h;if(t==="m")c.textContent=m;if(t==="s")c.textContent=s;});}
  tick(); setInterval(tick,1000);
})();
</script>`;
  }
  if (section === "leaderboard") {
    return base + shareScriptNonce(nonce);
  }
  return base;
}
