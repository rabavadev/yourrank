import { describe, expect, it } from "bun:test";
import { requireSiteCapability } from "../site-authorization.js";

const capabilities = [
  ["canRoleManageBoard", ["owner", "manager", "moderator"]],
  ["canRoleManageCredits", ["owner", "manager", "moderator"]],
  ["canRoleManageBot", ["owner", "manager"]],
  ["canRoleManageTeam", ["owner"]],
  ["canRoleManageBilling", ["owner"]],
];

describe("site authorization", () => {
  it("allows a direct owner for every capability", async () => {
    for (const [capability] of capabilities) {
      const result = await requireSiteCapability(
        { id: "owner" },
        { id: "site", user_id: "owner" },
        capability,
        { getSiteRole: async () => "moderator" }
      );
      expect(result.res).toBeNull();
      expect(result.role).toBe("owner");
    }
  });

  it("applies the shared role matrix", async () => {
    for (const [capability, allowed] of capabilities) {
      for (const role of ["owner", "manager", "moderator"]) {
        const result = await requireSiteCapability(
          { id: role },
          { id: "site", user_id: "different-owner" },
          capability,
          { getSiteRole: async () => role }
        );
        expect(Boolean(result.res)).toBe(!allowed.includes(role));
        expect(result.role).toBe(role);
      }
    }
  });
});
