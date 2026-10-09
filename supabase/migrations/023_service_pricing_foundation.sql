-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-1
-- SERVICE PRICING FOUNDATION
--
-- PURPOSE
--
-- 1. Add configurable pricing for every service.
-- 2. Support multiple pricing modes.
-- 3. Prepare requests to store immutable pricing snapshots.
-- 4. Preserve all existing services and requests.
--
-- PRICING MODES
--
-- FIXED
-- PER_UNIT
-- STARTING_FROM
-- QUOTE_REQUIRED
-- FREE
-- MANUAL_PRICE
-- =========================================================


-- =========================================================
-- 1. SERVICE PRICING TABLE
-- =========================================================

create table if not exists public.service_pricing (
  id uuid
    primary key
    default gen_random_uuid(),

  service_id uuid
    not null
    unique
    references public.services(id)
    on delete cascade,

  pricing_mode text
    not null
    default 'MANUAL_PRICE',

  currency text
    not null
    default 'GHS',

  amount numeric(12, 2),

  unit_label text,

  minimum_quantity numeric(12, 2),

  maximum_quantity numeric(12, 2),

  display_note text,

  active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_pricing_mode_check
    check (
      pricing_mode in (
        'FIXED',
        'PER_UNIT',
        'STARTING_FROM',
        'QUOTE_REQUIRED',
        'FREE',
        'MANUAL_PRICE'
      )
    ),

  constraint service_pricing_currency_check
    check (
      char_length(currency) = 3
    ),

  constraint service_pricing_amount_check
    check (
      amount is null
      or amount >= 0
    ),

  constraint service_pricing_min_quantity_check
    check (
      minimum_quantity is null
      or minimum_quantity >= 0
    ),

  constraint service_pricing_max_quantity_check
    check (
      maximum_quantity is null
      or maximum_quantity >= 0
    ),

  constraint service_pricing_quantity_range_check
    check (
      maximum_quantity is null
      or minimum_quantity is null
      or maximum_quantity >= minimum_quantity
    ),

  constraint service_pricing_mode_value_check
    check (
      (
        pricing_mode = 'FREE'
        and (
          amount is null
          or amount = 0
        )
      )
      or
      (
        pricing_mode in (
          'FIXED',
          'PER_UNIT',
          'STARTING_FROM'
        )
        and amount is not null
      )
      or
      (
        pricing_mode in (
          'QUOTE_REQUIRED',
          'MANUAL_PRICE'
        )
      )
    )
);


-- =========================================================
-- 2. INDEX
-- =========================================================

create index if not exists
  idx_service_pricing_service_id
on public.service_pricing(service_id);


create index if not exists
  idx_service_pricing_mode
on public.service_pricing(pricing_mode);


-- =========================================================
-- 3. NORMALIZE CURRENCY VALUES
-- =========================================================

create or replace function public.normalize_service_pricing()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin

  new.currency :=
    upper(
      btrim(
        coalesce(
          new.currency,
          'GHS'
        )
      )
    );


  new.unit_label :=
    nullif(
      btrim(
        coalesce(
          new.unit_label,
          ''
        )
      ),
      ''
    );


  new.display_note :=
    nullif(
      btrim(
        coalesce(
          new.display_note,
          ''
        )
      ),
      ''
    );


  -- -------------------------------------------------------
  -- FREE
  -- -------------------------------------------------------

  if new.pricing_mode = 'FREE' then
    new.amount := 0;

    new.unit_label := null;

    new.minimum_quantity := null;

    new.maximum_quantity := null;
  end if;


  -- -------------------------------------------------------
  -- FIXED
  -- -------------------------------------------------------

  if new.pricing_mode = 'FIXED' then
    new.unit_label := null;

    new.minimum_quantity := null;

    new.maximum_quantity := null;
  end if;


  -- -------------------------------------------------------
  -- STARTING FROM
  -- -------------------------------------------------------

  if new.pricing_mode = 'STARTING_FROM' then
    new.unit_label := null;

    new.minimum_quantity := null;

    new.maximum_quantity := null;
  end if;


  -- -------------------------------------------------------
  -- QUOTE REQUIRED
  -- -------------------------------------------------------

  if new.pricing_mode = 'QUOTE_REQUIRED' then
    new.amount := null;

    new.unit_label := null;

    new.minimum_quantity := null;

    new.maximum_quantity := null;
  end if;


  -- -------------------------------------------------------
  -- MANUAL PRICE
  -- -------------------------------------------------------

  if new.pricing_mode = 'MANUAL_PRICE' then
    new.amount := null;

    new.unit_label := null;

    new.minimum_quantity := null;

    new.maximum_quantity := null;
  end if;


  -- -------------------------------------------------------
  -- PER UNIT
  -- -------------------------------------------------------

  if new.pricing_mode = 'PER_UNIT'
     and new.unit_label is null
  then
    raise exception
      'PER_UNIT pricing requires a unit label.';
  end if;


  new.updated_at :=
    now();


  return new;

end;
$$;


drop trigger if exists
  normalize_service_pricing_trigger
on public.service_pricing;


create trigger
  normalize_service_pricing_trigger

before insert or update
on public.service_pricing

for each row

execute function
  public.normalize_service_pricing();


-- =========================================================
-- 4. SEED EXISTING SERVICES
--
-- We deliberately use MANUAL_PRICE.
--
-- This means existing services keep working exactly as they
-- do now until an administrator explicitly configures a
-- proper price.
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

  where
    sp.service_id =
    s.id
);


-- =========================================================
-- 5. REQUEST PRICING SNAPSHOT
--
-- These columns preserve the price that applied when the
-- request was created.
--
-- Future changes to service_pricing must not rewrite old
-- request prices.
-- =========================================================

alter table public.requests
add column if not exists
  pricing_mode_snapshot text;


alter table public.requests
add column if not exists
  pricing_currency_snapshot text;


alter table public.requests
add column if not exists
  pricing_unit_amount_snapshot numeric(12, 2);


alter table public.requests
add column if not exists
  pricing_quantity_snapshot numeric(12, 2);


alter table public.requests
add column if not exists
  pricing_total_snapshot numeric(12, 2);


alter table public.requests
add column if not exists
  pricing_note_snapshot text;


alter table public.requests
add column if not exists
  price_finalized_at timestamptz;


-- =========================================================
-- 6. REQUEST SNAPSHOT CONSTRAINTS
-- =========================================================

alter table public.requests
drop constraint if exists
  requests_pricing_mode_snapshot_check;


alter table public.requests
add constraint
  requests_pricing_mode_snapshot_check
check (
  pricing_mode_snapshot is null
  or pricing_mode_snapshot in (
    'FIXED',
    'PER_UNIT',
    'STARTING_FROM',
    'QUOTE_REQUIRED',
    'FREE',
    'MANUAL_PRICE'
  )
);


alter table public.requests
drop constraint if exists
  requests_pricing_unit_amount_snapshot_check;


alter table public.requests
add constraint
  requests_pricing_unit_amount_snapshot_check
check (
  pricing_unit_amount_snapshot is null
  or pricing_unit_amount_snapshot >= 0
);


alter table public.requests
drop constraint if exists
  requests_pricing_quantity_snapshot_check;


alter table public.requests
add constraint
  requests_pricing_quantity_snapshot_check
check (
  pricing_quantity_snapshot is null
  or pricing_quantity_snapshot >= 0
);


alter table public.requests
drop constraint if exists
  requests_pricing_total_snapshot_check;


alter table public.requests
add constraint
  requests_pricing_total_snapshot_check
check (
  pricing_total_snapshot is null
  or pricing_total_snapshot >= 0
);


-- =========================================================
-- 7. RLS
--
-- Pricing is served to customers through the application
-- API. Direct database access remains restricted.
-- =========================================================

alter table public.service_pricing
enable row level security;


-- =========================================================
-- 8. SERVICE ROLE ACCESS
--
-- service_role bypasses RLS, but explicit grants document
-- the intended server-side access model.
-- =========================================================

grant select,
      insert,
      update,
      delete

on public.service_pricing

to service_role;


-- =========================================================
-- END PHASE 13B-1
-- =========================================================