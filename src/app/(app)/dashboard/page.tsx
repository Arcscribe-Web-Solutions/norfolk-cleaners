"use client";

/**
 * Dashboard – Norfolk Cleaners
 * ─────────────────────────────
 * Legacy-style enterprise dashboard with action buttons,
 * two-column workspace (feed + tasks sidebar), and floating chat button.
 */

import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiFileText, 
  FiMapPin, 
  FiSettings, 
  FiBarChart2, 
  FiPackage,
  FiMessageCircle,
  FiUser
} from "react-icons/fi";

const actionButtons = [
  { icon: FiMapPin, label: "Dispatch Board" },
  { icon: FiClock, label: "History" },
  { icon: FiUsers, label: "Clients" },
  { icon: FiFileText, label: "Invoicing" },
  { icon: FiCalendar, label: "Schedule" },
  { icon: FiBarChart2, label: "Reports" },
  { icon: FiPackage, label: "Inventory" },
  { icon: FiSettings, label: "Settings" },
];

const feedItems = [
  {
    title: "ServiceM8 Pay Payment",
    date: "5 Mar 2026, 09:42 AM",
    items: [
      { job: "#12345", amount: "£60.00" },
      { job: "#12346", amount: "£85.00" },
      { job: "#12347", amount: "£45.00" },
    ],
  },
  {
    title: "ServiceM8 Pay Payment",
    date: "4 Mar 2026, 03:15 PM",
    items: [
      { job: "#12340", amount: "£120.00" },
      { job: "#12341", amount: "£75.00" },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto pt-8 flex flex-col gap-6 px-4 pb-8">
        
        {/* Top Action Buttons Grid */}
        <div className="flex flex-wrap justify-center gap-3">
          {actionButtons.map((btn) => (
            <button
              key={btn.label}
              className="w-24 h-24 bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              <btn.icon className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-xs text-gray-700 text-center leading-tight px-1">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* Two-Column Workspace */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Column - Feed (65%) */}
          <div className="flex-grow flex flex-col gap-4">
            
            {/* Create Post Card */}
            <div className="border border-gray-300 rounded-sm bg-white">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                <span className="font-bold text-sm text-gray-800">Create Post</span>
              </div>
              <div className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <FiUser className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* Feed Item Cards */}
            {feedItems.map((item, idx) => (
              <div key={idx} className="border border-gray-300 rounded-sm bg-white">
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-800">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                  <div className="mt-3 space-y-1">
                    {item.items.map((payout, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        <span className="font-medium text-green-700">{payout.amount}</span>
                        {" "}for Job{" "}
                        <span className="text-blue-600">{payout.job}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* Right Column - Sidebar (35%) */}
          <div className="w-full md:w-80 shrink-0">
            
            {/* My Tasks Card */}
            <div className="border border-gray-300 rounded-sm bg-white">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                <span className="font-bold text-sm text-gray-800">My Tasks</span>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-500">
                  No tasks are currently assigned to you.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Open chat"
      >
        <FiMessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
