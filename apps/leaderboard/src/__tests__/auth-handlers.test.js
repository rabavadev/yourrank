import { describe, test, expect, mock, beforeEach } from "bun:test";

// Collaborators are injected into the handler under test.
const mockOne = mock(() => Promise.resolve(null));
const mockUnsafe = mock(() => Promise.resolve());
const mockExec = mock(() => Promise.resolve());
const mockQuery = mock(() => Promise.resolve([]));
const mockCreateSession = mock(() => Promise.resolve("new-session"));
const mockDestroyAllUserSessions = mock(() => Promise.resolve());

const db = {
  one: (...args) => mockOne(...args),
  exec: (...args) => mockExec(...args),
  query: (...args) => mockQuery(...args),
  withTransaction: async (fn) => fn({
    one: (...a) => mockOne(...a),
    exec: (...a) => mockExec(...a),
    query: (...a) => mockQuery(...a),
    unsafe: (...a) => mockUnsafe(...a),
  }),
  getSql: () => null,
};
const session = {
  createSession: (...args) => mockCreateSession(...args),
  destroySession: () => Promise.resolve(),
  destroyAllUserSessions: (...args) => mockDestroyAllUserSessions(...args),
  cookieSet: (t) => `yr_session=${t}`,
  cookieClear: () => "yr_session=",
  readToken: () => null,
  resolveSession: () => Promise.resolve({ userId: null, cookie: null }),
  loadUser: () => Promise.resolve(null),
  hasLegacyCookie: () => false,
  cookieClearLegacy: () => "sess=",
  SESSION_ROTATE_AFTER_S: 86400,
  SESSION_TTL_S: 2592000,
};

import { handleReset as handleResetImpl } from "../handlers/auth.js";
const handleReset = (request, env) => handleResetImpl(request, env, { ...db, ...session });

function req({ token = "valid-token", password = "Newpassword123!" } = {}) {
  const request = new Request("https://test.com/api/auth/reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  // readJson in auth.js prefers validatedBody when present.
  request.validatedBody = { token, password };
  return request;
}

describe("handleReset", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockUnsafe.mockReset();
    mockExec.mockReset();
    mockQuery.mockReset();
    mockCreateSession.mockReset();
    mockCreateSession.mockResolvedValue("new-session");
    mockDestroyAllUserSessions.mockReset();
    mockDestroyAllUserSessions.mockResolvedValue();
  });

  test("succeeds for a valid token and writes via tx.unsafe", async () => {
    mockOne.mockResolvedValueOnce({ user_id: "user-1" });

    const res = await handleReset(req(), {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    expect(mockUnsafe).toHaveBeenCalledTimes(2);
    expect(mockUnsafe.mock.calls[0][0]).toContain("UPDATE users SET password_hash");
    expect(mockUnsafe.mock.calls[1][0]).toContain("DELETE FROM password_resets");
    expect(mockDestroyAllUserSessions).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(res.headers.get("set-cookie")).toBe("yr_session=new-session");
  });

  test("returns 400 for an invalid or expired token", async () => {
    mockOne.mockResolvedValueOnce(null);

    const res = await handleReset(req({ token: "bad-token" }), {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(mockUnsafe).not.toHaveBeenCalled();
  });

  test("rejects a password that is too short", async () => {
    const res = await handleReset(req({ password: "short" }), {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(mockOne).not.toHaveBeenCalled();
  });
});
