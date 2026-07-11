// Onboarding setup wizard — extracted from inline <script> for CSP compliance.
(function(){
const slugify=(s)=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const $=id=>document.getElementById(id);
const origin=location.origin;
const TOTAL=4;
let step=1, slug="";

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
pta.addEventListener("input",()=>{
const lines=pta.value.split("\n").filter(l=>{const t=l.trim();return t&&!t.startsWith("#")&&!t.startsWith("//");});
pcount.textContent=lines.length+" player"+(lines.length===1?"":"s")+" detected";
});

// Nav buttons
$("wiz1next").onclick=()=>{if(!slugify(nameIn.value)&&!slugIn.value.trim()){$("wiz_err").textContent="Enter your name or a custom URL.";return;}if(!slugIn.value.trim()){slugIn.value=slugify(nameIn.value);}slug=slugify(slugIn.value);if(!slug){$("wiz_err").textContent="Invalid URL — letters, numbers, dashes only.";return;}$("wiz_err").textContent="";showStep(2);};
$("wiz2next").onclick=()=>{$("wiz_err").textContent="";showStep(3);};
$("wiz2back").onclick=()=>{$("wiz_err").textContent="";showStep(1);};
$("wiz3next").onclick=()=>{$("wiz_err").textContent="";$("wiz_finalUrl").textContent="yourrank.site/"+slug;$("wiz_view").href=origin+"/"+slug;showStep(4);};
$("wiz3back").onclick=()=>{$("wiz_err").textContent="";showStep(2);};
$("wiz4back").onclick=()=>{$("wiz_err").textContent="";showStep(3);};

// Copy link
const copyBtn=$("wiz_copy");
if(copyBtn){
  copyBtn.onclick=async()=>{
    try{await navigator.clipboard.writeText("https://yourrank.site/"+slug);copyBtn.textContent="Copied!";setTimeout(()=>copyBtn.textContent="\ud83d\udccb Copy link",1500);}catch{copyBtn.textContent="Copy failed";setTimeout(()=>copyBtn.textContent="\ud83d\udccb Copy link",1500);}
  };
}

// Finish: create the site
const finishBtn=$("wiz_finish");
if(finishBtn){
  finishBtn.onclick=async()=>{
    finishBtn.disabled=true;
    finishBtn.textContent="Creating...";
    $("wiz_err").textContent="";
    try{
      const players=[];
      $("wiz_players").value.split("\n").forEach(l=>{const t=l.trim();if(t&&!t.startsWith("#")&&!t.startsWith("//"))players.push(t);});
      const body={slug,name:$("wiz_name").value.trim()||slug,casino:$("wiz_casino").value.trim()||null,period:null,prizePool:null,refCode:$("wiz_code").value.trim()||null,referralLink:$("wiz_cta").value.trim()||null,players:players.map(n=>({name:n}))};
      const res=await fetch("/api/site",{method:"PUT",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(body)});
      const data=await res.json();
      if(!data.ok){$("wiz_err").textContent=data.error||"Failed to create page.";finishBtn.disabled=false;finishBtn.textContent="Go to dashboard";return;}
      location.href="/dashboard";
    }catch(e){$("wiz_err").textContent="Network error. Try again.";finishBtn.disabled=false;finishBtn.textContent="Go to dashboard";}
  };
}

function getCsrf(){const m=document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);return m?m[1]:"";}
})();
