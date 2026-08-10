# YourRank Originals — engine

Pure, deterministic game logic plus the provably-fair RNG. **No I/O, no DB, no
`Math.random`, no `Date.now`** anywhere in `fairness.ts`, `mines.ts`,
`plinko.ts`, `dice.ts`, `limbo.ts`. The only stateful module is `store.ts`,
which wraps the SQL functions from
`supabase/migrations/20260810120000_originals_games.sql`.

Credits are non-cashable, per-site loyalty points. Nothing here touches real
money.

## Provable fairness (commit / reveal)

```
serverSeed      32 random bytes, hex — SECRET while active
serverSeedHash  sha256(serverSeed)   — published before any bet
clientSeed      16 random bytes, hex — viewer may replace it
nonce           incremented atomically by place_bet, one per round
```

Every round's float stream is

```
block(cursor) = hmacSha256(serverSeed, `${clientSeed}:${nonce}:${cursor}`)   // 32 bytes
float(i)      = bytes[4i]/256 + bytes[4i+1]/256² + bytes[4i+2]/256³ + bytes[4i+3]/256⁴
```

8 floats per block; `cursor` increases when a round needs more. Web Crypto only
(Cloudflare Workers runtime).

When the viewer rotates their seed (`POST /api/games/fairness/rotate`) the old
`serverSeed` is revealed, and every round played under it can be replayed:

```ts
import { verifyRound } from "shared/games/fairness.js";

await verifyRound({
  game: "dice", serverSeed, serverSeedHash, clientSeed, nonce,
  params: { target: 50, direction: "over", houseEdgeBps: 100 },
  outcome, // optional: compares against the stored outcome
});
// → { ok, hashMatches, outcomeMatches, outcome, multiplier }
```

Rotation is refused while a round is open, so an in-flight outcome can never be
revealed early.

## House edge

`house_edge_bps` is per site **and** per game (`site_game_settings`), default
**100 bps = 1.00 %**, hard-capped at 1000 bps (10 %) by `MAX_HOUSE_EDGE_BPS`
so a misconfigured site cannot run a predatory edge. The edge in force is
copied onto the round (`game_rounds.house_edge_bps`) and into the stored params
so verification stays reproducible after a settings change.

`edgeFactor(bps) = 1 - bps/10000`. Multipliers are truncated (never rounded up)
to 2 decimals — `floorMultiplier` — and payouts are `floor(bet * multiplier)`,
both a sliver in the house's favour on top of the nominal edge.

**Expected RTP for every game is `1 - edge` = 99 % at the default.**

### Dice

```
chance     = over ? (100 - target)/100 : target/100
multiplier = (1 - edge) / chance
EV         = chance * multiplier = 1 - edge
```

### Limbo

```
u          = 1 - float             uniform in (0, 1]
crashPoint = (1 - edge) / u        floored to 2 dp
win        = crashPoint >= target  →  pays `target`
P(win)     = (1 - edge) / target
EV         = target * (1 - edge)/target = 1 - edge
```

### Mines (multi-step)

`resolveMines` fixes the layout at bet time by shuffling the 25 tiles and
taking the first `mines`. The ladder after `k` safe reveals:

```
P(survive k) = C(n-m, k) / C(n, k)
fair(k)      = 1 / P(survive k) = Π_{i<k} (n - i) / (n - m - i)
multiplier   = (1 - edge) * fair(k)
```

so cashing out after any `k` has EV `1 - edge`, and therefore **every** Mines
strategy has the same RTP.

### Plinko

Bucket `i` of `rows` has binomial probability `C(rows,i)/2^rows`. A raw shape
per risk level (`low|medium|high`) is normalised so that
`Σ p_i * payout_i = 1 - edge`; `plinkoTableRtp()` recomputes that sum from the
published table, and the RTP test asserts it.

## Public interfaces

```ts
// types.ts
interface Rng { next(): number; nextInt(maxExclusive: number): number; used(): number }
GAME_KEYS, isGameKey, DEFAULT_HOUSE_EDGE_BPS, MAX_HOUSE_EDGE_BPS
edgeFactor(bps), floorMultiplier(m), payoutForBet(bet, m)

// fairness.ts
randomFloats(seed, n): Promise<number[]>
rngFromFloats(floats): Rng
createRng(seed, n): Promise<Rng>
shuffle<T>(items, rng): T[]
verifyRound(round): Promise<VerificationResult>
newServerSeed(), newClientSeed(), sha256Hex(s), serverSeedHash(s)

// per game — all pure
resolveMines(rng, { gridSize?, mines, houseEdgeBps })   → { outcome: { gridSize, mines, minePositions }, multiplier: 0 }
cashoutMultiplier(gridSize, mines, revealed, houseEdgeBps): number
minesMultiplierTable(gridSize, mines, houseEdgeBps): number[]
resolvePlinko(rng, { rows, risk, houseEdgeBps })        → { outcome: { rows, risk, path, bucket }, multiplier }
plinkoPayoutTable(rows, risk, houseEdgeBps): number[]
resolveDice(rng, { target, direction, houseEdgeBps })   → { outcome: { roll, win, … }, multiplier }
resolveLimbo(rng, { target, houseEdgeBps })             → { outcome: { crashPoint, win, … }, multiplier }

// index.ts — what the Worker uses
validateParams(game, raw, houseEdgeBps): ParamsResult<GameParams>
resolveWithRng(game, rng, params): { outcome, multiplier }
resolveRound(game, seed, params): Promise<{ outcome, multiplier }>
isMultiStep(game): boolean   // true for mines only
```

`multiplier` is `0` for Mines from `resolve`: the round is only worth something
once the viewer cashes out, via `cashoutMultiplier`.

## Never leak

`minePositions` of an **open** round, the active `serverSeed`, and the
pre-computed outcome of an open round must never appear in a response. The
handler (`apps/leaderboard/src/handlers/games.js`) strips them; `store.ts`
returns the server seed only to the code path that derives the outcome.
