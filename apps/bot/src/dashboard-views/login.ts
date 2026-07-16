import { escHtml } from "./utils.js";

const STYLE_ATTR_CSS = `
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

export function loginHtml(botUsername: string, devLogin: boolean, nonce?: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>YourRank Bot — Login</title>
  <style${nonce ? ` nonce="${nonce}"` : ""}>
  ${STYLE_ATTR_CSS}
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
  .err { color:#f85149; margin-top:12px; }
  </style></head><body>
<div class="center"><div class="panel card" id="main-content">
  <h1 class="style-1">🎰 Streamer Dashboard</h1>
  <p class="muted style-2">Manage your bot, offers and click stats.</p>
  ${botUsername
    ? `<script${nonce ? ` nonce="${nonce}"` : ""} async src="https://telegram.org/js/telegram-widget.js?22"
         data-telegram-login="${escHtml(botUsername)}" data-size="large"
         data-onauth="onTgAuth" data-request-access="write"></script>`
    : `<p class="muted">Telegram login isn't configured yet (set LOGIN_BOT_TOKEN + LOGIN_BOT_USERNAME).</p>`}
  ${devLogin ? `
  <div class="style-3">
    <p class="muted style-1">Dev login</p>
    <label class="sr-only" for="devid">Telegram User ID</label>
    <input id="devid" type="number" placeholder="Telegram user id">
    <button data-action="devLogin" type="button">Enter</button>
  </div>` : ""}
  <p id="loginMsg" class="err" role="alert" aria-live="assertive" hidden></p>
</div></div>
<script${nonce ? ` nonce="${nonce}"` : ""}>
function showLoginError(msg) {
  const el = document.getElementById('loginMsg');
  if (el) { el.textContent = msg; el.hidden = false; }
}
async function onTgAuth(user) {
  const r = await fetch('/bot/auth/telegram', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(user)});
  if (r.ok) { location.reload(); return; }
  let msg = 'Login failed.';
  try { msg = 'Login failed: ' + (await r.json()).error; } catch { /* non-JSON response */ }
  showLoginError(msg);
}
window.onTgAuth = onTgAuth;
async function devLogin(btn) {
  const id = Number(document.getElementById('devid').value);
  if (!id) return;
  if (btn) { btn.disabled = true; btn.textContent = 'Entering…'; }
  const r = await fetch('/bot/auth/dev', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({telegram_user_id:id})});
  if (r.ok) { location.reload(); return; }
  showLoginError('Login failed. Check the ID and try again.');
  if (btn) { btn.disabled = false; btn.textContent = 'Enter'; }
}
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'devLogin') { e.preventDefault(); devLogin(target); }
});
</script></body></html>`;
}
