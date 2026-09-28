-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.universities enable row level security;
alter table public.services enable row level security;
alter table public.service_form_fields enable row level security;

alter table public.admin_profiles enable row level security;

alter table public.requests enable row level security;
alter table public.request_form_responses enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.request_status_history enable row level security;
alter table public.request_documents enable row level security;
alter table public.system_settings enable row level security;
alter table public.activity_logs enable row level security;

-- =========================================================
-- PUBLIC CATALOG ACCESS
-- Customers may only see ACTIVE public configuration.
-- =========================================================

create policy "Public can read active universities"
on public.universities
for select
to anon, authenticated
using (active = true);

create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (active = true);

create policy "Public can read active service form fields"
on public.service_form_fields
for select
to anon, authenticated
using (active = true);

-- =========================================================
-- ADMIN PROFILE
-- A logged-in admin may read only their own profile.
-- =========================================================

create policy "Admins can read own profile"
on public.admin_profiles
for select
to authenticated
using (id = auth.uid());

-- =========================================================
-- IMPORTANT:
--
-- There are intentionally NO public policies for:
--
-- requests
-- request_form_responses
-- payments
-- deliveries
-- request_status_history
-- request_documents
-- system_settings
-- activity_logs
--
-- Customer operations will go through trusted Next.js
-- server endpoints instead of direct browser access.
-- =========================================================