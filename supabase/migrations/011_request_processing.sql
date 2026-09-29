-- =========================================================
-- REQUEST PROCESSING WORKFLOW
-- =========================================================

create or replace function public.advance_request_processing(
  p_request_id uuid,
  p_admin_id uuid,
  p_internal_note text default null
)
returns table (
  request_id uuid,
  previous_status text,
  new_status text
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_request public.requests%rowtype;

  v_previous_status text;
  v_new_status text;
  v_public_message text;
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


  v_previous_status :=
    v_request.status;


  -- =======================================================
  -- DETERMINE NEXT VALID WORKFLOW STATUS
  -- =======================================================

  case v_request.status

    when 'PAYMENT_CONFIRMED' then
      v_new_status :=
        'PROCESSING_REQUEST';

      v_public_message :=
        'Your request is now being prepared for submission to the university.';


    when 'PROCESSING_REQUEST' then
      v_new_status :=
        'SUBMITTED_TO_UNIVERSITY';

      v_public_message :=
        'Your request has been submitted to the university for processing.';


    when 'SUBMITTED_TO_UNIVERSITY' then
      v_new_status :=
        'AWAITING_UNIVERSITY';

      v_public_message :=
        'Your request is currently being processed by the university.';


    when 'AWAITING_UNIVERSITY' then
      v_new_status :=
        'DOCUMENT_READY';

      v_public_message :=
        'The university has completed your request and your document is ready.';


    else
      raise exception
        'Request cannot be advanced from status %',
        v_request.status;

  end case;


  -- =======================================================
  -- UPDATE REQUEST
  -- =======================================================

  update public.requests r
  set
    status = v_new_status
  where r.id = p_request_id;


  -- =======================================================
  -- STATUS HISTORY
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
    v_new_status,
    v_public_message,
    nullif(trim(p_internal_note), ''),
    p_admin_id
  );


  -- =======================================================
  -- ACTIVITY LOG
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
    'REQUEST_STATUS_ADVANCED',
    'request',
    p_request_id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'previous_status',
        v_previous_status,

      'new_status',
        v_new_status
    )
  );


  return query
  select
    p_request_id,
    v_previous_status,
    v_new_status;

end;
$$;


revoke all
on function public.advance_request_processing(
  uuid,
  uuid,
  text
)
from public, anon, authenticated;


grant execute
on function public.advance_request_processing(
  uuid,
  uuid,
  text
)
to service_role;