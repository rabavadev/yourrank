// Activation funnel tracking (Phase 5.3)
// Instruments: signup → bot connected → first tracked click
// Surfaces drop-off at each stage.

export type FunnelStage = "signup" | "bot_connected" | "first_click" | "first_conversion";

interface FunnelEvent {
  userId: string;
  stage: FunnelStage;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track an activation funnel event.
 * Logs structured JSON for observability (Workers Logs / Logpush).
 * Can be extended to write to a analytics store if needed.
 */
export function trackActivation(
  worker: string,
  userId: string,
  stage: FunnelStage,
  metadata?: Record<string, unknown>
): void {
  const event: FunnelEvent = {
    userId,
    stage,
    timestamp: Date.now(),
    metadata,
  };

  console.log(JSON.stringify({
    level: "info",
    worker,
    msg: "activation_funnel",
    ...event,
    ts: new Date().toISOString(),
  }));
}
