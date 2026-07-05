// ============================================================================
//  YourRank — SHARED SESSION (real executable tests)
// ============================================================================

import { describe, it, expect } from 'bun:test';
import {
  COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  COOKIE_DOMAIN,
  SESSION_TTL_S,
  KV_PREFIX,
  newToken,
  cookieSet,
  cookieClear,
  readToken,
  readTokenFromHeader,
  createSession,
  destroySession,
  parseSessionValue,
  hasLegacyCookie,
} from '../session';
import type { KVNamespace, SessionEnv } from '../session';

// ---- Mock KV ----
const mockKV = (): KVNamespace => {
  const store = new Map<string, string>();
  return {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string, _opts?: { expirationTtl?: number }) => {
      store.set(key, value);
      return Promise.resolve();
    },
    delete: (key: string) => {
      store.delete(key);
      return Promise.resolve();
    },
  };
};

const mockEnv = (): SessionEnv => ({
  SESSIONS: mockKV(),
});

// ---- Constants ----

describe('COOKIE_NAME', () => {
  it('is "gm_session"', () => {
    expect(COOKIE_NAME).toBe('gm_session');
  });
});

describe('SESSION_TTL_S', () => {
  it('is 30 days (2592000)', () => {
    expect(SESSION_TTL_S).toBe(2592000);
  });
});

describe('COOKIE_DOMAIN', () => {
  it('defaults to ".yourrank.site"', () => {
    expect(COOKIE_DOMAIN).toBe('.yourrank.site');
  });
});

describe('KV_PREFIX', () => {
  it('is "sess:"', () => {
    expect(KV_PREFIX).toBe('sess:');
  });
});

// ---- Token generation ----

describe('newToken', () => {
  it('returns a non-empty string', () => {
    const token = newToken();
    expect(token.length).toBeGreaterThan(0);
  });

  it('returns a hex string of 64 characters (32 bytes)', () => {
    const token = newToken();
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it('generates unique tokens', () => {
    const a = newToken();
    const b = newToken();
    expect(a).not.toBe(b);
  });
});

// ---- Cookie helpers ----

describe('cookieSet', () => {
  it('returns a Set-Cookie header string', () => {
    const header = cookieSet('test-token');
    expect(typeof header).toBe('string');
    expect(header.length).toBeGreaterThan(0);
  });

  it('contains gm_session', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('gm_session=');
  });

  it('contains the token value', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('gm_session=test-token');
  });

  it('contains Domain=.yourrank.site', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('Domain=.yourrank.site');
  });

  it('contains Secure flag', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('Secure');
  });

  it('contains SameSite=Lax', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('SameSite=Lax');
  });

  it('contains HttpOnly flag', () => {
    const header = cookieSet('test-token');
    expect(header).toContain('HttpOnly');
  });

  it('contains Max-Age=2592000', () => {
    const header = cookieSet('test-token');
    expect(header).toContain(`Max-Age=${SESSION_TTL_S}`);
  });
});

describe('cookieClear', () => {
  it('returns a Set-Cookie header string', () => {
    const header = cookieClear();
    expect(typeof header).toBe('string');
    expect(header.length).toBeGreaterThan(0);
  });

  it('contains Max-Age=0', () => {
    const header = cookieClear();
    expect(header).toContain('Max-Age=0');
  });

  it('starts with gm_session=', () => {
    const header = cookieClear();
    expect(header.startsWith('gm_session=;')).toBe(true);
  });

  it('contains Domain=.yourrank.site', () => {
    const header = cookieClear();
    expect(header).toContain('Domain=.yourrank.site');
  });

  it('contains Secure flag', () => {
    const header = cookieClear();
    expect(header).toContain('Secure');
  });
});

// ---- readToken ----

describe('readToken', () => {
  it('extracts token from valid Cookie header', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'gm_session=abc123def456' },
    });
    expect(readToken(req)).toBe('abc123def456');
  });

  it('extracts token among multiple cookies', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'other=value; gm_session=mytoken; another=val' },
    });
    expect(readToken(req)).toBe('mytoken');
  });

  it('returns null for missing cookie', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'other=value' },
    });
    expect(readToken(req)).toBeNull();
  });

  it('returns null for empty Cookie header', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: '' },
    });
    expect(readToken(req)).toBeNull();
  });

  it('returns null when no Cookie header is present', () => {
    const req = new Request('https://example.com');
    expect(readToken(req)).toBeNull();
  });
});

// ---- readTokenFromHeader ----

describe('readTokenFromHeader', () => {
  it('extracts token from a raw cookie header string', () => {
    expect(readTokenFromHeader('gm_session=abc123')).toBe('abc123');
  });

  it('returns null for missing gm_session', () => {
    expect(readTokenFromHeader('other=value')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(readTokenFromHeader(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(readTokenFromHeader('')).toBeNull();
  });

  it('extracts token among multiple cookies', () => {
    expect(readTokenFromHeader('a=1; gm_session=xyz; b=2')).toBe('xyz');
  });
});

// ---- parseSessionValue ----

describe('parseSessionValue', () => {
  it('parses userId and createdAt from valid JSON value', () => {
    const raw = JSON.stringify({ u: 'user-uuid-123', c: 1700000000000 });
    const result = parseSessionValue(raw);
    expect(result.userId).toBe('user-uuid-123');
    expect(result.createdAt).toBe(1700000000000);
  });

  it('handles legacy bare UUID (not JSON)', () => {
    const result = parseSessionValue('bare-uuid-456');
    expect(result.userId).toBe('bare-uuid-456');
    expect(result.createdAt).toBe(0);
  });

  it('returns createdAt=0 when JSON has no c field', () => {
    const raw = JSON.stringify({ u: 'user-789' });
    const result = parseSessionValue(raw);
    expect(result.userId).toBe('user-789');
    expect(result.createdAt).toBe(0);
  });

  it('handles JSON with missing u field by falling back to legacy', () => {
    const raw = JSON.stringify({ x: 'not-a-user' });
    // parsed object has no 'u' string → falls through to legacy path
    const result = parseSessionValue(raw);
    expect(result.userId).toBe(raw);
    expect(result.createdAt).toBe(0);
  });
});

// ---- hasLegacyCookie ----

describe('hasLegacyCookie', () => {
  it('returns true when legacy "sess" cookie is present', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'sess=oldtoken123' },
    });
    expect(hasLegacyCookie(req)).toBe(true);
  });

  it('returns true when legacy "sess" is among other cookies', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'gm_session=newtoken; sess=oldtoken' },
    });
    expect(hasLegacyCookie(req)).toBe(true);
  });

  it('returns false when only gm_session is present', () => {
    const req = new Request('https://example.com', {
      headers: { Cookie: 'gm_session=sometoken' },
    });
    expect(hasLegacyCookie(req)).toBe(false);
  });

  it('returns false when no cookies are present', () => {
    const req = new Request('https://example.com');
    expect(hasLegacyCookie(req)).toBe(false);
  });
});

// ---- createSession / destroySession ----

describe('createSession', () => {
  it('returns a non-empty token', async () => {
    const env = mockEnv();
    const token = await createSession(env, 'user-abc');
    expect(token.length).toBeGreaterThan(0);
  });

  it('stores the session in KV with correct prefix', async () => {
    const env = mockEnv();
    const token = await createSession(env, 'user-abc');
    const raw = await env.SESSIONS.get(KV_PREFIX + token);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.u).toBe('user-abc');
    expect(typeof parsed.c).toBe('number');
  });

  it('creates unique tokens for each session', async () => {
    const env = mockEnv();
    const t1 = await createSession(env, 'user-abc');
    const t2 = await createSession(env, 'user-abc');
    expect(t1).not.toBe(t2);
  });
});

describe('destroySession', () => {
  it('removes the session from KV', async () => {
    const env = mockEnv();
    const token = await createSession(env, 'user-xyz');
    // Verify it exists
    expect(await env.SESSIONS.get(KV_PREFIX + token)).not.toBeNull();
    // Destroy it
    await destroySession(env, token);
    expect(await env.SESSIONS.get(KV_PREFIX + token)).toBeNull();
  });

  it('handles null token gracefully', async () => {
    const env = mockEnv();
    await expect(destroySession(env, null)).resolves.toBeUndefined();
  });

  it('handles non-existent token gracefully', async () => {
    const env = mockEnv();
    await expect(destroySession(env, 'nonexistent')).resolves.toBeUndefined();
  });
});
