// overlay page
export const overlayPage = (data, opts = {}) => {
  const b = data.brand || {};
  const br = data.branding || {};
  const players = (data.players || []).slice().sort((a, c) => c.wagered - a.wagered).slice(0, 5);
  const endsAt = data.endsAt || null;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return "$" + (n || 0).toLocaleString("en-US");
  };
  const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
  const rows = players.map((p, i) => `<div class="ov-row" data-name="${esc(p.name)}"><span class="ov-medal">${medal(i)}</span><span class="ov-name">${esc(p.name)}</span><span class="ov-wager">${fmt(p.wagered)}</span></div>`).join("");
  const empty = 5 - players.length;
  const emptyRows = empty > 0 ? Array.from({ length: empty }, (_, i) => `<div class="ov-row ov-empty"><span class="ov-medal">#${players.length + i + 1}</span><span class="ov-name">—</span><span class="ov-wager">—</span></div>`).join("") : "";
  const accentA = (br.accentA && /^#[0-9a-fA-F]{6}$/.test(br.accentA)) ? br.accentA : "#c8ff00";
  const accentB = (br.accentB && /^#[0-9a-fA-F]{6}$/.test(br.accentB)) ? br.accentB : "#5ad9ff";
  const dataJson = JSON.stringify({ players, endsAt }).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(b.name)} — OBS Overlay</title>
<style nonce="${opts.nonce || ""}">
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:320px;overflow:hidden;background:transparent;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#fff}
.ov-wrap{width:320px;padding:14px 16px;background:rgba(8,8,12,0.92);border-radius:14px;border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.ov-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.ov-brand{display:flex;flex-direction:column;gap:1px}
.ov-brand-name{font-size:15px;font-weight:700;letter-spacing:-.02em;background:linear-gradient(135deg,${accentA},${accentB});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:none}
.ov-brand-sub{font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:.08em}
.ov-live{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${accentA}}
.ov-live-dot{width:7px;height:7px;border-radius:50%;background:${accentA};animation:ov-pulse 1.5s ease-in-out infinite}
@keyframes ov-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ov-timer{display:flex;align-items:center;justify-content:center;gap:3px;margin-bottom:12px;font-size:11px;color:rgba(255,255,255,0.5)}
.ov-timer b{font-family:'JetBrains Mono','Fira Code',monospace;font-size:13px;font-weight:700;color:${accentA};min-width:20px;text-align:center}
.ov-timer-sep{color:rgba(255,255,255,0.2);margin:0 1px}
.ov-timer-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:6px}
.ov-timer-over{font-size:11px;color:rgba(255,255,255,0.4);font-style:italic}
.ov-rows{display:flex;flex-direction:column;gap:4px}
.ov-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.04);transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s ease,background .3s ease}
.ov-row:first-child{background:linear-gradient(135deg,rgba(200,255,0,0.08),rgba(90,217,255,0.06));border-color:rgba(200,255,0,0.12)}
.ov-row.ov-empty{opacity:.25}
.ov-row.ov-enter{animation:ov-slideIn .5s cubic-bezier(.22,1,.36,1) both}
@keyframes ov-slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
.ov-row.ov-moved-up{border-left:2px solid ${accentA}}
.ov-row.ov-moved-down{border-left:2px solid rgba(255,80,80,0.6)}
.ov-medal{font-size:16px;min-width:24px;text-align:center;flex-shrink:0}
.ov-name{flex:1;font-size:13px;font-weight:600;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,0.5)}
.ov-wager{font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;font-weight:600;color:${accentA};flex-shrink:0;text-shadow:0 1px 3px rgba(0,0,0,0.5)}
.ov-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05)}
.ov-footer .ov-count{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.08em}
.ov-footer .ov-powered{font-size:8px;color:rgba(255,255,255,0.15);letter-spacing:.04em}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
</style>
</head><body>
<div class="ov-wrap">
<div class="ov-head">
<div class="ov-brand">
<span class="ov-brand-name">${esc(b.name)}</span>
<span class="ov-brand-sub">${esc(b.casino || "")}${b.casino && b.period ? " · " : ""}${esc(b.casino ? (b.period || "Monthly") : "")}</span>
</div>
<span class="ov-live"><span class="ov-live-dot"></span>LIVE</span>
</div>
${endsAt ? `<p class="ov-timer-label">${esc(b.prizePool || "")} resets in</p>
<div class="ov-timer" data-ov-timer>
<b data-ot>--</b><span class="ov-timer-sep">d</span>
<b data-ot>--</b><span class="ov-timer-sep">:</span>
<b data-ot>--</b><span class="ov-timer-sep">:</span>
<b data-ot>--</b>
</div>` : ""}
<div class="ov-rows" id="ov-players">${rows}${emptyRows}</div>
<div class="ov-sponsor" data-ov-sponsor style="display:none;font-size:9px;text-align:center;color:rgba(255,255,255,0.4);padding:6px 0;letter-spacing:.04em"></div>
<div class="ov-footer">
<span class="ov-count"><span id="ov-count">${(data.players || []).length}</span> players</span>
<span class="ov-powered">YourRank</span>
</div>
</div>
<div id="ov-config" data-slug="${esc(opts.slug || "")}" data-theme="${esc(opts.theme || 'default')}" data-sponsor="${esc(opts.sponsor || "")}" data-sponsor-url="${esc(opts.sponsorUrl || "")}" data-json='${dataJson.replace(/'/g, "&#39;")}' hidden></div>
<script src="/assets/overlay.js?v=3"></script>
</body></html>`;
};
