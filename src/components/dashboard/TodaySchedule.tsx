"use client";

/**
 * TodaySchedule - vertical daily calendar grid.
 * Displays job blocks on a 7 AM – 6 PM timeline.
 * Real data is fetched from the API. Demo data shown when dev toggle is active.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";

interface ScheduleItem {
  id: string;
  time: string;
  client: string;
  address: string;
  type: string;
  assignedTo: string;
  status: "completed" | "in_progress" | "upcoming";
  /** Duration in minutes (defaults applied if missing) */
  durationMin?: number;
}

// Demo data
const DEMO_SCHEDULE: ScheduleItem[] = [
  {
    id: "j-001",
    time: "08:30",
    client: "Mrs. Patterson",
    address: "14 Riverside Rd, NR1",
    type: "Regular Clean",
    assignedTo: "Harvey Washington",
    status: "completed",
    durationMin: 90,
  },
  {
    id: "j-002",
    time: "10:00",
    client: "Dr. Okonkwo",
    address: "7 Cathedral Close, NR1",
    type: "Deep Clean",
    assignedTo: "Harvey Washington",
    status: "in_progress",
    durationMin: 150,
  },
  {
    id: "j-003",
    time: "13:00",
    client: "Blyth & Sons Ltd",
    address: "Unit 4, Wherry Rd, NR1",
    type: "Commercial Clean",
    assignedTo: "Sarah Mitchell",
    status: "upcoming",
    durationMin: 120,
  },
  {
    id: "j-004",
    time: "15:30",
    client: "Mr. & Mrs. Chen",
    address: "22 Eaton Rd, NR4",
    type: "End of Tenancy",
    assignedTo: "James Cole",
    status: "upcoming",
    durationMin: 120,
  },
  {
    id: "j-005",
    time: "17:00",
    client: "The Rose & Crown",
    address: "Crown Rd, NR2",
    type: "Regular Clean",
    assignedTo: "Harvey Washington",
    status: "upcoming",
    durationMin: 60,
  },
];

// ── Color palette keyed by staff member ─────────────────────
const STAFF_COLORS: Record<string, { bg: string; border: string }> = {
  "Harvey Washington": { bg: "bg-blue-100", border: "border-blue-400" },
  "Sarah Mitchell": { bg: "bg-yellow-100", border: "border-yellow-400" },
  "James Cole": { bg: "bg-pink-100", border: "border-pink-400" },
};
const DEFAULT_COLOR = { bg: "bg-green-100", border: "border-green-400" };

// Timeline config
const HOUR_START = 7; // 7 AM
const HOUR_END = 18; // 6 PM
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const ROW_HEIGHT = 56; // px per hour
const TOTAL_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

function formatHour(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function timeToMinutes(timeStr: string): number {
  const [hh, mm] = timeStr.split(":").map(Number);
  return hh * 60 + mm;
}

function minutesToPx(minutes: number): number {
  return ((minutes - HOUR_START * 60) / 60) * ROW_HEIGHT;
}

export default function TodaySchedule() {
  const { can, user } = useAuth();
  const { showDemoData } = useDemoData();
  const [realJobs, setRealJobs] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const canViewAll = can("viewAllJobs");

  useEffect(() => {
    if (showDemoData) {
      setLoading(false);
      return;
    }
    setRealJobs([]);
    setLoading(false);
  }, [showDemoData]);

  const allJobs = showDemoData ? DEMO_SCHEDULE : realJobs;
  const jobs = canViewAll
    ? allJobs
    : allJobs.filter(
        (j) => j.assignedTo === `${user?.firstName} ${user?.lastName}`,
      );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50 shrink-0">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          Today&apos;s Schedule
        </h2>
        <span className="text-[10px] font-semibold text-gray-500">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          Loading…
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          No jobs scheduled for today.
        </div>
      ) : (
        /* Calendar grid */
        <div className="flex-1 overflow-y-auto">
          <div className="flex" style={{ minHeight: TOTAL_HEIGHT }}>
            {/* Y-axis: hour labels */}
            <div className="shrink-0 w-16 border-r border-gray-300 bg-gray-50">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="border-b border-gray-200 text-[10px] text-gray-500 pr-2 text-right leading-none"
                  style={{ height: ROW_HEIGHT }}
                >
                  <span className="relative -top-[5px]">{formatHour(h)}</span>
                </div>
              ))}
            </div>

            {/* Timeline body */}
            <div className="flex-1 relative">
              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-b border-gray-200"
                  style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                />
              ))}

              {/* Job blocks */}
              {jobs.map((job) => {
                const startMin = timeToMinutes(job.time);
                const dur = job.durationMin ?? 90;
                const top = minutesToPx(startMin);
                const height = (dur / 60) * ROW_HEIGHT;
                const color = STAFF_COLORS[job.assignedTo] ?? DEFAULT_COLOR;

                return (
                  <div
                    key={job.id}
                    className={`absolute left-1 right-1 rounded-none border-l-[3px] ${color.border} ${color.bg} overflow-hidden`}
                    style={{ top, height: Math.max(height, 24) }}
                  >
                    <div className="px-1.5 py-0.5 leading-tight">
                      <p className="text-[11px] font-bold text-gray-900 truncate">
                        {job.client}
                      </p>
                      <p className="text-[10px] text-gray-600 truncate">
                        {job.address}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {job.type}
                        {canViewAll && (
                          <span className="ml-1 text-gray-400">
                            — {job.assignedTo}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
