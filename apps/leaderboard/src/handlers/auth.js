// Authentication handlers for signup, login, logout, password reset
import { hashPassword, verifyPassword, uuid, newToken, createSession, destroySession, destroyAllUserSessions, currentUser, isEmail, slugify, RESERVED, cookieSet, cookieClear, readToken, json, bad, ok, readJson, rateLimit, clientIp } from "../auth.js";
import { DEFAULT_EXTRA, getUserBoardsList } from "../site.js";
import { sendEmail, resetEmail } from "../email.js";
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS, priceUsd } from "../billing.js";
import {
  findUserByEmail, findUserByCredentials, findSiteByUserId, findUserForReset,
  findSubscriptionByUserId, createUser, createSite, updateUserPassword, findUserWithTotpSecret
} from "../data/auth.js";
import { getSql } from "../../../shared/db.js";

export async function handleSignup(request, env) {
  try {
    if (!(await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600))) return bad("Too many attempts. Try again later.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    let slug = slugify(body.slug || name || email.split("@")[0]);
    if (!isEmail(email)) return bad("Enter a valid email");
    if (password.length < 8) return bad("Password must be at least 8 characters");
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
        await getSql().begin(async (tx) => {
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
    return json({ ok: true, user: { id: userId, email, slug: finalSlug } }, 200, { "set-cookie": cookieSet(token) });
  } catch (e) {
    console.error("signup failed:", String(e?.message || e));
    return bad("Sign-up failed, please try again", 500);
  }
}

export async function handleLogin(request, env) {
  try {
    if (!(await rateLimit(env, `login:${clientIp(request)}`, 20, 600))) return bad("Too many attempts. Try again in a few minutes.", 429);
    const body = await readJson(request);
    if (!body) return bad("Invalid request");
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!isEmail(email) || !password) return bad("Email and password required");
    const user = await one("SELECT id,email,password_hash,password_salt,status FROM users WHERE email=$1", [email]);
    if (!user || !user.password_hash) return bad("Incorrect email or password", 401);
    const { ok, needsRehash } = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) return bad("Incorrect email or password", 401);
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
    const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
    const token = await createSession(env, user.id);
    return json({ ok: true, user: { id: user.id, email: user.email, slug: site?.slug || null } }, 200, { "set-cookie": cookieSet(token) });
  } catch (e) {
    console.error("login failed:", String(e?.message || e));
    return bad("Login failed, please try again", 500);
  }
}

export async function handleLogout(request, env) {
  await destroySession(env, readToken(request));
  return json({ ok: true }, 200, { "set-cookie": cookieClear() });
}

export async function handleMe(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return json({ ok: false, user: null });
    const site = await one("SELECT slug FROM sites WHERE user_id=$1", [user.id]);
    const boards = await getUserBoardsList(env, user.id);
    const plan = effectivePlan(user);
    // Check if the most recent active subscription is from a trial
    let isTrial = false;
    if (plan === "pro" && user.has_trial) {
      try {
        const sub = await one("SELECT provider FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1", [user.id]);
        isTrial = sub?.provider === "trial";
      } catch {}
    }
    return json({ ok: true, user: {
      id: user.id, email: user.email,
      plan, planExpiresAt: user.plan_expires_at || 0,
      status: user.status, isAdmin: !!user.is_admin, slug: site?.slug || null,
      limits: { players: PLAN_LIMITS[plan], boards: BOARD_LIMITS[plan] },
      proPrice: priceUsd(env, "pro"),
      hasTrial: !!user.has_trial,
      isTrial,
      boards,
    } });
  } catch (e) {
    console.error("handleMe error:", String(e?.message || e), String(e?.stack || ""));
    return json({ ok: false, error: "Internal error", detail: String(e?.message || e) }, 500);
  }
}

// POST /api/auth/forgot — always answers ok; never reveals whether the account exists.
export async function handleForgot(request, env) {
  if (!(await rateLimit(env, `forgot:${clientIp(request)}`, 5, 3600))) return bad("Too many attempts. Try again later.", 429);
  const body = await readJson(request);
  const email = String(body?.email || "").trim().toLowerCase();
  if (!isEmail(email)) return bad("Enter a valid email");
  // Per-email rate limit: 3 resets per hour (prevents email bomb abuse).
  if (!(await rateLimit(env, `forgot-email:${email}`, 3, 3600))) return bad("Too many attempts. Try again later.", 429);
  const user = await one("SELECT id, email FROM users WHERE email=$1", [email]);
  if (user) {
    const token = newToken();
    await env.SESSIONS.put(`reset:${token}`, user.id, { expirationTtl: 3600 });
    const link = `${new URL(request.url).origin}/reset?token=${token}`;
    const mail = resetEmail(link);
    const result = await sendEmail(env, { to: user.email, ...mail });
    if (!result.sent) {
      console.error("[forgot]: email send failed", result.reason);
      return bad("Couldn't send the reset email right now. Please try again in a few minutes or contact support.", 502);
    }
  }
  return ok({ message: "If that account exists, a reset link is on its way." });
}

// POST /api/auth/reset — { token, password }
export async function handleReset(request, env) {
  const body = await readJson(request);
  const token = String(body?.token || "");
  const password = String(body?.password || "");
  if (!token) return bad("Missing reset token");
  if (password.length < 8) return bad("Password must be at least 8 characters");
  const userId = await env.SESSIONS.get(`reset:${token}`);
  if (!userId) return bad("This reset link is invalid or expired. Ask for a new one.", 400);
  const { hash, salt } = await hashPassword(password);
  await exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, userId]);
  await env.SESSIONS.delete(`reset:${token}`);
  // Revoke EVERY other live session for this user before issuing a fresh one.
  // Without this, a stolen session survives a victim-initiated reset for up to
  // the 30-day KV TTL. The per-user token index in shared/session.js makes this
  // possible without a schema change.
  await destroyAllUserSessions(env, userId);
  const session = await createSession(env, userId);
  return json({ ok: true }, 200, { "set-cookie": cookieSet(session) });
}
