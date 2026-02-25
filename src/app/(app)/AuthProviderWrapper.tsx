"use client";

import { AuthProvider } from "@/lib/auth";
import { DemoDataProvider } from "@/components/dashboard/DemoDataBanner";
import type { ReactNode } from "react";
import { BsCodeSlash } from "react-icons/bs";

/**
 * Client-side wrapper that provides the AuthProvider and DemoDataProvider
 * to the (app) route group.
 * Needed because the layout itself is a Server Component.
 */
export function AuthProviderWrapper({
  children,
  isDev,
}: {
  children: ReactNode;
  isDev: boolean;
}) {
  return (
    <AuthProvider>
      <DemoDataProvider isDev={isDev}>
        {children}
        {/* Floating dev indicator - always visible in dev mode */}
        {isDev && <DevIndicator />}
      </DemoDataProvider>
    </AuthProvider>
  );
}

function DevIndicator() {
  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-violet-600/25 select-none">
      <BsCodeSlash className="h-3 w-3" />
      DEV
    </div>
  );
}
