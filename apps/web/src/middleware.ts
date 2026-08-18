import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const marketingRequest = request.headers.get("x-yr-marketing") === "1";
  if (!marketingRequest && (host === "app.yourrank.site" || host === "next.yourrank.site")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "yourrank.site";
    return NextResponse.redirect(url, { status: 301 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
