"use client";

/**
 * Schedule Page - Norfolk Cleaners
 * ────────────────────────────────
 * Hosts the Dispatch Board (Gantt timeline) and Calendar Day View.
 * Users toggle between them with a tabbed control.
 *
 * Uses demo data when the dev banner is active, otherwise fetches
 * from the API (once the schedule API exists).
 */

import { useState, useMemo } from "react";
import Container from "@/components/Container";
import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import DemoDataBanner from "@/components/dashboard/DemoDataBanner";
import DispatchBoard from "@/components/schedule/DispatchBoard";
import CalendarDayView from "@/components/schedule/CalendarDayView";
import {
  BsGrid3X3Gap,
  BsCalendar3,
  BsFunnel,
  BsXLg,
} from "react-icons/bs";
import type { ScheduleJob, StaffMember } from "@/types/schedule";
import { DEMO_JOBS, DEMO_STAFF } from "@/types/schedule";

// ── View modes ──────────────────────────────────────────────

type ViewMode = "dispatch" | "day";

// ── Page Component ──────────────────────────────────────────

export default function SchedulePage() {
  const { user, loading } = useAuth();
  const { showDemoData } = useDemoData();
  const [view, setView] = useState<ViewMode>("dispatch");
  const [selectedStaff, setSelectedStaff] = useState<string | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Data sources
  const allJobs: ScheduleJob[] = showDemoData ? DEMO_JOBS : [];
  const allStaff: StaffMember[] = showDemoData ? DEMO_STAFF : [];

  // Filter jobs + staff
  const filteredJobs = useMemo(() => {
    if (selectedStaff === "all") return allJobs;
    return allJobs.filter((j) => j.staff_id === selectedStaff);
  }, [allJobs, selectedStaff]);

  const filteredStaff = useMemo(() => {
    if (selectedStaff === "all") return allStaff;
    return allStaff.filter((s) => s.id === selectedStaff);
  }, [allStaff, selectedStaff]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredJobs.length;
    const completed = filteredJobs.filter((j) => j.status === "completed").length;
    const inProgress = filteredJobs.filter((j) => j.status === "in_progress").length;
    const upcoming = filteredJobs.filter((j) => j.status === "upcoming").length;
    return { total, completed, inProgress, upcoming };
  }, [filteredJobs]);

  // Loading state
  if (loading || !user) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
        <Container>
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-600" />
              <span className="text-sm">Loading schedule…</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <Container>
        {/* Dev Banner */}
        <div className="pt-6 pb-2">
          <DemoDataBanner />
        </div>

        {/* Page Header */}
        <div className="mb-6 mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and visualise today&apos;s job assignments
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Staff Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedStaff !== "all"
                    ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <BsFunnel className="h-3.5 w-3.5" />
                {selectedStaff === "all"
                  ? "All Staff"
                  : allStaff.find((s) => s.id === selectedStaff)?.name ?? "Staff"}
                {selectedStaff !== "all" && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedStaff("all"); setFilterOpen(false); }}
                    className="ml-1 rounded-full p-0.5 text-cyan-500 hover:bg-cyan-100"
                  >
                    <BsXLg className="h-2.5 w-2.5" />
                  </button>
                )}
              </button>

              {/* Dropdown */}
              {filterOpen && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedStaff("all"); setFilterOpen(false); }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        selectedStaff === "all" ? "bg-cyan-50 font-medium text-cyan-700" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      All Staff
                    </button>
                    {allStaff.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => { setSelectedStaff(member.id); setFilterOpen(false); }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                          selectedStaff === member.id ? "bg-cyan-50 font-medium text-cyan-700" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {member.avatarInitials}
                        </span>
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("dispatch")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  view === "dispatch"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BsGrid3X3Gap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => setView("day")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  view === "day"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BsCalendar3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Day</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-600">
            {stats.total} jobs
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {stats.completed} completed
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {stats.inProgress} in progress
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[12px] font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            {stats.upcoming} upcoming
          </span>
        </div>

        {/* Empty state (no data & no demo) */}
        {!showDemoData && allJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-8 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
              <BsCalendar3 className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-800">
              No schedule data yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Jobs will appear here once created. Toggle demo data to preview the layout.
            </p>
          </div>
        ) : (
          <>
            {/* Dispatch Board */}
            {view === "dispatch" && (
              <DispatchBoard
                jobs={filteredJobs}
                staff={filteredStaff}
              />
            )}

            {/* Calendar Day View */}
            {view === "day" && (
              <CalendarDayView
                jobs={filteredJobs}
                staff={allStaff}
              />
            )}
          </>
        )}
      </Container>
    </section>
  );
}
