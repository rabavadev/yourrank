// ============================================================================
//  place_bet / settle_round against a real Postgres.
//
//  These are the money-safety tests: atomic debit, no negative balance under
//  concurrency, idempotent retries, and the server-side authorization matrix.
//  They need a database, so they self-skip when GAMES_TEST_DATABASE_URL is not
//  set (same convention as rls-isolation.test.ts).
//
//  Locally:
//    docker run -d --name yr-pg -e POSTGRES_PASSWORD=pg -p 55432:5432 postgres:16
//    createdb / psql -f every supabase/migrations/*.sql in order, then
//    GAMES_TEST_DATABASE_URL=postgres://postgres:pg@localhost:55432/yourrank_test \
//      bun test packages/shared/src/__tests__/games-wagering.test.ts
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import postgres from "postgres";

const DB_URL = process.env.GAMES_TEST_DATABASE_URL;
const describeDb = DB_URL ? describe : describe.skip;

const sql = DB_URL ? postgres(DB_URL, { max: 5, onnotice: () => {} }) : (null as never);

interface Ctx {
  siteId: string;
  siteViewerId: string;
}

let ctx: Ctx;
let keyCounter = 0;
const key = () => `test-key-${Date.now()}-${keyCounter++}`;

async function setBalance(balance: number) {
  await sql`UPDATE site_viewers SET balance = ${balance} WHERE id = ${ctx.siteViewerId}`;
}

async function balance(): Promise<number> {
  const [row] = await sql`SELECT balance FROM site_viewers WHERE id = ${ctx.siteViewerId}`;
  return Number(row.balance);
}

async function setSettings(patch: Record<string, unknown>) {
  await sql`UPDATE site_game_settings SET ${sql(patch)} WHERE site_id = ${ctx.siteId} AND game = 'dice'`;
}

async function placeBet(
  bet: number,
  opts: { game?: string; idempotencyKey?: string; params?: object } = {}
): Promise<Record<string, unknown>> {
  const [row] = await sql`
    SELECT place_bet(
      ${ctx.siteId}::uuid, ${ctx.siteViewerId}::uuid, ${opts.game ?? "dice"},
      ${bet}, ${sql.json(opts.params ?? {})}::jsonb, ${opts.idempotencyKey ?? key()}
    ) AS result`;
  return row.result as Record<string, unknown>;
}

async function clearRounds() {
  await sql`DELETE FROM game_rounds WHERE site_viewer_id = ${ctx.siteViewerId}`;
  await sql`DELETE FROM credit_ledger WHERE site_viewer_id = ${ctx.siteViewerId}`;
}

describeDb("place_bet / settle_round", () => {
  beforeAll(async () => {
    const suffix = Math.random().toString(36).slice(2, 10);
    const [user] = await sql`
      INSERT INTO users (email, status, email_verified)
      VALUES (${`games-${suffix}@test.local`}, 'active', true) RETURNING id`;
    const [site] = await sql`
      INSERT INTO sites (user_id, slug, name, published, games_enabled)
      VALUES (${user.id}, ${`games-${suffix}`}, 'Games Test', true, true) RETURNING id`;
    const [viewer] = await sql`
      INSERT INTO viewers (kick_user_id, kick_username)
      VALUES (${`kick-${suffix}`}, ${`viewer-${suffix}`}) RETURNING id`;
    const [siteViewer] = await sql`
      INSERT INTO site_viewers (site_id, viewer_id, balance)
      VALUES (${site.id}, ${viewer.id}, 1000) RETURNING id`;
    await sql`
      INSERT INTO site_game_settings (site_id, game, enabled, min_bet, max_bet, house_edge_bps)
      VALUES (${site.id}, 'dice', true, 10, 500, 100),
             (${site.id}, 'mines', false, 1, 500, 100)`;
    await sql`
      INSERT INTO game_seeds (site_viewer_id, server_seed, server_seed_hash, client_seed)
      VALUES (${siteViewer.id}, 'server-seed', 'server-seed-hash', 'client-seed')`;
    ctx = { siteId: site.id, siteViewerId: siteViewer.id };
  });

  afterAll(async () => {
    if (ctx) await sql`DELETE FROM sites WHERE id = ${ctx.siteId}`;
    await sql.end({ timeout: 0 });
  });

  it("debits atomically, writes one spend ledger row, and opens a round", async () => {
    await clearRounds();
    await setBalance(1000);
    const result = await placeBet(100);
    expect(result.ok).toBe(true);
    expect(result.balance).toBe(900);
    expect(await balance()).toBe(900);

    const [round] = await sql`SELECT * FROM game_rounds WHERE id = ${result.round_id as string}`;
    expect(round.state).toBe("open");
    expect(round.bet).toBe(100);
    expect(round.outcome).toBeNull(); // the Worker stores it right after
    expect(Number(round.nonce)).toBeGreaterThan(0);

    const ledger = await sql`
      SELECT * FROM credit_ledger WHERE site_viewer_id = ${ctx.siteViewerId} AND type = 'spend'`;
    expect(ledger).toHaveLength(1);
    expect(ledger[0].amount).toBe(100);
  });

  it("bumps the nonce once per round", async () => {
    await clearRounds();
    await setBalance(1000);
    const [before] = await sql`SELECT nonce FROM game_seeds WHERE site_viewer_id = ${ctx.siteViewerId}`;
    const first = await placeBet(10);
    await sql`UPDATE game_rounds SET state = 'settled' WHERE id = ${first.round_id as string}`;
    const second = await placeBet(10);
    expect(Number(second.nonce)).toBe(Number(first.nonce) + 1);
    expect(Number(first.nonce)).toBe(Number(before.nonce) + 1);
  });

  it("is idempotent: a retry returns the same round and never double-charges", async () => {
    await clearRounds();
    await setBalance(500);
    const k = key();
    const first = await placeBet(100, { idempotencyKey: k });
    const retry = await placeBet(100, { idempotencyKey: k });
    expect(retry.ok).toBe(true);
    expect(retry.replayed).toBe(true);
    expect(retry.round_id).toBe(first.round_id);
    expect(await balance()).toBe(400);
    const rows = await sql`SELECT count(*)::int AS n FROM credit_ledger WHERE site_viewer_id = ${ctx.siteViewerId}`;
    expect(rows[0].n).toBe(1);
  });

  it("concurrent bets can never drive the balance negative", async () => {
    await clearRounds();
    await setBalance(100);
    const [a, b] = await Promise.all([placeBet(100), placeBet(100)]);
    const results = [a, b];
    expect(results.filter((r) => r.ok).length).toBe(1);
    expect(results.filter((r) => !r.ok).length).toBe(1);
    expect(await balance()).toBe(0);
    const rows = await sql`
      SELECT count(*)::int AS n FROM game_rounds WHERE site_viewer_id = ${ctx.siteViewerId}`;
    expect(rows[0].n).toBe(1);
  });

  it("many concurrent bets cannot open two rounds or overdraw", async () => {
    await clearRounds();
    await setBalance(250);
    const results = await Promise.all(Array.from({ length: 8 }, () => placeBet(100)));
    // The partial unique index — not the EXISTS pre-check — is what makes this
    // hold: a losing transaction rolls back its debit along with its round.
    expect(results.filter((r) => r.ok).length).toBe(1);
    expect(await balance()).toBe(150);
    const [open] = await sql`
      SELECT count(*)::int AS n FROM game_rounds
       WHERE site_viewer_id = ${ctx.siteViewerId} AND state = 'open'`;
    expect(open.n).toBe(1);
    const [spent] = await sql`
      SELECT COALESCE(sum(amount), 0)::int AS n FROM credit_ledger
       WHERE site_viewer_id = ${ctx.siteViewerId} AND type = 'spend'`;
    expect(spent.n).toBe(100);
  });

  describe("authorization matrix", () => {
    it("rejects a bet below the minimum", async () => {
      await clearRounds();
      await setBalance(1000);
      const result = await placeBet(1);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("bet below minimum");
      expect(await balance()).toBe(1000);
    });

    it("rejects a bet above the maximum", async () => {
      await clearRounds();
      const result = await placeBet(9999);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("bet above maximum");
    });

    it("rejects a bet larger than the balance", async () => {
      await clearRounds();
      await setBalance(50);
      const result = await placeBet(100);
      expect(result.ok).toBe(false);
      expect(result.error).toBe("insufficient balance");
      expect(await balance()).toBe(50);
    });

    it("rejects a disabled game", async () => {
      await clearRounds();
      await setBalance(1000);
      const result = await placeBet(100, { game: "mines" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("game disabled");
    });

    it("rejects a game with no settings row at all", async () => {
      await clearRounds();
      const result = await placeBet(100, { game: "limbo" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("game disabled");
    });

    it("rejects when the site master switch is off", async () => {
      await clearRounds();
      await sql`UPDATE sites SET games_enabled = false WHERE id = ${ctx.siteId}`;
      const result = await placeBet(100);
      await sql`UPDATE sites SET games_enabled = true WHERE id = ${ctx.siteId}`;
      expect(result.ok).toBe(false);
      expect(result.error).toBe("games disabled");
    });

    it("rejects when the site is unpublished", async () => {
      await clearRounds();
      await sql`UPDATE sites SET published = false WHERE id = ${ctx.siteId}`;
      const result = await placeBet(100);
      await sql`UPDATE sites SET published = true WHERE id = ${ctx.siteId}`;
      expect(result.ok).toBe(false);
      expect(result.error).toBe("site unavailable");
    });

    it("rejects a blocked viewer", async () => {
      await clearRounds();
      await sql`UPDATE site_viewers SET blocked = true WHERE id = ${ctx.siteViewerId}`;
      const result = await placeBet(100);
      await sql`UPDATE site_viewers SET blocked = false WHERE id = ${ctx.siteViewerId}`;
      expect(result.ok).toBe(false);
      expect(result.error).toBe("viewer blocked");
      expect(await balance()).toBe(1000);
    });

    it("rejects a second open round", async () => {
      await clearRounds();
      await setBalance(1000);
      expect((await placeBet(100)).ok).toBe(true);
      const second = await placeBet(100);
      expect(second.ok).toBe(false);
      expect(second.error).toBe("finish your open round first");
    });

    it("enforces the daily loss cap", async () => {
      await clearRounds();
      await setBalance(1000);
      await setSettings({ daily_loss_cap: 150 });
      const first = await placeBet(100);
      expect(first.ok).toBe(true);
      await sql`UPDATE game_rounds SET state = 'settled', payout = 0 WHERE id = ${first.round_id as string}`;
      const second = await placeBet(100);
      expect(second.ok).toBe(false);
      expect(second.error).toBe("daily loss cap reached");
      // A win reduces the net loss, so play can continue.
      await sql`UPDATE game_rounds SET payout = 100 WHERE id = ${first.round_id as string}`;
      expect((await placeBet(100)).ok).toBe(true);
      await setSettings({ daily_loss_cap: null });
    });
  });

  describe("settle_round", () => {
    it("credits the payout with an earn ledger row and closes the round", async () => {
      await clearRounds();
      await setBalance(1000);
      const bet = await placeBet(100);
      const [row] = await sql`SELECT settle_round(${bet.round_id as string}::uuid, 1.98, 198) AS result`;
      expect(row.result.ok).toBe(true);
      expect(row.result.payout).toBe(198);
      expect(await balance()).toBe(1098);

      const [round] = await sql`SELECT * FROM game_rounds WHERE id = ${bet.round_id as string}`;
      expect(round.state).toBe("settled");
      expect(round.settled_at).not.toBeNull();
      const earn = await sql`
        SELECT * FROM credit_ledger WHERE site_viewer_id = ${ctx.siteViewerId} AND type = 'earn'`;
      expect(earn).toHaveLength(1);
      expect(earn[0].amount).toBe(198);
    });

    it("is idempotent: settling twice pays once", async () => {
      await clearRounds();
      await setBalance(1000);
      const bet = await placeBet(100);
      await sql`SELECT settle_round(${bet.round_id as string}::uuid, 2, 200)`;
      const [row] = await sql`SELECT settle_round(${bet.round_id as string}::uuid, 2, 200) AS result`;
      expect(row.result.replayed).toBe(true);
      expect(await balance()).toBe(1100);
      const earn = await sql`
        SELECT count(*)::int AS n FROM credit_ledger
         WHERE site_viewer_id = ${ctx.siteViewerId} AND type = 'earn'`;
      expect(earn[0].n).toBe(1);
    });

    it("a losing settle writes no earn row", async () => {
      await clearRounds();
      await setBalance(1000);
      const bet = await placeBet(100);
      const [row] = await sql`SELECT settle_round(${bet.round_id as string}::uuid, 0, 0) AS result`;
      expect(row.result.ok).toBe(true);
      expect(await balance()).toBe(900);
      const earn = await sql`
        SELECT count(*)::int AS n FROM credit_ledger
         WHERE site_viewer_id = ${ctx.siteViewerId} AND type = 'earn'`;
      expect(earn[0].n).toBe(0);
    });

    it("concurrent settles pay exactly once", async () => {
      await clearRounds();
      await setBalance(1000);
      const bet = await placeBet(100);
      await Promise.all([
        sql`SELECT settle_round(${bet.round_id as string}::uuid, 2, 200)`,
        sql`SELECT settle_round(${bet.round_id as string}::uuid, 2, 200)`,
      ]);
      expect(await balance()).toBe(1100);
    });
  });

  describe("set_round_outcome", () => {
    it("is write-once", async () => {
      await clearRounds();
      await setBalance(1000);
      const bet = await placeBet(100);
      await sql`SELECT set_round_outcome(${bet.round_id as string}::uuid, ${sql.json({ roll: 1 })}::jsonb)`;
      await sql`SELECT set_round_outcome(${bet.round_id as string}::uuid, ${sql.json({ roll: 99 })}::jsonb)`;
      const [round] = await sql`SELECT outcome FROM game_rounds WHERE id = ${bet.round_id as string}`;
      expect(round.outcome).toEqual({ roll: 1 });
    });
  });
});
