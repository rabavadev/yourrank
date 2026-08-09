import { escHtml } from "./utils.js";

const GOOGLE_FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />';

const STYLE_ATTR_CSS = `
/* ---- inline style migration (M-02) ---- */
.hidden { display: none !important; }
.sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0); }
.skip-link { position:absolute;left:8px;top:8px;z-index:100;background:var(--yr-bg);color:var(--yr-ink);padding:10px 14px;border:1px solid var(--yr-line-2);border-radius:10px;text-decoration:none;transform:translateY(-200%);transition:transform .15s; }
.skip-link:focus { transform:translateY(0);outline:2px solid var(--yr-accent); }
.style-1 { margin-bottom:8px }
.style-2 { margin-bottom:20px }
.style-3 { margin-top:24px;border-top:1px solid var(--yr-line);padding-top:16px }
`;

export function loginHtml(botUsername: string, devLogin: boolean, nonce?: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>YourRank Bot — Login</title>
  ${GOOGLE_FONTS}
  <style${nonce ? ` nonce="${nonce}"` : ""}>
  ${STYLE_ATTR_CSS}
  :root { --yr-bg:#f8f9fb; --yr-panel:#ffffff; --yr-panel-2:#f4f5f8; --yr-line:#e9eaef; --yr-line-2:#dcdee6;
          --yr-ink:#111114; --yr-ink-soft:#4e4f57; --yr-ink-mute:#8b8d98;
          --yr-accent:#4f46e5; --yr-accent-ink:#ffffff; --yr-green:#1e8e3e; --yr-red:#d93025;
          --yr-radius:14px; --yr-shadow:0 1px 3px rgba(0,0,0,.05),0 1px 2px rgba(0,0,0,.03);
          --yr-sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          --yr-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--yr-bg); color:var(--yr-ink); font:15px/1.5 var(--yr-sans); display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
  .card { width:100%; max-width:420px; background:var(--yr-panel); border:1px solid var(--yr-line); border-radius:var(--yr-radius); box-shadow:var(--yr-shadow); padding:32px; text-align:center; }
  .brand { font-weight:800; letter-spacing:-0.03em; font-size:22px; margin-bottom:8px; }
  .brand b { color:var(--yr-accent); }
  .muted { color:var(--yr-ink-soft); font-size:14px; margin-bottom:22px; }
  .divider { height:1px; background:var(--yr-line); border:0; margin:22px 0; }
  input { width:100%; background:var(--yr-panel); color:var(--yr-ink); border:1px solid var(--yr-line-2); border-radius:10px; padding:12px 14px; margin-bottom:12px; font:inherit; }
  input:focus { outline:2px solid var(--yr-accent); }
  button { width:100%; background:var(--yr-accent); color:var(--yr-accent-ink); border:0; border-radius:10px; padding:12px 18px; font:600 14px/1 inherit; cursor:pointer; }
  button:disabled { opacity:0.6; cursor:not-allowed; }
  button.ghost { background:var(--yr-panel-2); color:var(--yr-ink); border:1px solid var(--yr-line-2); margin-top:8px; }
  button.ghost:hover { background:var(--yr-line); }
  .err { color:var(--yr-red); margin-top:12px; font-size:13px; }
  .tg-placeholder { color:var(--yr-ink-mute); font-size:13px; margin-bottom:18px; }
  </style></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<main class="card" id="main-content">
  <h1 class="brand">Your<b>Rank</b> Bot</h1>
  <p class="muted">Manage your Telegram bot, offers, and click stats.</p>
  ${botUsername
    ? `<script${nonce ? ` nonce="${nonce}"` : ""} async src="https://telegram.org/js/telegram-widget.js?22"
         data-telegram-login="${escHtml(botUsername)}" data-size="large"
         data-onauth="onTgAuth" data-request-access="write"></script>`
    : `<p class="tg-placeholder">Telegram login is not configured yet (set LOGIN_BOT_TOKEN + LOGIN_BOT_USERNAME).</p>`}
  ${devLogin ? `
  <hr class="divider" />
  <p class="muted style-1">Dev login</p>
  <label class="sr-only" for="devid">Telegram User ID</label>
  <input id="devid" type="number" placeholder="Telegram user id">
  <button data-action="devLogin" type="button">Enter</button>` : ""}
  <p id="loginMsg" class="err" role="alert" aria-live="assertive" hidden></p>
</main>
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
