"use client";

/**
 * Dashboard – Norfolk Cleaners
 * ─────────────────────────────
 * Legacy-style enterprise dashboard with action buttons,
 * two-column workspace (feed + tasks sidebar).
 */

import { useEffect, useState } from "react";
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiFileText, 
  FiMapPin, 
  FiSettings, 
  FiBarChart2, 
  FiPackage,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader
} from "react-icons/fi";

// Types for API response
interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  todayJobs: number;
  weekJobs: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  pendingTasks: number;
}

interface ActivityFeedItem {
  id: string;
  author_id: string;
  author_name: string;
  job_id: string | null;
  post_type: "user_note" | "system_event" | "payment_received";
  content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Task {
  id: string;
  assigned_to: string | null;
  created_by: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  activityFeed: ActivityFeedItem[];
  tasks: Task[];
  todayJobs: unknown[];
}

const actionButtons = [
  { icon: FiMapPin, label: "Dispatch Board", href: "/schedule" },
  { icon: FiClock, label: "History", href: "/jobs" },
  { icon: FiUsers, label: "Clients", href: "/customers" },
  { icon: FiFileText, label: "Invoicing", href: "/invoices" },
  { icon: FiCalendar, label: "Schedule", href: "/schedule" },
  { icon: FiBarChart2, label: "Reports", href: "/reports" },
  { icon: FiPackage, label: "Inventory", href: "/inventory" },
  { icon: FiSettings, label: "Settings", href: "/settings" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch("/api/dashboard/data");
        const json = await res.json();
        
        if (!json.success) {
          throw new Error(json.error || "Failed to fetch dashboard data");
        }
        
        setData(json.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Container */}
        <div className="max-w-5xl mx-auto pt-4 sm:pt-8 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pb-8">
          
          {/* Top Action Buttons Grid - responsive sizing */}
          <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3">
            {actionButtons.map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                className="w-full sm:w-24 aspect-square sm:h-24 bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <btn.icon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600 mb-1 sm:mb-2" />
                <span className="text-[10px] sm:text-xs text-gray-700 text-center leading-tight px-1">
                  {btn.label}
                </span>
              </a>
            ))}
          </div>

          {/* Stats Cards Row - responsive grid */}
          {!loading && data && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <StatCard label="Active Clients" value={data.stats.activeClients} />
              <StatCard label="Today's Jobs" value={data.stats.todayJobs} />
              <StatCard label="Pending Invoices" value={data.stats.pendingInvoices} />
              <StatCard 
                label="Total Revenue" 
                value={`£${data.stats.totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} 
              />
            </div>
          )}

          {/* Two-Column Workspace */}
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column - Feed (65%) */}
            <div className="flex-grow flex flex-col gap-4">
              
              {/* Create Post Card */}
              <div className="border border-gray-300 rounded-sm bg-white">
                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                  <span className="font-bold text-sm text-gray-800">Create Post</span>
                </div>
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <FiUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="What's on your mind?"
                    className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Activity Feed */}
              {loading ? (
                <LoadingCard message="Loading activity feed..." />
              ) : error ? (
                <ErrorCard message={error} />
              ) : data?.activityFeed && data.activityFeed.length > 0 ? (
                data.activityFeed.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyCard message="No recent activity" />
              )}

            </div>

            {/* Right Column - Sidebar (35%) */}
            <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
              
              {/* My Tasks Card */}
              <div className="border border-gray-300 rounded-sm bg-white">
                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                  <span className="font-bold text-sm text-gray-800">My Tasks</span>
                  {data && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({data.stats.pendingTasks} pending)
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Loading tasks...
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : data?.tasks && data.tasks.length > 0 ? (
                    <ul className="space-y-2">
                      {data.tasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="flex items-start gap-2">
                          <FiCheckCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{task.title}</p>
                            {task.due_date && (
                              <p className="text-xs text-gray-500">
                                Due: {new Date(task.due_date).toLocaleDateString("en-GB")}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No tasks are currently assigned to you.
                    </p>
                  )}
                </div>
              </div>

              {/* Job Status Overview */}
              {!loading && data && (
                <div className="border border-gray-300 rounded-sm bg-white">
                  <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                    <span className="font-bold text-sm text-gray-800">Job Status</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <JobStatusRow label="Quotes" value={data.stats.jobsByStatus.quote || 0} color="bg-gray-400" />
                    <JobStatusRow label="Scheduled" value={data.stats.jobsByStatus.scheduled || 0} color="bg-blue-500" />
                    <JobStatusRow label="In Progress" value={data.stats.jobsByStatus.in_progress || 0} color="bg-yellow-500" />
                    <JobStatusRow label="Completed" value={data.stats.jobsByStatus.completed || 0} color="bg-green-500" />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-gray-300 rounded-sm bg-white p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityFeedItem }) {
  const getIcon = () => {
    switch (item.post_type) {
      case "payment_received":
        return <span className="text-green-600">💰</span>;
      case "system_event":
        return <span className="text-blue-600">⚙️</span>;
      default:
        return <FiUser className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-300 rounded-sm bg-white">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="font-bold text-sm text-gray-800">{item.author_name}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
        </div>
        {item.content && (
          <p className="text-sm text-gray-700">{item.content}</p>
        )}
        {item.metadata && item.post_type === "payment_received" && (
          <div className="mt-2 text-sm">
            {(item.metadata as { payouts?: { job: string; amount: string }[] }).payouts?.map((payout, i) => (
              <p key={i} className="text-gray-700">
                <span className="font-medium text-green-700">{payout.amount}</span>
                {" "}for Job{" "}
                <span className="text-blue-600">{payout.job}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobStatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="border border-gray-300 rounded-sm bg-white p-6 flex items-center justify-center gap-2">
      <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="border border-red-300 rounded-sm bg-red-50 p-4 flex items-start gap-2">
      <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800">Error loading data</p>
        <p className="text-xs text-red-600 mt-1">{message}</p>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="border border-gray-300 rounded-sm bg-white p-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
