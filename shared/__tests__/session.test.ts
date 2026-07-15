// ============================================================================
//  YourRank — SHARED SESSION (Postgres-backed, no KV)
// ============================================================================

import { describe, it, expect, mock, beforeEach } from 'bun:test';
import type { SessionEnv, UserRecord } from '../session';

// Mock the DB before importing session.ts so we never try to connect to Postgres.
const dbUrl    = import.meta.resolve('../db.js');
const dbUrlTs  = import.meta.resolve('../db.ts');

interface SessionRow {
  user_id: string;
  created_at: string;
  age: number;
}

const sessions = new Map<string, SessionRow>();
const users = new Map<string, UserRecord>();

const resetStores = () => {
  sessions.clear();
  users.clear();
};

const dbMock = () => ({
  one: async (sql: string, params: unknown[]) => {
    if (/users/i.test(sql) && params[0]) {
      return users.get(String(params[0])) ?? null;
    }
    return null;
  },
  exec: async (sql: string, params: unknown[]) => {
    if (/INSERT INTO sessions/i.test(sql)) {
      const [token, userId] = params as [string, string];
      sessions.set(token, { user_id: userId, created_at: new Date().toISOString(), age: 0 });
      return;
    }
    if (/DELETE FROM sessions/i.test(sql)) {
      const [tokenOrUserId] = params as [string];
      for (const [k, v] of sessions.entries()) {
        if (k === tokenOrUserId || v.user_id === tokenOrUserId) sessions.delete(k);
      }
      return;
    }
    if (/UPDATE sessions SET token/i.test(sql)) {
      const [newToken, _ttl, oldToken] = params as [string, number, string];
      const row = sessions.get(oldToken);
      if (row) {
        sessions.delete(oldToken);
        sessions.set(newToken, { ...row, created_at: new Date().toISOString(), age: 0 });
        return [{ id: 1 }];
      }
      return [];
    }
    // TTL refresh updates are no-ops in the mock
    return;
  },
  query: async (sql: string, params: unknown[]) => {
    if (/sessions/i.test(sql) && params[0]) {
      const row = sessions.get(String(params[0]));
      if (row) return [{ user_id: row.user_id, created_at: row.created_at, age: row.age }];
    }
    return [];
  },
  getSql: () => null,
  withTransaction: async (fn: any) => fn({ one: dbMock().one, exec: dbMock().exec, query: dbMock().query }),
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);

const sessionModule = await import('../session');
const {
  COOKIE_NAME, SESSION_TTL_S, SESSION_ROTATE_AFTER_S,
  cookieSet, cookieClear, cookieClearLegacy, cookieClearLegacy2,
  readToken, hasLegacyCookie, cookieDomain,
  createSession, destroySession, destroyAllUserSessions,
  resolveSession, currentUserId, loadUser, resolveUser, currentUser,
} = sessionModule;

import { hashToken } from '../crypto.js';

const mockEnv = (): SessionEnv => ({});

const setUser = (id = 'user-1'): UserRecord => {
  const u: UserRecord = { id, email: 'test@example.com', slug: 'test', plan: 'free', plan_expires_at: null, status: 'active', is_admin: false };
  users.set(id, u);
  return u;
};

const setSession = async (token: string, userId: string, age = 0) => {
  const tokenHash = await hashToken(token);
  sessions.set(tokenHash, { user_id: userId, created_at: new Date(Date.now() - age * 1000).toISOString(), age });
};

// ============================================================================
//  Constants
// ============================================================================

describe('COOKIE_NAME', () => {
  it('is "yr_session"', () => {
    expect(COOKIE_NAME).toBe('yr_session');
  });
});

describe('SESSION_TTL_S', () => {
  it('is 30 days (2592000)', () => {
    expect(SESSION_TTL_S).toBe(2592000);
  });
});

describe('SESSION_ROTATE_AFTER_S', () => {
  it('is 24 hours (86400)', () => {
    expect(SESSION_ROTATE_AFTER_S).toBe(86400);
  });
});

// ============================================================================
//  Cookie helpers
// ============================================================================

describe('cookieSet', () => {
  it('returns a Set-Cookie header string', () => {
    const header = cookieSet('test-token');
    expect(typeof header).toBe('string');
    expect(header).toContain('yr_session=');
    expect(header).toContain('HttpOnly');
    expect(header).toContain('Secure');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain(`Max-Age=${SESSION_TTL_S}`);
    expect(header).toContain('Domain=.yourrank.site');
  });

  it('uses the domain from env when provided', () => {
    const header = cookieSet('test-token', { SESSION_COOKIE_DOMAIN: '.example.com' });
    expect(header).toContain('Domain=.example.com');
  });
});

describe('cookieClear', () => {
  it('returns a Set-Cookie header that clears the cookie', () => {
    const header = cookieClear();
    expect(header.startsWith('yr_session=;')).toBe(true);
    expect(header).toContain('Max-Age=0');
    expect(header).toContain('Domain=.yourrank.site');
  });
});

describe('cookieClearLegacy', () => {
  it('clears the legacy "sess" cookie', () => {
    const header = cookieClearLegacy();
    expect(header.startsWith('sess=;')).toBe(true);
    expect(header).toContain('Max-Age=0');
  });
});

describe('cookieClearLegacy2', () => {
  it('clears the legacy "gm_session" cookie', () => {
    const header = cookieClearLegacy2();
    expect(header.startsWith('gm_session=;')).toBe(true);
    expect(header).toContain('Max-Age=0');
  });
});

describe('cookieDomain', () => {
  it('defaults to .yourrank.site', () => {
    expect(cookieDomain({})).toBe('.yourrank.site');
  });

  it('respects env.SESSION_COOKIE_DOMAIN', () => {
    expect(cookieDomain({ SESSION_COOKIE_DOMAIN: '.example.com' })).toBe('.example.com');
  });
});

// ============================================================================
//  readToken / hasLegacyCookie
// ============================================================================

describe('readToken', () => {
  it('extracts the yr_session token from the Cookie header', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=abc123' } });
    expect(readToken(req)).toBe('abc123');
  });

  it('extracts token among multiple cookies', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'a=1; yr_session=mytoken; b=2' } });
    expect(readToken(req)).toBe('mytoken');
  });

  it('falls back to gm_session', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'gm_session=legacytoken' } });
    expect(readToken(req)).toBe('legacytoken');
  });

  it('prefers yr_session over gm_session when both present', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'gm_session=old; yr_session=new' } });
    expect(readToken(req)).toBe('new');
  });

  it('returns null when no cookie is present', () => {
    const req = new Request('https://example.com');
    expect(readToken(req)).toBeNull();
  });

  it('returns null for an empty cookie header', () => {
    const req = new Request('https://example.com', { headers: { Cookie: '' } });
    expect(readToken(req)).toBeNull();
  });
});

describe('hasLegacyCookie', () => {
  it('returns true when legacy "sess" cookie is present', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'sess=old' } });
    expect(hasLegacyCookie(req)).toBe(true);
  });

  it('returns false when only yr_session is present', () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=sometoken' } });
    expect(hasLegacyCookie(req)).toBe(false);
  });

  it('returns false when no cookies are present', () => {
    const req = new Request('https://example.com');
    expect(hasLegacyCookie(req)).toBe(false);
  });
});

// ============================================================================
//  Session CRUD
// ============================================================================

describe('createSession', () => {
  beforeEach(resetStores);

  it('creates a non-empty token', async () => {
    setUser('user-1');
    const token = await createSession(mockEnv(), 'user-1');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('stores the session in the mock DB', async () => {
    setUser('user-1');
    const token = await createSession(mockEnv(), 'user-1');
    const tokenHash = await hashToken(token);
    expect(sessions.has(tokenHash)).toBe(true);
    expect(sessions.get(tokenHash)?.user_id).toBe('user-1');
  });
});

describe('destroySession', () => {
  beforeEach(resetStores);

  it('removes the session from the mock DB', async () => {
    setUser('user-1');
    const token = await createSession(mockEnv(), 'user-1');
    const tokenHash = await hashToken(token);
    expect(sessions.has(tokenHash)).toBe(true);
    await destroySession(mockEnv(), token);
    expect(sessions.has(tokenHash)).toBe(false);
  });

  it('handles null token gracefully', async () => {
    await expect(destroySession(mockEnv(), null)).resolves.toBeUndefined();
  });

  it('handles non-existent token gracefully', async () => {
    await expect(destroySession(mockEnv(), 'nonexistent')).resolves.toBeUndefined();
  });
});

describe('destroyAllUserSessions', () => {
  beforeEach(resetStores);

  it('removes all sessions for a user', async () => {
    setUser('user-1');
    const t1 = await createSession(mockEnv(), 'user-1');
    const t2 = await createSession(mockEnv(), 'user-1');
    expect(sessions.size).toBe(2);
    await destroyAllUserSessions(mockEnv(), 'user-1');
    expect(sessions.size).toBe(0);
  });
});

// ============================================================================
//  Session resolution
// ============================================================================

describe('resolveSession', () => {
  beforeEach(resetStores);

  it('returns null for requests without a cookie', async () => {
    const req = new Request('https://example.com');
    const result = await resolveSession(req, mockEnv());
    expect(result.userId).toBeNull();
    expect(result.cookie).toBeNull();
  });

  it('returns the userId for a valid session', async () => {
    setUser('user-1');
    await setSession('tok123', 'user-1', 0);
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=tok123' } });
    const result = await resolveSession(req, mockEnv());
    expect(result.userId).toBe('user-1');
    expect(result.cookie).toBeNull();
  });

  it('returns a rotation cookie when the session is older than threshold', async () => {
    setUser('user-1');
    await setSession('oldtok', 'user-1', SESSION_ROTATE_AFTER_S + 1);
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=oldtok' } });
    const result = await resolveSession(req, mockEnv());
    expect(result.userId).toBe('user-1');
    expect(result.cookie).not.toBeNull();
    expect(result.cookie).toContain('yr_session=');
    const oldHash = await hashToken('oldtok');
    expect(sessions.has(oldHash)).toBe(false);
  });
});

describe('currentUserId', () => {
  beforeEach(resetStores);

  it('returns the user ID for a valid session', async () => {
    setUser('user-1');
    await setSession('tok123', 'user-1', 0);
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=tok123' } });
    expect(await currentUserId(req, mockEnv())).toBe('user-1');
  });

  it('returns null for an unknown session', async () => {
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=unknown' } });
    expect(await currentUserId(req, mockEnv())).toBeNull();
  });
});

describe('loadUser', () => {
  beforeEach(resetStores);

  it('returns the user record for a valid user ID', async () => {
    const u = setUser('user-1');
    const loaded = await loadUser(mockEnv(), 'user-1');
    expect(loaded).toEqual(u);
  });

  it('returns null for an unknown user', async () => {
    expect(await loadUser(mockEnv(), 'unknown')).toBeNull();
  });
});

describe('resolveUser', () => {
  beforeEach(resetStores);

  it('returns the user and no cookie for a valid session', async () => {
    const u = setUser('user-1');
    await setSession('tok123', 'user-1', 0);
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=tok123' } });
    const result = await resolveUser(req, mockEnv());
    expect(result.user).toEqual(u);
    expect(result.cookie).toBeNull();
  });

  it('returns null for an unauthenticated request', async () => {
    const req = new Request('https://example.com');
    const result = await resolveUser(req, mockEnv());
    expect(result.user).toBeNull();
    expect(result.cookie).toBeNull();
  });
});

describe('currentUser', () => {
  beforeEach(resetStores);

  it('returns the user record for a valid session', async () => {
    const u = setUser('user-1');
    await setSession('tok123', 'user-1', 0);
    const req = new Request('https://example.com', { headers: { Cookie: 'yr_session=tok123' } });
    expect(await currentUser(req, mockEnv())).toEqual(u);
  });

  it('returns null for an unauthenticated request', async () => {
    const req = new Request('https://example.com');
    expect(await currentUser(req, mockEnv())).toBeNull();
  });
});
