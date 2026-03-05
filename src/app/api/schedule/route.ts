import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";

/** Colour wheel for staff rows – assigned round-robin */
const STAFF_COLORS = ["cyan", "violet", "amber", "emerald", "rose", "sky", "orange", "fuchsia"];

/** Map DB job_status → UI JobStatus */
function mapStatus(dbStatus: string): string {
  switch (dbStatus) {
    case "completed":
      return "completed";
    case "in_progress":
      return "in_progress";
    case "cancelled":
      return "cancelled";
    case "scheduled":
    case "quote":
    default:
      return "upcoming";
  }
}

/**
 * GET /api/schedule?date=2025-06-20
 *
 * Returns staff members and their jobs for the dispatch board.
 * Optionally accepts a `date` query param (YYYY-MM-DD); defaults to today.
 */
export async function GET(req: NextRequest) {
  try {
    if (!features.database) {
      return NextResponse.json(
        { success: false, error: "Database feature is disabled", staff: [], jobs: [] },
        { status: 400 },
      );
    }

    const dateParam = req.nextUrl.searchParams.get("date");

    // ── Fetch staff (active users who perform work) ────────
    const staffRows = await query<{
      id: string;
      first_name: string;
      last_name: string;
      role: string;
    }>(`
      SELECT id, first_name, last_name, role::text
      FROM users
      WHERE status = 'active'
      ORDER BY role ASC, first_name ASC
    `);

    const staff = staffRows.map((u, i) => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1).replace(/_/g, " "),
      avatarInitials: `${u.first_name.charAt(0)}${u.last_name.charAt(0)}`.toUpperCase(),
      color: STAFF_COLORS[i % STAFF_COLORS.length],
    }));

    // ── Fetch jobs for the requested date ──────────────────
    let dateFilter: string;
    const params: string[] = [];

    if (dateParam) {
      params.push(dateParam);
      dateFilter = `AND j.scheduled_start::date = $1`;
    } else {
      dateFilter = `AND j.scheduled_start::date = CURRENT_DATE`;
    }

    const jobRows = await query<{
      id: string;
      job_type: string | null;
      customer: string;
      assigned_user_id: string | null;
      scheduled_start: string;
      scheduled_end: string;
      status: string;
      location: string;
    }>(
      `
      SELECT
        j.id,
        j.job_type,
        COALESCE(
          NULLIF(TRIM(COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')), ''),
          c.company_name,
          'Unknown'
        ) AS customer,
        j.assigned_user_id,
        j.scheduled_start,
        j.scheduled_end,
        j.status::text,
        COALESCE(cl.address_line_1 || COALESCE(', ' || cl.city, ''), '') AS location
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN client_locations cl ON j.location_id = cl.id
      WHERE j.scheduled_start IS NOT NULL
        ${dateFilter}
      ORDER BY j.scheduled_start ASC
      `,
      params,
    );

    const jobs = jobRows.map((j) => ({
      id: j.id,
      title: `${j.job_type ? j.job_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Job"} – ${j.customer}`,
      staff_id: j.assigned_user_id ?? "",
      start_time: j.scheduled_start,
      end_time: j.scheduled_end,
      status: mapStatus(j.status),
      location: j.location,
    }));

    return NextResponse.json({
      success: true,
      staff,
      jobs,
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        staff: [],
        jobs: [],
      },
      { status: 500 },
    );
  }
}
