const READ_API = /^\/api\/(?:docs|openapi\.json|public\/[^/]+(?:\/(?:standings|players|rank|stats))?)$/;
const WRITE_API = /^\/api\/scores$/;

function policy(path) {
  if (READ_API.test(path)) {
    return {
      methods: "GET, HEAD, OPTIONS",
      requestHeaders: "If-None-Match",
    };
  }
  if (WRITE_API.test(path)) {
    return {
      methods: "POST, OPTIONS",
      requestHeaders: "Content-Type, X-Postback-Key, X-Postback-Signature, X-Postback-Site",
    };
  }
  return null;
}

function corsHeaders(path) {
  const routePolicy = policy(path);
  if (!routePolicy) return null;
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": routePolicy.methods,
    "access-control-allow-headers": routePolicy.requestHeaders,
    "access-control-expose-headers": "ETag, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After",
  };
}

export function handlePublicApiPreflight(path) {
  const headers = corsHeaders(path);
  if (!headers) return null;
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      "access-control-max-age": "86400",
    },
  });
}

export function withPublicApiCors(response, path) {
  const cors = corsHeaders(path);
  if (!cors) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(cors)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
