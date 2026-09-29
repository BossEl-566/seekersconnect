-- =========================================================
-- DELIVERY + COMPLETION WORKFLOW
-- =========================================================

create or replace function public.advance_delivery_workflow(
  p_request_id uuid,
  p_admin_id uuid,
  p_ems_tracking_number text default null,
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
  v_delivery public.deliveries%rowtype;

  v_previous_status text;
  v_new_status text;
  v_public_message text;

  v_requires_delivery boolean;
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
  -- LOCK DELIVERY RECORD
  -- =======================================================

  select d.*
  into v_delivery
  from public.deliveries d
  where d.request_id = p_request_id
  for update;


  if found then
    v_requires_delivery :=
      coalesce(
        v_delivery.physical_delivery_required,
        false
      );
  else
    v_requires_delivery :=
      false;
  end if;


  -- =======================================================
  -- DETERMINE NEXT STATUS
  -- =======================================================

  case v_request.status

    -- -----------------------------------------------------
    -- DOCUMENT SCANNED
    -- -----------------------------------------------------

    when 'DOCUMENT_SCANNED' then

      if v_requires_delivery then

        v_new_status :=
          'PREPARING_DELIVERY';

        v_public_message :=
          'Your document has been processed and is being prepared for EMS delivery.';

      else

        v_new_status :=
          'COMPLETED';

        v_public_message :=
          'Your request has been completed successfully.';

      end if;


    -- -----------------------------------------------------
    -- PREPARING DELIVERY
    -- -----------------------------------------------------

    when 'PREPARING_DELIVERY' then

      if not v_requires_delivery then
        raise exception
          'This request does not require physical delivery';
      end if;


      if p_ems_tracking_number is null
         or length(trim(p_ems_tracking_number)) < 3
      then
        raise exception
          'EMS tracking number is required';
      end if;


      update public.deliveries d
      set
        ems_tracking_number =
          trim(p_ems_tracking_number),

        dispatch_date =
          coalesce(
            d.dispatch_date,
            now()
          )

      where d.request_id =
        p_request_id;


      v_new_status :=
        'HANDED_TO_EMS';

      v_public_message :=
        'Your document has been handed over to EMS for delivery.';


    -- -----------------------------------------------------
    -- HANDED TO EMS
    -- -----------------------------------------------------

    when 'HANDED_TO_EMS' then

      if not v_requires_delivery then
        raise exception
          'This request does not require physical delivery';
      end if;


      v_new_status :=
        'IN_TRANSIT';

      v_public_message :=
        'Your document is currently in transit with EMS.';


    -- -----------------------------------------------------
    -- IN TRANSIT
    -- -----------------------------------------------------

    when 'IN_TRANSIT' then

      if not v_requires_delivery then
        raise exception
          'This request does not require physical delivery';
      end if;


      update public.deliveries d
      set
        delivered_date =
          coalesce(
            d.delivered_date,
            now()
          )

      where d.request_id =
        p_request_id;


      v_new_status :=
        'DELIVERED';

      v_public_message :=
        'Your document has been delivered successfully.';


    -- -----------------------------------------------------
    -- DELIVERED
    -- -----------------------------------------------------

    when 'DELIVERED' then

      v_new_status :=
        'COMPLETED';

      v_public_message :=
        'Your request has been completed successfully.';


    -- -----------------------------------------------------
    -- INVALID TRANSITION
    -- -----------------------------------------------------

    else

      raise exception
        'Request cannot be advanced through delivery workflow from status %',
        v_request.status;

  end case;


  -- =======================================================
  -- UPDATE REQUEST
  -- =======================================================

  update public.requests r
  set
    status =
      v_new_status

  where r.id =
    p_request_id;


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
    nullif(
      trim(
        p_internal_note
      ),
      ''
    ),
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

    'DELIVERY_STATUS_ADVANCED',

    'request',

    p_request_id,

    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'previous_status',
        v_previous_status,

      'new_status',
        v_new_status,

      'ems_tracking_number',
        case
          when p_ems_tracking_number is null
            then null

          else
            trim(
              p_ems_tracking_number
            )
        end
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
on function public.advance_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.advance_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
to service_role;