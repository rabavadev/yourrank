import { leaderboardPageHtml } from "../../../../shared/page-shell.js";
import { templateCatalog } from "../templates/index.js";

const TEMPLATES_JSON = JSON.stringify(templateCatalog());

// setup page
export const setupPage = leaderboardPageHtml({
  title: "Setup · YourRank",
  canonical: "https://yourrank.site/dashboard/setup",
  mainClass: "gm-shell-main",
  styles: ["/assets/app.css","/assets/shell-nav.css","/assets/setup-styles.css"],
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to set up your leaderboard.</p>",
  scripts: [`<script nonce="__NONCE__">window.__TEMPLATE_CATALOG__=${TEMPLATES_JSON};</script><script src="/assets/setup-wizard.js?v=4"></script>`],
  content: `<div class="setup-wrap">
<h1>Set up your leaderboard</h1>
<p class="sub">Three quick steps and you're live. <a href="/demo" target="_blank">See a live demo first →</a></p>
<div class="steps-ind" id="stepsInd"></div>

<div class="wiz-step active" id="step1">
<div class="field"><label for="wiz_name">Your name / handle</label>
<input id="wiz_name" placeholder="YourName" autocomplete="nickname" required />
<span class="hint">Auto-generates your URL below.</span></div>
<div class="field"><label for="wiz_slug">Your URL</label>
<input id="wiz_slug" placeholder="chuckybtz" autocomplete="off" />
<div class="preview-url" id="wiz_preview">yourrank.site/…</div>
<span class="hint">Letters, numbers, dashes only. You can change it here.</span></div>
<div class="btns-row"><span></span><button class="btn btn--accent" id="wiz1next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step2">
<div class="field"><label for="wiz_casino">Sponsor / prize source <span class="hint" style="font-weight:400">(optional)</span></label>
<input id="wiz_casino" placeholder="Your brand or sponsor" /></div>
<div class="field"><label for="wiz_code">Referral or promo code <span class="hint" style="font-weight:400">(optional)</span></label>
<input id="wiz_code" placeholder="OPTIONAL" /></div>
<div class="field"><label for="wiz_cta">Sponsor link <span class="hint" style="font-weight:400">(optional)</span></label>
<input id="wiz_cta" placeholder="https://example.com" /></div>
<div class="btns-row"><button class="btn" id="wiz2back" type="button">← Back</button><button class="btn btn--accent" id="wiz2next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step3">
<div class="field"><label for="wiz_players">Paste your players</label>
<span class="hint">One player per line: <span class="mono">name, wagered amount</span>. Comma or tab separated. Wagered is optional (defaults to 0).</span>
<textarea class="players-ta" id="wiz_players" rows="8" spellcheck="false" placeholder="Alex, 9500
Bree, 7200
Casey, 5400"></textarea>
<div class="d-flex gap-10 items-center flex-wrap"><span class="hint" id="wiz_pcount">0 players detected</span><button class="btn btn--sm btn--ghost" id="wiz_sample" type="button">Load sample players</button></div></div>
<div class="btns-row"><button class="btn" id="wiz3back" type="button">← Back</button><button class="btn btn--ghost" id="wiz3skip" type="button">Skip, add later</button><button class="btn btn--accent" id="wiz3next" type="button">Publish my page →</button></div>
</div>

<div class="wiz-step" id="step4">
<h2 class="setup-complete-title">Your page is live</h2>
<p class="setup-complete-sub">Share this link with your community:</p>
<div class="share-box">
<span class="url" id="wiz_finalUrl">yourrank.site/…</span>
<div class="d-flex gap-10 justify-center flex-wrap">
<button class="btn btn--accent ic-btn" id="wiz_copy" type="button"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy link</button>
<a class="btn" id="wiz_view" href="#" target="_blank">View live page →</a>
</div>
</div>
<p class="hint" style="text-align:center;margin-top:22px;margin-bottom:10px">Next, in your dashboard you can:</p>
<div class="d-flex gap-10 flex-wrap" style="justify-content:center;margin-bottom:18px">
<div class="card" style="flex:1;min-width:140px;max-width:190px;padding:14px 12px;text-align:center">
<div class="setup-nextic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></div><b style="font-size:13px;display:block;margin-bottom:3px">Auto-update it</b><span class="hint" style="font-size:12px">Connect a feed or API postback</span>
</div>
<div class="card" style="flex:1;min-width:140px;max-width:190px;padding:14px 12px;text-align:center">
<div class="setup-nextic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg></div><b style="font-size:13px;display:block;margin-bottom:3px">Change the design</b><span class="hint" style="font-size:12px">Templates, colors &amp; fonts</span>
</div>
<div class="card" style="flex:1;min-width:140px;max-width:190px;padding:14px 12px;text-align:center">
<div class="setup-nextic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="m10 9 5 3-5 3z"/></svg></div><b style="font-size:13px;display:block;margin-bottom:3px">OBS stream overlay</b><span class="hint" style="font-size:12px">Live leaderboard on stream</span>
</div>
</div>
<div class="btns-row"><button class="btn" id="wiz4back" type="button">← Back</button><button class="btn btn--accent" id="wiz_finish" type="button">Go to dashboard →</button></div>
</div>

<div class="err" id="wiz_err" role="alert" aria-live="assertive"></div>
</div>`
});
