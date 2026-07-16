// ============================================================================
//  YourRank — SHARED DASHBOARD SHELL / TOP NAV  (bot Worker, TypeScript)
//
//  Behavioural port of shared/shell-nav.js. See that file for the full doc.
//  Renders the same sticky header (Leaderboard | Bot | Analytics | Billing |
//  Logout) so the bot dashboard at /bot/dashboard feels like the same app.
//
//  Usage (bot Worker dashboard.ts):
//    import { shellNavHtml, SHELL_NAV_CSS } from "../shared/shell-nav.js";
//    // (import path ends in .js even from .ts under NodeNext/Workers ESM)
//    const html = `<!doctype html><html><head>...<style>${SHELL_NAV_CSS}
//                  ${BASE_CSS}</style></head><body>
//                  ${shellNavHtml({ activePath: "/bot/dashboard", user })}
//                  <main class="gm-shell-main">...bot dashboard...</main>`;
// ============================================================================

export interface ShellUser {
  display_name?: string | null;
  email?: string | null;
  plan?: string | null;
}
export interface NavLink {
  key: string;
  label: string;
  href: string;
  match: string[];
}

export const NAV_LINKS: NavLink[] = [
  { key: "leaderboard", label: "Leaderboard", href: "/dashboard",           match: ["/dashboard"] },
  { key: "bot",         label: "Bot",         href: "/bot/dashboard",       match: ["/bot/dashboard", "/bot/dash"] },
  { key: "analytics",   label: "Analytics",   href: "/dashboard/analytics", match: ["/dashboard/analytics"] },
  { key: "attribution", label: "Attribution", href: "/dashboard/attribution", match: ["/dashboard/attribution"] },
  { key: "billing",     label: "Billing",     href: "/dashboard/billing",   match: ["/dashboard/billing"] },
  { key: "security",    label: "Security",    href: "/dashboard/security",  match: ["/dashboard/security"] },
];

export function activeKey(pathname: string): string | null {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  let best: string | null = null;
  let bestLen = -1;
  for (const link of NAV_LINKS) {
    for (const m of link.match) {
      if ((p === m || p.startsWith(m + "/")) && m.length > bestLen) {
        best = link.key;
        bestLen = m.length;
      }
    }
  }
  return best;
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)
  );
}

function planBadge(plan?: string | null): string {
  const p = String(plan || "free").toLowerCase();
  const label = p === "agency" ? "Agency" : p === "pro" ? "Pro" : p === "starter" ? "Starter" : "Free";
  const mod = p === "free" ? "gm-badge--free" : "gm-badge--paid";
  return `<span class="gm-badge ${mod}">${label}</span>`;
}

export function shellNavHtml(
  opts: { activePath?: string; user?: ShellUser; logoutAction?: string } = {}
): string {
  const active = activeKey(opts.activePath || "/");
  const name = esc(opts.user?.display_name || opts.user?.email || "Streamer");
  const badge = planBadge(opts.user?.plan);
  const area = encodeURIComponent(active || "dashboard");
  const returnTo = encodeURIComponent(opts.activePath || "/dashboard");
  const helpQuery = `area=${area}&amp;return=${returnTo}`;

  const tabs = NAV_LINKS.map((l) => {
    const isActive = l.key === active;
    return `<a class="gm-tab${isActive ? " gm-tab--active" : ""}"` +
      `${isActive ? ' aria-current="page"' : ""} href="${l.href}">${l.label}</a>`;
  }).join("");

  return `<header class="gm-shell-nav">
  <div class="gm-shell-inner">
    <a class="gm-brand" href="/dashboard">
      <span class="gm-brand-mark">YR</span>
      <span class="gm-brand-word">YourRank</span>
    </a>
    <nav class="gm-tabs" aria-label="Dashboard">${tabs}</nav>
    <div class="gm-who">
      <a class="gm-help-link" href="/contact?type=feedback&amp;${helpQuery}">Feedback</a>
      <a class="gm-help-link gm-help-link--support" href="/contact?type=support&amp;${helpQuery}">Support</a>
      <span class="gm-who-name">${name}</span>
      ${badge}
      <form method="POST" action="${esc(opts.logoutAction || "/logout")}" class="gm-logout-form"><button class="gm-logout" type="submit">Logout</button></form>
    </div>
  </div>
</header>`;
}

// Identical CSS to shell-nav.js — namespaced .gm-shell-* / .gm-* so it never
// collides with the bot dashboard's own BASE_CSS.
export const SHELL_NAV_CSS = `
:root{
  --gm-bg:#0b0b0c; --gm-panel:#0f0f11; --gm-line:#232327; --gm-line-2:#2e2e33;
  --gm-ink:#ededf0; --gm-ink-soft:#a3a3ab; --gm-ink-mute:#8b949e;
  --gm-accent:#c8ff00; --gm-accent-ink:#0b0b0c;
  --gm-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --gm-sans:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
}
.gm-shell-nav{position:sticky;top:0;z-index:50;background:var(--gm-bg);
  border-bottom:1px solid var(--gm-line);}
.gm-brand{display:flex;align-items:center;gap:9px;text-decoration:none;flex:0 0 auto;}
.gm-brand-mark{font-family:var(--gm-mono);font-weight:700;font-size:13px;
  letter-spacing:.02em;color:var(--gm-accent-ink);background:var(--gm-accent);
  width:26px;height:26px;display:grid;place-items:center;border-radius:6px;}
.gm-brand-word{font-family:var(--gm-mono);font-size:14px;letter-spacing:.02em;
  color:var(--gm-ink);}
.gm-shell-inner{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:22px;}
.gm-tabs{display:flex;align-items:center;gap:2px;min-width:0;overflow-x:auto;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;
  flex-wrap:nowrap;}
.gm-tabs::-webkit-scrollbar{display:none;}
.gm-tab{font-family:var(--gm-mono);font-size:12px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--gm-ink-mute);text-decoration:none;
  padding:18px 14px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;
  white-space:nowrap;flex:0 0 auto;display:inline-block;}
.gm-tab:hover{color:var(--gm-ink-soft);}
.gm-tab--active{color:var(--gm-ink);border-bottom-color:var(--gm-accent);}
.gm-who{display:flex;align-items:center;gap:12px;flex:0 0 auto;min-width:0;}
.gm-who-name{font-family:var(--gm-sans);font-size:13px;color:var(--gm-ink-soft);
  max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gm-badge{font-family:var(--gm-mono);font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;padding:3px 8px;border-radius:99px;border:1px solid var(--gm-line-2);}
.gm-badge--free{color:var(--gm-ink-mute);}
.gm-badge--paid{color:var(--gm-accent);border-color:#3a4218;}
.gm-logout{font-family:var(--gm-mono);font-size:11px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--gm-ink-soft);text-decoration:none;
  padding:6px 10px;border:1px solid var(--gm-line-2);border-radius:7px;transition:color .15s,border-color .15s;}
.gm-logout:hover{color:var(--gm-ink);border-color:var(--gm-line-2);}
.gm-shell-main{max-width:1040px;margin:0 auto;padding:22px 18px 60px;}
.gm-help-link{font-family:var(--gm-mono);font-size:10px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--gm-ink-soft);text-decoration:none;padding:6px 9px;
  border:1px solid var(--gm-line-2);border-radius:7px;white-space:nowrap;}
.gm-help-link:hover{color:var(--gm-ink);border-color:var(--gm-ink-mute);}
.gm-help-link--support{color:var(--gm-accent-ink);background:var(--gm-accent);border-color:var(--gm-accent);}
.gm-help-link--support:hover{color:var(--gm-accent-ink);border-color:var(--gm-accent);}
@media(max-width:680px){
    .gm-shell-inner{gap:12px;padding:0 12px;}
    .gm-brand-word{display:none;}
    .gm-tab{padding:18px 9px;font-size:11px;letter-spacing:.05em;}
    .gm-who-name{display:none;}
    .gm-who .gm-help-link:not(.gm-help-link--support){display:none;}
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }
  `;
