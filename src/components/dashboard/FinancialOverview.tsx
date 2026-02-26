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
      <div className="bg-white">
        <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Financial Overview
          </h2>
        </div>
        <div className="px-2 py-4 text-center text-xs text-gray-400">
          No financial data available yet.
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
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-1 bg-gray-50">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          Financial Overview
        </h2>
        <span className="text-[10px] text-gray-500">This month</span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
        {/* Revenue */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            <BsCurrencyPound className="h-3 w-3" />
            Revenue
          </div>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            £{f.revenueThisMonth.toLocaleString()}
          </p>
          <p
            className={`text-[10px] ${
              revenueUp ? "text-green-700" : "text-red-600"
            }`}
          >
            {revenueUp ? "↑" : "↓"} {revenueDelta}% vs last month
          </p>
        </div>

        {/* Outstanding */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            <BsReceiptCutoff className="h-3 w-3" />
            Outstanding
          </div>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            £{f.outstandingInvoices.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500">
            {f.unpaidInvoicesCount} unpaid
          </p>
        </div>

        {/* Paid */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            <BsGraphUpArrow className="h-3 w-3" />
            Paid Invoices
          </div>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {f.paidInvoicesCount}
          </p>
          <p className="text-[10px] text-gray-500">this month</p>
        </div>

        {/* Overdue */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            <BsExclamationTriangle className="h-3 w-3" />
            Overdue
          </div>
          <p className="mt-0.5 text-sm font-bold text-red-600">
            £{f.overdueInvoices.toLocaleString()}
          </p>
          <p className="text-[10px] text-red-500">
            {f.overdueCount} overdue
          </p>
        </div>
      </div>
    </div>
  );
}
