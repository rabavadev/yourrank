# GroupsMix — Shared Cross-Worker Session Spec

One session, two Workers, one domain. A user who logs in on the leaderboard
Worker is authenticated on the bot Worker with **no second login**, and vice
versa.

Files: [`session.js`](./session.js) (leaderboard, JS) · [`session.ts`](./session.ts) (bot, TS). Identical behaviour.

---

## 1. The model

| Thing            | Value                                                        |
|------------------|-------------------------------------------------------------|
| Cookie name      | `gm_session`                                                |
| Cookie domain    | `Domain=.yourrank.site` (env `SESSION_COOKIE_DOMAIN`; defaults to `.yourrank.site`) |
| Cookie flags     | `Path=/; HttpOnly; Secure; SameSite=Lax`                     |
| Token            | 32 random bytes, hex (64 chars)                              |
| KV namespace     | `SESSIONS` — **same namespace id bound in both Workers**     |
| KV key           | `sess:<token>`                                               |
| KV value         | the user's **UUID** from the unified `users` table (bare)    |
| TTL              | 30 days (`2592000` s), on the KV entry and the cookie Max-Age|

The KV **value is just the UUID string** — no JSON, no signature, no per-Worker
shape. Both Workers already understand "UUID → `users.id`", so whichever Worker
reads the cookie resolves the same person. This is the whole trick.

### Why `Domain=.yourrank.site`
The leaderboard serves `yourrank.site/*`; the bot serves `yourrank.site/bot/*`,
`/hook/*`, `/r/*`, etc. — **same host**. A host-only cookie would already be
sent to every path on that host, but setting an explicit `Domain=.yourrank.site`
also covers any future subdomain (e.g. `app.yourrank.site`) and makes the intent
explicit. Both Workers set the **exact same** cookie attributes so neither
clobbers the other with a narrower cookie.

### Why KV, not a signed stateless token
The bot Worker today uses an HMAC-signed stateless cookie (`sess`, key
`TOKEN_ENC_KEY`, see `dashboard.ts`). That **cannot** be shared: the leaderboard
Worker can't verify the bot's HMAC and vice-versa unless they share the secret
and the exact encoding — fragile, and it gives no real server-side logout.
A KV-backed opaque token is verifiable by any Worker that binds the namespace,
supports instant revoke (delete the key), and is the shape the leaderboard
already uses. **The bot Worker migrates off HMAC to this KV model.**

---

## 2. The three functions both Workers call

```
createSession(env, userId) -> token      // put sess:<token> = userId, TTL 30d
readToken(req)             -> token|null  // parse gm_session from Cookie header
currentUser(req, env, loadUser) -> user|null
```

Plus `currentUserId(req, env)` (resolve UUID without a DB read),
`destroySession(env, token)`, `cookieSet(token)`, `cookieClear()`.

`currentUser` takes an **injected `loadUser(env, uid)`** so this module has zero
DB coupling and drops into either Worker unchanged (leaderboard uses Supabase
REST, owned by another agent; bot uses pg/Hyperdrive):

```js
// leaderboard Worker (JS)  — DB layer owned by another agent; call their loader
const user = await currentUser(req, env, (env, uid) => loadUserById(env, uid));

// bot Worker (TS)
const user = await currentUser(req, env, (env, uid) =>
  one(`SELECT id, email, display_name, telegram_user_id, plan,
              plan_expires_at, status, is_admin
         FROM users WHERE id = $1`, [uid]));
```

---

## 3. wrangler.toml — both Workers bind the SAME namespace

Create ONE KV namespace and paste its **id** into **both** `wrangler.toml`:

```toml
# leaderboard/wrangler.toml  AND  bot/wrangler.toml — identical block
[[kv_namespaces]]
binding = "SESSIONS"
id      = "<the one shared namespace id>"
```

> The `binding` name must be `SESSIONS` in both; the `id` must be the exact same
> namespace. A different id = two isolated stores = broken cross-Worker auth.
> This is the #1 setup mistake — verify the id matches character-for-character.

---

## 4. Login / logout flow (who sets the cookie)

- **Password login** (leaderboard `/login`): verify PBKDF2 → `createSession` →
  `Set-Cookie: cookieSet(token)`.
- **Telegram login** (bot's Telegram widget, but the login route can live on
  either Worker): verify the Telegram hash → upsert/find the `users` row →
  `createSession` → `Set-Cookie: cookieSet(token)`. See `telegram-login.md`.
- **Logout**: a single `/logout` (leaderboard Worker) does
  `destroySession(env, readToken(req))` then `Set-Cookie: cookieClear()`.
  Because the cookie is `Domain=.yourrank.site`, the cleared cookie applies
  host-wide, so the bot side is logged out too. The nav's Logout link points at
  `/logout`.

---

## 5. Reusing PBKDF2 from the old auth.js

Keep the leaderboard's existing `hashPassword` / `verifyPassword` (they are
correct and DB-agnostic). Only the **session** functions change: swap the old
`createSession` / `readToken` / `currentUser` from `auth.js` for the ones in
`shared/session.js`. The cookie name changes `rk_session` → `gm_session`.

### Migration grace period
Existing users hold an `rk_session` cookie whose KV entry is `sess:<token>` —
the **same KV prefix**, only the cookie name differs. `session.js` exports
`readTokenWithLegacy(req)` which reads `gm_session` first, then falls back to
`rk_session`. Use it for ~30 days after cutover, and on any legacy hit,
re-issue a fresh `gm_session` cookie (and optionally clear `rk_session`).
After the window, drop the legacy read.

---

## 6. Race conditions & correctness notes

1. **Same cookie, same KV, same value shape** eliminates the classic split-brain
   where one Worker writes a session the other can't read. Enforced by shipping
   ONE source module (`session.js`) and a synced port (`session.ts`).
2. **No read-modify-write on the session** — value is immutable (just the UUID),
   so concurrent reads across both Workers can't corrupt it.
3. **KV is eventually consistent (~seconds globally).** A freshly created session
   is readable in the same region immediately; a login on one edge then an
   instant cross-Worker request from a far edge could miss by a beat. In
   practice both Workers run on the same edge for the same user, so this is a
   non-issue; if paranoid, the login response can carry the token forward.
4. **Logout revocation is instant-ish** (KV delete), unlike a stateless token
   which stays valid until expiry. This is a security win of the KV model.
5. **Rate-limit / counter keys** (`rl:` prefix in old `auth.js`) also live in
   `SESSIONS` KV and are unaffected — they're separate keyspace.
