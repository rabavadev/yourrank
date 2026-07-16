// ============================================================================
//  YourRank — shared page shell helpers
//
//  Deduplicates the outer HTML boilerplate (head, skip link, top nav, <main>)
//  for dashboard pages so the leaderboard and bot shells can't drift again.
//
//  These modules are compiled to shared/*.js by `node build-shared.mjs`.
// ============================================================================

import { shellNavHtml, SHELL_NAV_CSS, type ShellUser } from "./shell-nav.js";

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string)
  );
}

const GOOGLE_FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />';

export interface LeaderboardPageOpts {
  title: string;
  canonical: string;
  reqId?: string;
  mainClass?: string;
  styles?: string[];
  scripts?: string[];
  noscript?: string;
  content: string;
}

/** Full HTML document for leaderboard dashboard pages, with a <!--GM_NAV--> placeholder. */
export function leaderboardPageHtml(opts: LeaderboardPageOpts): string {
  const mainClass = esc(opts.mainClass || "wrap");
  const reqIdMeta = opts.reqId ? `<meta name="request-id" content="${esc(opts.reqId)}" />` : "";
  const styles = (opts.styles || ["/assets/app.css", "/assets/shell-nav.css"])
    .map((href) => `<link rel="stylesheet" href="${esc(href)}" />`)
    .join("");
  const scripts = (opts.scripts || []).join("");
  const noscript =
    opts.noscript ||
    "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to use the dashboard.</p>";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(opts.title)}</title>
${reqIdMeta}
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="${esc(opts.canonical)}" />${GOOGLE_FONTS}
${styles}
</head><body>
<noscript><div class="noscript-msg">${noscript}</div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<!--GM_NAV-->
<main class="${mainClass}" id="main-content">${opts.content}</main>
${scripts}
</body></html>`;
}

const BOT_STYLE_ATTR_CSS = `
/* ---- inline style migration (M-02) ---- */
.hidden { display: none !important; }
.sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0); }
.skip-link { position:absolute;left:8px;top:8px;z-index:100;background:var(--bg);color:var(--fg);padding:10px 14px;border:1px solid var(--border-2);border-radius:8px;text-decoration:none;transform:translateY(-200%);transition:transform .15s; }
.skip-link:focus { transform:translateY(0);outline:2px solid var(--accent); }
.style-1 { margin-bottom:8px }
.style-2 { margin-bottom:20px }
.style-3 { margin-top:24px;border-top:1px solid var(--border);padding-top:16px }
.style-4 { display:flex;align-items:center;gap:12px }
.style-5 { margin-bottom:18px }
.style-6 { font-size:12px }
.style-7 { display:flex;justify-content:space-between;font-size:11px }
.style-8 { text-align:right }
.style-9 { font-size:12px;margin-top:10px }
.style-10 { margin-top:12px }
.style-11 { display:flex;gap:6px;align-items:center }
.style-12 { flex:1 }
.style-13 { margin-bottom:12px;font-size:13px }
.style-14 { width:auto;min-width:160px;display:inline-block;margin-left:8px }
.style-15 { margin-bottom:12px;color:var(--accent) }
.style-16 { margin-bottom:12px }
.style-17 { display:block;margin-bottom:4px;font-size:13px }
.style-18 { margin:20px 0 6px;font-size:14px }
.style-19 { margin-bottom:10px;font-size:13px }
.style-20 { margin-top:14px }
.style-21 { margin-bottom:10px }
.style-22 { display:block;font-size:13px }
.style-23 { max-width:300px }
.style-24 { font-size:13px;margin:2px 0 10px }
.style-25 { display:flex;gap:8px;align-items:center;flex-wrap:wrap }
.style-26 { font-size:13px }
.style-27 { max-width:150px }
.style-28 { font-size:12px;margin-top:6px }
.style-29 { margin-bottom:10px;font-size:12px }
.style-30 { margin-left:8px }
.style-31 { margin-left:12px }
.style-32 { margin-left:6px;color:var(--red) }
.style-33 { padding:2px 8px;font-size:12px }
.style-34 { color:var(--accent) }
.style-35 { margin-right:8px }
`;

const BOT_BASE_CSS = `
  :root { --bg:#0d1117; --panel:#161b22; --panel-2:#1b222b; --border:#2a313a; --border-2:#3a434f;
          --fg:#e9eef4; --dim:#9aa4b0; --mute:#8b949e;
          --accent:#f0b429; --accent-ink:#1a1205; --green:#3fb950; --red:#f85149;
          --mono:ui-monospace,SFMono-Regular,Menlo,monospace; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 -apple-system,'Segoe UI',Roboto,sans-serif; }

  /* ---- shell: sidebar + main ---- */
  .shell { display:flex; align-items:flex-start; }
  .side { width:212px; flex:none; border-right:1px solid var(--border); padding:16px 12px;
          position:sticky; top:56px; height:calc(100vh - 56px); display:flex; flex-direction:column; gap:3px; }
  .side .snav a { display:flex; align-items:center; gap:10px; padding:8px 11px; border-radius:8px;
          text-decoration:none; color:var(--dim); font-size:14px; }
  .side .snav a .ic { width:17px; text-align:center; opacity:.85; }
  .side .snav a:hover { background:var(--panel); color:var(--fg); }
  .side .snav a.active { background:var(--panel); color:var(--fg); box-shadow:inset 2px 0 0 var(--accent); }
  .side .sfoot { margin-top:auto; border-top:1px solid var(--border); padding-top:12px; font-size:12px; color:var(--dim); }
  .side .sfoot .nm { color:var(--fg); font-weight:600; }
  .side .sfoot button { margin-top:10px; width:100%; }
  .main { flex:1; min-width:0; }
  .wrap { max-width:1040px; margin:0 auto; padding:22px 20px 60px; }
  .pagehead { margin-bottom:20px; }
  .pagehead h1 { font-size:20px; } .pagehead p { font-size:13px; color:var(--dim); margin-top:2px; }

  .panel { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:18px 18px; margin-bottom:18px; }
  h1 { font-size:20px; }
  h2 { font-size:12px; letter-spacing:.03em; text-transform:uppercase; margin-bottom:12px; color:var(--dim); font-weight:600; }
  h3 { color:var(--fg); }
  input, textarea, select { width:100%; background:var(--bg); color:var(--fg); border:1px solid var(--border-2);
          border-radius:8px; padding:9px 11px; margin-bottom:10px; font:inherit; }
  select { cursor:pointer; }
  button { background:var(--accent); color:var(--accent-ink); border:0; border-radius:8px; padding:9px 15px;
           font:600 14px/1 inherit; cursor:pointer; }
  button.ghost { background:transparent; color:var(--dim); border:1px solid var(--border-2); padding:8px 12px; }
  button.ghost:hover { color:var(--fg); }
  button.danger { background:transparent; color:var(--red); border:1px solid var(--red); padding:8px 12px; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:9px 10px; border-bottom:1px solid var(--border); }
  th { color:var(--dim); font-weight:500; font-size:12px; }
  .muted { color:var(--dim); } .ok { color:var(--green); } .off { color:var(--red); }
  .row { display:flex; gap:14px; flex-wrap:wrap; } .row > * { flex:1; min-width:220px; }
  .stat { font-size:28px; font-weight:700; } .copy { cursor:pointer; text-decoration:underline dotted; }
  #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--accent);
           color:var(--accent-ink); padding:10px 18px; border-radius:8px; font-weight:600; }
  button:disabled, .copy:disabled { opacity:0.6; cursor:not-allowed; }

  /* ---- quick actions (overview) ---- */
  .qa { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
  .qa a { display:flex; flex-direction:column; gap:4px; padding:12px 16px; border:1px solid var(--border);
          border-radius:12px; background:var(--panel); text-decoration:none; }
  .qa a:hover { border-color:var(--accent); }
  .qa .t { color:var(--fg); font-weight:600; font-size:14px; }
  .qa .d { color:var(--dim); font-size:12px; }

  /* ---- advanced disclosure ---- */
  details.adv { border:1px solid var(--border); border-radius:8px; padding:8px 12px; margin:12px 0; }
  details.adv summary { cursor:pointer; color:var(--dim); font-size:13px; }
  details.adv[open] summary { margin-bottom:8px; }

  /* ---- KPI cards (overview) ---- */
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
  .kpi { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:15px 16px; }
  .kpi .lbl { font-size:12px; color:var(--dim); }
  .kpi .stat { font:700 30px/1.1 var(--mono); letter-spacing:-.02em; margin-top:6px; }
  .kpi .sub { font-size:12px; color:var(--dim); margin-top:5px; min-height:16px; }
  .kpi .sub .up { color:var(--green); }

  /* ---- two-column content grid ---- */
  .grid2 { display:grid; grid-template-columns:1.6fr 1fr; gap:18px; }
  .grid2 .panel { margin-bottom:0; }
  .cardhd { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .cardhd h2 { margin:0; }
  .cardhd a { font-size:12px; color:var(--dim); text-decoration:none; }
  .cardhd a:hover { color:var(--fg); }

  /* ---- compact summary rows (overview) ---- */
  .lrow { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:11px 2px; border-top:1px solid var(--border); }
  .lrow:first-child { border-top:0; }
  .lrow .l { min-width:0; } .lrow .l .nm { font-weight:600; font-size:14px; }
  .lrow .l .ds { font-size:12px; color:var(--dim); }
  .badge { font-size:11px; font-weight:600; padding:3px 9px; border-radius:999px; border:1px solid var(--border-2); color:var(--dim); }
  .badge.on { color:var(--green); border-color:rgba(63,185,80,.4); }
  .badge.off { color:var(--red); border-color:rgba(248,81,73,.4); }

  /* ---- setup checklist (overview) ---- */
  .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .step { border:1px solid var(--border); border-radius:10px; padding:12px; }
  .step .n { font-size:11px; color:var(--dim); font-family:var(--mono); }
  .step .t { font-weight:600; font-size:14px; margin:3px 0; }
  .step .d { font-size:12px; color:var(--dim); }
  .step.done { opacity:.55; }
  .step.done .t::before { content:"\\2713 "; color:var(--green); }

  .bot-card { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:12px;
              padding:12px; border:1px solid var(--border); border-radius:8px; }
  .bot-card .meta { flex:1; min-width:180px; }
  .bot-card .actions { display:flex; gap:8px; flex-wrap:wrap; }
  .bot-card button { padding:6px 12px; font-size:13px; }
  .code { font-family:var(--mono); font-size:12px; background:var(--panel-2); padding:2px 6px; border-radius:5px; }

  .menu-btn { display:none; }
  @media (max-width:860px) {
    .side { position:fixed; left:0; top:0; height:100vh; z-index:60; background:var(--bg);
            transform:translateX(-100%); transition:transform .2s; box-shadow:2px 0 18px rgba(0,0,0,.5); }
    .side.open { transform:none; }
    .menu-btn { display:inline-grid; place-items:center; width:36px; height:36px; border-radius:8px;
                border:1px solid var(--border-2); background:transparent; color:var(--fg); padding:0; }
    .kpis { grid-template-columns:1fr 1fr; }
    .qa { grid-template-columns:1fr 1fr; }
    .grid2 { grid-template-columns:1fr; }
    .steps { grid-template-columns:1fr; }
    .wrap { padding:16px 14px 48px; }
  }
`;

export interface BotPageOpts {
  user: ShellUser;
  page: string;
  nonce?: string;
  content: string;
}

/** Full HTML document for the bot dashboard. `content` is placed right after the shared header. */
export function botPageHtml(opts: BotPageOpts): string {
  const nonceAttr = opts.nonce ? ` nonce="${esc(opts.nonce)}"` : "";
  const activePath = "/bot" + (opts.page === "overview" ? "/dashboard" : "/" + opts.page);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard</title><style${nonceAttr}>${BOT_STYLE_ATTR_CSS}${SHELL_NAV_CSS}${BOT_BASE_CSS}</style></head><body data-page="${esc(opts.page)}">
<a href="#main-content" class="skip-link">Skip to main content</a>
${shellNavHtml({ activePath, user: opts.user, logoutAction: "/bot/auth/logout" })}
${opts.content}
</body></html>`;
}
