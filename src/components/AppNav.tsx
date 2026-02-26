"use client";

/**
 * AppNav – Enterprise-style top navigation bar
 * ─────────────────────────────────────────────
 * Shared across all authenticated pages. Dense 2010s enterprise styling
 * with the real logo, blue accent, and tight layout.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { BsSearch, BsBellFill, BsEnvelope, BsQuestionCircle } from "react-icons/bs";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard" },
  { label: "Dispatch Board", href: "/schedule" },
  { label: "Jobs", href: "/jobs" },
  { label: "Customers", href: "/customers" },
  { label: "Invoicing", href: "/invoicing" },
  { label: "Settings", href: "/settings" },
];

export default function AppNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="w-full h-14 bg-white border-b border-gray-300 flex items-center justify-between px-4 shrink-0">
      {/* Left: Logo + nav links */}
      <div className="flex items-center h-full">
        <Link href="/dashboard" className="shrink-0 mr-6">
          <Image
            src="/logo.png"
            alt="Norfolk Cleaners"
            width={128}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center h-full">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center h-full px-3 text-[12px] cursor-pointer border-t-4 ${
                  isActive
                    ? "text-gray-800 font-semibold border-blue-500"
                    : "text-gray-500 hover:text-gray-800 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: New Job button + icon placeholders + user */}
      <div className="flex items-center gap-3">
        <button className="bg-[#2563eb] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm cursor-pointer whitespace-nowrap">
          New Job
        </button>

        {/* Search */}
        <button className="p-1 hover:bg-gray-100 rounded-sm cursor-pointer" title="Search">
          <BsSearch className="w-4 h-4 text-gray-500" />
        </button>

        {/* Bell with red dot */}
        <button className="relative p-1 hover:bg-gray-100 rounded-sm cursor-pointer" title="Notifications">
          <BsBellFill className="w-4 h-4 text-gray-500" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Inbox */}
        <button className="p-1 hover:bg-gray-100 rounded-sm cursor-pointer" title="Inbox">
          <BsEnvelope className="w-4 h-4 text-gray-500" />
        </button>

        {/* Help */}
        <button className="p-1 hover:bg-gray-100 rounded-sm cursor-pointer" title="Help">
          <BsQuestionCircle className="w-4 h-4 text-gray-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300" />

        {/* User name / logout */}
        {user ? (
          <button
            onClick={logout}
            className="text-[12px] text-gray-600 whitespace-nowrap cursor-pointer hover:text-gray-800"
          >
            {user.firstName} {user.lastName} ▾
          </button>
        ) : (
          <span className="text-[12px] text-gray-400">—</span>
        )}
      </div>
    </nav>
  );
}
