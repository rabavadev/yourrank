import { describe, it, expect, mock, beforeEach } from "bun:test";
import {
  handleGetDailyQuests,
  handleClaimQuestReward,
  handleTrackQuestProgress,
} from "../handlers/quests.js";
import {
  handleGetDuels,
  handleCreateDuel,
  handleAcceptDuel,
  handleDeclineDuel,
} from "../handlers/duels.js";
import {
  handleGetTournaments,
  handleCreateTournament,
  handleUpdateMatchScore,
  handleGetBracket,
} from "../handlers/tournaments.js";

function mockEnv() {
  return {
    DB: {},
    JWT_SECRET: "test-secret-at-least-32-chars-long!",
  };
}

const USER = { id: "user-123", email: "streamer@test.com", plan: "pro" };
const SITE = { id: "site-456", user_id: "user-123", slug: "streamer", name: "Streamer Hub" };

describe("Quests, Duels & Tournaments Suite", () => {
  let mockOne;
  let mockQuery;
  let mockExec;
  let mockLogAudit;
  let mockWithTransaction;
  let deps;

  beforeEach(() => {
    mockOne = mock();
    mockQuery = mock();
    mockExec = mock();
    mockLogAudit = mock();
    mockWithTransaction = mock((fn) => fn({
      one: mockOne,
      unsafe: mockExec,
    }));

    deps = {
      requireUser: mock().mockResolvedValue({ user: USER, res: null }),
      getByUser: mock().mockResolvedValue(SITE),
      getBoardById: mock().mockResolvedValue(SITE),
      one: mockOne,
      query: mockQuery,
      exec: mockExec,
      logAudit: mockLogAudit,
      withTransaction: mockWithTransaction,
    };
  });

  // --- DAILY QUESTS & STREAKS ---
  describe("Daily Quests & Streaks", () => {
    it("returns daily quests and calculates streak multiplier for viewer", async () => {
      mockOne.mockResolvedValueOnce(SITE); // site
      mockQuery.mockResolvedValueOnce([
        { id: "q-1", quest_key: "watch_30m", title: "Watch stream", target_count: 30, reward_xp: 50, reward_points: 20 },
      ]); // quests
      mockQuery.mockResolvedValueOnce([
        { quest_id: "q-1", current_progress: 15, completed: false, claimed: false },
      ]); // viewer progress
      mockOne.mockResolvedValueOnce({ current_streak: 5, longest_streak: 7 }); // streak

      const req = new Request("http://localhost/api/quests/daily?site=streamer&viewerId=v-1");
      const res = await handleGetDailyQuests(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.quests.length).toBe(1);
      expect(body.quests[0].progress).toBe(15);
      expect(body.streak.currentStreak).toBe(5);
      expect(body.streak.multiplier).toBe(1.2); // 1 + (5-1)*0.05 = 1.20
    });

    it("claims completed quest reward and awards XP & points", async () => {
      mockOne.mockResolvedValueOnce({ id: "q-1", site_id: "site-456", title: "Watch stream", reward_xp: 50, reward_points: 20 }); // quest
      mockOne.mockResolvedValueOnce({ id: "sv-1", balance: 100 }); // site_viewer
      mockOne.mockResolvedValueOnce({ id: "vq-1", current_progress: 30, completed: true, claimed: false }); // vq

      const req = new Request("http://localhost/api/quests/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId: "q-1", viewerId: "v-1" }),
      });

      const res = await handleClaimQuestReward(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.rewardXp).toBe(50);
      expect(body.newBalance).toBe(120);
    });

    it("tracks quest progress and marks completed when target reached", async () => {
      mockOne.mockResolvedValueOnce({ id: "q-1", target_count: 5 }); // quest
      mockOne.mockResolvedValueOnce({ id: "sv-1" }); // site_viewer
      mockOne.mockResolvedValueOnce({ id: "vq-1", current_progress: 3, completed: false }); // vq in tx

      const req = new Request("http://localhost/api/quests/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: "site-456", viewerId: "v-1", questKey: "chat_5_msgs", amount: 2 }),
      });

      const res = await handleTrackQuestProgress(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.progress).toBe(5);
      expect(body.completed).toBe(true);
    });
  });

  // --- VIEWER 1v1 DUELS ---
  describe("Viewer 1v1 Duels", () => {
    it("lists active duels for a site", async () => {
      mockOne.mockResolvedValueOnce(SITE);
      mockQuery.mockResolvedValueOnce([
        { id: "duel-1", wager_amount: 50, status: "pending", challenger_name: "alice", target_name: "bob" },
      ]);

      const req = new Request("http://localhost/api/duels/active?site=streamer");
      const res = await handleGetDuels(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.duels.length).toBe(1);
    });

    it("creates a duel challenge and locks challenger wager", async () => {
      mockOne.mockResolvedValueOnce(SITE); // site
      mockOne.mockResolvedValueOnce({ id: "sv-1", balance: 100 }); // challenger sv
      mockOne.mockResolvedValueOnce({ id: "v-2", username: "rival" }); // target viewer
      mockOne.mockResolvedValueOnce({ id: "sv-2", balance: 100 }); // target sv
      mockOne.mockResolvedValueOnce({ id: "duel-1", wager_amount: 50, status: "pending" }); // insert duel in tx

      const req = new Request("http://localhost/api/duels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: "streamer",
          challengerViewerId: "v-1",
          targetUsername: "rival",
          wagerAmount: 50,
        }),
      });

      const res = await handleCreateDuel(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.duel.wager_amount).toBe(50);
    });

    it("accepts a duel, executes provably fair roll and awards 2x pot to winner", async () => {
      mockOne.mockResolvedValueOnce({
        id: "duel-1",
        site_id: "site-456",
        challenger_viewer_id: "v-1",
        challenger_site_viewer_id: "sv-1",
        target_viewer_id: "v-2",
        target_site_viewer_id: "sv-2",
        wager_amount: 50,
        status: "pending",
        challenger_name: "alice",
        target_name: "bob",
      }); // find duel
      mockOne.mockResolvedValueOnce({ id: "sv-2", balance: 100 }); // target sv balance

      const req = new Request("http://localhost/api/duels/duel-1/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duelId: "duel-1", viewerId: "v-2" }),
      });

      const res = await handleAcceptDuel(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.totalPot).toBe(100);
      expect(body.winnerName).toBeTruthy();
    });

    it("declines a duel and refunds challenger wager", async () => {
      mockOne.mockResolvedValueOnce({
        id: "duel-1",
        challenger_site_viewer_id: "sv-1",
        challenger_viewer_id: "v-1",
        target_viewer_id: "v-2",
        wager_amount: 50,
        status: "pending",
      });

      const req = new Request("http://localhost/api/duels/duel-1/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duelId: "duel-1", viewerId: "v-2" }),
      });

      const res = await handleDeclineDuel(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.status).toBe("declined");
    });
  });

  // --- TOURNAMENT BRACKETS ---
  describe("Tournament Brackets", () => {
    it("lists tournaments for a site", async () => {
      mockOne.mockResolvedValueOnce(SITE);
      mockQuery.mockResolvedValueOnce([
        { id: "tourn-1", title: "Valorant 1v1", game_name: "Valorant", bracket_size: 8, status: "active" },
      ]);

      const req = new Request("http://localhost/api/tournaments?site=streamer");
      const res = await handleGetTournaments(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.tournaments.length).toBe(1);
    });

    it("creates an 8-player single-elimination tournament bracket", async () => {
      mockOne.mockResolvedValueOnce({
        id: "tourn-1",
        title: "Valorant 1v1",
        game_name: "Valorant",
        bracket_size: 8,
        status: "active",
      }); // insert tourn in tx

      const req = new Request("http://localhost/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Valorant 1v1",
          gameName: "Valorant",
          bracketSize: 8,
          participants: ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"],
        }),
      });

      const res = await handleCreateTournament(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.tournament.bracket_size).toBe(8);
    });

    it("updates match score and advances winner to next round", async () => {
      mockOne.mockResolvedValueOnce({
        id: "match-1",
        tournament_id: "tourn-1",
        round_number: 1,
        match_index: 0,
        player1_name: "Alice",
        player2_name: "Bob",
        bracket_size: 8,
      }); // find match

      const req = new Request("http://localhost/api/tournaments/tourn-1/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: "match-1",
          player1Score: 3,
          player2Score: 1,
        }),
      });

      const res = await handleUpdateMatchScore(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.winnerName).toBe("Alice");
      expect(body.isFinals).toBe(false);
    });

    it("returns bracket tree for spectator viewing", async () => {
      mockOne.mockResolvedValueOnce({ id: "tourn-1", title: "Valorant 1v1", bracket_size: 8 });
      mockQuery.mockResolvedValueOnce([
        { id: "m-1", round_number: 1, match_index: 0, player1_name: "Alice", player2_name: "Bob" },
      ]);

      const req = new Request("http://localhost/api/tournaments/tourn-1/bracket");
      const res = await handleGetBracket(req, mockEnv(), deps);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.matches.length).toBe(1);
    });
  });
});
