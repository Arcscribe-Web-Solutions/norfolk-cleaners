"use client";

/**
 * Jobs Page – Norfolk Cleaners
 * ─────────────────────────────
 * Full CRUD job list with search, status filters, inline actions,
 * and modal editing with scheduling.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import {
  BsSearch,
  BsFunnel,
  BsCalendar3,
  BsArrowRepeat,
  BsChevronDown,
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsPerson,
} from "react-icons/bs";
import NewJobModal from "@/components/dashboard/NewJobModal";
import EditJobModal from "@/components/dashboard/EditJobModal";

interface Job {
  id: string;
  client_id: string;
  customer: string;
  address: string;
  job_type: string | null;
  assigned_to: string;
  assigned_user_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string;
  description: string | null;
  priority: string;
  amount: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  completed:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed",   dot: "bg-emerald-500" },
  in_progress: { bg: "bg-amber-100",   text: "text-amber-700",  label: "In Progress",  dot: "bg-amber-500" },
  scheduled:   { bg: "bg-blue-100",    text: "text-blue-700",   label: "Scheduled",    dot: "bg-blue-500" },
  quote:       { bg: "bg-purple-100",  text: "text-purple-700", label: "Quote",        dot: "bg-purple-500" },
  cancelled:   { bg: "bg-gray-100",    text: "text-gray-500",   label: "Cancelled",    dot: "bg-gray-400" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: "bg-red-100",   text: "text-red-700",   label: "High" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  low:    { bg: "bg-gray-100",  text: "text-gray-600",  label: "Low" },
};

const DEFAULT_STATUS = { bg: "bg-gray-100", text: "text-gray-500", label: "Unknown", dot: "bg-gray-400" };
const DEFAULT_PRIORITY = { bg: "bg-gray-100", text: "text-gray-600", label: "—" };

const FILTER_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "quote", label: "Quote" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "—";
  const totalMins = Math.round(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function formatJobType(raw: string | null): string {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n) || n === 0) return "—";
  return `£${n.toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function JobsPage() {
  const { user, loading } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ── Modals ── */
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
      } else {
        setError(json.error ?? "Failed to load jobs");
        setJobs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setJobs([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchJobs();
  }, [user, fetchJobs]);

  /* ── Filtered + searched jobs ── */
  const filteredJobs = useMemo(() => {
    let list = jobs;

    if (statusFilter !== "all") {
      list = list.filter((j) => j.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.customer.toLowerCase().includes(q) ||
          j.address.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q) ||
          (j.job_type && j.job_type.toLowerCase().includes(q)) ||
          j.assigned_to.toLowerCase().includes(q) ||
          (j.description && j.description.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [jobs, search, statusFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const j of jobs) s[j.status] = (s[j.status] || 0) + 1;
    return s;
  }, [jobs]);

  const scheduledCount = useMemo(() => jobs.filter((j) => j.scheduled_start).length, [jobs]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full text-[11px] text-gray-400 bg-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full bg-white">
      {/* ── Status Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-300 px-3 py-1.5 sm:py-1 bg-gray-100 shrink-0 gap-1 sm:gap-0">
        <span className="font-bold text-gray-700 text-[12px] uppercase tracking-wide">
          Jobs
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-gray-500">
          <span>{jobs.length} total</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {stats.scheduled || 0} scheduled
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {stats.in_progress || 0} active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {stats.completed || 0} done
          </span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-gray-300 bg-[#fafafa] shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-[280px]">
          <BsSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            className="border border-gray-300 pl-7 pr-2 py-1 text-[11px] w-full outline-none focus:border-blue-400 bg-white"
            placeholder="Search jobs, clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <BsFunnel className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <select
            className="border border-gray-300 pl-7 pr-6 py-1 text-[11px] bg-white outline-none focus:border-blue-400 appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {FILTER_STATUSES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <BsChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400 pointer-events-none" />
        </div>

        {/* New Job */}
        <button
          onClick={() => setIsNewJobOpen(true)}
          className="bg-[#00809d] text-white px-3 py-1 text-[11px] font-bold cursor-pointer hover:bg-[#006d86]"
        >
          + New
        </button>

        {/* Refresh */}
        <button
          onClick={fetchJobs}
          disabled={fetching}
          className="border border-gray-300 bg-white text-gray-600 px-2 py-1 text-[11px] cursor-pointer hover:bg-gray-50 flex items-center gap-1"
        >
          <BsArrowRepeat className={`w-3 h-3 ${fetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <div className="hidden sm:block flex-1" />
        <span className="hidden sm:inline text-[10px] text-gray-400">
          Showing {filteredJobs.length} of {jobs.length}
        </span>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-3 py-1 bg-red-50 border-b border-red-200 text-[11px] text-red-600 shrink-0 flex items-center gap-1">
          <BsExclamationCircleFill className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Mobile Card View ── */}
      <div className="flex-1 overflow-auto md:hidden">
        <div className="p-3 space-y-3">
          {filteredJobs.map((j) => {
            const s = STATUS_STYLES[j.status] ?? DEFAULT_STATUS;
            const p = PRIORITY_STYLES[j.priority] ?? DEFAULT_PRIORITY;
            const isScheduled = !!j.scheduled_start;

            return (
              <div
                key={j.id}
                onClick={() => setEditingJob(j)}
                className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer active:bg-gray-50 shadow-sm"
              >
                {/* Header row: customer + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{j.customer}</h3>
                    {j.address && (
                      <p className="text-xs text-gray-500 truncate">{j.address}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded ${s.bg} ${s.text} shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-2 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400">Type:</span>{" "}
                    <span className="text-gray-700">{formatJobType(j.job_type)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Assigned:</span>{" "}
                    <span className="text-gray-700">{j.assigned_to}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>{" "}
                    <span className="text-gray-700">{isScheduled ? formatDate(j.scheduled_start) : "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Time:</span>{" "}
                    <span className="text-gray-700">
                      {isScheduled ? formatTime(j.scheduled_start) : "—"}
                    </span>
                  </div>
                </div>

                {/* Footer: amount + priority */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${p.bg} ${p.text}`}>
                    {p.label} Priority
                  </span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatAmount(j.amount)}
                  </span>
                </div>
              </div>
            );
          })}
          {!fetching && filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {error
                ? "Failed to load jobs."
                : search || statusFilter !== "all"
                  ? "No jobs match your filters."
                  : "No jobs found. Tap + New to create one."}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="flex-1 overflow-auto hidden md:block">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Job #
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Customer
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-24">
                Type
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-28">
                Assigned To
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-24">
                Date
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-20">
                Time
              </th>
              <th className="text-left px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Duration
              </th>
              <th className="text-center px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Priority
              </th>
              <th className="text-right px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Amount
              </th>
              <th className="text-center px-2 py-1.5 font-bold text-gray-600 uppercase tracking-wide w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((j) => {
              const s = STATUS_STYLES[j.status] ?? DEFAULT_STATUS;
              const p = PRIORITY_STYLES[j.priority] ?? DEFAULT_PRIORITY;
              const isScheduled = !!j.scheduled_start;

              return (
                <tr
                  key={j.id}
                  className="border-b border-gray-100 hover:bg-blue-50/60 cursor-pointer group transition-colors"
                  onClick={() => setEditingJob(j)}
                >
                  <td className="px-2 py-1.5 text-[#00809d] font-semibold border-r border-gray-100">
                    {j.id.substring(0, 8)}
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <div className="font-semibold text-gray-800">{j.customer}</div>
                    {j.address && (
                      <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{j.address}</div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 border-r border-gray-100">
                    {formatJobType(j.job_type)}
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    <div className="flex items-center gap-1">
                      <BsPerson className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-gray-700 truncate">{j.assigned_to}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    {isScheduled ? (
                      <span className="text-gray-700">{formatDate(j.scheduled_start)}</span>
                    ) : (
                      <span className="text-gray-300 italic">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 border-r border-gray-100">
                    {isScheduled ? (
                      <span className="text-gray-600">
                        {formatTime(j.scheduled_start)}
                        {j.scheduled_end ? ` – ${formatTime(j.scheduled_end)}` : ""}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-gray-500 border-r border-gray-100">
                    {formatDuration(j.scheduled_start, j.scheduled_end)}
                  </td>
                  <td className="px-2 py-1.5 text-center border-r border-gray-100">
                    <span className={`inline-block px-1.5 py-px text-[10px] font-semibold ${p.bg} ${p.text}`}>
                      {p.label}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-semibold text-gray-800 border-r border-gray-100">
                    {formatAmount(j.amount)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-px text-[10px] font-semibold ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!fetching && filteredJobs.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400 text-[12px]">
                  {error
                    ? "Failed to load jobs."
                    : search || statusFilter !== "all"
                      ? "No jobs match your filters."
                      : "No jobs found. Click + New Job to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}
      <NewJobModal
        open={isNewJobOpen}
        onClose={() => {
          setIsNewJobOpen(false);
          fetchJobs();
        }}
      />
      <EditJobModal
        open={!!editingJob}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onSaved={() => {
          fetchJobs();
        }}
        onDeleted={() => {
          setEditingJob(null);
          fetchJobs();
        }}
      />
    </div>
  );
}
