"use client";

/**
 * Customers Page – Norfolk Cleaners
 * ──────────────────────────────────
 * Dense enterprise-style data table. Blue accent.
 * Fetches data from /api/customers.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  job_count: string;
  last_visit: string | null;
  status: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CustomersPage() {
  const { user, loading } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      } else {
        setError(json.error ?? "Failed to load customers");
        setCustomers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setCustomers([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCustomers();
  }, [user, fetchCustomers]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full text-[11px] text-gray-400 bg-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full bg-white">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-0.5 bg-gray-100 shrink-0">
        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
          Customers
        </span>
        <span className="text-[10px] text-gray-500">
          {fetching ? "Loading…" : `${customers.length} records`}
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

      {/* Error banner */}
      {error && (
        <div className="px-2 py-1 bg-red-50 border-b border-red-200 text-[11px] text-red-600 shrink-0">
          {error}
        </div>
      )}

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
                  {c.id.substring(0, 8)}
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
                  {c.job_count}
                </td>
                <td className="px-2 py-1 text-gray-500 border-r border-gray-100">
                  {formatDate(c.last_visit)}
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
            {!fetching && customers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-gray-400 text-[11px]"
                >
                  {error
                    ? "Failed to load customers."
                    : "No customers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
