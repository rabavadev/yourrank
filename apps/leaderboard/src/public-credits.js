// Public viewer credits/shop page. Lightweight HTML with inline JS.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function renderPublicCreditsPage({ slug, nonce, homeUrl, kickAuthEnabled, discordAuthEnabled, publicRedeemEnabled }) {
  const returnTo = `/${slug}/credits`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Viewer Credits · ${esc(slug)}</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/ui.css" />
<style nonce="${esc(nonce)}">
  .pc-wrap{max-width:760px;margin:32px auto;padding:0 18px;}
  .pc-hero{text-align:center;margin-bottom:28px;}
  .pc-hero h1{font-size:1.8rem;margin-bottom:8px;}
  .pc-hero p{color:var(--ink-mute,#8b949e);}
  .pc-card{background:var(--panel,#0f0f11);border:1px solid var(--line,#232327);border-radius:12px;padding:20px;margin-bottom:18px;}
  .pc-card h2{font-size:1.1rem;margin-bottom:12px;}
  .pc-balance{font-size:2rem;font-weight:700;color:var(--accent,#53fc18);}
  .pc-grid{display:grid;gap:14px;}
  .pc-item{display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--line);border-radius:8px;}
  .pc-item-info{flex:1;}
  .pc-item-name{font-weight:600;}
  .pc-item-desc{font-size:13px;color:var(--ink-mute);}
  .pc-item-cost{font-weight:700;}
  .pc-item-actions{text-align:right;}
  .pc-login{display:flex;gap:8px;flex-wrap:wrap;}
  .pc-lookup{margin-bottom:0;}
  .pc-input-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}
  .pc-username-input{flex:1;min-width:220px;}
  #pc-loading{position:fixed;inset:0;background:rgba(15,15,17,.7);display:flex;align-items:center;justify-content:center;z-index:200;color:#fff}
  #pc-loading[hidden]{display:none!important}
  .pc-spinner{width:28px;height:28px;border:3px solid #333;border-top-color:#53fc18;border-radius:50%;animation:pc-spin 1s linear infinite}
  @keyframes pc-spin{to{transform:rotate(360deg)}}
  .pc-btn{position:relative}
  .pc-btn[aria-busy="true"]{opacity:.6;cursor:wait}
</style>
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="gm-shell-nav"><div class="gm-shell-inner">
  <a class="gm-brand" href="${esc(homeUrl)}"><span class="gm-brand-mark">YR</span><span class="gm-brand-word">YourRank</span></a>
</div></header>
<div id="pc-loading" hidden><div class="pc-spinner"></div></div>
<main class="pc-wrap" id="main-content">
  <div class="pc-hero">
    <h1>Channel points shop</h1>
    <p>Sign in with Kick to see your credits and redeem items. Credits are free loyalty points earned from channel-point redemptions — no purchase, no cash value, no cashout.</p>
  </div>

  <section class="pc-card" id="pc-login-card" hidden>
    <h2>Sign in</h2>
    <p class="card-sub">Sign in to see your credits across all boards and redeem faster.</p>
    <div class="pc-login">
      <a class="btn btn--accent" id="pc-login-kick" href="/api/viewer/auth/kick?returnTo=${encodeURIComponent(returnTo)}" hidden>Sign in with Kick</a>
      <a class="btn" id="pc-login-discord" href="/api/viewer/auth/discord?returnTo=${encodeURIComponent(returnTo)}" hidden>Sign in with Discord</a>
      <a class="btn" href="/me">My dashboard</a>
    </div>
  </section>

  <section class="pc-card" id="pc-balance-card" hidden>
    <h2>Your balance</h2>
    <div class="pc-balance" id="pc-balance">–</div>
    <p class="hint" id="pc-balance-sub"></p>
  </section>

  <section class="pc-card" id="pc-shop-card" hidden>
    <h2>Shop</h2>
    <div class="pc-grid" id="pc-shop-list"></div>
    <p class="empty" id="pc-shop-empty" hidden>No items available right now.</p>
  </section>
</main>
<footer class="gm-shell-footer"><div class="gm-shell-inner">
  <span class="gm-shell-footer-copy">© {{YEAR}} YourRank. Credits are free loyalty points earned from channel-point redemptions. No purchase, no cash value, no cashout.</span>
</div></footer>
<script nonce="${esc(nonce)}">
(function(){
  const slug = ${JSON.stringify(slug)};
  const auth = { kick: ${kickAuthEnabled ? 'true' : 'false'}, discord: ${discordAuthEnabled ? 'true' : 'false'}, public: ${publicRedeemEnabled ? 'true' : 'false'} };
  let viewer = null;
  let viewerSession = null;

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s??"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function setStatus(msg, err){ const el=$("pc-status"); el.textContent=msg; el.className=err?"status error":"status"; if(msg && !err) setTimeout(()=>{ el.textContent=""; }, 4000); }
  function setGlobalLoading(loading){ const el=$("pc-loading"); if(el) el.hidden=!loading; }

  async function api(method, path, body){
    const opts={method,credentials:"same-origin",headers:{}};
    if(body){ opts.headers["content-type"]="application/json"; opts.body=JSON.stringify(body); }
    const res=await fetch(path,opts);
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadSession(){
    try {
      const res = await fetch("/api/viewer/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.viewer) {
          viewerSession = data.viewer;
        }
      }
    } catch {}
  }

  async function loadCredits(){
    setGlobalLoading(true);
    try {
      const data = await api("GET", "/api/public/credits?" + new URLSearchParams({ slug }).toString());
      viewer = data.viewer || null;
      if (viewer) {
        $("pc-balance").textContent = viewer.balance;
        $("pc-balance-sub").textContent = viewer.kick_username
          ? "Hello, " + viewer.kick_username
          : (Number(viewer.balance) === 0 ? "You have 0 credits. Earn more by redeeming Kick channel-point rewards on this streamer's channel." : "");
        $("pc-balance-card").hidden = false;
      } else {
        $("pc-balance-card").hidden = true;
      }
      renderShop(data.shopItems || []);
    } catch (err) { setStatus(err.message, true); }
    finally { setGlobalLoading(false); }
  }

  async function init(){
    await loadSession();
    if (auth.kick || auth.discord) {
      $("pc-login-card").hidden = false;
      $("pc-login-kick").hidden = !auth.kick;
      $("pc-login-discord").hidden = !auth.discord;
    }
    await loadCredits();
  }
  init();

  function renderShop(items){
    const list=$("pc-shop-list");
    list.innerHTML="";
    const active=(items||[]).filter(i=>i.active!==false);
    $("pc-shop-empty").hidden=active.length>0;
    $("pc-shop-card").hidden=active.length===0;
    if (!auth.public && !viewer) {
      $("pc-shop-card").hidden = true;
      return;
    }
    for(const item of active){
      const div=document.createElement("div");
      div.className="pc-item";
      const canAfford=viewer && viewer.balance>=item.cost;
      const inStock=item.stock===null || item.stock>0;
      const signedIn=!!viewer;
      let buttonText;
      let buttonDisabled;
      if (!signedIn) {
        buttonText = "Sign in to redeem";
        buttonDisabled = false;
      } else if (!inStock) {
        buttonText = "Out of stock";
        buttonDisabled = true;
      } else if (!canAfford) {
        buttonText = "Need more credits";
        buttonDisabled = true;
      } else {
        buttonText = "Redeem in dashboard";
        buttonDisabled = false;
      }
      div.innerHTML='<div class="pc-item-info"><div class="pc-item-name">'+esc(item.name)+'</div><div class="pc-item-desc">'+esc(item.description||"")+'</div></div>'+
        '<div class="pc-item-actions"><div class="pc-item-cost">'+item.cost+' credits</div>'+
        (item.stock!==null ? '<div class="hint">Stock: '+item.stock+'</div>':'')+
        '<button class="btn btn--sm" data-redeem="'+esc(item.id)+'" '+(buttonDisabled ? 'disabled' : '')+'>'+buttonText+'</button></div>';
      list.appendChild(div);
    }
    list.querySelectorAll("[data-redeem]").forEach((b)=>{
      if (b.disabled) return;
      b.addEventListener("click", ()=>{ window.location.href="/me"; });
    });
  }

})();
</script>
</body></html>`;
}
