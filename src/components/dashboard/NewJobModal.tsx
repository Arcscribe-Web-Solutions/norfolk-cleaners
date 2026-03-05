"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  BsEnvelope,
  BsPhone,
  BsCalendar3,
  BsListUl,
  BsFileEarmarkText,
  BsTools,
  BsClipboard,
  BsArrowRepeat,
  BsThreeDots,
  BsArrowsFullscreen,
  BsX,
  BsPaperclip,
  BsImage,
  BsInfoCircleFill,
  BsPlusCircle,
  BsCheckCircleFill,
  BsReceipt,
  BsClipboard2Check,
  BsExclamationCircleFill,
  BsPersonPlus,
  BsSearch,
  BsXCircleFill,
  BsTelephone,
  BsEnvelopeAt,
  BsGeoAlt,
  BsClock,
  BsPerson,
  BsExclamationTriangle,
  BsChevronLeft,
  BsChevronRight,
  BsCalendarEvent,
} from "react-icons/bs";
import { FiLoader } from "react-icons/fi";

/* ── Types ── */

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface FeedItem {
  type: "system" | "note";
  text: string;
  time: string;
  author: string;
}

interface StaffJob {
  id: string;
  jobType: string | null;
  customer: string;
  scheduledStart: string;
  scheduledEnd: string | null;
  status: string;
  location: string;
  description: string | null;
}

interface StaffSchedule {
  id: string;
  name: string;
  initials: string;
  role: string;
  jobs: StaffJob[];
  jobCount: number;
}

interface NewJobModalProps {
  open: boolean;
  onClose: () => void;
}

type TabId = "details" | "schedule" | "billing";

const STATUS_OPTIONS = ["Work Order", "Quote", "Scheduled", "In Progress", "Completed"];
const CATEGORY_OPTIONS = ["", "Residential", "Commercial", "Deep Clean"];

/* ── Timeline constants ── */
const TIMELINE_START_HOUR = 6; // 6 AM
const TIMELINE_END_HOUR = 20; // 8 PM
const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
const HOUR_WIDTH = 80; // px per hour
const TIMELINE_WIDTH = TIMELINE_HOURS * HOUR_WIDTH;

/* ── Staff avatar colours ── */
const STAFF_COLORS = [
  { bg: "bg-cyan-600", text: "text-white" },
  { bg: "bg-violet-600", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
  { bg: "bg-rose-600", text: "text-white" },
  { bg: "bg-sky-600", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-fuchsia-600", text: "text-white" },
];

function combineDateAndTime(date: string, time: string): string | null {
  if (!date) return null;
  if (!time) return `${date}T09:00:00`;
  return `${date}T${time}:00`;
}

export default function NewJobModal({ open, onClose }: NewJobModalProps) {
  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<TabId>("details");

  /* ── Form state ── */
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Work Order");
  const [jobCategory, setJobCategory] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [description, setDescription] = useState("");
  const [contactFirst, setContactFirst] = useState("");
  const [contactLast, setContactLast] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [note, setNote] = useState("");

  /* ── Schedule state ── */
  const [scheduleDate, setScheduleDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  /* ── UI state ── */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  /* ── Drag state ── */
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const clientInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

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

  /* ── Fetch clients on open ── */
  useEffect(() => {
    if (!open) return;
    setActiveTab("details");
    setClientSearch("");
    setSelectedClient(null);
    setIsCreatingNewClient(false);
    setAddress("");
    setStatus("Work Order");
    setJobCategory("");
    setPoNumber("");
    setDescription("");
    setContactFirst("");
    setContactLast("");
    setContactEmail("");
    setContactPhone("");
    setContactMobile("");
    setNote("");
    setScheduleDate("");
    setStartTime("");
    setEndTime("");
    setAssignedUserId("");
    setStaffSchedules([]);
    setSelectedStaffId(null);
    setSaving(false);
    setSaved(false);
    setError(null);
    setFeed([]);
    setCreatedJobId(null);
    setShowClientDropdown(false);
    setHighlightedIdx(-1);
    setPos({ x: 0, y: 0 });

    fetch("/api/customers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setClients(json.data);
      })
      .catch(() => {});
  }, [open]);

  /* ── Filter clients as user types ── */
  useEffect(() => {
    if (!clientSearch.trim()) {
      setFilteredClients(clients.slice(0, 12));
      return;
    }
    const q = clientSearch.toLowerCase();
    setFilteredClients(
      clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.address.toLowerCase().includes(q),
        )
        .slice(0, 12),
    );
  }, [clientSearch, clients]);

  /* ── Reset highlight when filtered list changes ── */
  useEffect(() => {
    setHighlightedIdx(-1);
  }, [filteredClients]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!showClientDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        clientInputRef.current &&
        !clientInputRef.current.contains(e.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showClientDropdown]);

  /* ── Pick a client ── */
  const pickClient = useCallback((c: Client) => {
    setSelectedClient(c);
    setClientSearch("");
    setShowClientDropdown(false);
    setIsCreatingNewClient(false);
    if (c.address) setAddress(c.address);
    const parts = c.name.split(" ");
    if (parts.length >= 2) {
      setContactFirst(parts[0]);
      setContactLast(parts.slice(1).join(" "));
    } else if (parts.length === 1) {
      setContactFirst(parts[0]);
    }
    if (c.email) setContactEmail(c.email);
    if (c.phone) setContactPhone(c.phone);
  }, []);

  /* ── Clear selected client ── */
  const clearClient = useCallback(() => {
    setSelectedClient(null);
    setIsCreatingNewClient(false);
    setClientSearch("");
    setContactFirst("");
    setContactLast("");
    setContactEmail("");
    setContactPhone("");
    setContactMobile("");
    setAddress("");
    setTimeout(() => clientInputRef.current?.focus(), 0);
  }, []);

  /* ── Choose "Create New Client" ── */
  const startNewClient = useCallback(() => {
    setSelectedClient(null);
    setIsCreatingNewClient(true);
    setShowClientDropdown(false);
    setClientSearch("");
  }, []);

  /* ── Keyboard nav for dropdown ── */
  const handleClientKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showClientDropdown) return;
      const total = filteredClients.length + 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIdx((prev) => (prev + 1) % total);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIdx((prev) => (prev - 1 + total) % total);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIdx >= 0 && highlightedIdx < filteredClients.length) {
          pickClient(filteredClients[highlightedIdx]);
        } else if (highlightedIdx === filteredClients.length) {
          startNewClient();
        }
      } else if (e.key === "Escape") {
        setShowClientDropdown(false);
      }
    },
    [showClientDropdown, filteredClients, highlightedIdx, pickClient, startNewClient],
  );

  /* ── Fetch staff schedules when date changes ── */
  useEffect(() => {
    if (!scheduleDate) {
      setStaffSchedules([]);
      return;
    }
    setLoadingSchedule(true);
    fetch(`/api/staff/schedule?date=${scheduleDate}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStaffSchedules(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSchedule(false));
  }, [scheduleDate]);

  /* ── Scroll timeline to 8am area on load ── */
  useEffect(() => {
    if (activeTab === "schedule" && timelineScrollRef.current) {
      // scroll to ~7am
      timelineScrollRef.current.scrollLeft = (7 - TIMELINE_START_HOUR) * HOUR_WIDTH;
    }
  }, [activeTab, staffSchedules]);

  /* ── Conflict detection ── */
  const conflicts = useMemo(() => {
    if (!scheduleDate || !startTime || !assignedUserId) return [];
    const staff = staffSchedules.find((s) => s.id === assignedUserId);
    if (!staff) return [];

    const newStart = new Date(`${scheduleDate}T${startTime}:00`);
    const newEnd = endTime
      ? new Date(`${scheduleDate}T${endTime}:00`)
      : new Date(newStart.getTime() + 60 * 60 * 1000); // default 1hr

    return staff.jobs.filter((j) => {
      const jStart = new Date(j.scheduledStart);
      const jEnd = j.scheduledEnd
        ? new Date(j.scheduledEnd)
        : new Date(jStart.getTime() + 60 * 60 * 1000);
      // overlap: new starts before existing ends AND new ends after existing starts
      return newStart < jEnd && newEnd > jStart;
    });
  }, [scheduleDate, startTime, endTime, assignedUserId, staffSchedules]);

  /* ── Submit ── */
  const handleSave = useCallback(async () => {
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const payload: Record<string, string | undefined> = {
        status,
        jobType: jobCategory || undefined,
        description: description || undefined,
        address: address || undefined,
        priority: "medium",
        note: note || undefined,
      };

      // schedule fields
      if (scheduleDate && startTime) {
        payload.scheduledStart = combineDateAndTime(scheduleDate, startTime) || undefined;
        payload.scheduledEnd = combineDateAndTime(scheduleDate, endTime) || undefined;
        if (assignedUserId) payload.assignedUserId = assignedUserId;
        // auto-set status to Scheduled if still on Work Order/Quote
        if (status === "Work Order" || status === "Quote") {
          payload.status = "Scheduled";
        }
      }

      if (selectedClient) {
        payload.clientId = selectedClient.id;
      } else {
        payload.clientFirstName = contactFirst || undefined;
        payload.clientLastName = contactLast || undefined;
        payload.clientEmail = contactEmail || undefined;
        payload.clientPhone = contactPhone || undefined;
        payload.clientMobile = contactMobile || undefined;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to create job");
      }

      setCreatedJobId(json.data.id);
      setSaved(true);

      const now = new Date();
      const timeStr =
        now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) +
        " " +
        now.toLocaleDateString("en-US", { month: "numeric", day: "2-digit", year: "numeric" });

      setFeed([
        { type: "system", text: "Job Created", time: timeStr, author: "You" },
        ...(scheduleDate && startTime
          ? [{ type: "system" as const, text: `Scheduled for ${scheduleDate}`, time: timeStr, author: "You" }]
          : []),
        ...(note
          ? [{ type: "note" as const, text: note, time: timeStr, author: "You" }]
          : []),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [status, jobCategory, description, address, note, selectedClient, contactFirst, contactLast, contactEmail, contactPhone, contactMobile, scheduleDate, startTime, endTime, assignedUserId]);

  if (!open) return null;

  const shortId = createdJobId ? createdJobId.slice(0, 8).toUpperCase() : "NEW";
  const hasSchedule = scheduleDate && startTime;

  /* ── Tab definitions ── */
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "details", label: "Details", icon: <BsClipboard2Check className="w-4 h-4" /> },
    { id: "schedule", label: "Schedule", icon: <BsCalendar3 className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <BsReceipt className="w-4 h-4" /> },
  ];

  /* ── Date nav helpers ── */
  const dateLabel = scheduleDate
    ? new Date(scheduleDate + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select a date";

  const nudgeDate = (days: number) => {
    const d = scheduleDate ? new Date(scheduleDate + "T00:00:00") : new Date();
    d.setDate(d.getDate() + days);
    setScheduleDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div
        className="w-[1050px] h-[650px] bg-white shadow-xl flex flex-col font-sans text-gray-800"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          willChange: dragging ? "transform" : undefined,
        }}
      >
        {/* ── Header (drag handle) ── */}
        <div
          className="h-8 bg-[#00809d] flex items-center justify-between px-3 shrink-0 select-none"
          style={{ cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={onDragStart}
        >
          <span className="text-white font-bold text-[13px]">Job #{shortId}</span>
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
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* ── Left Vertical Tabs ── */}
          <div className="w-16 bg-[#f9f9f9] border-r border-gray-300 flex flex-col items-center py-2 shrink-0 relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 mb-3 group ${
                  activeTab === tab.id ? "" : ""
                }`}
              >
                <span className={activeTab === tab.id ? "text-[#00809d]" : "text-gray-400"}>
                  {tab.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    activeTab === tab.id ? "text-[#00809d]" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
                {/* Schedule badge */}
                {tab.id === "schedule" && hasSchedule && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-[42px] right-2" />
                )}
              </button>
            ))}
            <div className="absolute bottom-2 flex flex-col items-center gap-0.5">
              {saving ? (
                <>
                  <FiLoader className="w-3 h-3 text-gray-400 animate-spin" />
                  <span className="text-[9px] text-gray-400 font-medium">Saving</span>
                </>
              ) : saved ? (
                <>
                  <BsCheckCircleFill className="w-3 h-3 text-[#00809d]" />
                  <span className="text-[9px] text-[#00809d] font-medium">Saved</span>
                </>
              ) : error ? (
                <>
                  <BsExclamationCircleFill className="w-3 h-3 text-red-500" />
                  <span className="text-[9px] text-red-500 font-medium">Error</span>
                </>
              ) : (
                <>
                  <BsCheckCircleFill className="w-3 h-3 text-gray-300" />
                  <span className="text-[9px] text-gray-300 font-medium">Draft</span>
                </>
              )}
            </div>
          </div>

          {/* ── Main Content Area ── */}
          <div className="flex-1 flex flex-col">
            {/* ── Top Action Ribbon ── */}
            <div className="h-10 bg-[#f9f9f9] border-b border-gray-300 flex items-center px-2 gap-4 shrink-0">
              <RibbonItem icon={<BsEnvelope className="w-3 h-3" />} label="Email" />
              <RibbonItem icon={<BsPhone className="w-3 h-3" />} label="SMS" />
              <RibbonItem
                icon={<BsCalendar3 className="w-3 h-3" />}
                label="Schedule"
                active={activeTab === "schedule"}
                onClick={() => setActiveTab("schedule")}
              />
              <RibbonItem icon={<BsListUl className="w-3 h-3" />} label="Queue" />
              <RibbonItem icon={<BsFileEarmarkText className="w-3 h-3" />} label="Form" />
              <RibbonItem icon={<BsTools className="w-3 h-3" />} label="Service" />
              <RibbonItem icon={<BsClipboard className="w-3 h-3" />} label="Proposal" />
              <RibbonItem icon={<BsArrowRepeat className="w-3 h-3" />} label="Recurrence" />
              <RibbonItem icon={<BsThreeDots className="w-3 h-3" />} label="More" />
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "details" && (
              <DetailsTab
                error={error}
                selectedClient={selectedClient}
                clearClient={clearClient}
                isCreatingNewClient={isCreatingNewClient}
                clientInputRef={clientInputRef}
                clientSearch={clientSearch}
                setClientSearch={setClientSearch}
                setShowClientDropdown={setShowClientDropdown}
                handleClientKeyDown={handleClientKeyDown}
                showClientDropdown={showClientDropdown}
                dropdownRef={dropdownRef}
                filteredClients={filteredClients}
                highlightedIdx={highlightedIdx}
                setHighlightedIdx={setHighlightedIdx}
                pickClient={pickClient}
                startNewClient={startNewClient}
                address={address}
                setAddress={setAddress}
                status={status}
                setStatus={setStatus}
                jobCategory={jobCategory}
                setJobCategory={setJobCategory}
                poNumber={poNumber}
                setPoNumber={setPoNumber}
                description={description}
                setDescription={setDescription}
                contactFirst={contactFirst}
                setContactFirst={setContactFirst}
                contactLast={contactLast}
                setContactLast={setContactLast}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactPhone={contactPhone}
                setContactPhone={setContactPhone}
                contactMobile={contactMobile}
                setContactMobile={setContactMobile}
                saving={saving}
                saved={saved}
                createdJobId={createdJobId}
                handleSave={handleSave}
                note={note}
                setNote={setNote}
                feed={feed}
                hasSchedule={!!hasSchedule}
                scheduleDate={scheduleDate}
                assignedUserId={assignedUserId}
                staffSchedules={staffSchedules}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleTab
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                assignedUserId={assignedUserId}
                setAssignedUserId={setAssignedUserId}
                staffSchedules={staffSchedules}
                loadingSchedule={loadingSchedule}
                selectedStaffId={selectedStaffId}
                setSelectedStaffId={setSelectedStaffId}
                conflicts={conflicts}
                dateLabel={dateLabel}
                nudgeDate={nudgeDate}
                timelineScrollRef={timelineScrollRef}
                saving={saving}
                saved={saved}
                handleSave={handleSave}
              />
            )}

            {activeTab === "billing" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BsReceipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[12px] text-gray-400">Billing & invoicing coming soon</p>
                  <p className="text-[10px] text-gray-300 mt-1">Line items, pricing, and payment tracking</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DETAILS TAB  (extracted from original form)
   ════════════════════════════════════════════════════════════ */
function DetailsTab({
  error, selectedClient, clearClient, isCreatingNewClient,
  clientInputRef, clientSearch, setClientSearch, setShowClientDropdown,
  handleClientKeyDown, showClientDropdown, dropdownRef, filteredClients,
  highlightedIdx, setHighlightedIdx, pickClient, startNewClient,
  address, setAddress, status, setStatus, jobCategory, setJobCategory,
  poNumber, setPoNumber, description, setDescription,
  contactFirst, setContactFirst, contactLast, setContactLast,
  contactEmail, setContactEmail, contactPhone, setContactPhone,
  contactMobile, setContactMobile,
  saving, saved, createdJobId, handleSave,
  note, setNote, feed,
  hasSchedule, scheduleDate, assignedUserId, staffSchedules,
}: {
  error: string | null;
  selectedClient: Client | null;
  clearClient: () => void;
  isCreatingNewClient: boolean;
  clientInputRef: React.RefObject<HTMLInputElement | null>;
  clientSearch: string;
  setClientSearch: (v: string) => void;
  setShowClientDropdown: (v: boolean) => void;
  handleClientKeyDown: (e: React.KeyboardEvent) => void;
  showClientDropdown: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  filteredClients: Client[];
  highlightedIdx: number;
  setHighlightedIdx: (v: number) => void;
  pickClient: (c: Client) => void;
  startNewClient: () => void;
  address: string;
  setAddress: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  jobCategory: string;
  setJobCategory: (v: string) => void;
  poNumber: string;
  setPoNumber: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  contactFirst: string;
  setContactFirst: (v: string) => void;
  contactLast: string;
  setContactLast: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  contactMobile: string;
  setContactMobile: (v: string) => void;
  saving: boolean;
  saved: boolean;
  createdJobId: string | null;
  handleSave: () => void;
  note: string;
  setNote: (v: string) => void;
  feed: FeedItem[];
  hasSchedule: boolean;
  scheduleDate: string;
  assignedUserId: string;
  staffSchedules: StaffSchedule[];
}) {
  const staffName = assignedUserId
    ? staffSchedules.find((s) => s.id === assignedUserId)?.name ?? "Staff"
    : null;

  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      {/* ── Left Column: Job Details Form ── */}
      <div className="w-[55%] p-4 overflow-y-auto flex flex-col gap-3">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-[11px] px-2 py-1 flex items-center gap-1">
            <BsExclamationCircleFill className="w-3 h-3 shrink-0" />
            {error}
          </div>
        )}

        {/* Schedule summary badge */}
        {hasSchedule && (
          <div className="bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-[11px] text-emerald-700 flex items-center gap-1.5">
            <BsCheckCircleFill className="w-3 h-3 shrink-0" />
            <span>
              Scheduled for{" "}
              <strong>
                {new Date(scheduleDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </strong>
              {staffName && (
                <>
                  {" "}— assigned to <strong>{staffName}</strong>
                </>
              )}
            </span>
          </div>
        )}

        {/* ── Client Selector ── */}
        <div className="relative">
          <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 block">Client</label>

          {selectedClient ? (
            <div className="w-full border border-gray-300 bg-gray-50 p-1 text-[12px] flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[#00809d] text-white text-[10px] flex items-center justify-center shrink-0 font-bold">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-gray-800 truncate">{selectedClient.name}</span>
                {selectedClient.email && (
                  <span className="text-gray-400 text-[10px] truncate hidden sm:inline">&middot; {selectedClient.email}</span>
                )}
              </div>
              <button onClick={clearClient} className="text-gray-400 hover:text-gray-600 shrink-0 ml-1" title="Change client">
                <BsXCircleFill className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isCreatingNewClient ? (
            <div className="w-full border border-[#00809d] bg-teal-50 p-1 text-[12px] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BsPersonPlus className="w-3.5 h-3.5 text-[#00809d]" />
                <span className="font-medium text-[#00809d]">Creating new client</span>
                <span className="text-[10px] text-gray-400">(fill contacts below)</span>
              </div>
              <button onClick={clearClient} className="text-gray-400 hover:text-gray-600 shrink-0 ml-1" title="Cancel">
                <BsXCircleFill className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="w-full border border-gray-300 flex items-center bg-white">
                <BsSearch className="w-3 h-3 text-gray-400 ml-1.5 shrink-0" />
                <input
                  ref={clientInputRef}
                  type="text"
                  placeholder="Search clients by name, email, phone, or address..."
                  className="flex-1 p-1 pl-1.5 text-[12px] placeholder-gray-400 focus:outline-none bg-transparent"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  onKeyDown={handleClientKeyDown}
                />
                {clientSearch && (
                  <button
                    onClick={() => { setClientSearch(""); clientInputRef.current?.focus(); }}
                    className="text-gray-300 hover:text-gray-500 mr-1"
                  >
                    <BsX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {showClientDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-full bg-white border border-gray-300 z-20 max-h-[220px] overflow-y-auto shadow-lg"
                >
                  <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500 uppercase tracking-wide sticky top-0">
                    {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""} found
                  </div>
                  {filteredClients.map((c, idx) => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-2 py-1.5 border-b border-gray-100 last:border-0 ${
                        highlightedIdx === idx ? "bg-[#e6f4f7]" : "hover:bg-gray-50"
                      }`}
                      onMouseDown={(e) => { e.preventDefault(); pickClient(c); }}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#00809d] text-white text-[9px] flex items-center justify-center shrink-0 font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-[12px] text-gray-800 truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 ml-[26px] text-[10px] text-gray-400">
                        {c.email && (
                          <span className="flex items-center gap-0.5 truncate">
                            <BsEnvelopeAt className="w-2.5 h-2.5 shrink-0" /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-0.5">
                            <BsTelephone className="w-2.5 h-2.5 shrink-0" /> {c.phone}
                          </span>
                        )}
                        {c.address && (
                          <span className="flex items-center gap-0.5 truncate">
                            <BsGeoAlt className="w-2.5 h-2.5 shrink-0" /> {c.address}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    className={`w-full text-left px-2 py-2 flex items-center gap-2 border-t border-gray-200 ${
                      highlightedIdx === filteredClients.length ? "bg-[#e6f4f7]" : "hover:bg-gray-50"
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); startNewClient(); }}
                    onMouseEnter={() => setHighlightedIdx(filteredClients.length)}
                  >
                    <BsPersonPlus className="w-3.5 h-3.5 text-[#00809d]" />
                    <span className="text-[12px] font-medium text-[#00809d]">
                      Create new client
                      {clientSearch.trim() && (
                        <span className="font-normal text-gray-500"> &ldquo;{clientSearch.trim()}&rdquo;</span>
                      )}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address Box */}
        <div className="flex items-start gap-2">
          <textarea
            placeholder="Enter Job Address"
            className="border border-gray-300 p-1 h-16 w-[90%] text-[12px] placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100 text-gray-500 flex items-center justify-center text-[14px] hover:bg-gray-200 shrink-0 mt-1">
            +
          </button>
        </div>

        {/* Status Row */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5 flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Job Status</label>
            <div className="border border-gray-300 p-1 text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00809d] shrink-0" />
              <select
                className="bg-transparent text-[11px] w-full focus:outline-none appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Job Category</label>
            <select
              className="border border-gray-300 p-1 text-[11px] bg-white focus:outline-none appearance-none cursor-pointer"
              value={jobCategory}
              onChange={(e) => setJobCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c || "\u00A0"}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">PO Number</label>
            <input
              type="text"
              className="border border-gray-300 p-1 text-[11px] focus:outline-none focus:border-gray-400"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <textarea
          placeholder="Describe the work that needs to be done"
          className="border border-gray-300 p-1 h-20 text-[12px] placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Checklist */}
        <div className="border border-gray-200 p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-gray-700">Checklist</span>
          </div>
          <button className="text-[11px] text-[#00809d] hover:underline flex items-center gap-1">
            <BsPlusCircle className="w-3 h-3" />
            New Item
          </button>
        </div>

        {/* Contacts Section */}
        <div>
          <span className="text-[11px] font-semibold text-gray-700 block mb-1">Contacts</span>
          <div className="grid grid-cols-5 gap-1">
            <input
              type="text"
              placeholder="First name"
              className="border border-gray-300 p-1 text-[11px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              value={contactFirst}
              onChange={(e) => setContactFirst(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name"
              className="border border-gray-300 p-1 text-[11px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              value={contactLast}
              onChange={(e) => setContactLast(e.target.value)}
            />
            <input
              type="text"
              placeholder="Email"
              className="border border-gray-300 p-1 text-[11px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone"
              className="border border-gray-300 p-1 text-[11px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Mobile"
              className="border border-gray-300 p-1 text-[11px] placeholder-gray-400 focus:outline-none focus:border-gray-400"
              value={contactMobile}
              onChange={(e) => setContactMobile(e.target.value)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`px-4 py-1 text-[11px] font-bold text-white ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : saved
                  ? "bg-green-600 cursor-default"
                  : "bg-[#00809d] hover:bg-[#006d86] cursor-pointer"
            }`}
          >
            {saving ? "Saving..." : saved ? "✓ Job Created" : "Save Job"}
          </button>
          {saved && (
            <span className="text-[10px] text-gray-500">
              ID: {createdJobId?.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* ── Right Column: Job Diary/Notes ── */}
      <div className="w-[45%] border-l border-gray-300 flex flex-col">
        <div className="p-2 border-b border-gray-300 bg-[#f9f9f9]">
          <div className="bg-white border border-gray-300 p-1.5 w-full flex items-center">
            <input
              type="text"
              placeholder="Type a job note here..."
              className="flex-1 text-[12px] placeholder-gray-400 focus:outline-none bg-transparent"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <button className="text-gray-400 hover:text-gray-600"><BsPaperclip className="w-3.5 h-3.5" /></button>
              <button className="text-gray-400 hover:text-gray-600"><BsImage className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {feed.length === 0 ? (
            <p className="text-[11px] text-gray-400 text-center mt-8">
              Job history will appear here after saving.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {feed.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#00809d] flex items-center justify-center shrink-0 mt-0.5">
                    <BsInfoCircleFill className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-gray-800">{item.text}</span>
                    <p className="text-[11px] text-gray-400">
                      {item.time} &bull; by {item.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   SCHEDULE TAB  (ServiceM8 style — pick staff, see timeline, conflicts)
   ════════════════════════════════════════════════════════════ */
function ScheduleTab({
  scheduleDate, setScheduleDate,
  startTime, setStartTime,
  endTime, setEndTime,
  assignedUserId, setAssignedUserId,
  staffSchedules, loadingSchedule,
  selectedStaffId, setSelectedStaffId,
  conflicts, dateLabel, nudgeDate,
  timelineScrollRef,
  saving, saved, handleSave,
}: {
  scheduleDate: string;
  setScheduleDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  assignedUserId: string;
  setAssignedUserId: (v: string) => void;
  staffSchedules: StaffSchedule[];
  loadingSchedule: boolean;
  selectedStaffId: string | null;
  setSelectedStaffId: (v: string | null) => void;
  conflicts: StaffJob[];
  dateLabel: string;
  nudgeDate: (days: number) => void;
  timelineScrollRef: React.RefObject<HTMLDivElement | null>;
  saving: boolean;
  saved: boolean;
  handleSave: () => void;
}) {
  const hasSchedule = scheduleDate && startTime;

  /* ── Which staff to show expanded timeline for ── */
  const expandedStaff = selectedStaffId ?? assignedUserId ?? null;

  /* ── Set today as default ── */
  const setToday = () => {
    const d = new Date();
    setScheduleDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Date Picker Bar ── */}
      <div className="px-4 py-3 border-b border-gray-200 bg-[#fafafa]">
        <div className="flex items-center gap-3">
          <BsCalendar3 className="w-4 h-4 text-[#00809d]" />
          <span className="text-[12px] font-bold text-gray-800">Schedule Job</span>
          <div className="flex-1" />

          <button
            onClick={() => nudgeDate(-1)}
            className="w-6 h-6 border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50"
          >
            <BsChevronLeft className="w-2.5 h-2.5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 border border-gray-300 bg-white px-2 py-1">
            <input
              type="date"
              className="text-[11px] focus:outline-none bg-transparent cursor-pointer"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => nudgeDate(1)}
            className="w-6 h-6 border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50"
          >
            <BsChevronRight className="w-2.5 h-2.5 text-gray-600" />
          </button>
          <button
            onClick={setToday}
            className="px-2 py-1 text-[10px] font-bold text-[#00809d] border border-[#00809d] bg-white hover:bg-[#e6f4f7]"
          >
            Today
          </button>
          <span className="text-[11px] text-gray-500 font-medium">{dateLabel}</span>
        </div>
      </div>

      {/* ── Time & Duration Bar ── */}
      <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <BsClock className="w-3 h-3 text-gray-400" />
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Start</label>
          <input
            type="time"
            className="border border-gray-300 p-1 text-[11px] focus:outline-none focus:border-[#00809d] bg-white w-[90px]"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">End</label>
          <input
            type="time"
            className="border border-gray-300 p-1 text-[11px] focus:outline-none focus:border-[#00809d] bg-white w-[90px]"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        {startTime && endTime && (
          <span className="text-[10px] text-gray-400">
            {(() => {
              const [sh, sm] = startTime.split(":").map(Number);
              const [eh, em] = endTime.split(":").map(Number);
              const diff = (eh * 60 + em) - (sh * 60 + sm);
              if (diff <= 0) return "Invalid time range";
              const hrs = Math.floor(diff / 60);
              const mins = diff % 60;
              return `${hrs > 0 ? `${hrs}h ` : ""}${mins > 0 ? `${mins}m` : ""}`.trim();
            })()}
          </span>
        )}

        <div className="flex-1" />

        {/* Conflict warning */}
        {conflicts.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">
            <BsExclamationTriangle className="w-3 h-3 shrink-0" />
            {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} found
          </div>
        )}
      </div>

      {/* ── Staff List + Timeline ── */}
      {!scheduleDate ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BsCalendarEvent className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-[12px] text-gray-400 font-medium">Pick a date to see staff availability</p>
            <button onClick={setToday} className="mt-2 text-[11px] text-[#00809d] hover:underline">
              Use today&apos;s date
            </button>
          </div>
        </div>
      ) : loadingSchedule ? (
        <div className="flex-1 flex items-center justify-center">
          <FiLoader className="w-5 h-5 text-[#00809d] animate-spin" />
          <span className="text-[12px] text-gray-400 ml-2">Loading schedules…</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Staff rows with embedded timelines */}
          <div className="flex-1 overflow-y-auto">
            {staffSchedules.map((staff, idx) => {
              const isAssigned = assignedUserId === staff.id;
              const isExpanded = expandedStaff === staff.id;
              const colorPair = STAFF_COLORS[idx % STAFF_COLORS.length];

              return (
                <div
                  key={staff.id}
                  className={`border-b border-gray-200 ${isAssigned ? "bg-[#e6f4f7]" : "bg-white"}`}
                >
                  {/* ── Staff row header ── */}
                  <div
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 ${isAssigned ? "hover:bg-[#d4edf2]" : ""}`}
                    onClick={() => {
                      setSelectedStaffId(isExpanded ? null : staff.id);
                    }}
                  >
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full ${colorPair.bg} ${colorPair.text} text-[10px] flex items-center justify-center shrink-0 font-bold`}>
                      {staff.initials}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-gray-800">{staff.name}</span>
                        <span className="text-[10px] text-gray-400">{staff.role}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {staff.jobCount === 0
                          ? "No jobs scheduled"
                          : `${staff.jobCount} job${staff.jobCount !== 1 ? "s" : ""} scheduled`}
                      </div>
                    </div>

                    {/* Mini availability bar (compact view) */}
                    {!isExpanded && (
                      <div className="w-[200px] h-5 bg-gray-100 border border-gray-200 relative overflow-hidden shrink-0">
                        {/* hour ticks */}
                        {Array.from({ length: TIMELINE_HOURS }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-gray-200"
                            style={{ left: `${(i / TIMELINE_HOURS) * 100}%` }}
                          />
                        ))}
                        {/* existing jobs */}
                        {staff.jobs.map((j) => {
                          const start = new Date(j.scheduledStart);
                          const end = j.scheduledEnd
                            ? new Date(j.scheduledEnd)
                            : new Date(start.getTime() + 60 * 60 * 1000);
                          const startPct = Math.max(0, ((start.getHours() + start.getMinutes() / 60) - TIMELINE_START_HOUR) / TIMELINE_HOURS * 100);
                          const endPct = Math.min(100, ((end.getHours() + end.getMinutes() / 60) - TIMELINE_START_HOUR) / TIMELINE_HOURS * 100);
                          return (
                            <div
                              key={j.id}
                              className="absolute top-0.5 bottom-0.5 bg-blue-400/60 border border-blue-500/30"
                              style={{ left: `${startPct}%`, width: `${Math.max(1, endPct - startPct)}%` }}
                            />
                          );
                        })}
                        {/* proposed slot */}
                        {startTime && (
                          (() => {
                            const [sh, sm] = startTime.split(":").map(Number);
                            const [eh, em] = endTime ? endTime.split(":").map(Number) : [sh + 1, sm];
                            const startPct = Math.max(0, ((sh + sm / 60) - TIMELINE_START_HOUR) / TIMELINE_HOURS * 100);
                            const endPct = Math.min(100, ((eh + em / 60) - TIMELINE_START_HOUR) / TIMELINE_HOURS * 100);
                            const hasConflict = isAssigned && conflicts.length > 0;
                            return isAssigned ? (
                              <div
                                className={`absolute top-0.5 bottom-0.5 ${hasConflict ? "bg-red-400/50 border-red-500" : "bg-emerald-400/50 border-emerald-500"} border`}
                                style={{ left: `${startPct}%`, width: `${Math.max(1, endPct - startPct)}%` }}
                              />
                            ) : null;
                          })()
                        )}
                      </div>
                    )}

                    {/* Assign button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignedUserId(isAssigned ? "" : staff.id);
                      }}
                      className={`px-2 py-1 text-[10px] font-bold shrink-0 ${
                        isAssigned
                          ? "bg-[#00809d] text-white"
                          : "bg-white border border-gray-300 text-gray-600 hover:border-[#00809d] hover:text-[#00809d]"
                      }`}
                    >
                      {isAssigned ? "✓ Assigned" : "Assign"}
                    </button>
                  </div>

                  {/* ── Expanded Timeline ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div
                        ref={timelineScrollRef}
                        className="overflow-x-auto overflow-y-hidden"
                        style={{ maxHeight: "200px" }}
                      >
                        <div style={{ width: TIMELINE_WIDTH + 60, minHeight: 80 }} className="relative px-4 py-2">
                          {/* Hour labels */}
                          <div className="flex" style={{ width: TIMELINE_WIDTH, marginLeft: 0 }}>
                            {Array.from({ length: TIMELINE_HOURS + 1 }).map((_, i) => {
                              const hr = TIMELINE_START_HOUR + i;
                              const label = hr === 0 ? "12am" : hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;
                              return (
                                <div
                                  key={i}
                                  className="text-[9px] text-gray-400 shrink-0"
                                  style={{
                                    width: i < TIMELINE_HOURS ? HOUR_WIDTH : 0,
                                    position: "relative",
                                  }}
                                >
                                  {label}
                                </div>
                              );
                            })}
                          </div>

                          {/* Timeline track */}
                          <div className="relative mt-1" style={{ width: TIMELINE_WIDTH, height: 40 }}>
                            {/* Background grid */}
                            <div className="absolute inset-0 bg-white border border-gray-200">
                              {Array.from({ length: TIMELINE_HOURS }).map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute top-0 bottom-0 border-l border-gray-100"
                                  style={{ left: i * HOUR_WIDTH }}
                                />
                              ))}
                              {/* Half-hour dashes */}
                              {Array.from({ length: TIMELINE_HOURS }).map((_, i) => (
                                <div
                                  key={`half-${i}`}
                                  className="absolute top-0 bottom-0 border-l border-dashed border-gray-100"
                                  style={{ left: i * HOUR_WIDTH + HOUR_WIDTH / 2 }}
                                />
                              ))}
                            </div>

                            {/* Existing jobs */}
                            {staff.jobs.map((j) => {
                              const start = new Date(j.scheduledStart);
                              const end = j.scheduledEnd
                                ? new Date(j.scheduledEnd)
                                : new Date(start.getTime() + 60 * 60 * 1000);
                              const startMins = (start.getHours() * 60 + start.getMinutes()) - TIMELINE_START_HOUR * 60;
                              const endMins = (end.getHours() * 60 + end.getMinutes()) - TIMELINE_START_HOUR * 60;
                              const left = Math.max(0, (startMins / 60) * HOUR_WIDTH);
                              const width = Math.max(20, ((endMins - startMins) / 60) * HOUR_WIDTH);
                              const startStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                              const endStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

                              return (
                                <div
                                  key={j.id}
                                  className="absolute top-1 bottom-1 bg-blue-500 text-white flex items-center px-1.5 overflow-hidden group cursor-default"
                                  style={{ left, width }}
                                  title={`${j.customer} — ${j.jobType || "Job"}\n${startStr} – ${endStr}\n${j.location}`}
                                >
                                  <div className="truncate">
                                    <span className="text-[9px] font-bold">{j.customer}</span>
                                    <span className="text-[8px] opacity-75 ml-1">{startStr}–{endStr}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Proposed new job slot */}
                            {startTime && (
                              (() => {
                                const [sh, sm] = startTime.split(":").map(Number);
                                const [eh, em] = endTime ? endTime.split(":").map(Number) : [sh + 1, sm];
                                const startMins = (sh * 60 + sm) - TIMELINE_START_HOUR * 60;
                                const endMins = (eh * 60 + em) - TIMELINE_START_HOUR * 60;
                                const left = Math.max(0, (startMins / 60) * HOUR_WIDTH);
                                const width = Math.max(20, ((endMins - startMins) / 60) * HOUR_WIDTH);
                                const hasConflict = isAssigned && conflicts.length > 0;

                                return (
                                  <div
                                    className={`absolute top-1 bottom-1 flex items-center px-1.5 border-2 border-dashed ${
                                      hasConflict
                                        ? "bg-red-100 border-red-500 text-red-700"
                                        : "bg-emerald-100 border-emerald-500 text-emerald-700"
                                    }`}
                                    style={{ left, width, zIndex: 10 }}
                                  >
                                    <span className="text-[9px] font-bold truncate">
                                      {hasConflict ? "⚠ CONFLICT" : "NEW JOB"}
                                    </span>
                                  </div>
                                );
                              })()
                            )}

                            {/* Now indicator */}
                            {(() => {
                              const now = new Date();
                              const todayStr = now.toISOString().slice(0, 10);
                              if (scheduleDate !== todayStr) return null;
                              const nowMins = (now.getHours() * 60 + now.getMinutes()) - TIMELINE_START_HOUR * 60;
                              if (nowMins < 0 || nowMins > TIMELINE_HOURS * 60) return null;
                              const leftPx = (nowMins / 60) * HOUR_WIDTH;
                              return (
                                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20" style={{ left: leftPx }}>
                                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-[3px] -mt-1" />
                                </div>
                              );
                            })()}
                          </div>

                          {/* Job details list below timeline */}
                          {staff.jobs.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {staff.jobs.map((j) => {
                                const start = new Date(j.scheduledStart);
                                const end = j.scheduledEnd
                                  ? new Date(j.scheduledEnd)
                                  : new Date(start.getTime() + 60 * 60 * 1000);
                                const startStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                                const endStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                                // Is this job conflicting with proposed time?
                                const isConflicting = conflicts.some((c) => c.id === j.id);

                                return (
                                  <div
                                    key={j.id}
                                    className={`flex items-center gap-2 px-2 py-1 text-[10px] ${
                                      isConflicting ? "bg-red-50 border border-red-200" : "bg-white border border-gray-100"
                                    }`}
                                  >
                                    <BsClock className={`w-2.5 h-2.5 shrink-0 ${isConflicting ? "text-red-500" : "text-gray-400"}`} />
                                    <span className={`font-bold ${isConflicting ? "text-red-700" : "text-gray-700"}`}>
                                      {startStr} – {endStr}
                                    </span>
                                    <span className="text-gray-600 truncate">{j.customer}</span>
                                    {j.jobType && <span className="text-gray-400">· {j.jobType}</span>}
                                    {j.location && (
                                      <span className="text-gray-400 flex items-center gap-0.5 truncate ml-auto">
                                        <BsGeoAlt className="w-2 h-2" />
                                        {j.location}
                                      </span>
                                    )}
                                    {isConflicting && (
                                      <span className="text-red-600 font-bold flex items-center gap-0.5 shrink-0">
                                        <BsExclamationTriangle className="w-2.5 h-2.5" />
                                        CONFLICT
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {staffSchedules.length === 0 && (
              <div className="p-8 text-center">
                <BsPerson className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-400">No staff members found</p>
              </div>
            )}
          </div>

          {/* ── Bottom summary + save ── */}
          <div className="border-t border-gray-300 px-4 py-2 bg-[#fafafa] flex items-center gap-3 shrink-0">
            {hasSchedule ? (
              <div className="flex items-center gap-1.5 text-[11px] flex-1">
                {conflicts.length > 0 ? (
                  <div className="flex items-center gap-1 text-amber-700">
                    <BsExclamationTriangle className="w-3.5 h-3.5" />
                    <span className="font-bold">Warning:</span>
                    <span>{conflicts.length} scheduling conflict{conflicts.length !== 1 ? "s" : ""} — job will still be created</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-700">
                    <BsCheckCircleFill className="w-3.5 h-3.5" />
                    <span>
                      {assignedUserId
                        ? `Ready to schedule for ${staffSchedules.find((s) => s.id === assignedUserId)?.name || "staff"}`
                        : "Date & time set — assign a staff member to dispatch"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-gray-400 flex-1">
                Set a date and start time to schedule this job
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving || saved || !hasSchedule}
              className={`px-4 py-1 text-[11px] font-bold text-white ${
                !hasSchedule
                  ? "bg-gray-300 cursor-not-allowed"
                  : saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : saved
                      ? "bg-emerald-600 cursor-default"
                      : "bg-[#00809d] hover:bg-[#006d86] cursor-pointer"
              }`}
            >
              {saving ? "Saving…" : saved ? "✓ Scheduled" : "Save & Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── Ribbon Item ── */
function RibbonItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-1 text-[11px] ${
        active ? "text-[#00809d] font-bold" : "text-gray-700 hover:text-[#00809d]"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
