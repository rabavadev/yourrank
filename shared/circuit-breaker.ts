// Circuit breaker for external HTTP calls (Kick, Discord, etc.).
// Keeps a per-isolate state machine so one failing upstream cannot starve
// the Worker of CPU/connections with repeated timeouts.

import { getLogger } from "./request-id.js";

export class CircuitOpenError extends Error {
  constructor(public readonly name: string) {
    super(`Circuit breaker OPEN for ${name}`);
  }
}

interface CircuitBreakerOptions {
  // Number of consecutive failures before opening the circuit.
  failureThreshold?: number;
  // Milliseconds to wait before allowing a single half-open probe.
  resetTimeoutMs?: number;
  // Number of consecutive half-open successes required to close the circuit.
  halfOpenSuccessThreshold?: number;
}

export class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failures = 0;
  private lastFailureTime = 0;
  private halfOpenSuccesses = 0;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions = {}
  ) {
    this.options.failureThreshold = options.failureThreshold ?? 5;
    this.options.resetTimeoutMs = options.resetTimeoutMs ?? 30_000;
    this.options.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed < (this.options.resetTimeoutMs as number)) {
        throw new CircuitOpenError(this.name);
      }
      this.state = "half-open";
      this.halfOpenSuccesses = 0;
      getLogger().info("circuit_breaker_half_open", { circuit: this.name });
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === "half-open") {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= (this.options.halfOpenSuccessThreshold as number)) {
        this.state = "closed";
        this.failures = 0;
        getLogger().info("circuit_breaker_closed", { circuit: this.name });
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(err: unknown) {
    if (this.state === "half-open") {
      this.state = "open";
      this.lastFailureTime = Date.now();
      getLogger().warn("circuit_breaker_reopened", { circuit: this.name, error: String(err) });
      return;
    }

    this.failures++;
    if (this.failures >= (this.options.failureThreshold as number)) {
      this.state = "open";
      this.lastFailureTime = Date.now();
      getLogger().error("circuit_breaker_opened", { circuit: this.name, failures: this.failures });
    }
  }
}
