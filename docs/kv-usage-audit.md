# KV Usage Audit — yourrank SESSIONS namespace

**Date:** 2026-07-08
**Namespace:** SESSIONS (id: 26e47bcce19941839a20bd2cd5879e42)
**Shared:** yes — both leaderboard and bot Workers

## Current KV Operations

### Leaderboard Worker (yourrank-site)

| Category | Operation | Key Pattern | Frequency | Write Impact |
|----------|-----------|-------------|-----------|--------------|
| Sessions | read | `gm_s:<token>` | Every authenticated request | 0 writes |
| Sessions | write | `gm_s:<token>` | Every authenticated request (TTL refresh) | **HIGH** |
| Site cache | read | `site:<key>` | Board renders | 0 writes |
| Site cache | write | `site:<key>` | Cache miss (L2, 60s TTL) | Low |
| 2FA | read/write/delete | `2fa:<token>` | Admin 2FA verify | Very low |
| Reset tokens | write/read/delete | `reset:<token>` | Password reset flow | Very low |
| Health probe | read | `__health_probe__` | /health endpoint | 0 writes |

### Bot Worker (yourrank-bot)

| Category | Operation | Key Pattern | Frequency | Write Impact |
|----------|-----------|-------------|-----------|--------------|
| Rate limiting | read/write | `rl:*` | **Every request** | **HIGH** |
| Rate limiting | read/write | `chatcmd:*` | Every chat command | **HIGH** |

## Write Load Estimate

**Before DO rate limiting:**
- Session writes: ~1 write per authenticated request
- Rate limit writes: ~1 write per request (both Workers combined)
- Estimated: **thousands of writes/day** under normal load

**After DO rate limiting (RL_BACKEND=do):**
- Session writes: ~1 write per authenticated request (TTL refresh)
- Rate limit writes: **0** (handled by Durable Objects)
- Estimated: **hundreds of writes/day** — well within free tier

## KV After Phase 2.1

With `RL_BACKEND=do`:
- **Sessions** — read on every auth request, write on TTL refresh (write-rarely pattern)
- **Site cache** — read on board renders, write on cache miss (write-rarely)
- **2FA/reset tokens** — short-lived, very low volume

## Monitoring

KV write rate can be monitored via:
1. Cloudflare Dashboard → Workers → KV → SESSIONS → Analytics
2. Worker logs: rateLimit errors log `[rateLimit] KV write failed` when quota exhausted

## Action Items

- [ ] Enable `RL_BACKEND=do` after deploying DO rate limiter
- [ ] Monitor KV write rate for 48h after switch
- [ ] Confirm daily writes < 10% of quota (target: < 100 writes/day on free tier)
