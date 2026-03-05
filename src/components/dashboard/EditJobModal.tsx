"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BsX,
  BsArrowsFullscreen,
  BsCalendar3,
  BsClock,
  BsPerson,
  BsTrash,
  BsExclamationTriangle,
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsGeoAlt,
} from "react-icons/bs";
import { FiLoader } from "react-icons/fi";

/* ── Types ── */

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Job {
  id: string;
  client_id: string;
  customer: string;
  address: string;
  job_type: string | null;
  assigned_to: string;
  assigned_user_id: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  status: string;
  description: string | null;
  priority: string;
  amount: string;
}

interface EditJobModalProps {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const STATUS_OPTIONS = [
  { value: "quote", label: "Quote" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-300",
  medium: "bg-amber-400",
  high: "bg-red-500",
};

const STATUS_COLORS: Record<string, string> = {
  quote: "bg-purple-500",
  scheduled: "bg-blue-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-400",
};

function toLocalDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function toLocalTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combineDateAndTime(date: string, time: string): string | null {
  if (!date) return null;
  if (!time) return `${date}T09:00:00`;
  return `${date}T${time}:00`;
}

export default function EditJobModal({
  open,
  job,
  onClose,
  onSaved,
  onDeleted,
}: EditJobModalProps) {
  /* ── Form state ── */
  const [status, setStatus] = useState("quote");
  const [jobType, setJobType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");

  /* ── UI state ── */
  const [staff, setStaff] = useState<Staff[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Drag state ── */
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  /* ── Drag handlers ── */
  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setDragging(true);
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    },
    [pos],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  /* ── Populate form from job ── */
  useEffect(() => {
    if (!open || !job) return;
    setStatus(job.status);
    setJobType(job.job_type || "");
    setDescription(job.description || "");
    setPriority(job.priority);
    setScheduleDate(toLocalDate(job.scheduled_start));
    setStartTime(toLocalTime(job.scheduled_start));
    setEndTime(toLocalTime(job.scheduled_end));
    setAssignedUserId(job.assigned_user_id || "");
    setSaving(false);
    setSaved(false);
    setError(null);
    setConfirmDelete(false);
    setDeleting(false);
    setPos({ x: 0, y: 0 });
  }, [open, job]);

  /* ── Fetch staff for assignment dropdown ── */
  useEffect(() => {
    if (!open) return;
    fetch("/api/staff")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStaff(json.data);
      })
      .catch(() => {});
  }, [open]);

  /* ── Save ── */
  const handleSave = useCallback(async () => {
    if (!job) return;
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const scheduledStart = combineDateAndTime(scheduleDate, startTime);
      const scheduledEnd = combineDateAndTime(scheduleDate, endTime);

      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: job.id,
          status,
          jobType: jobType || undefined,
          description: description || undefined,
          priority,
          scheduledStart,
          scheduledEnd,
          assignedUserId: assignedUserId || null,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update job");

      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [job, status, jobType, description, priority, scheduleDate, startTime, endTime, assignedUserId, onSaved]);

  /* ── Delete ── */
  const handleDelete = useCallback(async () => {
    if (!job) return;
    setDeleting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: job.id }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete job");

      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [job, onDeleted]);

  if (!open || !job) return null;

  const shortId = job.id.slice(0, 8).toUpperCase();
  const hasSchedule = scheduleDate && startTime;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div
        className="w-[680px] bg-white shadow-xl flex flex-col font-sans text-gray-800"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          willChange: dragging ? "transform" : undefined,
          maxHeight: "90vh",
        }}
      >
        {/* ── Header ── */}
        <div
          className="h-8 bg-[#00809d] flex items-center justify-between px-3 shrink-0 select-none"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={onDragStart}
        >
          <span className="text-white font-bold text-[13px]">
            Edit Job #{shortId}
          </span>
          <div className="flex items-center gap-2">
            <button className="text-white hover:text-white/80">
              <BsArrowsFullscreen className="w-3 h-3" />
            </button>
            <button className="text-white hover:text-white/80" onClick={onClose}>
              <BsX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-[11px] px-2 py-1 flex items-center gap-1">
              <BsExclamationCircleFill className="w-3 h-3 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Client Info (read-only) ── */}
          <div className="bg-gray-50 border border-gray-200 p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00809d] text-white text-[13px] flex items-center justify-center shrink-0 font-bold">
              {job.customer.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[13px] text-gray-800">{job.customer}</div>
              {job.address && (
                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <BsGeoAlt className="w-2.5 h-2.5 shrink-0" />
                  {job.address}
                </div>
              )}
            </div>
            <div className="text-[10px] text-gray-400 shrink-0">ID: {shortId}</div>
          </div>

          {/* ── Status / Priority / Type row ── */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                Status
              </label>
              <div className="border border-gray-300 p-1 text-[11px] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || "bg-gray-400"} shrink-0`} />
                <select
                  className="bg-transparent text-[11px] w-full focus:outline-none appearance-none cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                Priority
              </label>
              <div className="border border-gray-300 p-1 text-[11px] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority] || "bg-gray-400"} shrink-0`} />
                <select
                  className="bg-transparent text-[11px] w-full focus:outline-none appearance-none cursor-pointer"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                Job Type
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-1 text-[11px] focus:outline-none focus:border-gray-400"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                placeholder="e.g. Residential"
              />
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
              Description
            </label>
            <textarea
              placeholder="Describe the work..."
              className="w-full border border-gray-300 p-2 text-[12px] placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ── Scheduling Section ── */}
          <div className="border border-blue-200 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <BsCalendar3 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[12px] font-bold text-blue-800">
                Schedule to Dispatch Board
              </span>
              {hasSchedule && (
                <BsCheckCircleFill className="w-3 h-3 text-emerald-500 ml-auto" />
              )}
            </div>

            <p className="text-[10px] text-blue-600 mb-3">
              Set a date, time, and assigned staff member to add this job to the dispatch board.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-1 text-[11px] focus:outline-none focus:border-blue-400 bg-white"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                  Start Time
                </label>
                <div className="border border-gray-300 flex items-center bg-white">
                  <BsClock className="w-3 h-3 text-gray-400 ml-1.5 shrink-0" />
                  <input
                    type="time"
                    className="flex-1 p-1 text-[11px] focus:outline-none bg-transparent"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                  End Time
                </label>
                <div className="border border-gray-300 flex items-center bg-white">
                  <BsClock className="w-3 h-3 text-gray-400 ml-1.5 shrink-0" />
                  <input
                    type="time"
                    className="flex-1 p-1 text-[11px] focus:outline-none bg-transparent"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Assign staff ── */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">
                Assigned Staff
              </label>
              <div className="border border-gray-300 flex items-center bg-white">
                <BsPerson className="w-3 h-3 text-gray-400 ml-1.5 shrink-0" />
                <select
                  className="flex-1 p-1 text-[11px] focus:outline-none bg-transparent appearance-none cursor-pointer"
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasSchedule && assignedUserId && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] text-emerald-700 flex items-center gap-1">
                <BsCheckCircleFill className="w-3 h-3 shrink-0" />
                This job will appear on the dispatch board for{" "}
                {new Date(scheduleDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-300 px-4 py-2 flex items-center gap-2 shrink-0 bg-[#fafafa]">
          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-red-600 flex items-center gap-1">
                <BsExclamationTriangle className="w-3 h-3" />
                Are you sure?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 cursor-pointer"
            >
              <BsTrash className="w-3 h-3" />
              Delete Job
            </button>
          )}

          <div className="flex-1" />

          {/* Save */}
          <button
            onClick={onClose}
            className="px-4 py-1 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1 text-[11px] font-bold text-white flex items-center gap-1 ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : saved
                  ? "bg-emerald-600 cursor-pointer"
                  : "bg-[#00809d] hover:bg-[#006d86] cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <FiLoader className="w-3 h-3 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <BsCheckCircleFill className="w-3 h-3" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
