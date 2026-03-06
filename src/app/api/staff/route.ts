import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";
import { hashPassword } from "@/lib/password";

/* ── helpers ── */

function requireDb() {
  if (!features.database) {
    return NextResponse.json(
      { success: false, error: "Database feature is disabled", data: [] },
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

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  employmentType: string;
  hourlyRate: string | null;
  startDate: string | null;
  createdAt: string;
}

/**
 * GET /api/staff
 * Returns staff members with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", data: [] },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // active, on_leave, suspended, terminated
    const role = searchParams.get("role");
    const simple = searchParams.get("simple") === "true"; // For dropdowns, return minimal data

    if (simple) {
      // Simple query for dropdowns
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
    }

    // Full query for staff management
    let whereClause = "WHERE 1=1";
    const params: (string | null)[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    const rows = await query<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string | null;
      role: string;
      status: string;
      employment_type: string;
      hourly_rate: string | null;
      start_date: string | null;
      created_at: string;
    }>(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        phone_number,
        role::text,
        status::text,
        employment_type::text,
        hourly_rate::text,
        start_date::text,
        created_at::text
      FROM users
      ${whereClause}
      ORDER BY first_name ASC, last_name ASC
    `, params);

    const staff: StaffMember[] = rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone_number,
      role: row.role,
      status: row.status,
      employmentType: row.employment_type,
      hourlyRate: row.hourly_rate,
      startDate: row.start_date,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Staff API GET error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 },
    );
  }
}

/**
 * POST /api/staff
 * Create a new staff member
 */
export async function POST(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check permissions
    const allowedRoles = ["owner", "business_owner"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = "staff",
      status = "active",
      employmentType = "full_time",
      hourlyRate,
      startDate,
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Email, password, first name, and last name are required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const result = await query<{ id: string }>(
      `INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        phone_number,
        role,
        status,
        employment_type,
        hourly_rate,
        start_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        email,
        passwordHash,
        firstName,
        lastName,
        phone || null,
        role,
        status,
        employmentType,
        hourlyRate ? parseFloat(hourlyRate) : null,
        startDate || null,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result[0].id,
    });
  } catch (error) {
    console.error("Staff API POST error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/staff
 * Update a staff member
 */
export async function PATCH(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check permissions
    const allowedRoles = ["owner", "business_owner"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Staff member ID is required" },
        { status: 400 },
      );
    }

    // Build update query
    const setClauses: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      phone: "phone_number",
      role: "role",
      status: "status",
      employmentType: "employment_type",
      hourlyRate: "hourly_rate",
      startDate: "start_date",
    };

    for (const [key, value] of Object.entries(updates)) {
      const dbField = fieldMap[key];
      if (dbField) {
        setClauses.push(`${dbField} = $${paramIndex}`);
        if (key === "hourlyRate" && value) {
          params.push(parseFloat(value as string));
        } else {
          params.push(value as string | null);
        }
        paramIndex++;
      }
    }

    // Handle password separately
    if (updates.password) {
      const passwordHash = await hashPassword(updates.password);
      setClauses.push(`password_hash = $${paramIndex}`);
      params.push(passwordHash);
      paramIndex++;
    }

    // Handle email separately (check for duplicates)
    if (updates.email) {
      const existing = await query<{ id: string }>(
        `SELECT id FROM users WHERE email = $1 AND id != $2`,
        [updates.email, id]
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "A user with this email already exists" },
          { status: 400 },
        );
      }
      setClauses.push(`email = $${paramIndex}`);
      params.push(updates.email);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    setClauses.push(`updated_at = now()`);
    params.push(id);

    await query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff API PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/staff
 * Delete (or deactivate) a staff member
 */
export async function DELETE(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check permissions
    const allowedRoles = ["owner", "business_owner"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const hardDelete = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Staff member ID is required" },
        { status: 400 },
      );
    }

    // Prevent deleting yourself
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    if (hardDelete) {
      // Actually delete the record
      await query(`DELETE FROM users WHERE id = $1`, [id]);
    } else {
      // Soft delete - set status to terminated
      await query(
        `UPDATE users SET status = 'terminated', updated_at = now() WHERE id = $1`,
        [id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff API DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
