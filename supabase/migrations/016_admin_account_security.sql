begin;


-- =========================================================
-- ADMIN ACCOUNT SECURITY STATE
-- =========================================================

alter table public.admin_profiles
add column if not exists must_change_password boolean
not null
default false;


alter table public.admin_profiles
add column if not exists password_changed_at timestamptz;


-- Existing administrators already have established passwords,
-- so they should not suddenly be forced through onboarding.
update public.admin_profiles
set must_change_password = false
where must_change_password is null;


commit;