// ============================================================================
//  Game registry — the only place a game is wired into the shell.
//
//  Each entry is a dynamic import, which is what makes the per-game code split
//  real: esbuild emits one chunk per game and the browser downloads only the
//  game the viewer opened. Adding a game is one line here plus one directory.
// ============================================================================
import type { ComponentType } from "preact";
import type { GameConfig, GameId } from "./types.js";
import type { GamesStore } from "./state/store.js";

/** Props every game component receives. Nothing else is passed, ever. */
export interface GameProps {
  store: GamesStore;
  config: GameConfig;
}

export type GameComponent = ComponentType<GameProps>;

export interface GameModule {
  /** The board. Rendered inside <GameFrame>. */
  default: GameComponent;
  /**
   * The game's bet controls. Optional: a game with no extra options gets the
   * shared DefaultBetPanel. A game that needs its own (mine count, risk,
   * target) exports one — usually <BetPanel> with children.
   */
  Panel?: GameComponent;
}

export const GAME_LOADERS: Record<GameId, () => Promise<GameModule>> = {
  mines: () => import("./games/mines/index.js"),
  plinko: () => import("./games/plinko/index.js"),
  dice: () => import("./games/dice/index.js"),
};

export function isGameId(value: string | null | undefined): value is GameId {
  return value === "mines" || value === "plinko" || value === "dice";
}
