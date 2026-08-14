/** @jsxImportSource preact */
import { useEffect, useRef, useState } from "preact/hooks";
import type { GameProps } from "../../registry.js";
import { BetPanel } from "../../ui/BetPanel.js";
import { sound } from "../../sound.js";
import { haptic } from "../../haptics.js";

interface Ball {
  id: number;
  x: number; // pixel offset from center
  y: number; // pixel offset from top
  step: number;
  col: number;
  path: Array<{ x: number; y: number }>;
  bucket: number;
}

const BUCKET_MULTIPLIERS: Record<string, number[]> = {
  low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
  medium: [13.0, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13.0],
  high: [29.0, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29.0],
};

const ROWS = 8;
const PEG_SPACING = 36;
const ROW_HEIGHT = 30;

export default function PlinkoBoard({ store, config }: GameProps) {
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [activeBucket, setActiveBucket] = useState<number | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [inFlight, setInFlight] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const nextBallId = useRef(1);

  const multipliers = BUCKET_MULTIPLIERS[risk] || BUCKET_MULTIPLIERS.medium;

  // Animate balls smoothly down the peg pyramid
  useEffect(() => {
    if (balls.length === 0) return;

    const timer = setInterval(() => {
      setBalls((prev) => {
        const nextList: Ball[] = [];

        for (const ball of prev) {
          if (ball.step < ball.path.length - 1) {
            const nextStep = ball.step + 1;
            const nextPos = ball.path[nextStep];
            nextList.push({
              ...ball,
              step: nextStep,
              x: nextPos.x,
              y: nextPos.y,
            });
            if (nextStep <= ROWS) {
              sound.play("click");
            }
          } else {
            // Reached bucket
            setActiveBucket(ball.bucket);
            setTimeout(() => setActiveBucket(null), 600);
            const mult = multipliers[ball.bucket] ?? 1;
            if (mult >= 1.5) {
              sound.play("win");
              haptic("win");
            } else if (mult >= 1.0) {
              sound.play("click");
              haptic("tap");
            } else {
              sound.play("lose");
              haptic("error");
            }
          }
        }
        return nextList;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [balls.length, multipliers]);

  const handleDrop = async (amount: number) => {
    if (inFlight) return;
    setInFlight(true);
    setLocalError(null);

    try {
      const res = await store.api.placeBet({
        game: "plinko",
        amount,
      });

      // True physical Galton board simulation: at each row, 50% chance left or right
      let col = 0;
      const path: Array<{ x: number; y: number }> = [{ x: 0, y: 8 }]; // start above top pin

      for (let r = 1; r <= ROWS; r++) {
        const goRight = Math.random() < 0.5;
        if (goRight) col += 1;
        const xPos = (col - r / 2) * PEG_SPACING;
        const yPos = r * ROW_HEIGHT + 10;
        path.push({ x: xPos, y: yPos });
      }

      // Final landing in bottom bucket (col is 0 to ROWS)
      const finalBucket = Math.min(multipliers.length - 1, Math.max(0, col));
      const finalX = (finalBucket - (multipliers.length - 1) / 2) * PEG_SPACING;
      path.push({ x: finalX, y: (ROWS + 1) * ROW_HEIGHT + 14 });

      const newBall: Ball = {
        id: nextBallId.current++,
        x: path[0].x,
        y: path[0].y,
        step: 0,
        col,
        path,
        bucket: finalBucket,
      };

      setBalls((prev) => [...prev, newBall]);
      sound.play("bet");
      haptic("impact");
      store.applyResult(res);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to drop ball");
      store.setError(err);
    } finally {
      setInFlight(false);
    }
  };

  return (
    <div class="gx-game gx-plinko" style={{ display: "grid", gap: "16px", padding: "16px", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Plinko Pyramid Stage */}
      <div
        class="gx-plinko__stage"
        style={{
          background: "#0c1017",
          border: "1px solid #1e293b",
          borderRadius: "16px",
          padding: "24px 16px 20px",
          display: "grid",
          gap: "12px",
          placeItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pegs Grid */}
        <div style={{ position: "relative", width: `${(ROWS + 2) * PEG_SPACING}px`, height: `${(ROWS + 1) * ROW_HEIGHT + 20}px` }}>
          {Array.from({ length: ROWS }, (_, rowIdx) => {
            const count = rowIdx + 3;
            const y = (rowIdx + 1) * ROW_HEIGHT + 10;
            return (
              <div key={rowIdx}>
                {Array.from({ length: count }, (_, colIdx) => {
                  const x = (colIdx - (count - 1) / 2) * PEG_SPACING;
                  return (
                    <div
                      key={colIdx}
                      style={{
                        position: "absolute",
                        left: `calc(50% + ${x}px)`,
                        top: `${y}px`,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#94a3b8",
                        boxShadow: "0 0 6px rgba(148, 163, 184, 0.8)",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Animated Balls */}
          {balls.map((b) => (
            <div
              key={b.id}
              style={{
                position: "absolute",
                top: `${b.y}px`,
                left: `calc(50% + ${b.x}px)`,
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                boxShadow: "0 0 12px #f59e0b, inset 0 2px 4px rgba(255,255,255,0.4)",
                transform: "translate(-50%, -50%)",
                transition: "all 0.06s cubic-bezier(0.2, 0.8, 0.4, 1)",
                zIndex: 10,
              }}
            />
          ))}
        </div>

        {/* Bottom Buckets */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${multipliers.length}, 1fr)`,
            gap: "4px",
            width: `${multipliers.length * PEG_SPACING}px`,
            maxWidth: "100%",
            marginTop: "6px",
          }}
        >
          {multipliers.map((m, idx) => {
            const isHit = activeBucket === idx;
            const isHigh = m >= 10;
            const isMid = m >= 1.5;

            return (
              <div
                key={idx}
                style={{
                  padding: "8px 2px",
                  borderRadius: "6px",
                  background: isHit
                    ? "#ffffff"
                    : isHigh
                    ? "linear-gradient(135deg, #e11d48, #be123c)"
                    : isMid
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "#1e293b",
                  color: isHit ? "#000000" : "#ffffff",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: "800",
                  textAlign: "center",
                  boxShadow: isHit
                    ? "0 0 16px #ffffff"
                    : isHigh
                    ? "0 0 10px rgba(225, 29, 72, 0.4)"
                    : "none",
                  transform: isHit ? "scale(1.18) translateY(-4px)" : "none",
                  transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {m}×
              </div>
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
          onSubmit={handleDrop}
          currency={store.currency.value}
          actionLabel="Drop Ball"
          loading={inFlight}
          error={localError}
        >
          {/* Risk Selector */}
          <div style={{ display: "grid", gap: "6px", marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", fontWeight: "600" }}>
              Risk Level
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              {(["low", "medium", "high"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRisk(r)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: risk === r ? "#38bdf8" : "#334155",
                    background: risk === r ? "rgba(56, 189, 248, 0.15)" : "#1e293b",
                    color: risk === r ? "#38bdf8" : "#94a3b8",
                    fontWeight: "700",
                    fontSize: "12px",
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </BetPanel>
      </div>
    </div>
  );
}
