// Client-side dashboard script injected by appHtml
export function clientScriptSource(): string {
  return `const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const setHtml = (id, v) => { const el = $(id); if (el) el.innerHTML = v; };
function toast(msg) { const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2500); }
function confirmModal(title, body, confirmText, isDanger) {
  return new Promise(function(resolve){
    const trigger = document.activeElement;
    const modal = document.createElement('div');
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
    const titleId = 'mt'+Math.random().toString(36).slice(2); const descId = 'md'+Math.random().toString(36).slice(2);
    modal.setAttribute('aria-labelledby', titleId); modal.setAttribute('aria-describedby', descId);
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(17,17,20,.45);display:flex;align-items:center;justify-content:center;padding:18px;z-index:200;';
    const card = document.createElement('div');
    card.setAttribute('role','document');
    card.style.cssText = 'width:100%;max-width:420px;background:var(--panel,#ffffff);border:1px solid var(--border,#e9eaef);border-radius:12px;padding:22px;box-shadow:0 12px 32px rgba(0,0,0,.12);';
    const h = document.createElement('h3'); h.id=titleId; h.textContent=title; h.style.cssText='margin:0 0 8px;font-size:18px;color:var(--fg,#111114);';
    const p = document.createElement('p'); p.id=descId; p.textContent=body; p.style.cssText='margin:0 0 18px;font-size:14px;color:var(--dim,#4e4f57);';
    const actions = document.createElement('div'); actions.style.cssText='display:flex;gap:10px;justify-content:flex-end;';
    const cancel = document.createElement('button'); cancel.type='button'; cancel.textContent='Cancel'; cancel.className='ghost';
    const ok = document.createElement('button'); ok.type='button'; ok.textContent=confirmText; if(isDanger) ok.className='danger';
    actions.appendChild(cancel); actions.appendChild(ok);
    card.appendChild(h); card.appendChild(p); card.appendChild(actions);
    modal.appendChild(card);
    const focusables = function(){ return Array.from(modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(el){ return !el.disabled && el.offsetParent !== null; }); };
    let keyHandler;
    const close = function(val){ document.removeEventListener('keydown', keyHandler); if(modal.parentNode) modal.parentNode.removeChild(modal); if(trigger && trigger.focus) trigger.focus(); resolve(val); };
    keyHandler = function(e){
      if(e.key === 'Escape'){ e.preventDefault(); close(false); return; }
      if(e.key === 'Tab'){
        const f = focusables();
        if(f.length === 0) return;
        const first = f[0], last = f[f.length-1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    };
    cancel.onclick = function(){ close(false); };
    ok.onclick = function(){ close(true); };
    modal.onclick = function(e){ if(e.target === modal) close(false); };
    document.body.appendChild(modal);
    document.addEventListener('keydown', keyHandler);
    ok.focus();
  });
}
function setFieldErr(id, msg) {
  const input = $(id); if (!input) return;
  input.setAttribute('aria-invalid','true'); input.classList.add('input-err');
  let err = $(id + '-error');
  if (!err) { err = document.createElement('span'); err.id = id + '-error'; err.className = 'field-err'; err.setAttribute('role','alert'); input.parentNode.insertBefore(err, input.nextSibling); }
  err.textContent = msg;
}
function clearFieldErr(id) {
  const input = $(id); if (input) { input.removeAttribute('aria-invalid'); input.classList.remove('input-err'); }
  const err = $(id + '-error'); if (err) err.textContent = '';
}
function setFormStatus(id, msg, isErr) {
  const el = $(id); if (!el) return;
  el.textContent = msg;
  el.classList.toggle('error', !!isErr);
  el.classList.toggle('ok', !isErr);
  el.hidden = !msg;
}
function clearFormStatus(id) { setFormStatus(id, '', false); }
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { return navigator.clipboard.writeText(text).then(function(){ return true; }).catch(function(){ return false; }); } catch (e) { return Promise.resolve(false); }
  }
  return new Promise(function(resolve){
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta); resolve(ok);
    } catch (e) { resolve(false); }
  });
}
function manualCopyFallback(text) {
  try {
    const ta = document.createElement('textarea'); ta.value = text; ta.readOnly = true; ta.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    const msg = document.createElement('p'); msg.className = 'form-status ok'; msg.textContent = 'Text selected. Press Ctrl+C (or Cmd+C) to copy, then close this message.';
    ta.parentNode.insertBefore(msg, ta.nextSibling);
    setTimeout(function(){ if(msg.parentNode) msg.parentNode.removeChild(msg); if(ta.parentNode) ta.parentNode.removeChild(ta); }, 6000);
    return true;
  } catch (e) { return false; }
}
async function copyWithFallback(text) {
  const ok = await copyText(text);
  if (ok) return true;
  return manualCopyFallback(text);
}
async function api(path, opts) {
  const r = await fetch('/bot/dash/api'+path, opts);
  if (r.status === 401) { saveBroadcastDraft(); location.reload(); throw new Error('session expired'); }
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
    el.classList.toggle('hidden', !pages.includes(p));
  });
}
showPage(page);

function esc(s){ return String(s??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

function fmtTime(iso){
  if (!iso) return 'never';
  try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function showWizardStep(n){
  document.querySelectorAll('#connectWizard .wizard-step').forEach(el => { el.hidden = Number(el.dataset.step) !== n; });
}
function wizardNext(btn){ showWizardStep(Number(btn.dataset.step) + 1); }
function wizardPrev(btn){ showWizardStep(Number(btn.dataset.step) - 1); }

let firstBotId = null;
let custBotId = null;

async function load() {
  const me = await api('/me');
  if (me.error) { toast(me.error); return; }

  const [offers, daily, bots] = await Promise.all([api('/offers'), api('/stats/daily'), api('/bots')]);
  if (daily.error || offers.error || bots.error) { toast(daily.error || offers.error || bots.error); return; }

  showPage(page);

  // overview stats
  if (page === 'overview') {
    const totClicks = (daily||[]).reduce((s,d)=>s+d.clicks,0);
    const totUnique = (daily||[]).reduce((s,d)=>s+d.unique_clicks,0);
    const activeOffers = (offers||[]).filter(o=>o.is_active).length;
    setText('totClicks', totClicks);
    setText('totUnique', totUnique);
    setText('totOffers', activeOffers);
    setText('uniqueSub', totClicks > 0 ? Math.round(totUnique/totClicks*100) + '% of clicks' : '');
    setText('offersSub', (offers||[]).length ? 'of ' + (offers||[]).length + ' total' : 'none yet');
    renderOverviewSummary(bots, offers);

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

// Compact bot + offer summaries and the setup checklist (overview only).
function renderOverviewSummary(bots, offers){
  const ov = $('ovBots');
  if (ov) {
    const list = (bots||[]).slice(0,4);
    ov.innerHTML = list.length
      ? list.map(b=>{
          const on = b.status === 'active';
          return '<div class="lrow"><div class="l"><div class="nm">@'+esc(b.username)+'</div>'+
            '<div class="ds">'+(on?'webhook active':'disconnected')+'</div></div>'+
            '<span class="badge '+(on?'on':'off')+'">'+(on?'active':'off')+'</span></div>';
        }).join('')
      : '<p class="muted style-26">No bot connected yet. <a href="/bot/bots">Connect one →</a></p>';
  }
  const oo = $('ovOffers');
  if (oo) {
    const top = (offers||[]).slice().sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,4);
    oo.innerHTML = top.length
      ? top.map(o=>{
          const on = o.is_active;
          const cr = o.cr != null ? ((o.cr)*100).toFixed(1) : '0.0';
          return '<div class="lrow"><div class="l"><div class="nm">'+esc(o.casino)+'</div>'+
            '<div class="ds">'+esc(o.label||'')+' · '+esc(String(o.clicks||0))+' clicks · '+esc(String(o.conversions||0))+' conv · '+esc(cr)+'% CR</div></div>'+
            '<span class="badge '+(on?'on':'off')+'">'+(on?'active':'off')+'</span></div>';
        }).join('')
      : '<p class="muted style-26">No offers yet. <a href="/bot/offers">Create one →</a></p>';
  }
  markStep('stepBot', (bots||[]).some(b=>b.status==='active'));
  markStep('stepOffer', (offers||[]).length > 0);
}
function markStep(id, done){ const el = $(id); if (el) el.classList.toggle('done', !!done); }

// Subscriber totals + deep-link attribution (overview only).
async function loadSubscribers(bots){
  const s = await api('/stats/subscribers');
  if (!s || s.error) return;
  const t = s.totals || {};
  setText('totSubs', t.active ?? 0);
  setText('subsNew', (t.new_7d ?? 0) > 0 ? '+' + (t.new_7d ?? 0) + ' new in 7d' : 'no new in 7d');
  const rows = (s.sources || []);
  setHtml('subSources', rows.length
    ? rows.map(r=>'<tr><td>'+esc(r.source)+'</td><td class="style-8">'+esc(String(r.count))+'</td></tr>').join('')
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
  offersEl.innerHTML = (__offers||[]).map(o=>{
    const ctr = o.ctr != null ? ((o.ctr)*100).toFixed(1) : '0.0';
    const cr = o.cr != null ? ((o.cr)*100).toFixed(1) : '0.0';
    return '<tr>'+
    '<td><b>'+esc(o.casino)+'</b><br><span class="muted">'+esc(o.label)+'</span></td>'+
    '<td>'+(o.slug?'<span class="copy" data-action="copyLink" data-slug="'+esc(o.slug)+'" title="Copy tracked link">'+esc('/r/'+o.slug)+'</span> <button class="ghost style-33" data-action="copyLink" data-slug="'+esc(o.slug)+'" type="button" aria-label="Copy link">Copy</button>':'–')+'</td>'+
    '<td>'+esc(String(o.clicks))+'</td><td>'+esc(String(o.unique_clicks))+'</td>'+
    '<td>'+esc(ctr)+'%</td><td>'+esc(cr)+'%</td><td>'+esc(String(o.conversions||0))+'</td>'+
    '<td class="'+(o.is_active?'ok':'off')+'">'+(o.is_active?'active':'off')+'</td>'+
    '<td><button class="ghost" data-action="toggleOffer" data-id="'+esc(o.id)+'" data-active="'+(!o.is_active)+'">'+(o.is_active?'Disable':'Enable')+'</button></td>'+
  '</tr>';
  }).join('') || '<tr><td colspan="9" class="muted">No offers yet.</td></tr>';
}

async function loadExtras(){
  const [plan, bcs, pbStatus] = await Promise.all([api('/plan'), api('/broadcasts'), api('/postback-status')]);
  if (plan.error || bcs.error || pbStatus.error) {
    toast(plan.error || bcs.error || pbStatus.error);
    return;
  }
  renderPostbackStatus(pbStatus);

  const cur = plan?.current;
  if (cur && typeof cur.maxBots === 'number') {
    __maxBots = cur.maxBots;
    const cf = $('connectWizard');
    if (cf) cf.classList.toggle('hidden', __lastBots.filter(b => b.status === 'active').length >= __maxBots);
  }

  const bcList = $('bcList');
  if (bcList) {
    bcList.innerHTML = (bcs||[]).map(b=>{
      const bodyPreview = esc(b.body.slice(0,60)) + (b.body.length>60?'…':'') + (b.media_url ? ' (image)' : '');
      const when = b.scheduled_at ? new Date(b.scheduled_at).toLocaleString(undefined,{dateStyle:'short',timeStyle:'short'}) : 'now';
      const seg = formatSegmentLabel(b.segment);
      return '<tr><td>'+bodyPreview+'</td><td>'+esc(b.bot_username||'–')+'</td><td>'+esc(b.status)+'</td>'+
      '<td>'+when+(seg?' <span class="muted">('+esc(seg)+')</span>':'')+'</td>'+
      '<td>'+esc(b.sent_count)+'/'+(b.total_count?esc(b.total_count):'?')+'</td><td>'+esc(b.fail_count)+'</td>'+
      '<td>'+(b.status==='scheduled'?'<button class="ghost" data-action="cancelBroadcast" data-id="'+esc(b.id)+'" type="button">Cancel</button>':'')+'</td></tr>';
    }).join('')
      || '<tr><td colspan="7" class="muted">No broadcasts yet.</td></tr>';
  }

  if (typeof markStep === 'function') markStep('stepPb', !!pbStatus?.active);
}

function renderPostbackStatus(pb){
  const el = $('postbackStatus');
  if (!el) return;
  if (!pb || pb.error) { el.textContent = 'Could not load postback status.'; return; }
  if (pb.active) {
    const at = pb.createdAt ? new Date(pb.createdAt).toLocaleString(undefined,{dateStyle:'short',timeStyle:'short'}) : 'active';
    el.innerHTML = '<span class="badge ok">Active</span> Postback key created '+esc(at)+'. Full setup is in Account → Postbacks.';
  } else {
    el.innerHTML = '<span class="badge off">Not configured</span> Set up postbacks in Account → Postbacks to receive conversion events.';
  }
}

async function copyLink(target){ const ok = await copyWithFallback(location.origin+'/r/'+target.dataset.slug); toast(ok ? 'Link copied' : 'Copy failed — copy the URL manually'); }
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
function updateOfferPreview(){
  const casino = ($('oCasino')?.value || '').trim();
  const label = ($('oLabel')?.value || '').trim();
  const url = ($('oUrl')?.value || '').trim();
  const code = ($('oCode')?.value || '').trim();
  const bonus = ($('oBonus')?.value || '').trim();
  const wrap = $('offerPreview');
  if (!wrap) return;
  if (!casino && !label && !url) { wrap.hidden = true; return; }
  const parts = [];
  if (label) parts.push(label);
  if (casino) parts.push('at ' + casino);
  if (bonus) parts.push('— ' + bonus);
  if (code) parts.push('Code: ' + code);
  const line = parts.join(' ');
  const urlEl = $('offerPreviewUrl');
  const textEl = $('offerPreviewText');
  if (urlEl) urlEl.textContent = url || 'https://yourrank.site/r/<short-link-will-appear-here>';
  if (textEl) textEl.textContent = line || 'Offer preview will appear here';
  wrap.hidden = false;
}
async function createOffer(btn){
  ['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id => clearFieldErr(id));
  const body = { casino:$('oCasino').value.trim(), label:$('oLabel').value.trim(), referral_url:$('oUrl').value.trim(),
                 promo_code:$('oCode').value.trim()||undefined, bonus_text:$('oBonus').value.trim()||undefined };
  if (!body.label) { setFieldErr('oLabel','Enter an offer label'); return; }
  if (!body.referral_url) { setFieldErr('oUrl','Enter a referral URL'); return; }
  if (!body.referral_url.startsWith('http://') && !body.referral_url.startsWith('https://')) { setFieldErr('oUrl','URL must start with http:// or https://'); return; }
  setLoading(btn, 'Creating…');
  const r = await api('/offers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  if (r.error) { restoreBtn(btn); setFieldErr('oLabel', r.error + ' — click Create again to retry.'); return; }
  ['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id=>$(id).value='');
  const wrap = $('offerPreview'); if (wrap) wrap.hidden = true;
  toast('Offer created'); restoreBtn(btn); load();
}
async function connectBot(btn){
  clearFieldErr('botToken');
  const token = $('botToken').value.trim();
  if (!token) { setFieldErr('botToken','Paste a bot token first'); return; }
  showWizardStep(3);
  const status = $('connectStatus'); if (status) { status.className = 'muted'; status.textContent = 'Checking token with Telegram…'; }
  const r = await api('/bots',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token, welcome_message:$('botWelcome').value.trim()||undefined})});
  if (r.error) {
    if (status) { status.className = 'muted off'; status.textContent = 'Could not connect: ' + r.error + '. Go back and check your token.'; }
    return;
  }
  $('botToken').value='';
  if (status) { status.className = 'muted ok'; status.textContent = 'Connected to @' + r.username + '! You can send a test message below.'; }
  if (r.warning) { toast(r.warning); } else { toast('Bot @'+r.username+' connected'); }
  load();
}
async function checkHealth(target){
  setLoading(target, 'Checking…');
  const id = target.dataset.id;
  const r = await api('/bots/'+id+'/health');
  restoreBtn(target);
  if (r.error) { return toast(r.error); }
  const details = $('health-body-'+id);
  const wrap = $('health-'+id);
  if (details && wrap) {
    const action = r.configured
      ? (r.last_error ? 'Your bot had an error. Try clicking <b>Reconnect</b> to reset the webhook.' : 'Webhook looks good. If messages stop arriving, click <b>Reconnect</b>.')
      : 'Webhook is missing. Click <b>Reconnect</b> to register it with Telegram.';
    details.innerHTML = '<ul>'+
      '<li><b>Webhook URL:</b> '+(r.url ? esc(r.url) : 'none')+'</li>'+
      '<li><b>Pending updates:</b> '+esc(String(r.pending_updates))+'</li>'+
      (r.last_error ? '<li><b>Last error:</b> '+esc(r.last_error)+(r.last_error_at ? ' <span class="muted">('+esc(fmtTime(r.last_error_at))+')</span>' : '')+'</li>' : '')+
      '</ul><p>'+action+'</p>';
    wrap.hidden = false;
    wrap.open = true;
  }
  const summary = r.configured
    ? 'Webhook OK' + (r.last_error ? ' (had an error)' : '')
    : 'Webhook missing';
  toast(summary + ' — see details below');
}
async function disconnectBot(btn){
  if (!await confirmModal('Disconnect bot', 'It will stop responding, but your offers, commands and subscriber history stay in YourRank. Your token is removed from our servers.', 'Disconnect', true)) return;
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
async function syncCommands(btn){
  setLoading(btn, 'Syncing…');
  const r = await api('/bots/'+btn.dataset.id+'/sync-commands',{method:'POST'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Commands synced');
  const bot = __lastBots.find(b => b.id === btn.dataset.id);
  if (bot) bot.last_command_sync_at = r.last_command_sync_at;
  restoreBtn(btn); renderBots(__lastBots, false);
}
async function deleteBot(btn){
  if (!await confirmModal('Delete bot', 'Permanently delete this bot? This cannot be undone.', 'Delete', true)) return;
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
  const panel = $('testMsgPanel'); if (panel) panel.hidden = false;
  const ci = $('tmChatId'); if (ci) ci.focus();
}
function cancelTestMessage(){
  const panel = $('testMsgPanel'); if (panel) panel.hidden = true;
  const ci = $('tmChatId'); if (ci) ci.value = '';
  const tx = $('tmText'); if (tx) tx.value = '';
  __testBotId = null;
}
async function sendTestMessage(btn){
  clearFieldErr('tmChatId'); clearFieldErr('tmText');
  if (!__testBotId) return toast('Select a bot first');
  const chatId = Number(($('tmChatId').value || '').trim());
  if (!chatId || isNaN(chatId)) { setFieldErr('tmChatId','Enter a valid numeric chat ID'); return; }
  const text = ($('tmText').value || '').trim();
  if (!text) { setFieldErr('tmText','Enter a message'); return; }
  setLoading(btn, 'Sending…');
  const r = await api('/bots/'+__testBotId+'/test-message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});
  if (r.error) { restoreBtn(btn); setFieldErr('tmText', r.error + ' — click Send again to retry.'); return; }
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
          const syncLabel = b.last_command_sync_at ? 'Synced '+fmtTime(b.last_command_sync_at) : 'Commands not synced yet';
          return '<div class="bot-card">'+
            '<div class="bot-card-head">'+
              '<div class="meta"><a href="https://t.me/'+esc(b.username)+'" target="_blank" rel="noopener">@'+esc(b.username)+'</a> '+
              '<span class="muted">(…'+esc(b.token_hint)+')</span> <span class="badge '+statusClass+'">'+esc(statusText)+'</span></div>'+
              '<div class="muted" style="font-size:12px;margin-top:4px">'+esc(syncLabel)+' · updated '+esc(fmtTime(b.updated_at))+'</div>'+
            '</div>'+
            '<div class="actions">'+
              (isActive ? '<button class="ghost" data-action="checkHealth" data-id="'+esc(b.id)+'" type="button">Check webhook</button>' : '')+
              (isActive ? '<button class="ghost" data-action="syncCommands" data-id="'+esc(b.id)+'" type="button">Sync commands</button>' : '')+
              (isActive ? '<button class="ghost" data-action="disconnectBot" data-id="'+esc(b.id)+'" type="button">Disconnect</button>'
                        : '<button class="ghost" data-action="reconnectBot" data-id="'+esc(b.id)+'" type="button">Reconnect</button>')+
              (isActive ? '<button class="ghost" data-action="selectBot" data-id="'+esc(b.id)+'" type="button">Edit commands</button>' : '')+
              (isActive && page === 'bots' ? '<button class="ghost" data-action="testMessage" data-id="'+esc(b.id)+'" type="button">Test message</button>' : '')+
              (page === 'bots' ? '<button class="danger" data-action="deleteBot" data-id="'+esc(b.id)+'" type="button">Delete</button>' : '')+
            '</div>'+
            '<details class="health-details" id="health-'+esc(b.id)+'" hidden>'+
              '<summary>Technical details</summary>'+
              '<div class="health-body" id="health-body-'+esc(b.id)+'">Click <b>Check webhook</b> to load the latest status.</div>'+
            '</details>'+
          '</div>';
        }).join('')
      : 'No bot connected yet — start with step 1 below.';
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
  loadBroadcastDraft();
  updateScheduleInputState();
  showTimezone();

  // Hide the connect form once the plan's active-bot slots are full.
  const cf = $('connectWizard');
  if (cf) cf.classList.toggle('hidden', bots.filter(b => b.status === 'active').length >= __maxBots);

  // customize panel (only on pages that show it)
  if ($('customizePanel') && (page === 'bots' || page === 'commands')) {
    const bot = custBotId ? (bots.find(b => b.id === custBotId) || bots[0]) : null;
    if (bot) {
      $('customizePanel').classList.remove('hidden');
      applyCustomizeState(bot);
      if (loadCmds) loadCommands();
    } else {
      $('customizePanel').classList.add('hidden');
    }
  }

  // Hide the "connect a bot first" hint once the user has a bot.
  const commandsHint = $('commandsEmptyHint');
  if (commandsHint) commandsHint.classList.toggle('hidden', bots.length > 0);
}

// A disconnected bot can't be customized — reflect that by disabling the
// welcome/command inputs and showing a hint, instead of silently accepting
// edits that won't apply until the bot is reconnected.
function applyCustomizeState(bot){
  const active = bot.status === 'active';
  const note = $('custDisabledNote'); if (note) note.classList.toggle('hidden', active);
  const welcome = $('welcomeMsg'); if (welcome) welcome.value = bot.welcome_message || '';
  const nameEl = $('selectedBotName');
  if (nameEl) nameEl.textContent = bot ? 'Selected bot: @' + bot.username : 'No bot selected';
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
    $('customizePanel').classList.toggle('hidden', !id);
    if (bot) applyCustomizeState(bot);
    loadCommands();
  }
}

// ---- bot customization: welcome message + custom slash-commands ----
async function saveWelcome(btn){
  clearFieldErr('welcomeMsg');
  if (!custBotId) return toast('Select a bot first');
  const text = $('welcomeMsg').value.trim();
  if (!text) { setFieldErr('welcomeMsg','Enter a welcome message'); return; }
  setLoading(btn, 'Saving…');
  const r = await api('/bots/'+custBotId,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({welcome_message:text||null})});
  if (r.error) { restoreBtn(btn); setFieldErr('welcomeMsg', r.error + ' — click Save again to retry.'); return; }
  toast('Welcome message saved'); restoreBtn(btn);
}
let __commands = [];
let __cmdButtons = [];
function renderCmdButtons(){
  const el = $('cmdButtonList');
  if (!el) return;
  el.innerHTML = (__cmdButtons||[]).map((b,i)=>'<span class="cmd-button-chip">'+esc(b.label)+' <button class="ghost" data-action="removeCommandButton" data-idx="'+i+'" type="button" title="Remove">×</button></span>').join('') || '';
}
function addCommandButton(btn){
  clearFieldErr('cmdBtnLabel'); clearFieldErr('cmdBtnUrl');
  const label = $('cmdBtnLabel').value.trim(), url = $('cmdBtnUrl').value.trim();
  if (!label) { setFieldErr('cmdBtnLabel','Enter a button label'); return; }
  if (!url) { setFieldErr('cmdBtnUrl','Enter a button URL'); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) { setFieldErr('cmdBtnUrl','URL must start with http:// or https://'); return; }
  if (__cmdButtons.length >= 10) { setFieldErr('cmdBtnUrl','Max 10 buttons per command'); return; }
  __cmdButtons.push({label, url});
  renderCmdButtons();
  $('cmdBtnLabel').value=''; $('cmdBtnUrl').value=''; $('cmdBtnLabel').focus();
}
function removeCommandButton(target){
  const idx = Number(target.dataset.idx);
  if (Number.isNaN(idx)) return;
  __cmdButtons.splice(idx, 1);
  renderCmdButtons();
}
// Render the custom-commands table from client state. Mutation handlers update
// __commands from their authoritative response and re-render, so the table is
// correct immediately (an immediate re-read can lag behind the write).
function renderCommands(){
  const cmdList = $('cmdList');
  if (!cmdList) return;
  cmdList.innerHTML = (__commands||[]).map(c=>{
    const buttons = Array.isArray(c.buttons) ? c.buttons : [];
    const btnText = buttons.length ? buttons.map(b => esc(b.label)).join(', ') : '–';
    const short = esc((c.response||'').slice(0,60));
    const ellipsis = (c.response||'').length > 60 ? '…' : '';
    return '<tr>'+
    '<td>/'+esc(c.command)+'</td>'+
    '<td class="muted">'+short+ellipsis+'</td>'+
    '<td class="muted">'+btnText+'</td>'+
    '<td class="'+(c.is_enabled?'ok':'off')+'">'+(c.is_enabled?'on':'off')+'</td>'+
    '<td><button class="ghost" data-action="viewCommand" data-id="'+esc(c.id)+'">View</button> '
        +'<button class="ghost" data-action="testCommand" data-id="'+esc(c.id)+'">Test</button> '
        +'<button class="ghost" data-action="toggleCommand" data-id="'+esc(c.id)+'" data-active="'+(!c.is_enabled)+'">'+(c.is_enabled?'Disable':'Enable')+'</button> '
        +'<button class="ghost" data-action="deleteCommand" data-id="'+esc(c.id)+'">Delete</button></td>'+
  '</tr>';
  }).join('') || '<tr><td colspan="5" class="muted">No custom commands yet.</td></tr>';
}
async function loadCommands(){
  if (!custBotId) return;
  const cmds = await api('/bots/'+custBotId+'/commands');
  if (cmds.error) return toast(cmds.error);
  __commands = cmds || [];
  renderCommands();
}
const RESERVED_COMMANDS = new Set(['start','menu','help','support','code','codes','subscribe','unsubscribe','rank','board','leaderboard']);
function normalizeCommandInput(raw){
  let s = (raw ?? '').trim();
  if (s.startsWith('/')) s = s.slice(1);
  const parts = s.split(/[ \t\r\n@]/);
  return parts[0].toLowerCase();
}
async function addCommand(btn){
  clearFieldErr('cmdName'); clearFieldErr('cmdResp');
  if (!custBotId) return toast('Select a bot first');
  const command = normalizeCommandInput($('cmdName').value);
  const response = $('cmdResp').value.trim();
  if (!command) { setFieldErr('cmdName','Enter a command'); return; }
  if (!response) { setFieldErr('cmdResp','Enter a reply'); return; }
  if (!/^[a-z0-9_]{1,32}$/.test(command)) { setFieldErr('cmdName','Command must be 1-32 chars: letters, numbers, or underscore'); return; }
  if (RESERVED_COMMANDS.has(command)) { setFieldErr('cmdName',"/"+command+" is a built-in command and can't be overridden"); return; }
  if (__commands.some(c => c.command === command)) { setFieldErr('cmdName','/'+command+' already exists for this bot'); return; }
  setLoading(btn, 'Adding…');
  const payload = {command, response};
  if (__cmdButtons.length) payload.buttons = __cmdButtons;
  const r = await api('/bots/'+custBotId+'/commands',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if (r.error) { restoreBtn(btn); setFieldErr('cmdName', r.error + ' — click Add again to retry.'); return; }
  const i = __commands.findIndex(c => c.id === r.id || c.command === r.command);
  if (i >= 0) __commands[i] = r; else __commands.push(r);
  __commands.sort((a,b)=>a.command.localeCompare(b.command));
  __cmdButtons = [];
  renderCmdButtons();
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
  const c = __commands.find(x => x.id === target.dataset.id);
  if (!await confirmModal('Delete command', 'Delete /'+(c?.command||'this command')+'? This cannot be undone.', 'Delete', true)) return;
  setLoading(target, 'Deleting…');
  const r = await api('/commands/'+target.dataset.id,{method:'DELETE'});
  if (r.error) { restoreBtn(target); return toast(r.error); }
  __commands = __commands.filter(c => c.id !== target.dataset.id);
  renderCommands();
  toast('Command deleted'); restoreBtn(target);
}
function openCommandPreview(id){
  const c = __commands.find(x => x.id === id);
  if (!c) return;
  const wrap = $('cmdPreview');
  if (!wrap) return;
  const name = $('cmdPreviewName');
  const resp = $('cmdPreviewResponse');
  if (name) name.textContent = '/' + c.command;
  if (resp) resp.textContent = c.response || '';
  wrap.hidden = false;
  wrap.dataset.commandId = id;
  const chat = $('cmdTestChatId'); if (chat) chat.focus();
}
function closeCommandPreview(){
  const wrap = $('cmdPreview');
  if (wrap) { wrap.hidden = true; wrap.dataset.commandId = ''; }
  const chat = $('cmdTestChatId'); if (chat) chat.value = '';
}
async function testCommand(target){
  clearFieldErr('cmdTestChatId');
  const id = target.dataset.id || target.closest('[data-command-id]')?.dataset.commandId;
  const c = __commands.find(x => x.id === id);
  if (!c) return toast('Command not found');
  const chatId = Number(($('cmdTestChatId')?.value || '').trim());
  if (!chatId || isNaN(chatId)) { setFieldErr('cmdTestChatId','Enter a valid numeric chat ID'); return; }
  const bot = __lastBots.find(b => b.id === custBotId);
  if (!bot) return toast('Select a bot first');
  setLoading(target, 'Sending…');
  const r = await api('/bots/'+custBotId+'/test-message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId, text:c.response})});
  restoreBtn(target);
  if (r.error) { setFieldErr('cmdTestChatId', r.error + ' — try again.'); return; }
  toast('Test message sent');
}

let __bcAudience = null;
const BC_DRAFT_KEY = 'yr_bc_draft';
function buildSegmentFromForm(){
  const segment = {};
  const lang = ($('bcLang')?.value || '').trim();
  const minLast = Number($('bcMinLastSeen')?.value || '0');
  const firstSeen = Number($('bcFirstSeen')?.value || '0');
  const username = ($('bcUsername')?.value || '').trim();
  if (lang) segment.language = lang;
  if (minLast > 0) segment.minLastSeenDays = minLast;
  if (firstSeen > 0) segment.firstSeenWithinDays = firstSeen;
  if (username) segment.usernameContains = username;
  return Object.keys(segment).length ? segment : null;
}
function getScheduledAt(){
  const v = ($('bcSchedule')?.value || '').trim();
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
function isScheduleSelected(){
  const when = document.querySelector('input[name="bcWhen"]:checked');
  return when?.value === 'schedule';
}
function formatSegmentLabel(segment){
  if (!segment) return '';
  const parts = [];
  if (segment.language) parts.push(segment.language);
  if (segment.minLastSeenDays) parts.push('active '+segment.minLastSeenDays+'d');
  if (segment.firstSeenWithinDays) parts.push('new '+segment.firstSeenWithinDays+'d');
  if (segment.usernameContains) parts.push('@'+segment.usernameContains);
  return parts.join(', ');
}
function getBotNameForBroadcast(){
  const botId = $('bcBotSelect')?.value || firstBotId;
  const select = $('bcBotSelect');
  if (!select || !botId) return '';
  const opt = Array.from(select.options).find(o => o.value === botId);
  return opt?.text || botId;
}
function saveBroadcastDraft(){
  try {
    const draft = {
      body: ($('bcBody')?.value || ''),
      image: ($('bcImage')?.value || ''),
      botId: ($('bcBotSelect')?.value || firstBotId || ''),
      lang: ($('bcLang')?.value || ''),
      minLast: ($('bcMinLastSeen')?.value || ''),
      firstSeen: ($('bcFirstSeen')?.value || ''),
      username: ($('bcUsername')?.value || ''),
      when: (document.querySelector('input[name="bcWhen"]:checked'))?.value || 'now',
      schedule: ($('bcSchedule')?.value || ''),
      testChat: ($('bcTestChat')?.value || ''),
    };
    localStorage.setItem(BC_DRAFT_KEY, JSON.stringify(draft));
  } catch { /* storage may be unavailable */ }
}
function loadBroadcastDraft(){
  try {
    const raw = localStorage.getItem(BC_DRAFT_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return false;
    if (d.botId && $('bcBotSelect')) ($('bcBotSelect')).value = d.botId;
    if ($('bcBody')) ($('bcBody')).value = d.body || '';
    if ($('bcImage')) ($('bcImage')).value = d.image || '';
    if ($('bcLang')) ($('bcLang')).value = d.lang || '';
    if ($('bcMinLastSeen')) ($('bcMinLastSeen')).value = d.minLast || '';
    if ($('bcFirstSeen')) ($('bcFirstSeen')).value = d.firstSeen || '';
    if ($('bcUsername')) ($('bcUsername')).value = d.username || '';
    if (d.when === 'schedule') {
      const radio = document.querySelector('input[name="bcWhen"][value="schedule"]');
      if (radio) radio.checked = true;
    }
    if ($('bcSchedule')) ($('bcSchedule')).value = d.schedule || '';
    if ($('bcTestChat')) ($('bcTestChat')).value = d.testChat || '';
    const status = $('bcDraftStatus');
    if (status) status.hidden = false;
    return true;
  } catch { return false; }
}
function clearBroadcastDraft(){
  try { localStorage.removeItem(BC_DRAFT_KEY); } catch {}
  const status = $('bcDraftStatus'); if (status) status.hidden = true;
}
function clearBroadcastForm(){
  if ($('bcBody')) ($('bcBody')).value = '';
  if ($('bcImage')) ($('bcImage')).value = '';
  if ($('bcSchedule')) ($('bcSchedule')).value = '';
  if ($('bcUsername')) ($('bcUsername')).value = '';
  if ($('bcMinLastSeen')) ($('bcMinLastSeen')).value = '';
  if ($('bcFirstSeen')) ($('bcFirstSeen')).value = '';
  if ($('bcLang')) ($('bcLang')).value = '';
  const nowRadio = document.querySelector('input[name="bcWhen"][value="now"]');
  if (nowRadio) nowRadio.checked = true;
  updateScheduleInputState();
  clearBroadcastDraft();
}
function updateScheduleInputState(){
  const selected = isScheduleSelected();
  const input = $('bcSchedule');
  if (input) input.disabled = !selected;
  updateUtcHint();
}
function updateUtcHint(){
  const v = getScheduledAt();
  const hint = $('bcUtcHint');
  if (!hint) return;
  if (v) {
    hint.hidden = false;
    hint.querySelector('b')!.textContent = new Date(v).toISOString();
  } else {
    hint.hidden = true;
  }
}
function showTimezone(){
  const el = $('bcTimezone');
  if (!el) return;
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const m = String(Math.abs(offset) % 60).padStart(2, '0');
  el.innerHTML = 'Your timezone: <b>'+esc(name)+' (UTC'+sign+h+':'+m+')</b>';
}
// Show how many subscribers the selected bot would reach, so the streamer
// knows the blast size before committing.
async function updateAudience(){
  const el = $('bcAudience');
  if (!el) return;
  const botId = $('bcBotSelect')?.value || firstBotId;
  if (!botId) { __bcAudience = null; el.innerHTML = 'Select a bot to see how many subscribers it will reach.'; return; }
  const segment = buildSegmentFromForm();
  const qs = '/broadcasts/audience?bot_id='+encodeURIComponent(botId)+(segment ? '&segment='+encodeURIComponent(JSON.stringify(segment)) : '');
  const r = await api(qs);
  if (!r || r.error) { __bcAudience = null; return; }
  __bcAudience = r.count;
  const label = formatSegmentLabel(segment);
  el.innerHTML = 'This'+(label?' <span class="muted">('+esc(label)+')</span>':'')+' will send to <b>'+esc(String(r.count))+'</b> subscriber'+(r.count===1?'':'s')+'.';
}
function buildSummaryHtml(){
  const body = ($('bcBody')?.value || '').trim();
  const botName = getBotNameForBroadcast();
  const segment = buildSegmentFromForm();
  const segLabel = formatSegmentLabel(segment) || 'all subscribers';
  const scheduled = getScheduledAt();
  const when = isScheduleSelected() && scheduled ? new Date(scheduled).toLocaleString(undefined, {dateStyle:'medium', timeStyle:'short'}) : 'now';
  let html = '';
  html += '<li><b>Bot:</b> '+esc(botName || '—')+'</li>';
  html += '<li><b>Audience:</b> '+esc(segLabel)+' ('+esc(String(__bcAudience ?? '–'))+' subscribers)</li>';
  html += '<li><b>When:</b> '+esc(when)+'</li>';
  html += '<li><b>Message:</b> '+esc(body.slice(0,120))+(body.length>120?'…':'')+'</li>';
  const image = ($('bcImage')?.value || '').trim();
  if (image) html += '<li><b>Image:</b> '+esc(image)+'</li>';
  return html;
}
let bcPreviewFocusTrap = null;
function openBroadcastPreview(){
  clearFieldErr('bcBody'); clearFieldErr('bcBotSelect'); clearFormStatus('bcFormStatus');
  const body = ($('bcBody')?.value || '').trim();
  if (!body) { setFieldErr('bcBody','Write a message first'); setFormStatus('bcFormStatus','Write a message first',true); return; }
  const botId = ($('bcBotSelect')?.value || '').trim() || firstBotId;
  if (!botId) { setFieldErr('bcBotSelect','Select a bot first'); setFormStatus('bcFormStatus','Select a bot first',true); return; }
  const n = __bcAudience;
  if (typeof n === 'number' && n === 0) { setFormStatus('bcFormStatus','This segment has no subscribers yet — nobody would receive it.',true); return; }
  const countEl = $('bcPreviewCount');
  const bodyEl = $('bcPreviewBody');
  if (countEl) countEl.innerHTML = esc(String(n ?? '–'));
  if (bodyEl) bodyEl.innerHTML = esc(body).split('{name}').join('<b>{name}</b>');
  const img = ($('bcImage')?.value || '').trim();
  const imgEl = $('bcPreviewImg');
  if (imgEl) {
    imgEl.innerHTML = img ? '<img src="'+esc(img)+'" alt="" />' : '';
    (imgEl).hidden = !img;
  }
  const summaryList = $('bcSummaryList');
  if (summaryList) summaryList.innerHTML = buildSummaryHtml();
  const summary = $('bcSummary'); if (summary) summary.hidden = false;
  const confirmBtn = $('bcConfirmBtn');
  if (confirmBtn) confirmBtn.textContent = isScheduleSelected() ? 'Schedule' : 'Send now';
  const preview = $('bcPreview'); if (preview) preview.hidden = false;
  const card = preview?.querySelector('.bc-preview-card');
  const firstBtn = card?.querySelector('button');
  if (firstBtn) firstBtn.focus();
  bcPreviewFocusTrap = { handler: function(e){
    if (e.key === 'Escape') { e.preventDefault(); closeBroadcastPreview(); return; }
    if (e.key !== 'Tab' || !card) return;
    const focusable = Array.from(card.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && (el).offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, trigger: document.activeElement };
  document.addEventListener('keydown', bcPreviewFocusTrap.handler);
}
function closeBroadcastPreview(){
  const preview = $('bcPreview'); if (preview) preview.hidden = true;
  if (bcPreviewFocusTrap) { document.removeEventListener('keydown', bcPreviewFocusTrap.handler); bcPreviewFocusTrap.trigger && (bcPreviewFocusTrap.trigger).focus(); bcPreviewFocusTrap = null; }
}
async function confirmSendBroadcast(btn){
  const body = ($('bcBody')?.value || '').trim();
  const botId = ($('bcBotSelect')?.value || '').trim() || firstBotId;
  if (!botId || !body) return;
  setLoading(btn, 'Sending…');
  clearFormStatus('bcFormStatus');
  const mediaUrl = ($('bcImage')?.value || '').trim() || null;
  const scheduledAt = isScheduleSelected() ? getScheduledAt() : null;
  const segment = buildSegmentFromForm();
  const r = await api('/broadcasts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bot_id:botId, body, media_url: mediaUrl, scheduled_at: scheduledAt, segment})});
  if (r.error) { restoreBtn(btn); setFormStatus('bcFormStatus', r.error + ' — click Send again to retry.', true); return; }
  clearBroadcastForm(); closeBroadcastPreview(); setFormStatus('bcFormStatus', isScheduleSelected() ? 'Broadcast scheduled' : 'Broadcast sent', false); restoreBtn(btn); loadExtras();
}
async function sendBroadcast(btn){ openBroadcastPreview(); }
// Send a single test copy of the broadcast to one chat ID before blasting.
async function testBroadcast(btn){
  clearFieldErr('bcBody'); clearFieldErr('bcBotSelect'); clearFieldErr('bcTestChat'); clearFormStatus('bcFormStatus');
  const body = $('bcBody').value.trim();
  if (!body) { setFieldErr('bcBody','Write a message first'); setFormStatus('bcFormStatus','Write a message first',true); return; }
  const botId = $('bcBotSelect')?.value || firstBotId;
  if (!botId) { setFieldErr('bcBotSelect','Select a bot first'); setFormStatus('bcFormStatus','Select a bot first',true); return; }
  const chatId = Number(($('bcTestChat')?.value || '').trim());
  if (!chatId || isNaN(chatId)) { setFieldErr('bcTestChat','Enter a valid numeric chat ID'); setFormStatus('bcFormStatus','Enter a valid chat ID',true); return; }
  setLoading(btn, 'Sending…');
  const imageUrl = ($('bcImage')?.value || '').trim() || null;
  const r = await api('/bots/'+botId+'/test-message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId, text:body, image_url: imageUrl})});
  restoreBtn(btn);
  if (r.error) { setFormStatus('bcFormStatus', r.error + ' — click Send test again to retry.', true); return; }
  setFormStatus('bcFormStatus','Test sent — check that chat', false);
}
async function cancelBroadcast(btn){
  if (!await confirmModal('Cancel broadcast', 'Cancel this scheduled broadcast?', 'Cancel broadcast', true)) return;
  setLoading(btn, 'Cancelling…');
  const r = await api('/broadcasts/'+btn.dataset.id,{method:'DELETE'});
  if (r.error) { restoreBtn(btn); return toast(r.error); }
  toast('Broadcast cancelled'); restoreBtn(btn); loadExtras();
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
  if (submitting && action !== 'copyLink') return;
  submitting = true;
  // Show a loading state on the clicked control for every network-backed action.
  // Pure client-side actions (copy, local bot selection) don't need it.
  const NO_LOADING = action === 'copyLink' || action === 'selectBot'
    || action === 'testMessage' || action === 'cancelTestMessage'
    || action === 'sendBroadcast' || action === 'openBroadcastPreview' || action === 'closeBroadcastPreview'
    || action === 'viewCommand' || action === 'closeCommandPreview'
    || action === 'wizardNext' || action === 'wizardPrev';
  if (!NO_LOADING) setLoading(target);
  try {
    if (action === 'logout') { e.preventDefault(); await logout(target); }
    else if (action === 'connectBot') { e.preventDefault(); await connectBot(target); }
    else if (action === 'checkHealth') { e.preventDefault(); await checkHealth(target); }
    else if (action === 'syncCommands') { e.preventDefault(); await syncCommands(target); }
    else if (action === 'disconnectBot') { e.preventDefault(); await disconnectBot(target); }
    else if (action === 'reconnectBot') { e.preventDefault(); await reconnectBot(target); }
    else if (action === 'deleteBot') { e.preventDefault(); await deleteBot(target); }
    else if (action === 'testMessage') { e.preventDefault(); testMessage(target); }
    else if (action === 'sendTestMessage') { e.preventDefault(); await sendTestMessage(target); }
    else if (action === 'cancelTestMessage') { e.preventDefault(); cancelTestMessage(); }
    else if (action === 'selectBot') { e.preventDefault(); selectBotById(target.dataset.id); }
    else if (action === 'wizardNext') { e.preventDefault(); wizardNext(target); }
    else if (action === 'wizardPrev') { e.preventDefault(); wizardPrev(target); }
    else if (action === 'createOffer') { e.preventDefault(); await createOffer(target); }
    else if (action === 'addCommand') { e.preventDefault(); await addCommand(target); }
    else if (action === 'addCommandButton') { e.preventDefault(); addCommandButton(target); }
    else if (action === 'removeCommandButton') { e.preventDefault(); removeCommandButton(target); }
    else if (action === 'saveWelcome') { e.preventDefault(); await saveWelcome(target); }
    else if (action === 'sendBroadcast') { e.preventDefault(); openBroadcastPreview(); }
    else if (action === 'openBroadcastPreview') { e.preventDefault(); openBroadcastPreview(); }
    else if (action === 'confirmBroadcast') { e.preventDefault(); await confirmSendBroadcast(target); }
    else if (action === 'closeBroadcastPreview') { e.preventDefault(); closeBroadcastPreview(); }
    else if (action === 'testBroadcast') { e.preventDefault(); await testBroadcast(target); }
    else if (action === 'cancelBroadcast') { e.preventDefault(); await cancelBroadcast(target); }
    else if (action === 'copyLink') { e.preventDefault(); await copyLink(target); }
    else if (action === 'toggleOffer') { e.preventDefault(); await toggleOffer(target); }
    else if (action === 'toggleCommand') { e.preventDefault(); await toggleCommand(target); }
    else if (action === 'deleteCommand') { e.preventDefault(); await deleteCommand(target); }
    else if (action === 'viewCommand') { e.preventDefault(); openCommandPreview(target.dataset.id); }
    else if (action === 'closeCommandPreview') { e.preventDefault(); closeCommandPreview(); }
    else if (action === 'testCommand') { e.preventDefault(); await testCommand(target); }
  } catch (err) {
    console.error('[dashboard action]', action, err);
    toast('Something went wrong — please reload');
  } finally {
    submitting = false;
    restoreBtn(target);
  }
}

document.addEventListener('click', handleAction);
// Mobile sidebar drawer: toggle with the hamburger, close when tapping outside, trap focus.
const menuBtn = $('menuBtn');
const side = $('side');
if (menuBtn && side) {
  menuBtn.setAttribute('aria-expanded', String(side.classList.contains('open')));
  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); side.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(side.classList.contains('open'))); });
  document.addEventListener('click', (e) => {
    if (side.classList.contains('open') && !side.contains(e.target) && e.target !== menuBtn) { side.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('keydown', (e) => {
    if (!side.classList.contains('open')) return;
    if (e.key === 'Escape') { side.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); menuBtn.focus(); return; }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(side.querySelectorAll('a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
const logoutForm = document.querySelector('.gm-logout-form');
if (logoutForm) {
  logoutForm.addEventListener('submit', (e) => { e.preventDefault(); logout(e.submitter); });
}
const botSelect = $('botSelect');
if (botSelect) botSelect.addEventListener('change', (e) => { selectBotById(e.target.value); });
const bcBotSelect = $('bcBotSelect');
if (bcBotSelect) bcBotSelect.addEventListener('change', (e) => { firstBotId = e.target.value; saveBroadcastDraft(); updateAudience(); });
const bcTestChat = $('bcTestChat');
if (bcTestChat) bcTestChat.addEventListener('input', saveBroadcastDraft);
['bcLang','bcMinLastSeen','bcFirstSeen','bcUsername'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', () => { saveBroadcastDraft(); updateAudience(); });
});
['bcBody','bcImage','bcSchedule'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', saveBroadcastDraft);
});
document.querySelectorAll('input[name="bcWhen"]').forEach(radio => {
  radio.addEventListener('change', () => { updateScheduleInputState(); saveBroadcastDraft(); });
});
window.addEventListener('beforeunload', (e) => {
  const body = ($('bcBody')?.value || '').trim();
  if (!body) return;
  e.preventDefault();
  e.returnValue = '';
});
['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', updateOfferPreview);
});
showTimezone();

window.addEventListener('error', () => {
  const bl = $('botList'); if (bl) bl.textContent = 'Something went wrong. Please reload the page.';
});
window.addEventListener('unhandledrejection', () => {
  const bl = $('botList'); if (bl) bl.textContent = 'Something went wrong. Please reload the page.';
});

`;
}

export function dashClientScript(): string {
  return `<script src="/bot/dash/client.js"></script>`;
}
