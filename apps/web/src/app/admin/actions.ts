"use server";

import { apiGet, apiPost } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface Admin2FAResult {
  ok: boolean;
  error?: string;
  uri?: string;
  secret?: string;
  recoveryCodes?: string[];
}

export async function admin2faEnable(_prev?: unknown, _formData?: FormData): Promise<Admin2FAResult> {
  const result = await apiPost<{ ok: boolean; uri?: string; secret?: string; pending?: boolean }>("/api/admin/2fa/enable", {});
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, uri: result.data.uri, secret: result.data.secret };
}

export async function admin2faVerify(_prev: unknown, formData: FormData): Promise<Admin2FAResult> {
  const code = String(formData.get("code") || "").trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "Enter the 6-digit code from your authenticator app." };

  const result = await apiPost<{ ok: boolean; verified?: boolean; recoveryCodes?: string[] }>("/api/admin/2fa/verify", { code });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin");
  return { ok: true, recoveryCodes: result.data.recoveryCodes };
}

export async function admin2faDisable(_prev: unknown, formData: FormData): Promise<Admin2FAResult> {
  const code = String(formData.get("code") || "").trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "6-digit code required to disable 2FA." };

  const result = await apiPost<{ ok: boolean; disabled?: boolean }>("/api/admin/2fa/disable", { code });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin");
  return { ok: true };
}

export interface AdminUserActionResult {
  ok: boolean;
  error?: string;
}

export async function adminUserAction(_prev: unknown, formData: FormData): Promise<AdminUserActionResult> {
  const userId = String(formData.get("userId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const days = Number(formData.get("days") || 0) || undefined;
  const reason = String(formData.get("reason") || "").trim() || undefined;

  if (!userId || !action) return { ok: false, error: "userId and action are required." };

  const body: Record<string, unknown> = { userId, action };
  if (days) body.days = days;
  if (reason) body.reason = reason;

  const result = await apiPost<{ ok: boolean }>("/api/admin/action", body);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/users");
  return { ok: true };
}
