// ============================================================================
//  Session and team user slugs against a real Postgres schema.
//
//  These tests need the migrated schema, so they self-skip when
//  SESSION_TEST_DATABASE_URL is not set.
// ============================================================================

import { afterAll, describe, expect, it } from "bun:test";
import postgres from "postgres";
import { hashToken } from "../crypto";

const DB_URL = process.env.SESSION_TEST_DATABASE_URL;
const describeDb = DB_URL ? describe : describe.skip;
const sql = DB_URL ? postgres(DB_URL, { max: 5, onnotice: () => {} }) : (null as never);

let currentUser: typeof import("../session").currentUser;
let listSiteMembers: typeof import("../team").listSiteMembers;

if (DB_URL) {
  process.env.DATABASE_URL = DB_URL;
  ({ currentUser } = await import("../session"));
  ({ listSiteMembers } = await import("../team"));
}

type User = { id: string };
type Site = { id: string };

const suffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function createUser(email: string, displayName: string): Promise<User> {
  const [user] = await sql`
    INSERT INTO users (email, display_name, status)
    VALUES (${email}, ${displayName}, 'active')
    RETURNING id
  `;
  return user;
}

async function createSite(userId: string, slug: string, boardOrder: number): Promise<Site> {
  const [site] = await sql`
    INSERT INTO sites (user_id, slug, name, board_order)
    VALUES (${userId}, ${slug}, ${slug}, ${boardOrder})
    RETURNING id
  `;
  return site;
}

async function cleanup(users: string[], sites: string[], tokens: string[]) {
  if (tokens.length) await sql`DELETE FROM sessions WHERE token IN ${sql(tokens)}`;
  if (sites.length) await sql`DELETE FROM sites WHERE id IN ${sql(sites)}`;
  if (users.length) await sql`DELETE FROM users WHERE id IN ${sql(users)}`;
}

describeDb("shared session and team slugs", () => {
  afterAll(async () => {
    await sql.end({ timeout: 0 });
  });

  it("loads active, fallback, and no-site user slugs through currentUser", async () => {
    const users: string[] = [];
    const sites: string[] = [];
    const tokens: string[] = [];
    const id = suffix();

    try {
      const activeUser = await createUser(`session-active-${id}@test.local`, "Active User");
      const fallbackUser = await createUser(`session-fallback-${id}@test.local`, "Fallback User");
      const noSiteUser = await createUser(`session-none-${id}@test.local`, "No Site User");
      users.push(activeUser.id, fallbackUser.id, noSiteUser.id);

      const activeSite = await createSite(activeUser.id, `session-active-${id}`, 0);
      const fallbackFirst = await createSite(fallbackUser.id, `session-fallback-first-${id}`, 0);
      const fallbackSecond = await createSite(fallbackUser.id, `session-fallback-second-${id}`, 1);
      sites.push(activeSite.id, fallbackFirst.id, fallbackSecond.id);

      await sql`UPDATE users SET active_site_id = ${activeSite.id} WHERE id = ${activeUser.id}`;

      for (const [name, userId] of [
        ["active", activeUser.id],
        ["fallback", fallbackUser.id],
        ["none", noSiteUser.id],
      ] as const) {
        const token = `session-${name}-${id}`;
        tokens.push(await hashToken(token));
        await sql`
          INSERT INTO sessions (token, user_id, expires_at)
          VALUES (${tokens.at(-1)}, ${userId}, now() + interval '1 hour')
        `;
        const user = await currentUser(
          new Request("https://example.test", {
            headers: { cookie: `yr_session=${token}` },
          }),
          {},
        );

        const expectedSlug =
          name === "active"
            ? `session-active-${id}`
            : name === "fallback"
              ? `session-fallback-first-${id}`
              : "";
        expect(user?.id).toBe(userId);
        expect(user?.slug).toBe(expectedSlug);
      }
    } finally {
      await cleanup(users, sites, tokens);
    }
  });

  it("lists owner and member slugs from active and fallback sites", async () => {
    const users: string[] = [];
    const sites: string[] = [];
    const id = suffix();

    try {
      const owner = await createUser(`team-owner-${id}@test.local`, "Team Owner");
      const member = await createUser(`team-member-${id}@test.local`, "Team Member");
      users.push(owner.id, member.id);

      const ownerSite = await createSite(owner.id, `team-owner-${id}`, 0);
      const memberFallbackSite = await createSite(member.id, `team-member-first-${id}`, 0);
      const memberOtherSite = await createSite(member.id, `team-member-other-${id}`, 1);
      sites.push(ownerSite.id, memberFallbackSite.id, memberOtherSite.id);

      await sql`UPDATE users SET active_site_id = ${ownerSite.id} WHERE id = ${owner.id}`;
      await sql`
        INSERT INTO site_members (site_id, user_id, role, invited_by)
        VALUES (${ownerSite.id}, ${member.id}, 'moderator', ${owner.id})
      `;

      const members = await listSiteMembers(ownerSite.id);
      expect(members.map(({ role, slug }) => ({ role, slug }))).toEqual([
        { role: "owner", slug: `team-owner-${id}` },
        { role: "moderator", slug: `team-member-first-${id}` },
      ]);
    } finally {
      await cleanup(users, sites, []);
    }
  });
});
