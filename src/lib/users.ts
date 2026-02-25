/**
 * User Queries - Norfolk Cleaners
 * ─────────────────────────────────
 * Data-access layer for the `users` table.
 * All functions use parameterised queries to prevent SQL injection.
 */

import { query } from "./db";
import type {
  User,
  UserWithoutPassword,
  CreateUserInput,
  UpdateUserInput,
  UserRole,
  UserStatus,
} from "../types/user";

// ── Helpers ────────────────────────────────────────────────

/** Strip password_hash from a row before returning. */
function omitPassword(user: User): UserWithoutPassword {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
}

// ── Read ───────────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const rows = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? omitPassword(rows[0]) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] ?? null;
}

export async function getUserByEmployeeCode(code: string): Promise<UserWithoutPassword | null> {
  const rows = await query<User>("SELECT * FROM users WHERE employee_code = $1", [code]);
  return rows[0] ? omitPassword(rows[0]) : null;
}

export interface ListUsersOptions {
  role?: UserRole;
  status?: UserStatus;
  search?: string;           // searches first_name, last_name, email
  skills?: string[];         // filter by ANY of these skill tags
  limit?: number;
  offset?: number;
}

export async function listUsers(opts: ListUsersOptions = {}): Promise<{
  users: UserWithoutPassword[];
  total: number;
}> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (opts.role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(opts.role);
  }
  if (opts.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(opts.status);
  }
  if (opts.search) {
    conditions.push(
      `(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
    );
    params.push(`%${opts.search}%`);
    paramIndex++;
  }
  if (opts.skills && opts.skills.length > 0) {
    conditions.push(`skills_tags && $${paramIndex++}`);
    params.push(opts.skills);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM users ${where}`,
    params
  );
  const total = parseInt(countResult[0]?.count ?? "0", 10);

  // Paginated results
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const rows = await query<User>(
    `SELECT * FROM users ${where} ORDER BY last_name ASC, first_name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  return {
    users: rows.map(omitPassword),
    total,
  };
}

/** Get active field staff (staff + contractor tiers) who can be assigned jobs. */
export async function getAvailableCleaners(): Promise<UserWithoutPassword[]> {
  const rows = await query<User>(
    `SELECT * FROM users
     WHERE role IN ('staff', 'staff_no_material', 'staff_no_pricing', 'staff_no_pricing_no_attachments', 'contractor', 'strict_contractor')
       AND status = 'active'
     ORDER BY last_name ASC`,
    []
  );
  return rows.map(omitPassword);
}

// ── Create ─────────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<UserWithoutPassword> {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  // Build dynamic INSERT from provided fields
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    columns.push(key);

    // Arrays & objects → cast to proper PG types
    if (key === "skills_tags" || key === "preferred_areas") {
      placeholders.push(`$${idx++}`);
    } else if (
      key === "emergency_contact" ||
      key === "bank_details" ||
      key === "certifications" ||
      key === "availability" ||
      key === "notification_prefs"
    ) {
      placeholders.push(`$${idx++}::jsonb`);
      values.push(JSON.stringify(value));
      continue;
    } else {
      placeholders.push(`$${idx++}`);
    }
    values.push(value);
  }

  const sql = `
    INSERT INTO users (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *
  `;

  const rows = await query<User>(sql, values);
  return omitPassword(rows[0]);
}

// ── Update ─────────────────────────────────────────────────

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<UserWithoutPassword | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    if (
      key === "emergency_contact" ||
      key === "bank_details" ||
      key === "certifications" ||
      key === "availability" ||
      key === "notification_prefs"
    ) {
      sets.push(`${key} = $${idx++}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      sets.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (sets.length === 0) return getUserById(id);

  values.push(id);
  const sql = `
    UPDATE users SET ${sets.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;

  const rows = await query<User>(sql, values);
  return rows[0] ? omitPassword(rows[0]) : null;
}

// ── Delete ─────────────────────────────────────────────────

/** Soft delete - sets status to 'terminated' and records end date. */
export async function deactivateUser(id: string): Promise<UserWithoutPassword | null> {
  return updateUser(id, {
    status: "terminated",
    end_date: new Date().toISOString().split("T")[0],
  });
}

/** Hard delete - permanently removes the row. Use with caution. */
export async function deleteUser(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}

// ── Location Updates ───────────────────────────────────────

export async function updateUserLocation(
  id: string,
  lat: number,
  lng: number
): Promise<void> {
  await query(
    `UPDATE users
     SET last_known_lat = $1,
         last_known_lng = $2,
         last_location_update = now()
     WHERE id = $3`,
    [lat, lng, id]
  );
}
