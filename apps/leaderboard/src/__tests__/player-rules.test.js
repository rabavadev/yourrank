import { describe, expect, it } from "bun:test";
import { normalizePlayerName, sortPlayersForRanking, truncatePlayerName, validateAndNormalizePlayers } from "../player-rules.js";

describe("player rules", () => {
  it("normalizes identity consistently", () => {
    expect(normalizePlayerName("  Alice   Smith ")).toBe("alice smith");
  });

  it("truncates names without splitting graphemes", () => {
    expect(truncatePlayerName("👩‍🚀Rocket", 1)).toBe("👩‍🚀");
  });

  it("rejects duplicate normalized names", () => {
    const result = validateAndNormalizePlayers([{ name: "Alice  Smith" }, { name: " alice smith " }]);
    expect(result.code).toBe("duplicate_player");
  });

  it("rejects negative, non-finite, oversized, and fractional integer values", () => {
    expect(validateAndNormalizePlayers([{ name: "A", wagered: -1 }]).code).toBe("invalid_player_number");
    expect(validateAndNormalizePlayers([{ name: "A", score: "nope" }]).code).toBe("invalid_player_number");
    expect(validateAndNormalizePlayers([{ name: "A", prize: 1e15 + 1 }]).code).toBe("invalid_player_number");
    expect(validateAndNormalizePlayers([{ name: "A", hands: 1.5 }]).code).toBe("invalid_player_number");
  });

  it("applies shared defaults and supports score ranking", () => {
    const result = validateAndNormalizePlayers([{ name: "A", wagered: 12, prize: 5 }]);
    expect(result.players[0]).toMatchObject({ score: 12, hands: 0, netProfit: -7, change: 0 });
    expect(sortPlayersForRanking([{ name: "B", score: 2 }, { name: "A", score: 2 }], "score").map((p) => p.name)).toEqual(["A", "B"]);
  });
});
