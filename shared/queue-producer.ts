// Queue producer for YourRank (Phase 6.1)
// Enqueues click, conversion, and analytics events to Cloudflare Queues
// instead of writing to Postgres inline.

import { z } from "zod";

const id = z.string().min(1).max(128);
const label = z.string().max(256);
const timestamp = z.number().int().nonnegative();

const clickEventSchema = z.object({
  type: z.literal("click"),
  shortLinkId: id,
  ipHash: z.string().regex(/^[a-f0-9]{64}$/),
  tgUserId: z.number().int().positive().safe().nullable(),
  clickRef: z.string().min(1).max(128),
  timestamp,
}).strict();

const conversionEventSchema = z.object({
  type: z.literal("conversion"),
  ownerId: id,
  query: z.record(z.union([z.string(), z.array(z.string())])),
  timestamp,
}).strict();

const bumpEventSchema = z.object({
  type: z.literal("bump"),
  siteId: id,
  field: z.enum(["views", "copies", "clicks"]),
  referer: z.string().max(2_048).nullable(),
  timestamp,
}).strict();

const top3NotifyEventSchema = z.object({
  type: z.literal("notify"),
  kind: z.literal("top3"),
  siteId: id,
  siteName: label,
  changes: z.array(z.object({
    name: label,
    rank: z.number().int().positive(),
    wagered: z.number().finite(),
  }).strict()).max(3),
}).strict();

const resetNotifyEventSchema = z.object({
  type: z.literal("notify"),
  kind: z.literal("reset"),
  siteId: id,
  siteName: label,
  players: z.array(z.object({
    name: label,
    wagered: z.number().finite(),
    prize: z.number().finite().optional(),
  }).strict()).max(10_000),
  period: z.string().max(64),
}).strict();

const playerRankNotifyEventSchema = z.object({
  type: z.literal("notify"),
  kind: z.literal("player-rank"),
  siteId: id,
  siteName: label,
  playerName: label,
  oldRank: z.number().int().positive().nullable(),
  newRank: z.number().int().positive(),
  botId: id,
  tgUserId: z.number().int().positive().safe(),
}).strict();

export const queueEventSchema = z.union([
  clickEventSchema,
  conversionEventSchema,
  bumpEventSchema,
  top3NotifyEventSchema,
  resetNotifyEventSchema,
  playerRankNotifyEventSchema,
]);

export type QueueEvent = z.infer<typeof queueEventSchema>;
export type ClickEvent = z.infer<typeof clickEventSchema>;
export type ConversionEvent = z.infer<typeof conversionEventSchema>;
export type BumpEvent = z.infer<typeof bumpEventSchema>;
export type NotifyEvent =
  | z.infer<typeof top3NotifyEventSchema>
  | z.infer<typeof resetNotifyEventSchema>
  | z.infer<typeof playerRankNotifyEventSchema>;

export function parseQueueEvent(input: unknown): QueueEvent {
  return queueEventSchema.parse(input);
}

interface QueueProducer {
  send(message: QueueEvent): Promise<void>;
}

/**
 * Create a queue producer that sends events to a Cloudflare Queue.
 * Falls back to direct DB write if the queue is not bound or the enqueue fails.
 */
export function createQueueProducer(
  queue: { send: (message: QueueEvent) => Promise<void> } | undefined,
  fallbackFn: (event: QueueEvent) => Promise<void>
): QueueProducer {
  if (!queue) {
    return { send: fallbackFn };
  }

  return {
    async send(event: QueueEvent): Promise<void> {
      try {
        await queue.send(event);
      } catch (err) {
        console.error("[queue-producer] enqueue failed, using fallback:", String(err));
        await fallbackFn(event);
      }
    },
  };
}
