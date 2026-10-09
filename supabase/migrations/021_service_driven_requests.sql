-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13A-3A
-- SERVICE-DRIVEN REQUESTS
--
-- PURPOSE
--
-- 1. Allow general service requests without a university.
-- 2. Introduce a service-ID-driven request submission RPC.
-- 3. Determine workflow using services.service_scope.
-- 4. Make public tracking compatible with university-less
--    general services.
--
-- IMPORTANT
--
-- Existing requests are preserved.
-- Existing university requests are preserved.
-- Existing SC247 compatibility services are preserved.
-- Existing create_request_submission() is preserved.
-- =========================================================


-- =========================================================
-- 1. REQUEST UNIVERSITY BECOMES OPTIONAL
--
-- Academic requests will continue to contain university_id.
--
-- New general services can use:
--
-- university_id = NULL
-- =========================================================

alter table public.requests
alter column university_id
drop not null;


-- =========================================================
-- 2. SERVICE-DRIVEN REQUEST SUBMISSION
--
-- This is intentionally a NEW RPC rather than replacing
-- create_request_submission().
--
-- Old clients can continue using the old function while
-- the application is migrated incrementally.
-- =========================================================

create or replace function public.create_request_submission_v2(
  p_request_id uuid,
  p_request_number text,

  p_service_id uuid,

  p_first_name text,
  p_other_names text,
  p_surname text,
  p_gender text,

  p_phone text,
  p_email text,
  p_notes text,

  p_responses jsonb,
  p_delivery jsonb,

  p_payment_method text,
  p_proof_storage_path text
)
returns table (
  request_id uuid,
  request_number text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_service_id uuid;

  v_service_name text;
  v_service_slug text;
  v_service_scope text;

  v_service_university_id uuid;

  v_request_university_id uuid;

  v_university_code text;
  v_university_name text;

  v_category_id uuid;
  v_category_slug text;
  v_category_name text;

  v_item jsonb;
begin

  -- =======================================================
  -- BASIC JSON VALIDATION
  -- =======================================================

  if p_responses is not null
     and jsonb_typeof(p_responses) <> 'array'
  then
    raise exception
      'Responses must be a JSON array.';
  end if;


  if p_delivery is null
     or jsonb_typeof(p_delivery) <> 'object'
  then
    raise exception
      'Delivery information must be a JSON object.';
  end if;


  -- =======================================================
  -- RESOLVE SERVICE
  --
  -- The service is now the primary source of truth.
  -- =======================================================

  select
    s.id,
    s.name,
    s.slug,
    s.service_scope,
    s.university_id,
    s.service_category_id,

    c.slug,
    c.name

  into
    v_service_id,
    v_service_name,
    v_service_slug,
    v_service_scope,
    v_service_university_id,
    v_category_id,

    v_category_slug,
    v_category_name

  from public.services s

  join public.service_categories c
    on c.id = s.service_category_id

  where
    s.id = p_service_id
    and s.active = true
    and c.active = true

  limit 1;


  if v_service_id is null then
    raise exception
      'Service not found or inactive.';
  end if;


  -- =======================================================
  -- ACADEMIC SERVICE
  --
  -- Academic services MUST belong to an active institution.
  -- =======================================================

  if v_service_scope = 'academic' then

    if v_service_university_id is null then
      raise exception
        'Academic service does not have an institution.';
    end if;


    select
      u.code,
      u.name

    into
      v_university_code,
      v_university_name

    from public.universities u

    where
      u.id = v_service_university_id
      and u.active = true

    limit 1;


    if v_university_code is null then
      raise exception
        'Institution not found or inactive.';
    end if;


    v_request_university_id :=
      v_service_university_id;


  -- =======================================================
  -- GENERAL SERVICE
  --
  -- New general services have university_id = NULL.
  --
  -- Existing Phase 12 compatibility services may still
  -- belong to the SC247 pseudo-provider. They remain valid
  -- until we migrate them later.
  -- =======================================================

  elsif v_service_scope = 'general' then

    if v_service_university_id is not null then

      select
        u.code,
        u.name

      into
        v_university_code,
        v_university_name

      from public.universities u

      where
        u.id =
          v_service_university_id
        and u.active = true

      limit 1;


      if v_university_code is null then
        raise exception
          'General service provider is unavailable.';
      end if;


      if upper(v_university_code) <> 'SC247' then
        raise exception
          'General service is incorrectly attached to an institution.';
      end if;


      -- Preserve SC247 on legacy requests for compatibility.

      v_request_university_id :=
        v_service_university_id;

    else

      -- Proper Phase 13 general service.

      v_request_university_id :=
        null;

      v_university_code :=
        null;

      v_university_name :=
        null;

    end if;


  else

    raise exception
      'Unsupported service scope: %.',
      v_service_scope;

  end if;


  -- =======================================================
  -- CREATE REQUEST
  -- =======================================================

  insert into public.requests (
    id,
    request_number,

    university_id,
    service_id,

    status,

    first_name,
    other_names,
    surname,
    gender,

    phone,
    email,

    notes
  )
  values (
    p_request_id,
    p_request_number,

    v_request_university_id,
    v_service_id,

    'AWAITING_PAYMENT_VERIFICATION',

    p_first_name,
    nullif(
      btrim(
        coalesce(
          p_other_names,
          ''
        )
      ),
      ''
    ),

    p_surname,

    nullif(
      btrim(
        coalesce(
          p_gender,
          ''
        )
      ),
      ''
    ),

    p_phone,
    p_email,

    nullif(
      btrim(
        coalesce(
          p_notes,
          ''
        )
      ),
      ''
    )
  );


  -- =======================================================
  -- DYNAMIC SERVICE RESPONSES
  --
  -- These are no longer considered only "academic"
  -- responses. Any service can use service_form_fields.
  -- =======================================================

  for v_item in
    select value
    from jsonb_array_elements(
      coalesce(
        p_responses,
        '[]'::jsonb
      )
    )
  loop

    insert into public.request_form_responses (
      request_id,
      field_key,
      field_label,
      value
    )
    values (
      p_request_id,

      v_item ->> 'fieldKey',

      v_item ->> 'label',

      nullif(
        v_item ->> 'value',
        ''
      )
    );

  end loop;


  -- =======================================================
  -- DELIVERY
  -- =======================================================

  insert into public.deliveries (
    request_id,

    physical_delivery_required,

    full_name,
    house_number,
    area_town,
    city_district,
    region,
    digital_address,

    phone,
    email,

    item_type,
    emergency_contact
  )
  values (
    p_request_id,

    coalesce(
      (
        p_delivery ->> 'required'
      )::boolean,
      false
    ),

    nullif(
      p_delivery ->> 'fullName',
      ''
    ),

    nullif(
      p_delivery ->> 'houseNumber',
      ''
    ),

    nullif(
      p_delivery ->> 'areaTown',
      ''
    ),

    nullif(
      p_delivery ->> 'cityDistrict',
      ''
    ),

    nullif(
      p_delivery ->> 'region',
      ''
    ),

    nullif(
      p_delivery ->> 'digitalAddress',
      ''
    ),

    nullif(
      p_delivery ->> 'phone',
      ''
    ),

    nullif(
      p_delivery ->> 'email',
      ''
    ),

    nullif(
      p_delivery ->> 'itemType',
      ''
    ),

    nullif(
      p_delivery ->> 'emergencyContact',
      ''
    )
  );


  -- =======================================================
  -- PAYMENT
  -- =======================================================

  insert into public.payments (
    request_id,
    payment_method,
    status,
    proof_storage_path
  )
  values (
    p_request_id,
    p_payment_method,
    'PENDING',
    p_proof_storage_path
  );


  -- =======================================================
  -- INITIAL PUBLIC HISTORY
  -- =======================================================

  insert into public.request_status_history (
    request_id,
    status,
    public_message
  )
  values (
    p_request_id,

    'AWAITING_PAYMENT_VERIFICATION',

    'Your request has been received and your payment proof is awaiting verification.'
  );


  -- =======================================================
  -- AUDIT LOG
  -- =======================================================

  insert into public.activity_logs (
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    'REQUEST_SUBMITTED',
    'request',
    p_request_id,

    jsonb_build_object(
      'request_number',
        p_request_number,

      'service_id',
        v_service_id,

      'service_name',
        v_service_name,

      'service_slug',
        v_service_slug,

      'service_scope',
        v_service_scope,

      'service_category_id',
        v_category_id,

      'service_category_slug',
        v_category_slug,

      'service_category_name',
        v_category_name,

      'university_id',
        v_request_university_id,

      'university_code',
        v_university_code,

      'university_name',
        v_university_name
    )
  );


  return query
  select
    p_request_id,
    p_request_number;

end;
$$;


-- =========================================================
-- 3. SECURE NEW SUBMISSION RPC
-- =========================================================

revoke all
on function public.create_request_submission_v2(
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.create_request_submission_v2(
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  text,
  text
)
to service_role;


-- =========================================================
-- 4. GENERAL REQUEST PROCESSING
--
-- Previous implementation identified general services by
-- universities.code = SC247.
--
-- The service scope is now authoritative.
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
set search_path = public, pg_temp
as $$
declare
  v_current_status text;

  v_service_id uuid;
  v_service_scope text;

  v_delivery_required boolean :=
    false;

  v_new_status text;

  v_public_message text;
begin

  -- =======================================================
  -- LOCK AND LOAD REQUEST
  -- =======================================================

  select
    r.status,

    s.id,
    s.service_scope,

    coalesce(
      d.physical_delivery_required,
      false
    )

  into
    v_current_status,

    v_service_id,
    v_service_scope,

    v_delivery_required

  from public.requests r

  join public.services s
    on s.id = r.service_id

  left join public.deliveries d
    on d.request_id = r.id

  where
    r.id = p_request_id

  for update of r;


  if not found then
    raise exception
      'Request not found.';
  end if;


  -- =======================================================
  -- GENERAL SERVICE CHECK
  -- =======================================================

  if v_service_scope <> 'general' then
    raise exception
      'This request is not a general service request.';
  end if;


  -- =======================================================
  -- DETERMINE NEXT STATUS
  -- =======================================================

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


  -- =======================================================
  -- UPDATE REQUEST
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
      'service_id',
        v_service_id,

      'from_status',
        v_current_status,

      'to_status',
        v_new_status,

      'workflow',
        'GENERAL_SERVICE'
    )
  );


  return query
  select
    v_new_status;

end;
$$;


-- =========================================================
-- 5. GENERAL DELIVERY WORKFLOW
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
set search_path = public, pg_temp
as $$
declare
  v_current_status text;

  v_service_id uuid;
  v_service_scope text;

  v_delivery_required boolean :=
    false;

  v_new_status text;

  v_public_message text;
begin

  -- =======================================================
  -- LOCK AND LOAD
  -- =======================================================

  select
    r.status,

    s.id,
    s.service_scope,

    coalesce(
      d.physical_delivery_required,
      false
    )

  into
    v_current_status,

    v_service_id,
    v_service_scope,

    v_delivery_required

  from public.requests r

  join public.services s
    on s.id = r.service_id

  left join public.deliveries d
    on d.request_id = r.id

  where
    r.id = p_request_id

  for update of r;


  if not found then
    raise exception
      'Request not found.';
  end if;


  if v_service_scope <> 'general' then
    raise exception
      'This request is not a general service request.';
  end if;


  if not v_delivery_required then
    raise exception
      'Physical delivery is not required for this request.';
  end if;


  -- =======================================================
  -- DETERMINE NEXT STATUS
  -- =======================================================

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


  -- =======================================================
  -- UPDATE REQUEST
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
  -- DELIVERY REFERENCE
  --
  -- ems_tracking_number remains the compatibility column
  -- for now.
  -- =======================================================

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

    where
      request_id =
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
      'service_id',
        v_service_id,

      'from_status',
        v_current_status,

      'to_status',
        v_new_status,

      'workflow',
        'GENERAL_SERVICE_DELIVERY'
    )
  );


  return query
  select
    v_new_status;

end;
$$;


-- =========================================================
-- 6. REAPPLY GENERAL WORKFLOW PERMISSIONS
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


-- =========================================================
-- 7. PUBLIC TRACKING
--
-- General services no longer require a university row.
--
-- IMPORTANT COMPATIBILITY:
--
-- For a general service, the existing frontend currently
-- recognises SC247 as a general-service marker.
--
-- We therefore return a presentation-safe SC247 value for
-- the old university object while ALSO returning the new
-- scope/category information.
--
-- This lets the current tracking UI continue working until
-- it is migrated to service.scope.
-- =========================================================

create or replace function public.verify_request_tracking(
  p_tracking_number text,
  p_tracking_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_request record;

  v_history jsonb;
begin

  -- =======================================================
  -- LOCATE REQUEST
  -- =======================================================

  select
    r.id,

    r.request_number,

    r.tracking_number,

    r.tracking_pin_digest,

    r.status,

    r.created_at,

    r.tracking_issued_at,


    u.code as university_code,

    u.name as university_name,


    s.id as service_id,

    s.name as service_name,

    s.short_name as service_short_name,

    s.service_scope,


    c.slug as category_slug,

    c.name as category_name,


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


  left join public.service_categories c
    on c.id =
      s.service_category_id


  left join public.deliveries d
    on d.request_id =
      r.id


  where
    upper(
      r.tracking_number
    ) =
    upper(
      trim(
        p_tracking_number
      )
    )


  limit 1;


  -- =======================================================
  -- GENERIC INVALID TRACKING RESPONSE
  -- =======================================================

  if not found then
    return null;
  end if;


  if v_request.tracking_pin_digest is null then
    return null;
  end if;


  if
    v_request.tracking_pin_digest <>
    crypt(
      trim(
        p_tracking_pin
      ),
      v_request.tracking_pin_digest
    )
  then
    return null;
  end if;


  -- =======================================================
  -- PUBLIC STATUS HISTORY
  --
  -- internal_note and changed_by remain private.
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
  -- PUBLIC RESPONSE
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


    -- -----------------------------------------------------
    -- Compatibility object
    --
    -- Existing tracking UI expects university.code.
    --
    -- General services receive a presentation-safe SC247
    -- object even when requests.university_id is NULL.
    -- -----------------------------------------------------

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


    -- -----------------------------------------------------
    -- New service-aware information
    -- -----------------------------------------------------

    'service',

      jsonb_build_object(
        'id',
          v_request.service_id,

        'name',
          v_request.service_name,

        'shortName',
          v_request.service_short_name,

        'scope',
          v_request.service_scope,

        'category',
          jsonb_build_object(
            'slug',
              v_request.category_slug,

            'name',
              v_request.category_name
          )
      ),


    'serviceArea',

      jsonb_build_object(
        'scope',
          v_request.service_scope,

        'categorySlug',
          v_request.category_slug,

        'categoryName',
          v_request.category_name,

        'institutionRequired',
          (
            v_request.service_scope =
            'academic'
          )
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
-- 8. TRACKING PERMISSIONS
-- =========================================================

revoke all
on function public.verify_request_tracking(
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.verify_request_tracking(
  text,
  text
)
to service_role;


-- =========================================================
-- END PHASE 13A-3A
-- =========================================================