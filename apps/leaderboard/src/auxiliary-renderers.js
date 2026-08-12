import { renderSite } from "./site-render.js";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function shell({ r, slug, homeUrl, nonce, contentHtml, title, description, logoUrl = null, isCustomDomain = false }) {
  return renderSite({
    r,
    section: "home",
    viewer: null,
    viewerData: null,
    opts: {
      homeUrl,
      slug,
      nonce,
      logoUrl,
      isCustomDomain,
      contentHtml,
      pageTitle: title,
      pageDescription: description,
    },
  });
}

function record(data, opts) {
  return data?.data ? data : {
    data,
    slug: opts.slug,
    plan: opts.plan || "pro",
    boards: opts.boards || [],
    botUsername: opts.botUsername || null,
  };
}

function legalBody(data, page) {
  const b = data.brand || {};
  const custom = String(data.legal?.[page] || "").trim();
  if (custom) {
    return custom.split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  }
  const name = esc(b.name || "This leaderboard");
  const copy = {
    terms: `<p>Welcome to the ${name} leaderboard page. By viewing or participating you agree to these terms.</p><p>${name} is responsible for the rules, prizes, and player standings shown here. YourRank provides the hosting platform only and does not operate gambling or wagering services.</p>`,
    privacy: `<p>${name} values your privacy. This page collects only the information needed to display the leaderboard, such as player names and scores.</p><p>Public pages are visible to anyone with the link. Do not share personal information you do not want made public.</p>`,
    responsible: `<p>${name} is provided for entertainment purposes only. Gambling can be addictive and should be enjoyed in moderation, never as a source of income.</p><p>If you or someone you know needs help, reach out to a local responsible-gaming organisation.</p>`,
    cookies: `<p>${name} uses cookies and similar technologies to provide the leaderboard service and understand how visitors use the page.</p>`,
    refund: `<p>${name} sets its own refund policy for prizes, subscriptions, or promotions offered through this page.</p><p>Questions about a specific prize or payment should be directed to ${name}.</p>`,
    contact: `<p>For questions about this leaderboard, its rules, or prizes, reach out through the channel links shown on the board.</p><p>For platform issues with YourRank, email contact@yourrank.site.</p>`,
  };
  return `<div class="yr-card yr-lb"><p class="yr-label">Not configured</p><p class="yr-note">This page is using the default ${name} guidance until the streamer adds custom text.</p></div>${copy[page] || "<p>Nothing here yet.</p>"}`;
}

export function renderNewLegalPage(data, page, opts) {
  const r = record(data, opts);
  const title = ({
    terms: "Terms of Service", privacy: "Privacy Policy", responsible: "Responsible Gaming",
    cookies: "Cookie Policy", refund: "Refund & Cancellation", contact: "Contact",
  })[page] || page;
  const content = `<div class="yr-hero"><p class="yr-eyebrow"><i></i>BOARD INFORMATION</p><h1 class="yr-h1">${esc(title)}</h1><p class="yr-lede">${esc(r.data.brand?.name || r.slug)} · Public information and policies.</p></div><div class="yr-g12"><article class="yr-c8 yr-card yr-lb"><div class="yr-prose">${legalBody(r.data, page)}</div></article><aside class="yr-c4 yr-card yr-lb"><p class="yr-label">Need help?</p><p class="yr-note">Return to the board or use the streamer's configured channel links.</p></aside></div>`;
  return shell({ r, ...opts, contentHtml: content, title: `${title} · ${r.data.brand?.name || r.slug}`, description: `${title} for ${r.data.brand?.name || r.slug}.` });
}

export function renderNewPlayerProfile(data, player, history, opts) {
  const r = record(data, opts);
  const p = player || {};
  const rows = (history || []).length
    ? history.map((h) => `<tr><td>${esc(h.label || "Archived")}</td><td>#${Number(h.rank) || "—"}</td><td>${esc(String(h.wagered || 0))}</td><td>${esc(String(h.prize || 0))}</td></tr>`).join("")
    : `<tr><td colspan="4">No archived results yet.</td></tr>`;
  const content = `<div class="yr-hero"><p class="yr-eyebrow"><i></i>PLAYER PROFILE</p><h1 class="yr-h1">${esc(p.name || "Player")}</h1><p class="yr-lede">Current standing and archived results for this board.</p></div><div class="yr-g3"><div class="yr-card yr-lb"><p class="yr-label">Current rank</p><p class="yr-num">#${Number(p.rank) || "—"}</p></div><div class="yr-card yr-lb"><p class="yr-label">Wagered</p><p class="yr-num">${esc(String(p.wagered || 0))}</p></div><div class="yr-card yr-lb"><p class="yr-label">Prize</p><p class="yr-num">${esc(String(p.prize || 0))}</p></div></div><div class="yr-card yr-lb"><h2 class="yr-panel-title">Archived results</h2><div class="yr-table-wrap"><table class="yr-table"><thead><tr><th>Period</th><th>Rank</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  return shell({ r, ...opts, contentHtml: content, title: `${p.name || "Player"} · ${r.data.brand?.name || r.slug}`, description: `Player profile for ${p.name || "this player"}.` });
}

export function renderNewHallOfFame(data, opts) {
  const r = record(data, opts);
  const winners = (r.data.pastWinners || []).slice(0, 20);
  const content = `<div class="yr-hero"><p class="yr-eyebrow"><i></i>ARCHIVE</p><h1 class="yr-h1">Hall of Fame</h1><p class="yr-lede">Past boards and winners for ${esc(r.data.brand?.name || r.slug)}.</p></div>${winners.length ? `<div class="yr-card yr-lb"><div class="yr-list">${winners.map((w) => `<div class="yr-list-item"><div><p class="yr-list-h">${esc(w.label || "Past board")}</p><p class="yr-list-p">${Number(w.players) || 0} players</p></div><span class="yr-tag">${esc(w.winner || "Winner not recorded")}</span></div>`).join("")}</div></div>` : '<div class="yr-empty">No past winners yet.</div>'}`;
  return shell({ r, ...opts, contentHtml: content, title: `Hall of Fame · ${r.data.brand?.name || r.slug}`, description: `Past winners for ${r.data.brand?.name || r.slug}.` });
}

export function renderNewStreamerProfile(data, opts) {
  const r = record(data, opts);
  const profileData = r.data || {};
  const socials = (profileData.socials || []).filter((s) => s.enabled !== false && s.url);
  const boards = (r.boards || []).filter((b) => b.slug && b.name);
  const content = `<div class="yr-hero"><p class="yr-eyebrow"><i></i>STREAMER PROFILE</p><h1 class="yr-h1">${esc(profileData.brand?.name || r.slug)}</h1><p class="yr-lede">${esc(profileData.brand?.tagline || "No profile description yet.")}</p></div><div class="yr-g12"><section class="yr-c8 yr-card yr-lb"><h2 class="yr-panel-title">Channel links</h2>${socials.length ? `<div class="yr-g3">${socials.map((s) => `<a class="yr-btn" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name || s.brand || "Channel")}</a>`).join("")}</div>` : '<p class="yr-empty">No channel links yet.</p>'}</section><section class="yr-c4 yr-card yr-lb"><h2 class="yr-panel-title">Leaderboards</h2>${boards.length ? `<div class="yr-list">${boards.map((b) => `<a class="yr-list-item" href="/${esc(b.slug)}"><span class="yr-list-h">${esc(b.name)}</span><span class="yr-tag">Open</span></a>`).join("")}</div>` : '<p class="yr-empty">No public leaderboards yet.</p>'}</section></div>`;
  return shell({ r, ...opts, contentHtml: content, title: `${profileData.brand?.name || r.slug} · Streamer profile`, description: `Streamer profile for ${profileData.brand?.name || r.slug}.` });
}

export function renderNewEmbed(data, opts) {
  const b = data.brand || {};
  const players = Array.isArray(data.players) ? data.players.slice().sort((a, z) => (Number(z.wagered) || 0) - (Number(a.wagered) || 0)) : [];
  const rows = players.length ? players.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${esc(String(p.wagered || 0))}</td><td>${esc(String(p.prize || 0))}</td></tr>`).join("") : '<tr><td colspan="4">No players yet.</td></tr>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name || opts.slug)}</title><link rel="stylesheet" href="/assets/site-shell.css"><style nonce="${esc(opts.nonce)}">body{margin:0;background:transparent}.yr-embed{max-width:680px;margin:0 auto;padding:12px}.yr-embed .yr-card{padding:18px}.yr-embed table{width:100%}</style></head><body class="yr-site"><main class="yr-embed"><section class="yr-card yr-lb"><p class="yr-eyebrow"><i></i>${esc(b.period || "CURRENT BOARD")}</p><h1 class="yr-h1">${esc(b.name || opts.slug)}</h1><p class="yr-lede">${esc(b.prizePool || "")}</p><div class="yr-table-wrap"><table class="yr-table"><thead><tr><th>#</th><th>Player</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>${rows}</tbody></table></div></section></main></body></html>`;
}
