import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import fs from "fs";
import path from "path";

/**
 * GET  /api/migrate              - runs pending migrations
 * POST /api/migrate?force=true   - wipes tracking & re-runs all migrations
 *
 * Protected: only works when ENABLE_DATABASE=true.
 *
 * WARNING: This is a dev-convenience endpoint.
 * In production, run migrations through a CI pipeline or CLI instead.
 */

async function runMigrations(req: NextRequest, force: boolean) {
  try {
    // Optional shared secret check
    const authHeader = req.headers.get("x-migration-key");
    const migrationKey = process.env.MIGRATION_KEY;
    if (migrationKey && authHeader !== migrationKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!features.database) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database feature is disabled. Set ENABLE_DATABASE=true in .env.local",
        },
        { status: 400 }
      );
    }

    const { query } = await import("@/lib/db");

    // ── Ensure migrations tracking table exists ─────────
    await query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    if (force) {
      await query("DELETE FROM _migrations");
    }

    // ── Read migration files ────────────────────────────
    const migrationsDir = path.join(process.cwd(), "src", "db", "migrations");

    if (!fs.existsSync(migrationsDir)) {
      return NextResponse.json(
        { success: false, error: "No migrations directory found." },
        { status: 404 }
      );
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort(); // alphabetical = execution order

    // ── Check which have already been applied ───────────
    const applied = await query<{ name: string }>(
      "SELECT name FROM _migrations"
    );
    const appliedSet = new Set(applied.map((r) => r.name));

    const pending = files.filter((f) => !appliedSet.has(f));

    if (pending.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All migrations already applied.",
        applied: files.length,
        pending: 0,
      });
    }

    // ── Run pending migrations ──────────────────────────
    const results: string[] = [];

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await query(sql);
      await query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      results.push(file);
    }

    return NextResponse.json({
      success: true,
      message: `Applied ${results.length} migration(s).`,
      migrations: results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown migration error",
      },
      { status: 500 }
    );
  }
}

/** GET /api/migrate - run pending migrations */
export async function GET(req: NextRequest) {
  return runMigrations(req, false);
}

/** POST /api/migrate?force=true - wipe tracking & re-run all */
export async function POST(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "true";
  return runMigrations(req, force);
}
