"use server";

import { botApiDelete, botApiGet, botApiPatch, botApiPost } from "@/lib/api";
import { localDateTimeToUtc } from "@/lib/date";
import { revalidatePath } from "next/cache";

export interface TelegramResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export async function createBot(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const token = String(formData.get("token") || "").trim();
  const welcome_message = String(formData.get("welcome_message") || "").trim() || undefined;
  if (!token) return { ok: false, error: "Bot token is required." };

  const result = await botApiPost<{ ok: boolean; bot_id: string }>("/bots", { token, welcome_message });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/bots");
  return { ok: true, id: result.data.bot_id };
}

export async function deleteBot(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Bot ID is required." };

  const result = await botApiDelete<{ ok: boolean }>(`/bots/${id}`);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/bots");
  return { ok: true };
}

export async function syncBotCommands(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Bot ID is required." };

  const result = await botApiPost<{ ok: boolean }>(`/bots/${id}/sync-commands`, {});
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/bots");
  return { ok: true };
}

export async function updateBotWelcome(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  const welcome_message = String(formData.get("welcome_message") || "").trim() || null;
  if (!id) return { ok: false, error: "Bot ID is required." };

  const result = await botApiPatch<{ ok: boolean }>(`/bots/${id}`, { welcome_message });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/bots");
  return { ok: true };
}

export async function createCommand(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const botId = String(formData.get("botId") || "").trim();
  const command = String(formData.get("command") || "").trim().replace(/^\//, "");
  const response = String(formData.get("response") || "").trim();
  const buttonsJson = String(formData.get("buttons") || "[]").trim();
  if (!botId || !command || !response) return { ok: false, error: "Bot, command and response are required." };

  let buttons;
  try { buttons = JSON.parse(buttonsJson); } catch { buttons = []; }

  const result = await botApiPost<{ ok: boolean; id: string }>(`/bots/${botId}/commands`, { command, response, buttons });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/commands");
  return { ok: true, id: result.data.id };
}

export async function updateCommand(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  const response = String(formData.get("response") || "").trim();
  const is_enabled = formData.get("is_enabled") === "on";
  if (!id || !response) return { ok: false, error: "Command and response are required." };

  const result = await botApiPatch<{ ok: boolean }>(`/commands/${id}`, { response, is_enabled });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/commands");
  return { ok: true };
}

export async function deleteCommand(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Command ID is required." };

  const result = await botApiDelete<{ ok: boolean }>(`/commands/${id}`);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/commands");
  return { ok: true };
}

export async function createOffer(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const casino = String(formData.get("casino") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const referral_url = String(formData.get("referral_url") || "").trim();
  const promo_code = String(formData.get("promo_code") || "").trim() || undefined;
  const bonus_text = String(formData.get("bonus_text") || "").trim() || undefined;
  if (!casino || !label || !referral_url) return { ok: false, error: "Casino, label and URL are required." };

  const result = await botApiPost<{ ok: boolean; offer_id: string }>("/offers", { casino, label, referral_url, promo_code, bonus_text });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/offers");
  return { ok: true, id: result.data.offer_id };
}

export async function toggleOffer(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  const is_active = formData.get("is_active") === "on";
  if (!id) return { ok: false, error: "Offer ID is required." };

  const result = await botApiPatch<{ ok: boolean }>(`/offers/${id}`, { is_active });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/offers");
  return { ok: true };
}

export async function createBroadcast(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const bot_id = String(formData.get("bot_id") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const scheduledAtRaw = String(formData.get("scheduled_at") || "").trim() || null;
  const scheduledAtOffset = String(formData.get("scheduledAtOffset") || "0").trim();
  const scheduled_at = scheduledAtRaw ? localDateTimeToUtc(scheduledAtRaw, Number(scheduledAtOffset) || 0) : null;
  const media_url = String(formData.get("media_url") || "").trim() || null;
  if (!bot_id || !body) return { ok: false, error: "Bot and message body are required." };

  const result = await botApiPost<{ ok: boolean; id: string }>("/broadcasts", { bot_id, body, scheduled_at, media_url });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/broadcasts");
  return { ok: true, id: result.data.id };
}

export async function deleteBroadcast(_prev: unknown, formData: FormData): Promise<TelegramResult> {
  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Broadcast ID is required." };

  const result = await botApiDelete<{ ok: boolean }>(`/broadcasts/${id}`);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/telegram/broadcasts");
  return { ok: true };
}
