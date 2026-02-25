/**
 * Site-wide configuration.
 * ========================
 * This is the single source of truth for site metadata, navigation,
 * services, and branding. Each client project should customise this file.
 *
 * All page components and layout elements import from here - no
 * hardcoded strings elsewhere in the codebase.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export const siteConfig = {
  /** Client's business / site name */
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Client Site",

  /** Canonical production URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** One-liner used in meta tags and the footer */
  description: "Norfolk Cleaners management platform - a modern ServicesM8 replacement.",

  /** HTML lang attribute + Open Graph locale */
  locale: "en-GB",

  // ---------------------------------------------------------------------------
  // Navigation - management platform pages
  // ---------------------------------------------------------------------------
  nav: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Schedule", href: "/schedule" },
    { label: "Jobs", href: "/jobs" },
    { label: "Customers", href: "/customers" },
    { label: "Settings", href: "/settings" },
  ] satisfies NavItem[],

  // ---------------------------------------------------------------------------
  // Services array removed - not needed for management platform
  // ---------------------------------------------------------------------------
  services: [] satisfies ServiceItem[],

  // ---------------------------------------------------------------------------
  // Arcscribe partnership branding (shown in footer)
  // ---------------------------------------------------------------------------
  arcscribe: {
    name: "Arcscribe Web Solutions",
    url: "https://arcscribe.co.uk",
    tagline: "Clean. Fast. Human.",
  },
} as const;
