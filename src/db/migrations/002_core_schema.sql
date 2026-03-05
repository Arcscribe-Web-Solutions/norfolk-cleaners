-- ============================================================================
-- Field Service Management Core Schema
-- Migration: 002_core_schema.sql
-- ============================================================================

-- ============================================================================
-- PART 1: ENUMS
-- ============================================================================

-- Client status
CREATE TYPE client_status AS ENUM ('active', 'inactive');

-- Job status
CREATE TYPE job_status AS ENUM ('quote', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- Job priority
CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high');

-- Materials/services type
CREATE TYPE item_type AS ENUM ('labor', 'material', 'flat_rate');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');

-- Activity feed post type
CREATE TYPE post_type AS ENUM ('user_note', 'system_event', 'payment_received');


-- ============================================================================
-- PART 2: STANDARD TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address TEXT,
    notes TEXT,
    status client_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);

-- ----------------------------------------------------------------------------
-- client_locations
-- ----------------------------------------------------------------------------
CREATE TABLE client_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    access_instructions TEXT,
    key_safe_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_locations_client_id ON client_locations(client_id);

-- ----------------------------------------------------------------------------
-- jobs
-- ----------------------------------------------------------------------------
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    location_id UUID REFERENCES client_locations(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status job_status NOT NULL DEFAULT 'quote',
    job_type VARCHAR(100),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    description TEXT,
    priority job_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_location_id ON jobs(location_id);
CREATE INDEX idx_jobs_assigned_user_id ON jobs(assigned_user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_start ON jobs(scheduled_start);

-- ----------------------------------------------------------------------------
-- materials_services
-- ----------------------------------------------------------------------------
CREATE TABLE materials_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type item_type NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_materials_services_type ON materials_services(type);
CREATE INDEX idx_materials_services_is_active ON materials_services(is_active);

-- ----------------------------------------------------------------------------
-- job_items
-- ----------------------------------------------------------------------------
CREATE TABLE job_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES materials_services(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_items_job_id ON job_items(job_id);
CREATE INDEX idx_job_items_item_id ON job_items(item_id);

-- ----------------------------------------------------------------------------
-- invoices
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    issue_date DATE,
    due_date DATE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ----------------------------------------------------------------------------
-- activity_feed
-- ----------------------------------------------------------------------------
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    post_type post_type NOT NULL DEFAULT 'user_note',
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_feed_author_id ON activity_feed(author_id);
CREATE INDEX idx_activity_feed_job_id ON activity_feed(job_id);
CREATE INDEX idx_activity_feed_post_type ON activity_feed(post_type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);


-- ============================================================================
-- PART 3: DEMO TABLES (Prefixed with demo_)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Demo ENUMs (prefixed versions)
-- ----------------------------------------------------------------------------
CREATE TYPE demo_user_role AS ENUM ('owner', 'admin', 'manager', 'dispatcher', 'field_tech', 'trainee');
CREATE TYPE demo_user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE demo_employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'casual');
CREATE TYPE demo_dbs_check_status AS ENUM ('not_required', 'pending', 'clear', 'issues_found', 'expired');
CREATE TYPE demo_client_status AS ENUM ('active', 'inactive');
CREATE TYPE demo_job_status AS ENUM ('quote', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE demo_job_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE demo_item_type AS ENUM ('labor', 'material', 'flat_rate');
CREATE TYPE demo_invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
CREATE TYPE demo_post_type AS ENUM ('user_note', 'system_event', 'payment_received');

-- ----------------------------------------------------------------------------
-- demo_users (duplicate of users table)
-- ----------------------------------------------------------------------------
CREATE TABLE demo_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role demo_user_role NOT NULL DEFAULT 'field_tech',
    status demo_user_status NOT NULL DEFAULT 'pending',
    employment_type demo_employment_type NOT NULL DEFAULT 'full_time',
    hourly_rate NUMERIC(10, 2),
    dbs_check_status demo_dbs_check_status NOT NULL DEFAULT 'not_required',
    dbs_certificate_number VARCHAR(50),
    dbs_check_date DATE,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    notes TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_users_email ON demo_users(email);
CREATE INDEX idx_demo_users_role ON demo_users(role);
CREATE INDEX idx_demo_users_status ON demo_users(status);

-- ----------------------------------------------------------------------------
-- demo_clients
-- ----------------------------------------------------------------------------
CREATE TABLE demo_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address TEXT,
    notes TEXT,
    status demo_client_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_clients_email ON demo_clients(email);
CREATE INDEX idx_demo_clients_status ON demo_clients(status);

-- ----------------------------------------------------------------------------
-- demo_client_locations
-- ----------------------------------------------------------------------------
CREATE TABLE demo_client_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES demo_clients(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    access_instructions TEXT,
    key_safe_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_client_locations_client_id ON demo_client_locations(client_id);

-- ----------------------------------------------------------------------------
-- demo_jobs
-- ----------------------------------------------------------------------------
CREATE TABLE demo_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES demo_clients(id) ON DELETE CASCADE,
    location_id UUID REFERENCES demo_client_locations(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES demo_users(id) ON DELETE SET NULL,
    status demo_job_status NOT NULL DEFAULT 'quote',
    job_type VARCHAR(100),
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    description TEXT,
    priority demo_job_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_jobs_client_id ON demo_jobs(client_id);
CREATE INDEX idx_demo_jobs_location_id ON demo_jobs(location_id);
CREATE INDEX idx_demo_jobs_assigned_user_id ON demo_jobs(assigned_user_id);
CREATE INDEX idx_demo_jobs_status ON demo_jobs(status);
CREATE INDEX idx_demo_jobs_scheduled_start ON demo_jobs(scheduled_start);

-- ----------------------------------------------------------------------------
-- demo_materials_services
-- ----------------------------------------------------------------------------
CREATE TABLE demo_materials_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type demo_item_type NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_materials_services_type ON demo_materials_services(type);
CREATE INDEX idx_demo_materials_services_is_active ON demo_materials_services(is_active);

-- ----------------------------------------------------------------------------
-- demo_job_items
-- ----------------------------------------------------------------------------
CREATE TABLE demo_job_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES demo_jobs(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES demo_materials_services(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_job_items_job_id ON demo_job_items(job_id);
CREATE INDEX idx_demo_job_items_item_id ON demo_job_items(item_id);

-- ----------------------------------------------------------------------------
-- demo_invoices
-- ----------------------------------------------------------------------------
CREATE TABLE demo_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES demo_jobs(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES demo_clients(id) ON DELETE CASCADE,
    status demo_invoice_status NOT NULL DEFAULT 'draft',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    issue_date DATE,
    due_date DATE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_invoices_job_id ON demo_invoices(job_id);
CREATE INDEX idx_demo_invoices_client_id ON demo_invoices(client_id);
CREATE INDEX idx_demo_invoices_status ON demo_invoices(status);
CREATE INDEX idx_demo_invoices_due_date ON demo_invoices(due_date);

-- ----------------------------------------------------------------------------
-- demo_activity_feed
-- ----------------------------------------------------------------------------
CREATE TABLE demo_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES demo_users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES demo_jobs(id) ON DELETE CASCADE,
    post_type demo_post_type NOT NULL DEFAULT 'user_note',
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_activity_feed_author_id ON demo_activity_feed(author_id);
CREATE INDEX idx_demo_activity_feed_job_id ON demo_activity_feed(job_id);
CREATE INDEX idx_demo_activity_feed_post_type ON demo_activity_feed(post_type);
CREATE INDEX idx_demo_activity_feed_created_at ON demo_activity_feed(created_at DESC);

-- ----------------------------------------------------------------------------
-- demo_tasks
-- ----------------------------------------------------------------------------
CREATE TABLE demo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_to UUID REFERENCES demo_users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES demo_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_tasks_assigned_to ON demo_tasks(assigned_to);
CREATE INDEX idx_demo_tasks_created_by ON demo_tasks(created_by);
CREATE INDEX idx_demo_tasks_is_completed ON demo_tasks(is_completed);
CREATE INDEX idx_demo_tasks_due_date ON demo_tasks(due_date);


-- ============================================================================
-- PART 4: UPDATE TRIGGERS (for updated_at columns)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Standard tables triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_locations_updated_at BEFORE UPDATE ON client_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_services_updated_at BEFORE UPDATE ON materials_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_items_updated_at BEFORE UPDATE ON job_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_feed_updated_at BEFORE UPDATE ON activity_feed FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo tables triggers
CREATE TRIGGER update_demo_users_updated_at BEFORE UPDATE ON demo_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_clients_updated_at BEFORE UPDATE ON demo_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_client_locations_updated_at BEFORE UPDATE ON demo_client_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_jobs_updated_at BEFORE UPDATE ON demo_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_materials_services_updated_at BEFORE UPDATE ON demo_materials_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_job_items_updated_at BEFORE UPDATE ON demo_job_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_invoices_updated_at BEFORE UPDATE ON demo_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_activity_feed_updated_at BEFORE UPDATE ON demo_activity_feed FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_tasks_updated_at BEFORE UPDATE ON demo_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
