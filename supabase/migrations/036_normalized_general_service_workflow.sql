-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13F
-- NORMALIZED GENERAL SERVICE WORKFLOW
--
-- General services are identified using:
--
--   services.service_scope = 'general'
--
-- They no longer depend on the legacy SC247 university row.
-- =========================================================


-- =========================================================
-- 1. GENERAL REQUEST PROCESSING
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

create or replace function
public.advance_general_request_processing(
  p_request_id uuid,
  p_admin_id uuid,
  p_internal_note text default null
)
returns table (
  new_status text
)
language plpgsql
security definer
set search_path =
  public,
  pg_temp
as $$
declare
  v_current_status text;

  v_service_scope text;

  v_delivery_required boolean :=
    false;

  v_new_status text;

  v_public_message text;
begin

  -- =======================================================
  -- LOAD + LOCK REQUEST
  -- =======================================================

  select
    r.status,

    s.service_scope,

    coalesce(
      d.physical_delivery_required,
      false
    )

  into
    v_current_status,
    v_service_scope,
    v_delivery_required

  from public.requests r

  join public.services s
    on s.id =
       r.service_id

  left join public.deliveries d
    on d.request_id =
       r.id

  where
    r.id =
    p_request_id

  for update of r;


  if
    not found
  then
    raise exception
      'Request not found.';
  end if;


  -- =======================================================
  -- GENERAL SERVICE ONLY
  -- =======================================================

  if
    v_service_scope <>
    'general'
  then
    raise exception
      'This request is not a general service request.';
  end if;


  -- =======================================================
  -- NEXT STATUS
  -- =======================================================

  case
    v_current_status

    when
      'PAYMENT_CONFIRMED'
    then

      v_new_status :=
        'PROCESSING_REQUEST';

      v_public_message :=
        'Your request is now being processed by our team.';


    when
      'PROCESSING_REQUEST'
    then

      if
        v_delivery_required
      then

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


  -- =======================================================
  -- REQUEST
  -- =======================================================

  update public.requests

  set
    status =
      v_new_status,

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

    'GENERAL_REQUEST_STATUS_ADVANCED',

    'request',

    p_request_id,

    jsonb_build_object(
      'from_status',
      v_current_status,

      'to_status',
      v_new_status,

      'workflow',
      'GENERAL_SERVICE',

      'service_scope',
      v_service_scope
    )
  );


  return query

  select
    v_new_status;

end;
$$;


-- =========================================================
-- 2. GENERAL DELIVERY WORKFLOW
-- =========================================================

create or replace function
public.advance_general_delivery_workflow(
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
set search_path =
  public,
  pg_temp
as $$
declare
  v_current_status text;

  v_service_scope text;

  v_delivery_required boolean :=
    false;

  v_new_status text;

  v_public_message text;
begin

  -- =======================================================
  -- LOAD + LOCK
  -- =======================================================

  select
    r.status,

    s.service_scope,

    coalesce(
      d.physical_delivery_required,
      false
    )

  into
    v_current_status,
    v_service_scope,
    v_delivery_required

  from public.requests r

  join public.services s
    on s.id =
       r.service_id

  left join public.deliveries d
    on d.request_id =
       r.id

  where
    r.id =
    p_request_id

  for update of r;


  if
    not found
  then
    raise exception
      'Request not found.';
  end if;


  if
    v_service_scope <>
    'general'
  then
    raise exception
      'This request is not a general service request.';
  end if;


  if
    not v_delivery_required
  then
    raise exception
      'Physical delivery is not required for this request.';
  end if;


  -- =======================================================
  -- NEXT STATUS
  -- =======================================================

  case
    v_current_status

    when
      'PREPARING_DELIVERY'
    then

      v_new_status :=
        'IN_TRANSIT';

      v_public_message :=
        'Your delivery is now in transit.';


    when
      'IN_TRANSIT'
    then

      v_new_status :=
        'DELIVERED';

      v_public_message :=
        'Your item has been delivered.';


    when
      'DELIVERED'
    then

      v_new_status :=
        'COMPLETED';

      v_public_message :=
        'Your request has been completed.';


    else

      raise exception
        'This general delivery cannot be advanced from status %.',
        v_current_status;

  end case;


  -- =======================================================
  -- REQUEST
  -- =======================================================

  update public.requests

  set
    status =
      v_new_status,

    updated_at =
      now()

  where
    id =
    p_request_id;


  -- =======================================================
  -- DELIVERY
  -- =======================================================

  if
    v_current_status =
    'PREPARING_DELIVERY'
  then

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

    where
      request_id =
      p_request_id;

  end if;


  if
    v_current_status =
    'IN_TRANSIT'
  then

    update public.deliveries

    set
      delivered_date =
        coalesce(
          delivered_date,
          now()
        ),

      updated_at =
        now()

    where
      request_id =
      p_request_id;

  end if;


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

    'GENERAL_DELIVERY_STATUS_ADVANCED',

    'request',

    p_request_id,

    jsonb_build_object(
      'from_status',
      v_current_status,

      'to_status',
      v_new_status,

      'workflow',
      'GENERAL_SERVICE_DELIVERY',

      'service_scope',
      v_service_scope
    )
  );


  return query

  select
    v_new_status;

end;
$$;


-- =========================================================
-- 3. PUBLIC TRACKING
--
-- General requests now have university_id = NULL.
--
-- Keep the existing public response contract by returning
-- SC247 as the service-area identity for general services.
-- =========================================================

create or replace function
public.verify_request_tracking(
  p_tracking_number text,
  p_tracking_pin text
)
returns jsonb
language plpgsql
security definer
set search_path =
  public,
  extensions,
  pg_temp
as $$
declare
  v_request record;

  v_history jsonb;
begin

  select
    r.id,

    r.request_number,

    r.tracking_number,

    r.tracking_pin_digest,

    r.status,

    r.created_at,

    r.tracking_issued_at,


    s.service_scope,

    s.name as
      service_name,

    s.short_name as
      service_short_name,


    u.code as
      university_code,

    u.name as
      university_name,


    d.physical_delivery_required,

    d.ems_tracking_number,

    d.dispatch_date,

    d.delivered_date

  into
    v_request

  from public.requests r

  join public.services s
    on s.id =
       r.service_id

  left join public.universities u
    on u.id =
       r.university_id

  left join public.deliveries d
    on d.request_id =
       r.id

  where
    upper(
      r.tracking_number
    ) =
    upper(
      btrim(
        p_tracking_number
      )
    )

  limit 1;


  if
    not found
  then
    return null;
  end if;


  if
    v_request.tracking_pin_digest
    is null
  then
    return null;
  end if;


  if
    v_request.tracking_pin_digest <>
    crypt(
      btrim(
        p_tracking_pin
      ),

      v_request.tracking_pin_digest
    )
  then
    return null;
  end if;


  -- =======================================================
  -- PUBLIC HISTORY
  -- =======================================================

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'status',
          h.status,

          'message',
          h.public_message,

          'createdAt',
          h.created_at
        )

        order by
          h.created_at asc
      ),

      '[]'::jsonb
    )

  into
    v_history

  from public.request_status_history h

  where
    h.request_id =
    v_request.id;


  -- =======================================================
  -- SANITIZED PUBLIC RESPONSE
  -- =======================================================

  return jsonb_build_object(

    'requestNumber',
      v_request.request_number,

    'trackingNumber',
      v_request.tracking_number,

    'status',
      v_request.status,

    'submittedAt',
      v_request.created_at,

    'trackingIssuedAt',
      v_request.tracking_issued_at,


    'university',

      case
        when
          v_request.service_scope =
          'general'
        then
          jsonb_build_object(
            'code',
            'SC247',

            'name',
            'Seekers Connect 247'
          )

        else
          jsonb_build_object(
            'code',
            v_request.university_code,

            'name',
            v_request.university_name
          )
      end,


    'service',

      jsonb_build_object(
        'name',
        v_request.service_name,

        'shortName',
        v_request.service_short_name
      ),


    'delivery',

      jsonb_build_object(
        'required',

        coalesce(
          v_request.physical_delivery_required,
          false
        ),

        'emsTrackingNumber',
        v_request.ems_tracking_number,

        'dispatchDate',
        v_request.dispatch_date,

        'deliveredDate',
        v_request.delivered_date
      ),


    'history',
      v_history
  );

end;
$$;


-- =========================================================
-- 4. PERMISSIONS
-- =========================================================

revoke all
on function
public.advance_general_request_processing(
  uuid,
  uuid,
  text
)
from
  public,
  anon,
  authenticated;


grant execute
on function
public.advance_general_request_processing(
  uuid,
  uuid,
  text
)
to
  service_role;


revoke all
on function
public.advance_general_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
from
  public,
  anon,
  authenticated;


grant execute
on function
public.advance_general_delivery_workflow(
  uuid,
  uuid,
  text,
  text
)
to
  service_role;


revoke all
on function
public.verify_request_tracking(
  text,
  text
)
from
  public,
  anon,
  authenticated;


grant execute
on function
public.verify_request_tracking(
  text,
  text
)
to
  service_role;