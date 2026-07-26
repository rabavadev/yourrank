// Onboarding setup wizard — extracted from inline <script> for CSP compliance.
(function(){
const slugify=(s)=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const $=id=>document.getElementById(id);
const origin=location.origin;
const TOTAL=3;
let step=1, slug="", siteId="";
const TEMPLATES=Array.isArray(window.__TEMPLATE_CATALOG__)?window.__TEMPLATE_CATALOG__:[];
// Opinionated default: apply a strong template automatically so the page looks
// designed from minute one. Styling lives in the Editor, not the onboarding flow.
const DEFAULT_TEMPLATE=(TEMPLATES[0]&&TEMPLATES[0].id)||"";

// Step indicators
const ind=$("stepsInd");
for(let i=0;i<TOTAL;i++){const d=document.createElement("div");d.className="step-dot";ind.appendChild(d);}
function updateDots(){ind.querySelectorAll(".step-dot").forEach((d,i)=>{d.className="step-dot"+(i<step-1?" done":"")+(i===step-1?" active":"");});}
function showStep(n){step=n;document.querySelectorAll(".wiz-step").forEach((s,i)=>{s.classList.toggle("active",i===n-1);});updateDots();}

// Step 1: name -> slug auto-gen
const nameIn=$("wiz_name"), slugIn=$("wiz_slug"), preview=$("wiz_preview");
let userEditedSlug=false;
nameIn.addEventListener("input",()=>{if(!userEditedSlug){const s=slugify(nameIn.value);slugIn.value=s;preview.textContent=s?"yourrank.site/"+s:"yourrank.site/\u2026";}});
slugIn.addEventListener("input",()=>{userEditedSlug=true;const s=slugify(slugIn.value);preview.textContent=s?"yourrank.site/"+s:"yourrank.site/\u2026";});

// Step 3: player count
const pta=$("wiz_players"), pcount=$("wiz_pcount");
function countPlayers(){
const lines=pta.value.split("\n").filter(l=>{const t=l.trim();return t&&!t.startsWith("#")&&!t.startsWith("//");});
pcount.textContent=lines.length+" player"+(lines.length===1?"":"s")+" detected";
}
pta.addEventListener("input",countPlayers);
const sampleBtn=$("wiz_sample");
if(sampleBtn){
  sampleBtn.addEventListener("click",()=>{
    pta.value="Alex, 9500\nBree, 7200\nCasey, 5400\nDrew, 3100\nEllis, 1800";
    countPlayers();
  });
}

// Parse the players textarea: "name, wagered" per line, comma/tab separated.
function parsePlayers(){
  const out=[];
  $("wiz_players").value.split("\n").forEach(l=>{
    const t=l.trim();
    if(!t||t.startsWith("#")||t.startsWith("//"))return;
    const parts=t.split(/[,\t]/).map(s=>s.trim());
    const name=parts[0];
    if(!name)return;
    const wagered=parts[1]?(parseFloat(parts[1].replace(/[^0-9.]/g,""))||0):0;
    out.push({name,wagered});
  });
  return out;
}

// Nav buttons
$("wiz1next").onclick=()=>{if(!slugify(nameIn.value)&&!slugIn.value.trim()){$("wiz_err").textContent="Enter your name or a custom URL.";return;}if(!slugIn.value.trim()){slugIn.value=slugify(nameIn.value);}slug=slugify(slugIn.value);if(!slug){$("wiz_err").textContent="Invalid URL — letters, numbers, dashes only.";return;}$("wiz_err").textContent="";showStep(2);};
$("wiz2next").onclick=()=>{$("wiz_err").textContent="";showStep(3);};
$("wiz2back").onclick=()=>{$("wiz_err").textContent="";showStep(1);};
// Persist the page here (not on the final button) so the "ready" screen only
// appears once the board is actually saved and reflects the real slug.
const wiz3next=$("wiz3next");
wiz3next.onclick=async()=>{
  $("wiz_err").textContent="";
  wiz3next.disabled=true;
  const prev=wiz3next.textContent;
  wiz3next.textContent="Saving…";
  try{
    const name=$("wiz_name").value.trim()||slug;
    const body={
      slug,
      name,
      brand:{name,casino:$("wiz_casino").value.trim(),code:$("wiz_code").value.trim(),ctaUrl:$("wiz_cta").value.trim()},
      players:parsePlayers(),
      isDraft:true,
    };
    const res=await fetch("/api/site",{method:"PUT",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(body)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok){$("wiz_err").textContent=data.error||"Failed to save your page. Try again.";wiz3next.disabled=false;wiz3next.textContent=prev;return;}
    if(data.slug)slug=data.slug;
    if(data.siteId)siteId=data.siteId;
    // Auto-apply the opinionated default template so the page looks designed
    // immediately. This is best-effort — never block going live on it.
    if(DEFAULT_TEMPLATE){
      try{
        const tbody={template:DEFAULT_TEMPLATE};
        if(siteId)tbody.siteId=siteId;
        await fetch("/api/site/theme",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(tbody)});
      }catch(e){/* non-fatal: user can pick a design later in the Editor */}
    }
    $("wiz_finalUrl").textContent="yourrank.site/"+slug;
    $("wiz_view").href=origin+"/"+slug;
    wiz3next.disabled=false;wiz3next.textContent=prev;
    showStep(4);
  }catch(e){$("wiz_err").textContent="Network error. Try again.";wiz3next.disabled=false;wiz3next.textContent=prev;}
};
$("wiz3back").onclick=()=>{$("wiz_err").textContent="";showStep(2);};
const wiz3skip=$("wiz3skip");
if(wiz3skip){wiz3skip.onclick=()=>{pta.value="";countPlayers();wiz3next.click();};}

$("wiz4back").onclick=()=>{$("wiz_err").textContent="";showStep(3);};

// Copy link
const copyBtn=$("wiz_copy");
if(copyBtn){
  copyBtn.onclick=async()=>{
    const reset=()=>{copyBtn.textContent="Copy link";};
    try{await navigator.clipboard.writeText("https://yourrank.site/"+slug);copyBtn.textContent="Copied!";setTimeout(reset,1500);}catch{copyBtn.textContent="Copy failed";setTimeout(reset,1500);}
  };
}

// Finish: the page was already saved at step 3, so just head to the dashboard.
const finishBtn=$("wiz_finish");
if(finishBtn){
  finishBtn.onclick=async()=>{
    finishBtn.disabled=true;
    try{
      const body={};
      if(siteId)body.siteId=siteId;
      const res=await fetch("/api/site/finish",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(body)});
      if(!res.ok){const d=await res.json().catch(()=>({}));$("wiz_err").textContent=d.error||"Could not finish setup.";finishBtn.disabled=false;return;}
    }catch(e){$("wiz_err").textContent="Network error. Try again.";finishBtn.disabled=false;return;}
    location.href="/dashboard";
  };
}

function getCsrf(){const m=document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);return m?m[1]:"";}

// Resume an unfinished wizard board: prefill the current board data.
async function loadResume(){
  const params=new URLSearchParams(location.search);
  const resume=params.get("resume");
  if(!resume)return;
  try{
    const res=await fetch("/api/site",{credentials:"include"});
    const d=await res.json().catch(()=>({}));
    if(!d.ok||!d.data)return;
    const s=d.data.data||{};
    const b=s.brand||{};
    nameIn.value=b.name||"";
    const sSlug=d.data.slug||"";
    slugIn.value=sSlug;
    userEditedSlug=true;
    preview.textContent=sSlug?"yourrank.site/"+sSlug:"yourrank.site/…";
    if($("wiz_casino"))$("wiz_casino").value=b.casino||"";
    if($("wiz_code"))$("wiz_code").value=b.code||"";
    if($("wiz_cta"))$("wiz_cta").value=b.ctaUrl||"";
    const pta=$("wiz_players");
    if(pta && s.players && s.players.length){
      pta.value=s.players.map((p)=>p.name+", "+(p.wagered||0)).join("\n");
      countPlayers();
    }
    slug=slugify(sSlug);
    siteId=d.siteId||d.data?.siteId||"";
  }catch(e){}
}
loadResume();
})();
