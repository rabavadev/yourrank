/** @jsxImportSource preact */
// Plinko board. Owned by the plinko game session — replace the placeholder below
// with the real board; the export contract (default export of a component
// taking `GameProps`) is what the registry loads.
import { ComingSoon } from "../ComingSoon.js";
import type { GameProps } from "../../registry.js";

export default function PlinkoGame(props: GameProps) {
  return <ComingSoon {...props} />;
}
