/**
 * User Types - Norfolk Cleaners
 * ──────────────────────────────
 * Mirrors the `users` table defined in 001_create_users.sql.
 * Import these throughout the app for type-safe user handling.
 */

// ── ENUMs ───────────────────────────────────────────────────

import type { UserRole } from "@/lib/roles";
export type { UserRole } from "@/lib/roles";

export type UserStatus =
  | "active"
  | "on_leave"
  | "suspended"
  | "terminated";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "zero_hour"
  | "contractor"
  | "apprentice";

export type DbsCheckStatus =
  | "not_submitted"
  | "pending"
  | "cleared"
  | "flagged"
  | "expired";

// ── JSONB sub-types ─────────────────────────────────────────

export interface EmergencyContact {
  name?: string;
  relation?: string;
  phone?: string;
}

export interface BankDetails {
  sort_code?: string;
  account_number?: string;
  account_name?: string;
}

export interface Certification {
  name: string;
  issued_by?: string;
  date_issued?: string;   // ISO date
  expiry_date?: string;   // ISO date
  file_url?: string;      // MinIO / R2 link
}

export interface DayAvailability {
  start: string; // "08:00"
  end: string;   // "17:00"
}

export interface WeeklyAvailability {
  mon?: DayAvailability;
  tue?: DayAvailability;
  wed?: DayAvailability;
  thu?: DayAvailability;
  fri?: DayAvailability;
  sat?: DayAvailability;
  sun?: DayAvailability;
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ── Main User type ──────────────────────────────────────────

export interface User {
  // Identity
  id: string;                          // UUID
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null;        // ISO date
  avatar_url: string | null;

  // Role & Access
  role: UserRole;
  status: UserStatus;

  // Employment
  employment_type: EmploymentType;
  employee_code: string | null;
  hourly_rate: number;
  start_date: string | null;           // ISO date
  end_date: string | null;             // ISO date
  max_hours_per_week: number | null;
  national_insurance: string | null;
  bank_details: BankDetails;

  // Compliance & Vetting
  dbs_check_status: DbsCheckStatus;
  dbs_certificate_number: string | null;
  dbs_check_date: string | null;
  dbs_expiry_date: string | null;
  right_to_work_verified: boolean;
  right_to_work_expiry: string | null;

  // Location & Routing
  home_base_address: string | null;
  home_base_postcode: string | null;
  service_radius_miles: number;
  last_known_lat: number | null;
  last_known_lng: number | null;
  last_location_update: string | null;  // ISO timestamp

  // Transport
  has_driving_license: boolean;
  has_own_vehicle: boolean;
  vehicle_registration: string | null;

  // Skills & Capabilities
  skills_tags: string[];
  certifications: Certification[];
  key_holder: boolean;
  uniform_size: string | null;

  // Availability
  availability: WeeklyAvailability;
  preferred_areas: string[];

  // Performance (denormalised)
  avg_rating: number;
  completed_jobs_count: number;

  // Notifications
  device_fcm_token: string | null;
  notification_prefs: NotificationPrefs;

  // HR & Admin
  emergency_contact: EmergencyContact;
  internal_notes: string | null;

  // Timestamps
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}

// ── Helper types ────────────────────────────────────────────

/** Fields exposed to the cleaner themselves (no sensitive data). */
export type UserPublicProfile = Pick<
  User,
  | "id"
  | "first_name"
  | "last_name"
  | "email"
  | "phone_number"
  | "avatar_url"
  | "role"
  | "status"
  | "skills_tags"
  | "avg_rating"
  | "completed_jobs_count"
>;

/** Everything except the password hash - for admin dashboards. */
export type UserWithoutPassword = Omit<User, "password_hash">;

/** Payload accepted when creating a new user. */
export type CreateUserInput = Pick<
  User,
  | "email"
  | "password_hash"
  | "first_name"
  | "last_name"
  | "role"
> &
  Partial<
    Omit<User, "id" | "email" | "password_hash" | "first_name" | "last_name" | "role" | "created_at" | "updated_at">
  >;

/** Payload accepted when updating a user (all fields optional). */
export type UpdateUserInput = Partial<
  Omit<User, "id" | "created_at" | "updated_at">
>;

// ── Display helpers ─────────────────────────────────────────

// Role labels are exported from @/lib/roles (USER_ROLE_LABELS)
export { USER_ROLE_LABELS } from "@/lib/roles";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  suspended: "Suspended",
  terminated: "Terminated",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  zero_hour: "Zero-Hour",
  contractor: "Contractor",
  apprentice: "Apprentice",
};

export const DBS_STATUS_LABELS: Record<DbsCheckStatus, string> = {
  not_submitted: "Not Submitted",
  pending: "Pending",
  cleared: "Cleared",
  flagged: "Flagged",
  expired: "Expired",
};

/** Common skill tags for the dropdown/autocomplete. */
export const SKILL_TAG_OPTIONS = [
  "deep_clean",
  "regular_clean",
  "end_of_tenancy",
  "carpet_washing",
  "window_cleaning",
  "oven_cleaning",
  "upholstery",
  "biohazard",
  "commercial",
  "laundry_ironing",
  "garden_tidy",
  "after_builders",
] as const;

export type SkillTag = (typeof SKILL_TAG_OPTIONS)[number];
