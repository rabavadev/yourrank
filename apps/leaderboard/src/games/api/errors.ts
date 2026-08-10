// Error type shared by the real and the mock API client, so every consumer
// branches on one shape. HTTP status and server `error` codes are mapped to a
// `GamesErrorCode` here — components never parse status codes themselves.
import type { GamesErrorCode } from "../types.js";

const MESSAGES: Record<GamesErrorCode, string> = {
  unauthenticated: "Sign in to play.",
  games_disabled: "This streamer has turned games off.",
  game_disabled: "This game is currently unavailable.",
  insufficient_credits: "You don't have enough credits for that bet.",
  bet_too_small: "That bet is below the minimum.",
  bet_too_large: "That bet is above the maximum.",
  limit_reached: "You've hit your play limit for now.",
  cooldown: "Slow down a moment before the next round.",
  round_not_found: "That round has already finished.",
  rate_limited: "Too many requests — try again in a moment.",
  timeout: "The server took too long to answer. Nothing was charged.",
  network: "Connection lost. Check your internet and try again.",
  server_error: "Something went wrong on our side. Try again.",
  bad_request: "That request wasn't valid.",
};

/** Codes worth showing a "Try again" affordance for. */
const RETRYABLE = new Set<GamesErrorCode>(["timeout", "network", "server_error", "rate_limited"]);

export class GamesApiError extends Error {
  readonly code: GamesErrorCode;
  readonly status: number;
  readonly retryable: boolean;

  constructor(code: GamesErrorCode, status = 0, message?: string) {
    super(message || MESSAGES[code] || MESSAGES.server_error);
    this.name = "GamesApiError";
    this.code = code;
    this.status = status;
    this.retryable = RETRYABLE.has(code);
  }
}

const KNOWN_CODES = new Set<string>(Object.keys(MESSAGES));

/** Map an HTTP status + server error body onto a client error code. */
export function toErrorCode(status: number, body: unknown): GamesErrorCode {
  const raw =
    body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string"
      ? (body as { error: string }).error
      : "";
  if (KNOWN_CODES.has(raw)) return raw as GamesErrorCode;
  if (status === 401 || status === 403) return "unauthenticated";
  if (status === 404) return "round_not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "bad_request";
}

/**
 * Server-supplied human message wins when present; otherwise use ours.
 * The Worker's `bad()` helper answers `{ error }`, where `error` is either a
 * machine code we already map above or a sentence written for the viewer — only
 * the latter is worth showing.
 */
export function errorMessageFrom(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const { message, error } = body as { message?: unknown; error?: unknown };
  if (typeof message === "string" && message.trim()) return message.trim();
  if (typeof error === "string" && error.trim() && !KNOWN_CODES.has(error)) return error.trim();
  return undefined;
}
