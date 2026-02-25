/**
 * POST /api/auth/logout
 * ──────────────────────
 * Clears the session cookie.
 */

import { NextResponse } from "next/server";
import { buildLogoutCookie } from "@/lib/jwt";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", buildLogoutCookie());
  return response;
}
