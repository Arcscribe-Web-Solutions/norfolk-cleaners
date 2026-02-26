"use client";

/**
 * Dashboard Page - Norfolk Cleaners
 * ──────────────────────────────────
 * Dense, legacy-style UI. Full viewport, tight borders, no whitespace.
 * Role-aware layout that adapts visible sections based on permissions.
 */

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import RoleGate from "@/components/RoleGate";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import StaffOverview from "@/components/dashboard/StaffOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import DemoDataBanner, { useDemoData } from "@/components/dashboard/DemoDataBanner";

export default function DashboardPage() {
  const { user, loading, can, roleDef } = useAuth();
  const { showDemoData } = useDemoData();

  // While auth is loading, show minimal skeleton
  if (loading || !user || !roleDef) {
    return (
      <div className="h-screen flex items-center justify-center text-xs text-gray-400 bg-white">
        Loading dashboard…
      </div>
    );
  }

  return (
    <section className="h-screen flex flex-col text-xs bg-white overflow-hidden">
      {/* Dev banner - compact */}
      <DemoDataBanner />

      {/* Thin status bar */}
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-0.5 bg-gray-100 shrink-0">
        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
          Dashboard
        </span>
        <span className="text-[10px] text-gray-500">
          {user.firstName} {user.lastName} &middot; {roleDef.label}
        </span>
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-[2fr_1fr] border-t border-gray-300 overflow-hidden">
        {/* Left column: schedule + activity */}
        <div className="border-r border-gray-300 flex flex-col overflow-hidden">
          <TodaySchedule />
          <div className="border-t border-gray-300 shrink-0 max-h-[35%] overflow-y-auto">
            <RecentActivity />
          </div>
        </div>

        {/* Right column: actions, financials, staff */}
        <div className="flex flex-col overflow-y-auto">
          <QuickActions />

          <RoleGate permission="viewJobProfitability">
            <div className="border-t border-gray-300">
              <FinancialOverview />
            </div>
          </RoleGate>

          <RoleGate permission="viewStaffList">
            <div className="border-t border-gray-300">
              <StaffOverview />
            </div>
          </RoleGate>

          {/* Restricted role info */}
          {!can("viewAllJobs") && (
            <div className="border-t border-gray-300 px-2 py-1">
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">
                Your Access
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Filtered view — <strong>{roleDef.label}</strong> role.
              </p>
              <ul className="mt-1 space-y-0.5">
                {(
                  [
                    ["View own jobs", can("viewOwnJobs")],
                    ["View all jobs", can("viewAllJobs")],
                    ["Create quotes", can("createQuotes")],
                    ["Create invoices", can("createInvoices")],
                    ["View pricing", can("viewSalePricing")],
                  ] as const
                ).map(([label, allowed]) => (
                  <li key={label} className="flex items-center gap-1 text-[10px]">
                    <span className={allowed ? "text-green-600" : "text-gray-400"}>
                      {allowed ? "✓" : "–"}
                    </span>
                    <span className={allowed ? "text-gray-700" : "text-gray-400"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
