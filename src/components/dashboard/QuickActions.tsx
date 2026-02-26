"use client";

/**
 * QuickActions - contextual action buttons based on the user's permissions.
 */

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { RolePermissions } from "@/lib/roles";
import {
  BsPlusCircle,
  BsPersonPlus,
  BsFileEarmarkText,
  BsReceipt,
  BsGear,
  BsClipboard2Data,
  BsBoxArrowUpRight,
} from "react-icons/bs";
import type { ReactNode } from "react";

interface QuickAction {
  label: string;
  href: string;
  icon: ReactNode;
  permission: keyof RolePermissions;
  description: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: "New Job",
    href: "/jobs?action=new",
    icon: <BsPlusCircle className="h-5 w-5" />,
    permission: "createJobs",
    description: "Create a new cleaning job",
  },
  {
    label: "Add Customer",
    href: "/customers?action=new",
    icon: <BsPersonPlus className="h-5 w-5" />,
    permission: "createClients",
    description: "Register a new customer",
  },
  {
    label: "New Quote",
    href: "/jobs?action=quote",
    icon: <BsFileEarmarkText className="h-5 w-5" />,
    permission: "createQuotes",
    description: "Create a cleaning quote",
  },
  {
    label: "New Invoice",
    href: "/jobs?action=invoice",
    icon: <BsReceipt className="h-5 w-5" />,
    permission: "createInvoices",
    description: "Generate a new invoice",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <BsClipboard2Data className="h-5 w-5" />,
    permission: "viewReporting",
    description: "View business reports",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <BsGear className="h-5 w-5" />,
    permission: "viewSettings",
    description: "Platform settings",
  },
];

export default function QuickActions() {
  const { can } = useAuth();

  const available = ACTIONS.filter((a) => can(a.permission));

  if (available.length === 0) return null;

  return (
    <div className="bg-white">
      <div className="border-b border-gray-300 px-2 py-1 bg-gray-50">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          Quick Actions
        </h2>
      </div>

      <ul className="divide-y divide-gray-200">
        {available.map((action) => (
          <li key={action.label}>
            <Link
              href={action.href}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 text-xs"
            >
              <span className="text-gray-500 shrink-0">
                {action.icon}
              </span>
              <span className="font-medium text-gray-700">
                {action.label}
              </span>
              <BsBoxArrowUpRight className="h-2.5 w-2.5 ml-auto shrink-0 text-gray-300" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
