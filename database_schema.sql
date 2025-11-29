-- Enum Types
CREATE TYPE address_type AS ENUM ('Billing', 'Shipping', 'Other');
CREATE TYPE tender_status AS ENUM ('Draft', 'Open', 'Closed', 'Awarded', 'Cancelled');
CREATE TYPE winner_determination_method AS ENUM ('LowestBid', 'HighestScore', 'Manual');
CREATE TYPE quotation_status AS ENUM ('Submitted', 'UnderReview', 'Approved', 'Rejected', 'Awarded');
CREATE TYPE assignment_order_status AS ENUM ('Issued', 'Confirmed', 'InProgress', 'Completed', 'Cancelled');
CREATE TYPE contract_type AS ENUM ('FixedPrice', 'TimeAndMaterials', 'CostPlus');
CREATE TYPE contract_status AS ENUM ('Active', 'Expired', 'Terminated', 'Completed');
CREATE TYPE delivery_status AS ENUM ('Scheduled', 'Shipped', 'Delivered', 'Accepted', 'Rejected');
CREATE TYPE guarantee_type AS ENUM ('BidBond', 'PerformanceBond', 'AdvancePayment');
CREATE TYPE guarantee_status AS ENUM ('Active', 'Expired', 'Claimed', 'Released');
CREATE TYPE support_priority AS ENUM ('Low', 'Normal', 'High', 'Urgent');
CREATE TYPE support_status AS ENUM ('Open', 'InProgress', 'Resolved', 'Closed');
CREATE TYPE notification_type AS ENUM ('Info', 'Warning', 'Error', 'Success');
CREATE TYPE notification_status AS ENUM ('Unread', 'Read');

-- Table: Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_utc TIMESTAMP WITH TIME ZONE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Table: Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Table: UserRoles
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Table: Entities
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (parent_id) REFERENCES entities(id) ON DELETE SET NULL
);

-- Table: Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    address_type address_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Table: Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    primary_address_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    tax_number VARCHAR(50),
    registration_number VARCHAR(50),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    financial_capacity DECIMAL(15, 2),
    experience_years INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- Table: Currencies
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10, 4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Table: Tenders
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    estimated_budget DECIMAL(15, 2),
    submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    opening_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status tender_status DEFAULT 'Draft',
    requirements TEXT,
    terms_conditions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    winner_quotation_id UUID,
    awarded_date TIMESTAMP WITH TIME ZONE,
    awarded_by UUID,
    auto_determine_winner BOOLEAN DEFAULT FALSE,
    winner_determination_method winner_determination_method,
    lowest_bid_amount DECIMAL(15, 2),
    lowest_bid_quotation_id UUID,
    highest_score DECIMAL(5, 2),
    highest_score_quotation_id UUID,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Table: Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    validity_period INTEGER,
    delivery_period INTEGER,
    technical_score DECIMAL(5, 2),
    financial_score DECIMAL(5, 2),
    total_score DECIMAL(5, 2),
    status quotation_status DEFAULT 'Submitted',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    evaluation_date TIMESTAMP WITH TIME ZONE,
    evaluation_notes TEXT,
    evaluated_by UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Add foreign key constraints to Tenders table after Quotations table is created
ALTER TABLE tenders
ADD CONSTRAINT fk_winner_quotation
FOREIGN KEY (winner_quotation_id) REFERENCES quotations(id) ON DELETE RESTRICT;

ALTER TABLE tenders
ADD CONSTRAINT fk_lowest_bid_quotation
FOREIGN KEY (lowest_bid_quotation_id) REFERENCES quotations(id) ON DELETE RESTRICT;

ALTER TABLE tenders
ADD CONSTRAINT fk_highest_score_quotation
FOREIGN KEY (highest_score_quotation_id) REFERENCES quotations(id) ON DELETE RESTRICT;

-- Table: AssignmentOrders
CREATE TABLE assignment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    delivery_date TIMESTAMP WITH TIME ZONE,
    payment_terms TEXT,
    status assignment_order_status DEFAULT 'Issued',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Table: Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_order_id UUID,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_type contract_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_terms TEXT,
    delivery_terms TEXT,
    warranty_period INTEGER,
    status contract_status DEFAULT 'Active',
    termination_date TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (assignment_order_id) REFERENCES assignment_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Table: SupplyDeliveries
CREATE TABLE supply_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    delivery_number VARCHAR(100) UNIQUE NOT NULL,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    unit_price DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    delivery_location TEXT,
    status delivery_status DEFAULT 'Scheduled',
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    acceptance_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Table: BankGuarantees
CREATE TABLE bank_guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL,
    guarantee_number VARCHAR(100) UNIQUE NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    guarantee_type guarantee_type NOT NULL,
    status guarantee_status DEFAULT 'Active',
    notes TEXT,
    tax_amount DECIMAL(15, 2),
    tax_type VARCHAR(50),
    tax_rate DECIMAL(5, 2),
    tax_registration_number VARCHAR(50),
    is_tax_included BOOLEAN DEFAULT FALSE,
    profit_percentage DECIMAL(5, 2),
    calculated_profit DECIMAL(15, 2),
    bank_swift_code VARCHAR(50),
    bank_account_number VARCHAR(100),
    bank_contact_person VARCHAR(255),
    bank_contact_email VARCHAR(255),
    bank_contact_phone VARCHAR(50),
    guarantee_terms TEXT,
    is_renewable BOOLEAN DEFAULT FALSE,
    renewal_period_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Table: GovernmentGuarantees
CREATE TABLE government_guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL,
    guarantee_number VARCHAR(100) UNIQUE NOT NULL,
    authority_name VARCHAR(255),
    authority_type VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    guarantee_type guarantee_type NOT NULL,
    status guarantee_status DEFAULT 'Active',
    notes TEXT,
    tax_amount DECIMAL(15, 2),
    tax_type VARCHAR(50),
    tax_rate DECIMAL(5, 2),
    tax_registration_number VARCHAR(50),
    is_tax_included BOOLEAN DEFAULT FALSE,
    profit_percentage DECIMAL(5, 2),
    calculated_profit DECIMAL(15, 2),
    authority_code VARCHAR(50),
    authority_contact_person VARCHAR(255),
    authority_contact_email VARCHAR(255),
    authority_contact_phone VARCHAR(50),
    guarantee_terms TEXT,
    is_renewable BOOLEAN DEFAULT FALSE,
    renewal_period_days INTEGER,
    approval_number VARCHAR(100),
    approval_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Table: GuaranteeLetters
CREATE TABLE guarantee_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255),
    guarantee_number VARCHAR(100) UNIQUE NOT NULL,
    supplier VARCHAR(255),
    tender VARCHAR(255),
    winner VARCHAR(255),
    amount DECIMAL(15, 2),
    issue_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    profit_percentage DECIMAL(5, 2),
    calculated_profit DECIMAL(15, 2),
    contract_id UUID,
    bank_guarantee_id UUID,
    government_guarantee_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (bank_guarantee_id) REFERENCES bank_guarantees(id) ON DELETE SET NULL,
    FOREIGN KEY (government_guarantee_id) REFERENCES government_guarantees(id) ON DELETE SET NULL
);

-- Table: SupportMatters
CREATE TABLE support_matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority support_priority DEFAULT 'Normal',
    status support_status DEFAULT 'Open',
    description TEXT,
    total_amount DECIMAL(15, 2),
    profit_percentage DECIMAL(5, 2),
    calculated_profit DECIMAL(15, 2),
    opened_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    closed_at_utc TIMESTAMP WITH TIME ZONE,
    opened_by UUID,
    closed_by UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Table: TmsFiles
CREATE TABLE tms_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    uploaded_by UUID,
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Table: Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    status notification_status DEFAULT 'Unread',
    related_entity_id UUID,
    related_entity_type VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    read_at_utc TIMESTAMP WITH TIME ZONE,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: OperationLogs
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(255),
    entity_id UUID,
    details TEXT,
    user_id UUID,
    user_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    status VARCHAR(50),
    error_message TEXT,
    created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    created_by UUID,
    updated_by UUID
);

-- Add remaining foreign key constraints for audit fields (created_by, updated_by)
ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE roles ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE roles ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE entities ADD CONSTRAINT fk_entities_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE entities ADD CONSTRAINT fk_entities_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE addresses ADD CONSTRAINT fk_addresses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE addresses ADD CONSTRAINT fk_addresses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE currencies ADD CONSTRAINT fk_currencies_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE currencies ADD CONSTRAINT fk_currencies_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tenders ADD CONSTRAINT fk_tenders_awarded_by FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tenders ADD CONSTRAINT fk_tenders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tenders ADD CONSTRAINT fk_tenders_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE quotations ADD CONSTRAINT fk_quotations_evaluated_by FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE assignment_orders ADD CONSTRAINT fk_assignment_orders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE assignment_orders ADD CONSTRAINT fk_assignment_orders_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE contracts ADD CONSTRAINT fk_contracts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE contracts ADD CONSTRAINT fk_contracts_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE supply_deliveries ADD CONSTRAINT fk_supply_deliveries_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE supply_deliveries ADD CONSTRAINT fk_supply_deliveries_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE bank_guarantees ADD CONSTRAINT fk_bank_guarantees_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bank_guarantees ADD CONSTRAINT fk_bank_guarantees_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE government_guarantees ADD CONSTRAINT fk_government_guarantees_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE government_guarantees ADD CONSTRAINT fk_government_guarantees_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE guarantee_letters ADD CONSTRAINT fk_guarantee_letters_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE guarantee_letters ADD CONSTRAINT fk_guarantee_letters_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE support_matters ADD CONSTRAINT fk_support_matters_opened_by FOREIGN KEY (opened_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE support_matters ADD CONSTRAINT fk_support_matters_closed_by FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE support_matters ADD CONSTRAINT fk_support_matters_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE support_matters ADD CONSTRAINT fk_support_matters_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tms_files ADD CONSTRAINT fk_tms_files_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tms_files ADD CONSTRAINT fk_tms_files_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tms_files ADD CONSTRAINT fk_tms_files_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE operation_logs ADD CONSTRAINT fk_operation_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE operation_logs ADD CONSTRAINT fk_operation_logs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE operation_logs ADD CONSTRAINT fk_operation_logs_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Indexes for frequently queried foreign key columns
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_entities_parent_id ON entities (parent_id);
CREATE INDEX idx_suppliers_entity_id ON suppliers (entity_id);
CREATE INDEX idx_suppliers_primary_address_id ON suppliers (primary_address_id);
CREATE INDEX idx_tenders_entity_id ON tenders (entity_id);
CREATE INDEX idx_tenders_winner_quotation_id ON tenders (winner_quotation_id);
CREATE INDEX idx_tenders_lowest_bid_quotation_id ON tenders (lowest_bid_quotation_id);
CREATE INDEX idx_tenders_highest_score_quotation_id ON tenders (highest_score_quotation_id);
CREATE INDEX idx_quotations_tender_id ON quotations (tender_id);
CREATE INDEX idx_quotations_supplier_id ON quotations (supplier_id);
CREATE INDEX idx_quotations_currency_code ON quotations (currency_code);
CREATE INDEX idx_assignment_orders_quotation_id ON assignment_orders (quotation_id);
CREATE INDEX idx_assignment_orders_entity_id ON assignment_orders (entity_id);
CREATE INDEX idx_assignment_orders_currency_code ON assignment_orders (currency_code);
CREATE INDEX idx_contracts_assignment_order_id ON contracts (assignment_order_id);
CREATE INDEX idx_contracts_currency_code ON contracts (currency_code);
CREATE INDEX idx_supply_deliveries_contract_id ON supply_deliveries (contract_id);
CREATE INDEX idx_bank_guarantees_quotation_id ON bank_guarantees (quotation_id);
CREATE INDEX idx_bank_guarantees_currency_code ON bank_guarantees (currency_code);
CREATE INDEX idx_government_guarantees_quotation_id ON government_guarantees (quotation_id);
CREATE INDEX idx_government_guarantees_currency_code ON government_guarantees (currency_code);
CREATE INDEX idx_guarantee_letters_contract_id ON guarantee_letters (contract_id);
CREATE INDEX idx_guarantee_letters_bank_guarantee_id ON guarantee_letters (bank_guarantee_id);
CREATE INDEX idx_guarantee_letters_government_guarantees_id ON guarantee_letters (government_guarantee_id);
CREATE INDEX idx_support_matters_entity_id ON support_matters (entity_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_tms_files_entity_id ON tms_files (entity_id);

-- Indexes for audit fields
CREATE INDEX idx_users_created_by ON users (created_by);
CREATE INDEX idx_users_updated_by ON users (updated_by);
CREATE INDEX idx_roles_created_by ON roles (created_by);
CREATE INDEX idx_roles_updated_by ON roles (updated_by);
CREATE INDEX idx_user_roles_assigned_by ON user_roles (assigned_by);
CREATE INDEX idx_entities_created_by ON entities (created_by);
CREATE INDEX idx_entities_updated_by ON entities (updated_by);
CREATE INDEX idx_addresses_created_by ON addresses (created_by);
CREATE INDEX idx_addresses_updated_by ON addresses (updated_by);
CREATE INDEX idx_suppliers_created_by ON suppliers (created_by);
CREATE INDEX idx_suppliers_updated_by ON suppliers (updated_by);
CREATE INDEX idx_currencies_created_by ON currencies (created_by);
CREATE INDEX idx_currencies_updated_by ON currencies (updated_by);
CREATE INDEX idx_tenders_awarded_by ON tenders (awarded_by);
CREATE INDEX idx_tenders_created_by ON tenders (created_by);
CREATE INDEX idx_tenders_updated_by ON tenders (updated_by);
CREATE INDEX idx_quotations_evaluated_by ON quotations (evaluated_by);
CREATE INDEX idx_quotations_created_by ON quotations (created_by);
CREATE INDEX idx_quotations_updated_by ON quotations (updated_by);
CREATE INDEX idx_assignment_orders_created_by ON assignment_orders (created_by);
CREATE INDEX idx_assignment_orders_updated_by ON assignment_orders (updated_by);
CREATE INDEX idx_contracts_created_by ON contracts (created_by);
CREATE INDEX idx_contracts_updated_by ON contracts (updated_by);
CREATE INDEX idx_supply_deliveries_created_by ON supply_deliveries (created_by);
CREATE INDEX idx_supply_deliveries_updated_by ON supply_deliveries (updated_by);
CREATE INDEX idx_bank_guarantees_created_by ON bank_guarantees (created_by);
CREATE INDEX idx_bank_guarantees_updated_by ON bank_guarantees (updated_by);
CREATE INDEX idx_government_guarantees_created_by ON government_guarantees (created_by);
CREATE INDEX idx_government_guarantees_updated_by ON government_guarantees (updated_by);
CREATE INDEX idx_guarantee_letters_created_by ON guarantee_letters (created_by);
CREATE INDEX idx_guarantee_letters_updated_by ON guarantee_letters (updated_by);
CREATE INDEX idx_support_matters_opened_by ON support_matters (opened_by);
CREATE INDEX idx_support_matters_closed_by ON support_matters (closed_by);
CREATE INDEX idx_support_matters_created_by ON support_matters (created_by);
CREATE INDEX idx_support_matters_updated_by ON support_matters (updated_by);
CREATE INDEX idx_tms_files_uploaded_by ON tms_files (uploaded_by);
CREATE INDEX idx_tms_files_created_by ON tms_files (created_by);
CREATE INDEX idx_tms_files_updated_by ON tms_files (updated_by);
CREATE INDEX idx_notifications_created_by ON notifications (created_by);
CREATE INDEX idx_notifications_updated_by ON notifications (updated_by);
CREATE INDEX idx_operation_logs_user_id ON operation_logs (user_id);
CREATE INDEX idx_operation_logs_created_by ON operation_logs (created_by);
CREATE INDEX idx_operation_logs_updated_by ON operation_logs (updated_by);

-- Additional Indexes for frequently queried columns
CREATE INDEX idx_tenders_status ON tenders (status);
CREATE INDEX idx_quotations_status ON quotations (status);
CREATE INDEX idx_contracts_status ON contracts (status);
CREATE INDEX idx_support_matters_status ON support_matters (status);
CREATE INDEX idx_support_matters_priority ON support_matters (priority);

-- Data Integrity Constraints

-- For users table:
ALTER TABLE users ADD CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$');
ALTER TABLE users ADD CONSTRAINT chk_users_phone_format CHECK (phone ~* '^\+?[0-9]{10,15}$');

-- For contracts table:
ALTER TABLE contracts ADD CONSTRAINT chk_contracts_date_range CHECK (end_date >= start_date);