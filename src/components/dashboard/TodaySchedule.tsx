"use client";

/**
 * TodaySchedule - shows today's job slots.
 * Real data is fetched from the API. Demo data shown when dev toggle is active.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import {
  BsClock,
  BsGeoAlt,
  BsPersonFill,
  BsCheckCircleFill,
  BsCircle,
  BsCalendar3,
} from "react-icons/bs";

interface ScheduleItem {
  id: string;
  time: string;
  client: string;
  address: string;
  type: string;
  assignedTo: string;
  status: "completed" | "in_progress" | "upcoming";
}

// Demo data - only shown when dev toggle is active
const DEMO_SCHEDULE: ScheduleItem[] = [
  {
    id: "j-001",
    time: "08:30",
    client: "Mrs. Patterson",
    address: "14 Riverside Rd, NR1",
    type: "Regular Clean",
    assignedTo: "Harvey Washington",
    status: "completed",
  },
  {
    id: "j-002",
    time: "10:00",
    client: "Dr. Okonkwo",
    address: "7 Cathedral Close, NR1",
    type: "Deep Clean",
    assignedTo: "Harvey Washington",
    status: "in_progress",
  },
  {
    id: "j-003",
    time: "13:00",
    client: "Blyth & Sons Ltd",
    address: "Unit 4, Wherry Rd, NR1",
    type: "Commercial Clean",
    assignedTo: "Sarah Mitchell",
    status: "upcoming",
  },
  {
    id: "j-004",
    time: "15:30",
    client: "Mr. & Mrs. Chen",
    address: "22 Eaton Rd, NR4",
    type: "End of Tenancy",
    assignedTo: "James Cole",
    status: "upcoming",
  },
  {
    id: "j-005",
    time: "17:00",
    client: "The Rose & Crown",
    address: "Crown Rd, NR2",
    type: "Regular Clean",
    assignedTo: "Harvey Washington",
    status: "upcoming",
  },
];

const statusConfig = {
  completed: {
    icon: <BsCheckCircleFill className="h-4 w-4 text-emerald-500" />,
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  in_progress: {
    icon: <BsClock className="h-4 w-4 text-amber-500" />,
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  upcoming: {
    icon: <BsCircle className="h-4 w-4 text-slate-400" />,
    label: "Upcoming",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
};

export default function TodaySchedule() {
  const { can, user } = useAuth();
  const { showDemoData } = useDemoData();
  const [realJobs, setRealJobs] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const canViewAll = can("viewAllJobs");

  // Fetch real schedule
  useEffect(() => {
    if (showDemoData) { setLoading(false); return; }
    // TODO: Replace with real API endpoint when jobs table exists
    setRealJobs([]);
    setLoading(false);
  }, [showDemoData]);

  const allJobs = showDemoData ? DEMO_SCHEDULE : realJobs;

  // Contractors only see their own jobs
  const jobs = canViewAll
    ? allJobs
    : allJobs.filter(
        (j) => j.assignedTo === `${user?.firstName} ${user?.lastName}`,
      );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Today&apos;s Schedule
        </h2>
        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 ring-1 ring-cyan-100">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
          <p className="mt-3">Loading schedule…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <BsCalendar3 className="h-6 w-6 text-slate-300" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No jobs scheduled for today.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            New jobs will appear here once created.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100/80">
          {jobs.map((job) => {
            const s = statusConfig[job.status];
            return (
              <li
                key={job.id}
                className="flex items-start gap-4 px-5 py-4 transition-all duration-200 hover:bg-slate-50/50"
              >
                {/* Time */}
                <div className="flex w-14 shrink-0 flex-col items-center pt-0.5">
                  <span className="rounded-md bg-slate-50 px-2 py-1 text-sm font-bold tabular-nums text-slate-900">
                    {job.time}
                  </span>
                </div>

                {/* Detail */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {job.client}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <BsGeoAlt className="h-3 w-3 shrink-0 text-slate-400" />
                    {job.address}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {job.type}
                    </span>
                    {canViewAll && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <BsPersonFill className="h-3 w-3" />
                        {job.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
