import { escHtml } from "./utils.js";

const GOOGLE_FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />';

const STYLE_ATTR_CSS = `
.hidden { display: none !important; }
.sr-only { position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0); }
.skip-link { position:absolute;left:8px;top:8px;z-index:100;background:var(--yr-bg);color:var(--yr-ink);padding:10px 14px;border:1px solid var(--yr-line-2);border-radius:2px;text-decoration:none;transform:translateY(-200%);transition:transform .15s; }
.skip-link:focus { transform:translateY(0);outline:2px solid var(--yr-accent); }
.dev-login-label { margin-bottom:8px }
`;

export function loginHtml(botUsername: string, devLogin: boolean, nonce?: string): string {
  return `<!doctype html><html lang="en" data-identity="devin-reference"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>YourRank Bot — Login</title>
  ${GOOGLE_FONTS}
  <style${nonce ? ` nonce="${nonce}"` : ""}>
  ${STYLE_ATTR_CSS}
  :root { --yr-bg:#ffffff; --yr-panel:#fcfcfc; --yr-panel-2:#efefef; --yr-line:rgba(0,0,0,.08); --yr-line-2:rgba(0,0,0,.15);
          --yr-ink:#191919; --yr-ink-soft:#5c5c5c; --yr-ink-mute:#6b6b6b;
          --yr-accent:#2200ff; --yr-accent-hover:#1b00cc; --yr-accent-ink:#ffffff; --yr-green:#167a55; --yr-red:#b42318;
          --yr-radius:16px; --yr-control-radius:2px; --yr-shadow:none;
          --yr-sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          --yr-mono:"IBM Plex Mono","JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--yr-bg); color:var(--yr-ink); font:15px/1.5 var(--yr-sans); display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
  .card { width:100%; max-width:420px; background:var(--yr-panel); border:1px solid var(--yr-line); border-radius:var(--yr-radius); box-shadow:var(--yr-shadow); padding:32px; text-align:center; }
  .brand { font-weight:600; letter-spacing:-0.03em; font-size:22px; margin-bottom:8px; }
  .brand b { color:inherit; }
  .muted { color:var(--yr-ink-soft); font-size:14px; margin-bottom:22px; }
  .divider { height:1px; background:var(--yr-line); border:0; margin:22px 0; }
  input { width:100%; min-height:44px; background:var(--yr-bg); color:var(--yr-ink); border:1px solid var(--yr-line-2); border-radius:var(--yr-control-radius); padding:12px 14px; margin-bottom:12px; font:inherit; }
  input:focus { outline:2px solid var(--yr-accent); }
  button { width:100%; min-height:44px; background:var(--yr-accent); color:var(--yr-accent-ink); border:0; border-radius:var(--yr-control-radius); padding:12px 18px; font:600 14px/1 inherit; cursor:pointer; }
  button:hover { background:var(--yr-accent-hover); }
  button:disabled { opacity:0.6; cursor:not-allowed; }
  button.ghost { background:var(--yr-panel-2); color:var(--yr-ink); border:1px solid var(--yr-line-2); margin-top:8px; }
  button.ghost:hover { background:var(--yr-line); }
  .err { color:var(--yr-red); margin-top:12px; font-size:13px; }
  .tg-placeholder { color:var(--yr-ink-mute); font-size:13px; margin-bottom:18px; }
  </style></head><body>
<!--
THESIS: Telegram entry is a calm, trustworthy handoff into the shared YourRank operating system.
OWN-WORLD: Quiet near-white fields, black type, violet action, hairline borders, and restrained geometry.
STORY: The operator identifies the Telegram connection method and enters the workspace without distraction.
FIRST VIEWPORT: One centered authentication card contains the brand, purpose, primary login action, and live error state.
FORM: Devin-reference authentication surface, seed 562938e8; YourRank and Telegram identity remain original.
FINISH: The entry surface is reviewed at desktop and mobile, documented in DESIGN.md, and held to the shared accessibility and responsive floor.
-->
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
  <p class="muted dev-login-label">Dev login</p>
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
// The API returns machine strings ("bad telegram signature"); people logging
// in should get a sentence they can act on instead.
const LOGIN_ERRORS = {
  'rate limit exceeded': 'Too many attempts. Wait a minute and try again.',
  'cross-origin request rejected': 'Something went wrong. Refresh the page and try again.',
  'telegram login not configured': 'Telegram login is temporarily unavailable. Try again later.',
  'bad telegram signature': 'We could not verify that Telegram login. Try again.',
  'account suspended': 'This account is suspended. Contact support if you think this is a mistake.',
};
async function onTgAuth(user) {
  const r = await fetch('/bot/auth/telegram', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(user)});
  if (r.ok) { location.reload(); return; }
  let msg = 'Login failed. Try again.';
  try { msg = LOGIN_ERRORS[(await r.json()).error] || msg; } catch { /* non-JSON response */ }
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
