"use client";

/**
 * RecentActivity - recent job completions / events.
 * Real data from API.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
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

export default function RecentActivity() {
  const { can, user } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const canViewAll = can("viewAllJobs");

  // Fetch real activity
  useEffect(() => {
    // TODO: Replace with real API endpoint when activity log table exists
    setActivity([]);
  }, []);

  const items = canViewAll
    ? activity
    : activity.filter(
        (a) => a.actor === `${user?.firstName} ${user?.lastName}` || a.actor === "System",
      );

  return (
    <div className="bg-white">
      <div className="border-b border-gray-300 px-2 py-1 bg-gray-50">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          Recent Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="px-2 py-4 text-center text-xs text-gray-400">
          No recent activity.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 px-2 py-1 hover:bg-gray-50">
              <span className="mt-0.5 shrink-0 text-gray-400">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-700 leading-tight">{item.text}</p>
                <p className="text-[10px] text-gray-400">
                  {item.time}
                  {canViewAll && item.actor !== "System" && (
                    <> · <span className="font-medium text-gray-500">{item.actor}</span></>
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
