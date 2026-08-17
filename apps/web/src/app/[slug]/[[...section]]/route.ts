import { renderSite } from "@/lib/site-render";
import { getPublicSite } from "@/lib/site";
import { setDatabaseUrl } from "@/lib/db";
import { renderPasswordGate } from "@/lib/password-gate";

interface RouteParams {
  params: Promise<{ slug: string; section?: string[] }>;
}

function nonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

async function renderBoard(
  request: Request,
  slug: string,
  section: string,
): Promise<Response> {
  await setDatabaseUrl();
  const n = nonce();

  const r = await getPublicSite(slug, request, { limit: 100, offset: 0 });
  if (!r) {
    return new Response("Not found", { status: 404 });
  }
  if (r.requiresPassword) {
    return new Response(
      renderPasswordGate(r, { nonce: n, isCustomDomain: false }),
      {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      },
    );
  }
  if (r.suspended) {
    return new Response("Not found", { status: 404 });
  }

  const siteSections = r.data?.siteSections as Record<string, boolean> | undefined;
  if (siteSections && siteSections[section] !== true) {
    return new Response("Not found", { status: 404 });
  }

  const homeUrl = new URL(request.url).origin;
  const html = await renderSite({
    r,
    section,
    viewer: undefined,
    viewerData: undefined,
    opts: {
      nonce: n,
      homeUrl,
      slug,
      isCustomDomain: false,
      logoUrl: null,
      csrfToken: null,
      isDemo: slug === "demo",
    },
  });

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug, section } = await params;
  const s = (section && section[0]) || "home";
  return renderBoard(request, slug, s);
}

export async function HEAD(request: Request, { params }: RouteParams) {
  const { slug, section } = await params;
  const s = (section && section[0]) || "home";
  const response = await renderBoard(request, slug, s);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
