// Zod schemas and a tiny parse helper for the bot dashboard / admin APIs.
// Keeps hand-rolled validation in dashboard-api.ts/hono-app.ts from drifting.

import { z } from "zod";

export const offerCreateSchema = z.object({
  casino: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  referral_url: z.string().url().max(2048),
  promo_code: z.string().max(100).optional(),
  bonus_text: z.string().max(500).optional(),
}).strict();

export const offerToggleSchema = z.object({
  is_active: z.boolean(),
}).strict();

export const botCreateSchema = z.object({
  token: z.string().min(10).max(200),
  welcome_message: z.string().max(500).optional(),
}).strict();

export const botWelcomeSchema = z.object({
  welcome_message: z.string().max(500).optional().nullable(),
}).strict();

export const testMessageSchema = z.object({
  chat_id: z.number().int().positive(),
  text: z.string().min(1).max(4096),
  image_url: z.string().url().max(2048).optional().nullable(),
}).strict();

const commandButtonSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().url().max(2048),
}).strict();

export const commandCreateSchema = z.object({
  command: z.string().min(1).max(50),
  response: z.string().min(1).max(1000),
  buttons: z.array(commandButtonSchema).max(10).optional(),
}).strict();

export const commandUpdateSchema = z.object({
  is_enabled: z.boolean().optional(),
  response: z.string().min(1).max(1000).optional(),
  buttons: z.array(commandButtonSchema).max(10).optional(),
}).strict();

export const broadcastSchema = z.object({
  bot_id: z.string().uuid(),
  body: z.string().min(1).max(4096),
  scheduled_at: z.string().datetime().optional().nullable(),
  media_url: z.string().url().max(2048).optional().nullable(),
}).strict();

export const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
}).strict();

export const adminUserSchema = z.object({
  email: z.string().email().max(254).optional(),
  display_name: z.string().max(80).optional(),
}).strict();

export const adminBotSchema = z.object({
  owner_id: z.string().uuid(),
  token: z.string().min(10).max(200),
  welcome_message: z.string().max(500).optional(),
}).strict();

export const adminOfferSchema = z.object({
  owner_id: z.string().uuid(),
  casino: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  referral_url: z.string().url().max(2048),
  promo_code: z.string().max(100).optional(),
  bonus_text: z.string().max(500).optional(),
  priority: z.coerce.number().int().min(0).optional(),
}).strict();

function friendly(error: z.ZodError): string {
  return error.issues.slice(0, 3).map((i) => `${i.path.join(".") || "request"}: ${i.message}`).join("; ");
}

export async function parseBody<T>(c: { req: { json(): Promise<unknown> }; json?: (obj: T) => any }, schema: z.ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new Error("Invalid JSON body");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(friendly(parsed.error));
  }
  return parsed.data;
}

export async function validatedBody<T>(c: { req: { json(): Promise<unknown> }; json: (obj: any, status?: number) => Response }, schema: z.ZodSchema<T>): Promise<T | Response> {
  try {
    return await parseBody(c, schema);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return c.json({ error: msg }, 400);
  }
}
