import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";

/**
 * GET /api/staff/schedule?date=2025-06-20&staffId=xxx
 *
 * Returns a staff member's scheduled jobs for a given date.
 * If staffId is omitted, returns ALL staff with their jobs for the day
 * (used by the scheduling panel to show everyone's availability).
 */
export async function GET(req: NextRequest) {
  try {
    if (!features.database) {
      return NextResponse.json(
        { success: false, error: "Database feature is disabled", data: [] },
        { status: 400 },
      );
    }

    const dateParam = req.nextUrl.searchParams.get("date");
    const staffId = req.nextUrl.searchParams.get("staffId");

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: "date parameter is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // ── Fetch all active staff ──
    const staffRows = await query<{
      id: string;
      first_name: string;
      last_name: string;
      role: string;
    }>(`
      SELECT id, first_name, last_name, role::text
      FROM users
      WHERE status = 'active'
      ${staffId ? `AND id = $1` : ""}
      ORDER BY first_name ASC, last_name ASC
    `, staffId ? [staffId] : []);

    // ── Fetch jobs for the date ──
    const jobRows = await query<{
      id: string;
      assigned_user_id: string;
      job_type: string | null;
      customer: string;
      scheduled_start: string;
      scheduled_end: string | null;
      status: string;
      location: string;
      description: string | null;
    }>(`
      SELECT
        j.id,
        j.assigned_user_id,
        j.job_type,
        COALESCE(
          NULLIF(TRIM(COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')), ''),
          c.company_name,
          'Unknown'
        ) AS customer,
        j.scheduled_start,
        j.scheduled_end,
        j.status::text,
        COALESCE(cl.address_line_1 || COALESCE(', ' || cl.city, ''), '') AS location,
        j.description
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN client_locations cl ON j.location_id = cl.id
      WHERE j.scheduled_start IS NOT NULL
        AND j.scheduled_start::date = $1
        AND j.assigned_user_id IS NOT NULL
        AND j.status != 'cancelled'
      ${staffId ? `AND j.assigned_user_id = $2` : ""}
      ORDER BY j.scheduled_start ASC
    `, staffId ? [dateParam, staffId] : [dateParam]);

    // ── Group jobs by staff ──
    const staffSchedules = staffRows.map((s) => {
      const jobs = jobRows
        .filter((j) => j.assigned_user_id === s.id)
        .map((j) => ({
          id: j.id,
          jobType: j.job_type,
          customer: j.customer,
          scheduledStart: j.scheduled_start,
          scheduledEnd: j.scheduled_end,
          status: j.status,
          location: j.location,
          description: j.description,
        }));

      return {
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        initials: `${s.first_name.charAt(0)}${s.last_name.charAt(0)}`.toUpperCase(),
        role: s.role.charAt(0).toUpperCase() + s.role.slice(1).replace(/_/g, " "),
        jobs,
        jobCount: jobs.length,
      };
    });

    return NextResponse.json({ success: true, data: staffSchedules });
  } catch (error) {
    console.error("Staff schedule API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 },
    );
  }
}
