-- =========================================================
-- ADMIN AUTHORIZATION HELPERS
-- =========================================================

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and active = true
  );
$$;


create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and active = true
      and role = 'SUPER_ADMIN'
  );
$$;


revoke all on function public.is_active_admin() from public;
revoke all on function public.is_super_admin() from public;

grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;


-- =========================================================
-- ADMIN READ ACCESS
-- =========================================================

create policy "Admins can read requests"
on public.requests
for select
to authenticated
using (public.is_active_admin());


create policy "Admins can read request responses"
on public.request_form_responses
for select
to authenticated
using (public.is_active_admin());


create policy "Admins can read payments"
on public.payments
for select
to authenticated
using (public.is_active_admin());


create policy "Admins can read deliveries"
on public.deliveries
for select
to authenticated
using (public.is_active_admin());


create policy "Admins can read request status history"
on public.request_status_history
for select
to authenticated
using (public.is_active_admin());


create policy "Admins can read request documents"
on public.request_documents
for select
to authenticated
using (public.is_active_admin());


-- =========================================================
-- OPERATIONAL UPDATE ACCESS
-- Both SUPER_ADMIN and OPERATIONS_ADMIN can perform
-- operational work.
-- =========================================================

create policy "Admins can update requests"
on public.requests
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());


create policy "Admins can update payments"
on public.payments
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());


create policy "Admins can update deliveries"
on public.deliveries
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());


create policy "Admins can insert request history"
on public.request_status_history
for insert
to authenticated
with check (public.is_active_admin());


create policy "Admins can insert request documents"
on public.request_documents
for insert
to authenticated
with check (public.is_active_admin());


create policy "Admins can update request documents"
on public.request_documents
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());


-- =========================================================
-- SUPER ADMIN CONFIGURATION MANAGEMENT
-- =========================================================

create policy "Super admin can manage universities"
on public.universities
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());


create policy "Super admin can manage services"
on public.services
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());


create policy "Super admin can manage form fields"
on public.service_form_fields
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());


create policy "Super admin can read all admin profiles"
on public.admin_profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_super_admin()
);


create policy "Super admin can manage system settings"
on public.system_settings
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());


create policy "Super admin can read activity logs"
on public.activity_logs
for select
to authenticated
using (public.is_super_admin());