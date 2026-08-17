"use server";

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface CreditsResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function q(siteId: string) {
  return `?siteId=${encodeURIComponent(siteId)}`;
}

export async function connectCreditsChannel(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const externalId = String(formData.get("externalId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!siteId || !externalId) return { ok: false, error: "Site and channel ID are required." };

  const result = await apiPost<{ ok: boolean; channel: { externalId: string; name: string | null } }>(
    `/api/credits/connect${q(siteId)}`,
    { externalId, name }
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/channel");
  return { ok: true };
}

export async function toggleCreditsViewerAuth(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  if (!siteId) return { ok: false, error: "Site is required." };

  const kick = formData.get("kick") === "on";
  const discord = formData.get("discord") === "on";
  const publicRedeem = formData.get("public") === "on";

  const result = await apiPost(`/api/credits/viewer-auth${q(siteId)}`, { kick, discord, public: publicRedeem });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/channel");
  return { ok: true };
}

export interface SaveRewardResult extends CreditsResult {}

export async function saveCreditsReward(_prev: unknown, formData: FormData): Promise<SaveRewardResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const id = String(formData.get("id") || "").trim() || null;
  const kickRewardId = String(formData.get("kickRewardId") || "").trim();
  const kickRewardTitle = String(formData.get("kickRewardTitle") || "").trim();
  const kickRewardCost = Number(formData.get("kickRewardCost") || "0");
  const credits = Number(formData.get("credits") || "0");

  if (!siteId || !kickRewardId || !kickRewardTitle) {
    return { ok: false, error: "Site, reward ID and title are required." };
  }
  if (!Number.isFinite(kickRewardCost) || kickRewardCost < 0) {
    return { ok: false, error: "Reward cost must be a non-negative number." };
  }
  if (!Number.isFinite(credits) || credits <= 0) {
    return { ok: false, error: "Credits must be a positive number." };
  }

  const result = await apiPost<{ ok: boolean; id: string }>(`/api/credits/rewards${q(siteId)}`, {
    id: id || undefined,
    kickRewardId,
    kickRewardTitle,
    kickRewardCost,
    credits,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/rules");
  return { ok: true, id: result.data.id };
}

export async function createCreditsReward(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const cost = Number(formData.get("cost") || "0");
  const credits = Number(formData.get("credits") || "0");
  const description = String(formData.get("description") || "").trim();
  const backgroundColor = String(formData.get("backgroundColor") || "#00e701").trim();

  if (!siteId || !title) return { ok: false, error: "Site and title are required." };
  if (!Number.isFinite(cost) || cost < 1) return { ok: false, error: "Cost must be a positive number." };
  if (!Number.isFinite(credits) || credits <= 0) return { ok: false, error: "Credits must be a positive number." };

  const result = await apiPost<{ ok: boolean; id: string }>(`/api/credits/rewards/create${q(siteId)}`, {
    title,
    cost,
    credits,
    description,
    backgroundColor,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/rules");
  return { ok: true, id: result.data.id };
}

export async function deleteCreditsReward(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const id = String(formData.get("id") || "").trim();
  if (!siteId || !id) return { ok: false, error: "Site and reward are required." };

  const result = await apiDelete<{ ok: boolean }>(`/api/credits/rewards/${id}${q(siteId)}`);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/rules");
  return { ok: true };
}

export async function saveShopItem(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const id = String(formData.get("id") || "").trim() || null;
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const cost = Number(formData.get("cost") || "0");
  const stockRaw = String(formData.get("stock") || "").trim();
  const stock = stockRaw === "" ? null : Number(stockRaw);
  const active = formData.get("active") !== "false";

  if (!siteId || !name) return { ok: false, error: "Site and item name are required." };
  if (!Number.isFinite(cost) || cost <= 0) return { ok: false, error: "Cost must be a positive number." };
  if (stock !== null && (!Number.isFinite(stock) || stock < 0)) return { ok: false, error: "Stock must be a non-negative number." };

  const result = await apiPost<{ ok: boolean; id: string }>(`/api/credits/shop${q(siteId)}`, {
    id: id || undefined,
    name,
    description,
    cost,
    stock,
    active,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/shop");
  return { ok: true, id: result.data.id };
}

export async function deleteShopItem(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const id = String(formData.get("id") || "").trim();
  if (!siteId || !id) return { ok: false, error: "Site and item are required." };

  const result = await apiDelete<{ ok: boolean }>(`/api/credits/shop/${id}${q(siteId)}`);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/shop");
  return { ok: true };
}

export async function updateRedemption(_prev: unknown, formData: FormData): Promise<CreditsResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  if (!siteId || !id || !status) return { ok: false, error: "Site, redemption and status are required." };

  const result = await apiPost<{ ok: boolean; id: string }>(`/api/credits/redemptions/${id}${q(siteId)}`, { status });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/dashboard/rewards/redemptions");
  return { ok: true, id: result.data.id };
}
