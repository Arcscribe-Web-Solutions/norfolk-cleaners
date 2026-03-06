"use client";

/**
 * Settings Page – Norfolk Cleaners
 * ─────────────────────────────────
 * Full settings management with persistent storage.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { BsPlus, BsPencil, BsTrash, BsCheck, BsX } from "react-icons/bs";

type Tab = "company" | "team" | "jobs" | "notifications" | "billing" | "integrations" | "security";

interface CompanySettings {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  companyPostcode: string;
  companyVatNumber: string;
  companyRegistrationNumber: string;
  companyWebsite: string;
  invoicePrefix: string;
  invoiceNextNumber: string;
  invoicePaymentTerms: string;
  invoiceFooterText: string;
  invoiceBankName: string;
  invoiceBankSortCode: string;
  invoiceBankAccountNumber: string;
  invoiceBankAccountName: string;
  defaultVatRate: string;
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      active: boolean;
    };
  };
}

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  employmentType: string;
  hourlyRate: string | null;
  startDate: string | null;
  createdAt: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "company", label: "Company Info" },
  { key: "team", label: "Team & Staff" },
  { key: "jobs", label: "Job Types" },
  { key: "notifications", label: "Notifications" },
  { key: "billing", label: "Billing" },
  { key: "integrations", label: "Integrations" },
  { key: "security", label: "Security" },
];

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "business_owner", label: "Business Owner" },
  { value: "finance", label: "Finance" },
  { value: "staff", label: "Staff" },
  { value: "staff_no_material", label: "Staff (No Materials)" },
  { value: "staff_no_pricing", label: "Staff (No Pricing)" },
  { value: "contractor", label: "Contractor" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "zero_hour", label: "Zero Hour" },
  { value: "contractor", label: "Contractor" },
  { value: "apprentice", label: "Apprentice" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function SettingsPage() {
  const { user, loading, roleDef } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Staff modal state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "staff",
    status: "active",
    employmentType: "full_time",
    hourlyRate: "",
    startDate: "",
  });

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, fetchSettings]);

  useEffect(() => {
    if (user && activeTab === "team") {
      fetchStaff();
    }
  }, [user, activeTab, fetchStaff]);

  // Save settings
  const saveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Update a single setting
  const updateSetting = (key: keyof CompanySettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  // Update business hours
  const updateBusinessHours = (day: string, field: "open" | "close" | "active", value: string | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: {
          ...settings.businessHours[day],
          [field]: value,
        },
      },
    });
  };

  // Staff CRUD
  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "staff",
      status: "active",
      employmentType: "full_time",
      hourlyRate: "",
      startDate: "",
    });
    setStaffModalOpen(true);
  };

  const openEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({
      email: member.email,
      password: "",
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone || "",
      role: member.role,
      status: member.status,
      employmentType: member.employmentType,
      hourlyRate: member.hourlyRate || "",
      startDate: member.startDate || "",
    });
    setStaffModalOpen(true);
  };

  const saveStaff = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      
      const payload = editingStaff
        ? { id: editingStaff.id, ...staffForm }
        : staffForm;
      
      // Don't send empty password for edits
      if (editingStaff && !staffForm.password) {
        delete (payload as Record<string, unknown>).password;
      }
      
      const res = await fetch("/api/staff", {
        method: editingStaff ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: "success", text: editingStaff ? "Staff member updated" : "Staff member created" });
        setStaffModalOpen(false);
        fetchStaff();
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save staff member" });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save staff member" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const deleteStaff = async (member: StaffMember) => {
    if (!confirm(`Are you sure you want to deactivate ${member.firstName} ${member.lastName}?`)) {
      return;
    }
    
    try {
      setSaving(true);
      const res = await fetch(`/api/staff?id=${member.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ type: "success", text: "Staff member deactivated" });
        fetchStaff();
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to deactivate staff member" });
      }
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to deactivate staff member" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full text-[11px] text-gray-400 bg-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full bg-white">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b border-gray-300 px-2 py-0.5 bg-gray-100 shrink-0">
        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wide">
          Settings
        </span>
        <span className="text-[10px] text-gray-500">
          {user.firstName} {user.lastName} &middot; {roleDef?.label}
        </span>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div
          className={`px-3 py-1.5 text-[11px] ${
            saveMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Settings body */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Mobile tab selector */}
        <div className="md:hidden border-b border-gray-300 p-2 bg-[#f9f9f9]">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>{tab.label}</option>
            ))}
          </select>
        </div>

        {/* Desktop Settings sidebar */}
        <nav className="hidden md:block w-[200px] border-r border-gray-300 bg-[#f9f9f9] shrink-0 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-3 py-1.5 text-[11px] cursor-pointer border-b border-gray-200 ${
                activeTab === tab.key
                  ? "bg-white text-gray-800 font-semibold border-l-2 border-l-blue-500"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings content */}
        <div className="flex-1 p-3 overflow-y-auto">
          {loadingSettings ? (
            <div className="flex items-center justify-center h-32 text-[11px] text-gray-400">
              Loading settings…
            </div>
          ) : (
            <>
              {/* Company Info Tab */}
              {activeTab === "company" && settings && (
                <CompanyInfoTab
                  settings={settings}
                  updateSetting={updateSetting}
                  updateBusinessHours={updateBusinessHours}
                  saveSettings={saveSettings}
                  saving={saving}
                />
              )}

              {/* Team & Staff Tab */}
              {activeTab === "team" && (
                <TeamStaffTab
                  staff={staff}
                  loadingStaff={loadingStaff}
                  openAddStaff={openAddStaff}
                  openEditStaff={openEditStaff}
                  deleteStaff={deleteStaff}
                  currentUserId={user.id}
                />
              )}

              {/* Placeholder tabs */}
              {activeTab === "jobs" && <PlaceholderTab title="Job Types" />}
              {activeTab === "notifications" && <PlaceholderTab title="Notification Settings" />}
              {activeTab === "billing" && settings && (
                <BillingTab
                  settings={settings}
                  updateSetting={updateSetting}
                  saveSettings={saveSettings}
                  saving={saving}
                />
              )}
              {activeTab === "integrations" && <PlaceholderTab title="Integrations" />}
              {activeTab === "security" && <PlaceholderTab title="Security Settings" />}
            </>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      {staffModalOpen && (
        <StaffModal
          editingStaff={editingStaff}
          staffForm={staffForm}
          setStaffForm={setStaffForm}
          onSave={saveStaff}
          onClose={() => setStaffModalOpen(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ── Company Info Tab ── */
function CompanyInfoTab({
  settings,
  updateSetting,
  updateBusinessHours,
  saveSettings,
  saving,
}: {
  settings: CompanySettings;
  updateSetting: (key: keyof CompanySettings, value: string) => void;
  updateBusinessHours: (day: string, field: "open" | "close" | "active", value: string | boolean) => void;
  saveSettings: () => void;
  saving: boolean;
}) {
  return (
    <>
      {/* Company Information */}
      <div className="border border-gray-300 bg-white mb-3">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Company Information
          </h3>
        </div>
        <div className="p-3 space-y-2">
          <SettingField label="Company Name" value={settings.companyName} onChange={(v) => updateSetting("companyName", v)} />
          <SettingField label="Phone" value={settings.companyPhone} onChange={(v) => updateSetting("companyPhone", v)} />
          <SettingField label="Email" value={settings.companyEmail} onChange={(v) => updateSetting("companyEmail", v)} type="email" />
          <SettingField label="Address" value={settings.companyAddress} onChange={(v) => updateSetting("companyAddress", v)} />
          <SettingField label="Postcode" value={settings.companyPostcode} onChange={(v) => updateSetting("companyPostcode", v)} />
          <SettingField label="Website" value={settings.companyWebsite} onChange={(v) => updateSetting("companyWebsite", v)} />
          <SettingField label="VAT Number" value={settings.companyVatNumber} onChange={(v) => updateSetting("companyVatNumber", v)} />
          <SettingField label="Company Reg #" value={settings.companyRegistrationNumber} onChange={(v) => updateSetting("companyRegistrationNumber", v)} />
        </div>
      </div>

      {/* Business Hours */}
      <div className="border border-gray-300 bg-white mb-3">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Business Hours
          </h3>
        </div>
        <div className="p-3">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-0.5 font-bold text-gray-600 w-24">Day</th>
                <th className="text-left py-0.5 font-bold text-gray-600 w-24">Open</th>
                <th className="text-left py-0.5 font-bold text-gray-600 w-24">Close</th>
                <th className="text-left py-0.5 font-bold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const hours = settings.businessHours?.[day] || { open: "", close: "", active: false };
                return (
                  <tr key={day} className="border-b border-gray-100">
                    <td className="py-1 text-gray-700 font-semibold capitalize">{day}</td>
                    <td className="py-1">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateBusinessHours(day, "open", e.target.value)}
                        disabled={!hours.active}
                        className="border border-gray-300 rounded-sm px-1 py-0.5 text-[11px] w-20 outline-none focus:border-blue-400 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="py-1">
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateBusinessHours(day, "close", e.target.value)}
                        disabled={!hours.active}
                        className="border border-gray-300 rounded-sm px-1 py-0.5 text-[11px] w-20 outline-none focus:border-blue-400 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="py-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours.active}
                          onChange={(e) => updateBusinessHours(day, "active", e.target.checked)}
                          className="w-3 h-3"
                        />
                        <span className={`text-[10px] ${hours.active ? "text-blue-700" : "text-gray-500"}`}>
                          {hours.active ? "Open" : "Closed"}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-1.5 text-[11px] font-semibold rounded-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

/* ── Team & Staff Tab ── */
function TeamStaffTab({
  staff,
  loadingStaff,
  openAddStaff,
  openEditStaff,
  deleteStaff,
  currentUserId,
}: {
  staff: StaffMember[];
  loadingStaff: boolean;
  openAddStaff: () => void;
  openEditStaff: (member: StaffMember) => void;
  deleteStaff: (member: StaffMember) => void;
  currentUserId: string;
}) {
  const roleLabel = (role: string) => ROLES.find((r) => r.value === role)?.label || role;
  const statusLabel = (status: string) => STATUSES.find((s) => s.value === status)?.label || status;

  return (
    <div className="border border-gray-300 bg-white">
      <div className="bg-gray-50 border-b border-gray-300 px-3 py-1 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
          Team Members
        </h3>
        <button
          onClick={openAddStaff}
          className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 text-[10px] font-semibold rounded-sm hover:bg-blue-700"
        >
          <BsPlus className="w-3 h-3" />
          Add Staff
        </button>
      </div>
      <div className="overflow-x-auto">
        {loadingStaff ? (
          <div className="p-4 text-center text-[11px] text-gray-400">Loading staff…</div>
        ) : staff.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-gray-400">No staff members found</div>
        ) : (
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-1.5 px-3 font-bold text-gray-600">Name</th>
                <th className="text-left py-1.5 px-3 font-bold text-gray-600">Email</th>
                <th className="text-left py-1.5 px-3 font-bold text-gray-600">Role</th>
                <th className="text-left py-1.5 px-3 font-bold text-gray-600">Status</th>
                <th className="text-left py-1.5 px-3 font-bold text-gray-600">Phone</th>
                <th className="text-right py-1.5 px-3 font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 px-3 font-medium text-gray-800">
                    {member.firstName} {member.lastName}
                    {member.id === currentUserId && (
                      <span className="ml-1 text-[9px] text-blue-600">(You)</span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-gray-600">{member.email}</td>
                  <td className="py-1.5 px-3">
                    <span className="inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm bg-blue-100 text-blue-700">
                      {roleLabel(member.role)}
                    </span>
                  </td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-px text-[10px] font-semibold rounded-sm ${
                        member.status === "active"
                          ? "bg-green-100 text-green-700"
                          : member.status === "on_leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabel(member.status)}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-gray-600">{member.phone || "—"}</td>
                  <td className="py-1.5 px-3 text-right">
                    <button
                      onClick={() => openEditStaff(member)}
                      className="p-1 hover:bg-gray-200 rounded-sm text-gray-500 hover:text-gray-700"
                      title="Edit"
                    >
                      <BsPencil className="w-3 h-3" />
                    </button>
                    {member.id !== currentUserId && (
                      <button
                        onClick={() => deleteStaff(member)}
                        className="p-1 hover:bg-red-100 rounded-sm text-gray-500 hover:text-red-600 ml-1"
                        title="Deactivate"
                      >
                        <BsTrash className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Billing Tab ── */
function BillingTab({
  settings,
  updateSetting,
  saveSettings,
  saving,
}: {
  settings: CompanySettings;
  updateSetting: (key: keyof CompanySettings, value: string) => void;
  saveSettings: () => void;
  saving: boolean;
}) {
  return (
    <>
      {/* Invoice Settings */}
      <div className="border border-gray-300 bg-white mb-3">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Invoice Settings
          </h3>
        </div>
        <div className="p-3 space-y-2">
          <SettingField label="Invoice Prefix" value={settings.invoicePrefix} onChange={(v) => updateSetting("invoicePrefix", v)} />
          <SettingField label="Next Invoice #" value={settings.invoiceNextNumber} onChange={(v) => updateSetting("invoiceNextNumber", v)} />
          <SettingField label="Payment Terms (days)" value={settings.invoicePaymentTerms} onChange={(v) => updateSetting("invoicePaymentTerms", v)} type="number" />
          <SettingField label="Default VAT Rate (%)" value={settings.defaultVatRate} onChange={(v) => updateSetting("defaultVatRate", v)} type="number" />
          <div className="grid grid-cols-[120px_1fr] gap-1 items-start">
            <label className="text-[11px] text-gray-600 font-semibold pt-1">Footer Text</label>
            <textarea
              value={settings.invoiceFooterText}
              onChange={(e) => updateSetting("invoiceFooterText", e.target.value)}
              className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400 resize-none h-16"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="border border-gray-300 bg-white mb-3">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Bank Details (shown on invoices)
          </h3>
        </div>
        <div className="p-3 space-y-2">
          <SettingField label="Bank Name" value={settings.invoiceBankName} onChange={(v) => updateSetting("invoiceBankName", v)} />
          <SettingField label="Account Name" value={settings.invoiceBankAccountName} onChange={(v) => updateSetting("invoiceBankAccountName", v)} />
          <SettingField label="Sort Code" value={settings.invoiceBankSortCode} onChange={(v) => updateSetting("invoiceBankSortCode", v)} />
          <SettingField label="Account Number" value={settings.invoiceBankAccountNumber} onChange={(v) => updateSetting("invoiceBankAccountNumber", v)} />
        </div>
      </div>

      {/* Currency Settings */}
      <div className="border border-gray-300 bg-white mb-3">
        <div className="bg-gray-50 border-b border-gray-300 px-3 py-1">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
            Currency & Format
          </h3>
        </div>
        <div className="p-3 space-y-2">
          <SettingField label="Currency Symbol" value={settings.currencySymbol} onChange={(v) => updateSetting("currencySymbol", v)} />
          <SettingField label="Currency Code" value={settings.currencyCode} onChange={(v) => updateSetting("currencyCode", v)} />
          <SettingField label="Date Format" value={settings.dateFormat} onChange={(v) => updateSetting("dateFormat", v)} />
          <SettingField label="Time Format" value={settings.timeFormat} onChange={(v) => updateSetting("timeFormat", v)} />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-1.5 text-[11px] font-semibold rounded-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

/* ── Staff Modal ── */
function StaffModal({
  editingStaff,
  staffForm,
  setStaffForm,
  onSave,
  onClose,
  saving,
}: {
  editingStaff: StaffMember | null;
  staffForm: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    status: string;
    employmentType: string;
    hourlyRate: string;
    startDate: string;
  };
  setStaffForm: React.Dispatch<React.SetStateAction<typeof staffForm>>;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-800">
            {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-sm">
            <BsX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">First Name *</label>
              <input
                type="text"
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Last Name *</label>
              <input
                type="text"
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Email *</label>
            <input
              type="email"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">
              Password {editingStaff ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              type="password"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Phone</label>
            <input
              type="tel"
              value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Role</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Status</label>
              <select
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Employment Type</label>
              <select
                value={staffForm.employmentType}
                onChange={(e) => setStaffForm({ ...staffForm, employmentType: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Hourly Rate (£)</label>
              <input
                type="number"
                step="0.01"
                value={staffForm.hourlyRate}
                onChange={(e) => setStaffForm({ ...staffForm, hourlyRate: e.target.value })}
                className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 font-semibold mb-0.5">Start Date</label>
            <input
              type="date"
              value={staffForm.startDate}
              onChange={(e) => setStaffForm({ ...staffForm, startDate: e.target.value })}
              className="border border-gray-300 rounded-sm px-2 py-1 text-[11px] w-full outline-none focus:border-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 text-[11px] font-semibold rounded-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <BsCheck className="w-4 h-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Setting Field Component ── */
function SettingField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
      <label className="text-[11px] text-gray-600 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-sm px-2 py-0.5 text-[11px] w-full outline-none focus:border-blue-400"
      />
    </div>
  );
}

/* ── Placeholder Tab ── */
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="border border-gray-300 bg-white p-8 text-center">
      <p className="text-[11px] text-gray-500">{title} - Coming soon</p>
    </div>
  );
}
