// Keep concurrent database work below the Hyperdrive origin connection limit
// shared by all Workers. Raise this only with the production limit in view.
export const SHARED_WORK_CONCURRENCY_LIMIT = 4;

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<Array<R | undefined>> {
  // A worker failure is isolated to its item. Callers that need logging or
  // retry semantics should handle the error in the worker and return a result.
  const results = new Array<R | undefined>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, limit), items.length);

  async function run(): Promise<void> {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch {
        results[index] = undefined;
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => run()));
  return results;
}
