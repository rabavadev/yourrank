# Security Review — YourRank Launch Readiness

**Date:** 2026-07-08
**Status:** Pre-launch audit

## Findings Summary

| Finding | Severity | Status | Notes |
|---------|----------|--------|-------|
| CSP `unsafe-inline` on style-src | Medium | Known | Required for inline styles; tracked for future nonce migration |
| CSP `frame-ancestors *` on public pages | Low | Intentional | Allows OBS embedding |
| No Turnstile on signup/login | Medium | Pending | Needs S M to configure Cloudflare Turnstile |
| Postback key plaintext column | Medium | Pending | Should be encrypted at rest |
| SENTRY_DSN not set as Worker secret | Low | Pending | Needs S M action |
| `img-src https:` allows any HTTPS image | Low | Minor tracking vector |

## Security Controls Already in Place

- ✅ RLS enabled on all tables (service_role only)
- ✅ HMAC-signed postbacks with timing-safe comparison
- ✅ Rate limiting on all endpoints (KV + DO fallback)
- ✅ CSRF protection (SameSite:Lax + origin check)
- ✅ CSP headers with nonce support (dashboard)
- ✅ CSP report-uri endpoint for violation monitoring
- ✅ Session cookies: HttpOnly, Secure, SameSite:Lax
- ✅ Password hashing: PBKDF2 with 310k iterations
- ✅ TOTP 2FA for admin access
- ✅ Sentry error tracking on both Workers
- ✅ Structured logging with request ID correlation

## Action Items for S M

1. Set SENTRY_DSN as Worker secret in all 3 workers
2. Enable Cloudflare Turnstile for signup/login
3. Encrypt postback_key column at rest
4. Review and approve CSP frame-ancestors policy
