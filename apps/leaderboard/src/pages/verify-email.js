// email verification landing page
export const verifyEmailPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify email · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/verify-email" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Confirm your email.</h1><p>Click the link we sent you to finish setting up your page.</p></div>
<div class="feat"></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>Verify email</h2>
<p class="sub" id="msg">Checking your verification link…</p>
<div class="err" id="err" role="alert" aria-live="assertive" hidden></div>
<p class="foot" id="resendWrap" hidden>Didn't get it? <button class="btn btn--ghost btn--sm" id="resendBtn" type="button">Send again</button></p>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/verify-email.js"></script></body></html>`;
