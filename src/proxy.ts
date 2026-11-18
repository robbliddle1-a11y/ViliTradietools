import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/core/auth/session";

/**
 * Optimistic check only: no session cookie → straight to /login without rendering.
 * The real check (signature, expiry, user exists) happens in requireUser() on the server.
 */
export function proxy(req: NextRequest) {
  if (!req.cookies.get(SESSION_COOKIE)) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/onboarding/:path*", "/settings/:path*", "/billing/:path*", "/variations/:path*"],
};
