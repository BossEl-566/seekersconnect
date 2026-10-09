-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-4C
-- FREE REQUEST PROCESSING
--
-- FREE requests do not have a payment row.
--
-- They begin at:
--
-- SUBMITTED
--      ↓
-- PROCESSING_REQUEST
--
-- From PROCESSING_REQUEST onward they reuse the existing
-- general or academic workflow.
-- =========================================================


create or replace function
public.start_free_request_processing(
  p_request_id uuid,
  p_admin_id uuid,
  p_internal_note text default null
)
returns table (
  new_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.requests%rowtype;

  v_service_name text;

  v_service_scope text;
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
  -- MUST BE SUBMITTED
  -- =======================================================

  if
    v_request.status <>
    'SUBMITTED'
  then
    raise exception
      'This request cannot be started from its current status.';
  end if;


  -- =======================================================
  -- MUST ACTUALLY BE FREE
  -- =======================================================

  if
    v_request.pricing_mode_snapshot <>
    'FREE'
  then
    raise exception
      'Only free requests can use this workflow.';
  end if;


  if
    coalesce(
      v_request.pricing_total_snapshot,
      0
    ) <>
    0
  then
    raise exception
      'Free request has an invalid pricing total.';
  end if;


  -- =======================================================
  -- SERVICE INFO
  -- =======================================================

  select
    s.name,
    s.service_scope

  into
    v_service_name,
    v_service_scope

  from public.services s

  where
    s.id =
    v_request.service_id;


  if not found then
    raise exception
      'Service not found.';
  end if;


  -- =======================================================
  -- UPDATE REQUEST
  -- =======================================================

  update public.requests
  set
    status =
      'PROCESSING_REQUEST',

    updated_at =
      now()

  where
    id =
    p_request_id;


  -- =======================================================
  -- HISTORY
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

    'PROCESSING_REQUEST',

    'Your request is now being processed by our team.',

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

    'FREE_REQUEST_PROCESSING_STARTED',

    'request',

    p_request_id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'service_id',
        v_request.service_id,

      'service_name',
        v_service_name,

      'service_scope',
        v_service_scope,

      'pricing_mode',
        v_request.pricing_mode_snapshot,

      'previous_status',
        v_request.status,

      'new_status',
        'PROCESSING_REQUEST'
    )
  );


  return query
  select
    'PROCESSING_REQUEST'::text;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function public.start_free_request_processing(
  uuid,
  uuid,
  text
)
from public, anon, authenticated;


grant execute
on function public.start_free_request_processing(
  uuid,
  uuid,
  text
)
to service_role;


comment on function
public.start_free_request_processing(
  uuid,
  uuid,
  text
)
is
'Moves a FREE request from SUBMITTED to PROCESSING_REQUEST without requiring a payment.';