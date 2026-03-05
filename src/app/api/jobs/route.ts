import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";

/* ── helpers ── */

function requireDb() {
  if (!features.database) {
    return NextResponse.json(
      { success: false, error: "Database feature is disabled" },
      { status: 400 },
    );
  }
  return null;
}

async function requireAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

const statusMap: Record<string, string> = {
  "Work Order": "scheduled",
  Quote: "quote",
  Scheduled: "scheduled",
  "In Progress": "in_progress",
  Completed: "completed",
  Cancelled: "cancelled",
  // pass-through DB values
  quote: "quote",
  scheduled: "scheduled",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

const priorityMap: Record<string, string> = {
  low: "low",
  medium: "medium",
  high: "high",
};

/**
 * GET /api/jobs
 */
export async function GET(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const rows = await query<{
      id: string;
      client_id: string;
      customer: string;
      address: string;
      job_type: string | null;
      assigned_to: string | null;
      assigned_user_id: string | null;
      scheduled_start: string | null;
      scheduled_end: string | null;
      status: string;
      description: string | null;
      priority: string;
      amount: string;
      created_at: string;
    }>(`
      SELECT
        j.id,
        j.client_id,
        COALESCE(
          NULLIF(TRIM(COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')), ''),
          c.company_name,
          'Unknown'
        ) AS customer,
        COALESCE(cl.address_line_1 || COALESCE(', ' || cl.city, ''), c.billing_address, '') AS address,
        j.job_type,
        COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') AS assigned_to,
        j.assigned_user_id,
        j.scheduled_start,
        j.scheduled_end,
        j.status::text,
        j.description,
        j.priority::text,
        COALESCE(
          (SELECT SUM(ji.total_price) FROM job_items ji WHERE ji.job_id = j.id)::text,
          '0.00'
        ) AS amount,
        j.created_at
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN client_locations cl ON j.location_id = cl.id
      LEFT JOIN users u ON j.assigned_user_id = u.id
      ORDER BY j.created_at DESC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Jobs API GET error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 },
    );
  }
}

/**
 * POST /api/jobs — Create a new job (optionally with schedule)
 */
export async function POST(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const payload = await requireAuth(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      clientMobile,
      address,
      status = "quote",
      jobType,
      description,
      priority = "medium",
      note,
      scheduledStart,
      scheduledEnd,
      assignedUserId,
    } = body as Record<string, string | undefined>;

    // ── Resolve or create client ──
    let resolvedClientId = clientId;

    if (!resolvedClientId) {
      if (!clientFirstName && !clientLastName) {
        return NextResponse.json(
          { success: false, error: "A client is required. Provide a clientId or client name." },
          { status: 400 },
        );
      }

      const [newClient] = await query<{ id: string }>(
        `INSERT INTO clients (first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [clientFirstName || null, clientLastName || null, clientEmail || null, clientPhone || clientMobile || null],
      );
      resolvedClientId = newClient.id;
    }

    // ── Optionally create a location ──
    let locationId: string | null = null;
    if (address && address.trim()) {
      const [loc] = await query<{ id: string }>(
        `INSERT INTO client_locations (client_id, address_line_1)
         VALUES ($1, $2)
         RETURNING id`,
        [resolvedClientId, address.trim()],
      );
      locationId = loc.id;
    }

    const dbStatus = statusMap[status] || "quote";
    const dbPriority = priorityMap[priority || "medium"] || "medium";

    // ── Insert job ──
    const [job] = await query<{ id: string; created_at: string }>(
      `INSERT INTO jobs (client_id, location_id, assigned_user_id, status, job_type, description, priority, scheduled_start, scheduled_end)
       VALUES ($1, $2, $3, $4::job_status, $5, $6, $7::job_priority, $8, $9)
       RETURNING id, created_at`,
      [
        resolvedClientId,
        locationId,
        assignedUserId || null,
        dbStatus,
        jobType || null,
        description || null,
        dbPriority,
        scheduledStart || null,
        scheduledEnd || null,
      ],
    );

    // ── Activity feed ──
    await query(
      `INSERT INTO activity_feed (author_id, job_id, post_type, content)
       VALUES ($1, $2, 'system_event', $3)`,
      [payload.sub, job.id, "Job created"],
    );

    if (note && note.trim()) {
      await query(
        `INSERT INTO activity_feed (author_id, job_id, post_type, content)
         VALUES ($1, $2, 'user_note', $3)`,
        [payload.sub, job.id, note.trim()],
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: job.id, createdAt: job.created_at },
    });
  } catch (error) {
    console.error("Create Job API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/jobs — Update an existing job
 * Expects JSON body with { id, ...fields }
 */
export async function PUT(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const payload = await requireAuth(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      status,
      jobType,
      description,
      priority,
      scheduledStart,
      scheduledEnd,
      assignedUserId,
    } = body as {
      id: string;
      status?: string;
      jobType?: string;
      description?: string;
      priority?: string;
      scheduledStart?: string | null;
      scheduledEnd?: string | null;
      assignedUserId?: string | null;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Build dynamic SET clause
    const sets: string[] = [];
    const params: (string | null)[] = [];
    let idx = 1;

    if (status !== undefined) {
      const dbStatus = statusMap[status] || status;
      sets.push(`status = $${idx}::job_status`);
      params.push(dbStatus);
      idx++;
    }
    if (jobType !== undefined) {
      sets.push(`job_type = $${idx}`);
      params.push(jobType || null);
      idx++;
    }
    if (description !== undefined) {
      sets.push(`description = $${idx}`);
      params.push(description || null);
      idx++;
    }
    if (priority !== undefined) {
      const dbPriority = priorityMap[priority] || "medium";
      sets.push(`priority = $${idx}::job_priority`);
      params.push(dbPriority);
      idx++;
    }
    if (scheduledStart !== undefined) {
      sets.push(`scheduled_start = $${idx}`);
      params.push(scheduledStart || null);
      idx++;
    }
    if (scheduledEnd !== undefined) {
      sets.push(`scheduled_end = $${idx}`);
      params.push(scheduledEnd || null);
      idx++;
    }
    if (assignedUserId !== undefined) {
      sets.push(`assigned_user_id = $${idx}`);
      params.push(assignedUserId || null);
      idx++;
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    sets.push(`updated_at = now()`);
    params.push(id);

    const [updated] = await query<{ id: string }>(
      `UPDATE jobs SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
      params,
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Activity feed
    await query(
      `INSERT INTO activity_feed (author_id, job_id, post_type, content)
       VALUES ($1, $2, 'system_event', $3)`,
      [payload.sub, id, "Job updated"],
    );

    return NextResponse.json({ success: true, data: { id: updated.id } });
  } catch (error) {
    console.error("Update Job API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/jobs — Delete a job by id
 * Expects JSON body with { id }
 */
export async function DELETE(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const payload = await requireAuth(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    // Delete activity feed entries first (no FK cascade on activity_feed)
    await query(`DELETE FROM activity_feed WHERE job_id = $1`, [id]);

    // Delete job items
    await query(`DELETE FROM job_items WHERE job_id = $1`, [id]);

    // Delete the job
    const [deleted] = await query<{ id: string }>(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`,
      [id],
    );

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: deleted.id } });
  } catch (error) {
    console.error("Delete Job API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
