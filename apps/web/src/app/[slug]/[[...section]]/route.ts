import { renderSite } from "@yourrank/shared/site-render";
import { getPublicSite } from "@/lib/site";
import { setDatabaseUrl } from "@/lib/db";
import { renderPasswordGate } from "@/lib/password-gate";
import { proxyToWorker } from "@/lib/proxy";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createQueueProducer } from "@yourrank/shared/queue-producer";
import { bumpStat } from "@yourrank/shared/stats";
import { hashToken } from "@yourrank/shared/crypto";
import { decideBoardView } from "@yourrank/shared/board-views";
import {
  verifyBoardPassword,
  issueBoardPasswordToken,
  boardPasswordSetCookieHeader,
} from "@/lib/board-password";

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
  const { env, ctx } = await getCloudflareContext({ async: true });
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
  const responseHeaders = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  if (section === "home" || section === "leaderboard") {
    const decision = await decideBoardView({
      request,
      siteId: r.id,
      slug,
      hashToken,
    });
    for (const cookie of decision.setCookies) responseHeaders.append("set-cookie", cookie);
    if (decision.shouldBump) {
      const producer = createQueueProducer(
        (env as Record<string, unknown>).EVENTS_QUEUE as Parameters<typeof createQueueProducer>[0],
        async (event) => {
          if (event.type === "bump") {
            await bumpStat(event.siteId, event.field, event.referer, event.visitorHash);
          }
        },
        env,
      );
      ctx.waitUntil(producer.send({
        type: "bump",
        siteId: r.id,
        field: "views",
        referer: decision.referer,
        visitorHash: decision.visitorHash,
        timestamp: Date.now(),
      }));
    }
  }
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
    headers: responseHeaders,
  });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug, section } = await params;
  const s = (section && section[0]) || "home";
  if (s === "overlay") {
    return proxyToWorker(request, `/${slug}/overlay`);
  }
  return renderBoard(request, slug, s);
}

export async function HEAD(request: Request, { params }: RouteParams) {
  const { slug, section } = await params;
  const s = (section && section[0]) || "home";
  if (s === "overlay") {
    return proxyToWorker(request, `/${slug}/overlay`);
  }
  const response = await renderBoard(request, slug, s);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { slug, section } = await params;
  const s = (section && section[0]) || "home";
  if (s === "overlay") {
    return proxyToWorker(request, `/${slug}/overlay`);
  }

  await setDatabaseUrl();
  const r = await getPublicSite(slug, request, { limit: 100, offset: 0 });
  if (!r || r.requiresPassword === false) {
    return new Response("Not found", { status: 404 });
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  const ok = await verifyBoardPassword(password, {
    password_hash: r.passwordHash,
    password_salt: r.passwordSalt,
  });
  if (!ok) {
    return new Response(
      renderPasswordGate(r, { nonce: nonce(), isCustomDomain: false }, "Incorrect password."),
      {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      },
    );
  }

  const token = await issueBoardPasswordToken({ password_hash: r.passwordHash, slug });
  const cookie = boardPasswordSetCookieHeader({ password_hash: r.passwordHash, slug }, token, { isCustomDomain: false });
  return new Response(null, {
    status: 302,
    headers: {
      location: `/${slug}`,
      "set-cookie": cookie,
      "cache-control": "no-store",
    },
  });
}
