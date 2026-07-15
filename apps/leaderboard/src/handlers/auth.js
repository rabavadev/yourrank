import { withTransaction, one, exec } from "../../../../shared/db.js";
// Authentication handlers for signup, login, logout, password reset
import { hashPassword, verifyPassword, uuid, newToken, createSession, destroySession, destroyAllUserSessions, currentUser, isEmail, slugify, RESERVED, cookieSet, cookieClear, readToken, json, bad, ok, readJson, rateLimit, clientIp } from "../auth.js";
import { trackActivation } from "../../../../shared/activation-funnel.js";
import { DEFAULT_EXTRA, getUserBoardsList } from "../site.js";
import { sendEmail, resetEmail } from "../email.js";
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS, priceUsd } from "../billing.js";
import {
  findUserByEmail, findSiteBySlug, createUser, createSite
} from "../data/auth.js";

export async function handleSignup(request, env) {
  try {
    if (!(await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600)).ok) return bad("Too many attempts. Try again later.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    let slug = slugify(body.slug || name || email.split("@")[0]);
    if (!isEmail(email)) return bad("Enter a valid email");
    if (password.length < 8) return bad("Password must be at least 8 characters");
    if (!name || name.trim().length < 2) return bad("Display name must be at least 2 characters");
    if (!slug || RESERVED.has(slug)) slug = `${slug || "site"}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = await findUserByEmail(email);
    if (existing) return bad("If this email isn't already registered, check your inbox to confirm.");
    let finalSlug = slug;
    for (let n = 2; ; n++) { const c = await findSiteBySlug(finalSlug); if (!c) break; finalSlug = `${slug}-${n}`; }
    const { hash, salt } = await hashPassword(password);
    const userId = uuid();
    // created_at/updated_at default to now(); id generated in-app for consistency.
    // The slug check above is a TOCTOU race: two concurrent signups choosing the
    // same slug can both pass the SELECT, then the second INSERT hits sites.slug
    // UNIQUE and threw an unhandled 500. Wrap the inserts; on a unique violation
    // (23505) on the slug, append a short random suffix and retry once.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await withTransaction(async (tx) => {
          await createUser(tx, userId, email, hash, salt);
          await createSite(tx, uuid(), userId, finalSlug, name || finalSlug, DEFAULT_EXTRA);
        });
        break;
      } catch (e) {
        const msg = String(e?.message || e);
        if (/23505/.test(msg) && attempt < 2) {
          // unique violation — likely the slug raced; retry with a fresh suffix
          finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
          continue;
        }
        // users.email UNIQUE collision (already checked above, but concurrent) or
        // a real error: surface a clean message, never a raw 500.
        return bad("If this email isn't already registered, check your inbox to confirm.");
      }
    }
    const token = await createSession(env, userId);
    trackActivation("leaderboard", userId, "signup", { email });
    return json({ ok: true, user: { id: userId, email, slug: finalSlug } }, 200, { "set-cookie": cookieSet(token, env) });
  } catch (e) {
    console.error("signup failed:", String(e?.message || e));
    return bad("Sign-up failed, please try again", 500);
  }
}

export async function handleLogin(request, env) {
  try {
    // SEC-110: IP-based rate limit
    if (!(await rateLimit(env, `login:${clientIp(request)}`, 20, 600)).ok) return bad("Too many attempts. Try again in a few minutes.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!isEmail(email) || !password) return bad("Email and password required");
    // SEC-110: Per-account rate limit (prevents brute-force across multiple IPs)
    if (!(await rateLimit(env, `login-email:${email}`, 10, 900)).ok) return bad("Too many attempts on this account. Try again later.", 429);
    // QA-002: Check per-account lockout before password verification
    const user = await one("SELECT id,email,password_hash,password_salt,status,failed_login_count,locked_until FROM users WHERE email=$1", [email]);
    if (user?.locked_until && new Date(user.locked_until) > new Date()) {
      return bad("Account temporarily locked due to too many failed attempts. Try again later.", 429);
    }
    if (!user || !user.password_hash) return bad("Incorrect email or password", 401);
    const { ok, needsRehash } = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) {
      // QA-002: Increment failed login counter; lock account after 10 failures
      await exec("UPDATE users SET failed_login_count = failed_login_count + 1 WHERE email=$1", [email]);
      if ((user.failed_login_count || 0) + 1 >= 10) {
        await exec("UPDATE users SET locked_until = NOW() + INTERVAL '30 minutes' WHERE email=$1", [email]);
      }
      return bad("Incorrect email or password", 401);
    }
    // QA-002: Successful login — reset lockout counter
    await exec("UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE email=$1", [email]);
    // BE-014: Use generic error even for suspended accounts to prevent
    // account enumeration. Previously the suspended message confirmed the
    // email existed, distinguishing it from a wrong-password error.
    if (user.status === "suspended") return bad("Incorrect email or password", 403);
    // Lazy upgrade: if the stored hash used fewer PBKDF2 iterations than the
    // current target, re-hash at the new count and persist — no password reset
    // needed. Fire-and-forget so login latency isn't dominated by the rehash.
    if (needsRehash) {
      const { hash, salt } = await hashPassword(password);
      exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, user.id]).catch(() => {});
    }
    // PERF-003-v8: Parallelize site lookup + session creation (were sequential)
    const [site, token] = await Promise.all([
      one("SELECT slug FROM sites WHERE user_id=$1", [user.id]),
      createSession(env, user.id),
    ]);
    return json({ ok: true, user: { id: user.id, email: user.email, slug: site?.slug || null } }, 200, { "set-cookie": cookieSet(token, env) });
  } catch (e) {
    console.error("login failed:", String(e?.message || e));
    return bad("Login failed, please try again", 500);
  }
}

export async function handleLogout(request, env) {
  await destroySession(env, readToken(request));
  return json({ ok: true }, 200, { "set-cookie": cookieClear(env) });
}

export async function handleMe(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return json({ ok: false, user: null }, 401);
    const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
    const boards = await getUserBoardsList(env, user.id);
    const plan = effectivePlan(user);
    // Inspect the most recent subscription row for trial + cancellation state so
    // the billing UI can reflect "cancelled — Pro until X" instead of looking
    // identical to an active subscription after a cancel.
    let isTrial = false;
    let subscriptionStatus = null;
    try {
      const sub = await one("SELECT provider, status FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1", [user.id]);
      subscriptionStatus = sub?.status || null;
      if (plan === "pro" && user.has_trial) isTrial = sub?.provider === "trial";
    } catch (e) { console.error("[handleMe] subscription status check failed:", e); }
    return json({ ok: true, user: {
      id: user.id, email: user.email, displayName: user.display_name || null,
      plan, planExpiresAt: user.plan_expires_at || 0,
      status: user.status, isAdmin: !!user.is_admin, slug: site?.slug || null,
      limits: { players: PLAN_LIMITS[plan], boards: BOARD_LIMITS[plan] },
      proPrice: priceUsd(env, "pro"),
      hasTrial: !!user.has_trial,
      isTrial,
      subscriptionStatus,
      boards,
    } });
  } catch (e) {
    console.error("handleMe error:", String(e?.message || e), String(e?.stack || ""));
    console.error("[handleMe]", e);
    return json({ ok: false, error: "Internal error" }, 500);
  }
}

// POST /api/auth/forgot — always answers ok; never reveals whether the account exists.
// SEC-702: try/catch ensures reset tokens are never logged even if an unexpected
// error occurs during the email send or KV write.
export async function handleForgot(request, env) {
  try {
    if (!(await rateLimit(env, `forgot:${clientIp(request)}`, 5, 3600)).ok) return bad("Too many attempts. Try again later.", 429);
    const body = await readJson(request);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!isEmail(email)) return bad("Enter a valid email");
    // Per-email rate limit: 3 resets per hour (prevents email bomb abuse).
    if (!(await rateLimit(env, `forgot-email:${email}`, 3, 3600)).ok) return bad("Too many attempts. Try again later.", 429);
    const user = await one("SELECT id, email FROM users WHERE email=$1", [email]);
    if (user) {
      const token = newToken();
      await exec("INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, now() + INTERVAL '1 hour') ON CONFLICT (token) DO UPDATE SET user_id=$2, expires_at=now() + INTERVAL '1 hour'", [token, user.id]);
      const link = `${new URL(request.url).origin}/reset?token=${token}`;
      const mail = resetEmail(link);
      const result = await sendEmail(env, { to: user.email, ...mail });
      if (!result.sent) {
        // SEC-702: Log only the failure reason, never the token or link.
        // BUG-001 fix: still return success to prevent email enumeration.
        console.error("[forgot]: email send failed", result.reason);
      }
    }
    return ok({ message: "If that account exists, a reset link is on its way." });
  } catch (e) {
    // SEC-702: Redact any hex tokens that may have leaked into the error message.
    console.error("[forgot] failed:", String(e?.message || e).replace(/[a-f0-9]{32,}/gi, '[REDACTED]'));
    return bad("Couldn't process your request. Please try again.", 500);
  }
}

// POST /api/auth/reset — { token, password }
// SEC-702: Wrap in try/catch that redacts the reset token before logging.
export async function handleReset(request, env) {
  try {
    const body = await readJson(request);
    const token = String(body?.token || "");
    const password = String(body?.password || "");
    if (!token) return bad("Missing reset token");
    if (password.length < 8) return bad("Password must be at least 8 characters");
    const resetRow = await one("SELECT user_id FROM password_resets WHERE token=$1 AND expires_at > now()", [token]);
    const userId = resetRow?.user_id ?? null;
    if (!userId) return bad("This reset link is invalid or expired. Ask for a new one.", 400);
    const { hash, salt } = await hashPassword(password);
    await exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, userId]);
    await exec("DELETE FROM password_resets WHERE token=$1", [token]);
    // Revoke EVERY other live session for this user before issuing a fresh one.
    // Without this, a stolen session survives a victim-initiated reset for up to
    // the 30-day KV TTL. The per-user token index in shared/session.js makes this
    // possible without a schema change.
    await destroyAllUserSessions(env, userId);
    const session = await createSession(env, userId);
    return json({ ok: true }, 200, { "set-cookie": cookieSet(session, env) });
  } catch (e) {
    // SEC-702: Never log the reset token — redact it from any error context.
    console.error("reset failed:", String(e?.message || e).replace(/[a-f0-9]{32,}/gi, '[REDACTED]'));
    return bad("Password reset failed. Please try again.", 500);
  }
}
