// Owner admin API. Every route requires a session whose user has is_admin=true.
import { json, bad, ok, readJson, newToken, currentUser, destroyAllUserSessions } from "./auth.js";
import { activatePro } from "./billing.js";
import { query, one, exec } from "./db.js";

export async function requireAdmin(request, env) {
  const u = await currentUser(request, env);
  if (!u) return { admin: null, res: bad("unauthorized", 401) };
  if (!u.is_admin) return { admin: null, res: bad("forbidden", 403) };
  return { admin: u, res: null };
}

export async function handleOverview(request, env) {
  const { res } = await requireAdmin(request, env);
  if (res) return res;
  const [users, pro, leads, revenue] = await Promise.all([
    one("SELECT COUNT(*) n FROM users"),
    one("SELECT COUNT(*) n FROM users WHERE plan='pro' AND status!='suspended'"),
    one("SELECT COUNT(*) n FROM leads"),
    one("SELECT COALESCE(SUM(amount),0) n FROM payments WHERE status IN ('finished','manual')"),
  ]);
  return ok({ users: Number(users?.n) || 0, pro: Number(pro?.n) || 0, leads: Number(leads?.n) || 0, revenue: Number(revenue?.n) || 0 });
}

export async function handleUsers(request, env) {
  const { res } = await requireAdmin(request, env);
  if (res) return res;
  // plan_expires_at / created_at as epoch-ms so the admin frontend keeps
  // treating them as numeric millisecond timestamps.
  const rows = await query(
    `SELECT u.id, u.email, u.plan,
            (EXTRACT(EPOCH FROM u.plan_expires_at) * 1000)::double precision AS plan_expires_at,
            u.status, u.is_admin,
            (EXTRACT(EPOCH FROM u.created_at) * 1000)::double precision AS created_at,
            s.slug,
            (SELECT COUNT(*) FROM players p WHERE p.site_id = s.id) AS player_count
       FROM users u LEFT JOIN sites s ON s.user_id = u.id
       ORDER BY u.created_at DESC LIMIT 500`
  );
  return ok({ users: rows || [] });
}

export async function handleLeads(request, env) {
  const { res } = await requireAdmin(request, env);
  if (res) return res;
  const rows = await query(
    "SELECT id, handle, casino, contact, note, (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at FROM leads ORDER BY created_at DESC LIMIT 500"
  );
  return ok({ leads: rows || [] });
}

export async function handlePayments(request, env) {
  const { res } = await requireAdmin(request, env);
  if (res) return res;
  // Alias amount -> amount_usd and created_at -> epoch-ms for the frontend.
  const rows = await query(
    `SELECT p.id, p.user_id, p.provider, p.amount AS amount_usd, p.currency, p.invoice_id, p.tx_ref, p.status,
            (EXTRACT(EPOCH FROM p.created_at) * 1000)::double precision AS created_at,
            u.email
       FROM payments p LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT 500`
  );
  return ok({ payments: rows || [] });
}

// POST /api/admin/action — { userId, action: pro|free|suspend|unsuspend|reset-link, days? }
export async function handleAction(request, env) {
  const { admin, res } = await requireAdmin(request, env);
  if (res) return res;
  const body = await readJson(request);
  if (!body || !body.userId || !body.action) return bad("userId and action required");
  const target = await one("SELECT id, email, is_admin FROM users WHERE id=$1", [body.userId]);
  if (!target) return bad("No such user", 404);

  switch (body.action) {
    case "pro": {
      const days = Number(body.days);
      await activatePro(env, target.id, Number.isFinite(days) ? days : 31, {
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
      // Kill every live session immediately — don't wait for the 30-day KV TTL.
      // The bot dashboard middleware also re-checks suspended status per request,
      // but this closes the leaderboard side (and any other device) now.
      await destroyAllUserSessions(env, target.id);
      break;
    case "unsuspend":
      await exec("UPDATE users SET status='active', updated_at=now() WHERE id=$1", [target.id]);
      break;
    case "reset-link": {
      // Don't let one admin mint a login-as link for ANOTHER admin. The suspend
      // case already refuses admin targets; this closes the parallel path where
      // a single compromised admin key would otherwise take over every other
      // admin account (including the primary operator). Support reset-links are
      // for regular users only.
      if (target.is_admin) return bad("Can't generate a reset link for an admin");
      const token = newToken();
      await env.SESSIONS.put(`reset:${token}`, target.id, { expirationTtl: 86400 }); // admin links last 24h
      const origin = new URL(request.url).origin;
      console.error("[AUDIT]", JSON.stringify({
        ts: new Date().toISOString(), admin: admin.id, action: body.action,
        target: target.id, email: target.email, details: { link: `${origin}/reset?token=${token}` },
      }));
      return ok({ link: `${origin}/reset?token=${token}`, email: target.email });
    }
    default:
      return bad("Unknown action");
  }
  // Audit log for all non-early-return actions (pro, free, suspend, unsuspend).
  console.error("[AUDIT]", JSON.stringify({
    ts: new Date().toISOString(), admin: admin.id, action: body.action,
    target: target.id, email: target.email, details: body.days || body.amountUsd || null,
  }));
  return ok();
}
