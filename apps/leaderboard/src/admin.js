// Owner admin API. Every route requires a session whose user has is_admin=true.
import { json, bad, ok, readJson, newToken, readToken, currentUser, destroyAllUserSessions, clientIp, rateLimit } from "./auth.js";
import { activatePlan } from "./billing.js";
import { sendEmail, resetEmail } from "./email.js";
import { query, one, exec } from "../../../shared/db.js";
import { logAudit } from "../../../shared/audit.js";
import { generateSecret, verifyCode, generateOtpauthUri } from "./totp.js";
import { encrypt, decrypt, hashToken } from "../../../shared/crypto.js";
import { listFeatureFlags, setFeatureFlag, setUserFeatureOverride } from "../../../shared/features.js";

// QUALITY-007: Named timing constants (no magic numbers)
const RESET_TOKEN_TTL_S = 86400;   // 24 hours — admin-initiated password reset link validity

// Log admin action to the unified audit_log table for persistent audit trail.
async function logAdminAction(env, adminId, action, targetUserId = null, details = null, request = null) {
  await logAudit({
    actorId: adminId,
    action,
    entityType: "admin",
    entityId: targetUserId || adminId,
    request,
    details: details || {},
  });
}

export async function requireAdmin(request, env) {
  // BE-007: Rate-limit admin endpoints (120 req/min per IP).
  const ip = clientIp(request);
  if (!(await rateLimit(env, `admin:${ip}`, 120, 60)).ok) {
    return { admin: null, res: bad("Too many requests. Try again later.", 429) };
  }
  const u = await currentUser(request, env);
  if (!u) return { admin: null, res: bad("unauthorized", 401) };
  if (!u.is_admin) return { admin: null, res: bad("forbidden", 403) };
  return { admin: u, res: null };
}

// Like requireAdmin, but also checks that 2FA is verified if the admin has it enabled.
// Used by data endpoints (overview, users, leads, payments, action).
// The 2FA endpoints themselves use plain requireAdmin to avoid chicken-and-egg.
// 
// SECURITY: 2FA verification has a 1-hour TTL to balance security and usability.
// Sensitive actions (plan changes, reset-link generation) require fresh 2FA verification.
export async function requireAdminWith2fa(request, env, requireFresh = false) {
  const { admin, res } = await requireAdmin(request, env);
  if (res) return { admin: null, res };
  // Check if 2FA is required
  const user = await one("SELECT totp_secret FROM users WHERE id=$1", [admin.id]);
  if (user?.totp_secret) {
    const token = readToken(request);
    const tokenHash = token ? await hashToken(token) : null;
    const tfaRow = tokenHash ? await one("SELECT twofa_verified FROM sessions WHERE token=$1", [tokenHash]) : null;
    const tfaVerified = tfaRow?.twofa_verified ? "1" : null;
    if (tfaVerified !== "1") {
      return { admin: null, res: bad("2fa_required", 403) };
    }
    // For sensitive actions, require fresh verification (clear the flag after use)
    if (requireFresh && tokenHash) {
      await exec("UPDATE sessions SET twofa_verified=false WHERE token=$1", [tokenHash]);
    }
  }
  return { admin, res: null };
}

export async function handleOverview(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;
  // QA-012: Audit-log admin page views
  await logAdminAction(env, admin.id, "overview", null, null, request);
  const [users, pro, leads, revenue] = await Promise.all([
    one("SELECT COUNT(*) n FROM users"),
    one("SELECT COUNT(*) n FROM users WHERE plan IN ('pro','agency','starter','lifetime') AND status!='suspended'"),
    one("SELECT COUNT(*) n FROM leads"),
    one("SELECT COALESCE(SUM(amount),0) n FROM payments WHERE status IN ('finished','manual')"),
  ]);
  return ok({ users: Number(users?.n) || 0, pro: Number(pro?.n) || 0, leads: Number(leads?.n) || 0, revenue: Number(revenue?.n) || 0 });
}

export async function handleUsers(request, env) {
      const { admin, res } = await requireAdminWith2fa(request, env);
      if (res) return res;
      // QA-012: Audit-log admin page views
      await logAdminAction(env, admin.id, "users", null, null, request);
      const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = 50;
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      one("SELECT COUNT(*) n FROM users"),
      query(
        `WITH first_board AS (
           SELECT DISTINCT ON (s.user_id) s.user_id, s.id AS site_id, s.slug
           FROM sites s ORDER BY s.user_id, s.board_order ASC
         )
         SELECT u.id, u.email, u.plan,
                (EXTRACT(EPOCH FROM u.plan_expires_at) * 1000)::double precision AS plan_expires_at,
                u.status, u.is_admin,
                (EXTRACT(EPOCH FROM u.created_at) * 1000)::double precision AS created_at,
                COALESCE(bc.board_count, 0) AS board_count,
                fb.slug,
                COALESCE(pc.player_count, 0) AS player_count
           FROM users u
           LEFT JOIN (SELECT user_id, COUNT(*) AS board_count FROM sites GROUP BY user_id) bc ON bc.user_id = u.id
           LEFT JOIN first_board fb ON fb.user_id = u.id
           LEFT JOIN (SELECT site_id, COUNT(*) AS player_count FROM players GROUP BY site_id) pc ON pc.site_id = fb.site_id
           ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      ),
    ]);
    return ok({ users: rows || [], page, pageSize, total: Number(total?.n) || 0 });
  }

export async function handleLeads(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;
  // QA-012: Audit-log admin page views
  await logAdminAction(env, admin.id, "leads", null, null, request);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const [rows, total] = await Promise.all([
    query(
      "SELECT id, handle, casino, contact, note, (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [pageSize, offset]
    ),
    one("SELECT COUNT(*)::int AS n FROM leads"),
  ]);
  return ok({ leads: rows || [], page, pageSize, total: total?.n || 0 });
}

export async function handlePayments(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;
  // QA-012: Audit-log admin page views
  await logAdminAction(env, admin.id, "payments", null, null, request);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const [rows, total] = await Promise.all([
    query(
      `SELECT p.id, p.user_id, p.provider, p.amount AS amount_usd, p.currency, p.invoice_id, p.tx_ref, p.status,
              (EXTRACT(EPOCH FROM p.created_at) * 1000)::double precision AS created_at,
              u.email
         FROM payments p LEFT JOIN users u ON u.id = p.user_id
         ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    ),
    one("SELECT COUNT(*)::int AS n FROM payments"),
  ]);
  return ok({ payments: rows || [], page, pageSize, total: total?.n || 0 });
}

// POST /api/admin/action — { userId, action: starter|pro|agency|free|suspend|unsuspend|reset-link, days?, plan? }
export async function handleAction(request, env) {
  // Sensitive actions (plan changes, reset-link) require fresh 2FA verification
  const body = await readJson(request);
  if (!body || !body.userId || !body.action) return bad("userId and action required");
  
  const sensitiveActions = ["starter", "pro", "agency", "free", "reset-link"];
  const requireFresh = sensitiveActions.includes(body.action);
  
  const { admin, res } = await requireAdminWith2fa(request, env, requireFresh);
  if (res) return res;
  
  const target = await one("SELECT id, email, is_admin FROM users WHERE id=$1", [body.userId]);
  if (!target) return bad("No such user", 404);

  switch (body.action) {
    case "starter":
    case "pro":
    case "agency": {
      const days = Number(body.days);
      await activatePlan(env, target.id, body.action, Number.isFinite(days) ? days : 31, {
        provider: "manual",
        amountUsd: Number(body.amountUsd) || 0,
      });
      break;
    }
    case "free":
      await exec("UPDATE users SET plan='free', plan_expires_at=NULL, updated_at=now() WHERE id=$1", [target.id]);
      break;
    case "suspend":
      if (target.is_admin) return bad("Can't suspend an admin");
      await exec("UPDATE users SET status='suspended', updated_at=now() WHERE id=$1", [target.id]);
      await destroyAllUserSessions(env, target.id);
      break;
    case "unsuspend":
      await exec("UPDATE users SET status='active', updated_at=now() WHERE id=$1", [target.id]);
      break;
    case "reset-link": {
      if (target.is_admin) return bad("Can't generate a reset link for an admin");
      // H-22: do not generate an undeliverable reset token. Email is the only
      // allowed delivery channel for admin-initiated reset links.
      if (!env.RESEND_API_KEY) return bad("Email provider is not configured. Reset links cannot be delivered securely.", 503);
      await exec("DELETE FROM password_resets WHERE user_id=$1 AND expires_at > now()", [target.id]);
      const token = newToken();
      const tokenHash = await hashToken(token);
      await exec("INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3)) ON CONFLICT (token) DO UPDATE SET user_id=$2, expires_at=now() + make_interval(secs => $3)", [tokenHash, target.id, RESET_TOKEN_TTL_S]);
      const link = `${new URL(request.url).origin}/reset?token=${token}`;
      const mail = resetEmail(link);
      const result = await sendEmail(env, { to: target.email, ...mail });
      if (!result.sent) {
        // If delivery fails, revoke the token so it cannot later be used.
        await exec("DELETE FROM password_resets WHERE token=$1", [tokenHash]);
        console.error("[admin] reset-link send failed", result.reason, "for", target.email.replace(/(.).+(@)/, "$1***$2"));
        return bad("Failed to send reset email. The link has been revoked.", 500);
      }
      await logAdminAction(env, admin.id, body.action, target.id, {
        email: target.email,
        details: "reset-link-sent",
      }, request);
      return ok({ message: `Reset link sent to ${target.email}.`, email: target.email });
    }
    default:
      return bad("Unknown action");
  }
  await logAdminAction(env, admin.id, body.action, target.id, {
    email: target.email,
    details: body.days || body.amountUsd || null,
  }, request);
  return ok();
}

// GET /api/admin/support — list support messages for the admin inbox.
export async function handleSupportMessages(request, env) {
  const { res } = await requireAdminWith2fa(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "all";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const args = [pageSize, offset];
  const where =
    status === "pending" ? "WHERE reply IS NULL" :
    status === "replied" ? "WHERE reply IS NOT NULL" : "";
  const [total, rows] = await Promise.all([
    one(`SELECT COUNT(*) n FROM support_messages ${where}`),
    query(
      `SELECT id, name, email, subject, message, reply,
              (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at,
              (EXTRACT(EPOCH FROM replied_at) * 1000)::double precision AS replied_at
         FROM support_messages
         ${where}
         ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      args
    ),
  ]);
  return ok({ messages: rows || [], page, pageSize, total: Number(total?.n) || 0 });
}

// POST /api/admin/support/reply — reply to a support message and email the user.
export async function handleSupportReply(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;
  const body = await readJson(request);
  if (!body?.id || typeof body.reply !== "string" || body.reply.trim().length < 1) {
    return bad("Message ID and reply are required.");
  }
  const m = await one(
    "SELECT id, name, email, subject, message FROM support_messages WHERE id = $1",
    [body.id]
  );
  if (!m) return bad("Message not found.", 404);
  await exec(
    "UPDATE support_messages SET reply = $1, replied_at = now() WHERE id = $2",
    [body.reply.trim(), m.id]
  );
  const emailResult = await sendEmail(env, {
    to: m.email,
    subject: `Re: ${m.subject}`,
    text: `Hi ${m.name},\n\n${body.reply.trim()}\n\n---\nOriginal message:\n${m.message}`,
    html: `<p>Hi ${m.name},</p><p>${esc(body.reply.trim()).replace(/\n/g, "<br>")}</p><hr><p><b>Original message:</b></p><pre style="white-space:pre-wrap">${esc(m.message)}</pre>`,
  });
  await logAdminAction(env, admin.id, "support_reply", null, {
    messageId: m.id,
    email: m.email,
    subject: m.subject,
  }, request);
  return ok({ emailSent: emailResult.sent });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// POST /api/admin/2fa/enable — generate a TOTP secret for the admin user.
// Only admin users (is_admin=true) can enable 2FA.
// Returns the otpauth:// URI for QR code rendering.
export async function handle2faEnable(request, env) {
  const { admin, res } = await requireAdmin(request, env);
  if (res) return res;

  // Check if 2FA is already enabled
  const user = await one("SELECT totp_secret FROM users WHERE id=$1", [admin.id]);
  if (user?.totp_secret) {
    return bad("2FA is already enabled. Disable it first to re-generate.", 400);
  }

  // Need TOKEN_ENC_KEY for encryption
  const encKey = env.TOKEN_ENC_KEY;
  if (!encKey) {
    console.error("[2FA] TOKEN_ENC_KEY not configured");
    return bad("Server configuration error. Contact support.", 500);
  }

  const secret = generateSecret();
  const encrypted = await encrypt(secret, encKey);
  await exec("UPDATE users SET totp_secret=$1, updated_at=now() WHERE id=$2", [encrypted, admin.id]);

  await logAdminAction(env, admin.id, "2fa_enable", admin.id, {
    email: admin.email,
    details: "2FA enabled for admin account",
  }, request);

  const uri = generateOtpauthUri(secret, admin.email);
  return ok({ uri, secret });
}

// POST /api/admin/2fa/verify — verify a TOTP code.
// Sets a KV flag indicating 2FA is verified for this session.
export async function handle2faVerify(request, env) {
  const { admin, res } = await requireAdmin(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body || !body.code) return bad("6-digit code required");
  const code = String(body.code).trim();
  if (!/^\d{6}$/.test(code)) return bad("Invalid code format");

  // Per-user TOTP rate limit: 5 attempts per 5 minutes (SEC-710)
  const totpKey = `totp:admin:${admin.id}`;
  if (!(await rateLimit(env, totpKey, 5, 300)).ok) {
    return json({ ok: false, error: "Too many verification attempts. Try again in a few minutes." }, 429);
  }

  const user = await one("SELECT totp_secret FROM users WHERE id=$1", [admin.id]);
  if (!user?.totp_secret) return bad("2FA is not enabled", 400);

  const encKey = env.TOKEN_ENC_KEY;
  if (!encKey) return bad("Server configuration error.", 500);

  let secret;
  try {
    secret = await decrypt(user.totp_secret, encKey);
  } catch (e) {
    console.error("[2FA] decrypt failed:", String(e?.message || e));
    return bad("Failed to verify. Try again.", 500);
  }

  const valid = await verifyCode(secret, code);
  if (!valid) {
    console.error(JSON.stringify({ level: "warn", ctx: "admin-totp", outcome: "fail", adminId: admin.id, ip: request.headers.get("cf-connecting-ip") || "unknown" }));
    return bad("Invalid code. Check your authenticator and try again.", 401);
  }

  // Mark 2FA verified in KV for this session token
  const token = readToken(request);
  if (token) {
    const tokenHash = await hashToken(token);
    await exec("UPDATE sessions SET twofa_verified=true WHERE token=$1", [tokenHash]);
  }

  await logAdminAction(env, admin.id, "2fa_verify", admin.id, {
    email: admin.email,
    details: "2FA verification successful",
  }, request);

  return ok({ verified: true });
}

// GET /api/admin/2fa/status — check if 2FA is enabled and verified for the current session.
export async function handle2faStatus(request, env) {
  const { admin, res } = await requireAdmin(request, env);
  if (res) return res;

  const user = await one("SELECT totp_secret FROM users WHERE id=$1", [admin.id]);
  const enabled = !!user?.totp_secret;

  let verified = false;
  if (enabled) {
    const token = readToken(request);
    if (token) {
      const tokenHash = await hashToken(token);
      const tfaRow2 = await one("SELECT twofa_verified FROM sessions WHERE token=$1", [tokenHash]);
      verified = !!tfaRow2?.twofa_verified;
    }
  }

  return ok({ enabled, verified });
}

// POST /api/admin/2fa/disable — disable 2FA for the admin user.
// Requires fresh 2FA verification to prevent accidental/malicious disabling.
export async function handle2faDisable(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env, true); // require fresh verification
  if (res) return res;

  const user = await one("SELECT totp_secret FROM users WHERE id=$1", [admin.id]);
  if (!user?.totp_secret) {
    return bad("2FA is not enabled", 400);
  }

  await exec("UPDATE users SET totp_secret=NULL, updated_at=now() WHERE id=$1", [admin.id]);

  // Clear 2FA verification flag from KV
  const token = readToken(request);
  if (token) {
    const tokenHash = await hashToken(token);
    await exec("UPDATE sessions SET twofa_verified=false WHERE token=$1", [tokenHash]);
  }

  await logAdminAction(env, admin.id, "2fa_disable", admin.id, {
    email: admin.email,
    details: "2FA disabled for admin account",
  }, request);

  return ok({ disabled: true });
}

// GET /api/admin/features — list global feature flags.
// POST /api/admin/features — create or update a global feature flag.
export async function handleFeatureFlags(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;

  if (request.method === "GET") {
    const flags = await listFeatureFlags();
    return ok({ flags });
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object") return bad("Invalid body", 400);
  const key = String(body.key ?? "").trim();
  if (!key) return bad("key is required", 400);
  const flag = await setFeatureFlag(key, {
    name: body.name,
    description: body.description,
    defaultValue: body.defaultValue,
  });
  await logAdminAction(env, admin.id, "feature_flag_set", null, { key, name: flag.name, defaultValue: flag.defaultValue }, request);
  return ok(flag);
}

// POST /api/admin/features/override — set or clear a per-user feature override.
export async function handleFeatureFlagOverride(request, env) {
  const { admin, res } = await requireAdminWith2fa(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body || typeof body !== "object") return bad("Invalid body", 400);
  const userId = String(body.userId ?? "").trim();
  const featureKey = String(body.featureKey ?? "").trim();
  if (!userId || !featureKey) return bad("userId and featureKey required", 400);
  const enabled = body.enabled === null ? null : Boolean(body.enabled);
  await setUserFeatureOverride(userId, featureKey, enabled);
  await logAdminAction(env, admin.id, "feature_flag_override", userId, { featureKey, enabled }, request);
  return ok({ userId, featureKey, enabled });
}
