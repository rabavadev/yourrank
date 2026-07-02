// ============================================================================
//  YourRank — SHARED DASHBOARD SHELL / TOP NAV  (leaderboard Worker, JS)
//
//  One header injected at the top of BOTH dashboards so the two Workers feel
//  like one app. Renders: streamer name, plan badge, and the tab links
//    Leaderboard | Bot | Analytics | Billing | Logout
//  Active tab is highlighted from the current request path.
//
//  Aesthetic locked to rankup-saas: near-black #0b0b0c, single lime accent
//  #c8ff00, JetBrains Mono for labels, Inter for text. No gradients, no glass.
//
//  This is the SOURCE OF TRUTH. shell-nav.ts is a behavioural port for the bot
//  Worker. Keep them in sync.
//
//  Usage (leaderboard Worker, /dashboard):
//    import { shellNavHtml, SHELL_NAV_CSS } from "../shared/shell-nav.js";
//    const html = `<!doctype html><html><head>...<style>${SHELL_NAV_CSS}
//                  ${YOUR_PAGE_CSS}</style></head><body>
//                  ${shellNavHtml({ activePath: url.pathname, user })}
//                  <main class="gm-shell-main">...page...</main>`;
//
//  Usage (bot Worker, /bot/dashboard): identical, from shell-nav.ts.
// ============================================================================

// Canonical destinations (absolute paths on yourrank.site). These match
// routing.md. Leaderboard + Analytics + Billing live on the leaderboard Worker;
// Bot lives on the bot Worker. Because they share the domain, plain <a> links
// navigate between Workers seamlessly and the gm_session cookie rides along.
export const NAV_LINKS = [
  { key: "leaderboard", label: "Leaderboard", href: "/dashboard",           match: ["/dashboard"] },
  { key: "bot",         label: "Bot",         href: "/bot/dashboard",       match: ["/bot/dashboard", "/bot/dash"] },
  { key: "analytics",   label: "Analytics",   href: "/dashboard/analytics", match: ["/dashboard/analytics"] },
  { key: "billing",     label: "Billing",     href: "/dashboard/billing",   match: ["/dashboard/billing"] },
];

// Which nav key is active for a given pathname. Longest-prefix wins so that
// /dashboard/billing does not also light up /dashboard (Leaderboard).
export function activeKey(pathname) {
  const p = (pathname || "/").replace(/\/+$/, "") || "/";
  let best = null;
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

// HTML-escape untrusted user strings before embedding.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
}

// Plan badge -> label + modifier class. Plans come from the unified schema enum
// plan_tier: 'free' | 'pro' | 'agency'.
function planBadge(plan) {
  const p = String(plan || "free").toLowerCase();
  const label = p === "agency" ? "Agency" : p === "pro" ? "Pro" : "Free";
  const mod = p === "free" ? "gm-badge--free" : "gm-badge--paid";
  return `<span class="gm-badge ${mod}">${label}</span>`;
}

// Render the nav. `user` = { display_name?, email?, plan? } (bare fields from
// the users table — either Worker's loader shape works).
export function shellNavHtml({ activePath, user } = {}) {
  const active = activeKey(activePath);
  const name = esc(user?.display_name || user?.email || "Streamer");
  const badge = planBadge(user?.plan);

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
    <nav class="gm-tabs">${tabs}</nav>
    <div class="gm-who">
      <span class="gm-who-name">${name}</span>
      ${badge}
      <a class="gm-logout" href="/logout">Logout</a>
    </div>
  </div>
</header>`;
}

// Standalone CSS. Namespaced under .gm-shell-* so it never collides with either
// dashboard's own styles. Reuses the exact rankup-saas palette.
export const SHELL_NAV_CSS = `
:root{
  --gm-bg:#0b0b0c; --gm-panel:#0f0f11; --gm-line:#232327; --gm-line-2:#2e2e33;
  --gm-ink:#ededf0; --gm-ink-soft:#a3a3ab; --gm-ink-mute:#6a6a72;
  --gm-accent:#c8ff00; --gm-accent-ink:#0b0b0c;
  --gm-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --gm-sans:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
}
.gm-shell-nav{position:sticky;top:0;z-index:50;background:var(--gm-bg);
  border-bottom:1px solid var(--gm-line);}
.gm-shell-inner{max-width:1040px;margin:0 auto;padding:0 18px;height:56px;
  display:flex;align-items:center;gap:22px;}
.gm-brand{display:flex;align-items:center;gap:9px;text-decoration:none;flex:0 0 auto;}
.gm-brand-mark{font-family:var(--gm-mono);font-weight:700;font-size:13px;
  letter-spacing:.02em;color:var(--gm-accent-ink);background:var(--gm-accent);
  width:26px;height:26px;display:grid;place-items:center;border-radius:6px;}
.gm-brand-word{font-family:var(--gm-mono);font-size:14px;letter-spacing:.02em;
  color:var(--gm-ink);}
.gm-tabs{display:flex;align-items:center;gap:2px;flex:1 1 auto;}
.gm-tab{font-family:var(--gm-mono);font-size:12px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--gm-ink-mute);text-decoration:none;
  padding:18px 14px;border-bottom:2px solid transparent;transition:color .15s,border-color .15s;}
.gm-tab:hover{color:var(--gm-ink-soft);}
.gm-tab--active{color:var(--gm-ink);border-bottom-color:var(--gm-accent);}
.gm-who{display:flex;align-items:center;gap:12px;flex:0 0 auto;}
.gm-who-name{font-family:var(--gm-sans);font-size:13px;color:var(--gm-ink-soft);
  max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gm-badge{font-family:var(--gm-mono);font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;padding:3px 8px;border-radius:99px;border:1px solid var(--gm-line-2);}
.gm-badge--free{color:var(--gm-ink-mute);}
.gm-badge--paid{color:var(--gm-accent);border-color:#3a4218;}
.gm-logout{font-family:var(--gm-mono);font-size:11px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--gm-ink-mute);text-decoration:none;
  padding:6px 10px;border:1px solid var(--gm-line-2);border-radius:7px;transition:color .15s,border-color .15s;}
.gm-logout:hover{color:var(--gm-ink);border-color:var(--gm-line-2);}
.gm-shell-main{max-width:1040px;margin:0 auto;padding:22px 18px 60px;}
@media(max-width:680px){
  .gm-shell-inner{gap:12px;padding:0 12px;}
  .gm-brand-word{display:none;}
  .gm-tab{padding:18px 9px;font-size:11px;letter-spacing:.05em;}
  .gm-who-name{display:none;}
}
`;
