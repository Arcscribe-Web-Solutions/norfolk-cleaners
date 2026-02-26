"use client";

/**
 * Settings Page – Norfolk Cleaners
 * ─────────────────────────────────
 * Dense enterprise-style settings panel with form sections.
 */

import { useAuth } from "@/lib/auth";
import DemoDataBanner from "@/components/dashboard/DemoDataBanner";

export default function SettingsPage() {
  const { user, loading, roleDef } = useAuth();

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
          Settings
        </span>
        <span className="text-[10px] text-gray-500">
          {user.firstName} {user.lastName} &middot; {roleDef?.label}
        </span>
      </div>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {/* Settings sidebar */}
          <nav className="w-[200px] border-r border-gray-300 bg-[#f9f9f9] shrink-0">
            {[
              { label: "Company Info", active: true },
              { label: "Team & Staff", active: false },
              { label: "Job Types", active: false },
              { label: "Notifications", active: false },
              { label: "Billing", active: false },
              { label: "Integrations", active: false },
              { label: "Security", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-3 py-1.5 text-[11px] cursor-pointer border-b border-gray-200 ${
                  item.active
                    ? "bg-white text-gray-800 font-semibold border-l-2 border-l-blue-500"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>

          {/* Settings content */}
          <div className="flex-1 p-3 overflow-y-auto">
            {/* Company Info section */}
            <div className="border border-gray-300 bg-white mb-3">
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Company Information
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {[
                  { label: "Company Name", value: "Norfolk Cleaners" },
                  { label: "Phone", value: "01603 123456" },
                  { label: "Email", value: "office@norfolkcleaners.co.uk" },
                  { label: "Address", value: "12 Market Street, Norwich, NR1 3HW" },
                  { label: "VAT Number", value: "GB 123 4567 89" },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="grid grid-cols-[120px_1fr] gap-1 items-center"
                  >
                    <label className="text-[11px] text-gray-600 font-semibold">
                      {field.label}
                    </label>
                    <input
                      className="border border-gray-300 rounded-sm px-2 py-0.5 text-[11px] w-full outline-none focus:border-blue-400"
                      defaultValue={field.value}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours section */}
            <div className="border border-gray-300 bg-white mb-3">
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Business Hours
                </h3>
              </div>
              <div className="p-3">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-0.5 font-bold text-gray-600 w-24">Day</th>
                      <th className="text-left py-0.5 font-bold text-gray-600 w-20">Open</th>
                      <th className="text-left py-0.5 font-bold text-gray-600 w-20">Close</th>
                      <th className="text-left py-0.5 font-bold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { day: "Monday", open: "07:00", close: "18:00", active: true },
                      { day: "Tuesday", open: "07:00", close: "18:00", active: true },
                      { day: "Wednesday", open: "07:00", close: "18:00", active: true },
                      { day: "Thursday", open: "07:00", close: "18:00", active: true },
                      { day: "Friday", open: "07:00", close: "18:00", active: true },
                      { day: "Saturday", open: "08:00", close: "14:00", active: true },
                      { day: "Sunday", open: "—", close: "—", active: false },
                    ].map((d) => (
                      <tr key={d.day} className="border-b border-gray-100">
                        <td className="py-0.5 text-gray-700 font-semibold">{d.day}</td>
                        <td className="py-0.5 text-gray-600">{d.open}</td>
                        <td className="py-0.5 text-gray-600">{d.close}</td>
                        <td className="py-0.5">
                          <span
                            className={`inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm ${
                              d.active
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {d.active ? "Open" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Account section */}
            <div className="border border-gray-300 bg-white">
              <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Your Account
                </h3>
              </div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
                  <label className="text-[11px] text-gray-600 font-semibold">Name</label>
                  <span className="text-[11px] text-gray-800">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
                  <label className="text-[11px] text-gray-600 font-semibold">Email</label>
                  <span className="text-[11px] text-gray-800">{user.email}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
                  <label className="text-[11px] text-gray-600 font-semibold">Role</label>
                  <span className="inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm bg-blue-100 text-blue-700 w-fit">
                    {roleDef?.label}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
                  <label className="text-[11px] text-gray-600 font-semibold">Password</label>
                  <button className="text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer text-left">
                    Change password…
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
