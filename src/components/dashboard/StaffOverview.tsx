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
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Team</h2>
        </div>
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <BsPeople className="h-6 w-6 text-slate-300" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No team data available yet.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Staff members will appear here.
          </p>
        </div>
      </div>
    );
  }

  const active = staff.filter((s) => s.status !== "off_today").length;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Team</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          {active} active
        </span>
      </div>

      <ul className="divide-y divide-slate-100/80">
        {staff.map((member) => {
          const s = statusStyle[member.status];
          return (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-slate-50/50">
              {/* Avatar placeholder */}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-50 text-slate-500 ring-1 ring-slate-200/50">
                <BsPersonFill className="h-4 w-4" />
              </span>

              {/* Name & role */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {member.name}
                </p>
                <p className="text-[11px] text-slate-400">{member.role}</p>
                {member.currentJob && (
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                    {member.currentJob}
                  </p>
                )}
              </div>

              {/* Status */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}
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
