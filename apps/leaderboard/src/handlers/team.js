// ============================================================================
//  YourRank — TEAM & MODERATOR HANDLERS
//
//  API endpoints for inviting, managing, and accepting moderator & manager roles
// ============================================================================

import { requireUser, json, bad, ok, readJson, rateLimit, rateLimitHeaders, clientIp } from "../auth.js";
import { getSiteById } from "../site.js";
import { one as defaultOne } from "@yourrank/shared/db";
import {
  getSiteRole,
  canRoleManageTeam,
  listSiteMembers,
  listSiteInvites,
  createSiteInvite,
  revokeSiteInvite,
  removeSiteMember,
  updateSiteMemberRole,
  getInviteByToken,
  acceptSiteInvite,
} from "@yourrank/shared/team";
import { PLATFORM_HOST } from "../constants.js";

function getDeps(overrides = {}) {
  const deps = {
    requireUser,
    getSiteById,
    one: defaultOne,
    getSiteRole,
    listSiteMembers,
    listSiteInvites,
    createSiteInvite,
    revokeSiteInvite,
    removeSiteMember,
    updateSiteMemberRole,
    getInviteByToken,
    acceptSiteInvite,
    rateLimit,
    rateLimitHeaders,
    clientIp,
    ...overrides,
  };
  if (!overrides.getTeamSiteByUser) {
    deps.getTeamSiteByUser = (env, userId) => getTeamSiteByUser(env, userId, deps.one);
  }
  return deps;
}

async function getTeamSiteByUser(env, userId, one) {
  // Same board the rest of the dashboard defaults to: the active one.
  const owned = await one(
    `SELECT id FROM sites WHERE user_id=$1
      ORDER BY CASE WHEN id=(SELECT active_site_id FROM users WHERE id=$1) THEN 0 ELSE 1 END, id ASC
      LIMIT 1`,
    [userId],
  );
  if (owned) return owned;
  return one(
    `SELECT s.id
       FROM sites s
       JOIN site_members sm ON sm.site_id=s.id
      WHERE sm.user_id=$1
      ORDER BY sm.created_at ASC, s.id ASC
      LIMIT 1`,
    [userId],
  );
}

async function resolveTeamSite(env, user, siteId, deps) {
  const site = siteId
    ? await deps.getSiteById(env, siteId)
    : await deps.getTeamSiteByUser(env, user.id);
  if (!site) return null;
  const role = await deps.getSiteRole(site.id, user.id);
  return role ? { site, role } : null;
}

/**
 * GET /api/site/team?siteId=...
 * List members and pending invites for a site.
 */
export async function handleTeamList(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const resolved = await resolveTeamSite(env, user, siteId, deps);
  if (!resolved) return bad("Site not found", 404);
  const { site, role } = resolved;

  const [members, invites] = await Promise.all([
    deps.listSiteMembers(site.id),
    role === "owner" ? deps.listSiteInvites(site.id) : Promise.resolve([]),
  ]);

  return json({
    ok: true,
    siteId: site.id,
    currentRole: role,
    canManageTeam: canRoleManageTeam(role),
    members,
    invites,
  });
}

/**
 * POST /api/site/team/invite
 * Send or generate an invite for a mod or manager.
 */
export async function handleTeamInvite(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const rl = await deps.rateLimit(env, `team-invite:${user.id}`, 20, 3600);
  if (!rl.ok) return bad("Too many invitations sent. Please wait.", 429, deps.rateLimitHeaders(rl));

  const body = await readJson(request);
  if (!body) return bad("Invalid JSON payload", 400);

  const { siteId, email, role = "moderator" } = body;
  if (!email || typeof email !== "string") return bad("A valid email address is required.", 400);

  const resolved = await resolveTeamSite(env, user, siteId, deps);
  if (!resolved) return bad("Site not found", 404);
  const { site, role: requesterRole } = resolved;
  if (requesterRole !== "owner") return bad("Only the site owner can invite team members.", 403);

  const result = await deps.createSiteInvite(site.id, user.id, email, role);
  if (!result.ok) {
    const status = result.code === "forbidden" ? 403 : 400;
    return bad(result.error || "Failed to create invitation.", status);
  }

  return json({
    ok: true,
    inviteId: result.inviteId,
    token: result.token,
    inviteUrl: `https://${PLATFORM_HOST}/invite/${result.token}`,
    message: `Invitation generated for ${email} with role ${role}.`,
  });
}

/**
 * POST /api/site/team/invite/revoke
 * Cancel an active invitation.
 */
export async function handleTeamRevokeInvite(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.inviteId || !body?.siteId) return bad("Missing inviteId or siteId", 400);

  const resolved = await resolveTeamSite(env, user, body.siteId, deps);
  if (!resolved) return bad("Site not found", 404);
  const { site, role: requesterRole } = resolved;
  if (requesterRole !== "owner") return bad("Only the site owner can revoke invitations.", 403);

  const result = await deps.revokeSiteInvite(site.id, body.inviteId, user.id);
  if (!result.ok) return bad(result.error || "Failed to revoke invitation", 400);

  return ok();
}

/**
 * POST /api/site/team/remove
 * Remove a member from the site.
 */
export async function handleTeamRemoveMember(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.siteId || !body?.targetUserId) return bad("Missing siteId or targetUserId", 400);

  const resolved = await resolveTeamSite(env, user, body.siteId, deps);
  if (!resolved) return bad("Site not found", 404);
  const { site, role: requesterRole } = resolved;
  if (requesterRole !== "owner" && user.id !== body.targetUserId) {
    return bad("Only the site owner can remove team members.", 403);
  }

  const result = await deps.removeSiteMember(site.id, body.targetUserId, user.id);
  if (!result.ok) return bad(result.error || "Failed to remove member", 400);

  return ok();
}

/**
 * POST /api/site/team/role
 * Update role of a member (e.g. moderator <-> manager).
 */
export async function handleTeamUpdateRole(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.siteId || !body?.targetUserId || !body?.role) return bad("Missing parameters", 400);

  const resolved = await resolveTeamSite(env, user, body.siteId, deps);
  if (!resolved) return bad("Site not found", 404);
  const { site, role: requesterRole } = resolved;
  if (requesterRole !== "owner") return bad("Only the site owner can change member roles.", 403);

  const result = await deps.updateSiteMemberRole(site.id, body.targetUserId, body.role, user.id);
  if (!result.ok) return bad(result.error || "Failed to update role", 400);

  return ok();
}

/**
 * POST /api/site/team/accept-invite
 * Accept an invite for the current user.
 */
export async function handleTeamAcceptInvite(request, env, overrides) {
  const deps = getDeps(overrides);
  const { user, res } = await deps.requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  const token = body?.token;
  if (!token) return bad("Invite token is required", 400);

  const result = await deps.acceptSiteInvite(token, user.id);
  if (!result.ok) {
    return bad(result.error || "Unable to accept invite", 400);
  }

  return json({
    ok: true,
    siteId: result.siteId,
    role: result.role,
    message: "You have joined the team!",
  });
}

/**
 * GET /api/site/team/invite-info?token=...
 * Fetch public metadata about an invite.
 */
export async function handleGetInviteInfo(request, env, overrides) {
  const deps = getDeps(overrides);
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const rl = await deps.rateLimit(env, `team-invite-info:${deps.clientIp(request)}`, 30, 900);
  if (!rl.ok) return bad("Invitation is not available.", 404, deps.rateLimitHeaders(rl));
  if (!token) return bad("Invitation is not available.", 404, deps.rateLimitHeaders(rl));

  const invite = await deps.getInviteByToken(token);
  if (!invite) return bad("Invitation is not available.", 404, deps.rateLimitHeaders(rl));

  const isExpired = new Date(invite.expiresAt).getTime() < Date.now();
  if (isExpired || invite.status !== "pending") {
    return bad("Invitation is not available.", 404, deps.rateLimitHeaders(rl));
  }

  return json({
    ok: true,
    siteName: invite.siteName,
    siteSlug: invite.siteSlug,
    ownerName: invite.ownerName,
    role: invite.role,
    status: "pending",
    expiresAt: invite.expiresAt,
  }, 200, deps.rateLimitHeaders(rl));
}
