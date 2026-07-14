// Server-render a streamer's leaderboard page from their data.
import { templateCss, validTemplate } from "./templates/index.js";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// E2E-009: Sanitize user-supplied URLs for href attributes.
// Only allows https:// URLs (rejects http://, javascript:, data:, vbscript:).
// Also escapes HTML entities to prevent attribute breakout XSS.
const safeUrl = (u) => {
  const s = String(u ?? "").trim();
  if (!/^https:\/\//i.test(s)) return "#";
  return encodeURI(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function renderLeaderboard(data, opts = {}) {
  const b = data.brand || {};
  const br = data.branding || {};
  // Template: which visual skin renders this page. Falls back to "classic".
  const tpl = validTemplate(br.template);
  const tplCssStr = templateCss(tpl);
  const tplCss = tplCssStr ? `<style nonce="${opts.nonce}" data-template="${tpl}">${tplCssStr}</style>` : "";
  // Free-plan pages carry the badge — it's how YourRank spreads.
  const badge = opts.watermark
    ? `<a class="rk-badge" href="${esc(opts.homeUrl || "/")}" target="_blank" rel="noopener">⚡ Powered by <b>YourRank</b></a>`
    : "";
  // Pro theme: one gradient pair drives the page accents. Validated hex only.
  const themeCss = (!opts.watermark && HEX.test(br.accentA || "") && HEX.test(br.accentB || ""))
    ? `<style nonce="${opts.nonce}">:root{--cy:${br.accentA};--bl:${br.accentB};--grad-name:linear-gradient(100deg,${br.accentA} 0%,${br.accentB} 100%);--grad-cta:linear-gradient(100deg,${br.accentA},${br.accentB})}</style>`
    : "";
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const heroLogo = logo ? `<img class="hero-logo" src="${logo}" alt="${esc(b.name)} logo" />` : "";
  const canonicalUrl = `${esc(opts.homeUrl || "https://yourrank.site")}/${esc(opts.slug || "")}`;

  // A brand-new board has no casino/code/prize configured yet. Rendering the
  // "Official Partner" badge, casino perks and an empty code box on an
  // unconfigured page publishes claims the owner never made — a trust/legal
  // problem. Gate every partner-specific element on real configuration and fall
  // back to neutral, honest copy until the owner fills things in.
  const casino = (b.casino || "").trim();
  const code = (b.code || "").trim();
  const pool = (b.prizePool || "").trim();
  const period = (b.period || "Monthly");
  const blurb = ((data.partner && data.partner.blurb) || "").trim();
  const whyStats = Array.isArray(data.whyStats) ? data.whyStats : [];
  const socials = Array.isArray(data.socials) ? data.socials : [];
  const chips = Array.isArray(data.partner?.chips) ? data.partner.chips : [];
  const hasCasino = !!casino;
  const hasCode = !!code;
  const ctaHref = opts.slug ? esc(`/go/${opts.slug}`) : safeUrl(b.ctaUrl);
  // Only surface a "Join" CTA when the owner actually configured a referral
  // destination (a casino, a code, or an explicit CTA URL). Otherwise /go/<slug>
  // just loops back to the same page — a dead-end button on a fresh board.
  const hasCta = !!(b.ctaUrl) || hasCasino || hasCode;
  const hasPartner = hasCasino || hasCode || !!blurb || chips.length > 0 || whyStats.length > 0;

  // Homepage/brand fallback preview image (1200×630). Served by the Worker at
  // /og.png so shares don't render blank. A board's own logo still wins.
  const ogFallback = `${esc(opts.homeUrl || "https://yourrank.site")}/og.png`;
  const ogImageUrl = logo || ogFallback;
  const ogImage = `<meta property="og:image" content="${ogImageUrl}" /><meta name="twitter:image" content="${ogImageUrl}" />`;
  const twitterCard = logo ? "summary_large_image" : "summary";
  const title = hasCasino ? `${esc(b.name)} | ${esc(casino)} Leaderboard` : `${esc(b.name)} — Leaderboard`;
  const ogTitle = hasCasino ? `${esc(b.name)} | ${esc(casino)}` : `${esc(b.name)} — Leaderboard`;
  const desc = (hasCasino && hasCode)
    ? `${esc(b.name)} x ${esc(casino)}. Use code ${esc(code)} and compete in the ${esc(pool ? pool + " " : "")}${esc(period.toLowerCase())} leaderboard.`
    : `${esc(b.name)}'s ${esc(period.toLowerCase())} leaderboard${pool ? ` — compete for the ${esc(pool)} prize pool` : ""}.`;
  const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title><meta name="description" content="${desc}" />
<meta property="og:title" content="${ogTitle}" /><meta property="og:description" content="${desc}" /><meta property="og:type" content="website" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta name="twitter:card" content="${twitterCard}" /><meta name="twitter:title" content="${ogTitle}" /><meta name="twitter:description" content="${desc}" />${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" media="print" data-async />
<script nonce="${opts.nonce}">document.querySelector('link[data-async]').onload=function(){this.media='all'};</script>
<noscript><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" /></noscript>
<link rel="stylesheet" href="/assets/leaderboard.css" />
${tplCss}
${themeCss}
<script nonce="${opts.nonce}" type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":${JSON.stringify(title)},"description":${JSON.stringify(desc)},"numberOfItems":${data.players ? data.players.length : 0}}</script>
</head><body data-template="${tpl}">
<noscript><p class="noscript-noscroll">This leaderboard requires JavaScript for live updates. The data shown below may not refresh automatically.</p></noscript>
<a class="skip-link" href="#board">Skip to leaderboard</a>
<div class="field" aria-hidden="true"></div><div class="watermarks" data-watermarks aria-hidden="true"></div>
<header class="nav"><a class="nav-brand" href="#top">${navLogo}<span data-brand-name>${esc(b.name)}</span></a>
<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<nav class="nav-links" aria-label="Page sections">${hasPartner ? `<a href="#partner">Partner</a>` : ""}<a href="#board">Leaderboard</a>${socials.length ? `<a href="#socials">Socials</a>` : ""}</nav></header>
<main id="top">
<section class="hero"><div class="stream-window" aria-hidden="true"><div class="sw-bar"><span class="sw-dots"><i></i><i></i><i></i></span><span class="sw-title">Kick Stream</span></div>
<div class="sw-body"><div class="sw-live"><span class="live-dot"></span> LIVE</div><div class="sw-play"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div class="sw-name" data-brand-name>${esc(b.name)}</div></div></div>
${heroLogo}<p class="hero-kicker">Welcome to</p><h1 class="hero-name" data-brand-name>${esc(b.name)}</h1>
<p class="hero-sub">${hasCasino ? `<span data-casino>${esc(casino)}</span> partner · ` : ""}<span data-period>${esc(period)}</span> leaderboard</p>
<div class="hero-cta">${hasCta ? `<a class="btn btn--grad" data-cta href="${ctaHref}" target="_blank" rel="noopener">${hasCasino ? `Join <span data-casino>${esc(casino)}</span>` : "Join now"}</a>` : ""}<a class="btn btn--ghost" href="#board">Leaderboard</a></div>
<div class="hero-timer" data-timer><p class="timer-label">${pool ? `<span data-pool>${esc(pool)}</span> leaderboard resets in` : "Leaderboard resets in"}</p>
<div class="timer-grid" data-timer-grid><div class="tcell"><b data-t="d">--</b><span>Days</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="h">--</b><span>Hours</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="m">--</b><span>Mins</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="s">--</b><span>Secs</span></div></div></div></section>
${hasPartner ? `<section id="partner" class="panel">${hasCasino ? `<div class="panel-badge">Official Partner</div>` : ""}<div class="panel-grid">
<div class="pcol pcol-about"><p class="pcol-blurb" data-partner-blurb>${esc(blurb)}</p><ul class="chips" data-chips></ul></div>
${hasCode ? `<div class="pcol pcol-code"><span class="pcol-label">Exclusive Code</span><div class="code-box"><span class="code-val" data-code>${esc(code)}</span></div>
<button class="btn btn--full btn--code" data-copy-code>Copy Code</button><span class="sr-only" data-copy-status aria-live="polite"></span>
${hasCta ? `<a class="btn btn--full btn--grad" data-cta href="${ctaHref}" target="_blank" rel="noopener">${hasCasino ? `Join us on <span data-casino>${esc(casino)}</span>` : "Join now"}</a>` : ""}</div>` : ""}
${whyStats.length ? `<div class="pcol pcol-why"><span class="pcol-label">Why ${hasCasino ? `<span data-casino>${esc(casino)}</span>` : "us"}</span><div class="why-grid" data-why></div></div>` : ""}</div></section>` : ""}
<div class="sr-only" aria-live="polite" id="lb-announce"></div><section id="board" class="board"><div class="board-head">
<p class="eyebrow">${pool ? `<span data-pool>${esc(pool)}</span> · ` : ""}<span data-period>${esc(period)}</span> Leaderboard</p>
<div class="board-title-group"><h2 class="sec-title">Standings</h2><span class="player-count-badge" data-player-count-badge></span><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></div><div class="board-meta">
<span class="bm"><b class="countdown" data-countdown>--</b><span>Resets in</span></span>
<span class="bm"><b data-count>0</b><span>Players</span></span></div></div>
<div class="payouts" data-payouts hidden></div>
<div class="top3" data-top3></div>
<div class="find-rank-bar"><div class="find-rank-wrap"><button type="button" aria-label="Search" class="find-rank-icon"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg></button><input class="find-rank-input" type="text" placeholder="Find your rank..." data-find-rank aria-label="Search for your rank" /></div><span class="find-rank-result" data-find-result></span></div>
<div class="table"><div class="t-head"><span>#</span><span>Player</span><span class="ta-r">Wagered</span><span class="ta-r">Prize</span></div>
<ol class="t-rows" data-rows></ol></div>
<details class="rules"><summary>Leaderboard rules — how wager counts</summary><ol class="rules-list" data-rules></ol></details></section>
<section id="past" class="past-sec" data-past hidden><h2 class="sec-title center">Past Winners</h2><p class="sec-sub center">Every closed-out period, on the record.</p>
<div class="past-grid" data-past-grid></div></section>
${socials.length ? `<section id="socials" class="socials-sec"><h2 class="sec-title center">Join the Socials</h2><p class="sec-sub center">More giveaways and promotions across every platform.</p>
<div class="social-cards" data-socials></div></section>` : ""}</main>
<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div>
<p class="ftr-fine">18+ only. Gambling can be addictive. Please play responsibly. BeGambleAware.org${hasCasino ? ` · ${esc(b.name)} is not affiliated with ${esc(casino)}.` : "."}</p>
<p class="ftr-copy">© <span data-year></span> <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>
${badge}<script nonce="${opts.nonce}">window.__SITE_DATA__=${dataJson};window.__SLUG__=${JSON.stringify(opts.slug || "")};</script><script src="/assets/leaderboard.js"></script>
</body></html>`;
}
