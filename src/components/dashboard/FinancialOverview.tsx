"use client";

/**
 * FinancialOverview - revenue / invoicing at-a-glance.
 * Only visible to roles with viewJobProfitability or viewInvoices permission.
 * Real data from API. Demo data shown when dev toggle is active.
 */

import { useEffect, useState } from "react";
import { useDemoData } from "@/components/dashboard/DemoDataBanner";
import {
  BsCurrencyPound,
  BsReceiptCutoff,
  BsGraphUpArrow,
  BsExclamationTriangle,
  BsBarChart,
} from "react-icons/bs";

interface Financials {
  revenueThisMonth: number;
  revenueLastMonth: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  paidInvoicesCount: number;
  unpaidInvoicesCount: number;
  overdueCount: number;
}

const DEMO_FINANCIALS: Financials = {
  revenueThisMonth: 12_480,
  revenueLastMonth: 11_200,
  outstandingInvoices: 3_250,
  overdueInvoices: 875,
  paidInvoicesCount: 42,
  unpaidInvoicesCount: 7,
  overdueCount: 2,
};

const EMPTY_FINANCIALS: Financials = {
  revenueThisMonth: 0,
  revenueLastMonth: 0,
  outstandingInvoices: 0,
  overdueInvoices: 0,
  paidInvoicesCount: 0,
  unpaidInvoicesCount: 0,
  overdueCount: 0,
};

export default function FinancialOverview() {
  const { showDemoData } = useDemoData();
  const [realData, setRealData] = useState<Financials>(EMPTY_FINANCIALS);

  useEffect(() => {
    if (showDemoData) return;
    // TODO: Replace with real API endpoint when invoices table exists
    setRealData(EMPTY_FINANCIALS);
  }, [showDemoData]);

  const f = showDemoData ? DEMO_FINANCIALS : realData;

  const hasData = f.revenueThisMonth > 0 || f.paidInvoicesCount > 0 || f.outstandingInvoices > 0;

  if (!showDemoData && !hasData) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Financial Overview
          </h2>
        </div>
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <BsBarChart className="h-6 w-6 text-slate-300" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            No financial data available yet.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Revenue and invoicing data will appear here.
          </p>
        </div>
      </div>
    );
  }

  const revenueDelta =
    f.revenueLastMonth > 0
      ? (((f.revenueThisMonth - f.revenueLastMonth) / f.revenueLastMonth) * 100).toFixed(1)
      : "0.0";
  const revenueUp = f.revenueThisMonth >= f.revenueLastMonth;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Financial Overview
        </h2>
        <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">This month</span>
      </div>

      <div className="grid gap-px bg-slate-100/50 sm:grid-cols-2">
        {/* Revenue */}
        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <BsCurrencyPound className="h-3.5 w-3.5" />
            Revenue
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            £{f.revenueThisMonth.toLocaleString()}
          </p>
          <p
            className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
              revenueUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${revenueUp ? "bg-emerald-50" : "bg-red-50"}`}>
              {revenueUp ? "↑" : "↓"}
            </span>
            {revenueDelta}% vs last month
          </p>
        </div>

        {/* Outstanding */}
        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <BsReceiptCutoff className="h-3.5 w-3.5" />
            Outstanding
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            £{f.outstandingInvoices.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {f.unpaidInvoicesCount} unpaid invoice
            {f.unpaidInvoicesCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <BsGraphUpArrow className="h-3.5 w-3.5" />
            Paid Invoices
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {f.paidInvoicesCount}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">this month</p>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <BsExclamationTriangle className="h-3.5 w-3.5" />
            Overdue
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">
            £{f.overdueInvoices.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-red-400">
            {f.overdueCount} overdue invoice
            {f.overdueCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
