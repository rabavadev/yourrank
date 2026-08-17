import { bad } from "./auth.js";
import {
  canRoleManageBoard,
  canRoleManageCredits,
  canRoleManageBot,
  canRoleManageTeam,
  canRoleManageBilling,
  getSiteRole as defaultGetSiteRole,
} from "@yourrank/shared/team";

const CAPABILITY_CHECKS = {
  canRoleManageBoard,
  canRoleManageCredits,
  canRoleManageBot,
  canRoleManageTeam,
  canRoleManageBilling,
};

export async function requireSiteCapability(
  request,
  env,
  user,
  site,
  capability,
  { getSiteRole = defaultGetSiteRole } = {}
) {
  if (!site) return { role: null, res: bad("Site not found.", 404) };
  const role = site.user_id === user.id ? "owner" : await getSiteRole(site.id, user.id);
  const check = CAPABILITY_CHECKS[capability];
  if (!check || !check(role)) {
    return {
      role,
      res: bad(`Your ${role || "account"} role is not permitted to perform this action.`, 403),
    };
  }
  return { role, res: null };
}
