-- =========================================================
-- SEEKERS CONNECT 247
-- Initial Database Schema
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================================================
-- UNIVERSITIES
-- =========================================================

create table public.universities (
  id uuid primary key default gen_random_uuid(),

  code text not null unique,
  name text not null,
  location text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- SERVICES
-- =========================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),

  university_id uuid not null
    references public.universities(id)
    on delete restrict,

  slug text not null,

  name text not null,
  short_name text not null,
  description text,

  category text not null
    check (
      category in (
        'transcript',
        'attestation',
        'proficiency',
        'other'
      )
    ),

  form_type text not null,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (university_id, slug)
);

-- =========================================================
-- DYNAMIC SERVICE FORM FIELDS
-- =========================================================

create table public.service_form_fields (
  id uuid primary key default gen_random_uuid(),

  service_id uuid not null
    references public.services(id)
    on delete cascade,

  field_key text not null,
  label text not null,

  field_type text not null
    check (
      field_type in (
        'text',
        'email',
        'tel',
        'number',
        'date',
        'textarea',
        'select'
      )
    ),

  placeholder text,

  required boolean not null default false,

  options jsonb,

  sort_order integer not null default 0,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  unique (service_id, field_key)
);

-- =========================================================
-- ADMIN PROFILES
-- =========================================================

create table public.admin_profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text not null,

  role text not null
    check (
      role in (
        'SUPER_ADMIN',
        'OPERATIONS_ADMIN'
      )
    ),

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REQUESTS
-- =========================================================

create table public.requests (
  id uuid primary key default gen_random_uuid(),

  request_number text not null unique,

  university_id uuid not null
    references public.universities(id)
    on delete restrict,

  service_id uuid not null
    references public.services(id)
    on delete restrict,

  status text not null
    default 'AWAITING_PAYMENT_VERIFICATION'
    check (
      status in (
        'SUBMITTED',
        'AWAITING_PAYMENT_VERIFICATION',
        'PAYMENT_CONFIRMED',
        'PROCESSING_REQUEST',
        'SUBMITTED_TO_UNIVERSITY',
        'AWAITING_UNIVERSITY',
        'DOCUMENT_READY',
        'DOCUMENT_SCANNED',
        'PREPARING_DELIVERY',
        'HANDED_TO_EMS',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'PAYMENT_REJECTED',
        'MORE_INFORMATION_REQUIRED',
        'ON_HOLD',
        'CANCELLED'
      )
    ),

  first_name text not null,
  other_names text,
  surname text not null,

  gender text,

  phone text not null,
  email text not null,

  notes text,

  tracking_number text unique,

  -- Never store the customer's tracking PIN itself.
  tracking_pin_digest text,

  tracking_issued_at timestamptz,

  submitted_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REQUEST FORM RESPONSES
-- =========================================================

create table public.request_form_responses (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  field_key text not null,

  -- Snapshot the label because the administrator may rename
  -- the form field in the future.
  field_label text not null,

  value text,

  created_at timestamptz not null default now(),

  unique (request_id, field_key)
);

-- =========================================================
-- PAYMENTS
-- =========================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  payment_method text not null
    check (
      payment_method in (
        'momo',
        'bank'
      )
    ),

  amount numeric(12, 2),

  currency text not null default 'GHS',

  status text not null
    default 'PENDING'
    check (
      status in (
        'PENDING',
        'CONFIRMED',
        'REJECTED'
      )
    ),

  proof_storage_path text,

  verified_by uuid
    references public.admin_profiles(id)
    on delete set null,

  verified_at timestamptz,

  rejection_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- DELIVERIES
-- =========================================================

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null unique
    references public.requests(id)
    on delete cascade,

  physical_delivery_required boolean not null default true,

  full_name text,

  house_number text,
  area_town text,
  city_district text,
  region text,
  digital_address text,

  phone text,
  email text,

  item_type text,

  emergency_contact text,

  ems_tracking_number text,

  dispatch_date timestamptz,
  delivered_date timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REQUEST STATUS HISTORY
-- =========================================================

create table public.request_status_history (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  status text not null,

  public_message text,

  internal_note text,

  changed_by uuid
    references public.admin_profiles(id)
    on delete set null,

  created_at timestamptz not null default now()
);

-- =========================================================
-- REQUEST DOCUMENTS
-- =========================================================

create table public.request_documents (
  id uuid primary key default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  document_type text not null
    check (
      document_type in (
        'PAYMENT_PROOF',
        'APPLICATION_DOCUMENT',
        'SCANNED_TRANSCRIPT',
        'ATTESTATION',
        'PROFICIENCY_LETTER',
        'OTHER'
      )
    ),

  storage_path text not null,

  original_filename text,

  mime_type text,

  size_bytes bigint,

  visible_to_customer boolean not null default false,

  uploaded_by uuid
    references public.admin_profiles(id)
    on delete set null,

  created_at timestamptz not null default now()
);

-- =========================================================
-- SYSTEM SETTINGS
-- =========================================================

create table public.system_settings (
  setting_key text primary key,

  setting_value jsonb not null,

  description text,

  updated_by uuid
    references public.admin_profiles(id)
    on delete set null,

  updated_at timestamptz not null default now()
);

-- =========================================================
-- ACTIVITY LOG
-- =========================================================

create table public.activity_logs (
  id bigint generated always as identity primary key,

  actor_id uuid
    references public.admin_profiles(id)
    on delete set null,

  action text not null,

  entity_type text,

  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================

create index idx_services_university
  on public.services(university_id);

create index idx_requests_university
  on public.requests(university_id);

create index idx_requests_service
  on public.requests(service_id);

create index idx_requests_status
  on public.requests(status);

create index idx_requests_phone
  on public.requests(phone);

create index idx_requests_created_at
  on public.requests(created_at desc);

create index idx_payments_request
  on public.payments(request_id);

create index idx_payments_status
  on public.payments(status);

create index idx_status_history_request
  on public.request_status_history(request_id);

create index idx_documents_request
  on public.request_documents(request_id);

create index idx_activity_logs_created_at
  on public.activity_logs(created_at desc);

-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger universities_set_updated_at
before update on public.universities
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger deliveries_set_updated_at
before update on public.deliveries
for each row execute function public.set_updated_at();