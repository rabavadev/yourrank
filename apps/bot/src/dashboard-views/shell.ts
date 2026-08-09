import { escHtml } from "./utils.js";

const ICONS: Record<string, string> = {
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  bots: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 15h6"/><path d="M12 6V4"/></svg>',
  offers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V3"/><path d="M8 3h8"/></svg>',
  commands: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21 17 3"/><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/></svg>',
  broadcasts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><circle cx="11" cy="11" r="2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

const pageLinks = [
  { key: "overview", label: "Overview", href: "/bot/dashboard", sub: "Your bot at a glance — last 14 days" },
  { key: "bots", label: "Bots", href: "/bot/bots", sub: "Connect and customize your Telegram bots" },
  { key: "offers", label: "Offers", href: "/bot/offers", sub: "Your casino links — clicks are tracked automatically" },
  { key: "commands", label: "Commands", href: "/bot/commands", sub: "Replies your bot sends when viewers type /something" },
  { key: "broadcasts", label: "Broadcasts", href: "/bot/broadcasts", sub: "Send a message to everyone who follows your bot" },
  { key: "settings", label: "Settings", href: "/bot/settings", sub: "Deposit tracking and your plan" },
];

export function sideNav(active: string, user: { display_name: string; plan: string }): string {
  const links = pageLinks.map(p =>
    `<a href="${escHtml(p.href)}" class="${p.key === active ? 'active' : ''}"${p.key === active ? ' aria-current="page"' : ''}>` +
    `<span class="ic" aria-hidden="true">${ICONS[p.key]}</span> ${escHtml(p.label)}</a>`
  ).join("");
  const plan = escHtml((user.plan || "free").replace(/^./, c => c.toUpperCase()));
  return `<aside class="side" id="side" aria-label="Bot dashboard navigation">
    <div class="side-head">
      <span class="label">Bot</span>
      <div class="side-active-name">${escHtml(user.display_name || 'Streamer')}</div>
      <div class="side-active-meta">${plan} plan</div>
    </div>
    <nav class="snav">${links}</nav>
    <div class="sfoot"><button class="ghost" data-action="logout" type="button">Log out</button></div>
  </aside>`;
}

export function pageHead(active: string): string {
  const p = pageLinks.find(l => l.key === active) || pageLinks[0];
  return `<div class="pagehead"><div class="style-4">
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu">\u2630</button>
    <div><h1>${escHtml(p.label)}</h1><p>${escHtml(p.sub)}</p></div></div></div>`;
}
