// ============================================================================
//  Games API client.
//
//  Contract: THE SERVER IS AUTHORITATIVE. This module is the only place the
//  games UI talks to the network, and the only thing it does with a response is
//  hand it back typed. It never derives an outcome, a payout, a balance or any
//  randomness; if a call fails, it throws — it does not invent a result.
//
//  Every mutating call carries an `Idempotency-Key` so a retry after a dropped
//  connection can never place a second bet: the backend returns the original
//  round for a repeated key.
// ============================================================================
import type {
  BetRequest,
  BetResult,
  FairnessResponse,
  GameId,
  GamesConfig,
  HistoryResponse,
  MinesCashoutRequest,
  MinesRevealRequest,
} from "../types.js";
import { GamesApiError, errorMessageFrom, toErrorCode } from "./errors.js";

export interface GamesApiOptions {
  slug: string;
  /** Request budget per attempt, ms. */
  timeoutMs?: number;
  /** Extra attempts after the first for retryable failures. */
  retries?: number;
  /** Base backoff, ms — doubled per attempt. */
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
  /** Injectable so tests don't sleep and so callers can cancel. */
  sleep?: (ms: number) => Promise<void>;
  /** Injectable for deterministic tests. */
  idempotencyKey?: () => string;
  now?: () => number;
}

/** The surface the shell and every game are written against. */
export interface GamesApi {
  getConfig(signal?: AbortSignal): Promise<GamesConfig>;
  placeBet(req: Omit<BetRequest, "slug">, signal?: AbortSignal): Promise<BetResult>;
  minesReveal(req: Omit<MinesRevealRequest, "slug">, signal?: AbortSignal): Promise<BetResult>;
  minesCashout(req: Omit<MinesCashoutRequest, "slug">, signal?: AbortSignal): Promise<BetResult>;
  getHistory(params?: { game?: GameId; cursor?: string; limit?: number }, signal?: AbortSignal): Promise<HistoryResponse>;
  getFairness(signal?: AbortSignal): Promise<FairnessResponse>;
  rotateFairness(clientSeed?: string, signal?: AbortSignal): Promise<FairnessResponse>;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

export function readCsrfToken(cookie = typeof document === "undefined" ? "" : document.cookie): string {
  const m = /(?:^|;\s*)__csrf=([^;]+)/.exec(cookie || "");
  return m ? m[1] : "";
}

function randomKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class HttpGamesApi implements GamesApi {
  private readonly slug: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly retryDelayMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly newKey: () => string;

  constructor(opts: GamesApiOptions) {
    this.slug = opts.slug;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = opts.retries ?? DEFAULT_RETRIES;
    this.retryDelayMs = opts.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    this.fetchImpl = opts.fetchImpl ?? ((...a: Parameters<typeof fetch>) => fetch(...a));
    this.sleep = opts.sleep ?? defaultSleep;
    this.newKey = opts.idempotencyKey ?? randomKey;
  }

  getConfig(signal?: AbortSignal): Promise<GamesConfig> {
    return this.request<GamesConfig>("GET", `/api/games/config?slug=${encodeURIComponent(this.slug)}`, undefined, signal);
  }

  placeBet(req: Omit<BetRequest, "slug">, signal?: AbortSignal): Promise<BetResult> {
    return this.request<BetResult>("POST", "/api/games/bet", { slug: this.slug, ...req }, signal);
  }

  minesReveal(req: Omit<MinesRevealRequest, "slug">, signal?: AbortSignal): Promise<BetResult> {
    return this.request<BetResult>("POST", "/api/games/mines/reveal", { slug: this.slug, ...req }, signal);
  }

  minesCashout(req: Omit<MinesCashoutRequest, "slug">, signal?: AbortSignal): Promise<BetResult> {
    return this.request<BetResult>("POST", "/api/games/mines/cashout", { slug: this.slug, ...req }, signal);
  }

  getHistory(params: { game?: GameId; cursor?: string; limit?: number } = {}, signal?: AbortSignal): Promise<HistoryResponse> {
    const q = new URLSearchParams({ slug: this.slug });
    if (params.game) q.set("game", params.game);
    if (params.cursor) q.set("cursor", params.cursor);
    if (params.limit) q.set("limit", String(params.limit));
    return this.request<HistoryResponse>("GET", `/api/games/history?${q.toString()}`, undefined, signal);
  }

  getFairness(signal?: AbortSignal): Promise<FairnessResponse> {
    return this.request<FairnessResponse>("GET", `/api/games/fairness?slug=${encodeURIComponent(this.slug)}`, undefined, signal);
  }

  rotateFairness(clientSeed?: string, signal?: AbortSignal): Promise<FairnessResponse> {
    return this.request<FairnessResponse>("POST", "/api/games/fairness/rotate", { slug: this.slug, clientSeed }, signal);
  }

  /**
   * One attempt loop for every endpoint. Retries only transport-level and 5xx
   * failures, always under the same idempotency key so a retried bet resolves
   * to the round the first attempt may already have created.
   */
  private async request<T>(method: "GET" | "POST", path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const idempotencyKey = method === "POST" ? this.newKey() : "";
    let lastError: GamesApiError = new GamesApiError("network");

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (attempt > 0) await this.sleep(this.retryDelayMs * 2 ** (attempt - 1));
      try {
        return await this.attempt<T>(method, path, body, idempotencyKey, signal);
      } catch (err) {
        const apiErr = err instanceof GamesApiError ? err : new GamesApiError("network");
        if (!apiErr.retryable) throw apiErr;
        lastError = apiErr;
      }
    }
    throw lastError;
  }

  private async attempt<T>(
    method: "GET" | "POST",
    path: string,
    body: unknown,
    idempotencyKey: string,
    signal?: AbortSignal
  ): Promise<T> {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = { accept: "application/json" };
    if (method === "POST") {
      headers["content-type"] = "application/json";
      headers["x-csrf-token"] = readCsrfToken();
      headers["idempotency-key"] = idempotencyKey;
    }

    let res: Response;
    try {
      res = await this.fetchImpl(path, {
        method,
        headers,
        credentials: "same-origin",
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
        signal: controller.signal,
      });
    } catch {
      // A caller-driven abort is a cancellation, not a transport failure; a
      // timeout is retryable but must read as a timeout to the viewer.
      throw new GamesApiError(signal?.aborted ? "network" : "timeout");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }

    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new GamesApiError(toErrorCode(res.status, payload), res.status, errorMessageFrom(payload));
    }
    if (payload === null || typeof payload !== "object") {
      throw new GamesApiError("server_error", res.status);
    }
    return payload as T;
  }
}

export function createGamesApi(opts: GamesApiOptions): GamesApi {
  return new HttpGamesApi(opts);
}
