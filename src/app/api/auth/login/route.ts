/**
 * POST /api/auth/login
 * ─────────────────────
 * Authenticates a user by email + password, returns a JWT session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { signToken, buildSessionCookie, type SessionPayload } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    // ── Validate input ──────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // ── Look up user ────────────────────────────────────────
    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // ── Check account status ────────────────────────────────
    if (user.status === "suspended" || user.status === "terminated") {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact an administrator." },
        { status: 403 },
      );
    }

    // ── Verify password ─────────────────────────────────────
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // ── Build JWT ───────────────────────────────────────────
    const payload: Omit<SessionPayload, "iat" | "exp"> = {
      sub: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      avatarUrl: user.avatar_url,
    };

    const token = await signToken(payload);

    // ── Set cookie & respond ────────────────────────────────
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
      },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(token));

    return response;
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 },
    );
  }
}
