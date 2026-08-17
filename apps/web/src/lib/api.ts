import { cookies, headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  generateCsrfToken,
  readCsrfToken,
  csrfCookieDomain,
  shouldRequireCsrf,
} from "./csrf";

const API_FALLBACK_BASE = process.env.API_BASE_URL || "https://yourrank.site";
const BOT_API_FALLBACK_BASE = process.env.BOT_API_BASE_URL || "https://yourrank.site";

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
  const host = (await headers()).get("host") || "app.yourrank.site";

  const url = new URL(path, `https://${host}`);
  const method = (init?.method || "GET").toUpperCase();
  const reqHeaders = new Headers(init?.headers);

  if (shouldRequireCsrf(method, url.pathname)) {
    let token = cookieStore.get("__csrf")?.value;
    if (!token) {
      token = generateCsrfToken();
      cookieStore.set("__csrf", token, {
        domain: csrfCookieDomain(),
        path: "/",
        secure: true,
        sameSite: "lax",
        maxAge: 86400,
      });
    }
    reqHeaders.set("x-csrf-token", token);
  }

  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    reqHeaders.set("cookie", cookieHeader);
  }
  reqHeaders.set("x-forwarded-host", host);

  const request = new Request(url.toString(), { ...init, headers: reqHeaders });
  const api = (env as Record<string, unknown>).API as { fetch: typeof fetch } | undefined;

  if (api) {
    try {
      return await api.fetch(request);
    } catch (err) {
      console.warn("[api] service binding failed, falling back:", err);
    }
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

export async function apiPost<T = unknown>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<ApiResult<T>> {
  const headers = new Headers({ "content-type": "application/json" });
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v);
  }
  const res = await apiRequest(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function apiPut<T = unknown>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<ApiResult<T>> {
  const headers = new Headers({ "content-type": "application/json" });
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v);
  }
  const res = await apiRequest(path, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function apiDelete<T = unknown>(path: string, extraHeaders?: Record<string, string>): Promise<ApiResult<T>> {
  const headers = new Headers();
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) headers.set(k, v);
  }
  const res = await apiRequest(path, { method: "DELETE", headers });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

function botPath(path: string): string {
  if (path.startsWith("/bot/api")) return path;
  return `/bot/api${path}`;
}

export async function botApiRequest(path: string, init?: RequestInit): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const host = (await headers()).get("host") || "app.yourrank.site";

  const fullPath = botPath(path);
  const url = new URL(fullPath, BOT_API_FALLBACK_BASE);
  const reqHeaders = new Headers(init?.headers);
  if (cookieHeader) {
    reqHeaders.set("cookie", cookieHeader);
  }
  reqHeaders.set("x-forwarded-host", host);

  const method = (init?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    reqHeaders.set("origin", BOT_API_FALLBACK_BASE);
  }

  const request = new Request(url.toString(), { ...init, headers: reqHeaders });
  const api = (env as Record<string, unknown>).BOT_API as { fetch: typeof fetch } | undefined;

  if (api) {
    try {
      return await api.fetch(request);
    } catch (err) {
      console.warn("[botApi] service binding failed, falling back:", err);
    }
  }

  return fetch(url.toString(), { ...init, headers: reqHeaders });
}

export async function botApiGet<T = unknown>(path: string): Promise<ApiResult<T>> {
  const res = await botApiRequest(path, { method: "GET" });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function botApiPost<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await botApiRequest(path, {
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

export async function botApiPatch<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await botApiRequest(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}

export async function botApiDelete<T = unknown>(path: string): Promise<ApiResult<T>> {
  const res = await botApiRequest(path, { method: "DELETE" });
  const data = (await res.json()) as { ok?: boolean } & Record<string, unknown>;
  if (!res.ok || data.ok === false) {
    return { ok: false, error: (data.error as string) || `Request failed with ${res.status}` };
  }
  return { ok: true, data: data as unknown as T };
}
