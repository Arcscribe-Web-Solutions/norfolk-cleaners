/**
 * Site-wide configuration.
 * ========================
 * This is the single source of truth for site metadata, navigation,
 * services, and branding. Each client project should customise this file.
 *
 * All page components and layout elements import from here — no
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
  description: "A website built and managed by Arcscribe Web Solutions.",

  /** HTML lang attribute + Open Graph locale */
  locale: "en-GB",

  // ---------------------------------------------------------------------------
  // Navigation — add, remove or reorder as needed
  // ---------------------------------------------------------------------------
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],

  // ---------------------------------------------------------------------------
  // Homepage services / features — swap icons & copy per client
  // ---------------------------------------------------------------------------
  services: [
    {
      title: "Service One",
      description:
        "Describe the first service or feature here. Keep it concise and benefit-driven.",
      icon: "🎯",
    },
    {
      title: "Service Two",
      description:
        "Describe the second service or feature here. Focus on what the client offers.",
      icon: "⚡",
    },
    {
      title: "Service Three",
      description:
        "Describe the third service or feature here. Highlight the value to the customer.",
      icon: "🛡️",
    },
  ] satisfies ServiceItem[],

  // ---------------------------------------------------------------------------
  // Arcscribe partnership branding (shown in footer)
  // ---------------------------------------------------------------------------
  arcscribe: {
    name: "Arcscribe Web Solutions",
    url: "https://arcscribe.co.uk",
    tagline: "Clean. Fast. Human.",
  },
} as const;
