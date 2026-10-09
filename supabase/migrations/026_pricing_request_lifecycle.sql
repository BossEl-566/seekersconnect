-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-4A
-- PRICING-AWARE REQUEST LIFECYCLE
--
-- Adds quote/payment lifecycle support without changing
-- existing historical requests.
--
-- NEW REQUEST STATUSES
--
-- AWAITING_QUOTE
-- QUOTE_READY
-- AWAITING_PAYMENT
--
-- Existing SUBMITTED will be used for FREE services.
-- =========================================================


-- =========================================================
-- 1. EXTEND REQUEST STATUS CHECK
-- =========================================================

alter table public.requests
drop constraint if exists
  requests_status_check;


alter table public.requests
add constraint
  requests_status_check
check (
  status in (
    'SUBMITTED',

    'AWAITING_QUOTE',
    'QUOTE_READY',
    'AWAITING_PAYMENT',

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
);


-- =========================================================
-- 2. PRICE FINALIZATION AUDIT
-- =========================================================

alter table public.requests
add column if not exists
  price_finalized_by uuid
  references public.admin_profiles(id)
  on delete set null;


-- =========================================================
-- 3. PAYMENT PRICING SYNCHRONIZATION
--
-- A payment must use the immutable pricing snapshot stored
-- on the request.
--
-- This is especially important for USD services because
-- payments.currency historically defaulted to GHS.
-- =========================================================

create or replace function
public.sync_payment_from_request_pricing()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_request record;
begin

  select
    r.pricing_currency_snapshot,
    r.pricing_total_snapshot

  into
    v_request

  from public.requests r

  where
    r.id =
    new.request_id;


  if not found then
    raise exception
      'Payment request could not be found.';
  end if;


  -- -------------------------------------------------------
  -- Currency
  -- -------------------------------------------------------

  if
    v_request.pricing_currency_snapshot
    is not null
  then

    new.currency :=
      v_request.pricing_currency_snapshot;

  end if;


  -- -------------------------------------------------------
  -- Final amount
  --
  -- Never trust a browser-supplied amount when the request
  -- already has an authoritative finalized total.
  -- -------------------------------------------------------

  if
    v_request.pricing_total_snapshot
    is not null
  then

    new.amount :=
      v_request.pricing_total_snapshot;

  end if;


  return new;

end;
$$;


drop trigger if exists
  sync_payment_from_request_pricing_trigger
on public.payments;


create trigger
  sync_payment_from_request_pricing_trigger

before insert or update
of request_id, amount, currency
on public.payments

for each row

execute function
  public.sync_payment_from_request_pricing();


-- =========================================================
-- 4. ADMIN FINALIZE REQUEST PRICE
--
-- Used for:
--
-- QUOTE_REQUIRED
-- STARTING_FROM
-- MANUAL_PRICE
--
-- A request waiting for pricing moves:
--
-- AWAITING_QUOTE
--       ↓
-- QUOTE_READY
--       ↓
-- AWAITING_PAYMENT
--
-- The function performs the finalization atomically.
-- =========================================================

create or replace function
public.finalize_request_price(
  p_request_id uuid,
  p_admin_id uuid,
  p_amount numeric,
  p_internal_note text default null
)
returns table (
  request_id uuid,
  request_number text,
  new_status text,
  currency text,
  finalized_amount numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.requests%rowtype;

  v_service_name text;

  v_amount numeric(12, 2);

  v_currency text;
begin

  -- =======================================================
  -- VALIDATE ADMIN
  -- =======================================================

  if not exists (
    select 1

    from public.admin_profiles ap

    where
      ap.id =
      p_admin_id

      and ap.active =
      true
  ) then
    raise exception
      'Unauthorized administrator.';
  end if;


  -- =======================================================
  -- VALIDATE AMOUNT
  -- =======================================================

  if
    p_amount is null
    or p_amount <= 0
  then
    raise exception
      'Final amount must be greater than zero.';
  end if;


  v_amount :=
    round(
      p_amount,
      2
    );


  -- =======================================================
  -- LOCK REQUEST
  -- =======================================================

  select
    r.*

  into
    v_request

  from public.requests r

  where
    r.id =
    p_request_id

  for update;


  if not found then
    raise exception
      'Request not found.';
  end if;


  -- =======================================================
  -- REQUEST MUST BE WAITING FOR PRICE
  -- =======================================================

  if
    v_request.status <>
    'AWAITING_QUOTE'
  then
    raise exception
      'This request is not awaiting a price or quote.';
  end if;


  -- =======================================================
  -- ONLY VARIABLE-PRICE MODES MAY USE THIS
  -- =======================================================

  if
    v_request.pricing_mode_snapshot
    not in (
      'QUOTE_REQUIRED',
      'STARTING_FROM',
      'MANUAL_PRICE'
    )
  then
    raise exception
      'This pricing mode does not require administrative price finalization.';
  end if;


  -- =======================================================
  -- STARTING FROM CANNOT GO BELOW ADVERTISED FLOOR
  -- =======================================================

  if
    v_request.pricing_mode_snapshot =
    'STARTING_FROM'

    and
    v_request.pricing_unit_amount_snapshot
    is not null

    and
    v_amount <
    v_request.pricing_unit_amount_snapshot
  then
    raise exception
      'Final amount cannot be lower than the advertised starting price.';
  end if;


  v_currency :=
    coalesce(
      v_request.pricing_currency_snapshot,
      'GHS'
    );


  select
    s.name

  into
    v_service_name

  from public.services s

  where
    s.id =
    v_request.service_id;


  -- =======================================================
  -- STORE FINAL PRICE
  -- =======================================================

  update public.requests
  set
    pricing_total_snapshot =
      v_amount,

    price_finalized_at =
      now(),

    price_finalized_by =
      p_admin_id,

    status =
      'AWAITING_PAYMENT',

    updated_at =
      now()

  where
    id =
    p_request_id;


  -- =======================================================
  -- PUBLIC HISTORY
  -- =======================================================

  insert into public.request_status_history (
    request_id,
    status,
    public_message,
    internal_note,
    changed_by
  )
  values (
    p_request_id,

    'QUOTE_READY',

    format(
      'The price for your request has been confirmed at %s %s.',
      v_currency,
      to_char(
        v_amount,
        'FM999999999990.00'
      )
    ),

    nullif(
      btrim(
        coalesce(
          p_internal_note,
          ''
        )
      ),
      ''
    ),

    p_admin_id
  );


  insert into public.request_status_history (
    request_id,
    status,
    public_message,
    changed_by
  )
  values (
    p_request_id,

    'AWAITING_PAYMENT',

    'Your request is ready for payment. Submit your payment and proof to continue.',

    p_admin_id
  );


  -- =======================================================
  -- AUDIT
  -- =======================================================

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_id,

    'REQUEST_PRICE_FINALIZED',

    'request',

    p_request_id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'service_name',
        v_service_name,

      'pricing_mode',
        v_request.pricing_mode_snapshot,

      'currency',
        v_currency,

      'finalized_amount',
        v_amount
    )
  );


  -- =======================================================
  -- RESULT
  -- =======================================================

  return query
  select
    p_request_id,

    v_request.request_number,

    'AWAITING_PAYMENT'::text,

    v_currency,

    v_amount;

end;
$$;


-- =========================================================
-- 5. PERMISSIONS
-- =========================================================

revoke all
on function public.finalize_request_price(
  uuid,
  uuid,
  numeric,
  text
)
from public, anon, authenticated;


grant execute
on function public.finalize_request_price(
  uuid,
  uuid,
  numeric,
  text
)
to service_role;


-- =========================================================
-- 6. COMMENTS
-- =========================================================

comment on function
public.finalize_request_price(
  uuid,
  uuid,
  numeric,
  text
)
is
'Finalizes a variable-price request and moves it from AWAITING_QUOTE to AWAITING_PAYMENT.';


comment on column
public.requests.price_finalized_by
is
'Administrator who finalized the request price for quote/manual/starting-from pricing.';


-- =========================================================
-- END PHASE 13B-4A
-- =========================================================