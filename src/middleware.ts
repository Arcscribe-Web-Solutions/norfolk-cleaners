/**
 * Middleware - Norfolk Cleaners
 * ─────────────────────────────
 * Protects all routes under the (app) group (/dashboard, /jobs, /customers, /settings).
 * Redirects unauthenticated users to the login page.
 * Redirects authenticated users away from the login page to /dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";

/** Routes that require authentication. */
const PROTECTED_PATHS = ["/dashboard", "/jobs", "/customers", "/settings", "/schedule"];

/** Routes that authenticated users should not see (redirect to dashboard). */
const AUTH_PATHS = ["/", "/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const session = token ? await verifyToken(token) : null;
  const isAuthenticated = !!session;

  // ── Protected routes: redirect to login if no session ───
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth routes: redirect to dashboard if already logged in ─
  const isAuthRoute = AUTH_PATHS.some((p) => pathname === p);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/forgot-password",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/customers/:path*",
    "/settings/:path*",
    "/schedule/:path*",
  ],
};
