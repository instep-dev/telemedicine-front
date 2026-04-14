import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // STAGING ONLY: temporarily disable the auth guard because the refresh_token
  // cookie is set on the Railway domain and isn't readable on the Vercel domain.
  //
  // TODO(PROD): Uncomment the block below once frontend & backend share the same
  // root domain (e.g., app.example.com + api.example.com).
  /*
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    const loginUrl = new URL("/auth/login", request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/patient/:path*",
    "/history/:path*",
    "/ai-summary/:path*",
    "/summary-results/:path*",
    "/consultations/:path*",
  ],
};
