const MARKETING_HOST = "app.yourrank.site";
const MARKETING_MARKER = "x-yr-marketing";

export async function proxyMarketingHome({ request, binding, fallback, workerLog }) {
  if (!binding) {
    workerLog?.warn("marketing_proxy_unavailable", {});
    return fallback();
  }

  try {
    const url = new URL(request.url);
    url.host = MARKETING_HOST;
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set(MARKETING_MARKER, "1");
    const upstream = new Request(url, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });
    const response = await binding.fetch(upstream);
    if (response.status >= 500) {
      workerLog?.warn("marketing_proxy_degraded", { status: response.status });
      return fallback();
    }
    return response;
  } catch (error) {
    workerLog?.error("marketing_proxy_failed", { error: String(error?.message || error) });
    return fallback();
  }
}
