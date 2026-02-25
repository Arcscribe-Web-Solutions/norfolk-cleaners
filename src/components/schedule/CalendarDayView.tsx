"use client";

/**
 * CalendarDayView - Vertical daily calendar
 * ──────────────────────────────────────────
 * Renders a single-day view similar to Google Calendar.
 * Y-axis: time (07:00–19:00), X-axis: overlapping jobs sit side-by-side.
 *
 * Jobs are positioned absolutely based on their start/end times.
 * Overlapping jobs are detected and laid out in columns.
 */

import { useMemo, useEffect, useState } from "react";
import {
  BsClock,
  BsGeoAlt,
  BsPersonFill,
} from "react-icons/bs";
import type { ScheduleJob, StaffMember } from "@/types/schedule";
import { STATUS_STYLES } from "@/types/schedule";

// ── Config ──────────────────────────────────────────────────

const START_HOUR = 7;
const END_HOUR   = 19;
const HOUR_HEIGHT = 80;  // px per hour
const TOTAL_HOURS = END_HOUR - START_HOUR; // 12

// ── Helpers ─────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Convert a Date to a pixel offset from the top of the grid. */
function timeToY(date: Date): number {
  const hours = date.getHours() + date.getMinutes() / 60;
  return (Math.max(START_HOUR, Math.min(END_HOUR, hours)) - START_HOUR) * HOUR_HEIGHT;
}

/** Compute pixel height for a job based on its duration. */
function jobHeight(start: Date, end: Date): number {
  return Math.max(timeToY(end) - timeToY(start), 24); // min 24px
}

// ── Overlap Layout Algorithm ────────────────────────────────

interface LayoutJob {
  job: ScheduleJob;
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

function layoutJobs(jobs: ScheduleJob[]): LayoutJob[] {
  if (jobs.length === 0) return [];

  // Sort by start time, then by duration (longer first)
  const sorted = [...jobs].sort((a, b) => {
    const diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    if (diff !== 0) return diff;
    // Longer jobs first so they get column 0
    const durA = new Date(a.end_time).getTime() - new Date(a.start_time).getTime();
    const durB = new Date(b.end_time).getTime() - new Date(b.start_time).getTime();
    return durB - durA;
  });

  // Group into overlapping clusters
  const clusters: ScheduleJob[][] = [];
  let currentCluster: ScheduleJob[] = [];
  let clusterEnd = 0;

  for (const job of sorted) {
    const start = new Date(job.start_time).getTime();
    const end   = new Date(job.end_time).getTime();

    if (currentCluster.length === 0 || start < clusterEnd) {
      currentCluster.push(job);
      clusterEnd = Math.max(clusterEnd, end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [job];
      clusterEnd = end;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // Assign columns within each cluster
  const result: LayoutJob[] = [];

  for (const cluster of clusters) {
    const columns: number[] = []; // end-times per column
    const assignments = new Map<string, number>();

    for (const job of cluster) {
      const start = new Date(job.start_time).getTime();

      // Find earliest available column
      let col = columns.findIndex((colEnd) => colEnd <= start);
      if (col === -1) {
        col = columns.length;
        columns.push(0);
      }
      columns[col] = new Date(job.end_time).getTime();
      assignments.set(job.id, col);
    }

    const totalColumns = columns.length;
    for (const job of cluster) {
      const startDate = new Date(job.start_time);
      const endDate   = new Date(job.end_time);
      result.push({
        job,
        top: timeToY(startDate),
        height: jobHeight(startDate, endDate),
        column: assignments.get(job.id) ?? 0,
        totalColumns,
      });
    }
  }

  return result;
}

// ── Current-time indicator ──────────────────────────────────

function NowIndicator() {
  const [offset, setOffset] = useState(() => timeToY(new Date()));

  useEffect(() => {
    const id = setInterval(() => setOffset(timeToY(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  if (nowHour < START_HOUR || nowHour > END_HOUR) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
      style={{ top: offset }}
    >
      <div className="h-3 w-3 -ml-1.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm" />
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}

// ── Job Card ────────────────────────────────────────────────

function JobCard({
  layout,
  staffMap,
}: {
  layout: LayoutJob;
  staffMap: Map<string, StaffMember>;
}) {
  const { job, top, height, column, totalColumns } = layout;
  const s = STATUS_STYLES[job.status];
  const start = new Date(job.start_time);
  const end   = new Date(job.end_time);
  const member = staffMap.get(job.staff_id);

  const title = job.title.includes("–")
    ? job.title.split("–")[0].trim()
    : job.title;
  const customer = job.title.includes("–")
    ? job.title.split("–")[1]?.trim()
    : "";

  // Calculate left/width based on column assignment
  const gap = 4; // px gap between overlapping cards
  const widthPercent = 100 / totalColumns;
  const leftPercent  = column * widthPercent;

  return (
    <div
      className={`absolute rounded-lg border ${s.border} ${s.bg} overflow-hidden transition-shadow duration-200 hover:shadow-lg hover:z-30 cursor-default group`}
      style={{
        top,
        height,
        left: `calc(${leftPercent}% + ${column > 0 ? gap / 2 : 0}px)`,
        width: `calc(${widthPercent}% - ${gap}px)`,
      }}
    >
      <div className="flex h-full flex-col p-2.5 overflow-hidden">
        {/* Status dot + time */}
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
          <span className="text-[10px] font-semibold tabular-nums text-slate-500">
            {formatTime(start)} – {formatTime(end)}
          </span>
        </div>

        {/* Title */}
        <p className={`mt-1 text-[12px] font-semibold leading-snug ${s.text} line-clamp-2`}>
          {title}
        </p>

        {/* Customer */}
        {customer && height > 60 && (
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {customer}
          </p>
        )}

        {/* Location + Staff (only if tall enough) */}
        {height > 90 && (
          <div className="mt-auto flex flex-col gap-0.5 pt-1">
            <span className="flex items-center gap-1 truncate text-[10px] text-slate-400">
              <BsGeoAlt className="h-2.5 w-2.5 shrink-0" />
              {job.location.split(",")[0]}
            </span>
            {member && (
              <span className="flex items-center gap-1 truncate text-[10px] text-slate-400">
                <BsPersonFill className="h-2.5 w-2.5 shrink-0" />
                {member.name}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

interface CalendarDayViewProps {
  jobs: ScheduleJob[];
  staff: StaffMember[];
  date?: Date;
}

export default function CalendarDayView({
  jobs,
  staff,
  date = new Date(),
}: CalendarDayViewProps) {
  const staffMap = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff],
  );

  const layouts = useMemo(() => layoutJobs(jobs), [jobs]);

  const hourLabels = useMemo(() => {
    const arr: string[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      arr.push(`${String(h).padStart(2, "0")}:00`);
    }
    return arr;
  }, []);

  const gridHeight = TOTAL_HOURS * HOUR_HEIGHT;

  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Day View</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{dateStr}</p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {(["completed", "in_progress", "upcoming"] as const).map((status) => {
            const st = STATUS_STYLES[status];
            return (
              <span key={status} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {/* Time gutter */}
        <div className="shrink-0 w-16 border-r border-slate-100 bg-slate-50/40">
          {hourLabels.map((label) => (
            <div
              key={label}
              className="relative border-b border-slate-100/50"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="absolute -top-2.5 right-3 text-[10px] font-semibold tabular-nums text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Event area */}
        <div className="relative flex-1" style={{ height: gridHeight }}>
          {/* Hour lines */}
          {hourLabels.map((label, i) => (
            <div
              key={label}
              className="absolute left-0 right-0 border-b border-slate-100/50"
              style={{ top: i * HOUR_HEIGHT }}
            />
          ))}

          {/* Half-hour lines (dashed) */}
          {hourLabels.slice(0, -1).map((label, i) => (
            <div
              key={`half-${label}`}
              className="absolute left-0 right-0 border-b border-dashed border-slate-100/40"
              style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          ))}

          {/* Now indicator */}
          <NowIndicator />

          {/* Job cards container */}
          <div className="absolute inset-0 px-2">
            {layouts.map((l) => (
              <JobCard key={l.job.id} layout={l} staffMap={staffMap} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
