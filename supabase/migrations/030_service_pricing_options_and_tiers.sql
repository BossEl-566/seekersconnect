-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-6A
-- SERVICE PRICING OPTIONS + QUANTITY TIERS
--
-- Existing service_pricing remains the primary/default
-- pricing configuration for a service.
--
-- Optional structure:
--
-- service_pricing
--      ↓
-- service_pricing_options
--      ↓
-- service_pricing_tiers
--
-- Example:
--
-- Printing / PER_UNIT / GHS
--
-- Black & White
--   1 - 99 pages
--   100+ pages
--
-- Colour
--   1 - 49 pages
--   50+ pages
--
-- =========================================================


-- =========================================================
-- 1. PRICING OPTIONS
-- =========================================================

create table if not exists
public.service_pricing_options (
  id uuid
    primary key
    default gen_random_uuid(),

  service_pricing_id uuid
    not null
    references public.service_pricing(id)
    on delete cascade,

  code text
    not null,

  label text
    not null,

  description text,

  /*
   * For PER_UNIT pricing this can override the parent
   * unit label for this option.
   *
   * Example:
   * page
   * copy
   * book
   * sheet
   */
  unit_label text,

  display_order integer
    not null
    default 0,

  active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint
    service_pricing_options_code_unique
  unique (
    service_pricing_id,
    code
  ),

  constraint
    service_pricing_options_code_not_blank
  check (
    length(
      btrim(
        code
      )
    ) > 0
  ),

  constraint
    service_pricing_options_label_not_blank
  check (
    length(
      btrim(
        label
      )
    ) > 0
  ),

  constraint
    service_pricing_options_display_order_check
  check (
    display_order >= 0
  )
);


-- =========================================================
-- 2. INDEX OPTIONS
-- =========================================================

create index if not exists
  service_pricing_options_pricing_idx
on public.service_pricing_options (
  service_pricing_id,
  active,
  display_order
);


-- =========================================================
-- 3. PRICING TIERS
--
-- The parent service_pricing determines the calculation mode
-- and currency.
--
-- FIXED:
--   one active tier per option
--
-- STARTING_FROM:
--   one active tier per option
--
-- PER_UNIT:
--   one or more non-overlapping quantity tiers
-- =========================================================

create table if not exists
public.service_pricing_tiers (
  id uuid
    primary key
    default gen_random_uuid(),

  pricing_option_id uuid
    not null
    references public.service_pricing_options(id)
    on delete cascade,

  /*
   * Optional presentation label.
   *
   * Examples:
   * Standard
   * Bulk
   * 100+ Pages
   */
  label text,

  amount numeric(12,2)
    not null,

  minimum_quantity numeric(12,2),

  maximum_quantity numeric(12,2),

  display_order integer
    not null
    default 0,

  active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint
    service_pricing_tiers_amount_check
  check (
    amount > 0
  ),

  constraint
    service_pricing_tiers_minimum_quantity_check
  check (
    minimum_quantity is null
    or minimum_quantity > 0
  ),

  constraint
    service_pricing_tiers_maximum_quantity_check
  check (
    maximum_quantity is null
    or maximum_quantity > 0
  ),

  constraint
    service_pricing_tiers_quantity_range_check
  check (
    maximum_quantity is null
    or minimum_quantity is null
    or maximum_quantity >=
       minimum_quantity
  ),

  constraint
    service_pricing_tiers_display_order_check
  check (
    display_order >= 0
  )
);


-- =========================================================
-- 4. INDEX TIERS
-- =========================================================

create index if not exists
  service_pricing_tiers_option_idx
on public.service_pricing_tiers (
  pricing_option_id,
  active,
  display_order
);


-- =========================================================
-- 5. NORMALIZE OPTION
-- =========================================================

create or replace function
public.normalize_service_pricing_option()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
declare
  v_pricing_mode text;

  v_parent_unit_label text;
begin

  -- -------------------------------------------------------
  -- Parent pricing configuration
  -- -------------------------------------------------------

  select
    sp.pricing_mode,
    sp.unit_label

  into
    v_pricing_mode,
    v_parent_unit_label

  from public.service_pricing sp

  where
    sp.id =
    new.service_pricing_id;


  if not found then
    raise exception
      'Service pricing configuration does not exist.';
  end if;


  -- -------------------------------------------------------
  -- Options only apply to deterministic pricing modes.
  --
  -- Quote/manual/free services do not require selectable
  -- price variants at this stage.
  -- -------------------------------------------------------

  if
    v_pricing_mode not in (
      'FIXED',
      'PER_UNIT',
      'STARTING_FROM'
    )
  then
    raise exception
      'Pricing options can only be used with FIXED, PER_UNIT or STARTING_FROM pricing.';
  end if;


  -- -------------------------------------------------------
  -- Normalize code
  -- -------------------------------------------------------

  new.code :=
    lower(
      regexp_replace(
        btrim(
          new.code
        ),
        '[^a-zA-Z0-9_-]+',
        '-',
        'g'
      )
    );


  new.code :=
    regexp_replace(
      new.code,
      '^-+|-+$',
      '',
      'g'
    );


  if
    new.code is null
    or new.code = ''
  then
    raise exception
      'Pricing option code is required.';
  end if;


  -- -------------------------------------------------------
  -- Normalize text
  -- -------------------------------------------------------

  new.label :=
    btrim(
      new.label
    );


  new.description :=
    nullif(
      btrim(
        coalesce(
          new.description,
          ''
        )
      ),
      ''
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


  -- -------------------------------------------------------
  -- Unit handling
  -- -------------------------------------------------------

  if
    v_pricing_mode =
    'PER_UNIT'
  then

    /*
     * Reuse the parent unit if the option does not define its
     * own unit.
     */

    new.unit_label :=
      coalesce(
        new.unit_label,
        nullif(
          btrim(
            coalesce(
              v_parent_unit_label,
              ''
            )
          ),
          ''
        )
      );


    if
      new.unit_label is null
    then
      raise exception
        'A unit label is required for per-unit pricing options.';
    end if;

  else

    /*
     * FIXED / STARTING_FROM options do not require a unit.
     */

    new.unit_label :=
      null;

  end if;


  new.updated_at :=
    now();


  return new;
end;
$$;


drop trigger if exists
  normalize_service_pricing_option_trigger
on public.service_pricing_options;


create trigger
  normalize_service_pricing_option_trigger

before insert or update
on public.service_pricing_options

for each row
execute function
  public.normalize_service_pricing_option();


-- =========================================================
-- 6. VALIDATE / NORMALIZE TIER
-- =========================================================

create or replace function
public.validate_service_pricing_tier()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
declare
  v_pricing_mode text;

  v_conflict boolean;
begin

  -- -------------------------------------------------------
  -- Resolve pricing mode through option -> service pricing
  -- -------------------------------------------------------

  select
    sp.pricing_mode

  into
    v_pricing_mode

  from public.service_pricing_options spo

  join public.service_pricing sp
    on sp.id =
       spo.service_pricing_id

  where
    spo.id =
    new.pricing_option_id;


  if not found then
    raise exception
      'Pricing option does not exist.';
  end if;


  -- -------------------------------------------------------
  -- Tier label
  -- -------------------------------------------------------

  new.label :=
    nullif(
      btrim(
        coalesce(
          new.label,
          ''
        )
      ),
      ''
    );


  -- -------------------------------------------------------
  -- PER UNIT
  --
  -- Quantity ranges are required.
  -- -------------------------------------------------------

  if
    v_pricing_mode =
    'PER_UNIT'
  then

    if
      new.minimum_quantity
      is null
    then
      raise exception
        'Minimum quantity is required for a per-unit pricing tier.';
    end if;


    if
      new.maximum_quantity
      is not null

      and

      new.maximum_quantity <
      new.minimum_quantity
    then
      raise exception
        'Maximum quantity cannot be lower than minimum quantity.';
    end if;


    -- -----------------------------------------------------
    -- Prevent overlapping ACTIVE quantity bands.
    --
    -- Examples:
    --
    -- 1 - 99
    -- 100+
    --
    -- valid.
    --
    -- 1 - 100
    -- 100+
    --
    -- invalid because quantity 100 belongs to both.
    -- -----------------------------------------------------

    if
      new.active
    then

      select
        exists (
          select 1

          from public.service_pricing_tiers existing

          where
            existing.pricing_option_id =
            new.pricing_option_id

            and existing.active =
            true

            and existing.id <>
                new.id

            and
              numrange(
                existing.minimum_quantity,
                existing.maximum_quantity,
                '[]'
              )
              &&
              numrange(
                new.minimum_quantity,
                new.maximum_quantity,
                '[]'
              )
        )

      into
        v_conflict;


      if
        v_conflict
      then
        raise exception
          'This quantity range overlaps another active pricing tier.';
      end if;

    end if;


  else

    -- -----------------------------------------------------
    -- FIXED / STARTING_FROM
    --
    -- Quantities do not apply.
    -- -----------------------------------------------------

    new.minimum_quantity :=
      null;


    new.maximum_quantity :=
      null;


    /*
     * A fixed or starting-from option must not have more
     * than one active amount.
     */

    if
      new.active
    then

      if exists (
        select 1

        from public.service_pricing_tiers existing

        where
          existing.pricing_option_id =
          new.pricing_option_id

          and existing.active =
          true

          and existing.id <>
              new.id
      )
      then
        raise exception
          'Fixed and starting-from pricing options can only have one active price.';
      end if;

    end if;

  end if;


  new.updated_at :=
    now();


  return new;
end;
$$;


drop trigger if exists
  validate_service_pricing_tier_trigger
on public.service_pricing_tiers;


create trigger
  validate_service_pricing_tier_trigger

before insert or update
on public.service_pricing_tiers

for each row
execute function
  public.validate_service_pricing_tier();


-- =========================================================
-- 7. REQUEST SNAPSHOT EXTENSIONS
--
-- We intentionally store labels/codes instead of relying
-- solely on live option rows because administrators may
-- rename or remove options later.
-- =========================================================

alter table public.requests
add column if not exists
  pricing_option_id_snapshot uuid;


alter table public.requests
add column if not exists
  pricing_option_code_snapshot text;


alter table public.requests
add column if not exists
  pricing_option_label_snapshot text;


alter table public.requests
add column if not exists
  pricing_tier_id_snapshot uuid;


alter table public.requests
add column if not exists
  pricing_tier_label_snapshot text;


alter table public.requests
add column if not exists
  pricing_unit_label_snapshot text;


-- =========================================================
-- 8. COMMENTS
-- =========================================================

comment on table
public.service_pricing_options
is
'Optional selectable pricing variants belonging to a service pricing configuration, for example Black & White or Colour printing.';


comment on table
public.service_pricing_tiers
is
'Price tiers belonging to a pricing option. PER_UNIT options may have multiple non-overlapping quantity bands.';


comment on column
public.requests.pricing_option_id_snapshot
is
'Historical ID of the pricing option selected when the request price was calculated. Not a foreign key so historical requests survive option deletion.';


comment on column
public.requests.pricing_option_code_snapshot
is
'Historical pricing option code captured for the request.';


comment on column
public.requests.pricing_option_label_snapshot
is
'Historical pricing option label captured for the request.';


comment on column
public.requests.pricing_tier_id_snapshot
is
'Historical ID of the pricing tier used to calculate the request.';


comment on column
public.requests.pricing_tier_label_snapshot
is
'Historical tier label used to calculate the request.';


comment on column
public.requests.pricing_unit_label_snapshot
is
'Historical unit label such as page, copy, book or sheet.';


-- =========================================================
-- 9. RLS
--
-- Do not expose management tables directly to anonymous
-- users. Server-side service-role APIs will read/write them.
-- =========================================================

alter table
public.service_pricing_options
enable row level security;


alter table
public.service_pricing_tiers
enable row level security;


-- No anon/authenticated policies are intentionally created.
-- The application manages these tables through its
-- server-side service-role client.


-- =========================================================
-- 10. PERMISSIONS
-- =========================================================

revoke all
on table public.service_pricing_options
from anon, authenticated;


revoke all
on table public.service_pricing_tiers
from anon, authenticated;


grant all
on table public.service_pricing_options
to service_role;


grant all
on table public.service_pricing_tiers
to service_role;