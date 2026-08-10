// ============================================================================
//  YourRank — shared page shell helpers
//
//  Deduplicates the outer HTML boilerplate (head, skip link, top nav, <main>)
//  for dashboard pages so the leaderboard and bot shells can't drift again.
//
//  These modules are compiled to shared/*.js by `node build-shared.mjs`.
// ============================================================================

import { type ShellUser } from "./shell-nav.js";

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
  description?: string;
  /** Defaults to "noindex, nofollow" — public pages must opt in to indexing. */
  robots?: string;
  reqId?: string;
  mainClass?: string;
  styles?: string[];
  scripts?: string[];
  noscript?: string;
  nav?: boolean;
  footer?: boolean;
  wide?: boolean;
  content: string;
}

/** Full HTML document for leaderboard dashboard pages. */
export function leaderboardPageHtml(opts: LeaderboardPageOpts): string {
  const mainClass = esc(opts.mainClass || "wrap");
  const bodyAttr = opts.wide ? ' data-wide="true"' : "";
  const reqIdMeta = opts.reqId ? `<meta name="request-id" content="${esc(opts.reqId)}" />` : "";
  const description = opts.description ? `<meta name="description" content="${esc(opts.description)}" />` : "";
  const styles = (opts.styles || ["/assets/app.css", "/assets/shell-nav.css"])
    .map((href) => `<link rel="stylesheet" href="${esc(href)}" />`)
    .join("");
  const scripts = (opts.scripts || []).join("");
  const noscript =
    opts.noscript ||
    "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to use the dashboard.</p>";
  const navPlaceholder = opts.nav !== false ? "<!--GM_NAV-->" : "";
  const navScript = opts.nav !== false ? '<script src="/assets/shell-nav.js" defer></script>' : "";
  const footer = opts.footer !== false ? `<footer class="gm-shell-footer">
  <div class="gm-shell-inner">
    <a class="gm-brand" href="/dashboard"><span class="gm-brand-mark">YR</span><span class="gm-brand-word">YourRank</span></a>
    <nav class="gm-shell-footer-links" aria-label="Legal">
      <a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a><a href="/responsible">Responsible Play</a>
    </nav>
    <span class="gm-shell-footer-copy">© {{YEAR}} YourRank</span>
  </div>
</footer>` : "";

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(opts.title)}</title>
${reqIdMeta}
${description}<meta name="robots" content="${esc(opts.robots || "noindex, nofollow")}" /><link rel="canonical" href="${esc(opts.canonical)}" />${GOOGLE_FONTS}
${styles}
</head><body${bodyAttr}>
<noscript><div class="noscript-msg">${noscript}</div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
${navPlaceholder}
<main class="${mainClass}" id="main-content">${opts.content}</main>
${footer}
${navScript}
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
.style-35 { margin-right:8px; display:inline-block }
.style-warn { color:var(--red); font-size:13px; margin-top:6px }
`;

const BOT_BASE_CSS = `
  /* One palette across both Workers — see apps/leaderboard/src/assets/app.css.
     tokens.test.js fails if these copies drift again. */
  :root { --bg:#fafafa; --panel:#ffffff; --panel-2:#f7f7f8; --border:#e4e4e7; --border-2:#d4d4d8;
          --fg:#191919; --dim:#55555c; --mute:#82828a;
          --accent:#2200ff; --accent-ink:#ffffff; --green:#10a37f; --red:#ef4444;
          --mono:"IBM Plex Mono","JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
          --sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          --yr-bg:var(--bg); --yr-panel:var(--panel); --yr-panel-2:var(--panel-2); --yr-line:var(--border); --yr-line-2:var(--border-2);
          --yr-ink:var(--fg); --yr-ink-soft:var(--dim); --yr-ink-mute:var(--mute); --yr-accent:var(--accent); --yr-accent-ink:var(--accent-ink);
          --yr-green:var(--green); --yr-red:var(--red); --yr-radius:14px; --yr-radius-sm:10px;
          --yr-shadow:0 1px 2px rgba(0,0,0,.05); --yr-shadow-lg:0 12px 32px rgba(0,0,0,.12);
          --yr-sans:var(--sans); --yr-mono:var(--mono); }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 var(--sans); }

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

  .bot-card { display:flex; flex-direction:column; gap:12px; margin-bottom:12px;
              padding:12px; border:1px solid var(--border); border-radius:8px; }
  .bot-card-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:8px; }
  .bot-card .meta { flex:1; min-width:180px; }
  .bot-card .actions { display:flex; gap:8px; flex-wrap:wrap; }
  .bot-card button { padding:6px 12px; font-size:13px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; font-weight:600; background:var(--panel-2); }
  .badge.ok { background:rgba(40,167,69,.15); color:#28a745; }
  .badge.off { background:rgba(108,117,125,.15); color:#6c757d; }
  .health-details { width:100%; font-size:13px; color:var(--dim); }
  .health-details summary { cursor:pointer; color:var(--fg); margin-bottom:6px; }
  .health-details ul { margin:0 0 8px; padding-left:18px; }
  .health-details li { margin-bottom:4px; }
  .wizard { display:flex; flex-direction:column; gap:18px; }
  .wizard-step { display:flex; flex-direction:column; gap:10px; }
  .wizard-step[hidden] { display:none; }
  .code { font-family:var(--mono); font-size:12px; background:var(--panel-2); padding:2px 6px; border-radius:5px; }

  /* broadcast preview modal */
  .bc-preview { position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; padding:18px; z-index:100; }
  .bc-preview[hidden] { display:none; }
  .bc-preview-card { width:100%; max-width:480px; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:22px; box-shadow:0 16px 38px -10px rgba(0,0,0,.5); }
  .bc-preview-card h3 { margin:0 0 8px; }
  .bc-preview-card p { color:var(--dim); margin:0 0 14px; }
  .bc-preview-msg { background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:12px; margin-bottom:14px; white-space:pre-wrap; word-break:break-word; }
  .bc-preview-img img { max-width:100%; border-radius:8px; margin-bottom:14px; display:block; }
  .bc-preview-actions { display:flex; gap:10px; justify-content:flex-end; }

  /* broadcast segment & schedule controls */
  .bc-segment { margin:10px 0; color:var(--dim); border:1px solid var(--border); border-radius:8px; padding:10px 12px; }
  .bc-segment summary { cursor:pointer; font-size:13px; }
  .bc-segment-fields { display:grid; grid-template-columns:repeat(2, minmax(120px, 1fr)); gap:10px; margin-top:10px; }
  .bc-segment-fields label { grid-column:1 / -1; margin:0; font-size:12px; }
  .bc-segment-fields input,
  .bc-segment-fields select { padding:6px 8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--fg); }
  @media (max-width:600px) { .bc-segment-fields { grid-template-columns:1fr; } }

  .cmd-button-list { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 12px; }
  .cmd-button-chip { display:inline-flex; align-items:center; gap:6px; background:var(--panel-2); border:1px solid var(--border); border-radius:999px; padding:4px 10px; font-size:13px; color:var(--fg); }
  .cmd-button-chip button { padding:0 4px; font-size:16px; line-height:1; background:transparent; border:none; color:var(--dim); cursor:pointer; }

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

  html { color-scheme: light; }
`;

const BOT_DASH_V2_CSS = `
  .pagehead { margin-bottom: 24px; }
  .pagehead h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .pagehead p { font-size: 13px; color: var(--yr-ink-soft); margin-top: 4px; }

  .panel, .kpi, .qa a, .step, .bot-card, .bc-segment {
    background: var(--yr-panel);
    border: 1px solid var(--yr-line);
    border-radius: var(--yr-radius);
    box-shadow: var(--yr-shadow);
  }
  .panel { padding: 18px; margin-bottom: 16px; }
  .kpi { padding: 16px; }
  /* auto-fit rather than a fixed 4 + a breakpoint: the cards reflow to 2 and
     then 1 column on their own, so nothing is crushed on a phone. */
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 18px; }
  .qa { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .qa a { display: flex; flex-direction: column; gap: 4px; padding: 16px; text-decoration: none; color: var(--yr-ink); }
  .qa a:hover { border-color: var(--yr-accent); }
  .qa .t { font-weight: 600; font-size: 14px; }
  .qa .d { font-size: 12px; color: var(--yr-ink-soft); }
  .grid2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; }
  .grid2 .panel { margin-bottom: 0; }
  @media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }
  .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .step { padding: 14px; }
  .step .n { font-size: 11px; color: var(--yr-ink-mute); font-family: var(--yr-mono); }
  .step .t { font-weight: 600; font-size: 14px; margin: 3px 0; color: var(--yr-ink); }
  .step .d { font-size: 12px; color: var(--yr-ink-soft); }
  .bot-card { display:flex; flex-direction:column; gap:12px; padding:14px; margin-bottom:12px; }
  .bot-card-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:8px; }
  .bot-card .meta { flex:1; min-width:180px; }
  .bot-card .actions { display:flex; gap:8px; flex-wrap:wrap; }
  .bot-card button { padding:6px 12px; font-size:13px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; font-weight:600; background:var(--yr-panel-2); }
  .badge.ok { background:rgba(74,222,128,.15); color:#4ade80; }
  .badge.off { background:rgba(156,163,175,.2); color:#9ca3af; }
  .health-details { width:100%; font-size:13px; color:var(--yr-ink-soft); }
  .health-details summary { cursor:pointer; color:var(--yr-ink); margin-bottom:6px; }
  .health-details ul { margin:0 0 8px; padding-left:18px; }
  .health-details li { margin-bottom:4px; }
  .wizard { display:flex; flex-direction:column; gap:18px; }
  .wizard-step { display:flex; flex-direction:column; gap:10px; }
  .wizard-step[hidden] { display:none; }
  .bc-segment { padding: 12px 14px; }

  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--yr-ink-mute); margin-bottom: 14px; font-weight: 600; }
  h3 { color: var(--yr-ink); font-size: 14px; font-weight: 600; }

  table th { color: var(--yr-ink-mute); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--yr-line); }
  table td { border-bottom: 1px solid var(--yr-line); }

  /* Tables are wider than a phone. Scroll them inside their panel instead of
     letting them widen the document, and keep the row label in view. */
  /* position:relative also keeps the absolutely-positioned .sr-only labels in
     the header row from escaping the scroller and widening the document. */
  .tbl-scroll { position: relative; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -18px; padding: 0 18px; }
  .tbl-scroll > table { min-width: 560px; }
  @media (max-width: 700px) {
    .tbl-scroll th:first-child, .tbl-scroll td:first-child {
      position: sticky; left: 0; background: var(--yr-panel);
      box-shadow: 1px 0 0 var(--yr-line);
    }
    .tbl-scroll td[colspan] { position: static; box-shadow: none; }
  }

  input, textarea, select { background: var(--yr-panel); border: 1px solid var(--yr-line-2); border-radius: 10px; padding: 10px 12px; font: inherit; }
  input:focus, textarea:focus, select:focus { outline: 2px solid var(--yr-accent); outline-offset: 0; }
  button { border-radius: 10px; }
  button.ghost { background: var(--yr-panel-2); color: var(--yr-ink-soft); border: 1px solid var(--yr-line-2); }
  button.danger { background: transparent; color: var(--yr-red); border: 1px solid rgba(217,48,37,.4); }

  .shell { display: flex; gap: 24px; align-items: flex-start; max-width: 1440px; margin: 0 auto; padding: 24px 28px 80px; }
  .side { flex: 0 0 240px; position: sticky; top: 86px; display: flex; flex-direction: column; gap: 6px; height: auto; max-height: calc(100vh - 110px); overflow-y: auto; padding: 18px; background: var(--yr-panel); border: 1px solid var(--yr-line); border-radius: var(--yr-radius); box-shadow: var(--yr-shadow); }
  .side-head { border-bottom: 1px solid var(--yr-line); margin-bottom: 6px; padding: 0 4px 16px; }
  .side-head .label { font-family: var(--yr-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--yr-ink-mute); }
  .side-active-name { font-weight: 700; font-size: 15px; color: var(--yr-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .side-active-meta { font-size: 12px; color: var(--yr-ink-mute); margin-top: 2px; }
  .side .snav { display: flex; flex-direction: column; gap: 2px; }
  .side .snav a { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; color: var(--yr-ink-soft); text-decoration: none; font-size: 14px; }
  .side .snav a .ic { width: 18px; height: 18px; flex: none; display: inline-flex; }
  .side .snav a:hover { background: var(--yr-panel-2); color: var(--yr-ink); }
  .side .snav a.active { background: var(--yr-panel-2); color: var(--yr-ink); box-shadow: inset 3px 0 0 var(--yr-accent); }
  .side .sfoot { margin-top: auto; padding-top: 12px; }
  .side .sfoot button { width: 100%; }

  @media (max-width: 860px) {
    .shell { display: block; padding: 16px 16px 60px; }
    .side { position: fixed; left: 0; top: 0; height: 100vh; max-height: 100vh; z-index: 60; border-radius: 0; border: 0; border-right: 1px solid var(--yr-line); transform: translateX(-100%); transition: transform .2s; box-shadow: 2px 0 18px rgba(0,0,0,.5); }
    .side.open { transform: none; }
    .main { padding-left: 0; }
    /* Comfortable touch targets on a phone. */
    button, .side .snav a, .qa a { min-height: 44px; }
    button { padding: 11px 16px; }
    .bot-card .actions button, .list-pagination button { min-height: 40px; }
  }

  .badge { border: 1px solid var(--yr-line-2); color: var(--yr-ink-soft); }
  .badge.on { color: var(--yr-green); border-color: rgba(30,142,62,.4); }
  .badge.off { color: var(--yr-red); border-color: rgba(217,48,37,.4); }
  .muted { color: var(--yr-ink-soft); }
  .ok { color: var(--yr-green); }
  .off { color: var(--yr-red); }
  .field-err { color: var(--yr-red); font-size: 13px; margin-top: 4px; display: block; }
  input.input-err, textarea.input-err, select.input-err { border-color: var(--yr-red); }
  .form-status { margin-top: 10px; font-size: 14px; }
  .form-status.error { color: var(--yr-red); }
  .form-status.ok { color: var(--yr-green); }
  .glossary { margin-top: 16px; border: 1px solid var(--yr-line); border-radius: var(--yr-radius-sm); background: var(--yr-panel); padding: 14px; font-size: 13px; }
  .glossary summary { cursor: pointer; font-weight: 600; color: var(--yr-ink); }
  .glossary dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px 18px; margin: 12px 0 0; }
  .glossary div { display: flex; gap: 6px; }
  .glossary dt { font-weight: 600; color: var(--yr-ink); white-space: nowrap; }
  .glossary dd { margin: 0; color: var(--yr-ink-soft); }

  .list-controls { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
  .list-controls-row { display:flex; gap:10px; flex:1; min-width:220px; }
  .list-search { flex:1; min-width:160px; padding:8px 10px; border:1px solid var(--yr-line-2); border-radius:10px; background:var(--yr-panel); font:inherit; }
  .list-sort { padding:8px 10px; border:1px solid var(--yr-line-2); border-radius:10px; background:var(--yr-panel); font:inherit; min-width:130px; }
  .list-pagination { display:flex; gap:8px; align-items:center; margin-left:auto; }
  .list-page-info { font-size:12px; color:var(--yr-ink-soft); min-width:110px; text-align:center; }
  @media(max-width:640px) { .list-controls { flex-direction:column; align-items:stretch; } .list-controls-row { flex-direction:column; min-width:auto; } .list-pagination { margin-left:0; justify-content:space-between; } }
`;


export interface BotPageOpts {
  user: ShellUser;
  page: string;
  nonce?: string;
  nav?: string;
  content: string;
}

/** Full HTML document for the bot dashboard. `nav` is rendered before `<main>`. */
export function botPageHtml(opts: BotPageOpts): string {
  const nonceAttr = opts.nonce ? ` nonce="${esc(opts.nonce)}"` : "";
  const nav = opts.nav || "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard</title>${GOOGLE_FONTS}<style${nonceAttr}>${BOT_STYLE_ATTR_CSS}${BOT_BASE_CSS}${BOT_DASH_V2_CSS}</style>${nav ? '<link rel="stylesheet" href="/assets/shell-nav.css">' : ""}</head><body data-page="${esc(opts.page)}">
<a href="#main-content" class="skip-link">Skip to main content</a>
${nav}
${opts.content}
${nav ? '<script src="/assets/shell-nav.js" defer></script>' : ""}
</body></html>`;
}
