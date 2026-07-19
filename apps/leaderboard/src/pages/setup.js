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
<p class="sub">Five quick steps and you're live. <a href="/demo" target="_blank">See a live demo first →</a></p>
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
<div class="field"><label for="wiz_casino">Casino name</label>
<input id="wiz_casino" placeholder="e.g. Stake" required /></div>
<div class="field"><label for="wiz_code">Referral code <span class="hint" style="font-weight:400">(optional)</span></label>
<input id="wiz_code" placeholder="BTZ" /></div>
<div class="field"><label for="wiz_cta">Referral link <span class="hint" style="font-weight:400">(optional)</span></label>
<input id="wiz_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="btns-row"><button class="btn" id="wiz2back" type="button">← Back</button><button class="btn btn--accent" id="wiz2next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step3">
<div class="field"><label for="wiz_players">Paste your players</label>
<span class="hint">One player per line: <span class="mono">name, wagered amount</span>. Comma or tab separated. Wagered is optional (defaults to 0).</span>
<textarea class="players-ta" id="wiz_players" rows="8" spellcheck="false" placeholder="*****ess, 152000
*****y, 98000
*****k, 61250"></textarea>
<div class="d-flex gap-10 items-center flex-wrap"><span class="hint" id="wiz_pcount">0 players detected</span><button class="btn btn--sm btn--ghost" id="wiz_sample" type="button">Load sample players</button></div></div>
<div class="btns-row"><button class="btn" id="wiz3back" type="button">← Back</button><button class="btn btn--ghost" id="wiz3skip" type="button">Skip, add later</button><button class="btn btn--accent" id="wiz3next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step4">
<h2 class="setup-complete-title">Choose a template</h2>
<p class="setup-complete-sub">Pick the look for your leaderboard. Your players stay the same.</p>
<div class="template-grid" id="wiz_templates"></div>
<div class="btns-row"><button class="btn" id="wiz4back" type="button">← Back</button><button class="btn btn--accent" id="wiz4next" type="button" disabled>Next →</button></div>
</div>

<div class="wiz-step" id="step5">
<h2 class="setup-complete-title">Your page is ready! 🎉</h2>
<p class="setup-complete-sub">Share this link with your community:</p>
<div class="share-box">
<span class="url" id="wiz_finalUrl">yourrank.site/…</span>
<div class="d-flex gap-10 justify-center flex-wrap">
<button class="btn btn--accent" id="wiz_copy" type="button">📋 Copy link</button>
<a class="btn" id="wiz_view" href="#" target="_blank">View live page →</a>
</div>
</div>
<p class="hint" style="text-align:center;margin-top:22px;margin-bottom:10px">In your dashboard you can also:</p>
<div class="d-flex gap-10 flex-wrap" style="justify-content:center;margin-bottom:18px">
<div class="card" style="flex:1;min-width:130px;max-width:170px;padding:14px 12px;text-align:center">
<div style="font-size:22px;margin-bottom:6px">🎨</div><b style="font-size:13px;display:block;margin-bottom:3px">Change design</b><span class="hint" style="font-size:12px">Templates, colors &amp; fonts</span>
</div>
<div class="card" style="flex:1;min-width:130px;max-width:170px;padding:14px 12px;text-align:center">
<div style="font-size:22px;margin-bottom:6px">👥</div><b style="font-size:13px;display:block;margin-bottom:3px">Add more players</b><span class="hint" style="font-size:12px">Paste or import your list</span>
</div>
<div class="card" style="flex:1;min-width:130px;max-width:170px;padding:14px 12px;text-align:center">
<div style="font-size:22px;margin-bottom:6px">📺</div><b style="font-size:13px;display:block;margin-bottom:3px">OBS stream overlay</b><span class="hint" style="font-size:12px">Live leaderboard on stream</span>
</div>
</div>
<div class="btns-row"><button class="btn" id="wiz5back" type="button">← Back</button><button class="btn btn--accent" id="wiz_finish" type="button">Go to dashboard →</button></div>
</div>

<div class="err" id="wiz_err" role="alert" aria-live="assertive"></div>
</div>`
});
