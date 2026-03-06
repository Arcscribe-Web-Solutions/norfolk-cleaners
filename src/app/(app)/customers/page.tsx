"use client";

/**
 * Customers Page – Norfolk Cleaners
 * ──────────────────────────────────
 * Dense enterprise-style data table with mobile card view. Blue accent.
 * Fetches data from /api/customers.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { BsSearch, BsTelephone, BsEnvelope, BsGeo } from "react-icons/bs";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter customers by search query
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

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
      <div className="flex items-center justify-between border-b border-gray-300 px-3 py-1.5 sm:py-0.5 bg-gray-100 shrink-0">
        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
          Customers
        </span>
        <span className="text-[10px] text-gray-500">
          {fetching ? "Loading…" : `${filteredCustomers.length} of ${customers.length} records`}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-gray-300 bg-[#fafafa] shrink-0">
        <div className="relative flex-1 min-w-[150px] max-w-[280px]">
          <BsSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            className="border border-gray-300 rounded-sm pl-7 pr-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
            placeholder="Search customers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="bg-[#2563eb] text-white px-3 py-1 text-[11px] font-bold rounded-sm cursor-pointer hover:bg-blue-700">
          + New Customer
        </button>
        <div className="hidden sm:block flex-1" />
        <span className="hidden sm:inline text-[10px] text-gray-400">Filter: All</span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 border-b border-red-200 text-[11px] text-red-600 shrink-0">
          {error}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="flex-1 overflow-auto md:hidden">
        <div className="p-3 space-y-3">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer active:bg-gray-50 shadow-sm"
            >
              {/* Header: name + status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{c.name}</h3>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                    c.status === "active"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <BsTelephone className="w-3 h-3 text-gray-400 shrink-0" />
                  <a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <BsEnvelope className="w-3 h-3 text-gray-400 shrink-0" />
                  <a href={`mailto:${c.email}`} className="truncate hover:underline">{c.email}</a>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <BsGeo className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{c.address}</span>
                </div>
              </div>

              {/* Footer: jobs + last visit */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  <span className="font-semibold text-gray-700">{c.job_count}</span> jobs
                </span>
                <span className="text-gray-500">
                  Last visit: <span className="text-gray-700">{formatDate(c.last_visit)}</span>
                </span>
              </div>
            </div>
          ))}
          {!fetching && filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {error
                ? "Failed to load customers."
                : searchQuery
                  ? "No customers match your search."
                  : "No customers found."}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="flex-1 overflow-auto hidden md:block">
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
            {filteredCustomers.map((c) => (
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
            {!fetching && filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-gray-400 text-[11px]"
                >
                  {error
                    ? "Failed to load customers."
                    : searchQuery
                      ? "No customers match your search."
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
