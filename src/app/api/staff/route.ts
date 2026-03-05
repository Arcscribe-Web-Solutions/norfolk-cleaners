import { NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";

/**
 * GET /api/staff
 *
 * Returns active users (staff) for assignment dropdowns.
 */
export async function GET() {
  try {
    if (!features.database) {
      return NextResponse.json(
        { success: false, error: "Database feature is disabled", data: [] },
        { status: 400 },
      );
    }

    const rows = await query<{
      id: string;
      name: string;
      role: string;
    }>(`
      SELECT
        id,
        TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) AS name,
        role::text
      FROM users
      WHERE status = 'active'
      ORDER BY first_name ASC, last_name ASC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Staff API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 },
    );
  }
}
