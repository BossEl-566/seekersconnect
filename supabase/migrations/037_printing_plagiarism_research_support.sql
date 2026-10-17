-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13G
--
-- PRINTING
-- PLAGIARISM / SIMILARITY CHECK
-- RESEARCH GUIDANCE
-- =========================================================


do $$
declare

  -- =======================================================
  -- CATEGORIES
  -- =======================================================

  v_printing_category_id uuid;

  v_academic_support_category_id uuid;


  -- =======================================================
  -- SERVICES
  -- =======================================================

  v_printing_service_id uuid;

  v_plagiarism_service_id uuid;

  v_research_service_id uuid;


  -- =======================================================
  -- PRINTING PRICING
  -- =======================================================

  v_printing_pricing_id uuid;

  v_bw_option_id uuid;

  v_colour_option_id uuid;


  -- =======================================================
  -- PRINTING CONDITIONS
  -- =======================================================

  v_binding_required_id uuid;

begin

  -- =======================================================
  -- 1. PRINTING CATEGORY
  -- =======================================================

  select
    id
  into
    v_printing_category_id
  from public.service_categories
  where slug =
    'printing-document-services'
  limit 1;


  if
    v_printing_category_id is null
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
      'printing-document-services',

      'Printing & Document Services',

      'Printing, document preparation and related physical document services.',

      'printer',

      50,

      true
    )
    returning
      id
    into
      v_printing_category_id;

  else

    update public.service_categories

    set
      name =
        'Printing & Document Services',

      description =
        'Printing, document preparation and related physical document services.',

      icon_key =
        'printer',

      display_order =
        50,

      active =
        true

    where
      id =
      v_printing_category_id;

  end if;


  -- =======================================================
  -- 2. ACADEMIC SUPPORT CATEGORY
  -- =======================================================

  select
    id
  into
    v_academic_support_category_id
  from public.service_categories
  where slug =
    'academic-support'
  limit 1;


  if
    v_academic_support_category_id is null
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
      'academic-support',

      'Academic Support',

      'Academic review, plagiarism checking and research consultation services.',

      'book-open',

      55,

      true
    )
    returning
      id
    into
      v_academic_support_category_id;

  else

    update public.service_categories

    set
      name =
        'Academic Support',

      description =
        'Academic review, plagiarism checking and research consultation services.',

      icon_key =
        'book-open',

      display_order =
        55,

      active =
        true

    where
      id =
      v_academic_support_category_id;

  end if;


  -- =======================================================
  -- 3. PRINTING SERVICE
  -- =======================================================

  select
    id
  into
    v_printing_service_id
  from public.services
  where slug =
    'printing'
  order by
    created_at asc
  limit 1;


  if
    v_printing_service_id is null
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

      v_printing_category_id,

      'general',

      'printing',

      'Printing',

      'Printing',

      'Upload your document and request black-and-white or colour printing, binding and related finishing services.',

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
      v_printing_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_printing_category_id,

      service_scope =
        'general',

      name =
        'Printing',

      short_name =
        'Printing',

      description =
        'Upload your document and request black-and-white or colour printing, binding and related finishing services.',

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
      v_printing_service_id;

  end if;


  -- =======================================================
  -- 4. PRINTING PRICING
  --
  -- Provided business rates:
  --
  -- Black & White: GHS 0.35 / printed page
  -- Colour:          GHS 0.50 / printed page
  --
  -- The selected option and quantity are revalidated
  -- server-side by the pricing engine.
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
    v_printing_service_id,

    'PER_UNIT',

    'GHS',

    0.35,

    'printed page',

    1,

    null,

    'Enter the total number of printed pages required, including all copies. Binding or special finishing may require additional confirmation.',

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
      excluded.amount,

    unit_label =
      excluded.unit_label,

    minimum_quantity =
      excluded.minimum_quantity,

    maximum_quantity =
      excluded.maximum_quantity,

    display_note =
      excluded.display_note,

    active =
      true

  returning
    id
  into
    v_printing_pricing_id;


  -- =======================================================
  -- CLEAN OLD PRINTING OPTIONS / TIERS
  -- =======================================================

  delete from public.service_pricing_tiers
  where pricing_option_id in (
    select
      id
    from public.service_pricing_options
    where service_pricing_id =
      v_printing_pricing_id
  );


  delete from public.service_pricing_options
  where service_pricing_id =
    v_printing_pricing_id;


  -- =======================================================
  -- BLACK & WHITE OPTION
  -- =======================================================

  insert into public.service_pricing_options (
    service_pricing_id,
    code,
    label,
    description,
    unit_label,
    display_order,
    active
  )
  values (
    v_printing_pricing_id,

    'black-white',

    'Black & White Printing',

    'Black-and-white document printing.',

    'printed page',

    10,

    true
  )
  returning
    id
  into
    v_bw_option_id;


  insert into public.service_pricing_tiers (
    pricing_option_id,
    label,
    amount,
    minimum_quantity,
    maximum_quantity,
    display_order,
    active
  )
  values (
    v_bw_option_id,

    'Black & White',

    0.35,

    1,

    null,

    10,

    true
  );


  -- =======================================================
  -- COLOUR OPTION
  -- =======================================================

  insert into public.service_pricing_options (
    service_pricing_id,
    code,
    label,
    description,
    unit_label,
    display_order,
    active
  )
  values (
    v_printing_pricing_id,

    'colour',

    'Colour Printing',

    'Full-colour document printing.',

    'printed page',

    20,

    true
  )
  returning
    id
  into
    v_colour_option_id;


  insert into public.service_pricing_tiers (
    pricing_option_id,
    label,
    amount,
    minimum_quantity,
    maximum_quantity,
    display_order,
    active
  )
  values (
    v_colour_option_id,

    'Colour',

    0.50,

    1,

    null,

    10,

    true
  );


  -- =======================================================
  -- 5. PRINTING FORM — JOB TYPE
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
    validation_rules,
    sort_order,
    active
  )
  values (
    v_printing_service_id,

    'print_job_type',

    'What are you printing?',

    'select',

    null,

    'Select the type of document or printing job.',

    true,

    jsonb_build_array(
      'Loose Pages',
      'Assignment / Report',
      'Project / Thesis',
      'Book / Booklet',
      'Flyer / Handout',
      'Other'
    ),

    false,

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

    help_text =
      excluded.help_text,

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


  -- =======================================================
  -- PRINT DOCUMENT
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
    v_printing_service_id,

    'print_document',

    'Document to Print',

    'document',

    'Upload the document to be printed. PDF is preferred when the layout must remain exactly as submitted.',

    true,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
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
  -- PAPER SIZE
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
    v_printing_service_id,

    'paper_size',

    'Paper Size',

    'select',

    null,

    true,

    jsonb_build_array(
      'A4',
      'A3'
    ),

    true,

    'Other Size',

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
  -- NUMBER OF COPIES
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
    v_printing_service_id,

    'number_of_copies',

    'Number of Copies',

    'number',

    'e.g. 2',

    'Enter how many complete copies of the uploaded document you require.',

    true,

    jsonb_build_object(
      'min',
      1,
      'max',
      1000
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
  -- SINGLE / DOUBLE SIDED
  -- =======================================================

  insert into public.service_form_fields (
    service_id,
    field_key,
    label,
    field_type,
    help_text,
    required,
    options,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_printing_service_id,

    'print_sides',

    'Print Sides',

    'radio',

    null,

    true,

    jsonb_build_array(
      'Single-Sided',
      'Double-Sided'
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


  -- =======================================================
  -- BINDING REQUIRED
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
    v_printing_service_id,

    'binding_required',

    'I need binding or finishing',

    'checkbox',

    'Select this if the printed document should be bound or specially finished.',

    false,

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

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true

  returning
    id
  into
    v_binding_required_id;


  -- =======================================================
  -- BINDING TYPE — CONDITIONAL
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
    condition_field_id,
    condition_operator,
    condition_value,
    validation_rules,
    sort_order,
    active
  )
  values (
    v_printing_service_id,

    'binding_type',

    'Binding / Finishing Type',

    'select',

    'Select the preferred finishing method.',

    true,

    jsonb_build_array(
      'Comb Binding',
      'Spiral Binding',
      'Tape Binding',
      'Hard Cover',
      'Stapling'
    ),

    true,

    'Other',

    v_binding_required_id,

    'IS_CHECKED',

    'true'::jsonb,

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

    options =
      excluded.options,

    allow_other =
      excluded.allow_other,

    other_label =
      excluded.other_label,

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


  -- =======================================================
  -- PRINTING NOTES
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
    v_printing_service_id,

    'printing_instructions',

    'Printing Instructions',

    'textarea',

    'e.g. print specific pages, cover page instructions, binding notes...',

    'Add any instructions the printing team should know.',

    false,

    jsonb_build_object(
      'maxLength',
      1500
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


  -- =======================================================
  -- 6. PLAGIARISM SERVICE
  -- =======================================================

  select
    id
  into
    v_plagiarism_service_id
  from public.services
  where slug =
    'plagiarism-check'
  order by
    created_at asc
  limit 1;


  if
    v_plagiarism_service_id is null
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

      v_academic_support_category_id,

      'general',

      'plagiarism-check',

      'Plagiarism / Similarity Check',

      'Plagiarism Check',

      'Submit academic work for plagiarism or similarity checking and review support.',

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
      v_plagiarism_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_academic_support_category_id,

      service_scope =
        'general',

      name =
        'Plagiarism / Similarity Check',

      short_name =
        'Plagiarism Check',

      description =
        'Submit academic work for plagiarism or similarity checking and review support.',

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
      v_plagiarism_service_id;

  end if;


  -- =======================================================
  -- PLAGIARISM PRICING
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
    v_plagiarism_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The applicable fee will be confirmed after the document and service requirements are reviewed.',

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
  -- PLAGIARISM — DOCUMENT TYPE
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
    v_plagiarism_service_id,

    'document_type',

    'Document Type',

    'select',

    'Select the type of work being submitted.',

    true,

    jsonb_build_array(
      'Assignment',
      'Report',
      'Research Proposal',
      'Research Project',
      'Thesis / Dissertation',
      'Research Paper / Article'
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
      true;


  -- =======================================================
  -- PLAGIARISM DOCUMENT
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
    v_plagiarism_service_id,

    'plagiarism_document',

    'Document for Checking',

    'document',

    'Upload the document to be checked. If the file is too large, use the email option shown below the upload field.',

    true,

    jsonb_build_object(
      'maxFiles',
      2,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
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
  -- ESTIMATED PAGE COUNT
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
    v_plagiarism_service_id,

    'estimated_pages',

    'Approximate Number of Pages',

    'number',

    'e.g. 65',

    'An approximate page count helps with reviewing the request.',

    false,

    jsonb_build_object(
      'min',
      1,
      'max',
      5000
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


  -- =======================================================
  -- DEADLINE
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
    v_plagiarism_service_id,

    'required_by',

    'When Do You Need the Result?',

    'date',

    'Enter the preferred completion date where applicable.',

    false,

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
  -- PLAGIARISM NOTES
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
    v_plagiarism_service_id,

    'plagiarism_notes',

    'Additional Instructions',

    'textarea',

    'Add any instructions for the document review.',

    null,

    false,

    jsonb_build_object(
      'maxLength',
      1500
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


  -- =======================================================
  -- 7. RESEARCH GUIDANCE SERVICE
  -- =======================================================

  select
    id
  into
    v_research_service_id
  from public.services
  where slug =
    'research-guidance'
  order by
    created_at asc
  limit 1;


  if
    v_research_service_id is null
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

      v_academic_support_category_id,

      'general',

      'research-guidance',

      'Thesis & Research Guidance',

      'Research Guidance',

      'Research guidance, topic development assistance, methodological support, review and academic consultation. Seekers Connect does not write academic work on behalf of students.',

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
      v_research_service_id;

  else

    update public.services

    set
      university_id =
        null,

      service_category_id =
        v_academic_support_category_id,

      service_scope =
        'general',

      name =
        'Thesis & Research Guidance',

      short_name =
        'Research Guidance',

      description =
        'Research guidance, topic development assistance, methodological support, review and academic consultation. Seekers Connect does not write academic work on behalf of students.',

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
      v_research_service_id;

  end if;


  -- =======================================================
  -- RESEARCH PRICING
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
    v_research_service_id,

    'QUOTE_REQUIRED',

    'GHS',

    null,

    null,

    null,

    null,

    'The consultation fee depends on the type and scope of research guidance required.',

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
  -- PROGRAMME LEVEL
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
    v_research_service_id,

    'programme_level',

    'Programme Level',

    'select',

    'Select your current academic level.',

    true,

    jsonb_build_array(
      'Diploma',
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


  -- =======================================================
  -- PROGRAMME / FIELD
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
    v_research_service_id,

    'programme_name',

    'Programme / Field of Study',

    'text',

    'e.g. Project Management',

    null,

    true,

    jsonb_build_object(
      'maxLength',
      200
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


  -- =======================================================
  -- RESEARCH STAGE
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
    v_research_service_id,

    'research_stage',

    'Current Research Stage',

    'select',

    'Select the stage that best describes your work.',

    true,

    jsonb_build_array(
      'Choosing a Topic',
      'Proposal Development',
      'Literature Review',
      'Methodology',
      'Data Collection',
      'Data Analysis',
      'Discussion / Findings',
      'Final Review',
      'Presentation / Viva Preparation'
    ),

    true,

    'Other',

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
  -- SUPPORT NEEDED
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
    v_research_service_id,

    'support_needed',

    'What Support Do You Need?',

    'multi_select',

    'Select all areas where you require academic guidance.',

    true,

    jsonb_build_array(
      'Topic Development',
      'Research Problem / Objectives',
      'Proposal Guidance',
      'Literature Review Guidance',
      'Methodology Guidance',
      'Questionnaire / Instrument Review',
      'Data Analysis Guidance',
      'Results Interpretation',
      'Academic Review / Feedback',
      'Presentation / Viva Preparation'
    ),

    true,

    'Other Support',

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


  -- =======================================================
  -- RESEARCH TOPIC
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
    v_research_service_id,

    'research_topic',

    'Current Research Topic',

    'textarea',

    'Enter your current topic, proposed topic or research area.',

    'If you do not yet have a topic, describe the area you are interested in.',

    false,

    jsonb_build_object(
      'maxLength',
      1000
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
  -- CURRENT RESEARCH DOCUMENTS
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
    v_research_service_id,

    'research_documents',

    'Current Research Documents',

    'document',

    'Optionally upload your proposal, draft chapter, questionnaire, supervisor comments or other relevant document.',

    false,

    jsonb_build_object(
      'maxFiles',
      5,

      'maxFileSizeMb',
      10,

      'accept',
      jsonb_build_array(
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
  -- DEADLINE
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
    v_research_service_id,

    'research_deadline',

    'Important Deadline',

    'date',

    'Enter a submission, supervisor meeting, presentation or other relevant deadline if one exists.',

    false,

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
  -- RESEARCH NOTES
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
    v_research_service_id,

    'research_notes',

    'Describe the Help You Need',

    'textarea',

    'Explain the problem, feedback received from your supervisor, or areas where you need guidance.',

    null,

    true,

    jsonb_build_object(
      'minLength',
      10,

      'maxLength',
      2500
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

    required =
      excluded.required,

    validation_rules =
      excluded.validation_rules,

    sort_order =
      excluded.sort_order,

    active =
      true;


  -- =======================================================
  -- ACADEMIC INTEGRITY ACKNOWLEDGEMENT
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
    v_research_service_id,

    'academic_integrity_acknowledgement',

    'I understand that Seekers Connect provides research guidance and consultation only and will not write or submit academic work on my behalf.',

    'checkbox',

    'Seekers Connect does not write a thesis, dissertation or research project on behalf of a student. The service provides research guidance, topic development assistance, methodological support, review and academic consultation. The student remains responsible for producing and submitting their own academic work.',

    true,

    '{}'::jsonb,

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


end
$$;