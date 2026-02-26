"use client";

/**
 * Jobs Page – Norfolk Cleaners
 * ─────────────────────────────
 * Dense enterprise-style job list table. Blue accent.
 */

import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import DemoDataBanner from "@/components/dashboard/DemoDataBanner";

const DEMO_JOBS = [
  { id: "J-1042", customer: "Mrs. Patterson", address: "14 Riverside Rd, NR1", type: "Regular Clean", assignedTo: "Harvey Washington", date: "26 Feb 2026", time: "08:30", duration: "1h 30m", status: "completed" as const, amount: "£85.00" },
  { id: "J-1043", customer: "Dr. Okonkwo", address: "7 Cathedral Close, NR1", type: "Deep Clean", assignedTo: "Harvey Washington", date: "26 Feb 2026", time: "10:30", duration: "2h 30m", status: "in_progress" as const, amount: "£185.00" },
  { id: "J-1044", customer: "The Rose & Crown", address: "Crown Rd, NR2", type: "Regular Clean", assignedTo: "Harvey Washington", date: "26 Feb 2026", time: "14:00", duration: "1h 30m", status: "upcoming" as const, amount: "£75.00" },
  { id: "J-1045", customer: "18 Colman Rd", address: "18 Colman Rd, NR4", type: "End of Tenancy", assignedTo: "Sarah Mitchell", date: "26 Feb 2026", time: "09:00", duration: "3h 00m", status: "in_progress" as const, amount: "£280.00" },
  { id: "J-1046", customer: "Blyth & Sons Ltd", address: "Unit 4, Wherry Rd, NR1", type: "Deep Clean", assignedTo: "Sarah Mitchell", date: "26 Feb 2026", time: "13:30", duration: "2h 00m", status: "upcoming" as const, amount: "£165.00" },
  { id: "J-1047", customer: "Mr. & Mrs. Chen", address: "22 Eaton Rd, NR4", type: "Regular Clean", assignedTo: "James Cole", date: "26 Feb 2026", time: "08:00", duration: "1h 30m", status: "completed" as const, amount: "£70.00" },
  { id: "J-1048", customer: "Norwich Cathedral", address: "The Close, NR1 4DH", type: "Window Clean", assignedTo: "James Cole", date: "26 Feb 2026", time: "10:00", duration: "2h 30m", status: "in_progress" as const, amount: "£220.00" },
  { id: "J-1049", customer: "Ms. Adebayo", address: "5 Bracondale, NR1", type: "Carpet Clean", assignedTo: "James Cole", date: "26 Feb 2026", time: "14:00", duration: "2h 00m", status: "upcoming" as const, amount: "£120.00" },
  { id: "J-1050", customer: "Anglia Square", address: "Anglia Square, NR3", type: "Commercial Clean", assignedTo: "Tom Barker", date: "26 Feb 2026", time: "07:00", duration: "2h 30m", status: "completed" as const, amount: "£350.00" },
  { id: "J-1051", customer: "Mr. Nguyen", address: "44 Unthank Rd, NR2", type: "Regular Clean", assignedTo: "Tom Barker", date: "26 Feb 2026", time: "11:00", duration: "1h 30m", status: "upcoming" as const, amount: "£65.00" },
  { id: "J-1052", customer: "Mrs. J. Chapman", address: "14 Nelson Road, NR1", type: "Regular Clean", assignedTo: "Harvey Washington", date: "27 Feb 2026", time: "09:00", duration: "2h 00m", status: "upcoming" as const, amount: "£95.00" },
  { id: "J-1053", customer: "Mr. D. Williams", address: "8 Elm Hill, NR3", type: "Deep Clean", assignedTo: "Sarah Mitchell", date: "27 Feb 2026", time: "08:30", duration: "3h 00m", status: "upcoming" as const, amount: "£210.00" },
];

const STATUS_STYLES = {
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" },
  upcoming: { bg: "bg-blue-100", text: "text-blue-700", label: "Upcoming" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};

export default function JobsPage() {
  const { user, loading } = useAuth();
  const { showDemoData } = useDemoData();

  const jobs = showDemoData ? DEMO_JOBS : [];

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full text-[11px] text-gray-400 bg-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full bg-white">
      <DemoDataBanner />

      {/* Status bar */}
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-0.5 bg-gray-100 shrink-0">
        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
          Jobs
        </span>
        <span className="text-[10px] text-gray-500">
          {jobs.length} records
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-300 bg-[#fafafa] shrink-0">
        <input
          className="border border-gray-300 rounded-sm px-2 py-0.5 text-[11px] w-[200px] outline-none focus:border-blue-400"
          placeholder="Search jobs…"
          readOnly
        />
        <button className="bg-[#2563eb] text-white px-3 py-0.5 text-[11px] font-bold rounded-sm cursor-pointer">
          + New Job
        </button>
        <button className="border border-gray-300 bg-white text-gray-600 px-3 py-0.5 text-[11px] rounded-sm cursor-pointer hover:bg-gray-50">
          + New Quote
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400">Today &middot; All Staff</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-300">
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Job #
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Customer
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Type
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Assigned To
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-24">
                Date
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-14">
                Time
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Duration
              </th>
              <th className="text-right px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                Amount
              </th>
              <th className="text-center px-2 py-1 font-bold text-gray-600 uppercase tracking-wide w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => {
              const s = STATUS_STYLES[j.status];
              return (
                <tr
                  key={j.id}
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="px-2 py-1 text-blue-600 font-semibold border-r border-gray-100">
                    {j.id}
                  </td>
                  <td className="px-2 py-1 border-r border-gray-100">
                    <div className="font-semibold text-gray-800">{j.customer}</div>
                    <div className="text-[10px] text-gray-500">{j.address}</div>
                  </td>
                  <td className="px-2 py-1 text-gray-600 border-r border-gray-100">
                    {j.type}
                  </td>
                  <td className="px-2 py-1 text-gray-600 border-r border-gray-100">
                    {j.assignedTo}
                  </td>
                  <td className="px-2 py-1 text-gray-500 border-r border-gray-100">
                    {j.date}
                  </td>
                  <td className="px-2 py-1 text-gray-600 border-r border-gray-100">
                    {j.time}
                  </td>
                  <td className="px-2 py-1 text-gray-500 border-r border-gray-100">
                    {j.duration}
                  </td>
                  <td className="px-2 py-1 text-right font-semibold text-gray-800 border-r border-gray-100">
                    {j.amount}
                  </td>
                  <td className="px-2 py-1 text-center">
                    <span
                      className={`inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm ${s.bg} ${s.text}`}
                    >
                      {s.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-8 text-gray-400 text-[11px]"
                >
                  No job data available. Enable demo data to preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
