// ============================================================================
//  YourRank — SHARED DASHBOARD CHROME (rail + topbar)
//
//  The signed-in shell used to exist twice: the leaderboard Worker rendered a
//  `.lb-side` rail with JSX, and the bot Worker rendered its own `.side` rail
//  with different CSS, so /bot/* looked like a different (older) product. Both
//  now render this markup, styled by /assets/dashboard-v3.css.
// ============================================================================

import { profileMenuHtml, type ShellUser } from "./shell-nav.js";

export type NavItem = NavLinkItem | NavGroupItem;

export interface NavLinkItem {
  key: string;
  label: string;
  href: string;
  /** Inner SVG path markup; omitted for child links, which are unindented text. */
  icon?: string | null;
  hash?: string;
  child?: boolean;
}

export interface NavGroupItem {
  group: string;
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)
  );
}

export function navIconHtml(path?: string | null): string {
  if (!path) return "";
  return `<span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg></span>`;
}

export function navListHtml(
  items: NavItem[],
  active: string,
  activeHash = "",
  label = "Dashboard"
): string {
  const links = items.map((item) => {
    if ("group" in item) {
      return `<div class="lb-nav-group-label" role="heading" aria-level="2">${esc(item.group)}</div>`;
    }
    const isActive = item.key === active && (!item.hash || activeHash === item.hash);
    const cls = `lb-nav${isActive ? " is-on" : ""}${item.child ? " lb-nav-child" : ""}`;
    const hash = item.hash ? ` data-hash="${esc(item.hash)}"` : "";
    return `<a class="${cls}" href="${esc(item.href)}" data-nav="${esc(item.key)}"${hash}` +
      `${isActive ? ' aria-current="page"' : ""}>${navIconHtml(item.icon)}${esc(item.label)}</a>`;
  }).join("");
  return `<nav class="lb-side-group lb-side-nav" data-area="all" aria-label="${esc(label)}">${links}</nav>`;
}

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Leaf pages get an explicit path back up: the rail shows where you are, but
 * only within one product area, and several screens (board settings, credit
 * tabs, Telegram pages) are two levels deep.
 */
export function crumbsHtml(trail: Crumb[]): string {
  if (!trail || trail.length < 2) return "";
  const parts = trail.map((c, i) => {
    const last = i === trail.length - 1;
    const item = last || !c.href
      ? `<span${last ? ' aria-current="page"' : ""}>${esc(c.label)}</span>`
      : `<a href="${esc(c.href)}">${esc(c.label)}</a>`;
    return i === 0 ? item : `<span class="v3-crumb-sep" aria-hidden="true">/</span>${item}`;
  }).join("");
  return `<nav class="v3-crumbs" aria-label="Breadcrumb">${parts}</nav>`;
}

export interface ChromeOpts {
  /** Rail contents, in order. */
  nav: NavItem[];
  active: string;
  activeHash?: string;
  navLabel?: string;
  /** Rail header: label above a name (e.g. "Telegram" / the streamer). */
  headLabel?: string;
  headName?: string;
  headMeta?: string;
  /** Cross-product links rendered under the rail. */
  productLinks?: { label: string; href: string; active?: boolean }[];
  title?: string;
  subtitle?: string;
  crumbs?: Crumb[];
  user?: ShellUser;
  activePath?: string;
  logoutAction?: string;
  /** Extra markup for the rail footer (e.g. a log out button). */
  footHtml?: string;
  content: string;
}

function productNavHtml(links: ChromeOpts["productLinks"]): string {
  if (!links || !links.length) return "";
  const items = links.map((l) =>
    `<a class="lb-product-link${l.active ? " is-on" : ""}" href="${esc(l.href)}"` +
    `${l.active ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`
  ).join("");
  return `<nav class="lb-product-nav" aria-label="Product"><span class="label">Product</span>${items}</nav>`;
}

/**
 * The whole signed-in shell as a string, for Workers that render HTML without
 * JSX (the bot). The leaderboard's `DashboardShell` renders the same rail and
 * topbar from `navListHtml` / `profileMenuHtml`.
 */
export function dashboardChromeHtml(opts: ChromeOpts): string {
  const profile = profileMenuHtml({
    activePath: opts.activePath || "/dashboard",
    user: opts.user,
    logoutAction: opts.logoutAction,
    standalone: true,
  });
  const head = opts.headLabel || opts.headName
    ? `<div class="lb-side-head"><span class="label">${esc(opts.headLabel || "")}</span>` +
      `<div class="lb-active-name">${esc(opts.headName || "")}</div>` +
      (opts.headMeta ? `<div class="lb-active-meta">${esc(opts.headMeta)}</div>` : "") +
      `</div>`
    : "";
  const crumbs = crumbsHtml(opts.crumbs || []);
  const title = opts.title
    ? `<div class="v3-head">${crumbs}<h1>${esc(opts.title)}</h1>` +
      (opts.subtitle ? `<p class="v3-head-sub">${esc(opts.subtitle)}</p>` : "") +
      `</div>`
    : "";
  return `<div class="v3-dash" id="dash">
<div class="toast" id="status" role="status" aria-live="polite"></div>
<div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="${esc(opts.navLabel || "Dashboard")} sections">
${head}
<button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side="true">×</button>
${navListHtml(opts.nav, opts.active, opts.activeHash || "", opts.navLabel || "Dashboard")}
${productNavHtml(opts.productLinks)}
${opts.footHtml ? `<div class="lb-side-foot">${opts.footHtml}</div>` : ""}
</aside>
<div class="lb-main">
<header class="lb-topbar" id="lbTopbar">
<button class="lb-menu lb-topbar-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button>
<a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">Y</span><span class="lb-brand-txt">YourRank</span></a>
<div class="lb-topbar-actions"><div class="gm-profile-host">${profile}</div></div>
</header>
<main class="lb-bento" id="main-content">
<div class="v3-stack">
${title}
${opts.content}
</div>
</main>
</div>
</div>
</div>`;
}
