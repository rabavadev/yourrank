// Queue producer for YourRank (Phase 6.1)
// Enqueues click and conversion events to Cloudflare Queues
// instead of writing to Postgres inline.
/**
 * Create a queue producer that sends events to a Cloudflare Queue.
 * Falls back to direct DB write if queue is not available.
 */
export function createQueueProducer(queue, fallbackFn) {
    if (!queue) {
        return { send: fallbackFn };
    }
    return {
        async send(event) {
            try {
                await queue.send(event);
            }
            catch (err) {
                console.error("[queue-producer] enqueue failed, using fallback:", String(err));
                await fallbackFn(event);
            }
        },
    };
}
