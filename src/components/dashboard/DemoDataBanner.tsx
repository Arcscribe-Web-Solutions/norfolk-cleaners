"use client";

/**
 * DemoDataBanner - development-only toggle.
 * When NEXT_STATUS=development, shows a banner that lets the user opt into
 * viewing mock data across all dashboard widgets. Hidden in production.
 */

import { useState, createContext, useContext, type ReactNode } from "react";
import { BsCodeSlash, BsToggleOn, BsToggleOff } from "react-icons/bs";

// ── Demo-data context ──────────────────────────────────────

interface DemoDataContextValue {
  showDemoData: boolean;
  isDev: boolean;
  toggle: () => void;
}

const DemoDataContext = createContext<DemoDataContextValue>({
  showDemoData: false,
  isDev: false,
  toggle: () => {},
});

export function useDemoData() {
  return useContext(DemoDataContext);
}

// ── Provider ───────────────────────────────────────────────

export function DemoDataProvider({
  isDev,
  children,
}: {
  isDev: boolean;
  children: ReactNode;
}) {
  const [showDemoData, setShowDemoData] = useState(false);

  return (
    <DemoDataContext.Provider
      value={{
        showDemoData: isDev && showDemoData,
        isDev,
        toggle: () => setShowDemoData((v) => !v),
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

// ── Banner component ───────────────────────────────────────

export default function DemoDataBanner() {
  const { showDemoData, isDev, toggle } = useDemoData();

  if (!isDev) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 px-5 py-3 shadow-sm shadow-violet-600/15">
      <div className="flex items-center gap-2.5 text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15">
          <BsCodeSlash className="h-3.5 w-3.5" />
        </span>
        <div>
          <span className="text-sm font-semibold">
            Development Mode
          </span>
          {showDemoData && (
            <span className="ml-2 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              Demo Active
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
          showDemoData
            ? "bg-white text-violet-700 shadow-sm hover:bg-violet-50"
            : "bg-white/15 text-white hover:bg-white/25"
        }`}
      >
        {showDemoData ? (
          <BsToggleOn className="h-4 w-4" />
        ) : (
          <BsToggleOff className="h-4 w-4" />
        )}
        {showDemoData ? "Demo On" : "Demo Off"}
      </button>
    </div>
  );
}
