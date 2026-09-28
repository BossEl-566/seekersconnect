-- =========================================================
-- FIX PAYMENT REVIEW AMBIGUOUS COLUMN REFERENCES
-- =========================================================

create or replace function public.review_request_payment(
  p_request_id uuid,
  p_admin_id uuid,
  p_action text,
  p_rejection_reason text default null,
  p_tracking_number text default null,
  p_tracking_pin text default null
)
returns table (
  request_id uuid,
  request_number text,
  new_status text,
  tracking_number text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.requests%rowtype;
  v_payment public.payments%rowtype;
begin

  -- =======================================================
  -- VALIDATE ADMIN
  -- =======================================================

  if not exists (
    select 1
    from public.admin_profiles ap
    where ap.id = p_admin_id
      and ap.active = true
  ) then
    raise exception 'Unauthorized administrator';
  end if;


  -- =======================================================
  -- LOCK REQUEST
  -- =======================================================

  select r.*
  into v_request
  from public.requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;


  -- =======================================================
  -- LOCK LATEST PAYMENT
  -- =======================================================

  select p.*
  into v_payment
  from public.payments p
  where p.request_id = p_request_id
  order by p.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'Payment not found';
  end if;


  -- =======================================================
  -- PREVENT DOUBLE REVIEW
  -- =======================================================

  if v_payment.status <> 'PENDING' then
    raise exception 'Payment has already been reviewed';
  end if;


  -- =======================================================
  -- CONFIRM PAYMENT
  -- =======================================================

  if p_action = 'CONFIRM' then

    if p_tracking_number is null
       or length(trim(p_tracking_number)) = 0 then
      raise exception 'Tracking number is required';
    end if;

    if p_tracking_pin is null
       or length(trim(p_tracking_pin)) < 6 then
      raise exception 'Tracking PIN is required';
    end if;


    update public.payments
    set
      status = 'CONFIRMED',
      verified_by = p_admin_id,
      verified_at = now(),
      rejection_reason = null
    where id = v_payment.id;


    update public.requests
    set
      status = 'PAYMENT_CONFIRMED',
      tracking_number = p_tracking_number,

      tracking_pin_digest = crypt(
        p_tracking_pin,
        gen_salt('bf', 10)
      ),

      tracking_issued_at = now()
    where id = p_request_id;


    insert into public.request_status_history (
      request_id,
      status,
      public_message,
      internal_note,
      changed_by
    )
    values (
      p_request_id,
      'PAYMENT_CONFIRMED',
      'Your payment has been confirmed. Your request is ready for processing.',
      'Payment verified by administrator.',
      p_admin_id
    );


    insert into public.activity_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    values (
      p_admin_id,
      'PAYMENT_CONFIRMED',
      'request',
      p_request_id,
      jsonb_build_object(
        'request_number',
        v_request.request_number,
        'tracking_number',
        p_tracking_number
      )
    );


    return query
    select
      p_request_id,
      v_request.request_number,
      'PAYMENT_CONFIRMED'::text,
      p_tracking_number;

    return;
  end if;


  -- =======================================================
  -- REJECT PAYMENT
  -- =======================================================

  if p_action = 'REJECT' then

    if p_rejection_reason is null
       or length(trim(p_rejection_reason)) < 3 then
      raise exception 'Rejection reason is required';
    end if;


    update public.payments
    set
      status = 'REJECTED',
      verified_by = p_admin_id,
      verified_at = now(),
      rejection_reason = trim(p_rejection_reason)
    where id = v_payment.id;


    update public.requests
    set
      status = 'PAYMENT_REJECTED'
    where id = p_request_id;


    insert into public.request_status_history (
      request_id,
      status,
      public_message,
      internal_note,
      changed_by
    )
    values (
      p_request_id,
      'PAYMENT_REJECTED',
      'There is an issue with the submitted payment proof. Please contact Seekers Connect 247 for assistance.',
      trim(p_rejection_reason),
      p_admin_id
    );


    insert into public.activity_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    values (
      p_admin_id,
      'PAYMENT_REJECTED',
      'request',
      p_request_id,
      jsonb_build_object(
        'request_number',
        v_request.request_number,
        'reason',
        trim(p_rejection_reason)
      )
    );


    return query
    select
      p_request_id,
      v_request.request_number,
      'PAYMENT_REJECTED'::text,
      null::text;

    return;
  end if;


  -- =======================================================
  -- INVALID ACTION
  -- =======================================================

  raise exception 'Invalid payment review action';

end;
$$;