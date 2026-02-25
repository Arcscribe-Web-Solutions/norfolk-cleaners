"use client";

/**
 * Dashboard Page - Norfolk Cleaners
 * ──────────────────────────────────
 * Role-aware dashboard that adapts its layout and visible sections
 * based on the authenticated user's permissions.
 *
 * - Real data is fetched from /api/dashboard/stats.
 * - When in development mode, a banner allows toggling demo data.
 * - In production, demo data is never shown.
 */

import { useEffect, useState, useMemo } from "react";
import Container from "@/components/Container";
import { useAuth } from "@/lib/auth";
import RoleGate from "@/components/RoleGate";
import StatCard from "@/components/dashboard/StatCard";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import StaffOverview from "@/components/dashboard/StaffOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import DemoDataBanner, { useDemoData } from "@/components/dashboard/DemoDataBanner";
import {
  BsBriefcase,
  BsPeople,
  BsFileEarmarkText,
  BsCurrencyPound,
  BsCalendar3,
  BsStarFill,
} from "react-icons/bs";

// ── Demo stat data (only shown when dev banner is toggled on) ─

const DEMO_STATS = {
  jobsToday: 5,
  jobsThisWeek: 23,
  totalCustomers: 148,
  pendingQuotes: 4,
  monthlyRevenue: 12_480,
  avgRating: 4.8,
  myJobsToday: 3,
  myJobsThisWeek: 14,
};

interface DashboardStats {
  jobsToday?: number;
  jobsThisWeek?: number;
  totalCustomers?: number;
  pendingQuotes?: number;
  monthlyRevenue?: number;
  avgRating?: number;
  myJobsToday?: number;
  myJobsThisWeek?: number;
}

// ── Skeleton Pulse Component ─

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200/60 ${className}`} />
  );
}

export default function DashboardPage() {
  const { user, loading, can, roleDef } = useAuth();
  const { showDemoData } = useDemoData();
  const [stats, setStats] = useState<DashboardStats>({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real stats from the API
  useEffect(() => {
    if (showDemoData || !user) return;
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      try {
        const res = await fetch("/api/dashboard/stats", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setStats(data.stats ?? {});
        }
      } catch {
        // API may not have tables yet - that's fine
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [showDemoData, user]);

  // Memoize greeting to avoid unnecessary re-computations
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  // While auth is loading, show skeleton
  if (loading || !user || !roleDef) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
        <Container>
          <div className="pt-8 pb-6">
            <SkeletonPulse className="h-10 w-48" />
          </div>
          <div className="mb-8 rounded-2xl bg-slate-100/80 p-8">
            <SkeletonPulse className="h-7 w-64" />
            <SkeletonPulse className="mt-3 h-5 w-32" />
          </div>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="flex justify-between">
                  <SkeletonPulse className="h-4 w-20" />
                  <SkeletonPulse className="h-10 w-10 rounded-xl" />
                </div>
                <SkeletonPulse className="mt-4 h-8 w-16" />
                <SkeletonPulse className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded-2xl border border-slate-200/60 bg-white p-5">
                <SkeletonPulse className="h-5 w-40" />
                <div className="mt-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonPulse key={i} className="h-14 w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 rounded-2xl border border-slate-200/60 bg-white p-5">
                <SkeletonPulse className="h-5 w-32" />
                <div className="mt-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonPulse key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const s = showDemoData ? DEMO_STATS : stats;

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <Container>
        {/* ── Dev Banner (only in development) ────────────── */}
        <div className="pt-6 pb-2">
          <DemoDataBanner />
        </div>

        {/* ── Welcome Banner ──────────────────────────────── */}
        <div className="mb-8 mt-2 overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-700 p-6 text-white shadow-lg shadow-cyan-600/15 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {greeting}, {user.firstName}
              </h1>
              <p className="mt-1.5 text-cyan-100/80 text-sm">
                Here&apos;s what&apos;s happening with your business today.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm ring-1 ring-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              {roleDef.label}
            </span>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* All roles: jobs today (own or all) */}
          <StatCard
            label={can("viewAllJobs") ? "Jobs Today" : "My Jobs Today"}
            value={
              statsLoading && !showDemoData
                ? "–"
                : can("viewAllJobs")
                  ? s.jobsToday ?? 0
                  : s.myJobsToday ?? 0
            }
            icon={<BsBriefcase className="h-5 w-5" />}
            accent="cyan"
            trend={
              (can("viewAllJobs") ? s.jobsThisWeek : s.myJobsThisWeek) !== undefined
                ? {
                    value: `${can("viewAllJobs") ? s.jobsThisWeek : s.myJobsThisWeek} this week`,
                    positive: true,
                  }
                : undefined
            }
          />

          {/* Roles that can see all clients */}
          {can("viewAllClients") && (
            <StatCard
              label="Customers"
              value={statsLoading && !showDemoData ? "–" : s.totalCustomers ?? 0}
              icon={<BsPeople className="h-5 w-5" />}
              accent="violet"
            />
          )}

          {/* Roles that can see quotes */}
          {can("viewQuotes") && (
            <StatCard
              label="Pending Quotes"
              value={statsLoading && !showDemoData ? "–" : s.pendingQuotes ?? 0}
              icon={<BsFileEarmarkText className="h-5 w-5" />}
              accent="amber"
            />
          )}

          {/* Roles that can see financials */}
          {can("viewJobProfitability") && (
            <StatCard
              label="Monthly Revenue"
              value={
                statsLoading && !showDemoData
                  ? "–"
                  : `£${(s.monthlyRevenue ?? 0).toLocaleString()}`
              }
              icon={<BsCurrencyPound className="h-5 w-5" />}
              accent="emerald"
            />
          )}

          {/* Fallback stats for restricted roles */}
          {!can("viewQuotes") && !can("viewJobProfitability") && (
            <>
              <StatCard
                label="This Week"
                value={
                  statsLoading && !showDemoData
                    ? "–"
                    : can("viewAllJobs")
                      ? s.jobsThisWeek ?? 0
                      : s.myJobsThisWeek ?? 0
                }
                icon={<BsCalendar3 className="h-5 w-5" />}
                accent="amber"
              />
              <StatCard
                label="Avg Rating"
                value={statsLoading && !showDemoData ? "–" : s.avgRating ?? 0}
                icon={<BsStarFill className="h-5 w-5" />}
                accent="emerald"
              />
            </>
          )}
        </div>

        {/* ── Main Grid ───────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - always visible */}
          <div className="space-y-6 lg:col-span-2">
            <TodaySchedule />
            <RecentActivity />
          </div>

          {/* Right column - contextual panels */}
          <div className="space-y-6">
            <QuickActions />

            <RoleGate permission="viewJobProfitability">
              <FinancialOverview />
            </RoleGate>

            <RoleGate permission="viewStaffList">
              <StaffOverview />
            </RoleGate>

            {/* Restricted role info panel */}
            {!can("viewAllJobs") && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">
                  Your Access
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  You&apos;re viewing a filtered dashboard based on your{" "}
                  <strong className="text-slate-700">{roleDef.label}</strong> role.
                  Only jobs and data assigned directly to you are shown.
                </p>
                <ul className="mt-3 space-y-2">
                  {(
                    [
                      ["View own jobs", can("viewOwnJobs")],
                      ["View all jobs", can("viewAllJobs")],
                      ["Create quotes", can("createQuotes")],
                      ["Create invoices", can("createInvoices")],
                      ["View pricing", can("viewSalePricing")],
                      ["View attachments", can("viewAttachments")],
                    ] as const
                  ).map(([label, allowed]) => (
                    <li key={label} className="flex items-center gap-2.5 text-xs">
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                          allowed
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {allowed ? "✓" : "–"}
                      </span>
                      <span className={allowed ? "font-medium text-slate-700" : "text-slate-400"}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
