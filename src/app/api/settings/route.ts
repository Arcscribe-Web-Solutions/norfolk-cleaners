import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";
import { query } from "@/lib/db";
import { SESSION_COOKIE, verifyToken } from "@/lib/jwt";

/* ── helpers ── */

function requireDb() {
  if (!features.database) {
    return NextResponse.json(
      { success: false, error: "Database feature is disabled" },
      { status: 400 },
    );
  }
  return null;
}

async function requireAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export interface CompanySettings {
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

// Map database keys to camelCase
const keyMap: Record<string, keyof CompanySettings> = {
  company_name: "companyName",
  company_phone: "companyPhone",
  company_email: "companyEmail",
  company_address: "companyAddress",
  company_postcode: "companyPostcode",
  company_vat_number: "companyVatNumber",
  company_registration_number: "companyRegistrationNumber",
  company_website: "companyWebsite",
  invoice_prefix: "invoicePrefix",
  invoice_next_number: "invoiceNextNumber",
  invoice_payment_terms: "invoicePaymentTerms",
  invoice_footer_text: "invoiceFooterText",
  invoice_bank_name: "invoiceBankName",
  invoice_bank_sort_code: "invoiceBankSortCode",
  invoice_bank_account_number: "invoiceBankAccountNumber",
  invoice_bank_account_name: "invoiceBankAccountName",
  default_vat_rate: "defaultVatRate",
  currency_symbol: "currencySymbol",
  currency_code: "currencyCode",
  timezone: "timezone",
  date_format: "dateFormat",
  time_format: "timeFormat",
  business_hours: "businessHours",
};

// Reverse map for saving
const reverseKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(keyMap).map(([k, v]) => [v, k])
);

/**
 * GET /api/settings
 * Returns all company settings
 */
export async function GET(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM company_settings`
    );

    const settings: Partial<CompanySettings> = {};
    for (const row of rows) {
      const camelKey = keyMap[row.key];
      if (camelKey) {
        if (row.key === "business_hours") {
          try {
            (settings as Record<string, unknown>)[camelKey] = JSON.parse(row.value);
          } catch {
            (settings as Record<string, unknown>)[camelKey] = {};
          }
        } else {
          (settings as Record<string, string>)[camelKey] = row.value;
        }
      }
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/settings
 * Update company settings
 * Body: Partial<CompanySettings>
 */
export async function PATCH(req: NextRequest) {
  try {
    const dbErr = requireDb();
    if (dbErr) return dbErr;

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user has permission (owner, business_owner, or finance roles)
    const allowedRoles = ["owner", "business_owner", "finance"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const updates: { key: string; value: string }[] = [];

    for (const [camelKey, value] of Object.entries(body)) {
      const dbKey = reverseKeyMap[camelKey];
      if (dbKey) {
        const strValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        updates.push({ key: dbKey, value: strValue });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid settings to update" },
        { status: 400 },
      );
    }

    // Update each setting
    for (const { key, value } of updates) {
      await query(
        `INSERT INTO company_settings (key, value, updated_at, updated_by)
         VALUES ($1, $2, now(), $3)
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = now(),
           updated_by = EXCLUDED.updated_by`,
        [key, value, user.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/settings/public
 * Returns public company settings (for invoices, etc.)
 * No auth required - these are public-facing company details
 */
export async function getPublicSettings(): Promise<Partial<CompanySettings>> {
  const publicKeys = [
    "company_name",
    "company_phone",
    "company_email",
    "company_address",
    "company_postcode",
    "company_vat_number",
    "company_registration_number",
    "company_website",
    "invoice_bank_name",
    "invoice_bank_sort_code",
    "invoice_bank_account_number",
    "invoice_bank_account_name",
    "invoice_payment_terms",
    "invoice_footer_text",
    "currency_symbol",
    "currency_code",
    "default_vat_rate",
  ];

  const rows = await query<{ key: string; value: string }>(
    `SELECT key, value FROM company_settings WHERE key = ANY($1)`,
    [publicKeys]
  );

  const settings: Partial<CompanySettings> = {};
  for (const row of rows) {
    const camelKey = keyMap[row.key];
    if (camelKey) {
      (settings as Record<string, string>)[camelKey] = row.value;
    }
  }

  return settings;
}
