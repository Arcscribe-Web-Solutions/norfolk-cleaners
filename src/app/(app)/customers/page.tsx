"use client";

/**
 * Customers Page – Norfolk Cleaners
 * ──────────────────────────────────
 * Dense enterprise-style data table. Blue accent.
 */

import { useAuth } from "@/lib/auth";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import DemoDataBanner from "@/components/dashboard/DemoDataBanner";

const DEMO_CUSTOMERS = [
  { id: "C-001", name: "Mrs. J. Chapman", phone: "01603 456789", email: "j.chapman@email.com", address: "14 Nelson Road, NR1 4BT", jobCount: 12, lastVisit: "24 Feb 2026", status: "active" as const },
  { id: "C-002", name: "Mr. D. Williams", phone: "01603 234567", email: "d.williams@email.com", address: "8 Elm Hill, NR3 1HN", jobCount: 8, lastVisit: "22 Feb 2026", status: "active" as const },
  { id: "C-003", name: "Mrs. S. Thompson", phone: "01603 345678", email: "s.thompson@email.com", address: "22 Riverside Walk, NR1 1FE", jobCount: 15, lastVisit: "25 Feb 2026", status: "active" as const },
  { id: "C-004", name: "Mr. R. Baker", phone: "01603 567890", email: "r.baker@email.com", address: "5 Cathedral Close, NR1 4DH", jobCount: 3, lastVisit: "20 Feb 2026", status: "active" as const },
  { id: "C-005", name: "Mrs. A. Patel", phone: "01603 678901", email: "a.patel@email.com", address: "31 Unthank Road, NR2 2PB", jobCount: 6, lastVisit: "18 Feb 2026", status: "inactive" as const },
  { id: "C-006", name: "Dr. E. Okonkwo", phone: "01603 123456", email: "e.okonkwo@email.com", address: "7 Cathedral Close, NR1 1QF", jobCount: 22, lastVisit: "26 Feb 2026", status: "active" as const },
  { id: "C-007", name: "Blyth & Sons Ltd", phone: "01603 789012", email: "office@blythsons.co.uk", address: "Unit 4, Wherry Rd, NR1 1WX", jobCount: 45, lastVisit: "25 Feb 2026", status: "active" as const },
  { id: "C-008", name: "The Rose & Crown", phone: "01603 890123", email: "manager@roseandcrown.co.uk", address: "Crown Rd, NR2 3FG", jobCount: 18, lastVisit: "23 Feb 2026", status: "active" as const },
  { id: "C-009", name: "Mr. & Mrs. Chen", phone: "01603 901234", email: "chen.family@email.com", address: "22 Eaton Rd, NR4 6PP", jobCount: 9, lastVisit: "21 Feb 2026", status: "active" as const },
  { id: "C-010", name: "Ms. F. Adebayo", phone: "01603 012345", email: "f.adebayo@email.com", address: "5 Bracondale, NR1 2AT", jobCount: 4, lastVisit: "15 Feb 2026", status: "inactive" as const },
  { id: "C-011", name: "Mr. T. Nguyen", phone: "01603 543210", email: "t.nguyen@email.com", address: "44 Unthank Rd, NR2 2PA", jobCount: 7, lastVisit: "19 Feb 2026", status: "active" as const },
  { id: "C-012", name: "Norwich Cathedral", phone: "01603 218300", email: "facilities@cathedral.org.uk", address: "The Close, NR1 4DH", jobCount: 52, lastVisit: "26 Feb 2026", status: "active" as const },
];

export default function CustomersPage() {
  const { user, loading } = useAuth();
  const { showDemoData } = useDemoData();

  const customers = showDemoData ? DEMO_CUSTOMERS : [];

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
          Customers
        </span>
        <span className="text-[10px] text-gray-500">
          {customers.length} records
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-300 bg-[#fafafa] shrink-0">
        <input
          className="border border-gray-300 rounded-sm px-2 py-0.5 text-[11px] w-[200px] outline-none focus:border-blue-400"
          placeholder="Search customers…"
          readOnly
        />
        <button className="bg-[#2563eb] text-white px-3 py-0.5 text-[11px] font-bold rounded-sm cursor-pointer">
          + New Customer
        </button>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400">Filter: All</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="border-b border-gray-300">
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-16">
                ID
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Name
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Phone
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Email
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200">
                Address
              </th>
              <th className="text-center px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-14">
                Jobs
              </th>
              <th className="text-left px-2 py-1 font-bold text-gray-600 uppercase tracking-wide border-r border-gray-200 w-24">
                Last Visit
              </th>
              <th className="text-center px-2 py-1 font-bold text-gray-600 uppercase tracking-wide w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
              >
                <td className="px-2 py-1 text-gray-500 border-r border-gray-100">
                  {c.id}
                </td>
                <td className="px-2 py-1 font-semibold text-gray-800 border-r border-gray-100">
                  {c.name}
                </td>
                <td className="px-2 py-1 text-gray-600 border-r border-gray-100">
                  {c.phone}
                </td>
                <td className="px-2 py-1 text-blue-600 border-r border-gray-100">
                  {c.email}
                </td>
                <td className="px-2 py-1 text-gray-600 border-r border-gray-100">
                  {c.address}
                </td>
                <td className="px-2 py-1 text-center text-gray-600 border-r border-gray-100">
                  {c.jobCount}
                </td>
                <td className="px-2 py-1 text-gray-500 border-r border-gray-100">
                  {c.lastVisit}
                </td>
                <td className="px-2 py-1 text-center">
                  <span
                    className={`inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm ${
                      c.status === "active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-gray-400 text-[11px]"
                >
                  No customer data available. Enable demo data to preview.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
