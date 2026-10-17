-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13H
--
-- LEGAL SERVICES
-- STUDY ABROAD
-- JOB SEEKERS
-- TEACHING PRACTICUM
-- RESULTS / PLACEMENT
-- SECURITY SERVICE APPLICATIONS
-- =========================================================

do $$
declare

  -- =======================================================
  -- CATEGORIES
  -- =======================================================

  v_legal_category_id uuid;

  v_study_abroad_category_id uuid;

  v_career_category_id uuid;

  v_practicum_category_id uuid;

  v_results_category_id uuid;


  -- =======================================================
  -- SERVICES
  -- =======================================================

  v_affidavit_service_id uuid;

  v_gazette_service_id uuid;

  v_study_abroad_service_id uuid;

  v_job_seekers_service_id uuid;

  v_practicum_service_id uuid;

  v_results_service_id uuid;

  v_placement_service_id uuid;

  v_security_service_id uuid;


  -- =======================================================
  -- CONDITION FIELDS
  -- =======================================================

  v_affidavit_type_id uuid;

  v_gazette_type_id uuid;

  v_exam_type_id uuid;

  v_placement_type_id uuid;

begin

  -- =======================================================
  -- 1. LEGAL SERVICES CATEGORY
  -- =======================================================

  select
    id
  into
    v_legal_category_id
  from public.service_categories
  where slug =
    'legal-services'
  limit 1;


  if
    v_legal_category_id is null
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
      'legal-services',

      'Legal & Documentation',

      'Affidavit, Gazette and related documentation support services.',

      'scale',

      65,

      true
    )
    returning
      id
    into
      v_legal_category_id;

  else

    update public.service_categories

    set
      name =
        'Legal & Documentation',

      description =
        'Affidavit, Gazette and related documentation support services.',

      icon_key =
        'scale',

      display_order =
        65,

      active =
        true

    where
      id =
      v_legal_category_id;

  end if;


  -- =======================================================
  -- 2. STUDY ABROAD CATEGORY
  -- =======================================================

  select
    id
  into
    v_study_abroad_category_id
  from public.service_categories
  where slug =
    'study-abroad'
  limit 1;


  if
    v_study_abroad_category_id is null
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
      'study-abroad',

      'Study Abroad',

      'International university search, application guidance and study-abroad support.',

      'plane',

      70,

      true
    )
    returning
      id
    into
      v_study_abroad_category_id;

  else

    update public.service_categories

    set
      name =
        'Study Abroad',

      description =
        'International university search, application guidance and study-abroad support.',

      icon_key =
        'plane',

      display_order =
        70,

      active =
        true

    where
      id =
      v_study_abroad_category_id;

  end if;


  -- =======================================================
  -- 3. CAREER CATEGORY
  -- =======================================================

  select
    id
  into
    v_career_category_id
  from public.service_categories
  where slug =
    'career-job-support'
  limit 1;


  if
    v_career_category_id is null
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
      'career-job-support',

      'Career & Job Support',

      'Job seeker registration and career opportunity support.',

      'briefcase-business',

      75,

      true
    )
    returning
      id
    into
      v_career_category_id;

  else

    update public.service_categories

    set
      name =
        'Career & Job Support',

      description =
        'Job seeker registration and career opportunity support.',

      icon_key =
        'briefcase-business',

      display_order =
        75,

      active =
        true

    where
      id =
      v_career_category_id;

  end if;


  -- =======================================================
  -- 4. PRACTICUM CATEGORY
  -- =======================================================

  select
    id
  into
    v_practicum_category_id
  from public.service_categories
  where slug =
    'practicum-placement'
  limit 1;


  if
    v_practicum_category_id is null
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
      'practicum-placement',

      'Practicum & Placement',

      'Teaching practicum forms, placement support and related documentation.',

      'school',

      80,

      true
    )
    returning
      id
    into
      v_practicum_category_id;

  else

    update public.service_categories

    set
      name =
        'Practicum & Placement',

      description =
        'Teaching practicum forms, placement support and related documentation.',

      icon_key =
        'school',

      display_order =
        80,

      active =
        true

    where
      id =
      v_practicum_category_id;

  end if;


  -- =======================================================
  -- 5. RESULTS / APPLICATIONS CATEGORY
  -- =======================================================

  select
    id
  into
    v_results_category_id
  from public.service_categories
  where slug =
    'results-applications'
  limit 1;


  if
    v_results_category_id is null
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
      'results-applications',

      'Results & Applications',

      'Examination results, school placement, nursing placement and security service application assistance.',

      'clipboard-check',

      85,

      true
    )
    returning
      id
    into
      v_results_category_id;

  else

    update public.service_categories

    set
      name =
        'Results & Applications',

      description =
        'Examination results, school placement, nursing placement and security service application assistance.',

      icon_key =
        'clipboard-check',

      display_order =
        85,

      active =
        true

    where
      id =
      v_results_category_id;

  end if;


  -- =======================================================
  -- 6. AFFIDAVIT SERVICE
  -- =======================================================

  select
    id
  into
    v_affidavit_service_id
  from public.services
  where slug =
    'affidavit'
  order by
    created_at asc
  limit 1;


  if
    v_affidavit_service_id is null
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

      v_legal_category_id,

      'general',

      'affidavit',

      'Affidavit',

      'Affidavit',

      'Affidavit preparation support for date-of-birth correction, name correction and other declaration purposes.',

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
      v_affidavit_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_legal_category_id,

      service_scope =
        'general',

      name =
        'Affidavit',

      short_name =
        'Affidavit',

      description =
        'Affidavit preparation support for date-of-birth correction, name correction and other declaration purposes.',

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
      v_affidavit_service_id;

  end if;


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
    v_affidavit_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The final cost will be confirmed after the affidavit requirements have been reviewed.',

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


  -- -------------------------------------------------------
  -- AFFIDAVIT TYPE
  -- -------------------------------------------------------

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
    v_affidavit_service_id,

    'affidavit_type',

    'Affidavit Type',

    'select',

    'Select the main reason for the affidavit.',

    true,

    jsonb_build_array(
      'Date of Birth Correction',
      'Name Correction',
      'Loss of Document',
      'Declaration / Confirmation'
    ),

    true,

    'Other',

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
    v_affidavit_type_id;


  -- -------------------------------------------------------
  -- INCORRECT DATE OF BIRTH
  -- -------------------------------------------------------

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_affidavit_service_id,

    'incorrect_date_of_birth',

    'Incorrect Date of Birth',

    'date',

    'Enter the incorrect date currently appearing on the affected record.',

    true,

    v_affidavit_type_id,

    'EQUALS',

    to_jsonb(
      'Date of Birth Correction'::text
    ),

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

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- -------------------------------------------------------
  -- CORRECT DATE OF BIRTH
  -- -------------------------------------------------------

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_affidavit_service_id,

    'correct_date_of_birth',

    'Correct Date of Birth',

    'date',

    'Enter the correct date of birth to be declared.',

    true,

    v_affidavit_type_id,

    'EQUALS',

    to_jsonb(
      'Date of Birth Correction'::text
    ),

    '{}'::jsonb,

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

    help_text =
      excluded.help_text,

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- -------------------------------------------------------
  -- INCORRECT NAME
  -- -------------------------------------------------------

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_affidavit_service_id,

    'incorrect_name',

    'Incorrect / Current Name',

    'text',

    'Enter the name currently appearing on the record',

    true,

    v_affidavit_type_id,

    'EQUALS',

    to_jsonb(
      'Name Correction'::text
    ),

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- -------------------------------------------------------
  -- CORRECT NAME
  -- -------------------------------------------------------

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_affidavit_service_id,

    'correct_name',

    'Correct Name',

    'text',

    'Enter the correct name',

    true,

    v_affidavit_type_id,

    'EQUALS',

    to_jsonb(
      'Name Correction'::text
    ),

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- -------------------------------------------------------
  -- PURPOSE / DETAILS
  -- -------------------------------------------------------

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
    v_affidavit_service_id,

    'affidavit_purpose',

    'Purpose / Details',

    'textarea',

    'Explain what the affidavit will be used for and the correction or declaration required.',

    'Provide enough information for the request to be reviewed correctly.',

    true,

    jsonb_build_object(
      'minLength',
      10,

      'maxLength',
      2000
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


  -- -------------------------------------------------------
  -- IDENTIFICATION
  -- -------------------------------------------------------

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
    v_affidavit_service_id,

    'affidavit_identification',

    'Identification Document',

    'document',

    'Upload a relevant identification document such as a Ghana Card or passport where applicable.',

    false,

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


  -- -------------------------------------------------------
  -- SUPPORTING EVIDENCE
  -- -------------------------------------------------------

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
    v_affidavit_service_id,

    'affidavit_supporting_documents',

    'Supporting Documents',

    'file',

    'Upload any certificate, result slip, birth certificate or other record supporting the declaration.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10
    ),

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

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 7. GAZETTE SERVICE
  -- =======================================================

  select
    id
  into
    v_gazette_service_id
  from public.services
  where slug =
    'gazette'
  order by
    created_at asc
  limit 1;


  if
    v_gazette_service_id is null
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

      v_legal_category_id,

      'general',

      'gazette',

      'Gazette Publication',

      'Gazette',

      'Gazette publication and correction support for name and personal-record changes.',

      'other',

      'dynamic',

      20,

      true,

      null,

      true
    )
    returning
      id
    into
      v_gazette_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_legal_category_id,

      service_scope =
        'general',

      name =
        'Gazette Publication',

      short_name =
        'Gazette',

      description =
        'Gazette publication and correction support for name and personal-record changes.',

      category =
        'other',

      form_type =
        'dynamic',

      display_order =
        20,

      featured =
        true,

      active =
        true

    where
      id =
      v_gazette_service_id;

  end if;


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
    v_gazette_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The applicable cost will be confirmed after the publication requirements are reviewed.',

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
    v_gazette_service_id,

    'gazette_type',

    'Gazette Request Type',

    'select',

    'Select the type of publication or correction required.',

    true,

    jsonb_build_array(
      'Change of Name',
      'Correction of Name',
      'Date of Birth Correction'
    ),

    true,

    'Other',

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
    v_gazette_type_id;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_gazette_service_id,

    'gazette_old_name',

    'Current / Previous Name',

    'text',

    'Enter the name currently in use',

    true,

    v_gazette_type_id,

    'IN',

    jsonb_build_array(
      'Change of Name',
      'Correction of Name'
    ),

    jsonb_build_object(
      'maxLength',
      250
    ),

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

    placeholder =
      excluded.placeholder,

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_gazette_service_id,

    'gazette_new_name',

    'New / Correct Name',

    'text',

    'Enter the new or corrected name',

    true,

    v_gazette_type_id,

    'IN',

    jsonb_build_array(
      'Change of Name',
      'Correction of Name'
    ),

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_gazette_service_id,

    'gazette_incorrect_dob',

    'Incorrect Date of Birth',

    'date',

    null,

    true,

    v_gazette_type_id,

    'EQUALS',

    to_jsonb(
      'Date of Birth Correction'::text
    ),

    '{}'::jsonb,

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

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_gazette_service_id,

    'gazette_correct_dob',

    'Correct Date of Birth',

    'date',

    true,

    v_gazette_type_id,

    'EQUALS',

    to_jsonb(
      'Date of Birth Correction'::text
    ),

    '{}'::jsonb,

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

    required =
      excluded.required,

    condition_field_id =
      excluded.condition_field_id,

    condition_operator =
      excluded.condition_operator,

    condition_value =
      excluded.condition_value,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_gazette_service_id,

    'gazette_reason',

    'Reason / Purpose',

    'textarea',

    'Explain why the publication or correction is required.',

    null,

    true,

    jsonb_build_object(
      'minLength',
      10,

      'maxLength',
      2000
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_gazette_service_id,

    'gazette_documents',

    'Supporting Documents',

    'document',

    'Upload identification and relevant supporting records.',

    true,

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
        'image/webp'
      )
    ),

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
  -- 8. STUDY ABROAD SERVICE
  -- =======================================================

  select
    id
  into
    v_study_abroad_service_id
  from public.services
  where slug =
    'study-abroad-support'
  order by
    created_at asc
  limit 1;


  if
    v_study_abroad_service_id is null
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

      v_study_abroad_category_id,

      'general',

      'study-abroad-support',

      'Study Abroad Application Support',

      'Study Abroad',

      'University and programme search, application guidance and international study support.',

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
      v_study_abroad_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_study_abroad_category_id,

      service_scope =
        'general',

      name =
        'Study Abroad Application Support',

      short_name =
        'Study Abroad',

      description =
        'University and programme search, application guidance and international study support.',

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
      v_study_abroad_service_id;

  end if;


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
    v_study_abroad_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The final service fee depends on the countries, institutions and level of application support required.',

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
    v_study_abroad_service_id,

    'study_level',

    'Intended Level of Study',

    'select',

    null,

    true,

    jsonb_build_array(
      'Undergraduate',
      'Postgraduate Diploma',
      'Masters',
      'MPhil',
      'PhD'
    ),

    true,

    'Other',

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
      true;


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
    v_study_abroad_service_id,

    'current_qualification',

    'Current / Highest Qualification',

    'text',

    'e.g. BSc Computer Engineering',

    'Enter your completed or current qualification.',

    true,

    jsonb_build_object(
      'maxLength',
      250
    ),

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
    v_study_abroad_service_id,

    'current_institution',

    'Current / Previous Institution',

    'text',

    'Enter institution name',

    null,

    true,

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_study_abroad_service_id,

    'current_cgpa',

    'CGPA / Class / Academic Result',

    'text',

    'e.g. 3.45 / 4.00 or Second Class Upper',

    'Enter the result using the grading system of your institution.',

    true,

    jsonb_build_object(
      'maxLength',
      100
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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_study_abroad_service_id,

    'programme_of_interest',

    'Programme / Course of Interest',

    'text',

    'e.g. MSc Project Management',

    true,

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_study_abroad_service_id,

    'preferred_countries',

    'Preferred Countries',

    'multi_select',

    'Select all countries you are considering. Administrators can modify this list from the form builder.',

    true,

    jsonb_build_array(
      'United Kingdom',
      'Canada',
      'United States',
      'Germany',
      'Australia',
      'Ireland',
      'France',
      'Netherlands'
    ),

    true,

    'Other Country',

    '{}'::jsonb,

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
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_study_abroad_service_id,

    'preferred_intake',

    'Preferred Intake',

    'text',

    'e.g. September 2027',

    false,

    jsonb_build_object(
      'maxLength',
      100
    ),

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
    v_study_abroad_service_id,

    'study_abroad_support_needed',

    'Support Needed',

    'multi_select',

    null,

    true,

    jsonb_build_array(
      'University Search',
      'Programme Search',
      'Application Support',
      'Statement / Application Review',
      'Scholarship Search',
      'Document Preparation Guidance',
      'Visa Documentation Guidance'
    ),

    true,

    'Other Support',

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
      true;


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
    v_study_abroad_service_id,

    'study_abroad_documents',

    'Academic / Application Documents',

    'document',

    'Optionally upload transcripts, certificates, CV or other relevant documents.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10
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
  -- 9. JOB SEEKERS
  -- =======================================================

  select
    id
  into
    v_job_seekers_service_id
  from public.services
  where slug =
    'job-seekers'
  order by
    created_at asc
  limit 1;


  if
    v_job_seekers_service_id is null
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

      v_career_category_id,

      'general',

      'job-seekers',

      'Job Seekers',

      'Job Seekers',

      'Register your qualification, programme, skills and employment interests for job opportunity support.',

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
      v_job_seekers_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_career_category_id,

      service_scope =
        'general',

      name =
        'Job Seekers',

      short_name =
        'Job Seekers',

      description =
        'Register your qualification, programme, skills and employment interests for job opportunity support.',

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
      v_job_seekers_service_id;

  end if;


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
    v_job_seekers_service_id,

    'FREE',

    'GHS',

    0,

    null,

    null,

    null,

    'Job seeker registration currently has no service fee.',

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
      0,

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_job_seekers_service_id,

    'job_programme',

    'Programme / Qualification',

    'text',

    'e.g. BSc Computer Engineering',

    true,

    jsonb_build_object(
      'maxLength',
      250
    ),

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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_job_seekers_service_id,

    'job_institution',

    'Institution',

    'text',

    'Enter institution name',

    false,

    jsonb_build_object(
      'maxLength',
      250
    ),

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
    v_job_seekers_service_id,

    'job_skills',

    'Skills',

    'textarea',

    'List your technical, professional and interpersonal skills.',

    'Separate skills with commas or short lines.',

    true,

    jsonb_build_object(
      'minLength',
      3,

      'maxLength',
      2000
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

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_job_seekers_service_id,

    'job_interests',

    'Preferred Roles / Job Interests',

    'textarea',

    'e.g. Software Engineer, Project Officer, Data Analyst',

    true,

    jsonb_build_object(
      'maxLength',
      1500
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_job_seekers_service_id,

    'employment_status',

    'Current Employment Status',

    'select',

    true,

    jsonb_build_array(
      'Student',
      'National Service Personnel',
      'Unemployed',
      'Employed but Seeking Opportunities',
      'Self-Employed'
    ),

    '{}'::jsonb,

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

    required =
      excluded.required,

    options =
      excluded.options,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_job_seekers_service_id,

    'job_cv',

    'CV / Résumé',

    'document',

    'Upload your current CV if available.',

    false,

    jsonb_build_object(
      'maxFiles',
      1,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
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
  -- 10. TEACHING PRACTICUM
  -- =======================================================

  select
    id
  into
    v_practicum_service_id
  from public.services
  where slug =
    'teaching-practicum'
  order by
    created_at asc
  limit 1;


  if
    v_practicum_service_id is null
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

      v_practicum_category_id,

      'general',

      'teaching-practicum',

      'Teaching Practicum',

      'Teaching Practicum',

      'Teaching practicum forms, document submission and placement support.',

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
      v_practicum_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_practicum_category_id,

      service_scope =
        'general',

      name =
        'Teaching Practicum',

      short_name =
        'Teaching Practicum',

      description =
        'Teaching practicum forms, document submission and placement support.',

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
      v_practicum_service_id;

  end if;


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
    v_practicum_service_id,

    'FREE',

    'GHS',

    0,

    null,

    null,

    null,

    'Practicum form submission currently has no service fee.',

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
      0,

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_practicum_service_id,

    'practicum_institution',

    'Institution',

    'text',

    'Enter your university or institution',

    true,

    jsonb_build_object(
      'maxLength',
      250
    ),

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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_practicum_service_id,

    'practicum_programme',

    'Programme',

    'text',

    'Enter your programme',

    true,

    jsonb_build_object(
      'maxLength',
      250
    ),

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_practicum_service_id,

    'practicum_location',

    'Preferred Practicum Location',

    'text',

    'Town, district, region or preferred school',

    false,

    jsonb_build_object(
      'maxLength',
      300
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_practicum_service_id,

    'practicum_form',

    'Completed Practicum Form',

    'document',

    'Download the applicable form, complete your section and upload it here. You may also use the email fallback and send it to seekersconnect247@gmail.com.',

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
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
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
    v_practicum_service_id,

    'practicum_deadline',

    'Submission / Reporting Deadline',

    'date',

    null,

    false,

    '{}'::jsonb,

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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- 11. BECE / WASSCE RESULTS
  -- =======================================================

  select
    id
  into
    v_results_service_id
  from public.services
  where slug =
    'bece-wassce-results'
  order by
    created_at asc
  limit 1;


  if
    v_results_service_id is null
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

      v_results_category_id,

      'general',

      'bece-wassce-results',

      'BECE / WASSCE Results',

      'BECE / WASSCE Results',

      'Assistance with BECE and WASSCE result-related requests.',

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
      v_results_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_results_category_id,

      service_scope =
        'general',

      name =
        'BECE / WASSCE Results',

      short_name =
        'BECE / WASSCE Results',

      description =
        'Assistance with BECE and WASSCE result-related requests.',

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
      v_results_service_id;

  end if;


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
    v_results_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The applicable fee will be confirmed after the result request is reviewed.',

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_results_service_id,

    'exam_type',

    'Examination',

    'radio',

    true,

    jsonb_build_array(
      'BECE',
      'WASSCE'
    ),

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

    required =
      excluded.required,

    options =
      excluded.options,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true

  returning
    id
  into
    v_exam_type_id;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_results_service_id,

    'exam_year',

    'Examination Year',

    'number',

    'e.g. 2025',

    true,

    jsonb_build_object(
      'min',
      1980,

      'max',
      2100
    ),

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_results_service_id,

    'exam_index_number',

    'Index Number',

    'text',

    'Enter examination index number',

    true,

    jsonb_build_object(
      'maxLength',
      100
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_results_service_id,

    'exam_school',

    'School / Examination Centre',

    'text',

    'Enter school or centre if known',

    false,

    jsonb_build_object(
      'maxLength',
      250
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    allow_other,
    other_label,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_results_service_id,

    'result_service_needed',

    'Assistance Needed',

    'select',

    true,

    jsonb_build_array(
      'Result Checking',
      'Result Printing',
      'Result Verification Support'
    ),

    true,

    'Other',

    '{}'::jsonb,

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
      true;


  -- =======================================================
  -- 12. SCHOOL / NURSING PLACEMENT
  -- =======================================================

  select
    id
  into
    v_placement_service_id
  from public.services
  where slug =
    'school-nursing-placement'
  order by
    created_at asc
  limit 1;


  if
    v_placement_service_id is null
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

      v_results_category_id,

      'general',

      'school-nursing-placement',

      'School & Nursing Placement',

      'Placement',

      'Support with school placement and nursing training placement-related requests.',

      'other',

      'dynamic',

      20,

      true,

      null,

      true
    )
    returning
      id
    into
      v_placement_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_results_category_id,

      service_scope =
        'general',

      name =
        'School & Nursing Placement',

      short_name =
        'Placement',

      description =
        'Support with school placement and nursing training placement-related requests.',

      category =
        'other',

      form_type =
        'dynamic',

      display_order =
        20,

      featured =
        true,

      active =
        true

    where
      id =
      v_placement_service_id;

  end if;


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
    v_placement_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The applicable service fee will be confirmed after reviewing the placement request.',

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

    display_note =
      excluded.display_note,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    allow_other,
    other_label,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_placement_service_id,

    'placement_type',

    'Placement Type',

    'radio',

    true,

    jsonb_build_array(
      'SHS / School Placement',
      'Nursing Training Placement'
    ),

    true,

    'Other',

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
    v_placement_type_id;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_placement_service_id,

    'placement_reference',

    'Index / Application Number',

    'text',

    'Enter relevant index or application number',

    true,

    jsonb_build_object(
      'maxLength',
      120
    ),

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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_placement_service_id,

    'placement_year',

    'Placement / Admission Year',

    'number',

    'e.g. 2026',

    true,

    jsonb_build_object(
      'min',
      2000,

      'max',
      2100
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_placement_service_id,

    'preferred_institutions',

    'Preferred Institutions / Schools',

    'textarea',

    'List your preferred schools or institutions.',

    null,

    false,

    jsonb_build_object(
      'maxLength',
      1500
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
    v_placement_service_id,

    'placement_documents',

    'Supporting Documents',

    'document',

    'Upload result slips, placement information or other relevant documents if available.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10
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
  -- 13. SECURITY SERVICE APPLICATIONS
  -- =======================================================

  select
    id
  into
    v_security_service_id
  from public.services
  where slug =
    'security-service-applications'
  order by
    created_at asc
  limit 1;


  if
    v_security_service_id is null
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

      v_results_category_id,

      'general',

      'security-service-applications',

      'Security Service Applications',

      'Security Applications',

      'Application support for Ghana security services and related recruitment processes.',

      'other',

      'dynamic',

      30,

      true,

      null,

      true
    )
    returning
      id
    into
      v_security_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_results_category_id,

      service_scope =
        'general',

      name =
        'Security Service Applications',

      short_name =
        'Security Applications',

      description =
        'Application support for Ghana security services and related recruitment processes.',

      category =
        'other',

      form_type =
        'dynamic',

      display_order =
        30,

      featured =
        true,

      active =
        true

    where
      id =
      v_security_service_id;

  end if;


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
    v_security_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The applicable service fee will be confirmed after the application requirements are reviewed.',

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

    display_note =
      excluded.display_note,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    allow_other,
    other_label,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_security_service_id,

    'security_agency',

    'Security Service / Agency',

    'select',

    true,

    jsonb_build_array(
      'Ghana Police Service',
      'Ghana National Fire Service',
      'Ghana Immigration Service',
      'Ghana Prisons Service',
      'Ghana Armed Forces'
    ),

    true,

    'Other',

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
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    required,
    options,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_security_service_id,

    'security_application_type',

    'Application Support Type',

    'select',

    true,

    jsonb_build_array(
      'New Application',
      'Application Review',
      'Document Preparation Support',
      'Application Status / Follow-up Support'
    ),

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

    required =
      excluded.required,

    options =
      excluded.options,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_security_service_id,

    'security_education_level',

    'Highest Educational Qualification',

    'text',

    'e.g. WASSCE, Diploma, Degree',

    true,

    jsonb_build_object(
      'maxLength',
      200
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_security_service_id,

    'security_date_of_birth',

    'Date of Birth',

    'date',

    null,

    true,

    '{}'::jsonb,

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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_security_service_id,

    'security_ghana_card_number',

    'Ghana Card Number',

    'text',

    'GHA-XXXXXXXXX-X',

    'Enter the identification number only. Do not enter any OTP, password or authentication code.',

    false,

    jsonb_build_object(
      'maxLength',
      30
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


  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    placeholder,
    required,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_security_service_id,

    'security_application_reference',

    'Application Reference Number',

    'text',

    'Enter reference number if an application already exists',

    false,

    jsonb_build_object(
      'maxLength',
      150
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


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
    v_security_service_id,

    'security_documents',

    'Application Documents',

    'document',

    'Upload relevant certificates, ID documents or application materials where required.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10
    ),

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
    v_security_service_id,

    'security_notes',

    'Additional Information',

    'textarea',

    'Describe the assistance you require.',

    'Do not include passwords, OTPs, PINs or other authentication credentials.',

    false,

    jsonb_build_object(
      'maxLength',
      2000
    ),

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

end
$$;