"use client";

/**
 * Auth Context - Norfolk Cleaners
 * ────────────────────────────────
 * Provides the current authenticated user throughout the app.
 * Fetches the session from /api/auth/session on mount and exposes
 * `user`, `can()`, `logout()`, and loading state.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/roles";
import { ROLE_DEFINITIONS, hasPermission, type RolePermissions } from "@/lib/roles";

// ── Auth user (slim shape for the client) ───────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

// ── Context shape ───────────────────────────────────────────

interface AuthContextValue {
  /** The authenticated user, or null while loading / if not logged in. */
  user: AuthUser | null;
  /** True while the initial session check is in flight. */
  loading: boolean;
  /** Shorthand: check one permission against the current role. */
  can: (permission: keyof RolePermissions) => boolean;
  /** The full role definition for the current role (null if not logged in). */
  roleDef: (typeof ROLE_DEFINITIONS)[UserRole] | null;
  /** Log out - clears cookie and redirects to login. */
  logout: () => Promise<void>;
  /** Force a session re-fetch (e.g. after role change in dev). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch session from the API. */
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const can = useCallback(
    (permission: keyof RolePermissions) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user],
  );

  const roleDef = user ? ROLE_DEFINITIONS[user.role] : null;

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Cookie may already be gone
    }
    setUser(null);
    router.push("/");
  }, [router]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSession();
  }, [fetchSession]);

  return (
    <AuthContext.Provider value={{ user, loading, can, roleDef, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
