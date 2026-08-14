// ============================================================================
//  YourRank — TEAM & MODERATOR HANDLERS
//
//  API endpoints for inviting, managing, and accepting moderator & manager roles
// ============================================================================

import { requireUser, json, bad, ok, readJson, rateLimit, rateLimitHeaders } from "../auth.js";
import { getBoardById, getByUser } from "../site.js";
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
} from "../../../../shared/team.js";
import { PLATFORM_HOST } from "../constants.js";

/**
 * GET /api/site/team?siteId=...
 * List members and pending invites for a site.
 */
export async function handleTeamList(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);

  const role = await getSiteRole(site.id, user.id);
  if (!role) return bad("Access denied", 403);

  const [members, invites] = await Promise.all([
    listSiteMembers(site.id),
    role === "owner" ? listSiteInvites(site.id) : Promise.resolve([]),
  ]);

  return json({
    ok: true,
    siteId: site.id,
    currentRole: role,
    canManageTeam: canRoleManageTeam(role),
    members,
    invites: invites.map((inv) => ({
      ...inv,
      inviteUrl: `https://${PLATFORM_HOST}/invite/${inv.token}`,
    })),
  });
}

/**
 * POST /api/site/team/invite
 * Send or generate an invite for a mod or manager.
 */
export async function handleTeamInvite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const rl = await rateLimit(env, `team-invite:${user.id}`, 20, 3600);
  if (!rl.ok) return bad("Too many invitations sent. Please wait.", 429, rateLimitHeaders(rl));

  const body = await readJson(request);
  if (!body) return bad("Invalid JSON payload", 400);

  const { siteId, email, role = "moderator" } = body;
  if (!email || typeof email !== "string") return bad("A valid email address is required.", 400);

  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);

  const result = await createSiteInvite(site.id, user.id, email, role);
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
export async function handleTeamRevokeInvite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.inviteId || !body?.siteId) return bad("Missing inviteId or siteId", 400);

  const site = await getBoardById(env, user.id, body.siteId);
  if (!site) return bad("Site not found", 404);

  const result = await revokeSiteInvite(site.id, body.inviteId, user.id);
  if (!result.ok) return bad(result.error || "Failed to revoke invitation", 400);

  return ok();
}

/**
 * POST /api/site/team/remove
 * Remove a member from the site.
 */
export async function handleTeamRemoveMember(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.siteId || !body?.targetUserId) return bad("Missing siteId or targetUserId", 400);

  const site = await getBoardById(env, user.id, body.siteId);
  if (!site) return bad("Site not found", 404);

  const result = await removeSiteMember(site.id, body.targetUserId, user.id);
  if (!result.ok) return bad(result.error || "Failed to remove member", 400);

  return ok();
}

/**
 * POST /api/site/team/role
 * Update role of a member (e.g. moderator <-> manager).
 */
export async function handleTeamUpdateRole(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  if (!body?.siteId || !body?.targetUserId || !body?.role) return bad("Missing parameters", 400);

  const site = await getBoardById(env, user.id, body.siteId);
  if (!site) return bad("Site not found", 404);

  const result = await updateSiteMemberRole(site.id, body.targetUserId, body.role, user.id);
  if (!result.ok) return bad(result.error || "Failed to update role", 400);

  return ok();
}

/**
 * POST /api/site/team/accept-invite
 * Accept an invite for the current user.
 */
export async function handleTeamAcceptInvite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  const token = body?.token;
  if (!token) return bad("Invite token is required", 400);

  const result = await acceptSiteInvite(token, user.id);
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
export async function handleGetInviteInfo(request, _env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return bad("Missing token", 400);

  const invite = await getInviteByToken(token);
  if (!invite) return bad("Invitation not found", 404);

  const isExpired = new Date(invite.expiresAt).getTime() < Date.now();

  return json({
    ok: true,
    siteName: invite.siteName,
    siteSlug: invite.siteSlug,
    ownerName: invite.ownerName,
    role: invite.role,
    status: isExpired ? "expired" : invite.status,
    expiresAt: invite.expiresAt,
  });
}
