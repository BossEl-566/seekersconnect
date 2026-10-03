-- =========================================================
-- SEEKERS CONNECT 247
-- Phase 12J
-- General Service Workflow
--
-- This adds a separate workflow for SC247 general services
-- while preserving the existing academic workflow.
-- =========================================================


-- =========================================================
-- GENERAL REQUEST PROCESSING
--
-- PAYMENT_CONFIRMED
--      -> PROCESSING_REQUEST
--
-- PROCESSING_REQUEST
--      -> PREPARING_DELIVERY
--         when physical delivery is required
--
--      -> COMPLETED
--         when no physical delivery is required
-- =========================================================

create or replace function public.advance_general_request_processing(
  p_request_id uuid,
  p_admin_id uuid,
  p_internal_note text default null
)
returns table (
  new_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;

  v_provider_code text;

  v_delivery_required boolean := false;

  v_new_status text;

  v_public_message text;
begin
  -- -------------------------------------------------------
  -- Lock and load the request
  -- -------------------------------------------------------

  select
    r.status,
    u.code,
    coalesce(
      d.physical_delivery_required,
      false
    )
  into
    v_current_status,
    v_provider_code,
    v_delivery_required
  from public.requests r
  join public.universities u
    on u.id = r.university_id
  left join public.deliveries d
    on d.request_id = r.id
  where r.id = p_request_id
  for update of r;


  if not found then
    raise exception
      'Request not found.';
  end if;


  -- -------------------------------------------------------
  -- This workflow is only for Seekers Connect general
  -- services.
  -- -------------------------------------------------------

  if v_provider_code <> 'SC247' then
    raise exception
      'This request is not a general service request.';
  end if;


  -- -------------------------------------------------------
  -- Determine next status
  -- -------------------------------------------------------

  case v_current_status

    when 'PAYMENT_CONFIRMED' then
      v_new_status :=
        'PROCESSING_REQUEST';

      v_public_message :=
        'Your request is now being processed by our team.';


    when 'PROCESSING_REQUEST' then

      if v_delivery_required then
        v_new_status :=
          'PREPARING_DELIVERY';

        v_public_message :=
          'The service work has been completed and your item is being prepared for delivery.';

      else
        v_new_status :=
          'COMPLETED';

        v_public_message :=
          'Your request has been completed successfully.';
      end if;


    else
      raise exception
        'This general request cannot be advanced from status %.',
        v_current_status;

  end case;


  -- -------------------------------------------------------
  -- Update request
  -- -------------------------------------------------------

  update public.requests
  set
    status = v_new_status,
    updated_at = now()
  where id = p_request_id;


  -- -------------------------------------------------------
  -- Status history
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- Audit log
  -- -------------------------------------------------------

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_id,
    'GENERAL_REQUEST_STATUS_ADVANCED',
    'request',
    p_request_id,
    jsonb_build_object(
      'from_status',
      v_current_status,
      'to_status',
      v_new_status,
      'workflow',
      'GENERAL_SERVICE'
    )
  );


  return query
  select v_new_status;
end;
$$;


-- =========================================================
-- GENERAL DELIVERY WORKFLOW
--
-- PREPARING_DELIVERY
--      -> IN_TRANSIT
--
-- IN_TRANSIT
--      -> DELIVERED
--
-- DELIVERED
--      -> COMPLETED
--
-- We intentionally skip HANDED_TO_EMS because general
-- deliveries may be handled by Seekers Connect or another
-- courier rather than EMS.
-- =========================================================

create or replace function public.advance_general_delivery_workflow(
  p_request_id uuid,
  p_admin_id uuid,
  p_delivery_reference text default null,
  p_internal_note text default null
)
returns table (
  new_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;

  v_provider_code text;

  v_delivery_required boolean := false;

  v_new_status text;

  v_public_message text;
begin
  -- -------------------------------------------------------
  -- Lock request and verify workflow
  -- -------------------------------------------------------

  select
    r.status,
    u.code,
    coalesce(
      d.physical_delivery_required,
      false
    )
  into
    v_current_status,
    v_provider_code,
    v_delivery_required
  from public.requests r
  join public.universities u
    on u.id = r.university_id
  left join public.deliveries d
    on d.request_id = r.id
  where r.id = p_request_id
  for update of r;


  if not found then
    raise exception
      'Request not found.';
  end if;


  if v_provider_code <> 'SC247' then
    raise exception
      'This request is not a general service request.';
  end if;


  if not v_delivery_required then
    raise exception
      'Physical delivery is not required for this request.';
  end if;


  -- -------------------------------------------------------
  -- Determine next status
  -- -------------------------------------------------------

  case v_current_status

    when 'PREPARING_DELIVERY' then
      v_new_status :=
        'IN_TRANSIT';

      v_public_message :=
        'Your delivery is now in transit.';


    when 'IN_TRANSIT' then
      v_new_status :=
        'DELIVERED';

      v_public_message :=
        'Your delivery has been completed successfully.';


    when 'DELIVERED' then
      v_new_status :=
        'COMPLETED';

      v_public_message :=
        'Your request has been completed.';


    else
      raise exception
        'This general delivery cannot be advanced from status %.',
        v_current_status;

  end case;


  -- -------------------------------------------------------
  -- Update request
  -- -------------------------------------------------------

  update public.requests
  set
    status = v_new_status,
    updated_at = now()
  where id = p_request_id;


  -- -------------------------------------------------------
  -- Update delivery information
  --
  -- ems_tracking_number remains the legacy database field.
  -- For general services it stores an optional courier /
  -- delivery reference during this compatibility phase.
  -- -------------------------------------------------------

  if v_current_status = 'PREPARING_DELIVERY' then
    update public.deliveries
    set
      ems_tracking_number =
        coalesce(
          nullif(
            btrim(
              coalesce(
                p_delivery_reference,
                ''
              )
            ),
            ''
          ),
          ems_tracking_number
        ),

      dispatch_date =
        coalesce(
          dispatch_date,
          now()
        ),

      updated_at =
        now()
    where request_id =
      p_request_id;
  end if;


  if v_current_status = 'IN_TRANSIT' then
    update public.deliveries
    set
      delivered_date =
        coalesce(
          delivered_date,
          now()
        ),

      updated_at =
        now()
    where request_id =
      p_request_id;
  end if;


  -- -------------------------------------------------------
  -- History
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- Audit
  -- -------------------------------------------------------

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_id,
    'GENERAL_DELIVERY_STATUS_ADVANCED',
    'request',
    p_request_id,
    jsonb_build_object(
      'from_status',
      v_current_status,
      'to_status',
      v_new_status,
      'workflow',
      'GENERAL_SERVICE_DELIVERY'
    )
  );


  return query
  select v_new_status;
end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function public.advance_general_request_processing(
  uuid,
  uuid,
  text
)
from public;


revoke all
on function public.advance_general_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
from public;


grant execute
on function public.advance_general_request_processing(
  uuid,
  uuid,
  text
)
to service_role;


grant execute
on function public.advance_general_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
to service_role;