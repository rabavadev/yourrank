// Public viewer credits/shop page. Lightweight HTML with inline JS.
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function renderPublicCreditsPage({ slug, nonce, homeUrl }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Viewer Credits · ${esc(slug)}</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="stylesheet" href="/assets/app.css" />
<style>
  .pc-wrap{max-width:760px;margin:32px auto;padding:0 18px;}
  .pc-hero{text-align:center;margin-bottom:28px;}
  .pc-hero h1{font-size:1.8rem;margin-bottom:8px;}
  .pc-hero p{color:var(--ink-mute,#8b949e);}
  .pc-card{background:var(--panel,#0f0f11);border:1px solid var(--line,#232327);border-radius:12px;padding:20px;margin-bottom:18px;}
  .pc-card h2{font-size:1.1rem;margin-bottom:12px;}
  .pc-balance{font-size:2rem;font-weight:700;color:var(--accent,#2200ff);}
  .pc-grid{display:grid;gap:14px;}
  .pc-item{display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--line);border-radius:8px;}
  .pc-item-info{flex:1;}
  .pc-item-name{font-weight:600;}
  .pc-item-desc{font-size:13px;color:var(--ink-mute);}
  .pc-item-cost{font-weight:700;}
</style>
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="gm-shell-nav"><div class="gm-shell-inner">
  <a class="gm-brand" href="${esc(homeUrl)}"><span class="gm-brand-mark">YR</span><span class="gm-brand-word">YourRank</span></a>
</div></header>
<main class="pc-wrap" id="main-content">
  <div class="pc-hero">
    <h1>Channel points shop</h1>
    <p>Enter your Kick username to see your balance and redeem items.</p>
  </div>

  <section class="pc-card">
    <form id="pc-lookup" class="field" style="margin-bottom:0">
      <label for="pc-username">Kick username</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <input id="pc-username" type="text" style="flex:1;min-width:220px" placeholder="your_kick_username" required />
        <button class="btn btn--accent" type="submit">Look up</button>
      </div>
    </form>
    <p class="status" id="pc-status" role="status" aria-live="polite"></p>
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
  <span class="gm-shell-footer-copy">© ${new Date().getFullYear()} YourRank</span>
</div></footer>
<script nonce="${esc(nonce)}">
(function(){
  const slug = ${JSON.stringify(slug)};
  let viewer = null;
  let viewerToken = null;

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s??"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function setStatus(msg, err){ const el=$("pc-status"); el.textContent=msg; el.className=err?"status error":"status"; }

  async function api(method, path, body){
    const opts={method,credentials:"same-origin",headers:{}};
    if(body){ opts.headers["content-type"]="application/json"; opts.body=JSON.stringify(body); }
    const res=await fetch(path,opts);
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  $("pc-lookup").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const username=$("pc-username").value.trim();
    if(!username) return;
    try{
      const data=await api("GET","/api/public/credits?"+new URLSearchParams({slug,kickUsername:username}).toString());
      viewer=data.viewer;
      viewerToken=viewer ? viewer.publicToken || null : null;
      if(!viewer){
        setStatus("No credits found for that username yet. Earn some by redeeming Kick channel rewards.",true);
        $("pc-balance-card").hidden=true;
        $("pc-shop-card").hidden=true;
        return;
      }
      $("pc-balance").textContent=viewer.balance;
      $("pc-balance-sub").textContent=viewer.kick_username ? "Hello, "+viewer.kick_username : "";
      $("pc-balance-card").hidden=false;
      renderShop(data.shopItems, username);
      setStatus("");
    }catch(err){ setStatus(err.message,true); }
  });

  function renderShop(items, username){
    const list=$("pc-shop-list");
    list.innerHTML="";
    const active=(items||[]).filter(i=>i.active!==false);
    $("pc-shop-empty").hidden=active.length>0;
    $("pc-shop-card").hidden=active.length===0;
    for(const item of active){
      const div=document.createElement("div");
      div.className="pc-item";
      const canBuy=viewer && viewer.balance>=item.cost && (item.stock===null || item.stock>0);
      div.innerHTML='<div class="pc-item-info"><div class="pc-item-name">'+esc(item.name)+'</div><div class="pc-item-desc">'+esc(item.description||"")+'</div></div>'+
        '<div style="text-align:right"><div class="pc-item-cost">'+item.cost+' credits</div>'+
        (item.stock!==null ? '<div class="hint">Stock: '+item.stock+'</div>':'')+
        '<button class="btn btn--sm" '+(canBuy?'':'disabled')+' data-redeem="'+esc(item.id)+'">Redeem</button></div>';
      list.appendChild(div);
    }
    list.querySelectorAll("[data-redeem]").forEach((b)=>{
      b.addEventListener("click", async ()=>{
        if(!confirm("Spend "+itemById(active,b.dataset.redeem).cost+" credits on this item?")) return;
        try{
          const data=await api("POST","/api/public/redeem",{slug,kickUsername:username,shopItemId:b.dataset.redeem,publicToken:viewerToken});
          viewer.balance=data.balance;
          $("pc-balance").textContent=data.balance;
          setStatus("Redemption requested! The streamer will fulfill it off-platform.",false);
          $("pc-lookup").dispatchEvent(new Event("submit"));
        }catch(err){ setStatus(err.message,true); }
      });
    });
  }

  function itemById(items,id){ return items.find(i=>i.id===id); }
})();
</script>
</body></html>`;
}
