"use client";

/**
 * Dispatch Board – Horizontal Timeline
 * ─────────────────────────────────────
 * Staff rows down the left · Time columns across the top
 * View modes: Day | Week | 2 Weeks | Month
 * Tabs with icons: Calendar, Tasks, Dispatch Map
 */

import { useState, useMemo, useEffect, useRef } from "react";
import {
  BsPlusCircleFill,
  BsArrowRepeat,
  BsFileEarmarkText,
  BsPersonPlus,
  BsSearch,
  BsChevronLeft,
  BsChevronRight,
  BsGeoAlt,
  BsClock,
  BsCheckCircleFill,
  BsCircleFill,
  BsCalendar3,
  BsListCheck,
  BsMap,
} from "react-icons/bs";
import DemoDataBanner, {
  useDemoData,
} from "@/components/dashboard/DemoDataBanner";
import { DEMO_STAFF, DEMO_JOBS } from "@/types/schedule";
import type { ScheduleJob, StaffMember, JobStatus } from "@/types/schedule";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_WIDTH = 120; // px per hour column (day view)
const ROW_HEIGHT = 56; // px per staff row (day view)
const HOUR_HEIGHT = 60; // px per hour row (week/2-week views)
const STAFF_COL_WIDTH = 120; // width of staff labels column
const TIME_COL_WIDTH = 52; // width of time gutter (week/2-week views)
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i,
);

/* staff colours */
const STAFF_COLORS: Record<
  string,
  { bg: string; text: string; light: string; border: string }
> = {
  cyan:    { bg: "bg-blue-500",    text: "text-white", light: "bg-blue-100",    border: "border-blue-400" },
  violet:  { bg: "bg-violet-500",  text: "text-white", light: "bg-violet-100",  border: "border-violet-400" },
  amber:   { bg: "bg-amber-500",   text: "text-white", light: "bg-amber-100",   border: "border-amber-400" },
  emerald: { bg: "bg-emerald-500", text: "text-white", light: "bg-emerald-100", border: "border-emerald-400" },
  rose:    { bg: "bg-rose-500",    text: "text-white", light: "bg-rose-100",    border: "border-rose-400" },
};
const DEFAULT_COLOR = { bg: "bg-gray-500", text: "text-white", light: "bg-gray-100", border: "border-gray-400" };

function sc(color: string) {
  return STAFF_COLORS[color] ?? DEFAULT_COLOR;
}

const STATUS_DOT: Record<JobStatus, string> = {
  completed: "text-emerald-500",
  in_progress: "text-amber-500",
  upcoming: "text-blue-500",
  cancelled: "text-gray-400",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  completed: "Done",
  in_progress: "Active",
  upcoming: "Upcoming",
  cancelled: "Cancelled",
};

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

type TabView = "calendar" | "tasks" | "map";
type ViewMode = "day" | "week" | "2week" | "month";

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function formatHour(h: number): string {
  if (h === 0) return "12 am";
  if (h < 12) return `${h} am`;
  if (h === 12) return "12 pm";
  return `${h - 12} pm`;
}

function toMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Minutes from midnight → px offset from left of day grid (horizontal) */
function minutesToPxH(mins: number): number {
  return ((mins - START_HOUR * 60) / 60) * HOUR_WIDTH;
}

/** Minutes from midnight → px offset from top (week/2-week views) */
function minutesToPxV(mins: number): number {
  return ((mins - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

function customerName(title: string): string {
  const dash = title.indexOf("–");
  return dash >= 0 ? title.slice(dash + 2).trim() : title;
}

function jobType(title: string): string {
  const dash = title.indexOf("–");
  return dash >= 0 ? title.slice(0, dash).trim() : "";
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function daysFrom(start: Date, count: number): Date[] {
  return Array.from(
    { length: count },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function shortDay(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

/* ═══════════════════════════════════════════════════════════
   MINI CALENDAR
   ═══════════════════════════════════════════════════════════ */

function MiniCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setViewMonth(new Date(year, month - 1, 1));
  const next = () => setViewMonth(new Date(year, month + 1, 1));

  const monthName = viewMonth.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-2 py-1.5">
      <div className="flex items-center justify-between mb-1">
        <button onClick={prev} className="p-0.5 hover:bg-gray-100 rounded-sm cursor-pointer">
          <BsChevronLeft className="w-3 h-3 text-gray-500" />
        </button>
        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
          {monthName}
        </span>
        <button onClick={next} className="p-0.5 hover:bg-gray-100 rounded-sm cursor-pointer">
          <BsChevronRight className="w-3 h-3 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center mb-0.5">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[9px] text-gray-400 font-semibold">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-px">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} className="h-5" />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`h-5 w-5 mx-auto text-[10px] leading-5 rounded-sm cursor-pointer ${
                isSelected
                  ? "bg-blue-500 text-white font-bold"
                  : isToday
                    ? "bg-blue-100 text-blue-700 font-bold"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOW-LINES
   ═══════════════════════════════════════════════════════════ */

/** Vertical red line for horizontal day view */
function NowLineV() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < START_HOUR * 60 || mins > END_HOUR * 60) return null;
  const left = minutesToPxH(mins);

  return (
    <div
      className="absolute top-0 bottom-0 z-20 pointer-events-none"
      style={{ left }}
    >
      <div className="absolute -top-1 -left-[4px] w-2 h-2 rounded-full bg-red-500" />
      <div className="w-px bg-red-500 h-full" />
    </div>
  );
}

/** Horizontal red line for vertical week/2-week views */
function NowLineH() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < START_HOUR * 60 || mins > END_HOUR * 60) return null;
  const top = minutesToPxV(mins);

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top }}
    >
      <div className="absolute -left-1 -top-[4px] w-2 h-2 rounded-full bg-red-500" />
      <div className="h-px bg-red-500 w-full" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function DispatchBoardPage() {
  const { showDemoData } = useDemoData();

  const allStaff: StaffMember[] = showDemoData ? DEMO_STAFF : [];
  const allJobs: ScheduleJob[] = showDemoData ? DEMO_JOBS : [];

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabView>("calendar");
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /* auto-scroll to current time on mount */
  useEffect(() => {
    if (viewMode === "day" && scrollRef.current) {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const target = minutesToPxH(Math.max(mins - 60, START_HOUR * 60));
      scrollRef.current.scrollLeft = target;
    }
  }, [viewMode]);

  /* ── derived ───────────────────────────────────────────── */
  const visibleStaff = useMemo(() => {
    if (selectedStaffIds.size === 0) return allStaff;
    return allStaff.filter((s) => selectedStaffIds.has(s.id));
  }, [allStaff, selectedStaffIds]);

  const visibleJobs = useMemo(() => {
    let jobs = allJobs;
    if (selectedStaffIds.size > 0)
      jobs = jobs.filter((j) => selectedStaffIds.has(j.staff_id));
    return jobs;
  }, [allJobs, selectedStaffIds]);

  const sidebarJobs = useMemo(() => {
    let jobs = allJobs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (j) => j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q),
      );
    }
    return jobs;
  }, [allJobs, searchQuery]);

  const jobsByStaff = useMemo(() => {
    const map = new Map<string, ScheduleJob[]>();
    for (const j of visibleJobs) {
      const arr = map.get(j.staff_id) ?? [];
      arr.push(j);
      map.set(j.staff_id, arr);
    }
    return map;
  }, [visibleJobs]);

  const stats = useMemo(() => {
    const completed = allJobs.filter((j) => j.status === "completed").length;
    const inProgress = allJobs.filter((j) => j.status === "in_progress").length;
    const upcoming = allJobs.filter((j) => j.status === "upcoming").length;
    return { completed, inProgress, upcoming };
  }, [allJobs]);

  /* ── handlers ──────────────────────────────────────────── */
  function toggleStaff(id: string) {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllStaff() {
    setSelectedStaffIds(new Set());
  }

  function navigateDate(dir: -1 | 1) {
    setSelectedDate((d) => {
      const step =
        viewMode === "day" ? 1 : viewMode === "week" ? 7 : viewMode === "2week" ? 14 : 30;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir * step);
    });
  }

  /* ── multi-day columns ─────────────────────────────────── */
  const dayColumns = useMemo(() => {
    if (viewMode === "day") return [];
    const count = viewMode === "week" ? 7 : viewMode === "2week" ? 14 : 35;
    const start =
      viewMode === "month"
        ? (() => {
            const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const dow = first.getDay();
            return new Date(first.getFullYear(), first.getMonth(), first.getDate() - (dow === 0 ? 6 : dow - 1));
          })()
        : startOfWeek(selectedDate);
    return daysFrom(start, count);
  }, [viewMode, selectedDate]);

  const dateLabel = useMemo(() => {
    if (viewMode === "day")
      return selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (viewMode === "month")
      return selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const first = dayColumns[0];
    const last = dayColumns[dayColumns.length - 1];
    if (!first || !last) return "";
    const f = first.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const l = last.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${f} – ${l}`;
  }, [viewMode, selectedDate, dayColumns]);

  const gridWidth = HOURS.length * HOUR_WIDTH;
  const gridHeight = HOURS.length * HOUR_HEIGHT;

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <DemoDataBanner />

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <aside className="w-[220px] h-full bg-[#f9f9f9] border-r border-gray-300 flex flex-col shrink-0">
          <div className="flex items-center gap-4 px-3 h-8 border-b border-gray-300 shrink-0">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Actions</span>
            <span className="text-[11px] text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-600">Queues</span>
          </div>

          <div className="grid grid-cols-2 border-b border-gray-300 shrink-0">
            {[
              { label: "New Job", icon: <BsPlusCircleFill className="w-5 h-5 text-blue-500" /> },
              { label: "New Recurring", icon: <BsArrowRepeat className="w-5 h-5 text-blue-500" /> },
              { label: "New Quote", icon: <BsFileEarmarkText className="w-5 h-5 text-blue-500" /> },
              { label: "New Customer", icon: <BsPersonPlus className="w-5 h-5 text-blue-500" /> },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center py-3 px-1 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-100">
                {item.icon}
                <span className="text-[10px] text-gray-600 text-center leading-tight mt-1">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-white border-b border-gray-300 shrink-0">
            <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Staff ({allStaff.length})</span>
              {selectedStaffIds.size > 0 && (
                <button onClick={selectAllStaff} className="text-[9px] text-blue-600 font-semibold cursor-pointer hover:text-blue-800">Show All</button>
              )}
            </div>
            {allStaff.length === 0 && (
              <div className="px-3 py-4 text-[10px] text-gray-400 text-center">Enable demo data to see staff.</div>
            )}
            {allStaff.map((s) => {
              const isSelected = selectedStaffIds.size === 0 || selectedStaffIds.has(s.id);
              const c = sc(s.color);
              const staffJobs = allJobs.filter((j) => j.staff_id === s.id).length;
              return (
                <div
                  key={s.id}
                  onClick={() => toggleStaff(s.id)}
                  className={`flex items-center gap-2 px-3 py-1 cursor-pointer border-l-2 ${
                    isSelected ? "border-l-blue-500 bg-white hover:bg-blue-50" : "border-l-transparent hover:bg-gray-100 opacity-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-sm shrink-0 ${c.bg}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-gray-700 truncate block">{s.name}</span>
                    <span className="text-[9px] text-gray-400">{s.role} · {staffJobs} job{staffJobs !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER ───────────────────────────────────── */}
        <main className="flex-1 h-full flex flex-col bg-white overflow-hidden">
          {/* DATE BAR + VIEW MODES */}
          <div className="h-8 w-full bg-gray-50 border-b border-gray-300 flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate(-1)} className="p-0.5 hover:bg-gray-200 rounded-sm cursor-pointer">
                <BsChevronLeft className="w-3 h-3 text-gray-500" />
              </button>
              <span className="text-[11px] font-bold text-gray-700 min-w-[180px] text-center">{dateLabel}</span>
              <button onClick={() => navigateDate(1)} className="p-0.5 hover:bg-gray-200 rounded-sm cursor-pointer">
                <BsChevronRight className="w-3 h-3 text-gray-500" />
              </button>
              <button onClick={() => setSelectedDate(new Date())} className="text-[10px] text-blue-600 font-bold cursor-pointer hover:text-blue-800 ml-1">Today</button>
            </div>

            <div className="flex items-center gap-px bg-gray-200 rounded-sm p-px">
              {([
                { key: "day", label: "Day" },
                { key: "week", label: "Week" },
                { key: "2week", label: "2 Weeks" },
                { key: "month", label: "Month" },
              ] as { key: ViewMode; label: string }[]).map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-sm cursor-pointer ${
                    viewMode === v.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {showDemoData && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-gray-500"><BsCheckCircleFill className="inline w-2.5 h-2.5 text-emerald-500 mr-0.5" />{stats.completed} done</span>
                <span className="text-gray-500"><BsCircleFill className="inline w-2.5 h-2.5 text-amber-500 mr-0.5" />{stats.inProgress} active</span>
                <span className="text-gray-500"><BsCircleFill className="inline w-2.5 h-2.5 text-blue-500 mr-0.5" />{stats.upcoming} upcoming</span>
              </div>
            )}
          </div>

          {/* TAB RIBBON */}
          <div className="h-8 w-full bg-[#f0f0f0] border-b border-gray-300 flex items-end px-2 shrink-0">
            {([
              { key: "calendar" as TabView, label: "Calendar", icon: <BsCalendar3 className="w-3 h-3" /> },
              { key: "tasks" as TabView, label: "Tasks", icon: <BsListCheck className="w-3 h-3" /> },
              { key: "map" as TabView, label: "Dispatch Map", icon: <BsMap className="w-3 h-3" /> },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-white border-t border-l border-r border-gray-300 rounded-t-sm px-3 py-1 text-[11px] text-gray-800 font-semibold -mb-px cursor-pointer"
                    : "px-3 py-1 text-[11px] text-gray-500 cursor-pointer hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB CONTENT ═══════════════════════════════ */}
          {activeTab === "calendar" ? (
            viewMode === "day" ? (
              /* ──────────────────────────────────────────────
                 DAY VIEW — Staff rows left, time columns top
                 ────────────────────────────────────────────── */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header row: corner + hour columns */}
                <div className="flex border-b border-gray-300 bg-gray-50 shrink-0">
                  {/* Corner cell */}
                  <div
                    className="flex items-center justify-center border-r border-gray-300 bg-gray-50 shrink-0"
                    style={{ width: STAFF_COL_WIDTH, height: 28 }}
                  >
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Staff</span>
                  </div>
                  {/* Hour column headers (scroll-synced) */}
                  <div className="flex-1 overflow-hidden" id="hour-header">
                    <div className="flex" style={{ width: gridWidth }}>
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          className="border-r border-gray-200 flex items-center justify-center"
                          style={{ width: HOUR_WIDTH, height: 28 }}
                        >
                          <span className="text-[10px] text-gray-500 font-semibold">{formatHour(h)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body: staff labels (fixed) + scrollable grid */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Staff row labels (fixed left, syncs vertical scroll) */}
                  <div
                    className="shrink-0 border-r border-gray-300 bg-[#fafafa] overflow-hidden"
                    style={{ width: STAFF_COL_WIDTH }}
                  >
                    <div className="h-full overflow-y-auto no-scrollbar" id="staff-gutter">
                      {visibleStaff.map((s) => {
                        const c = sc(s.color);
                        return (
                          <div
                            key={s.id}
                            className="flex items-center gap-1.5 px-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                            style={{ height: ROW_HEIGHT }}
                            onClick={() => toggleStaff(s.id)}
                          >
                            <div className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center shrink-0`}>
                              <span className="text-[9px] font-bold text-white leading-none">{s.avatarInitials}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] text-gray-700 font-medium truncate w-[72px]">{s.name.split(" ")[0]}</div>
                              <div className="text-[9px] text-gray-400 truncate w-[72px]">{s.role}</div>
                            </div>
                          </div>
                        );
                      })}
                      {visibleStaff.length === 0 && (
                        <div className="flex items-center justify-center text-[10px] text-gray-400" style={{ height: ROW_HEIGHT }}>
                          No staff
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scrollable grid area */}
                  <div
                    className="flex-1 overflow-auto"
                    ref={scrollRef}
                    onScroll={(e) => {
                      const el = e.target as HTMLElement;
                      const sg = document.getElementById("staff-gutter");
                      const hh = document.getElementById("hour-header");
                      if (sg) sg.scrollTop = el.scrollTop;
                      if (hh) hh.scrollLeft = el.scrollLeft;
                    }}
                  >
                    <div className="relative" style={{ width: gridWidth, height: visibleStaff.length * ROW_HEIGHT || ROW_HEIGHT * 3 }}>
                      {/* Staff rows */}
                      {visibleStaff.map((staff, si) => {
                        const c = sc(staff.color);
                        const jobs = jobsByStaff.get(staff.id) ?? [];
                        const rowTop = si * ROW_HEIGHT;
                        return (
                          <div
                            key={staff.id}
                            className="absolute left-0 border-b border-gray-100"
                            style={{ top: rowTop, height: ROW_HEIGHT, width: gridWidth }}
                          >
                            {/* Hour gridlines (vertical) */}
                            {HOURS.map((h) => (
                              <div
                                key={h}
                                className="absolute top-0 bottom-0 border-r border-gray-100"
                                style={{ left: (h - START_HOUR) * HOUR_WIDTH }}
                              />
                            ))}

                            {/* Job blocks (horizontal) */}
                            {jobs.map((job) => {
                              const startMins = toMinutes(job.start_time);
                              const endMins = toMinutes(job.end_time);
                              const left = minutesToPxH(startMins);
                              const width = Math.max(minutesToPxH(endMins) - left, 50);
                              const startStr = new Date(job.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                              const endStr = new Date(job.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

                              return (
                                <div
                                  key={job.id}
                                  className={`absolute top-1 bottom-1 rounded-sm border-t-[3px] ${c.border} ${c.light} overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10`}
                                  style={{ left, width }}
                                  title={`${job.title}\n${job.location}\n${startStr}–${endStr}`}
                                >
                                  <div className="px-1.5 py-0.5 h-full flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-gray-800 truncate">{customerName(job.title)}</p>
                                    <div className="flex items-center gap-1">
                                      <BsClock className="w-2 h-2 text-gray-400 shrink-0" />
                                      <span className="text-[9px] text-gray-500">{startStr}–{endStr}</span>
                                      <BsCircleFill className={`w-1.5 h-1.5 ml-1 ${STATUS_DOT[job.status]}`} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Now line (vertical) */}
                      <NowLineV />

                      {/* Empty state */}
                      {visibleStaff.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-[11px] text-gray-400">No staff data. Enable demo data toggle.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : viewMode === "month" ? (
              /* ──────────────────────────────────────────────
                 MONTH VIEW — Standard calendar grid
                 ────────────────────────────────────────────── */
              <div className="flex-1 flex flex-col overflow-auto">
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-50 shrink-0">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="py-1 text-center border-r border-gray-200">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                <div className="flex-1">
                  {Array.from({ length: Math.ceil(dayColumns.length / 7) }, (_, wi) => {
                    const weekDays = dayColumns.slice(wi * 7, wi * 7 + 7);
                    return (
                      <div key={wi} className="grid grid-cols-7 border-b border-gray-200" style={{ minHeight: 80 }}>
                        {weekDays.map((day, di) => {
                          const isToday = isSameDay(day, new Date());
                          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          const dayJobs = visibleJobs.filter((j) => isSameDay(new Date(j.start_time), day));
                          return (
                            <div
                              key={di}
                              className={`border-r border-gray-200 p-1 ${isToday ? "bg-blue-50/40" : isWeekend ? "bg-gray-50/50" : ""}`}
                            >
                              <span className={`text-[10px] font-semibold ${isToday ? "text-blue-600" : isCurrentMonth ? "text-gray-600" : "text-gray-300"}`}>
                                {day.getDate()}
                              </span>
                              <div className="mt-0.5 space-y-px">
                                {dayJobs.slice(0, 3).map((job) => {
                                  const staff = allStaff.find((s) => s.id === job.staff_id);
                                  const c = staff ? sc(staff.color) : DEFAULT_COLOR;
                                  return (
                                    <div
                                      key={job.id}
                                      className={`rounded-sm ${c.light} border-l-2 ${c.border} px-1 cursor-pointer hover:shadow-sm`}
                                      title={`${job.title}\n${job.location}`}
                                    >
                                      <span className="text-[8px] text-gray-600 truncate block">{customerName(job.title)}</span>
                                    </div>
                                  );
                                })}
                                {dayJobs.length > 3 && (
                                  <span className="text-[8px] text-gray-400 pl-1">+{dayJobs.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ──────────────────────────────────────────────
                 WEEK / 2-WEEK VIEW — Day columns, time rows,
                 staff colour-coded blocks
                 ────────────────────────────────────────────── */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Day column headers */}
                <div className="flex border-b border-gray-300 bg-gray-50 shrink-0">
                  <div className="flex items-center justify-center border-r border-gray-300 bg-gray-50 shrink-0" style={{ width: TIME_COL_WIDTH, height: 28 }}>
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Time</span>
                  </div>
                  <div className="flex flex-1">
                    {dayColumns.map((d, i) => {
                      const isToday = isSameDay(d, new Date());
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={`flex-1 flex items-center justify-center border-r border-gray-200 py-1 ${isToday ? "bg-blue-50" : isWeekend ? "bg-gray-100/60" : ""}`}
                          style={{ minWidth: viewMode === "week" ? 100 : 60 }}
                        >
                          <span className={`text-[10px] font-semibold ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                            {shortDay(d)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable grid */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Time gutter */}
                  <div className="shrink-0 border-r border-gray-300 bg-[#f9f9f9] overflow-hidden" style={{ width: TIME_COL_WIDTH }}>
                    <div className="h-full overflow-y-auto no-scrollbar" id="week-time-gutter">
                      <div style={{ height: gridHeight }}>
                        {HOURS.map((h) => (
                          <div key={h} className="flex items-start justify-end pr-1.5 pt-0.5 border-b border-gray-200" style={{ height: HOUR_HEIGHT }}>
                            <span className="text-[10px] text-gray-400 leading-none">{formatHour(h)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Day columns */}
                  <div className="flex-1 overflow-auto" onScroll={(e) => {
                    const el = document.getElementById("week-time-gutter");
                    if (el) el.scrollTop = (e.target as HTMLElement).scrollTop;
                  }}>
                    <div className="flex" style={{ height: gridHeight }}>
                      {dayColumns.map((day, di) => {
                        const isToday = isSameDay(day, new Date());
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const dayJobs = visibleJobs.filter((j) => isSameDay(new Date(j.start_time), day));
                        return (
                          <div
                            key={di}
                            className={`flex-1 relative border-r border-gray-200 ${isToday ? "bg-blue-50/20" : isWeekend ? "bg-gray-50/30" : ""}`}
                            style={{ minWidth: viewMode === "week" ? 100 : 60 }}
                          >
                            {/* Hour gridlines */}
                            {HOURS.map((h) => (
                              <div key={h} className="absolute left-0 right-0 border-b border-gray-100" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
                            ))}

                            {/* Job blocks */}
                            {dayJobs.map((job) => {
                              const staff = allStaff.find((s) => s.id === job.staff_id);
                              const c = staff ? sc(staff.color) : DEFAULT_COLOR;
                              const startMins = toMinutes(job.start_time);
                              const endMins = toMinutes(job.end_time);
                              const top = minutesToPxV(startMins);
                              const height = Math.max(minutesToPxV(endMins) - top, 20);
                              const startStr = new Date(job.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

                              return (
                                <div
                                  key={job.id}
                                  className={`absolute left-0.5 right-0.5 rounded-sm border-l-[3px] ${c.border} ${c.light} overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10`}
                                  style={{ top, height }}
                                  title={`${job.title}\n${staff?.name ?? ""}\n${job.location}`}
                                >
                                  <div className="px-1 py-px h-full">
                                    <p className="text-[9px] font-bold text-gray-800 truncate">{customerName(job.title)}</p>
                                    {viewMode === "week" && (
                                      <p className="text-[8px] text-gray-500">{startStr}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {isToday && <NowLineH />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : activeTab === "tasks" ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <BsListCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[11px] text-gray-500">Task list view — coming soon.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <BsMap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[11px] text-gray-500">Dispatch map view — coming soon.</p>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR – Jobs Queue ───────────────── */}
        <aside className="w-[300px] h-full bg-white border-l border-gray-300 flex flex-col shrink-0">
          <div className="h-8 bg-[#f0f0f0] border-b border-gray-300 flex items-center justify-between px-2 shrink-0">
            <span className="text-xs font-bold text-gray-700">Jobs ({sidebarJobs.length})</span>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
              <span><BsCheckCircleFill className="inline w-2 h-2 text-emerald-500" /> {allJobs.filter((j) => j.status === "completed").length}</span>
              <span><BsCircleFill className="inline w-2 h-2 text-amber-500" /> {allJobs.filter((j) => j.status === "in_progress").length}</span>
              <span><BsCircleFill className="inline w-2 h-2 text-blue-500" /> {allJobs.filter((j) => j.status === "upcoming").length}</span>
            </div>
          </div>

          <div className="px-2 shrink-0 relative">
            <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-sm pl-6 pr-2 py-1 my-2 text-[11px] text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400"
              placeholder="Search jobs…"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarJobs.length === 0 ? (
              <div className="px-3 py-6 text-center text-[10px] text-gray-400">
                {showDemoData ? "No matching jobs." : "Enable demo data to see jobs."}
              </div>
            ) : (
              sidebarJobs.map((job) => {
                const staff = allStaff.find((s) => s.id === job.staff_id);
                const c = staff ? sc(staff.color) : DEFAULT_COLOR;
                const startStr = new Date(job.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                const endStr = new Date(job.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={job.id} className="flex items-stretch px-2 py-1.5 border-b border-gray-100 cursor-pointer hover:bg-blue-50">
                    <div className={`w-[3px] rounded-full shrink-0 mr-2 ${c.bg}`} />
                    <div className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center shrink-0 mr-2 mt-0.5`}>
                      <span className="text-[10px] font-bold text-white leading-none">{customerName(job.title)[0]}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-gray-800 truncate">{customerName(job.title)}</span>
                      <span className="text-[10px] text-gray-500 truncate">{job.location}</span>
                      <div className="flex items-center gap-2 mt-px">
                        <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><BsClock className="w-2 h-2" />{startStr}–{endStr}</span>
                        <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><BsCircleFill className={`w-1.5 h-1.5 ${STATUS_DOT[job.status]}`} />{STATUS_LABEL[job.status]}</span>
                      </div>
                      {staff && <span className="text-[9px] text-gray-400 truncate">↳ {staff.name}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
