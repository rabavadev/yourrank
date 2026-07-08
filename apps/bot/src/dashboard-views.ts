// Views module for the bot dashboard.
// Extracted from dashboard.ts to separate HTML templates from routing logic.

import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";

const BASE_CSS = `
  :root { --bg:#0d1117; --panel:#161b22; --border:#30363d; --fg:#e6edf3; --dim:#8b949e;
          --accent:#f0b429; --green:#3fb950; --red:#f85149; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 -apple-system,'Segoe UI',Roboto,sans-serif; }
  .wrap { max-width:960px; margin:0 auto; padding:24px 16px; }
  .panel { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:20px; margin-bottom:20px; }
  h1 { font-size:20px; } h2 { font-size:16px; margin-bottom:12px; color:var(--accent); }
  input, textarea { width:100%; background:var(--bg); color:var(--fg); border:1px solid var(--border);
          border-radius:6px; padding:8px 10px; margin-bottom:10px; font:inherit; }
  button { background:var(--accent); color:#000; border:0; border-radius:6px; padding:8px 16px;
           font:600 14px/1 inherit; cursor:pointer; }
  button.ghost { background:transparent; color:var(--dim); border:1px solid var(--border); }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); }
  th { color:var(--dim); font-weight:500; }
  .muted { color:var(--dim); } .ok { color:var(--green); } .off { color:var(--red); }
  .row { display:flex; gap:16px; flex-wrap:wrap; } .row > * { flex:1; min-width:220px; }
  .stat { font-size:28px; font-weight:700; } .copy { cursor:pointer; text-decoration:underline dotted; }
  #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--accent);
           color:#000; padding:10px 18px; border-radius:8px; font-weight:600; display:none; }
`;

function escHtml(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[ch]);
}

export function loginHtml(botUsername: string, devLogin: boolean, publicBaseUrl: string, nonce?: string): string {
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
  </style></head><body>
<a href="#main-content" class="sr-only" style="position:absolute;top:0;left:0;z-index:9999;padding:8px 16px;background:var(--accent,#c8ff00);color:#000;font-weight:700;text-decoration:none" onfocus="this.classList.remove('sr-only')" onblur="this.classList.add('sr-only')">Skip to content</a>
<div class="center"><div class="panel card" id="main-content">
  <h1 style="margin-bottom:8px">🎰 Streamer Dashboard</h1>
  <p class="muted" style="margin-bottom:20px">Manage your bot, offers and click stats.</p>
  ${botUsername
    ? `<script async src="https://telegram.org/js/telegram-widget.js?22"
         data-telegram-login="${escHtml(botUsername)}" data-size="large"
         data-onauth="onTgAuth(user)" data-request-access="write"></script>`
    : `<p class="muted">Telegram login isn't configured yet (set LOGIN_BOT_TOKEN + LOGIN_BOT_USERNAME).</p>`}
  ${devLogin ? `
  <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:16px">
    <p class="muted" style="margin-bottom:8px">Dev login</p>
    <label for="devid" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Telegram User ID</label>
    <input id="devid" type="number" placeholder="Telegram user id">
    <button onclick="devLogin()">Enter</button>
  </div>` : ""}
</div></div>
<script${nonce ? ` nonce="${nonce}"` : ""}>
async function onTgAuth(user) {
  const r = await fetch('/bot/auth/telegram', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(user)});
  if (r.ok) location.reload(); else alert('Login failed: ' + (await r.json()).error);
}
async function devLogin() {
  const id = Number(document.getElementById('devid').value);
  if (!id) return;
  const r = await fetch('/bot/auth/dev', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({telegram_user_id:id})});
  if (r.ok) location.reload(); else alert('Failed');
}
</script></body></html>`;
}

export function appHtml(user: { display_name: string; email: string; plan: string }, publicBaseUrl: string, nonce?: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard</title><style>${SHELL_NAV_CSS}${BASE_CSS}</style></head><body>
<a href="#main-content" class="sr-only" style="position:absolute;top:0;left:0;z-index:9999;padding:8px 16px;background:var(--accent,#c8ff00);color:#000;font-weight:700;text-decoration:none" onfocus="this.classList.remove('sr-only')" onblur="this.classList.add('sr-only')">Skip to content</a>
${shellNavHtml({ activePath: "/bot/dashboard", user })}
<div class="wrap" id="main-content">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
    <h1>🎰 Streamer Dashboard</h1>
    <div><span id="whoami" class="muted"></span>
    <button class="ghost" onclick="logout()" style="margin-left:10px">Log out</button></div>
  </div>

  <div class="row">
    <div class="panel"><h2>Clicks (14d)</h2><div class="stat" id="totClicks">–</div></div>
    <div class="panel"><h2>Unique (14d)</h2><div class="stat" id="totUnique">–</div></div>
    <div class="panel"><h2>Active offers</h2><div class="stat" id="totOffers">–</div></div>
  </div>

  <div class="panel"><h2>Daily clicks</h2><svg id="chart" role="img" aria-label="Daily clicks chart" width="100%" height="120" preserveAspectRatio="none"></svg>
    <div id="chartLabels" class="muted" style="display:flex;justify-content:space-between;font-size:11px"></div></div>

  <div class="panel"><h2>Your bot</h2>
    <div id="botList" class="muted">Loading…</div>
    <div style="margin-top:12px">
      <label for="botToken" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Bot Token</label>
      <input id="botToken" placeholder="Paste bot token from @BotFather (123456:ABC-...)">
      <label for="botWelcome" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Welcome Message</label>
      <input id="botWelcome" placeholder="Welcome message (optional)">
      <button onclick="connectBot()">Connect bot</button>
    </div>
  </div>

  <div class="panel" id="customizePanel" style="display:none"><h2>Customize your bot</h2>
    <p class="muted" style="margin-bottom:12px">Personalize what your bot says to viewers. Changes apply instantly — no redeploy needed.</p>

    <label for="welcomeMsg" style="display:block;margin-bottom:4px;font-size:13px" class="muted">Welcome message — the reply to <code>/start</code></label>
    <textarea id="welcomeMsg" rows="2" placeholder="Leave blank to use the default greeting"></textarea>
    <button onclick="saveWelcome()">Save welcome message</button>

    <h3 style="margin:20px 0 6px;font-size:14px">Custom commands</h3>
    <p class="muted" style="margin-bottom:10px;font-size:13px">Add slash-commands your viewers can send (e.g. <code>/vip</code>) and the reply they'll get. Built-ins like <code>/start</code>, <code>/code</code>, <code>/subscribe</code> are reserved.</p>
    <div class="row">
      <label for="cmdName" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Command</label>
      <input id="cmdName" placeholder="Command (e.g. vip)">
      <label for="cmdResp" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Reply</label>
      <input id="cmdResp" placeholder="Reply text viewers receive">
    </div>
    <button onclick="addCommand()">Add command</button>
    <table style="margin-top:14px"><thead><tr><th>Command</th><th>Reply</th><th>Status</th><th></th></tr></thead>
    <tbody id="cmdList"></tbody></table>
  </div>

  <div class="panel"><h2>New offer</h2>
    <div class="row">
      <label for="oCasino" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Casino</label>
      <input id="oCasino" placeholder="Casino (e.g. Stake)">
      <label for="oLabel" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Label</label>
      <input id="oLabel" placeholder="Label (e.g. 200% deposit bonus)">
    </div>
    <label for="oUrl" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Affiliate URL</label>
    <input id="oUrl" placeholder="Your affiliate URL (https://...)">
    <div class="row">
      <label for="oCode" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Promo Code</label>
      <input id="oCode" placeholder="Promo code (optional)">
      <label for="oBonus" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Bonus Text</label>
      <input id="oBonus" placeholder="Bonus text shown in bot (optional)">
    </div>
    <button onclick="createOffer()">Create offer</button>
  </div>

  <div class="panel"><h2>Offers</h2>
    <table><thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>Unique</th><th>Status</th><th></th></tr></thead>
    <tbody id="offers"></tbody></table>
  </div>

  <div class="panel"><h2>Broadcast to subscribers</h2>
    <div id="bcGate" class="muted" style="display:none;margin-bottom:10px"></div>
    <label for="bcBody" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Message</label>
    <textarea id="bcBody" rows="3" placeholder="Message to all your bot's subscribers (Markdown supported)"></textarea>
    <button onclick="sendBroadcast()">Send broadcast</button>
    <table style="margin-top:14px"><thead><tr><th>Message</th><th>Status</th><th>Sent</th><th>Failed</th></tr></thead>
    <tbody id="bcList"></tbody></table>
  </div>

  <div class="panel"><h2>Conversions (postbacks)</h2>
    <p class="muted" style="margin-bottom:10px">Give your affiliate manager this postback URL and add
      <code>{click_ref}</code> anywhere in your affiliate URL to attribute deposits to clicks.</p>
    <p class="muted" style="margin-bottom:10px;font-size:12px">Your network supports request signing? Use <code>POST ${publicBaseUrl}/pb</code> with headers
      <code>X-Postback-Key</code> (your key, below) + <code>X-Postback-Signature</code> (hex HMAC-SHA256 of the query string, keyed by that same key). It's the secure option — the key never rides the URL and the signature blocks tampering.</p>
    <div style="margin-bottom:10px"><button class="ghost" onclick="revealPostback()">Show my postback URL</button>
      <span id="pbUrl" class="copy" style="margin-left:8px"></span></div>
    <table><thead><tr><th>When</th><th>Event</th><th>Amount</th><th>Offer</th></tr></thead>
    <tbody id="convList"></tbody></table>
  </div>

  <div class="panel"><h2>Plan</h2>
    <div id="planInfo" class="muted">Loading…</div>
    <div id="planButtons" style="margin-top:12px"></div>
  </div>
</div>
<div id="toast" role="status" aria-live="polite"></div>
<script${nonce ? ` nonce="${nonce}"` : ""}>
const $ = (id) => document.getElementById(id);
function toast(msg) { const t=$('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }
async function api(path, opts) {
  const r = await fetch('/bot/dash/api'+path, opts);
  if (r.status === 401) { location.reload(); throw new Error('session expired'); }
  try { return await r.json(); }
  catch { return { error: 'Server error (' + r.status + ') — try again or contact support' }; }
}
async function logout() { await fetch('/bot/auth/logout',{method:'POST'}); location.reload(); }

async function load() {
  const me = await api('/me');
  if (me.error) { toast(me.error); return; }
  $('whoami').textContent = (me.display_name||'') + ' · ' + me.plan;
  const [offers, daily, bots] = await Promise.all([api('/offers'), api('/stats/daily'), api('/bots')]);
  if (daily.error || offers.error || bots.error) { toast(daily.error || offers.error || bots.error); return; }

  $('totClicks').textContent = (daily||[]).reduce((s,d)=>s+d.clicks,0);
  $('totUnique').textContent = (daily||[]).reduce((s,d)=>s+d.unique_clicks,0);
  $('totOffers').textContent = (offers||[]).filter(o=>o.is_active).length;

  // chart
  const max = Math.max(1, ...(daily||[]).map(d=>d.clicks));
  const w = daily.length ? 100/daily.length : 10;
  $('chart').setAttribute('viewBox','0 0 100 40');
  $('chart').innerHTML = (daily||[]).map((d,i)=>{
    const h = d.clicks/max*36;
    return '<rect x="'+(i*w+0.5)+'" y="'+(40-h)+'" width="'+(w-1)+'" height="'+h+'" rx="0.6" fill="#f0b429"><title>'+esc(d.day)+': '+esc(String(d.clicks))+'</title></rect>';
  }).join('');
  $('chartLabels').innerHTML = daily.length > 0
    ? '<span>'+esc(daily[0].day.slice(5))+'</span><span>'+esc(daily[daily.length-1].day.slice(5))+'</span>'
    : '';

  // bots
  $('botList').innerHTML = bots.length
    ? bots.map(b=>'<div>@'+esc(b.username)+' <span class="muted">(…'+esc(b.token_hint)+')</span> <span class="'+(b.status==='active'?'ok':'off')+'">'+esc(b.status)+'</span></div>').join('')
    : 'No bot connected yet — paste your token below.';

  // customization panel (targets the first connected bot)
  custBotId = (bots||[])[0]?.id ?? null;
  if (custBotId) {
    $('customizePanel').style.display='';
    $('welcomeMsg').value = (bots||[])[0].welcome_message || '';
    loadCommands();
  } else {
    $('customizePanel').style.display='none';
  }

  // offers
  $('offers').innerHTML = offers.map(o=>'<tr>'+
    '<td><b>'+esc(o.casino)+'</b><br><span class="muted">'+esc(o.label)+'</span></td>'+
    '<td>'+(o.slug?'<span class="copy" onclick="copyLink(\\''+escJsAttr(o.slug)+'\\')">'+esc('/r/'+o.slug)+'</span>':'–')+'</td>'+
    '<td>'+esc(String(o.clicks))+'</td><td>'+esc(String(o.unique_clicks))+'</td>'+
    '<td class="'+(o.is_active?'ok':'off')+'">'+(o.is_active?'active':'off')+'</td>'+
    '<td><button class="ghost" onclick="toggleOffer(\\''+escJsAttr(o.id)+'\\','+(!o.is_active)+')">'+(o.is_active?'Disable':'Enable')+'</button></td>'+
  '</tr>').join('') || '<tr><td colspan="6" class="muted">No offers yet.</td></tr>';
}
function esc(s){ return (s??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function escJsAttr(s){ return (s??'').replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'").replace(/\\n/g,'\\\\n').replace(/\\r/g,'\\\\r'); }
function copyLink(slug){ navigator.clipboard.writeText(location.origin+'/r/'+slug); toast('Link copied'); }
async function toggleOffer(id, on){ await api('/offers/'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({is_active:on})}); load(); }
async function createOffer(){
  const body = { casino:$('oCasino').value.trim(), label:$('oLabel').value.trim(), referral_url:$('oUrl').value.trim(),
                 promo_code:$('oCode').value.trim()||undefined, bonus_text:$('oBonus').value.trim()||undefined };
  const r = await api('/offers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  if (r.error) return toast(r.error);
  ['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id=>$(id).value='');
  toast('Offer created'); load();
}
async function connectBot(){
  const token = $('botToken').value.trim();
  if (!token) return toast('Paste a bot token first');
  const r = await api('/bots',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token, welcome_message:$('botWelcome').value.trim()||undefined})});
  if (r.error) return toast(r.error);
  $('botToken').value='';
  if (r.warning) { toast(r.warning); } else { toast('Bot @'+r.username+' connected'); }
  load();
}

// ---- bot customization: welcome message + custom commands ----
let custBotId = null;
async function saveWelcome(){
  if (!custBotId) return toast('Connect a bot first');
  const r = await api('/bots/'+custBotId,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({welcome_message:$('welcomeMsg').value.trim()||null})});
  if (r.error) return toast(r.error);
  toast('Welcome message saved');
}
async function loadCommands(){
  if (!custBotId) return;
  const cmds = await api('/bots/'+custBotId+'/commands');
  if (cmds.error) return toast(cmds.error);
  $('cmdList').innerHTML = (cmds||[]).map(c=>'<tr>'+
    '<td>/'+esc(c.command)+'</td>'+
    '<td class="muted">'+esc((c.response||'').slice(0,60))+'</td>'+
    '<td class="'+(c.is_enabled?'ok':'off')+'">'+(c.is_enabled?'on':'off')+'</td>'+
    '<td><button class="ghost" onclick="toggleCommand(\\''+escJsAttr(c.id)+'\\','+(!c.is_enabled)+')">'+(c.is_enabled?'Disable':'Enable')+'</button> '+
        '<button class="ghost" onclick="deleteCommand(\\''+escJsAttr(c.id)+'\\')">Delete</button></td>'+
  '</tr>').join('') || '<tr><td colspan="4" class="muted">No custom commands yet.</td></tr>';
}
async function addCommand(){
  if (!custBotId) return toast('Connect a bot first');
  const command = $('cmdName').value.trim(), response = $('cmdResp').value.trim();
  if (!command || !response) return toast('Enter a command and a reply');
  const r = await api('/bots/'+custBotId+'/commands',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command, response})});
  if (r.error) return toast(r.error);
  $('cmdName').value=''; $('cmdResp').value=''; toast('Command saved'); loadCommands();
}
async function toggleCommand(id, on){
  const r = await api('/commands/'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({is_enabled:on})});
  if (r.error) return toast(r.error);
  loadCommands();
}
async function deleteCommand(id){
  const r = await api('/commands/'+id,{method:'DELETE'});
  if (r.error) return toast(r.error);
  toast('Command deleted'); loadCommands();
}

let firstBotId = null;
async function loadExtras(){
  const [plan, bcs, convs, bots] = await Promise.all([api('/plan'), api('/broadcasts'), api('/conversions'), api('/bots')]);
  if (plan.error || bcs.error || convs.error || bots.error) {
    toast(plan.error || bcs.error || convs.error || bots.error);
    return;
  }
  firstBotId = (bots||[])[0]?.id ?? null;

  // plan panel (label comes from the server-side plan table, but escape it as
  // defense-in-depth; the numbers are rendered raw since they're ints).
  const cur = plan?.current;
  if (cur) {
    $('planInfo').innerHTML = '<b style="color:var(--accent)">'+esc(cur.label)+'</b> — up to '+cur.maxBots+' bots, '
      +cur.maxOffers+' offers'+(cur.broadcasts?', broadcasts':'')+(cur.postbacks?', postbacks':'');
    $('planButtons').innerHTML = (plan.plans||[]).filter(p=>p.starsPrice>0 && p.tier!==cur.tier).map(p=>
      '<button onclick="upgrade(\\''+escJsAttr(p.tier)+'\\')" style="margin-right:8px">'
      +(plan.billing_enabled?'Upgrade to '+esc(p.label)+' — ⭐'+esc(String(p.starsPrice))+'/30d':esc(p.label)+' (billing not enabled)')+'</button>'
    ).join('');
  }

  // broadcasts panel
  $('bcList').innerHTML = (bcs||[]).map(b=>'<tr><td>'+esc(b.body.slice(0,60))+'</td><td>'+esc(b.status)+'</td>'+
    '<td>'+esc(b.sent_count)+'/'+(b.total_count?esc(b.total_count):'?')+'</td><td>'+esc(b.fail_count)+'</td></tr>').join('')
    || '<tr><td colspan="4" class="muted">No broadcasts yet.</td></tr>';

  // conversions panel — amount/currency/at come from casino postbacks (external
  // input), so every field is escaped, not just the event name.
  $('convList').innerHTML = (convs||[]).map(v=>'<tr><td>'+esc(v.at)+'</td><td>'+esc(v.event)+'</td>'+
    '<td>'+(v.amount?esc(v.amount)+' '+esc(v.currency):'–')+'</td><td>'+esc(v.offer||'–')+'</td></tr>').join('')
    || '<tr><td colspan="4" class="muted">No conversions reported yet.</td></tr>';
}
async function sendBroadcast(){
  const body = $('bcBody').value.trim();
  if (!body) return toast('Write a message first');
  if (!firstBotId) return toast('Connect a bot first');
  const r = await api('/broadcasts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bot_id:firstBotId, body})});
  if (r.error) return toast(r.error);
  $('bcBody').value=''; toast('Broadcast queued'); loadExtras();
}
async function revealPostback(){
  const r = await api('/postback-key',{method:'POST'});
  if (r.error) return toast(r.error);
  $('pbUrl').textContent = r.postback_url + '?event=deposit&amount=50&click_ref=XXX';
  $('pbUrl').onclick = ()=>{ navigator.clipboard.writeText(r.postback_url); toast('Postback URL copied'); };
}
async function upgrade(tier){
  const r = await api('/billing/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:tier})});
  if (r.error) return toast(r.error);
  window.open(r.invoice_link, '_blank');
}
load(); loadExtras();
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
