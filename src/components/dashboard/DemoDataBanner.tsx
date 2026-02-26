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
    <div className="flex items-center justify-between gap-2 bg-violet-700 px-2 py-0.5 text-[10px] text-white shrink-0">
      <div className="flex items-center gap-1.5">
        <BsCodeSlash className="h-3 w-3" />
        <span className="font-semibold uppercase tracking-wide">Dev Mode</span>
        {showDemoData && (
          <span className="bg-white/20 px-1.5 py-px text-[9px] uppercase tracking-wider">
            Demo Active
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-1 px-2 py-0.5 font-semibold ${
          showDemoData
            ? "bg-white text-violet-700"
            : "bg-white/15 text-white hover:bg-white/25"
        }`}
      >
        {showDemoData ? (
          <BsToggleOn className="h-3 w-3" />
        ) : (
          <BsToggleOff className="h-3 w-3" />
        )}
        {showDemoData ? "On" : "Off"}
      </button>
    </div>
  );
}
