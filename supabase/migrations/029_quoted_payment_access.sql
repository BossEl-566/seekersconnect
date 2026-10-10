-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-4D
-- SECURE QUOTED PAYMENT ACCESS
--
-- Quote/manual/starting-price requests are submitted first.
-- After an administrator finalizes the price, a cryptographically
-- random payment token is issued.
--
-- Only the SHA-256 hash is stored in the database.
-- The plaintext token is returned only to the authenticated
-- administrator who generated it.
-- =========================================================


-- =========================================================
-- 1. PAYMENT ACCESS COLUMNS
-- =========================================================

alter table public.requests
add column if not exists
  payment_access_token_hash text;


alter table public.requests
add column if not exists
  payment_access_issued_at timestamptz;


alter table public.requests
add column if not exists
  payment_access_used_at timestamptz;


-- =========================================================
-- 2. HASH FORMAT
-- =========================================================

alter table public.requests
drop constraint if exists
  requests_payment_access_token_hash_check;


alter table public.requests
add constraint
  requests_payment_access_token_hash_check
check (
  payment_access_token_hash is null
  or payment_access_token_hash ~ '^[0-9a-f]{64}$'
);


-- =========================================================
-- 3. TOKEN HASH MUST BE UNIQUE
-- =========================================================

create unique index if not exists
  requests_payment_access_token_hash_unique
on public.requests (
  payment_access_token_hash
)
where payment_access_token_hash is not null;


-- =========================================================
-- 4. ISSUE / REISSUE PAYMENT ACCESS
-- =========================================================

create or replace function
public.issue_request_payment_access(
  p_request_id uuid,
  p_admin_id uuid,
  p_token_hash text
)
returns table (
  request_id uuid,
  request_number text,
  current_status text,
  currency text,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.requests%rowtype;

  v_hash text;
begin

  -- =======================================================
  -- ADMIN
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
  -- TOKEN HASH
  -- =======================================================

  v_hash :=
    lower(
      btrim(
        coalesce(
          p_token_hash,
          ''
        )
      )
    );


  if
    v_hash !~
    '^[0-9a-f]{64}$'
  then
    raise exception
      'Invalid payment access token hash.';
  end if;


  -- =======================================================
  -- REQUEST
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
  -- MUST BE READY FOR PAYMENT
  -- =======================================================

  if
    v_request.status <>
    'AWAITING_PAYMENT'
  then
    raise exception
      'This request is not awaiting payment.';
  end if;


  if
    v_request.pricing_total_snapshot is null
    or
    v_request.pricing_total_snapshot <= 0
  then
    raise exception
      'The request does not have a valid finalized amount.';
  end if;


  if
    v_request.price_finalized_at is null
  then
    raise exception
      'The request price has not been finalized.';
  end if;


  -- =======================================================
  -- STORE HASH
  --
  -- Reissuing replaces any previous link.
  -- =======================================================

  update public.requests
  set
    payment_access_token_hash =
      v_hash,

    payment_access_issued_at =
      now(),

    payment_access_used_at =
      null,

    updated_at =
      now()

  where
    id =
    p_request_id;


  -- =======================================================
  -- AUDIT
  --
  -- Never store the plaintext token in logs.
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

    'REQUEST_PAYMENT_ACCESS_ISSUED',

    'request',

    p_request_id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'status',
        v_request.status,

      'currency',
        v_request.pricing_currency_snapshot,

      'total_amount',
        v_request.pricing_total_snapshot
    )
  );


  return query
  select
    v_request.id,

    v_request.request_number,

    v_request.status,

    coalesce(
      v_request.pricing_currency_snapshot,
      'GHS'
    ),

    v_request.pricing_total_snapshot;

end;
$$;


-- =========================================================
-- 5. CUSTOMER SUBMITS QUOTED PAYMENT
-- =========================================================

create or replace function
public.submit_quoted_request_payment(
  p_token_hash text,
  p_payment_method text,
  p_proof_storage_path text
)
returns table (
  request_id uuid,
  request_number text,
  new_status text,
  currency text,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.requests%rowtype;

  v_hash text;

  v_method text;

  v_proof_path text;
begin

  -- =======================================================
  -- NORMALIZE INPUT
  -- =======================================================

  v_hash :=
    lower(
      btrim(
        coalesce(
          p_token_hash,
          ''
        )
      )
    );


  v_method :=
    lower(
      btrim(
        coalesce(
          p_payment_method,
          ''
        )
      )
    );


  v_proof_path :=
    nullif(
      btrim(
        coalesce(
          p_proof_storage_path,
          ''
        )
      ),
      ''
    );


  -- =======================================================
  -- TOKEN
  -- =======================================================

  if
    v_hash !~
    '^[0-9a-f]{64}$'
  then
    raise exception
      'Payment link is invalid or no longer available.';
  end if;


  -- =======================================================
  -- PAYMENT METHOD
  -- =======================================================

  if
    v_method not in (
      'momo',
      'bank'
    )
  then
    raise exception
      'Select a valid payment method.';
  end if;


  if
    v_proof_path is null
  then
    raise exception
      'Payment proof is required.';
  end if;


  -- =======================================================
  -- LOCK REQUEST BY TOKEN HASH
  -- =======================================================

  select
    r.*

  into
    v_request

  from public.requests r

  where
    r.payment_access_token_hash =
    v_hash

  for update;


  if not found then
    raise exception
      'Payment link is invalid or no longer available.';
  end if;


  -- =======================================================
  -- LINK MUST STILL BE ACTIVE
  -- =======================================================

  if
    v_request.payment_access_used_at
    is not null
  then
    raise exception
      'Payment link has already been used.';
  end if;


  if
    v_request.status <>
    'AWAITING_PAYMENT'
  then
    raise exception
      'This request is no longer awaiting payment.';
  end if;


  -- =======================================================
  -- FINAL PRICE MUST EXIST
  -- =======================================================

  if
    v_request.pricing_total_snapshot
    is null

    or
    v_request.pricing_total_snapshot <=
    0
  then
    raise exception
      'The request does not have a valid payment amount.';
  end if;


  if
    v_request.price_finalized_at
    is null
  then
    raise exception
      'The request price has not been finalized.';
  end if;


  -- =======================================================
  -- PREVENT DUPLICATE PENDING PAYMENT
  -- =======================================================

  if exists (
    select 1

    from public.payments p

    where
      p.request_id =
      v_request.id

      and p.status =
      'PENDING'
  ) then
    raise exception
      'A payment is already awaiting verification.';
  end if;


  -- =======================================================
  -- CREATE PAYMENT
  --
  -- Migration 026 synchronizes amount + currency from
  -- requests.pricing_total_snapshot automatically.
  -- =======================================================

  insert into public.payments (
    request_id,
    payment_method,
    status,
    proof_storage_path
  )
  values (
    v_request.id,
    v_method,
    'PENDING',
    v_proof_path
  );


  -- =======================================================
  -- REQUEST STATUS
  -- =======================================================

  update public.requests
  set
    status =
      'AWAITING_PAYMENT_VERIFICATION',

    payment_access_used_at =
      now(),

    updated_at =
      now()

  where
    id =
    v_request.id;


  -- =======================================================
  -- HISTORY
  -- =======================================================

  insert into public.request_status_history (
    request_id,
    status,
    public_message
  )
  values (
    v_request.id,

    'AWAITING_PAYMENT_VERIFICATION',

    'Your payment proof has been received and is awaiting verification.'
  );


  -- =======================================================
  -- AUDIT
  -- =======================================================

  insert into public.activity_logs (
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    'QUOTED_REQUEST_PAYMENT_SUBMITTED',

    'request',

    v_request.id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'payment_method',
        v_method,

      'currency',
        v_request.pricing_currency_snapshot,

      'total_amount',
        v_request.pricing_total_snapshot
    )
  );


  -- =======================================================
  -- RESULT
  -- =======================================================

  return query
  select
    v_request.id,

    v_request.request_number,

    'AWAITING_PAYMENT_VERIFICATION'::text,

    coalesce(
      v_request.pricing_currency_snapshot,
      'GHS'
    ),

    v_request.pricing_total_snapshot;

end;
$$;


-- =========================================================
-- 6. PERMISSIONS
-- =========================================================

revoke all
on function public.issue_request_payment_access(
  uuid,
  uuid,
  text
)
from public, anon, authenticated;


grant execute
on function public.issue_request_payment_access(
  uuid,
  uuid,
  text
)
to service_role;


revoke all
on function public.submit_quoted_request_payment(
  text,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.submit_quoted_request_payment(
  text,
  text,
  text
)
to service_role;


-- =========================================================
-- 7. COMMENTS
-- =========================================================

comment on column
public.requests.payment_access_token_hash
is
'SHA-256 hash of the current single-purpose quoted-payment access token. Plaintext tokens are never stored.';


comment on column
public.requests.payment_access_used_at
is
'Timestamp when the quoted-payment link was successfully consumed.';


comment on function
public.submit_quoted_request_payment(
  text,
  text,
  text
)
is
'Creates a pending payment for a finalized quote and consumes the payment access token.';