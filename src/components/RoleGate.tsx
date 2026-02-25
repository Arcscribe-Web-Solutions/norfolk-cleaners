"use client";

/**
 * RoleGate - Permission-aware wrapper
 * ────────────────────────────────────
 * Conditionally renders children based on the current user's permissions.
 * Use this to hide/show UI sections across the dashboard.
 */

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { RolePermissions } from "@/lib/roles";

interface RoleGateProps {
  /** The permission the user must have. */
  permission: keyof RolePermissions;
  /** Content shown when the user has the permission. */
  children: ReactNode;
  /** Optional fallback when the user lacks the permission. */
  fallback?: ReactNode;
}

export default function RoleGate({ permission, children, fallback = null }: RoleGateProps) {
  const { can } = useAuth();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
