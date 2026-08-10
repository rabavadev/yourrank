// Store access for games. A game never imports a module-level singleton — it
// takes the store from context, so a demo harness (or a test) can mount the
// exact same component tree against a different API implementation.
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { GamesStore } from "./store.js";

export const GamesStoreContext = createContext<GamesStore | null>(null);

export function useGamesStore(): GamesStore {
  const store = useContext(GamesStoreContext);
  if (!store) throw new Error("useGamesStore must be used inside <GamesShell>");
  return store;
}
