import { cookies, headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const API_FALLBACK_BASE = process.env.API_BASE_URL || "https://yourrank.site";

export interface ApiError {
  ok: false;
  error: string;
}

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const host = (await headers()).get("host") || "next.yourrank.site";

  const url = new URL(path, `https://${host}`);
  const reqHeaders = new Headers(init?.headers);
  if (cookieHeader) {
    reqHeaders.set("cookie", cookieHeader);
  }
  reqHeaders.set("x-forwarded-host", host);

  const request = new Request(url.toString(), { ...init, headers: reqHeaders });
  const api = (env as Record<string, unknown>).API as { fetch: typeof fetch } | undefined;

  if (api) {
    return api.fetch(request);
  }

  const fallbackUrl = new URL(path, API_FALLBACK_BASE);
  return fetch(fallbackUrl.toString(), { ...init, headers: reqHeaders });
}

export async function apiGet<T = unknown>(path: string): Promise<ApiResult<T>> {
  const res = await apiRequest(path, { method: "GET" });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await apiRequest(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function apiPut<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await apiRequest(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}
