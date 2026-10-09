-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-4B1
-- PRICING-AWARE REQUEST SUBMISSION
--
-- This function becomes the authoritative transaction for
-- creating requests under the Phase 13 pricing engine.
--
-- IMPORTANT:
--
-- This migration DOES NOT replace the current API yet.
-- The existing public request flow continues working until
-- the frontend/API switch is completed in the next step.
--
--
-- PRICING BEHAVIOUR
--
-- FIXED
--   -> payment required immediately
--   -> AWAITING_PAYMENT_VERIFICATION
--
-- PER_UNIT
--   -> quantity required
--   -> total calculated server-side
--   -> payment required immediately
--   -> AWAITING_PAYMENT_VERIFICATION
--
-- FREE
--   -> no payment row
--   -> SUBMITTED
--
-- STARTING_FROM
-- QUOTE_REQUIRED
-- MANUAL_PRICE
--   -> no payment at initial submission
--   -> AWAITING_QUOTE
-- =========================================================


create or replace function public.create_pricing_request_submission(
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

  p_pricing_quantity numeric default null,

  p_payment_method text default null,
  p_proof_storage_path text default null
)
returns table (
  request_id uuid,
  request_number text,
  new_status text,
  pricing_mode text,
  currency text,
  total_amount numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_service record;

  v_pricing record;

  v_item jsonb;

  v_mode text;

  v_currency text;

  v_unit_amount numeric(12, 2);

  v_quantity numeric(12, 2);

  v_total numeric(12, 2);

  v_initial_status text;

  v_public_message text;

  v_payment_required boolean :=
    false;
begin

  -- =======================================================
  -- 1. VALIDATE BASIC REQUEST VALUES
  -- =======================================================

  if
    p_request_id is null
  then
    raise exception
      'Request identifier is required.';
  end if;


  if
    nullif(
      btrim(
        coalesce(
          p_request_number,
          ''
        )
      ),
      ''
    ) is null
  then
    raise exception
      'Request number is required.';
  end if;


  if
    nullif(
      btrim(
        coalesce(
          p_first_name,
          ''
        )
      ),
      ''
    ) is null
  then
    raise exception
      'First name is required.';
  end if;


  if
    nullif(
      btrim(
        coalesce(
          p_surname,
          ''
        )
      ),
      ''
    ) is null
  then
    raise exception
      'Surname is required.';
  end if;


  if
    nullif(
      btrim(
        coalesce(
          p_phone,
          ''
        )
      ),
      ''
    ) is null
  then
    raise exception
      'Phone number is required.';
  end if;


  if
    nullif(
      btrim(
        coalesce(
          p_email,
          ''
        )
      ),
      ''
    ) is null
  then
    raise exception
      'Email address is required.';
  end if;


  -- =======================================================
  -- 2. RESOLVE SERVICE
  --
  -- Service is the authoritative identifier.
  -- =======================================================

  select
    s.id,
    s.university_id,
    s.service_category_id,
    s.service_scope,
    s.slug,
    s.name,
    s.short_name,
    s.active,

    c.active as category_active,

    u.code as university_code,
    u.name as university_name,
    u.active as university_active

  into
    v_service

  from public.services s

  join public.service_categories c
    on c.id =
       s.service_category_id

  left join public.universities u
    on u.id =
       s.university_id

  where
    s.id =
    p_service_id

  limit 1;


  if not found then
    raise exception
      'Service not found.';
  end if;


  if not v_service.active then
    raise exception
      'Service is currently unavailable.';
  end if;


  if not v_service.category_active then
    raise exception
      'Service category is currently unavailable.';
  end if;


  -- =======================================================
  -- 3. VALIDATE SERVICE SCOPE
  -- =======================================================

  if
    v_service.service_scope =
    'general'
  then

    if
      v_service.university_id
      is not null
    then
      raise exception
        'General service is configured incorrectly.';
    end if;


  elsif
    v_service.service_scope =
    'academic'
  then

    if
      v_service.university_id
      is null
    then
      raise exception
        'Academic service is missing its institution.';
    end if;


    if
      not coalesce(
        v_service.university_active,
        false
      )
    then
      raise exception
        'Institution is currently unavailable.';
    end if;


    if
      upper(
        coalesce(
          v_service.university_code,
          ''
        )
      ) =
      'SC247'
    then
      raise exception
        'SC247 cannot be used as an academic institution.';
    end if;


  else

    raise exception
      'Unsupported service scope.';

  end if;


  -- =======================================================
  -- 4. LOAD CURRENT PRICING
  -- =======================================================

  select
    sp.id,
    sp.pricing_mode,
    sp.currency,
    sp.amount,
    sp.unit_label,
    sp.minimum_quantity,
    sp.maximum_quantity,
    sp.display_note,
    sp.active

  into
    v_pricing

  from public.service_pricing sp

  where
    sp.service_id =
    p_service_id

  limit 1;


  -- =======================================================
  -- 5. DETERMINE EFFECTIVE PRICING
  --
  -- Missing or disabled pricing is treated as MANUAL_PRICE.
  -- =======================================================

  if
    not found
    or not coalesce(
      v_pricing.active,
      false
    )
  then

    v_mode :=
      'MANUAL_PRICE';

    v_currency :=
      coalesce(
        v_pricing.currency,
        'GHS'
      );

    v_unit_amount :=
      null;

  else

    v_mode :=
      v_pricing.pricing_mode;

    v_currency :=
      upper(
        coalesce(
          v_pricing.currency,
          'GHS'
        )
      );

    v_unit_amount :=
      v_pricing.amount;

  end if;


  -- =======================================================
  -- 6. FIXED PRICE
  -- =======================================================

  if
    v_mode =
    'FIXED'
  then

    if
      v_unit_amount is null
      or v_unit_amount <= 0
    then
      raise exception
        'Fixed-price service does not have a valid amount.';
    end if;


    v_quantity :=
      1;


    v_total :=
      v_unit_amount;


    v_payment_required :=
      true;


    v_initial_status :=
      'AWAITING_PAYMENT_VERIFICATION';


    v_public_message :=
      'Your request has been received and your payment proof is awaiting verification.';


  -- =======================================================
  -- 7. PER-UNIT PRICE
  -- =======================================================

  elsif
    v_mode =
    'PER_UNIT'
  then

    if
      v_unit_amount is null
      or v_unit_amount <= 0
    then
      raise exception
        'Per-unit service does not have a valid unit price.';
    end if;


    if
      p_pricing_quantity is null
      or p_pricing_quantity <= 0
    then
      raise exception
        'Enter a valid quantity for this service.';
    end if;


    if
      v_pricing.minimum_quantity
      is not null

      and
      p_pricing_quantity <
      v_pricing.minimum_quantity
    then
      raise exception
        'The quantity is below the minimum allowed for this service.';
    end if;


    if
      v_pricing.maximum_quantity
      is not null

      and
      p_pricing_quantity >
      v_pricing.maximum_quantity
    then
      raise exception
        'The quantity is above the maximum allowed for this service.';
    end if;


    v_quantity :=
      p_pricing_quantity;


    v_total :=
      round(
        v_unit_amount *
        v_quantity,
        2
      );


    v_payment_required :=
      true;


    v_initial_status :=
      'AWAITING_PAYMENT_VERIFICATION';


    v_public_message :=
      'Your request has been received and your payment proof is awaiting verification.';


  -- =======================================================
  -- 8. FREE
  -- =======================================================

  elsif
    v_mode =
    'FREE'
  then

    v_quantity :=
      1;


    v_total :=
      0;


    v_payment_required :=
      false;


    v_initial_status :=
      'SUBMITTED';


    v_public_message :=
      'Your request has been received. No service payment is required.';


  -- =======================================================
  -- 9. VARIABLE / QUOTE-BASED PRICING
  -- =======================================================

  elsif
    v_mode in (
      'STARTING_FROM',
      'QUOTE_REQUIRED',
      'MANUAL_PRICE'
    )
  then

    v_quantity :=
      null;


    v_total :=
      null;


    v_payment_required :=
      false;


    v_initial_status :=
      'AWAITING_QUOTE';


    v_public_message :=
      'Your request has been received. Our team will review the details and confirm the amount before payment.';


  else

    raise exception
      'Unsupported pricing mode.';

  end if;


  -- =======================================================
  -- 10. PAYMENT VALIDATION
  --
  -- Only FIXED and PER_UNIT may submit payment now.
  -- =======================================================

  if
    v_payment_required
  then

    if
      p_payment_method is null

      or p_payment_method not in (
        'momo',
        'bank'
      )
    then
      raise exception
        'Select a valid payment method.';
    end if;


    if
      nullif(
        btrim(
          coalesce(
            p_proof_storage_path,
            ''
          )
        ),
        ''
      ) is null
    then
      raise exception
        'Payment proof is required.';
    end if;

  end if;


  -- =======================================================
  -- 11. CREATE REQUEST
  --
  -- Migration 025 snapshots the current service pricing
  -- automatically BEFORE this row is inserted.
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

    v_service.university_id,
    p_service_id,

    v_initial_status,

    btrim(
      p_first_name
    ),

    nullif(
      btrim(
        coalesce(
          p_other_names,
          ''
        )
      ),
      ''
    ),

    btrim(
      p_surname
    ),

    nullif(
      btrim(
        coalesce(
          p_gender,
          ''
        )
      ),
      ''
    ),

    btrim(
      p_phone
    ),

    btrim(
      p_email
    ),

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
  -- 12. FINALIZE PER-UNIT SNAPSHOT
  --
  -- Migration 025 deliberately leaves the PER_UNIT total
  -- empty because quantity does not exist until submission.
  -- =======================================================

  if
    v_mode =
    'PER_UNIT'
  then

    update public.requests
    set
      pricing_quantity_snapshot =
        v_quantity,

      pricing_total_snapshot =
        v_total,

      price_finalized_at =
        now(),

      updated_at =
        now()

    where
      id =
      p_request_id;

  end if;


  -- =======================================================
  -- 13. REQUEST FORM RESPONSES
  -- =======================================================

  for v_item in

    select
      value

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

      v_item ->>
        'fieldKey',

      v_item ->>
        'label',

      nullif(
        v_item ->>
          'value',
        ''
      )
    );

  end loop;


  -- =======================================================
  -- 14. DELIVERY
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
        p_delivery ->>
        'required'
      )::boolean,
      false
    ),

    nullif(
      p_delivery ->>
      'fullName',
      ''
    ),

    nullif(
      p_delivery ->>
      'houseNumber',
      ''
    ),

    nullif(
      p_delivery ->>
      'areaTown',
      ''
    ),

    nullif(
      p_delivery ->>
      'cityDistrict',
      ''
    ),

    nullif(
      p_delivery ->>
      'region',
      ''
    ),

    nullif(
      p_delivery ->>
      'digitalAddress',
      ''
    ),

    nullif(
      p_delivery ->>
      'phone',
      ''
    ),

    nullif(
      p_delivery ->>
      'email',
      ''
    ),

    nullif(
      p_delivery ->>
      'itemType',
      ''
    ),

    nullif(
      p_delivery ->>
      'emergencyContact',
      ''
    )
  );


  -- =======================================================
  -- 15. PAYMENT
  --
  -- Only create a payment when payment is actually due now.
  --
  -- Migration 026 copies request currency/amount onto the
  -- payment row.
  -- =======================================================

  if
    v_payment_required
  then

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

  end if;


  -- =======================================================
  -- 16. INITIAL HISTORY
  -- =======================================================

  insert into public.request_status_history (
    request_id,
    status,
    public_message
  )
  values (
    p_request_id,
    v_initial_status,
    v_public_message
  );


  -- =======================================================
  -- 17. AUDIT
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
        p_service_id,

      'service_name',
        v_service.name,

      'service_scope',
        v_service.service_scope,

      'university_id',
        v_service.university_id,

      'pricing_mode',
        v_mode,

      'currency',
        v_currency,

      'unit_amount',
        v_unit_amount,

      'quantity',
        v_quantity,

      'total_amount',
        v_total,

      'payment_required',
        v_payment_required,

      'initial_status',
        v_initial_status
    )
  );


  -- =======================================================
  -- 18. RESULT
  -- =======================================================

  return query
  select
    p_request_id,

    p_request_number,

    v_initial_status,

    v_mode,

    v_currency,

    v_total;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function public.create_pricing_request_submission(
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
  numeric,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.create_pricing_request_submission(
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
  numeric,
  text,
  text
)
to service_role;


comment on function public.create_pricing_request_submission(
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
  numeric,
  text,
  text
)
is
'Creates a request using authoritative service scope and pricing, calculates per-unit totals server-side, and creates a payment only when immediate payment is required.';