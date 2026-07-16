// Security center handlers: password change, active sessions, and GDPR/CCPA export.
import { one, exec, query } from "../../../../shared/db.js";
import { hashToken } from "../../../../shared/crypto.js";
import {
  currentUser, createSession, readToken, cookieSet, destroyAllUserSessions,
  json, bad, ok, readJson, rateLimit, clientIp, hashPassword, verifyPassword,
} from "../auth.js";
import { updateUserPassword } from "../data/auth.js";

const MIN_PASSWORD_LENGTH = 8;

async function currentSessionHash(req) {
  // If the current request just rotated the session, the new token is in
  // req._sessionCookies (set by currentUser). Otherwise read it from the request.
  const setCookies = req._sessionCookies || [];
  for (const header of setCookies) {
    const m = header.match(/(?:^|;\s*)yr_session=([^;]+)/);
    if (m) return hashToken(decodeURIComponent(m[1]));
  }
  const token = readToken(req);
  if (!token) return null;
  return hashToken(token);
}

export async function handleChangePassword(request, env) {
  try {
    if (!(await rateLimit(env, `password-change:${clientIp(request)}`, 10, 3600)).ok) {
      return bad("Too many attempts. Try again later.", 429);
    }
    const user = await currentUser(request, env);
    if (!user) return bad("unauthorized", 401);

    const body = await readJson(request);
    const current = String(body?.currentPassword || "");
    const password = String(body?.password || "");
    if (!current || !password) return bad("Current password and new password are required");
    if (password.length < MIN_PASSWORD_LENGTH) return bad("Password must be at least 8 characters");

    const row = await one("SELECT password_hash, password_salt FROM users WHERE id=$1", [user.id]);
    if (!row?.password_hash) return bad("Password change is not available for this account", 400);

    const { ok: pwOk } = await verifyPassword(current, row.password_salt, row.password_hash);
    if (!pwOk) return bad("Current password is incorrect", 401);

    const { hash, salt } = await hashPassword(password);
    await updateUserPassword(user.id, hash, salt);
    await destroyAllUserSessions(env, user.id);
    const token = await createSession(env, user.id);

    return json({ ok: true, message: "Password updated. All other sessions have been signed out." }, 200, {
      "set-cookie": cookieSet(token, env),
    });
  } catch (e) {
    console.error("change password failed:", String(e?.message || e));
    return bad("Password change failed. Please try again.", 500);
  }
}

export async function handleListSessions(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return bad("unauthorized", 401);

    const currentHash = await currentSessionHash(request);
    const rows = await query(
      `SELECT token, created_at, expires_at
         FROM sessions
        WHERE user_id=$1 AND expires_at > now()
        ORDER BY created_at DESC`,
      [user.id]
    );

    const sessions = rows.map((r) => {
      const date = (d) => (d ? new Date(d).toISOString() : null);
      return {
        id: String(r.token).slice(0, 16),
        createdAt: date(r.created_at),
        expiresAt: date(r.expires_at),
        current: r.token === currentHash,
      };
    });

    return ok({ sessions });
  } catch (e) {
    console.error("list sessions failed:", String(e?.message || e));
    return bad("Could not load sessions.", 500);
  }
}

export async function handleRevokeOtherSessions(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return bad("unauthorized", 401);

    const currentHash = await currentSessionHash(request);
    if (!currentHash) {
      // No current token means rotation just happened or guest — sign out all.
      await destroyAllUserSessions(env, user.id);
      return ok({ signedOutAll: true });
    }

    await exec("DELETE FROM sessions WHERE user_id=$1 AND token<>$2", [user.id, currentHash]);
    return ok({ message: "Other sessions signed out." });
  } catch (e) {
    console.error("revoke sessions failed:", String(e?.message || e));
    return bad("Could not revoke sessions.", 500);
  }
}

async function collectExportData(userId) {
  const userCols = `id, email, display_name, telegram_user_id, telegram_username,
    telegram_id, telegram_linked_at, plan, plan_expires_at, status, is_admin,
    postback_key, created_at, updated_at, has_trial, failed_login_count, locked_until`;
  const user = await one(`SELECT ${userCols} FROM users WHERE id=$1`, [userId]);

  const sites = await query(
    `SELECT id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at,
            reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain,
            domain_status, suspended, telegram_chat_id, telegram_notify
       FROM sites WHERE user_id=$1`,
    [userId]
  );

  const siteIds = sites.map((s) => s.id);
  const [players, archives] = siteIds.length
    ? await Promise.all([
        query("SELECT * FROM players WHERE site_id = ANY($1)", [siteIds]),
        query("SELECT * FROM archives WHERE site_id = ANY($1)", [siteIds]),
      ])
    : [[], []];

  const [subscriptions, payments, sessions, offers, conversions, bots] = await Promise.all([
    query("SELECT id, plan, status, provider, current_period_end, created_at FROM subscriptions WHERE user_id=$1", [userId]),
    query("SELECT id, subscription_id, provider, invoice_id, amount, currency, tx_ref, status, created_at, updated_at, plan_tier FROM payments WHERE user_id=$1", [userId]),
    query("SELECT created_at, expires_at, twofa_verified FROM sessions WHERE user_id=$1", [userId]),
    query("SELECT id, casino_id, label, referral_url, promo_code, bonus_text, priority, is_active, created_at, updated_at FROM offers WHERE owner_id=$1", [userId]),
    query("SELECT id, offer_id, click_ref, event, amount, currency, raw, ts FROM conversions WHERE owner_id=$1", [userId]),
    query("SELECT id, tg_bot_id, username, token_hint, status, welcome_message, created_at, updated_at FROM bots WHERE owner_id=$1", [userId]),
  ]);

  const offerIds = offers.map((o) => o.id);
  const shortLinks = offerIds.length
    ? await query("SELECT sl.id, sl.offer_id, sl.slug, sl.source, sl.created_at FROM short_links sl WHERE sl.offer_id = ANY($1)", [offerIds])
    : [];

  const botIds = bots.map((b) => b.id);
  const botCommands = botIds.length
    ? await query("SELECT bot_id, command, response, offer_id, is_enabled FROM bot_commands WHERE bot_id = ANY($1)", [botIds])
    : [];

  return {
    exportedAt: new Date().toISOString(),
    user,
    sites,
    players,
    archives,
    subscriptions,
    payments,
    sessions,
    offers,
    shortLinks,
    conversions,
    bots,
    botCommands,
  };
}

export async function handleExportData(request, env) {
  try {
    const user = await currentUser(request, env);
    if (!user) return bad("unauthorized", 401);

    const exportId = `${Date.now()}-${user.id}`;
    const payload = {
      ok: true,
      exportId,
      data: await collectExportData(user.id),
    };

    return json(payload, 200, {
      "content-disposition": `attachment; filename="yourrank-export-${exportId}.json"`,
    });
  } catch (e) {
    console.error("data export failed:", String(e?.message || e));
    return bad("Data export failed. Please try again.", 500);
  }
}
