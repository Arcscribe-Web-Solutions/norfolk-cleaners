"use client";

/**
 * StaffOverview - team status at a glance.
 * Only visible to roles with viewStaffList permission.
 * Real data from API. Demo data shown when dev toggle is active.
 */

import { useEffect, useState } from "react";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import { BsPersonFill, BsCircleFill, BsPeople } from "react-icons/bs";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: "active" | "on_job" | "off_today";
  currentJob?: string;
}

// Demo data - only shown when dev toggle is active
const DEMO_STAFF: StaffMember[] = [
  { id: "s1", name: "Harvey Washington", role: "Owner", status: "on_job", currentJob: "Dr. Okonkwo - Deep Clean" },
  { id: "s2", name: "Sarah Mitchell", role: "Staff", status: "active" },
  { id: "s3", name: "James Cole", role: "Staff", status: "active" },
  { id: "s4", name: "Priya Patel", role: "Staff (No Pricing)", status: "off_today" },
  { id: "s5", name: "Tom Barker", role: "Contractor", status: "on_job", currentJob: "Blyth & Sons - Commercial" },
];

const statusStyle = {
  active: { dot: "text-emerald-500", label: "Available", bg: "bg-emerald-50", text: "text-emerald-700" },
  on_job: { dot: "text-amber-500", label: "On Job", bg: "bg-amber-50", text: "text-amber-700" },
  off_today: { dot: "text-slate-300", label: "Off Today", bg: "bg-slate-50", text: "text-slate-500" },
};

export default function StaffOverview() {
  const { showDemoData } = useDemoData();
  const [realStaff, setRealStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (showDemoData) return;
    // TODO: Replace with real API endpoint for staff status
    setRealStaff([]);
  }, [showDemoData]);

  const staff = showDemoData ? DEMO_STAFF : realStaff;

  if (!showDemoData && staff.length === 0) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Team</h2>
        </div>
        <div className="px-2 py-4 text-center text-xs text-gray-400">
          No team data available yet.
        </div>
      </div>
    );
  }

  const active = staff.filter((s) => s.status !== "off_today").length;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Team</h2>
        <span className="text-[10px] font-semibold text-gray-500">
          {active} active
        </span>
      </div>

      <ul className="divide-y divide-gray-200">
        {staff.map((member) => {
          const s = statusStyle[member.status];
          return (
            <li key={member.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50">
              <BsPersonFill className="h-3 w-3 text-gray-400 shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-900 truncate">
                  {member.name}
                </p>
                <p className="text-[10px] text-gray-400">{member.role}</p>
                {member.currentJob && (
                  <p className="text-[10px] text-gray-500 truncate">
                    {member.currentJob}
                  </p>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold ${s.text}`}
              >
                <BsCircleFill className={`h-1.5 w-1.5 ${s.dot}`} />
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
