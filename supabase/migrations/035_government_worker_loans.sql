-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13F
-- GOVERNMENT WORKER LOANS
--
-- Uses:
--   - Generic service catalog
--   - Dynamic form builder
--   - Conditional fields
--   - Generic private upload system
--   - Quote-required pricing
--
-- SECURITY:
-- Never collect:
--   - OTP
--   - mandate PIN
--   - bank PIN
--   - passwords
--   - authentication secrets
-- =========================================================


do $$
declare

  -- =======================================================
  -- CATEGORY / SERVICE
  -- =======================================================

  v_category_id uuid;

  v_service_id uuid;


  -- =======================================================
  -- CONDITION PARENT FIELDS
  -- =======================================================

  v_loan_channel_id uuid;

  v_application_type_id uuid;

  v_marital_status_id uuid;

begin

  -- =======================================================
  -- 1. SERVICE CATEGORY
  -- =======================================================

  select
    id

  into
    v_category_id

  from public.service_categories

  where
    slug =
    'loans-financial-support'

  limit 1;


  if
    v_category_id is null
  then

    insert into public.service_categories (
      slug,
      name,
      description,
      icon_key,
      display_order,
      active
    )
    values (
      'loans-financial-support',

      'Loans & Financial Support',

      'Loan application support and related financial documentation services for eligible workers.',

      'badge-dollar-sign',

      60,

      true
    )
    returning
      id

    into
      v_category_id;

  else

    update public.service_categories

    set
      name =
        'Loans & Financial Support',

      description =
        'Loan application support and related financial documentation services for eligible workers.',

      icon_key =
        'badge-dollar-sign',

      display_order =
        60,

      active =
        true

    where
      id =
      v_category_id;

  end if;


  -- =======================================================
  -- 2. GOVERNMENT WORKER LOAN SERVICE
  -- =======================================================

  select
    id

  into
    v_service_id

  from public.services

  where
    slug =
    'government-worker-loans'

  order by
    created_at asc

  limit 1;


  if
    v_service_id is null
  then

    insert into public.services (
      university_id,

      service_category_id,

      service_scope,

      slug,

      name,

      short_name,

      description,

      category,

      form_type,

      display_order,

      featured,

      image_url,

      active
    )
    values (
      null,

      v_category_id,

      'general',

      'government-worker-loans',

      'Government Worker Loans',

      'Government Worker Loans',

      'Apply for government worker loan support, including direct bank loans, Controller-based applications, settlement and refinancing assistance.',

      'other',

      'dynamic',

      10,

      true,

      null,

      true
    )
    returning
      id

    into
      v_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_category_id,

      service_scope =
        'general',

      name =
        'Government Worker Loans',

      short_name =
        'Government Worker Loans',

      description =
        'Apply for government worker loan support, including direct bank loans, Controller-based applications, settlement and refinancing assistance.',

      category =
        'other',

      form_type =
        'dynamic',

      display_order =
        10,

      featured =
        true,

      active =
        true

    where
      id =
      v_service_id;

  end if;


  -- =======================================================
  -- 3. PRICING
  --
  -- Loan applications should be reviewed before any service
  -- fee is requested.
  -- =======================================================

  insert into public.service_pricing (
    service_id,

    pricing_mode,

    currency,

    amount,

    unit_label,

    minimum_quantity,

    maximum_quantity,

    display_note,

    active
  )
  values (
    v_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'Your application will be reviewed first. Do not make any service payment until Seekers Connect confirms the applicable amount.',

    true
  )
  on conflict (
    service_id
  )
  do update
  set
    pricing_mode =
      excluded.pricing_mode,

    currency =
      excluded.currency,

    amount =
      null,

    unit_label =
      null,

    minimum_quantity =
      null,

    maximum_quantity =
      null,

    display_note =
      excluded.display_note,

    active =
      true;


  -- =======================================================
  -- 4. LOAN CHANNEL
  -- =======================================================

  insert into public.service_form_fields (
    service_id,

    field_key,

    label,

    field_type,

    placeholder,

    help_text,

    required,

    options,

    allow_other,

    other_label,

    condition_field_id,

    condition_operator,

    condition_value,

    validation_rules,

    sort_order,

    active
  )
  values (
    v_service_id,

    'loan_channel',

    'Loan Channel',

    'radio',

    null,

    'Choose how the loan application should be processed.',

    true,

    jsonb_build_array(
      'Direct Bank Loan',
      'Controller Loan'
    ),

    false,

    null,

    null,

    null,

    null,

    '{}'::jsonb,

    10,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    options =
      excluded.options,

    allow_other =
      excluded.allow_other,

    other_label =
      excluded.other_label,

    condition_field_id =
      null,

    condition_operator =
      null,

    condition_value =
      null,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true

  returning
    id

  into
    v_loan_channel_id;


  -- =======================================================
  -- 5. APPLICATION TYPE
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    options,
    allow_other,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'application_type',

    'Application Type',

    'radio',

    'Select whether this is a new loan application or an existing loan that should be settled or refinanced.',

    true,

    jsonb_build_array(
      'New Loan',
      'Payoff / Refinance'
    ),

    false,

    '{}'::jsonb,

    20,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    options =
      excluded.options,

    allow_other =
      false,

    condition_field_id =
      null,

    condition_operator =
      null,

    condition_value =
      null,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true

  returning
    id

  into
    v_application_type_id;


  -- =======================================================
  -- 6. REQUESTED LOAN AMOUNT
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    options,
    allow_other,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'requested_loan_amount',

    'Requested Loan Amount',

    'currency',

    'e.g. 25000',

    'Enter the approximate amount you wish to apply for in Ghana cedis.',

    true,

    null,

    false,

    jsonb_build_object(
      'min',
      1
    ),

    30,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    options =
      null,

    allow_other =
      false,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 7. REQUESTED LOAN DURATION
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'loan_duration_months',

    'Preferred Loan Duration (Months)',

    'number',

    'e.g. 36',

    'Enter your preferred repayment duration in months.',

    true,

    jsonb_build_object(
      'min',
      1,
      'max',
      120
    ),

    40,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 8. STAFF ID
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'staff_id',

    'Staff ID / Employee Number',

    'text',

    'Enter staff ID',

    'Enter the staff or employee number issued by your employer.',

    true,

    jsonb_build_object(
      'minLength',
      2,
      'maxLength',
      80
    ),

    50,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 9. GHANA CARD NUMBER
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'ghana_card_number',

    'Ghana Card Number',

    'text',

    'GHA-XXXXXXXXX-X',

    'Enter the Ghana Card number exactly as shown on the card. Do not enter any OTP, PIN or verification code.',

    true,

    jsonb_build_object(
      'minLength',
      10,
      'maxLength',
      30
    ),

    60,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 10. DATE OF BIRTH
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'date_of_birth',

    'Date of Birth',

    'date',

    'Enter your date of birth exactly as it appears on your identification documents.',

    true,

    '{}'::jsonb,

    70,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 11. MARITAL STATUS
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    options,
    allow_other,
    other_label,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'marital_status',

    'Marital Status',

    'select',

    'Select your current marital status.',

    true,

    jsonb_build_array(
      'Single',
      'Married',
      'Divorced',
      'Widowed'
    ),

    true,

    'Other',

    '{}'::jsonb,

    80,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    options =
      excluded.options,

    allow_other =
      excluded.allow_other,

    other_label =
      excluded.other_label,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true

  returning
    id

  into
    v_marital_status_id;


  -- =======================================================
  -- 12. EMPLOYER / INSTITUTION
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'employer_name',

    'Employer / Institution',

    'text',

    'Enter employer name',

    'Enter the government ministry, department, agency, institution or other employer where you work.',

    true,

    jsonb_build_object(
      'maxLength',
      200
    ),

    90,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 13. JOB TITLE
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'job_title',

    'Job Title / Position',

    'text',

    'Enter job title',

    null,

    true,

    jsonb_build_object(
      'maxLength',
      150
    ),

    100,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 14. EMPLOYMENT DATE
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'employment_date',

    'Employment Start Date',

    'date',

    'Enter the date you started your current employment.',

    true,

    '{}'::jsonb,

    110,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 15. BASIC / NET SALARY
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'net_monthly_salary',

    'Net Monthly Salary',

    'currency',

    'e.g. 4500',

    'Enter your approximate monthly take-home salary in Ghana cedis.',

    true,

    jsonb_build_object(
      'min',
      1
    ),

    120,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 16. AFFORDABILITY
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'affordability_amount',

    'Estimated Monthly Affordability',

    'currency',

    'e.g. 800',

    'Enter the approximate amount you believe can be deducted monthly for the new loan.',

    false,

    jsonb_build_object(
      'min',
      0
    ),

    130,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 17. RESIDENTIAL ADDRESS
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'residential_address',

    'Residential Address',

    'textarea',

    'House number, area, town/city, region',

    'Provide your current residential address.',

    true,

    jsonb_build_object(
      'minLength',
      5,
      'maxLength',
      500
    ),

    140,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 18. DIGITAL ADDRESS
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'digital_address',

    'GhanaPost GPS Digital Address',

    'text',

    'e.g. GA-123-4567',

    null,

    false,

    jsonb_build_object(
      'maxLength',
      30
    ),

    150,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 19. SALARY BANK
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'salary_bank',

    'Salary Bank',

    'text',

    'Enter bank name',

    'Enter the bank where your salary is currently paid.',

    true,

    jsonb_build_object(
      'maxLength',
      150
    ),

    160,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 20. BANK ACCOUNT NUMBER
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'bank_account_number',

    'Bank Account Number',

    'text',

    'Enter account number',

    'Enter the account number that receives your salary. Never enter your bank PIN or password.',

    true,

    jsonb_build_object(
      'minLength',
      5,
      'maxLength',
      50
    ),

    170,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 21. BANK BRANCH
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'bank_branch',

    'Bank Branch',

    'text',

    'Enter branch if known',

    null,

    false,

    jsonb_build_object(
      'maxLength',
      150
    ),

    180,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 22. NEXT OF KIN NAME
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'next_of_kin_name',

    'Next of Kin Full Name',

    'text',

    'Enter full name',

    null,

    true,

    jsonb_build_object(
      'maxLength',
      200
    ),

    190,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 23. NEXT OF KIN RELATIONSHIP
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'next_of_kin_relationship',

    'Relationship to Next of Kin',

    'text',

    'e.g. Spouse, sibling, parent',

    null,

    true,

    jsonb_build_object(
      'maxLength',
      100
    ),

    200,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 24. NEXT OF KIN PHONE
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'next_of_kin_phone',

    'Next of Kin Phone Number',

    'tel',

    'e.g. 0240000000',

    null,

    true,

    jsonb_build_object(
      'minLength',
      7,
      'maxLength',
      30
    ),

    210,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 25. NEXT OF KIN ADDRESS
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'next_of_kin_address',

    'Next of Kin Address',

    'textarea',

    'Enter residential address',

    null,

    false,

    jsonb_build_object(
      'maxLength',
      500
    ),

    220,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 26. CONTROLLER MANDATE NUMBER
  --
  -- NUMBER ONLY.
  -- NEVER mandate PIN.
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'mandate_number',

    'Controller Mandate Number',

    'text',

    'Enter mandate number',

    'Enter only the mandate number. Do not provide a mandate PIN, OTP, password or authentication code.',

    true,

    jsonb_build_object(
      'maxLength',
      100
    ),

    230,

    true,

    v_loan_channel_id,

    'EQUALS',

    to_jsonb(
      'Controller Loan'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 27. CURRENT LENDER
  --
  -- PAYOFF / REFINANCE ONLY
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'current_lender',

    'Current Lender / Financial Institution',

    'text',

    'Enter current lender',

    'Required when the application involves settling or refinancing an existing loan.',

    true,

    jsonb_build_object(
      'maxLength',
      200
    ),

    240,

    true,

    v_application_type_id,

    'EQUALS',

    to_jsonb(
      'Payoff / Refinance'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 28. OUTSTANDING LOAN BALANCE
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'outstanding_loan_balance',

    'Outstanding Loan Balance',

    'currency',

    'e.g. 12000',

    'Enter the current approximate outstanding balance.',

    true,

    jsonb_build_object(
      'min',
      0
    ),

    250,

    true,

    v_application_type_id,

    'EQUALS',

    to_jsonb(
      'Payoff / Refinance'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 29. EXISTING MONTHLY LOAN DEDUCTION
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'existing_monthly_deduction',

    'Existing Monthly Loan Deduction',

    'currency',

    'e.g. 750',

    'Enter the monthly amount currently deducted for the existing loan.',

    true,

    jsonb_build_object(
      'min',
      0
    ),

    260,

    true,

    v_application_type_id,

    'EQUALS',

    to_jsonb(
      'Payoff / Refinance'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 30. GHANA CARD FRONT
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'ghana_card_front',

    'Ghana Card — Front',

    'image',

    'Upload a clear image of the front of the applicant''s Ghana Card.',

    true,

    jsonb_build_object(
      'maxFiles',
      1,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    300,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 31. GHANA CARD BACK
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'ghana_card_back',

    'Ghana Card — Back',

    'image',

    'Upload a clear image of the back of the applicant''s Ghana Card.',

    true,

    jsonb_build_object(
      'maxFiles',
      1,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    310,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 32. PASSPORT PHOTOGRAPH
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'passport_photo',

    'Passport Photograph',

    'image',

    'Upload a recent clear passport-style photograph.',

    true,

    jsonb_build_object(
      'maxFiles',
      1,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    320,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 33. PAYSLIP
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'recent_payslip',

    'Recent Payslip',

    'document',

    'Upload the most recent payslip available.',

    true,

    jsonb_build_object(
      'maxFiles',
      3,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    330,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 34. CONTROLLER MANDATE BIODATA
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'mandate_biodata',

    'Controller Mandate Biodata',

    'document',

    'Upload the required mandate biodata document. Never upload or enter a mandate PIN, OTP or password.',

    true,

    jsonb_build_object(
      'maxFiles',
      2,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    340,

    true,

    v_loan_channel_id,

    'EQUALS',

    to_jsonb(
      'Controller Loan'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 35. SETTLEMENT QUOTATION
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active,

    condition_field_id,
    condition_operator,
    condition_value
  )
  values (
    v_service_id,

    'settlement_quotation',

    'Settlement Quotation',

    'document',

    'Upload the current settlement quotation from the existing lender.',

    true,

    jsonb_build_object(
      'maxFiles',
      2,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      )
    ),

    350,

    true,

    v_application_type_id,

    'EQUALS',

    to_jsonb(
      'Payoff / Refinance'::text
    )
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value;


  -- =======================================================
  -- 36. ADDITIONAL SUPPORTING DOCUMENTS
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'supporting_documents',

    'Additional Supporting Documents',

    'file',

    'Upload any additional documents that may help with the application.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ),

    360,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 37. ADDITIONAL INFORMATION
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'loan_additional_information',

    'Additional Information',

    'textarea',

    'Add any information that may help us review the application.',

    'Do not include passwords, OTPs, PINs or other authentication credentials.',

    false,

    jsonb_build_object(
      'maxLength',
      2000
    ),

    370,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    placeholder =
      excluded.placeholder,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 38. SECURITY ACKNOWLEDGEMENT
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_service_id,

    'security_acknowledgement',

    'I understand that I must not provide any OTP, bank PIN, mandate PIN, password or other authentication secret.',

    'checkbox',

    'Seekers Connect should never require these authentication credentials through this request form.',

    true,

    '{}'::jsonb,

    380,

    true
  )
  on conflict (
    service_id,
    field_key
  )
  do update
  set
    label =
      excluded.label,

    field_type =
      excluded.field_type,

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


end
$$;