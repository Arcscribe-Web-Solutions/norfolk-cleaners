/**
 * Role Definitions - Norfolk Cleaners
 * ─────────────────────────────────────
 * Single source of truth for every role in the system.
 * Mirrors the `user_role` ENUM in the database.
 *
 * Modelled after ServiceM8-style tiered access for a cleaning company.
 */

// ── Role identifiers (match the DB enum) ────────────────────

export const USER_ROLES = [
  "owner",
  "business_owner",
  "finance",
  "staff",
  "staff_no_material",
  "staff_no_pricing",
  "staff_no_pricing_no_attachments",
  "contractor",
  "strict_contractor",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// ── Granular permission flags ───────────────────────────────

export interface RolePermissions {
  // Jobs & Scheduling
  viewAllJobs: boolean;
  viewOwnJobs: boolean;
  createJobs: boolean;
  editJobs: boolean;
  deleteJobs: boolean;

  // Clients
  viewAllClients: boolean;
  viewOwnClients: boolean;
  createClients: boolean;
  editClients: boolean;

  // Quotes & Invoices
  viewQuotes: boolean;
  createQuotes: boolean;
  viewInvoices: boolean;
  createInvoices: boolean;

  // Pricing & Financials
  viewSalePricing: boolean;
  viewJobProfitability: boolean;
  viewFinancialPdfs: boolean;

  // Items & Materials
  createItems: boolean;
  applyExistingItems: boolean;

  // Attachments
  viewAttachments: boolean;

  // Staff & HR
  viewStaffList: boolean;
  manageStaff: boolean;

  // Reporting
  viewReporting: boolean;

  // Settings
  viewSettings: boolean;
  manageSettings: boolean;

  // Account / Subscription
  manageSubscription: boolean;
}

// ── Role definitions with full metadata ─────────────────────

export interface RoleDefinition {
  key: UserRole;
  label: string;
  description: string;
  tier: "owner" | "management" | "staff" | "contractor";
  permissions: RolePermissions;
}

const ALL_TRUE: RolePermissions = {
  viewAllJobs: true,
  viewOwnJobs: true,
  createJobs: true,
  editJobs: true,
  deleteJobs: true,
  viewAllClients: true,
  viewOwnClients: true,
  createClients: true,
  editClients: true,
  viewQuotes: true,
  createQuotes: true,
  viewInvoices: true,
  createInvoices: true,
  viewSalePricing: true,
  viewJobProfitability: true,
  viewFinancialPdfs: true,
  createItems: true,
  applyExistingItems: true,
  viewAttachments: true,
  viewStaffList: true,
  manageStaff: true,
  viewReporting: true,
  viewSettings: true,
  manageSettings: true,
  manageSubscription: true,
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  // ────────────────────────────────────────────────────────
  // OWNER TIER
  // ────────────────────────────────────────────────────────
  owner: {
    key: "owner",
    label: "Owner",
    description:
      "The account owner. Full unrestricted access including subscription " +
      "and billing management. Only one owner per account.",
    tier: "owner",
    permissions: { ...ALL_TRUE },
  },

  business_owner: {
    key: "business_owner",
    label: "Business Owner",
    description:
      "Designed for co-owners or business partners. Full access to " +
      "operations, finances, settings, and staff management, but cannot " +
      "manage the overarching account subscription.",
    tier: "owner",
    permissions: {
      ...ALL_TRUE,
      manageSubscription: false,
    },
  },

  // ────────────────────────────────────────────────────────
  // MANAGEMENT TIER
  // ────────────────────────────────────────────────────────
  finance: {
    key: "finance",
    label: "Finance",
    description:
      "Can access all jobs, quotes, invoices, clients, job history, and " +
      "profitability/costing data. No access to system settings or reporting.",
    tier: "management",
    permissions: {
      viewAllJobs: true,
      viewOwnJobs: true,
      createJobs: false,
      editJobs: false,
      deleteJobs: false,
      viewAllClients: true,
      viewOwnClients: true,
      createClients: false,
      editClients: false,
      viewQuotes: true,
      createQuotes: false,
      viewInvoices: true,
      createInvoices: false,
      viewSalePricing: true,
      viewJobProfitability: true,
      viewFinancialPdfs: true,
      createItems: false,
      applyExistingItems: false,
      viewAttachments: true,
      viewStaffList: true,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  // ────────────────────────────────────────────────────────
  // STAFF TIER
  // ────────────────────────────────────────────────────────
  staff: {
    key: "staff",
    label: "Staff",
    description:
      "Standard employee tier. Can see all jobs, clients, schedules, and " +
      "sale pricing. Can quote, invoice, and add/create items. Cannot see " +
      "job profitability, reporting, or admin settings.",
    tier: "staff",
    permissions: {
      viewAllJobs: true,
      viewOwnJobs: true,
      createJobs: true,
      editJobs: true,
      deleteJobs: false,
      viewAllClients: true,
      viewOwnClients: true,
      createClients: true,
      editClients: true,
      viewQuotes: true,
      createQuotes: true,
      viewInvoices: true,
      createInvoices: true,
      viewSalePricing: true,
      viewJobProfitability: false,
      viewFinancialPdfs: true,
      createItems: true,
      applyExistingItems: true,
      viewAttachments: true,
      viewStaffList: true,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  staff_no_material: {
    key: "staff_no_material",
    label: "Staff (No Material Creation)",
    description:
      "Same as standard Staff, but cannot create brand new items or " +
      "services in the system. Can only apply existing ones to a job.",
    tier: "staff",
    permissions: {
      viewAllJobs: true,
      viewOwnJobs: true,
      createJobs: true,
      editJobs: true,
      deleteJobs: false,
      viewAllClients: true,
      viewOwnClients: true,
      createClients: true,
      editClients: true,
      viewQuotes: true,
      createQuotes: true,
      viewInvoices: true,
      createInvoices: true,
      viewSalePricing: true,
      viewJobProfitability: false,
      viewFinancialPdfs: true,
      createItems: false,
      applyExistingItems: true,
      viewAttachments: true,
      viewStaffList: true,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  staff_no_pricing: {
    key: "staff_no_pricing",
    label: "Staff (No Pricing)",
    description:
      "Can see jobs and schedules but cannot see any quotes, invoices, " +
      "sale pricing, or financial PDFs.",
    tier: "staff",
    permissions: {
      viewAllJobs: true,
      viewOwnJobs: true,
      createJobs: true,
      editJobs: true,
      deleteJobs: false,
      viewAllClients: true,
      viewOwnClients: true,
      createClients: true,
      editClients: true,
      viewQuotes: false,
      createQuotes: false,
      viewInvoices: false,
      createInvoices: false,
      viewSalePricing: false,
      viewJobProfitability: false,
      viewFinancialPdfs: false,
      createItems: true,
      applyExistingItems: true,
      viewAttachments: true,
      viewStaffList: true,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  staff_no_pricing_no_attachments: {
    key: "staff_no_pricing_no_attachments",
    label: "Staff (No Pricing, No Attachments)",
    description:
      "Most restricted internal staff tier. Same as Staff (No Pricing) " +
      "but also blocked from viewing any job diary attachments.",
    tier: "staff",
    permissions: {
      viewAllJobs: true,
      viewOwnJobs: true,
      createJobs: true,
      editJobs: true,
      deleteJobs: false,
      viewAllClients: true,
      viewOwnClients: true,
      createClients: true,
      editClients: true,
      viewQuotes: false,
      createQuotes: false,
      viewInvoices: false,
      createInvoices: false,
      viewSalePricing: false,
      viewJobProfitability: false,
      viewFinancialPdfs: false,
      createItems: true,
      applyExistingItems: true,
      viewAttachments: false,
      viewStaffList: true,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  // ────────────────────────────────────────────────────────
  // CONTRACTOR TIER
  // ────────────────────────────────────────────────────────
  contractor: {
    key: "contractor",
    label: "Contractor",
    description:
      "External outsourced workers. Can only see jobs and clients " +
      "scheduled directly to them. Can quote and invoice for their " +
      "specific work but cannot create new jobs, view the general " +
      "client list, or see other staff members.",
    tier: "contractor",
    permissions: {
      viewAllJobs: false,
      viewOwnJobs: true,
      createJobs: false,
      editJobs: false,
      deleteJobs: false,
      viewAllClients: false,
      viewOwnClients: true,
      createClients: false,
      editClients: false,
      viewQuotes: true,
      createQuotes: true,
      viewInvoices: true,
      createInvoices: true,
      viewSalePricing: true,
      viewJobProfitability: false,
      viewFinancialPdfs: true,
      createItems: false,
      applyExistingItems: true,
      viewAttachments: true,
      viewStaffList: false,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },

  strict_contractor: {
    key: "strict_contractor",
    label: "Strict Contractor",
    description:
      "Most locked-down role. Can only see their own assigned jobs and " +
      "schedules. Cannot quote, invoice, see pricing, add items to a " +
      "job, or view other staff.",
    tier: "contractor",
    permissions: {
      viewAllJobs: false,
      viewOwnJobs: true,
      createJobs: false,
      editJobs: false,
      deleteJobs: false,
      viewAllClients: false,
      viewOwnClients: true,
      createClients: false,
      editClients: false,
      viewQuotes: false,
      createQuotes: false,
      viewInvoices: false,
      createInvoices: false,
      viewSalePricing: false,
      viewJobProfitability: false,
      viewFinancialPdfs: false,
      createItems: false,
      applyExistingItems: false,
      viewAttachments: true,
      viewStaffList: false,
      manageStaff: false,
      viewReporting: false,
      viewSettings: false,
      manageSettings: false,
      manageSubscription: false,
    },
  },
};

// ── Convenience helpers ─────────────────────────────────────

/** Check if a role has a specific permission. */
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_DEFINITIONS[role]?.permissions[permission] ?? false;
}

/** Get all roles that have a specific permission. */
export function rolesWithPermission(permission: keyof RolePermissions): UserRole[] {
  return USER_ROLES.filter((r) => ROLE_DEFINITIONS[r].permissions[permission]);
}

/** Label map for dropdowns / UI. */
export const USER_ROLE_LABELS: Record<UserRole, string> = Object.fromEntries(
  USER_ROLES.map((r) => [r, ROLE_DEFINITIONS[r].label])
) as Record<UserRole, string>;

/** Returns true if the role is at the owner tier. */
export function isOwnerTier(role: UserRole): boolean {
  return ROLE_DEFINITIONS[role].tier === "owner";
}

/** Returns true if the role is any staff variant. */
export function isStaffTier(role: UserRole): boolean {
  return ROLE_DEFINITIONS[role].tier === "staff";
}

/** Returns true if the role is any contractor variant. */
export function isContractorTier(role: UserRole): boolean {
  return ROLE_DEFINITIONS[role].tier === "contractor";
}
