/**
 * GET /api/dashboard/stats
 * ─────────────────────────
 * Returns dashboard statistics for the authenticated user.
 * Queries are scoped by the user's role permissions.
 */

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";
import { hasPermission } from "@/lib/roles";
import { features } from "@/lib/features";

export async function GET(req: NextRequest) {
  // ── Auth check ─────────────────────────────────────────
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.role;
  const userId = session.sub;

  // ── Build stats based on permissions ───────────────────
  const stats: Record<string, unknown> = {};

  if (features.database) {
    try {
      const { query } = await import("@/lib/db");

      // Jobs today (all or own)
      if (hasPermission(role, "viewAllJobs")) {
        const jobsToday = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM jobs WHERE DATE(scheduled_at) = CURRENT_DATE`,
        );
        stats.jobsToday = parseInt(jobsToday[0]?.count ?? "0", 10);

        const jobsThisWeek = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM jobs WHERE scheduled_at >= date_trunc('week', CURRENT_DATE)`,
        );
        stats.jobsThisWeek = parseInt(jobsThisWeek[0]?.count ?? "0", 10);
      } else if (hasPermission(role, "viewOwnJobs")) {
        const myJobsToday = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM jobs WHERE DATE(scheduled_at) = CURRENT_DATE AND assigned_to = $1`,
          [userId],
        );
        stats.myJobsToday = parseInt(myJobsToday[0]?.count ?? "0", 10);

        const myJobsThisWeek = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM jobs WHERE scheduled_at >= date_trunc('week', CURRENT_DATE) AND assigned_to = $1`,
          [userId],
        );
        stats.myJobsThisWeek = parseInt(myJobsThisWeek[0]?.count ?? "0", 10);
      }

      // Customers
      if (hasPermission(role, "viewAllClients")) {
        const customers = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM customers`,
        );
        stats.totalCustomers = parseInt(customers[0]?.count ?? "0", 10);
      }

      // Pending quotes
      if (hasPermission(role, "viewQuotes")) {
        const quotes = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'`,
        );
        stats.pendingQuotes = parseInt(quotes[0]?.count ?? "0", 10);
      }

      // Revenue (this month)
      if (hasPermission(role, "viewJobProfitability")) {
        const revenue = await query<{ total: string }>(
          `SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE)`,
        );
        stats.monthlyRevenue = parseFloat(revenue[0]?.total ?? "0");
      }
    } catch (err) {
      // Tables may not exist yet - return zeros
      console.warn("[dashboard/stats] DB query failed:", err);
    }
  }

  return NextResponse.json({ stats });
}
