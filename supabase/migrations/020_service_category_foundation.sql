-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13A-1
-- SERVICE CATEGORY FOUNDATION
--
-- PURPOSE:
-- Introduce first-class service categories and remove the
-- long-term requirement that every service must belong to
-- a university.
--
-- IMPORTANT:
-- This migration is intentionally backwards compatible.
--
-- Existing university services continue to work.
-- Existing SC247 general services continue to work.
-- Existing requests are NOT modified.
-- Existing tracking/payment/workflow RPCs are NOT removed.
-- =========================================================


-- =========================================================
-- 1. SERVICE CATEGORIES
-- =========================================================

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,

  name text not null,

  description text,

  icon_key text,

  display_order integer not null default 0,

  active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 2. UPDATED_AT TRIGGER FOR SERVICE CATEGORIES
-- =========================================================

drop trigger if exists
  service_categories_set_updated_at
on public.service_categories;


create trigger service_categories_set_updated_at
before update on public.service_categories
for each row
execute function public.set_updated_at();


-- =========================================================
-- 3. SEED PLATFORM SERVICE CATEGORIES
-- =========================================================

insert into public.service_categories (
  slug,
  name,
  description,
  icon_key,
  display_order,
  active
)
values

(
  'academic-documents',
  'Academic & Document Services',
  'Academic documents, institutional requests and related document processing.',
  'graduation-cap',
  10,
  true
),

(
  'errands-delivery',
  'Errands & Delivery',
  'Errands, pickup, delivery and shopping assistance.',
  'package',
  20,
  true
),

(
  'government-worker-loans',
  'Government Worker Loans',
  'Loan request, Controller loan and loan payoff support for eligible government workers.',
  'landmark',
  30,
  true
),

(
  'legal-services',
  'Legal Services',
  'Affidavit, Gazette and related legal support services.',
  'scale',
  40,
  true
),

(
  'printing-services',
  'Printing Services',
  'Document, book, colour, black-and-white and bulk printing services.',
  'printer',
  50,
  true
),

(
  'research-support',
  'Research & Academic Support',
  'Research guidance, topic assistance and plagiarism-related services.',
  'book-open',
  60,
  true
),

(
  'career-services',
  'Jobs & Career Services',
  'Job seeker registration and career-related support.',
  'briefcase-business',
  70,
  true
),

(
  'study-abroad',
  'Study Abroad',
  'School search and international application assistance.',
  'plane',
  80,
  true
),

(
  'results-applications',
  'Results, Placement & Applications',
  'Result checking, placement and application support including BECE, WASSCE, nursing and public-service applications.',
  'clipboard-check',
  90,
  true
),

(
  'other-services',
  'Other Services',
  'Additional services provided by Seekers Connect 247.',
  'shapes',
  100,
  true
)

on conflict (slug)
do update set

  name =
    excluded.name,

  description =
    excluded.description,

  icon_key =
    excluded.icon_key,

  display_order =
    excluded.display_order;


-- =========================================================
-- 4. EXPAND SERVICES TABLE
-- =========================================================

alter table public.services
add column if not exists
  service_category_id uuid
  references public.service_categories(id)
  on delete restrict;


alter table public.services
add column if not exists
  service_scope text;


alter table public.services
add column if not exists
  display_order integer
  not null
  default 0;


alter table public.services
add column if not exists
  featured boolean
  not null
  default false;


alter table public.services
add column if not exists
  image_url text;


-- =========================================================
-- 5. VALID SERVICE SCOPE
--
-- academic:
-- Requires a real university/institution.
--
-- general:
-- Seekers Connect service not tied to a university.
-- =========================================================

update public.services
set service_scope =
  case
    when exists (
      select 1
      from public.universities u
      where
        u.id =
          public.services.university_id
        and
        u.code = 'SC247'
    )
    then 'general'

    else 'academic'
  end
where service_scope is null;


alter table public.services
alter column service_scope
set default 'general';


alter table public.services
alter column service_scope
set not null;


alter table public.services
drop constraint if exists
  services_service_scope_check;


alter table public.services
add constraint services_service_scope_check
check (
  service_scope in (
    'general',
    'academic'
  )
);


-- =========================================================
-- 6. BACKFILL EXISTING ACADEMIC SERVICES
-- =========================================================

update public.services s
set service_category_id =
  c.id
from public.service_categories c
where
  c.slug =
    'academic-documents'
  and
  s.service_scope =
    'academic'
  and
  s.service_category_id
    is null;


-- =========================================================
-- 7. BACKFILL EXISTING SC247 GENERAL SERVICES
-- =========================================================

-- Run an Errand

update public.services s
set service_category_id =
  c.id
from
  public.service_categories c,
  public.universities u
where
  s.university_id =
    u.id

  and
  u.code =
    'SC247'

  and
  s.slug =
    'run-an-errand'

  and
  c.slug =
    'errands-delivery';


-- Pickup & Delivery

update public.services s
set service_category_id =
  c.id
from
  public.service_categories c,
  public.universities u
where
  s.university_id =
    u.id

  and
  u.code =
    'SC247'

  and
  s.slug =
    'pickup-delivery'

  and
  c.slug =
    'errands-delivery';


-- Shop For Me

update public.services s
set service_category_id =
  c.id
from
  public.service_categories c,
  public.universities u
where
  s.university_id =
    u.id

  and
  u.code =
    'SC247'

  and
  s.slug =
    'shop-for-me'

  and
  c.slug =
    'errands-delivery';


-- Document Errands

update public.services s
set service_category_id =
  c.id
from
  public.service_categories c,
  public.universities u
where
  s.university_id =
    u.id

  and
  u.code =
    'SC247'

  and
  s.slug =
    'document-errands'

  and
  c.slug =
    'academic-documents';


-- =========================================================
-- 8. FALLBACK CATEGORY
--
-- Anything not mapped above gets Other Services.
-- This prevents old/custom records from becoming unusable.
-- =========================================================

update public.services s
set service_category_id =
  c.id
from public.service_categories c
where
  c.slug =
    'other-services'

  and
  s.service_category_id
    is null;


-- =========================================================
-- 9. CATEGORY IS NOW REQUIRED
-- =========================================================

alter table public.services
alter column service_category_id
set not null;


-- =========================================================
-- 10. UNIVERSITY RELATIONSHIP BECOMES OPTIONAL
--
-- Existing records retain their current university_id.
--
-- Future general services will be permitted to use NULL.
-- =========================================================

alter table public.services
alter column university_id
drop not null;


-- =========================================================
-- 11. GLOBAL SERVICE SLUG PROTECTION
--
-- The existing unique(university_id, slug) still protects
-- university-specific services.
--
-- PostgreSQL allows multiple NULL values inside that
-- constraint, so global services need their own partial
-- unique index.
-- =========================================================

create unique index if not exists
  idx_services_global_slug_unique
on public.services(slug)
where university_id is null;


-- =========================================================
-- 12. CATEGORY / SCOPE INDEXES
-- =========================================================

create index if not exists
  idx_services_service_category
on public.services(
  service_category_id
);


create index if not exists
  idx_services_scope
on public.services(
  service_scope
);


create index if not exists
  idx_service_categories_active_order
on public.service_categories(
  active,
  display_order
);


-- =========================================================
-- 13. ENABLE RLS
-- =========================================================

alter table public.service_categories
enable row level security;


-- =========================================================
-- 14. PUBLIC READ POLICY
--
-- Customers need active categories so the public catalog
-- can eventually group services.
-- =========================================================

drop policy if exists
  "Public can read active service categories"
on public.service_categories;


create policy
  "Public can read active service categories"
on public.service_categories

for select

to anon, authenticated

using (
  active = true
);


-- =========================================================
-- 15. SERVICE ROLE ACCESS
-- =========================================================

grant
  select,
  insert,
  update,
  delete
on public.service_categories
to service_role;


-- =========================================================
-- END PHASE 13A-1
-- =========================================================