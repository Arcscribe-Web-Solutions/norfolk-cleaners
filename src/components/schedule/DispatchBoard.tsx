"use client";

/**
 * DispatchBoard - Gantt-style resource timeline
 * ──────────────────────────────────────────────
 * Y-axis: staff members (resources)
 * X-axis: time slots (30-min increments, default 07:00–19:00)
 *
 * Job blocks span proportionally across the time axis according
 * to their duration. Colour-coded by status.
 */

import { useMemo, useRef, useEffect, useState } from "react";
import {
  BsGeoAlt,
  BsClock,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import type { ScheduleJob, StaffMember } from "@/types/schedule";
import { STATUS_STYLES } from "@/types/schedule";

// ── Config ──────────────────────────────────────────────────

const START_HOUR = 7;   // 07:00
const END_HOUR   = 19;  // 19:00
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES; // 24 slots
const SLOT_WIDTH  = 80;  // px per 30-min slot
const ROW_HEIGHT  = 72;  // px per staff row
const LABEL_WIDTH = 200; // px for the staff label column

// ── Helpers ─────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function slotLabels(): string[] {
  const labels: string[] = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const totalMin = START_HOUR * 60 + i * SLOT_MINUTES;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    labels.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return labels;
}

/** Convert a Date to a pixel offset from the left of the grid. */
function timeToPx(date: Date): number {
  const mins = date.getHours() * 60 + date.getMinutes();
  const startMins = START_HOUR * 60;
  const endMins   = END_HOUR * 60;
  const clamped = Math.max(startMins, Math.min(endMins, mins));
  return ((clamped - startMins) / SLOT_MINUTES) * SLOT_WIDTH;
}

// ── Current-time indicator ──────────────────────────────────

function NowLine() {
  const [offset, setOffset] = useState(() => timeToPx(new Date()));

  useEffect(() => {
    const id = setInterval(() => setOffset(timeToPx(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  if (nowMins < START_HOUR * 60 || nowMins > END_HOUR * 60) return null;

  return (
    <div
      className="absolute top-0 bottom-0 z-20 w-px bg-red-500"
      style={{ left: offset }}
    >
      <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
    </div>
  );
}

// ── Job tooltip ─────────────────────────────────────────────

function JobBlock({
  job,
  staffName,
}: {
  job: ScheduleJob;
  staffName: string;
}) {
  const start = new Date(job.start_time);
  const end   = new Date(job.end_time);
  const left  = timeToPx(start);
  const width = Math.max(timeToPx(end) - left, 24); // min 24px
  const s     = STATUS_STYLES[job.status];

  const title = job.title.includes("–")
    ? job.title.split("–")[0].trim()
    : job.title;
  const customer = job.title.includes("–")
    ? job.title.split("–")[1]?.trim()
    : "";

  return (
    <div
      className={`absolute top-1.5 bottom-1.5 rounded-lg border ${s.border} ${s.bg} cursor-default overflow-hidden transition-shadow duration-200 hover:shadow-md group`}
      style={{ left, width }}
      title={`${job.title}\n${formatTime(start)} – ${formatTime(end)}\n${job.location}`}
    >
      <div className="flex h-full flex-col justify-center px-2.5 py-1">
        {/* Top row: title + status dot */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
          <span className={`truncate text-[11px] font-semibold leading-tight ${s.text}`}>
            {width > 120 ? title : title.slice(0, 12)}
          </span>
        </div>

        {/* Customer (hidden on narrow blocks) */}
        {customer && width > 140 && (
          <span className="mt-0.5 truncate text-[10px] text-slate-500 leading-tight">
            {customer}
          </span>
        )}

        {/* Time + location (hidden on narrow blocks) */}
        {width > 180 && (
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-0.5">
              <BsClock className="h-2.5 w-2.5" />
              {formatTime(start)}–{formatTime(end)}
            </span>
            <span className="flex items-center gap-0.5 truncate">
              <BsGeoAlt className="h-2.5 w-2.5" />
              {job.location.split(",")[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

interface DispatchBoardProps {
  jobs: ScheduleJob[];
  staff: StaffMember[];
  date?: Date;
}

export default function DispatchBoard({
  jobs,
  staff,
  date = new Date(),
}: DispatchBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const labels = useMemo(slotLabels, []);
  const gridWidth = TOTAL_SLOTS * SLOT_WIDTH;

  // Group jobs by staff_id
  const jobsByStaff = useMemo(() => {
    const map = new Map<string, ScheduleJob[]>();
    staff.forEach((s) => map.set(s.id, []));
    jobs.forEach((j) => {
      const arr = map.get(j.staff_id);
      if (arr) arr.push(j);
    });
    return map;
  }, [jobs, staff]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const offset = timeToPx(now) - 200;
      scrollRef.current.scrollLeft = Math.max(0, offset);
    }
  }, []);

  // Scroll helpers
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SLOT_WIDTH * 4 : SLOT_WIDTH * 4,
      behavior: "smooth",
    });
  };

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
          <h2 className="text-sm font-semibold text-slate-900">Dispatch Board</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{dateStr}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <BsChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <BsChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-2">
        {(["completed", "in_progress", "upcoming", "cancelled"] as const).map((status) => {
          const s = STATUS_STYLES[status];
          return (
            <span key={status} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          );
        })}
      </div>

      {/* Grid area */}
      <div className="flex">
        {/* Frozen staff labels column */}
        <div
          className="shrink-0 border-r border-slate-100 bg-slate-50/60"
          style={{ width: LABEL_WIDTH }}
        >
          {/* Header cell (aligned with time row) */}
          <div className="flex h-9 items-center border-b border-slate-100 px-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Staff
            </span>
          </div>

          {/* Staff rows */}
          {staff.map((member) => {
            const memberJobs = jobsByStaff.get(member.id) ?? [];
            return (
              <div
                key={member.id}
                className="flex items-center gap-2.5 border-b border-slate-100/70 px-4"
                style={{ height: ROW_HEIGHT }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-50 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/60">
                  {member.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-slate-800">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {member.role} · {memberJobs.length} job{memberJobs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden dispatch-scroll">
          <div className="relative" style={{ width: gridWidth, minWidth: gridWidth }}>
            {/* Time header row */}
            <div className="flex h-9 border-b border-slate-100">
              {labels.map((label, i) => (
                <div
                  key={label}
                  className="shrink-0 border-r border-slate-100/60 flex items-end pb-1.5 pl-2"
                  style={{ width: SLOT_WIDTH }}
                >
                  <span className={`text-[10px] tabular-nums ${
                    i % 2 === 0
                      ? "font-semibold text-slate-600"
                      : "text-slate-400"
                  }`}>
                    {i % 2 === 0 ? label : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Staff rows */}
            {staff.map((member, rowIdx) => {
              const memberJobs = jobsByStaff.get(member.id) ?? [];
              return (
                <div
                  key={member.id}
                  className={`relative border-b border-slate-100/70 ${
                    rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Grid lines */}
                  {labels.map((label) => (
                    <div
                      key={label}
                      className="absolute top-0 bottom-0 border-r border-slate-100/40"
                      style={{
                        left: labels.indexOf(label) * SLOT_WIDTH,
                        width: SLOT_WIDTH,
                      }}
                    />
                  ))}

                  {/* Job blocks */}
                  {memberJobs.map((job) => (
                    <JobBlock key={job.id} job={job} staffName={member.name} />
                  ))}
                </div>
              );
            })}

            {/* Now line spanning all rows */}
            <div className="pointer-events-none absolute top-9 bottom-0 left-0 right-0 z-20">
              <NowLine />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
