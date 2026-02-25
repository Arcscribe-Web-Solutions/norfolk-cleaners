"use client";

/**
 * StatCard - single KPI metric for the dashboard.
 */

import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
  accent?: "cyan" | "emerald" | "violet" | "amber";
}

const accentStyles = {
  cyan: {
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-600",
    ring: "ring-cyan-100",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    ring: "ring-violet-100",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    ring: "ring-amber-100",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  className = "",
  accent = "cyan",
}: StatCardProps) {
  const a = accentStyles[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/80 ${className}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText} ring-1 ${a.ring}`}>
            {icon}
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {trend && (
          <p
            className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
              trend.positive ? "bg-emerald-50" : "bg-red-50"
            }`}>
              {trend.positive ? "↑" : "↓"}
            </span>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
