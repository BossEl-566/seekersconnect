create or replace function public.create_request_submission(
  p_request_id uuid,
  p_request_number text,

  p_university_code text,
  p_service_slug text,

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
  v_university_id uuid;
  v_service_id uuid;
  v_item jsonb;
begin

  -- -------------------------------------------------------
  -- Find active university
  -- -------------------------------------------------------

  select id
  into v_university_id
  from public.universities
  where upper(code) = upper(p_university_code)
    and active = true;

  if v_university_id is null then
    raise exception 'University not found or inactive';
  end if;


  -- -------------------------------------------------------
  -- Find active service belonging to university
  -- -------------------------------------------------------

  select id
  into v_service_id
  from public.services
  where university_id = v_university_id
    and slug = p_service_slug
    and active = true;

  if v_service_id is null then
    raise exception 'Service not found or inactive';
  end if;


  -- -------------------------------------------------------
  -- Create request
  -- -------------------------------------------------------

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

    v_university_id,
    v_service_id,

    'AWAITING_PAYMENT_VERIFICATION',

    p_first_name,
    nullif(p_other_names, ''),
    p_surname,
    nullif(p_gender, ''),

    p_phone,
    p_email,

    nullif(p_notes, '')
  );


  -- -------------------------------------------------------
  -- Save dynamic academic responses
  -- -------------------------------------------------------

  for v_item in
    select value
    from jsonb_array_elements(
      coalesce(p_responses, '[]'::jsonb)
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
      nullif(v_item ->> 'value', '')
    );

  end loop;


  -- -------------------------------------------------------
  -- Delivery
  -- -------------------------------------------------------

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
      (p_delivery ->> 'required')::boolean,
      false
    ),

    nullif(p_delivery ->> 'fullName', ''),
    nullif(p_delivery ->> 'houseNumber', ''),
    nullif(p_delivery ->> 'areaTown', ''),
    nullif(p_delivery ->> 'cityDistrict', ''),
    nullif(p_delivery ->> 'region', ''),
    nullif(p_delivery ->> 'digitalAddress', ''),

    nullif(p_delivery ->> 'phone', ''),
    nullif(p_delivery ->> 'email', ''),

    nullif(p_delivery ->> 'itemType', ''),
    nullif(p_delivery ->> 'emergencyContact', '')
  );


  -- -------------------------------------------------------
  -- Payment
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- Initial request history
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- Activity log
  -- -------------------------------------------------------

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
      'university',
      p_university_code
    )
  );


  return query
  select
    p_request_id,
    p_request_number;

end;
$$;


revoke all
on function public.create_request_submission(
  uuid,
  text,
  text,
  text,
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
on function public.create_request_submission(
  uuid,
  text,
  text,
  text,
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