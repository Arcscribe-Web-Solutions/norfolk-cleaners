"use client";

/**
 * AppNav – Enterprise-style top navigation bar
 * ─────────────────────────────────────────────
 * Shared across all authenticated pages. Dense 2010s enterprise styling
 * with the real logo, blue accent, and tight layout.
 * Mobile responsive with hamburger menu.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { BsSearch, BsBellFill, BsChevronDown, BsPerson, BsGear, BsBoxArrowRight, BsList, BsX } from "react-icons/bs";
import NewJobModal from "./dashboard/NewJobModal";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard" },
  { label: "Dispatch Board", href: "/schedule" },
  { label: "Invoicing", href: "/invoicing" },
];

const ACCOUNT_ITEMS = [
  { label: "History", href: "/jobs" },
  { label: "Clients", href: "/customers" },
  { label: "Materials & Services", href: "/services-admin" },
  { label: "Settings", href: "/settings" },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export default function AppNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dropdown states
  const [accountOpen, setAccountOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Refs for click outside handling
  const accountRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch("/api/notifications?limit=20");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Mark single notification as read and navigate
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [notification.id] }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.link) {
      router.push(notification.link);
      setNotificationsOpen(false);
    }
  };

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if Account dropdown should be active
  const isAccountActive = ACCOUNT_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to jobs page with search query
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="w-full h-14 bg-white border-b border-gray-300 flex items-center justify-between px-4 shrink-0">
        {/* Left: Logo + nav links */}
        <div className="flex items-center h-full">
          <Link href="/dashboard" className="shrink-0 mr-6">
            <Image
              src="/logo.png"
              alt="Norfolk Cleaners"
              width={128}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center h-full">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center h-full px-3 text-[12px] cursor-pointer border-t-4 ${
                    isActive
                      ? "text-gray-800 font-semibold border-blue-500"
                      : "text-gray-500 hover:text-gray-800 border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Account Dropdown */}
            <div ref={accountRef} className="relative h-full">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`flex items-center h-full px-3 text-[12px] cursor-pointer border-t-4 gap-1 ${
                  isAccountActive
                    ? "text-gray-800 font-semibold border-blue-500"
                    : "text-gray-500 hover:text-gray-800 border-transparent"
                }`}
              >
                Account
                <BsChevronDown className={`w-3 h-3 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>
              
              {accountOpen && (
                <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {ACCOUNT_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAccountOpen(false)}
                        className={`block px-4 py-2 text-[12px] hover:bg-gray-50 ${
                          isActive ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Mobile menu button + New Job button + search + notifications + user */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* New Job button - visible on all sizes */}
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="bg-[#2563eb] text-white px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">New Job</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Search - hidden on mobile */}
          <div ref={searchRef} className="relative hidden md:block">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 hover:bg-gray-100 rounded-sm cursor-pointer"
              title="Search jobs & clients"
            >
              <BsSearch className="w-4 h-4 text-gray-500" />
            </button>
            
            {searchOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs, clients..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">Press Enter to search</p>
                </form>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1 hover:bg-gray-100 rounded-sm cursor-pointer"
              title="Notifications"
            >
              <BsBellFill className="w-4 h-4 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {loadingNotifications && notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[12px] text-gray-500">
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[12px] text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          )}
                          <div className={!notification.isRead ? "" : "ml-4"}>
                            <p className="text-[12px] font-medium text-gray-800">{notification.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link 
                      href="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-blue-600 hover:underline w-full text-center block"
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider - hidden on mobile */}
          <div className="hidden md:block w-px h-6 bg-gray-300" />

          {/* User dropdown - hidden on mobile */}
          {user && (
            <div ref={userRef} className="relative hidden md:block">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 text-[12px] text-gray-600 whitespace-nowrap cursor-pointer hover:text-gray-800"
              >
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <BsPerson className="w-4 h-4 text-blue-600" />
                </div>
                <span>{user.firstName} {user.lastName}</span>
                <BsChevronDown className={`w-3 h-3 transition-transform ${userOpen ? "rotate-180" : ""}`} />
              </button>
              
              {userOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[12px] font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-gray-500 truncate" title={user.email}>{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
                  >
                    <BsGear className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 w-full border-t border-gray-100"
                  >
                    <BsBoxArrowRight className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-sm cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <BsX className="w-5 h-5 text-gray-600" />
            ) : (
              <BsList className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Drawer */}
          <div 
            className="absolute top-14 right-0 w-64 max-w-[80vw] bg-white border-l border-gray-200 shadow-lg h-[calc(100vh-3.5rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info */}
            {user && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BsPerson className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}>
                <div className="relative">
                  <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Main nav links */}
            <div className="py-2">
              <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 text-sm ${
                      isActive 
                        ? "text-blue-600 font-semibold bg-blue-50 border-l-2 border-blue-500" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Account links */}
            <div className="py-2 border-t border-gray-100">
              <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
              {ACCOUNT_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 text-sm ${
                      isActive 
                        ? "text-blue-600 font-semibold bg-blue-50 border-l-2 border-blue-500" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Sign out */}
            <div className="py-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <BsBoxArrowRight className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <NewJobModal open={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />
    </>
  );
}
