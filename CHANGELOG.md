# Changelog

## [Unreleased]
- Canonicalized frontend ownership: the apex Leaderboard Worker owns the full
  application, while `apps/web` now serves only the proxied marketing homepage.
- Hardcheck v5: 7 P0/P1 fixes (setup wizard, WCAG contrast, archive limit, notification settings)
- Hardcheck v5: Security hardening (admin TOTP rate limit, Sentry context tags)
- Hardcheck v5: Dashboard fixes (notification save, test buttons, overlay upgrade link)

## [0.2.0] - 2026-07-04
- Multi-board support (multiple leaderboards per user)
- Custom domains with CNAME verification
- Telegram Stars billing integration
- NOWPayments crypto billing
- Admin 2FA (TOTP)
- Admin audit logging
- Public API endpoints
- OBS overlay widget
- Setup wizard for new users
- Sentry error tracking (toucan-js)
- CSP nonce on bot dashboard
- WCAG 2.2 AA accessibility baseline

## [0.1.0] - 2026-06-25
- Initial release
- Leaderboard SPA with live polling
- Telegram bot integration (!rank, !board commands)
- Session management (KV-backed, cross-Worker)
- Rate limiting (fail-closed)
- CSRF double-submit protection
- IP hashing (SHA-256 + salt)
- Token encryption at rest (AES-256-GCM)
