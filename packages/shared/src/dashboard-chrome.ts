// ============================================================================
//  YourRank — SHARED DASHBOARD CHROME (rail + topbar)
//
//  The signed-in shell used to exist twice: the leaderboard Worker rendered a
//  `.lb-side` rail with JSX, and the bot Worker rendered its own `.side` rail
//  with different CSS, so /bot/* looked like a different (older) product. Both
//  now render this markup, styled by /assets/dashboard-v3.css.
// ============================================================================

import { profileMenuHtml, type ShellUser } from "./shell-nav.js";
import { brandMarkSvg } from "./brand-assets.js";

const DESIGN_CONTRACT = `<!--
THESIS: A creator run-sheet workspace turns dashboard state into the next clear action; it refuses the generic dark tile wall.
OWN-WORLD: Cool-gray canvas, white 12-column modules, deep-navy production rail, cobalt actions, and narrow status cue bands.
STORY: A non-technical streamer sees what is live, what needs attention, acts immediately, and can reach every feature from one rail.
FIRST VIEWPORT: Fixed branded rail at left; operational topbar above a status cue, three KPIs, and an asymmetric activity workspace; primary action sits beside the page title.
FORM: Creator Run-Sheet workspace, selected direction, seed 562938e8.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

const MENU_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const COLLAPSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';

export type NavItem = NavLinkItem | NavGroupItem;

export interface NavLinkItem {
  key: string;
  label: string;
  href: string;
  /** Inner SVG path markup; omitted for child links, which are unindented text. */
  icon?: string | null;
  hash?: string;
  child?: boolean;
  productKey?: string;
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
  const links = items.filter((item) => !("child" in item) || !item.child || item.key === active).map((item) => {
    if ("group" in item) {
      return `<div class="lb-nav-group-label" role="heading" aria-level="2">${esc(item.group)}</div>`;
    }
    const isActive = item.key === active && (!item.hash || activeHash === item.hash);
    const cls = `lb-nav${isActive ? " is-on" : ""}${item.child ? " lb-nav-child" : ""}`;
    const hash = item.hash ? ` data-hash="${esc(item.hash)}"` : "";
    const product = item.productKey ? ` data-product-link="${esc(item.productKey)}"` : "";
    return `<a class="${cls}" href="${esc(item.href)}" data-nav="${esc(item.key)}"${hash}` +
      `${product}${isActive ? ' aria-current="page"' : ""} title="${esc(item.label)}">${navIconHtml(item.icon)}${esc(item.label)}</a>`;
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
  railHeadHtml?: string;
  topbarHtml?: string;
  title?: string;
  titleId?: string;
  subtitle?: string;
  subtitleId?: string;
  crumbs?: Crumb[];
  user?: ShellUser;
  activePath?: string;
  logoutAction?: string;
  /** Extra markup for the rail footer (e.g. a log out button). */
  footHtml?: string;
  /** Move account controls to the bottom of the workspace rail. */
  railProfile?: boolean;
  /** Enable the persisted desktop rail-collapse control. */
  collapsible?: boolean;
  /** The surrounding document already provides the main landmark. */
  embeddedInMain?: boolean;
  content: string;
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
  const head = opts.railHeadHtml || (opts.headLabel || opts.headName
    ? `<div class="lb-side-head"><span class="label">${esc(opts.headLabel || "")}</span>` +
      `<div class="lb-active-name">${esc(opts.headName || "")}</div>` +
      (opts.headMeta ? `<div class="lb-active-meta">${esc(opts.headMeta)}</div>` : "") +
      `</div>`
    : "");
  const crumbs = crumbsHtml(opts.crumbs || []);
  const title = opts.title
    ? `<div class="v3-head">${crumbs}<h1${opts.titleId ? ` id="${esc(opts.titleId)}"` : ""}>${esc(opts.title)}</h1>` +
      (opts.subtitle ? `<p class="v3-head-sub"${opts.subtitleId ? ` id="${esc(opts.subtitleId)}"` : ""}>${esc(opts.subtitle)}</p>` : "") +
      `</div>`
    : "";
  const sideProfile = opts.railProfile ? `<div class="lb-side-profile">${profile}</div>` : "";
  const topProfile = opts.railProfile ? "" : `<div class="gm-profile-host">${profile}</div>`;
  const collapse = opts.collapsible
    ? `<button class="lb-side-collapse" type="button" aria-label="Collapse navigation" aria-pressed="false" aria-controls="lbSide" data-collapse-side>${COLLAPSE_ICON}</button>`
    : "";
  const contentOpen = opts.embeddedInMain
    ? '<div class="lb-bento" id="workspace-content">'
    : '<main class="lb-bento" id="main-content">';
  const contentClose = opts.embeddedInMain ? "</div>" : "</main>";
  return `<div class="v3-dash" id="dash"${opts.railProfile ? ' data-auth-workspace="true"' : ""} data-shell-drawer="shared">
${DESIGN_CONTRACT}
<div class="toast" id="status" role="status" aria-live="polite"></div>
<div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="${esc(opts.navLabel || "Dashboard")} sections">
<div class="lb-side-brandrow">
<a class="lb-side-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">${brandMarkSvg()}</span><span class="lb-side-brandcopy"><b>YourRank</b><small>Creator workspace</small></span></a>
${collapse}
<button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side="true">${CLOSE_ICON}</button>
</div>
${head}
${navListHtml(opts.nav, opts.active, opts.activeHash || "", opts.navLabel || "Dashboard")}
${opts.footHtml ? `<div class="lb-side-foot">${opts.footHtml}</div>` : ""}
${sideProfile}
</aside>
<div class="lb-main">
<header class="lb-topbar" id="lbTopbar">
<button class="lb-menu lb-topbar-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">${MENU_ICON}</button>
<a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">${brandMarkSvg()}</span><span class="lb-brand-txt">YourRank</span></a>
<div class="lb-topbar-actions">${opts.topbarHtml || topProfile}</div>
</header>
${contentOpen}
<div class="v3-stack">
${title}
${opts.content}
</div>
${contentClose}
</div>
</div>
</div>`;
}
