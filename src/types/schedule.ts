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

// ── Demo data ───────────────────────────────────────────────

export const DEMO_STAFF: StaffMember[] = [
  { id: "s1", name: "Harvey Washington", role: "Owner",       avatarInitials: "HW", color: "cyan"    },
  { id: "s2", name: "Sarah Mitchell",    role: "Staff",       avatarInitials: "SM", color: "violet"  },
  { id: "s3", name: "James Cole",        role: "Staff",       avatarInitials: "JC", color: "amber"   },
  { id: "s4", name: "Priya Patel",       role: "Staff",       avatarInitials: "PP", color: "emerald" },
  { id: "s5", name: "Tom Barker",        role: "Contractor",  avatarInitials: "TB", color: "rose"    },
];

/** Returns today's date with the given time, e.g. "08:30" → 2026-02-25T08:30:00 */
function todayAt(time: string): string {
  const d = new Date();
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const DEMO_JOBS: ScheduleJob[] = [
  // Harvey
  { id: "j-001", title: "Regular Clean – Mrs. Patterson",     staff_id: "s1", start_time: todayAt("08:30"), end_time: todayAt("10:00"), status: "completed",   location: "14 Riverside Rd, NR1"      },
  { id: "j-002", title: "Deep Clean – Dr. Okonkwo",           staff_id: "s1", start_time: todayAt("10:30"), end_time: todayAt("13:00"), status: "in_progress", location: "7 Cathedral Close, NR1"    },
  { id: "j-003", title: "Regular Clean – The Rose & Crown",   staff_id: "s1", start_time: todayAt("14:00"), end_time: todayAt("15:30"), status: "upcoming",    location: "Crown Rd, NR2"             },

  // Sarah
  { id: "j-004", title: "End of Tenancy – 18 Colman Rd",      staff_id: "s2", start_time: todayAt("09:00"), end_time: todayAt("12:00"), status: "in_progress", location: "18 Colman Rd, NR4"         },
  { id: "j-005", title: "Deep Clean – Blyth & Sons Ltd",      staff_id: "s2", start_time: todayAt("13:30"), end_time: todayAt("15:30"), status: "upcoming",    location: "Unit 4, Wherry Rd, NR1"    },

  // James
  { id: "j-006", title: "Regular Clean – Mr. & Mrs. Chen",    staff_id: "s3", start_time: todayAt("08:00"), end_time: todayAt("09:30"), status: "completed",   location: "22 Eaton Rd, NR4"          },
  { id: "j-007", title: "Window Clean – Norwich Cathedral",   staff_id: "s3", start_time: todayAt("10:00"), end_time: todayAt("12:30"), status: "in_progress", location: "The Close, NR1 4DH"        },
  { id: "j-008", title: "Carpet Clean – Ms. Adebayo",         staff_id: "s3", start_time: todayAt("14:00"), end_time: todayAt("16:00"), status: "upcoming",    location: "5 Bracondale, NR1"         },

  // Priya (off today – no jobs)

  // Tom
  { id: "j-009", title: "Commercial Clean – Anglia Square",   staff_id: "s5", start_time: todayAt("07:00"), end_time: todayAt("09:30"), status: "completed",   location: "Anglia Square, NR3"        },
  { id: "j-010", title: "Regular Clean – Mr. Nguyen",         staff_id: "s5", start_time: todayAt("11:00"), end_time: todayAt("12:30"), status: "upcoming",    location: "44 Unthank Rd, NR2"        },
];
