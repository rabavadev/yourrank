"use server";

import { apiGet, apiPost, apiPut } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface CreateBoardResult {
  ok: boolean;
  error?: string;
  slug?: string;
  id?: string;
}

export async function createBoard(_prev: unknown, formData: FormData): Promise<CreateBoardResult> {
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const casino = String(formData.get("casino") || "").trim();
  const code = String(formData.get("code") || "").trim();

  if (!name || !slug) {
    return { ok: false, error: "Name and URL slug are required." };
  }

  const result = await apiPost<{ ok: boolean; id: string; slug: string }>("/api/site/create", {
    name,
    slug,
    casino,
    code,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/boards");
  return { ok: true, id: result.data.id, slug: result.data.slug };
}

export interface SetActiveResult {
  ok: boolean;
  error?: string;
}

export async function setActiveBoard(_prev: SetActiveResult | null, formData: FormData): Promise<SetActiveResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  if (!siteId) {
    return { ok: false, error: "Site ID is required." };
  }
  const result = await apiPost("/api/site/active", { siteId });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/boards");
  return { ok: true };
}

export interface SaveBrandResult {
  ok: boolean;
  error?: string;
  updatedAt?: string;
}

export async function saveBrand(_prev: unknown, formData: FormData): Promise<SaveBrandResult> {
  const siteId = String(formData.get("siteId") || "");
  const name = String(formData.get("name") || "").trim();
  const casino = String(formData.get("casino") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const ctaUrl = String(formData.get("ctaUrl") || "").trim();
  const prizePool = String(formData.get("prizePool") || "").trim();
  const period = String(formData.get("period") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const blurb = String(formData.get("blurb") || "").trim();

  const result = await apiPut<{ ok: boolean; updatedAt: string; slug: string; siteId: string }>("/api/site", {
    siteId: siteId || undefined,
    name,
    brand: { name, casino, code, ctaUrl, prizePool, period, tagline },
    partner: { blurb },
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/editor/design");
  revalidatePath("/dashboard/editor/setup");
  revalidatePath("/dashboard");
  return { ok: true, updatedAt: result.data.updatedAt };
}

export interface SaveSiteResult {
  ok: boolean;
  error?: string;
  updatedAt?: string;
}

function parseSocials(formData: FormData): Array<{ name: string; handle: string; action: string; url: string; brand: string; enabled: boolean }> {
  const brands = ["Discord", "Kick", "Twitch", "YouTube", "X"];
  return brands.map((brand) => {
    const name = String(formData.get(`socials.${brand}.name`) || brand);
    const handle = String(formData.get(`socials.${brand}.handle`) || "");
    const action = String(formData.get(`socials.${brand}.action`) || "");
    const url = String(formData.get(`socials.${brand}.url`) || "");
    const enabled = formData.get(`socials.${brand}.enabled`) === "on";
    return { name, handle, action, url, brand: brand.toLowerCase(), enabled };
  });
}

export async function saveSite(_prev: unknown, formData: FormData): Promise<SaveSiteResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  if (!siteId) {
    return { ok: false, error: "Site ID is required." };
  }

  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const casino = String(formData.get("casino") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const ctaUrl = String(formData.get("ctaUrl") || "").trim();
  const prizePool = String(formData.get("prizePool") || "").trim();
  const period = String(formData.get("period") || "").trim();
  const resetNote = String(formData.get("resetNote") || "").trim();
  const blurb = String(formData.get("blurb") || "").trim();

  const endsAt = String(formData.get("endsAt") || "").trim() || undefined;
  const autoResetEnabled = formData.get("autoReset.enabled") === "on";
  const autoResetClear = String(formData.get("autoReset.clear") || "wagers").trim() as "wagers" | "players" | "none";

  const passwordProtected = formData.get("passwordProtected") === "on";
  const passwordRaw = formData.get("password");
  const password = passwordRaw ? String(passwordRaw).trim() : undefined;

  const socials = parseSocials(formData);

  const body: Record<string, unknown> = {
    siteId,
    name,
    brand: { name, tagline, casino, code, ctaUrl, prizePool, period, resetNote },
    partner: { blurb },
    endsAt,
    autoReset: { enabled: autoResetEnabled, clear: autoResetClear },
    passwordProtected,
    socials,
  };

  if (passwordProtected && password && password.length > 0) {
    body.password = password;
  } else if (!passwordProtected) {
    body.password = null;
  }

  const result = await apiPut<{ ok: boolean; updatedAt: string; slug: string; siteId: string }>("/api/site", body);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/editor/setup");
  revalidatePath("/dashboard/editor/share");
  revalidatePath("/dashboard");
  return { ok: true, updatedAt: result.data.updatedAt };
}

export interface CreateArchiveResult {
  ok: boolean;
  error?: string;
  label?: string;
}

export async function createArchive(_prev: unknown, formData: FormData): Promise<CreateArchiveResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const label = String(formData.get("label") || "").trim();

  if (!siteId) {
    return { ok: false, error: "Site ID is required." };
  }

  const result = await apiPost<{ ok: boolean; label: string }>("/api/site/archive", { siteId, label });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/editor/history");
  revalidatePath("/dashboard");
  return { ok: true, label: result.data.label };
}

export interface DeleteArchiveResult {
  ok: boolean;
  error?: string;
}

export async function deleteArchive(_prev: unknown, formData: FormData): Promise<DeleteArchiveResult> {
  const siteId = String(formData.get("siteId") || "").trim();
  const label = String(formData.get("label") || "").trim();

  if (!siteId || !label) {
    return { ok: false, error: "Site and archive label are required." };
  }

  const result = await apiPost<{ ok: boolean }>("/api/site/archive/delete", { siteId, label });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/editor/history");
  revalidatePath("/dashboard");
  return { ok: true };
}

export interface GiveawayLookupResult {
  ok: boolean;
  error?: string;
  channel?: string;
  chatroomId?: number;
  user?: string | null;
  avatar?: string | null;
  isLive?: boolean;
  viewers?: number;
}

export async function lookupGiveawayChatroom(_prev: unknown, formData: FormData): Promise<GiveawayLookupResult> {
  const channel = String(formData.get("channel") || "").trim().replace(/^@/, "");
  if (!channel) {
    return { ok: false, error: "Channel is required." };
  }

  const result = await apiGet<{ ok: boolean; channel: string; chatroomId: number; user: string | null; avatar: string | null; isLive: boolean; viewers: number }>(
    `/api/giveaways/chatroom?channel=${encodeURIComponent(channel)}`
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return result.data;
}

export interface SaveGameSettingsResult {
  ok: boolean;
  error?: string;
}

export async function saveGameSettings(_prev: unknown, formData: FormData): Promise<SaveGameSettingsResult> {
  const siteId = String(formData.get("siteId") || "");
  const game = String(formData.get("game") || "");
  const enabled = formData.get("enabled") === "on";
  const minBet = Number(formData.get("minBet") || "1");
  const maxBet = Number(formData.get("maxBet") || "1");
  const houseEdgeBps = Number(formData.get("houseEdgeBps") || "100");
  const dailyLossCapRaw = String(formData.get("dailyLossCap") || "").trim();
  const dailyLossCap = dailyLossCapRaw ? Number(dailyLossCapRaw) : null;

  if (!siteId || !game) {
    return { ok: false, error: "Site and game are required." };
  }

  const result = await apiPost("/api/site/games/settings", {
    siteId,
    game,
    enabled,
    minBet,
    maxBet,
    houseEdgeBps,
    dailyLossCap,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/dashboard/games");
  return { ok: true };
}
