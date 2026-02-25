"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { useAuth } from "@/lib/auth";
import { BsList, BsXLg, BsBoxArrowRight, BsChevronDown, BsPersonCircle } from "react-icons/bs";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, roleDef } = useAuth();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Site Name */}
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="Norfolk Cleaners" width={180} height={40} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden items-center md:flex" ref={menuRef}>
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 transition-all duration-200 ${
                  userMenuOpen
                    ? "border-cyan-200 bg-cyan-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {user.firstName}
                </span>
                <BsChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                  {/* User Info */}
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    {roleDef && (
                      <span className="mt-1 inline-flex items-center rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                        {roleDef.label}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <BsPersonCircle className="h-4 w-4 text-slate-400" />
                      My Account
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <BsBoxArrowRight className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <BsXLg className="h-5 w-5" />
          ) : (
            <BsList className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mobile user info + logout */}
          {user && (
            <div className="mt-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 text-xs font-bold text-white shadow-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
                <div>
                  <span className="block text-sm font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                  {roleDef && (
                    <span className="mt-0.5 inline-flex items-center rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                      {roleDef.label}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); logout(); }}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <BsBoxArrowRight className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
