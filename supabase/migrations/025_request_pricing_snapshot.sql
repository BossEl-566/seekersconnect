-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-3
-- REQUEST PRICING SNAPSHOT
--
-- PURPOSE
--
-- Whenever a request is created, copy the CURRENT service
-- pricing configuration onto that request.
--
-- Future changes to service_pricing will therefore NOT
-- alter the pricing attached to an existing request.
--
-- This operates at database level so every submission path
-- receives the same pricing behaviour.
-- =========================================================


-- =========================================================
-- 1. SNAPSHOT FUNCTION
-- =========================================================

create or replace function
public.snapshot_request_service_pricing()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_pricing public.service_pricing%rowtype;
begin

  -- -------------------------------------------------------
  -- Load pricing configuration belonging to the service.
  -- -------------------------------------------------------

  select
    sp.*

  into
    v_pricing

  from public.service_pricing sp

  where
    sp.service_id =
    new.service_id

  limit 1;


  -- -------------------------------------------------------
  -- Pricing should exist because Migration 024 guarantees
  -- one row per service.
  --
  -- Still fail safely to MANUAL_PRICE if a legacy or
  -- unexpected record does not have pricing.
  -- -------------------------------------------------------

  if not found then

    new.pricing_mode_snapshot :=
      'MANUAL_PRICE';

    new.pricing_currency_snapshot :=
      'GHS';

    new.pricing_unit_amount_snapshot :=
      null;

    new.pricing_quantity_snapshot :=
      null;

    new.pricing_total_snapshot :=
      null;

    new.pricing_note_snapshot :=
      null;

    new.price_finalized_at :=
      null;


    return new;

  end if;


  -- -------------------------------------------------------
  -- A disabled pricing configuration is deliberately not
  -- published as an authoritative customer price.
  --
  -- Treat it as manual pricing until re-enabled.
  -- -------------------------------------------------------

  if not v_pricing.active then

    new.pricing_mode_snapshot :=
      'MANUAL_PRICE';

    new.pricing_currency_snapshot :=
      v_pricing.currency;

    new.pricing_unit_amount_snapshot :=
      null;

    new.pricing_quantity_snapshot :=
      null;

    new.pricing_total_snapshot :=
      null;

    new.pricing_note_snapshot :=
      null;

    new.price_finalized_at :=
      null;


    return new;

  end if;


  -- -------------------------------------------------------
  -- Copy pricing configuration.
  -- -------------------------------------------------------

  new.pricing_mode_snapshot :=
    v_pricing.pricing_mode;


  new.pricing_currency_snapshot :=
    v_pricing.currency;


  new.pricing_note_snapshot :=
    v_pricing.display_note;


  -- -------------------------------------------------------
  -- MODES WITH A CONFIGURED AMOUNT
  --
  -- FIXED
  -- PER_UNIT
  -- STARTING_FROM
  -- -------------------------------------------------------

  if v_pricing.pricing_mode in (
    'FIXED',
    'PER_UNIT',
    'STARTING_FROM'
  ) then

    new.pricing_unit_amount_snapshot :=
      v_pricing.amount;

  else

    new.pricing_unit_amount_snapshot :=
      null;

  end if;


  -- -------------------------------------------------------
  -- FIXED
  --
  -- The amount is already final at request creation.
  -- -------------------------------------------------------

  if v_pricing.pricing_mode =
     'FIXED'
  then

    new.pricing_quantity_snapshot :=
      1;

    new.pricing_total_snapshot :=
      v_pricing.amount;

    new.price_finalized_at :=
      now();


  -- -------------------------------------------------------
  -- FREE
  --
  -- Final price is zero.
  -- -------------------------------------------------------

  elsif v_pricing.pricing_mode =
        'FREE'
  then

    new.pricing_unit_amount_snapshot :=
      0;

    new.pricing_quantity_snapshot :=
      1;

    new.pricing_total_snapshot :=
      0;

    new.price_finalized_at :=
      now();


  -- -------------------------------------------------------
  -- PER UNIT
  --
  -- Quantity will be supplied later by the request pricing
  -- workflow. Do NOT calculate a false total here.
  -- -------------------------------------------------------

  elsif v_pricing.pricing_mode =
        'PER_UNIT'
  then

    new.pricing_quantity_snapshot :=
      null;

    new.pricing_total_snapshot :=
      null;

    new.price_finalized_at :=
      null;


  -- -------------------------------------------------------
  -- STARTING FROM
  --
  -- Configured amount is a floor, not a final total.
  -- -------------------------------------------------------

  elsif v_pricing.pricing_mode =
        'STARTING_FROM'
  then

    new.pricing_quantity_snapshot :=
      null;

    new.pricing_total_snapshot :=
      null;

    new.price_finalized_at :=
      null;


  -- -------------------------------------------------------
  -- QUOTE REQUIRED / MANUAL PRICE
  -- -------------------------------------------------------

  else

    new.pricing_quantity_snapshot :=
      null;

    new.pricing_total_snapshot :=
      null;

    new.price_finalized_at :=
      null;

  end if;


  return new;

end;
$$;


-- =========================================================
-- 2. CREATE REQUEST SNAPSHOT TRIGGER
-- =========================================================

drop trigger if exists
  snapshot_request_service_pricing_trigger
on public.requests;


create trigger
  snapshot_request_service_pricing_trigger

before insert
on public.requests

for each row

execute function
  public.snapshot_request_service_pricing();


-- =========================================================
-- 3. DOCUMENT INTENT
-- =========================================================

comment on function
public.snapshot_request_service_pricing()
is
'Copies the active service pricing configuration onto a request at creation time so later service price changes do not alter historical request pricing.';


-- =========================================================
-- END
-- =========================================================