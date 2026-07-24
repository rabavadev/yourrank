// admin2fa page
export const admin2faPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify · YourRank Admin</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/admin" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" />
<link rel="stylesheet" href="/assets/admin2fa-styles.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank Admin requires JavaScript</p><p>Please enable JavaScript to verify two-factor authentication.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><div class="brand">Your<b>Rank</b> <span class="label ml-8">ADMIN</span></div>
<div class="topbar-right"><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<main class="wrap" id="main-content">
<div class="tfa-wrap" id="tfaVerify">
<h1>🔒 Two-Factor Authentication</h1>
<p>Enter the 6-digit code from your authenticator app.</p>
<label for="tfaCode" class="sr-only">6-digit verification code</label><input class="code-input" id="tfaCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" autofocus aria-label="Verification code" />
<div class="err" id="tfaErr" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent" id="tfaSubmit" type="button">Verify</button>
<p class="hint"><a href="#" id="tfaUseRecovery">Use a recovery code</a></p>
</div>

<div class="tfa-wrap tfa-setup" id="tfaSetup" hidden>
<h2>Set Up Two-Factor Authentication</h2>
<p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
<div class="qr-wrap"><img id="tfaQr" alt="QR Code for 2FA setup with Google Authenticator" width="200" height="200" /></div>
<p>Or enter this secret manually:</p>
<code class="secret-box" id="tfaSecret"></code>
<p class="mt-16">After scanning, enter the 6-digit code to verify setup:</p>
<label for="tfaSetupCode" class="sr-only">6-digit verification code</label><input class="code-input" id="tfaSetupCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" aria-label="Verification code" />
<div class="err" id="tfaSetupErr" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent" id="tfaSetupSubmit" type="button">Enable 2FA</button>
</div>

<div class="tfa-wrap" id="tfaRecovery" hidden>
<h2>Recovery Code</h2>
<p>Enter one of the recovery codes you saved when you enabled 2FA.</p>
<label for="tfaRecoveryCode" class="sr-only">Recovery code</label><input class="code-input recovery-input" id="tfaRecoveryCode" type="text" autocomplete="off" placeholder="xxxx-xxxx-xxxx-xxxx" aria-label="Recovery code" />
<div class="err" id="tfaRecoveryErr" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent" id="tfaRecoverySubmit" type="button">Verify</button>
<p class="hint"><a href="#" id="tfaBackToCode">Back to 6-digit code</a></p>
</div>

<div class="tfa-wrap" id="tfaSuccess" hidden>
<h2>2FA Enabled</h2>
<p>Save these recovery codes somewhere safe. Each one can only be used once.</p>
<ul class="recovery-list" id="tfaRecoveryList"></ul>
<button class="btn btn--accent" id="tfaDone" type="button">Go to admin panel</button>
</div>
</main>
<script src="/assets/qrcode.js"></script>
<script src="/assets/admin2fa.js?v=3"></script></body></html>`;
