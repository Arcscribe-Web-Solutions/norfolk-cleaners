import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";

/**
 * GET /api/customers
 *
 * Returns customer list with job counts and last-visit info.
 */
export async function GET(req: NextRequest) {
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
      phone: string;
      email: string;
      address: string;
      job_count: string;
      last_visit: string | null;
      status: string;
    }>(`
      SELECT
        c.id,
        COALESCE(
          NULLIF(TRIM(COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')), ''),
          c.company_name,
          'Unknown'
        ) AS name,
        COALESCE(c.phone, '') AS phone,
        COALESCE(c.email, '') AS email,
        COALESCE(
          (SELECT cl.address_line_1 || COALESCE(', ' || cl.city, '') || COALESCE(' ' || cl.postcode, '')
           FROM client_locations cl WHERE cl.client_id = c.id LIMIT 1),
          c.billing_address,
          ''
        ) AS address,
        (SELECT COUNT(*)::text FROM jobs j WHERE j.client_id = c.id) AS job_count,
        (SELECT MAX(j.scheduled_start)::text FROM jobs j WHERE j.client_id = c.id) AS last_visit,
        c.status::text
      FROM clients c
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 },
    );
  }
}
