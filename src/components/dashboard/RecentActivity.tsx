"use client";

/**
 * RecentActivity - recent job completions / events.
 * Real data from API. Demo data shown when dev toggle is active.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import {
  BsCheckCircle,
  BsFileEarmarkPlus,
  BsPersonPlus,
  BsCurrencyPound,
  BsClock,
  BsActivity,
} from "react-icons/bs";
import type { ReactNode } from "react";

interface ActivityItem {
  id: string;
  icon: ReactNode;
  iconBg: string;
  text: string;
  time: string;
  actor: string;
}

// Demo data - only shown when dev toggle is active
const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    icon: <BsCheckCircle className="h-4 w-4 text-emerald-600" />,
    iconBg: "bg-emerald-50",
    text: "Job #1042 completed - Mrs. Patterson, Regular Clean",
    time: "35 min ago",
    actor: "Harvey Washington",
  },
  {
    id: "a2",
    icon: <BsCurrencyPound className="h-4 w-4 text-cyan-600" />,
    iconBg: "bg-cyan-50",
    text: "Invoice #INV-298 paid - £185.00",
    time: "1 hr ago",
    actor: "System",
  },
  {
    id: "a3",
    icon: <BsFileEarmarkPlus className="h-4 w-4 text-blue-600" />,
    iconBg: "bg-blue-50",
    text: "New quote #Q-074 sent to Blyth & Sons Ltd",
    time: "2 hr ago",
    actor: "Sarah Mitchell",
  },
  {
    id: "a4",
    icon: <BsPersonPlus className="h-4 w-4 text-violet-600" />,
    iconBg: "bg-violet-50",
    text: "New customer added - The Rose & Crown",
    time: "3 hr ago",
    actor: "James Cole",
  },
  {
    id: "a5",
    icon: <BsClock className="h-4 w-4 text-amber-600" />,
    iconBg: "bg-amber-50",
    text: "Job #1039 rescheduled to tomorrow 10:00",
    time: "4 hr ago",
    actor: "Harvey Washington",
  },
];

export default function RecentActivity() {
  const { can, user } = useAuth();
  const { showDemoData } = useDemoData();
  const [realActivity, setRealActivity] = useState<ActivityItem[]>([]);
  const canViewAll = can("viewAllJobs");

  // Fetch real activity
  useEffect(() => {
    if (showDemoData) return;
    // TODO: Replace with real API endpoint when activity log table exists
    setRealActivity([]);
  }, [showDemoData]);

  const allItems = showDemoData ? DEMO_ACTIVITY : realActivity;

  const items = canViewAll
    ? allItems
    : allItems.filter(
        (a) => a.actor === `${user?.firstName} ${user?.lastName}` || a.actor === "System",
      );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <BsActivity className="h-6 w-6 text-slate-300" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No recent activity.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Actions and events will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100/80">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-slate-50/50">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {item.time}
                  {canViewAll && item.actor !== "System" && (
                    <> · <span className="font-medium text-slate-500">{item.actor}</span></>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
