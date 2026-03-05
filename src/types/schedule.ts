/**
 * Schedule / Job Types - Norfolk Cleaners
 * ────────────────────────────────────────
 * Shared types used by the Dispatch Board and Calendar Day View.
 */

// ── Job status ──────────────────────────────────────────────

export type JobStatus =
  | "completed"
  | "in_progress"
  | "upcoming"
  | "cancelled";

// ── Core job shape (matches the data contract) ──────────────

export interface ScheduleJob {
  id: string;
  title: string;
  staff_id: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  status: JobStatus;
  location: string;
}

// ── Staff member (resource row) ─────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  color: string; // tailwind accent, e.g. "cyan"
}

// ── Status style config ─────────────────────────────────────

export interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
}

export const STATUS_STYLES: Record<JobStatus, StatusStyle> = {
  completed: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  in_progress: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
    label: "In Progress",
  },
  upcoming: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    dot: "bg-sky-500",
    label: "Upcoming",
  },
  cancelled: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Cancelled",
  },
};
