// ============================================================================
//  YourRank — SHARED TEAM & MODERATOR MANAGEMENT (TypeScript)
//
//  Role-Based Access Control (RBAC) and team delegation for streamer sites:
//    - Roles: 'owner', 'manager', 'moderator'
//    - Least-privilege capability guards
//    - Secure email & token invitation lifecycle
// ============================================================================

import { one as defaultOne, query as defaultQuery, exec as defaultExec, withTransaction as defaultWithTransaction } from "./db.js";
import { hashToken } from "./crypto.js";

export type SiteRole = "owner" | "manager" | "moderator";

export interface SiteMemberInfo {
  id: string;
  siteId: string;
  userId: string;
  role: SiteRole;
  email: string;
  displayName: string | null;
  slug: string;
  createdAt: string;
  invitedBy?: string | null;
}

export interface SiteInviteInfo {
  id: string;
  siteId: string;
  email: string;
  role: SiteRole;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  createdAt: string;
  invitedBy: string;
  siteName?: string;
  siteSlug?: string;
  ownerName?: string;
}

export interface DbOps {
  one?: typeof defaultOne;
  query?: typeof defaultQuery;
  exec?: typeof defaultExec;
  withTransaction?: typeof defaultWithTransaction;
}

/** Check if role has permission to edit leaderboards, players, wagers, and scores */
export function canRoleManageBoard(role: SiteRole | null | undefined): boolean {
  return role === "owner" || role === "manager" || role === "moderator";
}

/** Check if role has permission to adjust viewer balances and fulfill shop redemptions */
export function canRoleManageCredits(role: SiteRole | null | undefined): boolean {
  return role === "owner" || role === "manager" || role === "moderator";
}

/** Check if role has permission to configure bot replies, commands, and broadcasts */
export function canRoleManageBot(role: SiteRole | null | undefined): boolean {
  return role === "owner" || role === "manager";
}

/** Check if role has permission to invite, remove, and manage team members */
export function canRoleManageTeam(role: SiteRole | null | undefined): boolean {
  return role === "owner";
}

/** Check if role has permission to view and modify billing / payment methods */
export function canRoleManageBilling(role: SiteRole | null | undefined): boolean {
  return role === "owner";
}

/**
 * Get the effective role for a user on a given site.
 * Returns 'owner', 'manager', 'moderator', or null if not affiliated.
 */
export async function getSiteRole(
  siteId: string,
  userId: string,
  { one = defaultOne }: DbOps = {}
): Promise<SiteRole | null> {
  if (!siteId || !userId) return null;

  // 1. Check if user is the direct site owner
  const site = await one<{ user_id: string }>(
    "SELECT user_id FROM sites WHERE id=$1",
    [siteId]
  );
  if (!site) return null;
  if (site.user_id === userId) return "owner";

  // 2. Check if user is an active member
  const member = await one<{ role: SiteRole }>(
    "SELECT role FROM site_members WHERE site_id=$1 AND user_id=$2",
    [siteId, userId]
  );
  if (member?.role === "manager" || member?.role === "moderator") {
    return member.role;
  }

  return null;
}

/**
 * List all active members for a site (including the owner).
 */
export async function listSiteMembers(
  siteId: string,
  { one = defaultOne, query = defaultQuery }: DbOps = {}
): Promise<SiteMemberInfo[]> {
  const site = await one<{ user_id: string }>("SELECT user_id FROM sites WHERE id=$1", [siteId]);
  if (!site) return [];

  const owner = await one<{ id: string; email: string; display_name: string | null; slug: string; created_at: string }>(
    "SELECT id, email, display_name, slug, created_at FROM users WHERE id=$1",
    [site.user_id]
  );

  const members = await query<{
    id: string;
    site_id: string;
    user_id: string;
    role: SiteRole;
    email: string;
    display_name: string | null;
    slug: string;
    created_at: string;
    invited_by: string | null;
  }>(
    `SELECT sm.id, sm.site_id, sm.user_id, sm.role, sm.created_at, sm.invited_by,
            u.email, u.display_name, u.slug
       FROM site_members sm
       JOIN users u ON u.id = sm.user_id
      WHERE sm.site_id = $1
      ORDER BY sm.created_at ASC`,
    [siteId]
  );

  const result: SiteMemberInfo[] = [];

  if (owner) {
    result.push({
      id: `owner-${owner.id}`,
      siteId,
      userId: owner.id,
      role: "owner",
      email: owner.email,
      displayName: owner.display_name,
      slug: owner.slug,
      createdAt: owner.created_at,
    });
  }

  for (const m of members || []) {
    result.push({
      id: m.id,
      siteId: m.site_id,
      userId: m.user_id,
      role: m.role,
      email: m.email,
      displayName: m.display_name,
      slug: m.slug,
      createdAt: m.created_at,
      invitedBy: m.invited_by,
    });
  }

  return result;
}

/**
 * List pending invites for a site.
 */
export async function listSiteInvites(
  siteId: string,
  { query = defaultQuery }: DbOps = {}
): Promise<SiteInviteInfo[]> {
  const rows = await query<{
    id: string;
    site_id: string;
    email: string;
    role: SiteRole;
    status: "pending" | "accepted" | "revoked" | "expired";
    expires_at: string;
    created_at: string;
    invited_by: string;
  }>(
    `SELECT id, site_id, email, role, status, expires_at, created_at, invited_by
       FROM site_invites
      WHERE site_id=$1 AND status='pending' AND expires_at > now()
      ORDER BY created_at DESC`,
    [siteId]
  );

  return (rows || []).map((r) => ({
    id: r.id,
    siteId: r.site_id,
    email: r.email,
    role: r.role,
    status: r.status,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    invitedBy: r.invited_by,
  }));
}

/**
 * Create a new invitation for a user by email.
 */
export async function createSiteInvite(
  siteId: string,
  inviterId: string,
  email: string,
  role: SiteRole,
  { one = defaultOne, exec = defaultExec }: DbOps = {}
): Promise<{ ok: boolean; token?: string; inviteId?: string; error?: string; code?: string }> {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { ok: false, error: "Please provide a valid email address.", code: "invalid_email" };
  }

  if (role !== "moderator" && role !== "manager") {
    return { ok: false, error: "Role must be moderator or manager.", code: "invalid_role" };
  }

  const requesterRole = await getSiteRole(siteId, inviterId, { one });
  if (!canRoleManageTeam(requesterRole)) {
    return { ok: false, error: "Only the site owner can invite team members.", code: "forbidden" };
  }

  // Check if invited user is already the owner
  const site = await one<{ user_id: string }>("SELECT user_id FROM sites WHERE id=$1", [siteId]);
  if (!site) return { ok: false, error: "Site not found.", code: "not_found" };

  const targetUser = await one<{ id: string }>("SELECT id FROM users WHERE lower(email)=$1", [cleanEmail]);
  if (targetUser && targetUser.id === site.user_id) {
    return { ok: false, error: "The site owner is already on the team.", code: "already_owner" };
  }

  if (targetUser) {
    const existingMember = await one<{ id: string }>(
      "SELECT id FROM site_members WHERE site_id=$1 AND user_id=$2",
      [siteId, targetUser.id]
    );
    if (existingMember) {
      return { ok: false, error: "This user is already a member of this site.", code: "already_member" };
    }
  }

  // Check if an active pending invite already exists
  const existingInvite = await one<{ id: string }>(
    "SELECT id FROM site_invites WHERE site_id=$1 AND lower(email)=$2 AND status='pending' AND expires_at > now()",
    [siteId, cleanEmail]
  );
  if (existingInvite) {
    return { ok: false, error: "An invitation is already pending for this email.", code: "already_pending" };
  }

  // Generate a cryptographically random token
  const rawBytes = new Uint8Array(24);
  crypto.getRandomValues(rawBytes);
  const token = Buffer.from(rawBytes).toString("base64url");
  const tokenHash = await hashToken(token);

  const created = await one<{ id: string }>(
    `INSERT INTO site_invites (site_id, email, role, token_hash, invited_by, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', now() + interval '7 days')
     RETURNING id`,
    [siteId, cleanEmail, role, tokenHash, inviterId]
  );

  return { ok: true, token, inviteId: created?.id };
}

/**
 * Revoke/cancel a pending invite.
 */
export async function revokeSiteInvite(
  siteId: string,
  inviteId: string,
  requesterId: string,
  { one = defaultOne, exec = defaultExec }: DbOps = {}
): Promise<{ ok: boolean; error?: string; code?: string }> {
  const requesterRole = await getSiteRole(siteId, requesterId, { one });
  if (!canRoleManageTeam(requesterRole)) {
    return { ok: false, error: "Only the site owner can revoke invitations.", code: "forbidden" };
  }

  await exec(
    "UPDATE site_invites SET status='revoked' WHERE id=$1 AND site_id=$2 AND status='pending'",
    [inviteId, siteId]
  );

  return { ok: true };
}

/**
 * Remove a member from a site.
 */
export async function removeSiteMember(
  siteId: string,
  targetUserId: string,
  requesterId: string,
  { one = defaultOne, exec = defaultExec }: DbOps = {}
): Promise<{ ok: boolean; error?: string; code?: string }> {
  const requesterRole = await getSiteRole(siteId, requesterId, { one });
  // An owner can remove anyone; a member can remove themselves (leave site)
  if (!canRoleManageTeam(requesterRole) && requesterId !== targetUserId) {
    return { ok: false, error: "Only the site owner can remove team members.", code: "forbidden" };
  }

  await exec(
    "DELETE FROM site_members WHERE site_id=$1 AND user_id=$2",
    [siteId, targetUserId]
  );

  return { ok: true };
}

/**
 * Update a member's role (e.g. moderator <-> manager).
 */
export async function updateSiteMemberRole(
  siteId: string,
  targetUserId: string,
  newRole: SiteRole,
  requesterId: string,
  { one = defaultOne, exec = defaultExec }: DbOps = {}
): Promise<{ ok: boolean; error?: string; code?: string }> {
  if (newRole !== "moderator" && newRole !== "manager") {
    return { ok: false, error: "Invalid role specified.", code: "invalid_role" };
  }

  const requesterRole = await getSiteRole(siteId, requesterId, { one });
  if (!canRoleManageTeam(requesterRole)) {
    return { ok: false, error: "Only the site owner can change member roles.", code: "forbidden" };
  }

  await exec(
    "UPDATE site_members SET role=$1, updated_at=now() WHERE site_id=$2 AND user_id=$3",
    [newRole, siteId, targetUserId]
  );

  return { ok: true };
}

/**
 * Fetch invite details by token for the invite landing view.
 */
export async function getInviteByToken(
  token: string,
  { one = defaultOne }: DbOps = {}
): Promise<SiteInviteInfo | null> {
  if (!token) return null;

  const row = await one<{
    id: string;
    site_id: string;
    email: string;
    role: SiteRole;
    status: "pending" | "accepted" | "revoked" | "expired";
    expires_at: string;
    created_at: string;
    invited_by: string;
    site_name: string;
    site_slug: string;
    owner_name: string | null;
  }>(
    `SELECT si.id, si.site_id, si.email, si.role, si.status, si.expires_at, si.created_at, si.invited_by,
            s.name AS site_name, s.slug AS site_slug, u.display_name AS owner_name
       FROM site_invites si
       JOIN sites s ON s.id = si.site_id
       JOIN users u ON u.id = s.user_id
      WHERE si.token_hash = $1`,
    [await hashToken(token)]
  );

  if (!row) return null;

  return {
    id: row.id,
    siteId: row.site_id,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    invitedBy: row.invited_by,
    siteName: row.site_name,
    siteSlug: row.site_slug,
    ownerName: row.owner_name || "Streamer",
  };
}

/**
 * Accept an invitation token for a logged-in user.
 */
export async function acceptSiteInvite(
  token: string,
  userId: string,
  { one = defaultOne, exec = defaultExec }: DbOps = {}
): Promise<{ ok: boolean; siteId?: string; role?: SiteRole; error?: string; code?: string }> {
  if (!token || !userId) {
    return { ok: false, error: "Invalid invite token or user.", code: "invalid_request" };
  }

  const invite = await one<{
    id: string;
    site_id: string;
    email: string;
    role: SiteRole;
    status: string;
    expires_at: string;
    invited_by: string;
  }>(
    "SELECT id, site_id, email, role, status, expires_at, invited_by FROM site_invites WHERE token_hash=$1",
    [await hashToken(token)]
  );

  if (!invite) {
    return { ok: false, error: "Invitation not found.", code: "not_found" };
  }

  if (invite.status === "revoked") {
    return { ok: false, error: "This invitation has been revoked by the site owner.", code: "revoked" };
  }

  const user = await one<{ email: string }>("SELECT email FROM users WHERE id=$1", [userId]);
  if (!user || user.email.trim().toLowerCase() !== invite.email.trim().toLowerCase()) {
    return { ok: false, error: "This invitation was issued for a different email address.", code: "email_mismatch" };
  }

  if (invite.status === "accepted") {
    return { ok: true, siteId: invite.site_id, role: invite.role };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This invitation has expired.", code: "expired" };
  }

  // Insert membership record
  await exec(
    `INSERT INTO site_members (site_id, user_id, role, invited_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (site_id, user_id)
     DO UPDATE SET role = EXCLUDED.role, updated_at = now()`,
    [invite.site_id, userId, invite.role, invite.invited_by]
  );

  // Mark invite as accepted
  await exec(
    "UPDATE site_invites SET status='accepted' WHERE id=$1",
    [invite.id]
  );

  return { ok: true, siteId: invite.site_id, role: invite.role };
}
