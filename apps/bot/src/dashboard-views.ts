// Views module for the bot dashboard.
// Extracted from dashboard.ts to separate HTML templates from routing logic.

import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";

const BASE_CSS = `
  :root { --bg:#0d1117; --panel:#161b22; --border:#30363d; --fg:#e6edf3; --dim:#8b949e;
          --accent:#f0b429; --green:#3fb950; --red:#f85149; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 -apple-system,'Segoe UI',Roboto,sans-serif; }
  .wrap { max-width:1040px; margin:0 auto; padding:24px 16px; }
  .panel { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:20px; margin-bottom:20px; }
  h1 { font-size:20px; } h2 { font-size:16px; margin-bottom:12px; color:var(--accent); }
  input, textarea, select { width:100%; background:var(--bg); color:var(--fg); border:1px solid var(--border);
          border-radius:6px; padding:8px 10px; margin-bottom:10px; font:inherit; }
  select { cursor:pointer; }
  button { background:var(--accent); color:#000; border:0; border-radius:6px; padding:8px 16px;
           font:600 14px/1 inherit; cursor:pointer; }
  button.ghost { background:transparent; color:var(--dim); border:1px solid var(--border); }
  button.danger { background:transparent; color:var(--red); border:1px solid var(--red); }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); }
  th { color:var(--dim); font-weight:500; }
  .muted { color:var(--dim); } .ok { color:var(--green); } .off { color:var(--red); }
  .row { display:flex; gap:16px; flex-wrap:wrap; } .row > * { flex:1; min-width:220px; }
  .stat { font-size:28px; font-weight:700; } .copy { cursor:pointer; text-decoration:underline dotted; }
  #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--accent);
           color:#000; padding:10px 18px; border-radius:8px; font-weight:600; display:none; }
  button:disabled, .copy:disabled { opacity:0.6; cursor:not-allowed; }
  .subnav { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px; }
  .subnav a { color:var(--dim); text-decoration:none; padding:6px 10px; border-radius:6px; font-size:13px; }
  .subnav a:hover { color:var(--fg); }
  .subnav a.active { background:var(--panel); color:var(--accent); border:1px solid var(--border); }
  .bot-card { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; margin-bottom:12px;
              padding:12px; border:1px solid var(--border); border-radius:8px; }
  .bot-card .meta { flex:1; min-width:180px; }
  .bot-card .actions { display:flex; gap:8px; flex-wrap:wrap; }
  .bot-card button { padding:6px 12px; font-size:13px; }
  .code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; background:var(--bg); padding:2px 6px; border-radius:4px; }
`;

function escHtml(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[ch]);
}

export function loginHtml(botUsername: string, devLogin: boolean, nonce?: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>YourRank Bot — Login</title>
  <style>
  :root { --bg:#0d1117; --panel:#161b22; --border:#30363d; --fg:#e6edf3; --dim:#8b949e;
          --accent:#f0b429; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 -apple-system,'Segoe UI',Roboto,sans-serif; }
  .panel { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:20px; margin-bottom:20px; }
  .muted { color:var(--dim); }
  input { width:100%; background:var(--bg); color:var(--fg); border:1px solid var(--border);
          border-radius:6px; padding:8px 10px; margin-bottom:10px; font:inherit; }
  button { background:var(--accent); color:#000; border:0; border-radius:6px; padding:8px 16px;
           font:600 14px/1 inherit; cursor:pointer; }
  .center { min-height:90vh; display:flex; align-items:center; justify-content:center; }
  .card { text-align:center; max-width:380px; }
  .sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0); }
  </style></head><body>
<div class="center"><div class="panel card" id="main-content">
  <h1 style="margin-bottom:8px">🎰 Streamer Dashboard</h1>
  <p class="muted" style="margin-bottom:20px">Manage your bot, offers and click stats.</p>
  ${botUsername
    ? `<script${nonce ? ` nonce="${nonce}"` : ""} async src="https://telegram.org/js/telegram-widget.js?22"
         data-telegram-login="${escHtml(botUsername)}" data-size="large"
         data-onauth="onTgAuth" data-request-access="write"></script>`
    : `<p class="muted">Telegram login isn't configured yet (set LOGIN_BOT_TOKEN + LOGIN_BOT_USERNAME).</p>`}
  ${devLogin ? `
  <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:16px">
    <p class="muted" style="margin-bottom:8px">Dev login</p>
    <label for="devid" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Telegram User ID</label>
    <input id="devid" type="number" placeholder="Telegram user id">
    <button data-action="devLogin" type="button">Enter</button>
  </div>` : ""}
</div></div>
<script${nonce ? ` nonce="${nonce}"` : ""}>
async function onTgAuth(user) {
  const r = await fetch('/bot/auth/telegram', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(user)});
  if (r.ok) location.reload(); else alert('Login failed: ' + (await r.json()).error);
}
window.onTgAuth = onTgAuth;
async function devLogin(btn) {
  const id = Number(document.getElementById('devid').value);
  if (!id) return;
  if (btn) { btn.disabled = true; btn.textContent = 'Entering…'; }
  const r = await fetch('/bot/auth/dev', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({telegram_user_id:id})});
  if (r.ok) location.reload(); else alert('Failed');
}
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'devLogin') { e.preventDefault(); devLogin(target); }
});
</script></body></html>`;
}

const pageLinks = [
  { key: "overview", label: "Overview", href: "/bot/dashboard" },
  { key: "bots", label: "Bots", href: "/bot/bots" },
  { key: "offers", label: "Offers", href: "/bot/offers" },
  { key: "commands", label: "Commands", href: "/bot/commands" },
  { key: "broadcasts", label: "Broadcasts", href: "/bot/broadcasts" },
  { key: "settings", label: "Settings", href: "/bot/settings" },
];

function subNav(active: string): string {
  return `<nav class="subnav" aria-label="Bot dashboard navigation">` +
    pageLinks.map(p =>
      `<a href="${escHtml(p.href)}" class="${p.key === active ? 'active' : ''}">${escHtml(p.label)}</a>`
    ).join("") +
    `</nav>`;
}

export function appHtml(
  user: { display_name: string; email: string; plan: string },
  publicBaseUrl: string,
  nonce?: string,
  page = "overview"
): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard</title><style>${SHELL_NAV_CSS}${BASE_CSS}</style></head><body data-page="${page}">
${shellNavHtml({ activePath: "/bot" + (page === "overview" ? "/dashboard" : "/" + page), user, logoutAction: "/bot/auth/logout" })}
<div class="wrap" id="main-content">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <h1>🎰 Bot Dashboard</h1>
    <div><span id="whoami" class="muted"></span>
    <button class="ghost" data-action="logout" type="button" style="margin-left:10px">Log out</button></div>
  </div>

  ${subNav(page)}

  <!-- Overview stats -->
  <div class="row" data-page="overview">
    <div class="panel"><h2>Clicks (14d)</h2><div class="stat" id="totClicks">–</div></div>
    <div class="panel"><h2>Unique (14d)</h2><div class="stat" id="totUnique">–</div></div>
    <div class="panel"><h2>Active offers</h2><div class="stat" id="totOffers">–</div></div>
    <div class="panel"><h2>Subscribers</h2><div class="stat" id="totSubs">–</div><div class="muted" id="subsNew" style="font-size:12px"></div></div>
  </div>

  <div class="panel" data-page="overview"><h2>Daily clicks</h2><svg id="chart" role="img" aria-label="Daily clicks chart" width="100%" height="120" preserveAspectRatio="none"></svg>
    <div id="chartLabels" class="muted" style="display:flex;justify-content:space-between;font-size:11px"></div></div>

  <!-- Subscriber attribution (overview) -->
  <div class="panel" data-page="overview"><h2>Where subscribers came from</h2>
    <p class="muted" style="font-size:13px;margin-bottom:10px">Share a deep link like <code id="deepLinkExample">t.me/&lt;yourbot&gt;?start=twitch</code> in your bio, stream, or posts — anyone who taps it and starts your bot is tagged with that source, so you can see which channel drives subscribers. <b>direct</b> = started the bot without a link.</p>
    <table><thead><tr><th>Source</th><th style="text-align:right">Subscribers</th></tr></thead>
    <tbody id="subSources"><tr><td colspan="2" class="muted">Loading…</td></tr></tbody></table>
  </div>

  <!-- Bot list + connect (overview, bots) -->
  <div class="panel" data-page="overview bots"><h2>Your bots</h2>
    <div id="botList" class="muted">Loading…</div>
    <div id="connectForm" style="margin-top:12px">
      <label for="botToken" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Bot Token</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input id="botToken" type="password" autocomplete="off" placeholder="Paste bot token from @BotFather (123456:ABC-...)" style="flex:1">
        <button class="ghost" data-action="toggleToken" type="button" aria-label="Show token">Show</button>
      </div>
      <label for="botWelcome" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Welcome Message</label>
      <input id="botWelcome" placeholder="Welcome message (optional)">
      <button data-action="connectBot" type="button">Connect bot</button>
    </div>
  </div>

  <!-- Test message (bots) -->
  <div class="panel" data-page="bots" id="testMsgPanel" style="display:none">
    <h2>Send a test message</h2>
    <p class="muted" style="margin-bottom:12px;font-size:13px">Send a one-off message from <b id="tmBotName">your bot</b> to confirm it works. Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>.</p>
    <div class="row">
      <label for="tmChatId" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Chat ID</label>
      <input id="tmChatId" inputmode="numeric" placeholder="Your Telegram chat ID (e.g. 123456789)">
      <label for="tmText" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Message</label>
      <input id="tmText" placeholder="Message to send">
    </div>
    <button data-action="sendTestMessage" type="button">Send test message</button>
    <button class="ghost" data-action="cancelTestMessage" type="button">Cancel</button>
  </div>

  <!-- Customization (overview, bots, commands) -->
  <div class="panel" data-page="overview bots commands" id="customizePanel">
    <h2>Customize <select id="botSelect" style="width:auto;min-width:160px;display:inline-block;margin-left:8px"><option>Loading…</option></select></h2>
    <div id="custDisabledNote" class="muted" style="display:none;margin-bottom:12px;color:var(--accent)">This bot is disconnected — reconnect it to customize.</div>
    <p class="muted" style="margin-bottom:12px">Personalize what the selected bot says to viewers. Changes apply instantly — no redeploy needed.</p>

    <label for="welcomeMsg" style="display:block;margin-bottom:4px;font-size:13px" class="muted">Welcome message — the reply to <code>/start</code></label>
    <textarea id="welcomeMsg" rows="2" placeholder="Leave blank to use the default greeting"></textarea>
    <button data-action="saveWelcome" type="button">Save welcome message</button>

    <h3 style="margin:20px 0 6px;font-size:14px">Custom commands</h3>
    <p class="muted" style="margin-bottom:10px;font-size:13px">Add slash-commands your viewers can send (e.g. <code>/vip</code>) and the reply they'll get. Built-ins like <code>/start</code>, <code>/code</code>, <code>/subscribe</code> are reserved.</p>
    <div class="row">
      <label for="cmdName" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Command</label>
      <input id="cmdName" placeholder="Command (e.g. vip)">
      <label for="cmdResp" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Reply</label>
      <input id="cmdResp" placeholder="Reply text viewers receive">
    </div>
    <button data-action="addCommand" type="button">Add command</button>
    <table style="margin-top:14px"><thead><tr><th>Command</th><th>Reply</th><th>Status</th><th></th></tr></thead>
    <tbody id="cmdList"><tr><td colspan="4" class="muted">Loading…</td></tr></tbody></table>
  </div>

  <!-- Offers (overview, offers) -->
  <div class="panel" data-page="overview offers"><h2>New offer</h2>
    <div class="row">
      <label for="oCasino" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Casino</label>
      <input id="oCasino" placeholder="Casino (e.g. Stake)">
      <label for="oLabel" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Label</label>
      <input id="oLabel" placeholder="Label (e.g. 200% deposit bonus)">
    </div>
    <label for="oUrl" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Affiliate URL</label>
    <input id="oUrl" type="url" inputmode="url" placeholder="Your affiliate URL (https://...)">
    <div class="row">
      <label for="oCode" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Promo Code</label>
      <input id="oCode" placeholder="Promo code (optional)">
      <label for="oBonus" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Bonus Text</label>
      <input id="oBonus" placeholder="Bonus text shown in bot (optional)">
    </div>
    <button data-action="createOffer" type="button">Create offer</button>
  </div>

  <div class="panel" data-page="overview offers"><h2>Offers</h2>
    <table><thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>Unique</th><th>Status</th><th></th></tr></thead>
    <tbody id="offers"><tr><td colspan="6" class="muted">Loading…</td></tr></tbody></table>
  </div>

  <!-- Broadcasts (overview, broadcasts) -->
  <div class="panel" data-page="overview broadcasts"><h2>Broadcast to subscribers</h2>
    <div id="bcGate" class="muted" style="margin-bottom:10px"></div>
    <label for="bcBotSelect" style="display:block;font-size:13px" class="muted">From bot</label>
    <select id="bcBotSelect" style="max-width:300px"><option value="">Loading bots…</option></select>
    <label for="bcBody" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Message</label>
    <textarea id="bcBody" rows="3" placeholder="Message to all your bot's subscribers (Markdown supported)"></textarea>
    <div id="bcAudience" class="muted" style="font-size:13px;margin:2px 0 10px" aria-live="polite">This will send to <b>–</b> subscribers.</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button data-action="sendBroadcast" type="button">Send broadcast</button>
      <span class="muted" style="font-size:13px">or send a test copy to</span>
      <input id="bcTestChat" inputmode="numeric" placeholder="your chat ID" style="max-width:150px">
      <button class="ghost" data-action="testBroadcast" type="button">Send test</button>
    </div>
    <p class="muted" style="font-size:12px;margin-top:6px">Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>. A broadcast can't be undone once it sends.</p>
    <table style="margin-top:14px"><thead><tr><th>Message</th><th>Bot</th><th>Status</th><th>Sent</th><th>Failed</th><th></th></tr></thead>
    <tbody id="bcList"></tbody></table>
  </div>

  <!-- Settings (overview, settings) -->
  <div class="panel" data-page="overview settings"><h2>Conversions (postbacks)</h2>
    <p class="muted" style="margin-bottom:10px">Give your affiliate manager this postback URL and add
      <code>{click_ref}</code> anywhere in your affiliate URL to attribute deposits to clicks.</p>
    <p class="muted" style="margin-bottom:10px;font-size:12px">Your network supports request signing? Use <code>POST ${publicBaseUrl}/pb</code> with headers
      <code>X-Postback-Key</code> (your key, below) + <code>X-Postback-Signature</code> (hex HMAC-SHA256 of the query string, keyed by that same key). It's the secure option — the key never rides the URL and the signature blocks tampering.</p>
    <div style="margin-bottom:10px"><button class="ghost" data-action="revealPostback" type="button">Show my postback URL</button>
      <span id="pbUrl" class="copy" style="margin-left:8px" data-action="copyPostback" data-url=""></span></div>
    <table><thead><tr><th>When</th><th>Event</th><th>Amount</th><th>Offer</th></tr></thead>
    <tbody id="convList"></tbody></table>
  </div>

  <div class="panel" data-page="overview settings"><h2>Plan</h2>
    <div id="planInfo" class="muted">Loading…</div>
    <div id="planButtons" style="margin-top:12px"></div>
  </div>
</div>
<div id="toast" role="status" aria-live="polite"></div>
<script${nonce ? ` nonce="${nonce}"` : ""}>
const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const setHtml = (id, v) => { const el = $(id); if (el) el.innerHTML = v; };
function toast(msg) { const t=$('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }
async function api(path, opts) {
  const r = await fetch('/bot/dash/api'+path, opts);
  if (r.status === 401) { location.reload(); throw new Error('session expired'); }
  if (!r.ok) {
    try { const data = await r.json(); if (data && data.error) return data; } catch {}
    return { error: 'Server error (' + r.status + ') — try again or contact support' };
  }
  try { return await r.json(); }
  catch { return { error: 'Server error (' + r.status + ') — try again or contact support' }; }
}
async function logout(btn) {
  if (btn) { btn.disabled = true; if (btn.textContent) btn.textContent = 'Logging out…'; }
  await fetch('/bot/auth/logout',{method:'POST',headers:{'Accept':'application/json'}});
  location.reload();
}

let submitting = false;
const page = document.body.dataset.page || 'overview';
let __lastBots = [];
let __offers = [];
let __maxBots = Infinity;
let __testBotId = null;

function showPage(p) {
  document.querySelectorAll('[data-page]').forEach(el => {
    const pages = (el.dataset.page || '').split(' ').filter(Boolean);
    el.style.display = pages.includes(p) ? '' : 'none';
  });
}
showPage(page);

function esc(s){ return (s??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

let firstBotId = null;
let custBotId = null;

async function load() {
  const me = await api('/me');
  if (me.error) { toast(me.error); return; }
  setText('whoami', (me.display_name||'') + ' · ' + (me.plan || 'free'));

  const [offers, daily, bots] = await Promise.all([api('/offers'), api('/stats/daily'), api('/bots')]);
  if (daily.error || offers.error || bots.error) { toast(daily.error || offers.error || bots.error); return; }

  showPage(page);

  // overview stats
  if (page === 'overview') {
    setText('totClicks', (daily||[]).reduce((s,d)=>s+d.clicks,0));
    setText('totUnique', (daily||[]).reduce((s,d)=>s+d.unique_clicks,0));
    setText('totOffers', (offers||[]).filter(o=>o.is_active).length);

    const max = Math.max(1, ...(daily||[]).map(d=>d.clicks));
    const w = daily.length ? 100/daily.length : 10;
    const chart = $('chart');
    if (chart) {
      chart.setAttribute('viewBox','0 0 100 40');
      chart.innerHTML = (daily||[]).map((d,i)=>{
        const h = d.clicks/max*36;
        return '<rect x="'+(i*w+0.5)+'" y="'+(40-h)+'" width="'+(w-1)+'" height="'+h+'" rx="0.6" fill="#f0b429"><title>'+esc(d.day)+': '+esc(String(d.clicks))+'</title></rect>';
      }).join('');
    }
    setHtml('chartLabels', daily.length > 0
      ? '<span>'+esc(daily[0].day.slice(5))+'</span><span>'+esc(daily[daily.length-1].day.slice(5))+'</span>'
      : '');
  }

  renderBots(bots);

  if (page === 'overview') loadSubscribers(bots);

  __offers = offers || [];
  renderOffers();
}

// Subscriber totals + deep-link attribution (overview only).
async function loadSubscribers(bots){
  const s = await api('/stats/subscribers');
  if (!s || s.error) return;
  const t = s.totals || {};
  setText('totSubs', t.active ?? 0);
  setText('subsNew', (t.new_7d ?? 0) + ' new in 7d');
  const rows = (s.sources || []);
  setHtml('subSources', rows.length
    ? rows.map(r=>'<tr><td>'+esc(r.source)+'</td><td style="text-align:right">'+esc(String(r.count))+'</td></tr>').join('')
    : '<tr><td colspan="2" class="muted">No subscribers yet.</td></tr>');
  const active = (bots || []).find(b=>b.status==='active' && b.username);
  if (active) setText('deepLinkExample', 't.me/'+active.username+'?start=twitch');
}

// Render the offers table from client state. Mutation handlers update __offers
// from their authoritative result and re-render, so the table reflects changes
// immediately without a re-fetch (which can read stale data after a write).
function renderOffers(){
  const offersEl = $('offers');
  if (!offersEl) return;
  offersEl.innerHTML = (__offers||[]).map(o=>'<tr>'+
    '<td><b>'+esc(o.casino)+'</b><br><span class="muted">'+esc(o.label)+'</span></td>'+
    '<td>'+(o.slug?'<span class="copy" data-action="copyLink" data-slug="'+esc(o.slug)+'" title="Copy tracked link">'+esc('/r/'+o.slug)+'</span> <button class="ghost" data-action="copyLink" data-slug="'+esc(o.slug)+'" type="button" aria-label="Copy link" style="padding:2px 8px;font-size:12px">Copy</button>':'–')+'</td>'+
    '<td>'+esc(String(o.clicks))+'</td><td>'+esc(String(o.unique_clicks))+'</td>'+
    '<td class="'+(o.is_active?'ok':'off')+'">'+(o.is_active?'active':'off')+'</td>'+
    '<td><button class="ghost" data-action="toggleOffer" data-id="'+esc(o.id)+'" data-active="'+(!o.is_active)+'">'+(o.is_active?'Disable':'Enable')+'</button></td>'+
  '</tr>').join('') || '<tr><td colspan="6" class="muted">No offers yet.</td></tr>';
}

async function loadExtras(){
  const [plan, bcs, convs] = await Promise.all([api('/plan'), api('/broadcasts'), api('/conversions')]);
  if (plan.error || bcs.error || convs.error) {
    toast(plan.error || bcs.error || convs.error);
    return;
  }

  const cur = plan?.current;
  if (cur) {
    const plur = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
    const planInfo = $('planInfo');
    if (planInfo) planInfo.innerHTML = '<b style="color:var(--accent)">'+esc(cur.label)+'</b> — up to '+plur(cur.maxBots, 'bot')+', '
      +plur(cur.maxOffers, 'offer')+(cur.broadcasts?', broadcasts':'')+(cur.postbacks?', postbacks':'');
    if (typeof cur.maxBots === 'number') {
      __maxBots = cur.maxBots;
      const cf = $('connectForm');
      if (cf) cf.style.display = (__lastBots.filter(b => b.status === 'active').length >= __maxBots) ? 'none' : '';
    }
    const planButtons = $('planButtons');
    if (planButtons) planButtons.innerHTML = (plan.plans||[]).filter(p=>p.starsPrice>0 && p.tier!==cur.tier).map(p=>
      '<button data-action="upgrade" data-tier="'+esc(p.tier)+'" style="margin-right:8px" type="button">'
      +(plan.billing_enabled?'Upgrade to '+esc(p.label)+' — ⭐'+esc(String(p.starsPrice))+'/30d':esc(p.label)+' (billing not enabled)')+'</button>'
    ).join('');
  }

  const bcList = $('bcList');
  if (bcList) {
    bcList.innerHTML = (bcs||[]).map(b=>'<tr><td>'+esc(b.body.slice(0,60))+'</td><td>'+esc(b.bot_username||'–')+'</td><td>'+esc(b.status)+'</td>'+
      '<td>'+esc(b.sent_count)+'/'+(b.total_count?esc(b.total_count):'?')+'</td><td>'+esc(b.fail_count)+'</td>'+
      '<td>'+(b.status==='scheduled'?'<button class="ghost" data-action="cancelBroadcast" data-id="'+esc(b.id)+'" type="button">Cancel</button>':'')+'</td></tr>').join('')
      || '<tr><td colspan="6" class="muted">No broadcasts yet.</td></tr>';
  }

  const convList = $('convList');
  if (convList) {
    convList.innerHTML = (convs||[]).map(v=>'<tr><td>'+esc(v.at)+'</td><td>'+esc(v.event)+'</td>'+
      '<td>'+(v.amount?esc(v.amount)+' '+esc(v.currency):'–')+'</td><td>'+esc(v.offer||'–')+'</td></tr>').join('')
      || '<tr><td colspan="4" class="muted">No conversions reported yet.</td></tr>';
  }
}

async function copyLink(target){ navigator.clipboard.writeText(location.origin+'/r/'+target.dataset.slug); toast('Link copied'); }
async function toggleOffer(target){
  const on = target.dataset.active === 'true';
  setLoading(target);
  const r = await api('/offers/'+target.dataset.id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({is_active:on})});
  if (r.error) { restoreBtn(target); return toast(r.error); }
  const o = __offers.find(x => x.id === target.dataset.id);
  if (o) o.is_active = (r.is_active !== undefined ? r.is_active : on);
  renderOffers();
  restoreBtn(target);
}
async function createOffer(btn){
  const body = { casino:$('oCasino').value.trim(), label:$('oLabel').value.trim(), referral_url:$('oUrl').value.trim(),
                 promo_code:$('oCode').value.trim()||undefined, bonus_text:$('oBonus').value.trim()||undefined };
  const r = await api('/offers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  ['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id=>$(id).value='');
  toast('Offer created'); restoreBtn(btn); load();
}
async function connectBot(btn){
  const token = $('botToken').value.trim();
  if (!token) return toast('Paste a bot token first');
  setLoading(btn, 'Connecting…');
  const r = await api('/bots',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token, welcome_message:$('botWelcome').value.trim()||undefined})});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  $('botToken').value='';
  if (r.warning) { toast(r.warning); } else { toast('Bot @'+r.username+' connected'); }
  restoreBtn(btn); load();
}
async function checkHealth(target){
  setLoading(target, 'Checking…');
  const r = await api('/bots/'+target.dataset.id+'/health');
  if (r.error) { restoreBtn(target); return toast(r.error); }
  const msg = r.configured
    ? 'Webhook configured: ' + r.url + ' ('+r.pending_updates+' pending)'
    : 'Webhook not set: ' + (r.url || 'none') + ' ('+r.pending_updates+' pending)';
  toast(msg + (r.last_error ? ' | Error: ' + r.last_error : ''));
  restoreBtn(target);
}
async function disconnectBot(btn){
  if (!confirm('Disconnect this bot? It will stop responding and free your plan slot.')) return;
  setLoading(btn, 'Disconnecting…');
  const r = await api('/bots/'+btn.dataset.id+'/disconnect',{method:'POST'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast(r.webhook_removed ? 'Bot disconnected' : 'Bot disconnected, but the Telegram webhook could not be removed. Delete it manually in @BotFather if needed.');
  const bot = __lastBots.find(b => b.id === btn.dataset.id); if (bot) bot.status = 'revoked';
  restoreBtn(btn); renderBots(__lastBots, false);
}
async function reconnectBot(btn){
  setLoading(btn, 'Reconnecting…');
  const r = await api('/bots/'+btn.dataset.id+'/reconnect',{method:'POST'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Bot @'+r.username+' reconnected');
  const bot = __lastBots.find(b => b.id === btn.dataset.id); if (bot) bot.status = 'active';
  restoreBtn(btn); renderBots(__lastBots, false);
}
async function deleteBot(btn){
  if (!confirm('Permanently delete this bot? This cannot be undone.')) return;
  setLoading(btn, 'Deleting…');
  const r = await api('/bots/'+btn.dataset.id,{method:'DELETE'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Bot deleted');
  restoreBtn(btn); renderBots(__lastBots.filter(b => b.id !== btn.dataset.id), false);
}
function testMessage(target){
  __testBotId = target.dataset.id;
  const bot = __lastBots.find(b => b.id === __testBotId);
  const name = $('tmBotName'); if (name) name.textContent = bot ? '@'+bot.username : 'your bot';
  const panel = $('testMsgPanel'); if (panel) panel.style.display = '';
  const ci = $('tmChatId'); if (ci) ci.focus();
}
function cancelTestMessage(){
  const panel = $('testMsgPanel'); if (panel) panel.style.display = 'none';
  const ci = $('tmChatId'); if (ci) ci.value = '';
  const tx = $('tmText'); if (tx) tx.value = '';
  __testBotId = null;
}
async function sendTestMessage(btn){
  const chatId = Number(($('tmChatId').value || '').trim());
  if (!chatId || isNaN(chatId)) return toast('Enter a valid numeric chat ID');
  const text = ($('tmText').value || '').trim();
  if (!text) return toast('Enter a message');
  setLoading(btn, 'Sending…');
  const r = await api('/bots/'+__testBotId+'/test-message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Test message sent');
  restoreBtn(btn); cancelTestMessage();
}

// Render the bot list + select dropdowns from the given bots array. Kept
// separate from load() so mutation handlers can re-render immediately from the
// authoritative mutation response instead of an immediate (stale) re-read.
function renderBots(bots, loadCmds = true){
  bots = bots || [];
  __lastBots = bots;
  const botList = $('botList');
  if (botList) {
    botList.innerHTML = bots.length
      ? bots.map(b => {
          const statusClass = b.status === 'active' ? 'ok' : 'off';
          const statusText = b.status === 'active' ? 'active' : (b.status === 'revoked' ? 'disconnected' : b.status);
          const isActive = b.status === 'active';
          return '<div class="bot-card">'+
            '<div class="meta"><a href="https://t.me/'+esc(b.username)+'" target="_blank" rel="noopener">@'+esc(b.username)+'</a> '+
            '<span class="muted">(…'+esc(b.token_hint)+')</span> <span class="'+statusClass+'">'+esc(statusText)+'</span></div>'+
            '<div class="actions">'+
              (isActive ? '<button class="ghost" data-action="checkHealth" data-id="'+esc(b.id)+'" type="button">Check health</button>' : '')+
              (isActive ? '<button class="ghost" data-action="disconnectBot" data-id="'+esc(b.id)+'" type="button">Disconnect</button>'
                        : '<button class="ghost" data-action="reconnectBot" data-id="'+esc(b.id)+'" type="button">Reconnect</button>')+
              (isActive ? '<button class="ghost" data-action="selectBot" data-id="'+esc(b.id)+'" type="button">Select</button>' : '')+
              (isActive && page === 'bots' ? '<button class="ghost" data-action="testMessage" data-id="'+esc(b.id)+'" type="button">Test message</button>' : '')+
              (page === 'bots' ? '<button class="danger" data-action="deleteBot" data-id="'+esc(b.id)+'" type="button">Delete</button>' : '')+
            '</div>'+
          '</div>';
        }).join('')
      : 'No bot connected yet — paste your token below.';
  }

  const botSelect = $('botSelect');
  const bcBotSelect = $('bcBotSelect');
  const botOptions = bots.map(b => '<option value="'+esc(b.id)+'">@'+esc(b.username)+' ('+esc(b.status)+')</option>').join('');
  if (botSelect) { botSelect.innerHTML = botOptions || '<option value="">No bots</option>'; }
  if (bcBotSelect) { bcBotSelect.innerHTML = botOptions || '<option value="">No bots</option>'; }

  firstBotId = bots[0]?.id ?? null;
  if ((!custBotId || !bots.some(b => b.id === custBotId)) && firstBotId) custBotId = firstBotId;
  if (!bots.length) custBotId = null;
  if (botSelect && custBotId) botSelect.value = custBotId;
  if (bcBotSelect && firstBotId) bcBotSelect.value = firstBotId;
  if (bcBotSelect) updateAudience();

  // Hide the connect form once the plan's active-bot slots are full.
  const cf = $('connectForm');
  if (cf) cf.style.display = (bots.filter(b => b.status === 'active').length >= __maxBots) ? 'none' : '';

  // customize panel (only on pages that show it)
  if ($('customizePanel') && (page === 'overview' || page === 'bots' || page === 'commands')) {
    const bot = custBotId ? (bots.find(b => b.id === custBotId) || bots[0]) : null;
    if (bot) {
      $('customizePanel').style.display='';
      applyCustomizeState(bot);
      if (loadCmds) loadCommands();
    } else {
      $('customizePanel').style.display='none';
    }
  }
}

// A disconnected bot can't be customized — reflect that by disabling the
// welcome/command inputs and showing a hint, instead of silently accepting
// edits that won't apply until the bot is reconnected.
function applyCustomizeState(bot){
  const active = bot.status === 'active';
  const note = $('custDisabledNote'); if (note) note.style.display = active ? 'none' : '';
  const welcome = $('welcomeMsg'); if (welcome) welcome.value = bot.welcome_message || '';
  ['welcomeMsg','cmdName','cmdResp'].forEach(id => { const el = $(id); if (el) el.disabled = !active; });
  const panel = $('customizePanel');
  if (panel) panel.querySelectorAll('[data-action="saveWelcome"],[data-action="addCommand"]').forEach(b => { b.disabled = !active; });
}

function selectBotById(id){
  const bot = __lastBots.find(b => b.id === id);
  if (bot) { custBotId = id; }
  const botSelect = $('botSelect');
  if (botSelect && id) botSelect.value = id;
  if ($('customizePanel')) {
    $('customizePanel').style.display = id ? '' : 'none';
    if (bot) applyCustomizeState(bot);
    loadCommands();
  }
}

// ---- bot customization: welcome message + custom slash-commands ----
async function saveWelcome(btn){
  if (!custBotId) return toast('Select a bot first');
  setLoading(btn, 'Saving…');
  const r = await api('/bots/'+custBotId,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({welcome_message:$('welcomeMsg').value.trim()||null})});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Welcome message saved'); restoreBtn(btn);
}
let __commands = [];
// Render the custom-commands table from client state. Mutation handlers update
// __commands from their authoritative response and re-render, so the table is
// correct immediately (an immediate re-read can lag behind the write).
function renderCommands(){
  const cmdList = $('cmdList');
  if (!cmdList) return;
  cmdList.innerHTML = (__commands||[]).map(c=>'<tr>'+
    '<td>/'+esc(c.command)+'</td>'+
    '<td class="muted">'+esc((c.response||'').slice(0,60))+'</td>'+
    '<td class="'+(c.is_enabled?'ok':'off')+'">'+(c.is_enabled?'on':'off')+'</td>'+
    '<td><button class="ghost" data-action="toggleCommand" data-id="'+esc(c.id)+'" data-active="'+(!c.is_enabled)+'">'+(c.is_enabled?'Disable':'Enable')+'</button> '
        +'<button class="ghost" data-action="deleteCommand" data-id="'+esc(c.id)+'">Delete</button></td>'+
  '</tr>').join('') || '<tr><td colspan="4" class="muted">No custom commands yet.</td></tr>';
}
async function loadCommands(){
  if (!custBotId) return;
  const cmds = await api('/bots/'+custBotId+'/commands');
  if (cmds.error) return toast(cmds.error);
  __commands = cmds || [];
  renderCommands();
}
async function addCommand(btn){
  if (!custBotId) return toast('Select a bot first');
  const command = $('cmdName').value.trim(), response = $('cmdResp').value.trim();
  if (!command || !response) return toast('Enter a command and a reply');
  setLoading(btn, 'Adding…');
  const r = await api('/bots/'+custBotId+'/commands',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command, response})});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  const i = __commands.findIndex(c => c.id === r.id || c.command === r.command);
  if (i >= 0) __commands[i] = r; else __commands.push(r);
  __commands.sort((a,b)=>a.command.localeCompare(b.command));
  renderCommands();
  $('cmdName').value=''; $('cmdResp').value=''; toast('Command saved'); restoreBtn(btn);
}
async function toggleCommand(target){
  const on = target.dataset.active === 'true';
  setLoading(target);
  const r = await api('/commands/'+target.dataset.id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({is_enabled:on})});
  if (r.error) { restoreBtn(target); return toast(r.error); }
  const i = __commands.findIndex(c => c.id === target.dataset.id);
  if (i >= 0) __commands[i] = r;
  renderCommands();
  restoreBtn(target);
}
async function deleteCommand(target){
  setLoading(target, 'Deleting…');
  const r = await api('/commands/'+target.dataset.id,{method:'DELETE'});
  if (r.error) { restoreBtn(target); return toast(r.error); }
  __commands = __commands.filter(c => c.id !== target.dataset.id);
  renderCommands();
  toast('Command deleted'); restoreBtn(target);
}

let __bcAudience = null;
// Show how many subscribers the selected bot would reach, so the streamer
// knows the blast size before committing.
async function updateAudience(){
  const el = $('bcAudience');
  if (!el) return;
  const botId = $('bcBotSelect')?.value || firstBotId;
  if (!botId) { __bcAudience = null; el.innerHTML = 'Select a bot to see how many subscribers it will reach.'; return; }
  const r = await api('/broadcasts/audience?bot_id='+encodeURIComponent(botId));
  if (!r || r.error) { __bcAudience = null; return; }
  __bcAudience = r.count;
  el.innerHTML = 'This will send to <b>'+esc(String(r.count))+'</b> subscriber'+(r.count===1?'':'s')+'.';
}
async function sendBroadcast(btn){
  const body = $('bcBody').value.trim();
  if (!body) return toast('Write a message first');
  const botSelect = $('bcBotSelect');
  const botId = botSelect?.value || firstBotId;
  if (!botId) return toast('Select a bot first');
  const n = __bcAudience;
  const who = (typeof n === 'number') ? n + ' subscriber' + (n===1?'':'s') : 'all subscribers';
  if (typeof n === 'number' && n === 0) return toast("This bot has no subscribers yet — nobody would receive it.");
  if (!confirm('Send this broadcast to '+who+"? This can't be undone.")) return;
  setLoading(btn, 'Sending…');
  const r = await api('/broadcasts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bot_id:botId, body})});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  $('bcBody').value=''; toast('Broadcast queued'); restoreBtn(btn); loadExtras();
}
// Send a single test copy of the broadcast to one chat ID before blasting.
async function testBroadcast(btn){
  const body = $('bcBody').value.trim();
  if (!body) return toast('Write a message first');
  const botId = $('bcBotSelect')?.value || firstBotId;
  if (!botId) return toast('Select a bot first');
  const chatId = Number(($('bcTestChat')?.value || '').trim());
  if (!chatId) return toast('Enter your chat ID to send a test');
  setLoading(btn, 'Sending…');
  const r = await api('/bots/'+botId+'/test-message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId, text:body})});
  restoreBtn(btn);
  if (r.error) return toast(r.error);
  toast('Test sent — check that chat');
}
async function cancelBroadcast(btn){
  if (!confirm('Cancel this scheduled broadcast?')) return;
  setLoading(btn, 'Cancelling…');
  const r = await api('/broadcasts/'+btn.dataset.id,{method:'DELETE'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Broadcast cancelled'); restoreBtn(btn); loadExtras();
}
async function revealPostback(btn){
  setLoading(btn, 'Revealing…');
  const r = await api('/postback-key',{method:'POST'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  const pb = $('pbUrl');
  if (pb) { pb.textContent = r.postback_url + '?event=deposit&amount=50&click_ref=XXX'; pb.dataset.url = r.postback_url; }
  toast('Postback URL revealed'); restoreBtn(btn);
}
async function copyPostback(target){
  const url = target.dataset.url;
  if (!url) return toast('Show the postback URL first');
  navigator.clipboard.writeText(url);
  toast('Postback URL copied');
}
async function upgrade(target){
  setLoading(target, 'Loading…');
  const r = await api('/billing/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:target.dataset.tier})});
  if (r.error) { restoreBtn(target); return toast(r.error); }
  window.open(r.invoice_link, '_blank');
  restoreBtn(target);
}

function setLoading(el, text = 'Loading…') {
  if (!el) return;
  if (el.disabled !== undefined) el.disabled = true;
  // Capture the original label only once so repeated setLoading calls (e.g. a
  // central call plus an action-specific 'Connecting…') don't clobber it.
  if (el.dataset.originalText === undefined) el.dataset.originalText = el.textContent;
  el.textContent = text;
}
function restoreBtn(el) {
  if (!el) return;
  if (el.disabled !== undefined) el.disabled = false;
  if (el.dataset.originalText !== undefined) { el.textContent = el.dataset.originalText; delete el.dataset.originalText; }
}

load(); loadExtras();

function toggleToken(btn) {
  const input = document.getElementById('botToken');
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Hide' : 'Show';
  btn.setAttribute('aria-label', show ? 'Hide token' : 'Show token');
}

async function handleAction(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'toggleToken') { e.preventDefault(); toggleToken(target); return; }
  if (submitting && action !== 'copyLink' && action !== 'copyPostback') return;
  submitting = true;
  // Show a loading state on the clicked control for every network-backed action.
  // Pure client-side actions (copy, local bot selection) don't need it.
  const NO_LOADING = action === 'copyLink' || action === 'copyPostback' || action === 'selectBot'
    || action === 'testMessage' || action === 'cancelTestMessage';
  if (!NO_LOADING) setLoading(target);
  try {
    if (action === 'logout') { e.preventDefault(); await logout(target); }
    else if (action === 'connectBot') { e.preventDefault(); await connectBot(target); }
    else if (action === 'checkHealth') { e.preventDefault(); await checkHealth(target); }
    else if (action === 'disconnectBot') { e.preventDefault(); await disconnectBot(target); }
    else if (action === 'reconnectBot') { e.preventDefault(); await reconnectBot(target); }
    else if (action === 'deleteBot') { e.preventDefault(); await deleteBot(target); }
    else if (action === 'testMessage') { e.preventDefault(); testMessage(target); }
    else if (action === 'sendTestMessage') { e.preventDefault(); await sendTestMessage(target); }
    else if (action === 'cancelTestMessage') { e.preventDefault(); cancelTestMessage(); }
    else if (action === 'selectBot') { e.preventDefault(); selectBotById(target.dataset.id); }
    else if (action === 'createOffer') { e.preventDefault(); await createOffer(target); }
    else if (action === 'addCommand') { e.preventDefault(); await addCommand(target); }
    else if (action === 'saveWelcome') { e.preventDefault(); await saveWelcome(target); }
    else if (action === 'sendBroadcast') { e.preventDefault(); await sendBroadcast(target); }
    else if (action === 'testBroadcast') { e.preventDefault(); await testBroadcast(target); }
    else if (action === 'cancelBroadcast') { e.preventDefault(); await cancelBroadcast(target); }
    else if (action === 'revealPostback') { e.preventDefault(); await revealPostback(target); }
    else if (action === 'copyPostback') { e.preventDefault(); await copyPostback(target); }
    else if (action === 'copyLink') { e.preventDefault(); await copyLink(target); }
    else if (action === 'toggleOffer') { e.preventDefault(); await toggleOffer(target); }
    else if (action === 'toggleCommand') { e.preventDefault(); await toggleCommand(target); }
    else if (action === 'deleteCommand') { e.preventDefault(); await deleteCommand(target); }
    else if (action === 'upgrade') { e.preventDefault(); await upgrade(target); }
  } catch (err) {
    console.error('[dashboard action]', action, err);
    toast('Something went wrong — please reload');
  } finally {
    submitting = false;
    restoreBtn(target);
  }
}

document.addEventListener('click', handleAction);
const logoutForm = document.querySelector('.gm-logout-form');
if (logoutForm) {
  logoutForm.addEventListener('submit', (e) => { e.preventDefault(); logout(e.submitter); });
}
const botSelect = $('botSelect');
if (botSelect) botSelect.addEventListener('change', (e) => { selectBotById(e.target.value); });
const bcBotSelect = $('bcBotSelect');
if (bcBotSelect) bcBotSelect.addEventListener('change', (e) => { firstBotId = e.target.value; updateAudience(); });

window.addEventListener('error', () => {
  const bl = $('botList'); if (bl) bl.textContent = 'Something went wrong. Please reload the page.';
  const pi = $('planInfo'); if (pi) pi.textContent = 'Something went wrong. Please reload the page.';
});
window.addEventListener('unhandledrejection', () => {
  const pi = $('planInfo'); if (pi) pi.textContent = 'Something went wrong. Please reload the page.';
  const bl = $('botList'); if (bl) bl.textContent = 'Something went wrong. Please reload the page.';
});

</script></body></html>`;
}
