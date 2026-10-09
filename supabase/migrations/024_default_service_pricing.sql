-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-2
-- DEFAULT SERVICE PRICING
--
-- Every service must have a pricing configuration.
--
-- Existing missing rows are repaired.
-- Future services automatically receive MANUAL_PRICE.
-- =========================================================


-- =========================================================
-- 1. REPAIR ANY MISSING PRICING ROWS
-- =========================================================

insert into public.service_pricing (
  service_id,
  pricing_mode,
  currency,
  active
)

select
  s.id,
  'MANUAL_PRICE',
  'GHS',
  true

from public.services s

where not exists (
  select 1

  from public.service_pricing sp

  where sp.service_id =
        s.id
)

on conflict (service_id)
do nothing;


-- =========================================================
-- 2. DEFAULT PRICING TRIGGER
-- =========================================================

create or replace function
public.create_default_service_pricing()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin

  insert into public.service_pricing (
    service_id,
    pricing_mode,
    currency,
    active
  )
  values (
    new.id,
    'MANUAL_PRICE',
    'GHS',
    true
  )

  on conflict (service_id)
  do nothing;


  return new;

end;
$$;


drop trigger if exists
  create_default_service_pricing_trigger
on public.services;


create trigger
  create_default_service_pricing_trigger

after insert
on public.services

for each row

execute function
  public.create_default_service_pricing();


-- =========================================================
-- 3. VERIFY INVARIANT
-- =========================================================

do $$
declare
  v_missing_count integer;
begin

  select
    count(*)

  into
    v_missing_count

  from public.services s

  left join public.service_pricing sp
    on sp.service_id =
       s.id

  where sp.id is null;


  if v_missing_count > 0 then
    raise exception
      'One or more services do not have a pricing configuration.';
  end if;

end;
$$;