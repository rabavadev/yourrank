// @ts-nocheck
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function renderPasswordGate(site, opts, error = "") {
  const name = esc(site.name || "Private board");
  const slug = esc(site.slug || "");
  const action = opts.isCustomDomain ? "/password" : `/${slug}/password`;
  const nonce = esc(opts.nonce || "");
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${name} · Password required</title>
<link rel="stylesheet" href="/assets/site-shell.css" />
<style nonce="${nonce}">
.yr-gate-wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
.yr-gate-card{width:min(100%,440px);border:1px solid var(--yr-edge);background:var(--yr-panel);padding:32px}
.yr-gate-card h1{margin:0 0 8px;font-size:clamp(24px,5vw,36px)}
.yr-gate-card p{margin:0 0 24px;color:var(--yr-mute);line-height:1.6}
.yr-gate-card form{display:grid;gap:12px}
.yr-gate-card label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--yr-faint)}
.yr-gate-card input{min-height:44px;width:100%;border:1px solid var(--yr-edge);background:var(--yr-panel-2);color:var(--yr-ink);padding:10px 12px}
.yr-gate-card button{min-height:44px;border:0;background:var(--yr-accent);color:var(--yr-accent-ink);font-weight:700;cursor:pointer}
.yr-gate-error{margin:-4px 0 4px!important;color:#ff8f8f!important;font-size:13px}
</style></head>
<body class="yr-site">
<main class="yr-gate-wrap" id="main-content">
<section class="yr-gate-card" aria-labelledby="password-title">
<p class="yr-eyebrow"><i aria-hidden="true"></i>PRIVATE BOARD</p>
<h1 id="password-title">${name}</h1>
<p>This leaderboard is private. Enter the password to continue.</p>
<form method="POST" action="${action}">
${error ? `<p class="yr-gate-error" role="alert">${esc(error)}</p>` : ""}
<label for="board-password">Password</label>
<input id="board-password" name="password" type="password" placeholder="Password" required autocomplete="off" />
<button type="submit">Unlock</button>
</form>
</section>
</main>
</body></html>`;
}
