import { setDatabaseUrl } from "@/lib/db";
import { getPublicSite } from "@/lib/site";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  await setDatabaseUrl();
  const { slug } = await params;

  const r = await getPublicSite(slug, request);
  if (!r) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  if (r.requiresPassword) {
    return new Response(JSON.stringify({ error: "Password required." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (r.suspended) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify(r.data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=30",
    },
  });
}
