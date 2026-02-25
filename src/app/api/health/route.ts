import { NextResponse } from "next/server";
import { features } from "@/lib/features";

/**
 * GET /api/health
 *
 * Returns the current health status of the application and
 * which optional integrations are enabled. Useful for monitoring
 * and deployment verification.
 */
export async function GET() {
  const status: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    features: {
      database: features.database,
      storage: features.storage,
      smtp: features.smtp,
    },
    integrations: {},
  };

  // Test enabled integrations
  if (features.database) {
    try {
      const { testConnection } = await import("@/lib/db");
      (status.integrations as Record<string, unknown>).database = await testConnection()
        ? "connected"
        : "error";
    } catch {
      (status.integrations as Record<string, unknown>).database = "error";
    }
  }

  if (features.storage) {
    try {
      const { testConnection } = await import("@/lib/storage");
      (status.integrations as Record<string, unknown>).storage = await testConnection()
        ? "connected"
        : "error";
    } catch {
      (status.integrations as Record<string, unknown>).storage = "error";
    }
  }

  if (features.smtp) {
    try {
      const { testConnection } = await import("@/lib/mail");
      (status.integrations as Record<string, unknown>).smtp = await testConnection()
        ? "connected"
        : "error";
    } catch {
      (status.integrations as Record<string, unknown>).smtp = "error";
    }
  }

  return NextResponse.json(status);
}
