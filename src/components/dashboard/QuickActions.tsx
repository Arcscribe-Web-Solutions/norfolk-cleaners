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
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Quick Actions
        </h2>
      </div>

      <ul className="divide-y divide-slate-100/80">
        {available.map((action) => (
          <li key={action.label}>
            <Link
              href={action.href}
              className="group flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:bg-cyan-50/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-100 transition-all duration-200 group-hover:bg-cyan-100 group-hover:text-cyan-600 group-hover:ring-cyan-200">
                {action.icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-700 transition-colors group-hover:text-cyan-700">
                  {action.label}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {action.description}
                </span>
              </div>
              <BsBoxArrowUpRight className="h-3 w-3 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
