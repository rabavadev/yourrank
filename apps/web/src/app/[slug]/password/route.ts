import { setDatabaseUrl } from "@/lib/db";
import { getSiteBySlug } from "@/lib/site";
import {
  verifyBoardPassword,
  issueBoardPasswordToken,
  boardPasswordSetCookieHeader,
} from "@/lib/board-password";
import { renderPasswordGate } from "@/lib/password-gate";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function nonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

export async function GET(request: Request, { params }: RouteParams) {
  await setDatabaseUrl();
  const { slug } = await params;
  const site = await getSiteBySlug(slug);
  if (!site || !site.published || !site.password_hash) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(
    renderPasswordGate(site, { nonce: nonce(), isCustomDomain: false }),
    {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    },
  );
}

export async function POST(request: Request, { params }: RouteParams) {
  await setDatabaseUrl();
  const { slug } = await params;
  const site = await getSiteBySlug(slug);
  if (!site || !site.published || !site.password_hash) {
    return new Response("Not found", { status: 404 });
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  const ok = await verifyBoardPassword(password, site);
  if (!ok) {
    return new Response(
      renderPasswordGate(site, { nonce: nonce(), isCustomDomain: false }, "Incorrect password."),
      {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      },
    );
  }

  const token = await issueBoardPasswordToken(site);
  const cookie = boardPasswordSetCookieHeader(site, token, { isCustomDomain: false });
  return new Response(null, {
    status: 302,
    headers: {
      location: `/${slug}`,
      "set-cookie": cookie,
      "cache-control": "no-store",
    },
  });
}
