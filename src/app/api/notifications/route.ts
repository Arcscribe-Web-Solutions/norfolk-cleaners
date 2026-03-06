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

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * GET /api/notifications
 * Returns notifications for the authenticated user
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const unreadOnly = searchParams.get("unread") === "true";

    const rows = await query<{
      id: string;
      type: string;
      title: string;
      message: string;
      link: string | null;
      is_read: boolean;
      read_at: string | null;
      created_at: string;
    }>(
      `
      SELECT 
        id,
        type,
        title,
        message,
        link,
        is_read,
        read_at,
        created_at
      FROM notifications
      WHERE user_id = $1
      ${unreadOnly ? "AND is_read = false" : ""}
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [user.id, limit],
    );

    // Get unread count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [user.id],
    );
    const unreadCount = parseInt(countResult[0]?.count || "0");

    const notifications: Notification[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * Body: { ids: string[] } or { markAllRead: true }
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

    const body = await req.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read for this user
      await query(
        `UPDATE notifications SET is_read = true, read_at = now() WHERE user_id = $1 AND is_read = false`,
        [user.id],
      );
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      await query(
        `UPDATE notifications SET is_read = true, read_at = now() WHERE user_id = $1 AND id = ANY($2)`,
        [user.id, ids],
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (internal use or admin)
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

    const body = await req.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await query<{ id: string }>(
      `INSERT INTO notifications (user_id, type, title, message, link) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [userId, type, title, message, link || null],
    );

    return NextResponse.json({
      success: true,
      id: result[0].id,
    });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
