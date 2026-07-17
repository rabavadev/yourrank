// signup page
export const signupPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Create account · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/signup" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Your leaderboard, live in seconds.</h1><p>One email, one password, and your page is ready. You can rename it once you're in.</p>
<div class="auth-spec" aria-hidden="true"><div class="auth-spec-h"><span>what happens next</span><span class="dot">3 steps</span></div>
<div class="auth-spec-row"><span>01</span><span>Create your account</span></div>
<div class="auth-spec-row"><span>02</span><span>Pick your handle &amp; add players</span></div>
<div class="auth-spec-row"><span>03</span><span>Share your live page</span></div></div></div>
<div class="feat"><div>Free to set up · upgrade when you are ready</div></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><a href="/" class="auth-brand-m">Your<b>Rank</b></a><h2>Create account</h2><p class="sub">Free. Takes 30 seconds.</p>
<div id="planBanner" class="plan-banner" hidden></div>
<form id="form" method="POST" action="/api/auth/signup" novalidate>
<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err email-tip" /><span class="field-err" id="email-err" data-field-err="email" role="alert" aria-live="polite"></span><span class="hint" id="email-tip">Your page URL is auto-generated from your email address; change it anytime in settings.</span></div>
<div class="field"><label for="password">Password</label><div class="pw-wrap"><input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" aria-describedby="password-err pw-hint" /><button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password"><svg data-eye width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg data-eye-off width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" hidden><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button></div>
  <div class="pw-meter" id="pwMeter" hidden><div class="pw-meter-track"><div class="pw-meter-bar"></div></div><div class="pw-meter-label" data-pw-strength aria-live="polite"></div></div>
  <span class="field-err" id="password-err" data-field-err="password" role="alert" aria-live="polite"></span>
  <ul class="pw-reqs" id="pwReqs" aria-label="Password requirements">
    <li data-req="len" class="pw-req">At least 8 characters</li>
    <li data-req="case" class="pw-req">Uppercase and lowercase letters</li>
    <li data-req="num" class="pw-req">One number</li>
    <li data-req="special" class="pw-req">One special character</li>
  </ul></div>
  <div class="err" id="err" role="alert" aria-live="assertive"></div><button class="btn btn--accent w-full" type="submit" id="submit">Create account</button></form>
<p class="foot">Already have one? <a href="/login">Sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`;
