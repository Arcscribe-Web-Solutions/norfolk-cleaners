import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";

/**
 * GET /api/dashboard/data
 * 
 * Returns dashboard data including stats, activity feed, tasks, and today's jobs.
 */
export async function GET(req: NextRequest) {
  try {
    if (!features.database) {
      return NextResponse.json(
        { success: false, error: "Database feature is disabled" },
        { status: 400 }
      );
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Fetch all dashboard data in parallel
    const [stats, activityFeed, tasks, todayJobs] = await Promise.all([
      getDashboardStats(),
      getActivityFeedWithAuthors(10),
      getTasks(),
      getTodayJobs(startOfDay, endOfDay),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        activityFeed,
        tasks,
        todayJobs,
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  const [clientStats] = await query<{
    total_clients: string;
    active_clients: string;
  }>(`
    SELECT
      COUNT(*)::text AS total_clients,
      COUNT(*) FILTER (WHERE status = 'active')::text AS active_clients
    FROM clients
  `);

  const [jobStats] = await query<{
    total_jobs: string;
    today_jobs: string;
    week_jobs: string;
  }>(`
    SELECT
      COUNT(*)::text AS total_jobs,
      COUNT(*) FILTER (WHERE scheduled_start::date = CURRENT_DATE)::text AS today_jobs,
      COUNT(*) FILTER (WHERE scheduled_start::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days')::text AS week_jobs
    FROM jobs
  `);

  const jobsByStatus = await query<{ status: string; count: string }>(`
    SELECT status::text, COUNT(*)::text AS count FROM jobs GROUP BY status
  `);

  const [invoiceStats] = await query<{
    total_revenue: string;
    pending_invoices: string;
    overdue_invoices: string;
  }>(`
    SELECT
      COALESCE(SUM(total) FILTER (WHERE status = 'paid'), 0)::text AS total_revenue,
      COALESCE(SUM(total) FILTER (WHERE status = 'sent'), 0)::text AS pending_invoices,
      COALESCE(SUM(total) FILTER (WHERE status = 'overdue'), 0)::text AS overdue_invoices
    FROM invoices
  `).catch(() => [{ total_revenue: "0", pending_invoices: "0", overdue_invoices: "0" }]);

  const [taskStats] = await query<{ pending_tasks: string }>(`
    SELECT COUNT(*) FILTER (WHERE NOT is_completed)::text AS pending_tasks FROM tasks
  `).catch(() => [{ pending_tasks: "0" }]);

  const statusMap: Record<string, number> = {};
  for (const row of jobsByStatus) {
    statusMap[row.status] = parseInt(row.count, 10);
  }

  return {
    totalClients: parseInt(clientStats?.total_clients ?? "0", 10),
    activeClients: parseInt(clientStats?.active_clients ?? "0", 10),
    totalJobs: parseInt(jobStats?.total_jobs ?? "0", 10),
    jobsByStatus: statusMap,
    todayJobs: parseInt(jobStats?.today_jobs ?? "0", 10),
    weekJobs: parseInt(jobStats?.week_jobs ?? "0", 10),
    totalRevenue: parseFloat(invoiceStats?.total_revenue ?? "0"),
    pendingInvoices: parseFloat(invoiceStats?.pending_invoices ?? "0"),
    overdueInvoices: parseFloat(invoiceStats?.overdue_invoices ?? "0"),
    pendingTasks: parseInt(taskStats?.pending_tasks ?? "0", 10),
  };
}

/**
 * Get activity feed items with author information joined
 */
async function getActivityFeedWithAuthors(limit: number) {
  const results = await query<{
    id: string;
    author_id: string;
    author_name: string;
    job_id: string | null;
    post_type: string;
    content: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>(`
    SELECT 
      af.*,
      COALESCE(u.first_name || ' ' || u.last_name, 'System') as author_name
    FROM activity_feed af
    LEFT JOIN users u ON af.author_id = u.id
    ORDER BY af.created_at DESC
    LIMIT ${Math.floor(limit)}
  `);

  return results;
}

/**
 * Get incomplete tasks
 */
async function getTasks() {
  return query<{
    id: string;
    assigned_to: string | null;
    created_by: string;
    title: string;
    description: string | null;
    due_date: string | null;
    is_completed: boolean;
  }>(`
    SELECT id, assigned_to, created_by, title, description, due_date, is_completed
    FROM tasks
    WHERE NOT is_completed
    ORDER BY due_date ASC NULLS LAST
  `).catch(() => []);
}

/**
 * Get today's jobs
 */
async function getTodayJobs(startOfDay: string, endOfDay: string) {
  return query<{
    id: string;
    job_type: string | null;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
    assigned_user_id: string | null;
  }>(`
    SELECT id, job_type, status::text, scheduled_start, scheduled_end, assigned_user_id
    FROM jobs
    WHERE scheduled_start >= $1 AND scheduled_start <= $2
    ORDER BY scheduled_start ASC
  `, [startOfDay, endOfDay]).catch(() => []);
}
