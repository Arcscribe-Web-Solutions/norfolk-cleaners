-- ============================================================================
-- Company Settings Schema
-- Migration: 004_company_settings.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- company_settings (key-value store for company configuration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default company settings (using ON CONFLICT to handle re-runs)
INSERT INTO company_settings (key, value) VALUES
    ('company_name', 'Norfolk Cleaners'),
    ('company_phone', '01603 123456'),
    ('company_email', 'office@norfolkcleaners.co.uk'),
    ('company_address', '12 Market Street, Norwich, NR1 3HW'),
    ('company_postcode', 'NR1 3HW'),
    ('company_vat_number', ''),
    ('company_registration_number', ''),
    ('company_website', ''),
    ('invoice_prefix', 'INV-'),
    ('invoice_next_number', '1001'),
    ('invoice_payment_terms', '30'),
    ('invoice_footer_text', 'Thank you for your business.'),
    ('invoice_bank_name', ''),
    ('invoice_bank_sort_code', ''),
    ('invoice_bank_account_number', ''),
    ('invoice_bank_account_name', ''),
    ('default_vat_rate', '20'),
    ('currency_symbol', '£'),
    ('currency_code', 'GBP'),
    ('timezone', 'Europe/London'),
    ('date_format', 'DD/MM/YYYY'),
    ('time_format', '24h')
ON CONFLICT (key) DO NOTHING;

-- Business hours stored as JSON
INSERT INTO company_settings (key, value) VALUES
    ('business_hours', '{
        "monday": {"open": "07:00", "close": "18:00", "active": true},
        "tuesday": {"open": "07:00", "close": "18:00", "active": true},
        "wednesday": {"open": "07:00", "close": "18:00", "active": true},
        "thursday": {"open": "07:00", "close": "18:00", "active": true},
        "friday": {"open": "07:00", "close": "18:00", "active": true},
        "saturday": {"open": "08:00", "close": "14:00", "active": true},
        "sunday": {"open": "", "close": "", "active": false}
    }')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_settings_updated_at ON company_settings(updated_at);
