/** @jsxImportSource preact */
import { useMemo, useState } from "preact/hooks";
import type { GameProps } from "../../registry.js";
import { BetPanel } from "../../ui/BetPanel.js";
import { sound } from "../../sound.js";
import { haptic } from "../../haptics.js";
import { formatCredits } from "../../bet.js";

const GRID_SIZE = 25;

export default function MinesBoard({ store, config }: GameProps) {
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [hitMine, setHitMine] = useState<number | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [inFlight, setInFlight] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPlaying = roundId !== null;
  const gemCount = GRID_SIZE - mineCount;
  const revealedCount = revealed.size;

  // Calculate next potential multiplier
  const nextMultiplier = useMemo(() => {
    if (!isPlaying) {
      return Math.round((0.99 * (GRID_SIZE / (GRID_SIZE - mineCount))) * 100) / 100;
    }
    const remainingGems = gemCount - revealedCount;
    const remainingTiles = GRID_SIZE - revealedCount;
    if (remainingGems <= 0) return currentMultiplier;
    return Math.round(currentMultiplier * (remainingTiles / remainingGems) * 100) / 100;
  }, [isPlaying, mineCount, revealedCount, currentMultiplier, gemCount]);

  const currentPayout = isPlaying ? Math.floor(betAmount * currentMultiplier) : 0;

  const handleStartGame = async (amount: number) => {
    if (isPlaying || inFlight) return;
    setInFlight(true);
    setLocalError(null);
    setHitMine(null);
    setMines(new Set());
    setRevealed(new Set());
    setCurrentMultiplier(1);

    try {
      const res = await store.api.placeBet({
        game: "mines",
        amount,
      });
      setRoundId(res.roundId);
      setBetAmount(amount);
      sound.play("bet");
      haptic("impact");
    } catch (err: any) {
      setLocalError(err?.message || "Failed to start round");
      store.setError(err);
    } finally {
      setInFlight(false);
    }
  };

  const handleTileClick = async (index: number) => {
    if (!isPlaying || inFlight || revealed.has(index) || !roundId) return;
    setInFlight(true);
    setLocalError(null);

    try {
      const res = await store.api.minesReveal({
        roundId,
        tile: index,
      });

      if (res.status === "lost") {
        setHitMine(index);
        const allMines = new Set<number>((res.outcome as any)?.mines || [index]);
        setMines(allMines);
        setRoundId(null);
        sound.play("lose");
        haptic("error");
        store.applyResult(res);
      } else {
        setRevealed((prev) => new Set([...prev, index]));
        setCurrentMultiplier(res.multiplier || 1.15);
        sound.play("reveal");
        haptic("tap");
        if (res.status === "won" || res.status === "cashed_out") {
          setRoundId(null);
          store.applyResult(res);
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || "Failed to reveal tile");
    } finally {
      setInFlight(false);
    }
  };

  const handleCashout = async () => {
    if (!isPlaying || inFlight || !roundId || revealedCount === 0) return;
    setInFlight(true);
    try {
      const res = await store.api.minesCashout({
        roundId,
      });
      setRoundId(null);
      sound.play("cashout");
      haptic("win");
      store.applyResult(res);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to cash out");
    } finally {
      setInFlight(false);
    }
  };

  return (
    <div class="gx-game gx-mines" style={{ display: "grid", gap: "16px", padding: "16px", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Board & HUD */}
      <div class="gx-mines__stage" style={{ background: "#0c1017", border: "1px solid #1e293b", borderRadius: "16px", padding: "20px", display: "grid", placeItems: "center", gap: "16px" }}>
        
        {/* HUD Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "420px", color: "#94a3b8", fontSize: "13px", fontWeight: "600" }}>
          <div>Mines: <span style={{ color: "#f43f5e" }}>{mineCount}</span></div>
          <div>
            {isPlaying ? (
              <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>💎 {revealedCount}/{gemCount}</span>
                <span>•</span>
                <span style={{ fontFamily: "monospace", fontWeight: "700" }}>{currentMultiplier.toFixed(2)}×</span>
              </span>
            ) : (
              <span>Gems: {gemCount}</span>
            )}
          </div>
          <div>Next: <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{nextMultiplier.toFixed(2)}×</span></div>
        </div>

        {/* 5x5 Grid */}
        <div
          class="gx-mines__grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
            width: "100%",
            maxWidth: "420px",
            aspectRatio: "1",
          }}
        >
          {Array.from({ length: GRID_SIZE }, (_, i) => {
            const isRevealed = revealed.has(i);
            const isMine = mines.has(i);
            const isExploded = hitMine === i;

            return (
              <button
                key={i}
                type="button"
                disabled={!isPlaying || inFlight || isRevealed}
                onClick={() => handleTileClick(i)}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  cursor: isPlaying && !isRevealed ? "pointer" : "default",
                  background: isExploded
                    ? "linear-gradient(135deg, #ef4444, #991b1b)"
                    : isMine
                    ? "#334155"
                    : isRevealed
                    ? "linear-gradient(135deg, #059669, #065f46)"
                    : "#1e293b",
                  boxShadow: isRevealed
                    ? "0 0 16px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)"
                    : isExploded
                    ? "0 0 20px rgba(239, 68, 68, 0.6)"
                    : "0 4px 8px rgba(0,0,0,0.3)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                  transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform: isRevealed ? "scale(0.96)" : "none",
                  padding: 0,
                }}
              >
                {isExploded ? "💥" : isMine ? "💣" : isRevealed ? "💎" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>
        <BetPanel
          bounds={{ min: config.minBet, max: config.maxBet, balance: store.balance.value }}
          amount={betAmount}
          onAmountChange={setBetAmount}
          onSubmit={handleStartGame}
          currency={store.currency.value}
          actionLabel={isPlaying ? "Game in Progress" : "Bet & Start"}
          loading={inFlight}
          disabled={isPlaying}
          error={localError}
          secondary={
            isPlaying && revealedCount > 0 ? (
              <button
                type="button"
                class="gx-btn gx-btn--primary gx-btn--block"
                onClick={handleCashout}
                disabled={inFlight}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                  marginTop: "8px",
                }}
              >
                Cash Out {formatCredits(currentPayout)} ({currentMultiplier.toFixed(2)}×)
              </button>
            ) : null
          }
        >
          {/* Mines selector */}
          <div style={{ display: "grid", gap: "6px", marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", fontWeight: "600" }}>
              Number of Mines
            </label>
            <select
              value={mineCount}
              disabled={isPlaying}
              onChange={(e) => setMineCount(Number((e.target as HTMLSelectElement).value))}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#1e293b",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isPlaying ? "not-allowed" : "pointer",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 24].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Mine" : "Mines"}
                </option>
              ))}
            </select>
          </div>
        </BetPanel>
      </div>
    </div>
  );
}
