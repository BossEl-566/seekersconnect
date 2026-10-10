-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13B-6C
-- PUBLIC PRICING OPTION + AUTHORITATIVE TIER RESOLUTION
--
-- The browser may preview option/tier prices, but PostgreSQL
-- independently validates the selected option, resolves the
-- active tier, calculates the amount, and snapshots it.
--
-- Existing services with no usable pricing options continue
-- using the base service_pricing amount exactly as before.
-- =========================================================


create or replace function public.create_pricing_request_submission_v2(
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

  p_pricing_option_id uuid default null,
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
  total_amount numeric,
  pricing_option_id uuid,
  pricing_option_label text,
  pricing_tier_id uuid,
  pricing_tier_label text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_service record;
  v_pricing record;
  v_option record;
  v_tier record;
  v_item jsonb;

  v_mode text;
  v_currency text := 'GHS';

  v_unit_amount numeric(12, 2);
  v_quantity numeric(12, 2);
  v_total numeric(12, 2);
  v_unit_label text;

  v_initial_status text;
  v_public_message text;
  v_payment_required boolean := false;

  v_pricing_active boolean := false;
  v_has_usable_options boolean := false;
  v_pricing_note text;

  v_option_id uuid;
  v_option_code text;
  v_option_label text;

  v_tier_id uuid;
  v_tier_label text;
begin

  -- =======================================================
  -- 1. BASIC REQUEST VALIDATION
  -- =======================================================

  if p_request_id is null then
    raise exception 'Request identifier is required.';
  end if;

  if nullif(btrim(coalesce(p_request_number, '')), '') is null then
    raise exception 'Request number is required.';
  end if;

  if nullif(btrim(coalesce(p_first_name, '')), '') is null then
    raise exception 'First name is required.';
  end if;

  if nullif(btrim(coalesce(p_surname, '')), '') is null then
    raise exception 'Surname is required.';
  end if;

  if nullif(btrim(coalesce(p_phone, '')), '') is null then
    raise exception 'Phone number is required.';
  end if;

  if nullif(btrim(coalesce(p_email, '')), '') is null then
    raise exception 'Email address is required.';
  end if;


  -- =======================================================
  -- 2. AUTHORITATIVE SERVICE
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
  -- 3. SERVICE SCOPE
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
  -- 4. CURRENT SERVICE PRICING
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


  if
    not found
  then

    v_mode :=
      'MANUAL_PRICE';

    v_currency :=
      'GHS';

    v_unit_amount :=
      null;

    v_pricing_active :=
      false;

    v_pricing_note :=
      null;


  elsif
    not coalesce(
      v_pricing.active,
      false
    )
  then

    v_mode :=
      'MANUAL_PRICE';

    v_currency :=
      upper(
        coalesce(
          v_pricing.currency,
          'GHS'
        )
      );

    v_unit_amount :=
      null;

    v_pricing_active :=
      false;

    v_pricing_note :=
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

    v_pricing_active :=
      true;

    v_pricing_note :=
      v_pricing.display_note;

  end if;


  -- =======================================================
  -- 5. DETERMINE WHETHER USABLE OPTIONS EXIST
  --
  -- An option is usable only when it is active and has at
  -- least one active price tier.
  --
  -- An incomplete Admin option therefore does not break the
  -- original base-price workflow.
  -- =======================================================

  if
    v_pricing_active

    and

    v_mode in (
      'FIXED',
      'PER_UNIT',
      'STARTING_FROM'
    )
  then

    select
      exists (
        select 1

        from public.service_pricing_options spo

        where
          spo.service_pricing_id =
          v_pricing.id

          and spo.active =
          true

          and exists (
            select 1

            from public.service_pricing_tiers spt

            where
              spt.pricing_option_id =
              spo.id

              and spt.active =
              true
          )
      )

    into
      v_has_usable_options;

  end if;


  -- =======================================================
  -- 6. RESOLVE SELECTED OPTION
  -- =======================================================

  if
    v_has_usable_options
  then

    if
      p_pricing_option_id
      is null
    then
      raise exception
        'Select a pricing option for this service.';
    end if;


    select
      spo.id,
      spo.service_pricing_id,
      spo.code,
      spo.label,
      spo.description,
      spo.unit_label,
      spo.display_order,
      spo.active

    into
      v_option

    from public.service_pricing_options spo

    where
      spo.id =
      p_pricing_option_id

      and spo.service_pricing_id =
      v_pricing.id

      and spo.active =
      true

    limit 1;


    if
      not found
    then
      raise exception
        'The selected pricing option is no longer available.';
    end if;


    v_option_id :=
      v_option.id;

    v_option_code :=
      v_option.code;

    v_option_label :=
      v_option.label;


  elsif
    p_pricing_option_id
    is not null
  then

    raise exception
      'The selected pricing option is no longer available.';

  end if;


  -- =======================================================
  -- 7. FIXED PRICE
  -- =======================================================

  if
    v_mode =
    'FIXED'
  then

    if
      v_has_usable_options
    then

      select
        spt.id,
        spt.pricing_option_id,
        spt.label,
        spt.amount,
        spt.minimum_quantity,
        spt.maximum_quantity,
        spt.display_order,
        spt.active

      into
        v_tier

      from public.service_pricing_tiers spt

      where
        spt.pricing_option_id =
        v_option_id

        and spt.active =
        true

      order by
        spt.display_order asc,
        spt.created_at asc,
        spt.id asc

      limit 1;


      if
        not found
      then
        raise exception
          'The selected pricing option does not have an active price.';
      end if;


      v_tier_id :=
        v_tier.id;

      v_tier_label :=
        v_tier.label;

      v_unit_amount :=
        v_tier.amount;

    end if;


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

    v_unit_label :=
      null;


    v_payment_required :=
      true;

    v_initial_status :=
      'AWAITING_PAYMENT_VERIFICATION';

    v_public_message :=
      'Your request has been received and your payment proof is awaiting verification.';


  -- =======================================================
  -- 8. PER-UNIT PRICE
  -- =======================================================

  elsif
    v_mode =
    'PER_UNIT'
  then

    if
      p_pricing_quantity is null
      or p_pricing_quantity <= 0
    then
      raise exception
        'Enter a valid quantity for this service.';
    end if;


    v_quantity :=
      p_pricing_quantity;


    if
      v_has_usable_options
    then

      select
        spt.id,
        spt.pricing_option_id,
        spt.label,
        spt.amount,
        spt.minimum_quantity,
        spt.maximum_quantity,
        spt.display_order,
        spt.active

      into
        v_tier

      from public.service_pricing_tiers spt

      where
        spt.pricing_option_id =
        v_option_id

        and spt.active =
        true

        and spt.minimum_quantity
        is not null

        and v_quantity >=
        spt.minimum_quantity

        and (
          spt.maximum_quantity
          is null

          or

          v_quantity <=
          spt.maximum_quantity
        )

      order by
        spt.display_order asc,
        spt.minimum_quantity asc,
        spt.id asc

      limit 1;


      if
        not found
      then
        raise exception
          'The entered quantity does not match an active price tier for the selected option.';
      end if;


      v_tier_id :=
        v_tier.id;

      v_tier_label :=
        v_tier.label;

      v_unit_amount :=
        v_tier.amount;

      v_unit_label :=
        coalesce(
          v_option.unit_label,
          v_pricing.unit_label
        );


    else

      if
        v_unit_amount is null
        or v_unit_amount <= 0
      then
        raise exception
          'Per-unit service does not have a valid unit price.';
      end if;


      if
        v_pricing.minimum_quantity
        is not null

        and

        v_quantity <
        v_pricing.minimum_quantity
      then
        raise exception
          'The quantity is below the minimum allowed for this service.';
      end if;


      if
        v_pricing.maximum_quantity
        is not null

        and

        v_quantity >
        v_pricing.maximum_quantity
      then
        raise exception
          'The quantity is above the maximum allowed for this service.';
      end if;


      v_unit_label :=
        v_pricing.unit_label;

    end if;


    if
      v_unit_amount is null
      or v_unit_amount <= 0
    then
      raise exception
        'Per-unit service does not have a valid unit price.';
    end if;


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
  -- 9. FREE
  -- =======================================================

  elsif
    v_mode =
    'FREE'
  then

    v_unit_amount :=
      0;

    v_quantity :=
      1;

    v_total :=
      0;

    v_unit_label :=
      null;


    v_payment_required :=
      false;

    v_initial_status :=
      'SUBMITTED';

    v_public_message :=
      'Your request has been received. No service payment is required.';


  -- =======================================================
  -- 10. STARTING FROM
  --
  -- A pricing option can be chosen here, but the customer
  -- still waits for the final quote before paying.
  -- =======================================================

  elsif
    v_mode =
    'STARTING_FROM'
  then

    if
      v_has_usable_options
    then

      select
        spt.id,
        spt.pricing_option_id,
        spt.label,
        spt.amount,
        spt.minimum_quantity,
        spt.maximum_quantity,
        spt.display_order,
        spt.active

      into
        v_tier

      from public.service_pricing_tiers spt

      where
        spt.pricing_option_id =
        v_option_id

        and spt.active =
        true

      order by
        spt.display_order asc,
        spt.created_at asc,
        spt.id asc

      limit 1;


      if
        not found
      then
        raise exception
          'The selected pricing option does not have an active starting price.';
      end if;


      v_tier_id :=
        v_tier.id;

      v_tier_label :=
        v_tier.label;

      v_unit_amount :=
        v_tier.amount;

    end if;


    if
      v_unit_amount is null
      or v_unit_amount <= 0
    then
      raise exception
        'Starting-from service does not have a valid amount.';
    end if;


    v_quantity :=
      null;

    v_total :=
      null;

    v_unit_label :=
      null;


    v_payment_required :=
      false;

    v_initial_status :=
      'AWAITING_QUOTE';

    v_public_message :=
      'Your request has been received. Our team will review the details and confirm the amount before payment.';


  -- =======================================================
  -- 11. QUOTE / MANUAL
  -- =======================================================

  elsif
    v_mode in (
      'QUOTE_REQUIRED',
      'MANUAL_PRICE'
    )
  then

    v_unit_amount :=
      null;

    v_quantity :=
      null;

    v_total :=
      null;

    v_unit_label :=
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
  -- 12. PAYMENT VALIDATION
  -- =======================================================

  if
    v_payment_required
  then

    if
      p_payment_method is null

      or

      p_payment_method not in (
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
      )
      is null
    then
      raise exception
        'Payment proof is required.';
    end if;

  end if;


  -- =======================================================
  -- 13. CREATE REQUEST
  --
  -- Existing pricing snapshot triggers may run first.
  -- The authoritative option/tier snapshot below then
  -- replaces those base values where appropriate.
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
  -- 14. AUTHORITATIVE PRICING SNAPSHOT
  -- =======================================================

  update public.requests
  set
    pricing_mode_snapshot =
      v_mode,

    pricing_currency_snapshot =
      v_currency,

    pricing_unit_amount_snapshot =
      v_unit_amount,

    pricing_quantity_snapshot =
      v_quantity,

    pricing_total_snapshot =
      v_total,

    pricing_note_snapshot =
      v_pricing_note,


    pricing_option_id_snapshot =
      v_option_id,

    pricing_option_code_snapshot =
      v_option_code,

    pricing_option_label_snapshot =
      v_option_label,


    pricing_tier_id_snapshot =
      v_tier_id,

    pricing_tier_label_snapshot =
      v_tier_label,


    pricing_unit_label_snapshot =
      case
        when
          v_mode =
          'PER_UNIT'
        then
          v_unit_label

        else
          null
      end,


    price_finalized_at =
      case
        when
          v_mode in (
            'FIXED',
            'PER_UNIT',
            'FREE'
          )
        then
          now()

        else
          null
      end,


    updated_at =
      now()

  where
    id =
    p_request_id;


  -- =======================================================
  -- 15. FORM RESPONSES
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
  -- 16. DELIVERY
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
  -- 17. PAYMENT
  --
  -- This happens after the snapshot update so the existing
  -- payment synchronization trigger reads the resolved total.
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
  -- 18. INITIAL HISTORY
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
  -- 19. AUDIT
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

      'pricing_option_id',
        v_option_id,

      'pricing_option_label',
        v_option_label,

      'pricing_tier_id',
        v_tier_id,

      'pricing_tier_label',
        v_tier_label,

      'unit_amount',
        v_unit_amount,

      'unit_label',
        v_unit_label,

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
  -- 20. RESULT
  -- =======================================================

  return query
  select
    p_request_id,
    p_request_number,
    v_initial_status,
    v_mode,
    v_currency,
    v_total,
    v_option_id,
    v_option_label,
    v_tier_id,
    v_tier_label;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function public.create_pricing_request_submission_v2(
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
  uuid,
  numeric,
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.create_pricing_request_submission_v2(
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
  uuid,
  numeric,
  text,
  text
)
to service_role;


comment on function public.create_pricing_request_submission_v2(
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
  uuid,
  numeric,
  text,
  text
)
is
'Creates a request using authoritative service pricing. When usable pricing options exist, validates the selected option, resolves the active tier server-side, calculates totals, and snapshots the exact option/tier used.';