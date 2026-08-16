// Extract a human-readable message from an unknown thrown value without
// resorting to `any`. Handles Error instances, objects carrying a `message`
// field, and primitives.
export function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

// Stack trace of an unknown thrown value, or "" when unavailable.
export function errStack(err: unknown): string {
  return err instanceof Error ? err.stack ?? "" : "";
}
