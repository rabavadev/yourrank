import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host === "next.yourrank.site") {
    const url = request.nextUrl.clone();
    url.host = "app.yourrank.site";
    return NextResponse.redirect(url, { status: 301 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
