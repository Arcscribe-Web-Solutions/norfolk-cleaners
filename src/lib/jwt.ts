/**
 * JWT Utilities - Norfolk Cleaners
 * ─────────────────────────────────
 * Uses `jose` for edge-compatible JWT signing and verification.
 * Tokens are stored in an httpOnly cookie called `nc_session`.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@/lib/roles";

// ── Config ──────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? "norfolk-cleaners-dev-secret-change-me";
const secret = new TextEncoder().encode(JWT_SECRET);

/** Cookie name used for the session token. */
export const SESSION_COOKIE = "nc_session";

/** Token lifetime - 24 hours. */
export const TOKEN_MAX_AGE = 60 * 60 * 24; // seconds

// ── Payload shape ──────────────────────────────────────────

export interface SessionPayload extends JWTPayload {
  sub: string;          // user ID (UUID)
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl: string | null;
}

// ── Sign ────────────────────────────────────────────────────

export async function signToken(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(secret);
}

// ── Verify ──────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ──────────────────────────────────────────

/** Build a Set-Cookie header value for the session token. */
export function buildSessionCookie(token: string): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    `Max-Age=${TOKEN_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  // Only add Secure flag in production
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/** Build a Set-Cookie header that expires (clears) the session. */
export function buildLogoutCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}
