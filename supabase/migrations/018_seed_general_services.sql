-- =========================================================
-- SEEKERS CONNECT 247
-- Phase 12A
-- General Errand, Delivery and Shopping Services
-- =========================================================


-- =========================================================
-- 1. INTERNAL GENERAL-SERVICE PROVIDER
-- =========================================================

insert into public.universities (
  code,
  name,
  location,
  active
)
values (
  'SC247',
  'Seekers Connect General Services',
  'Ghana',
  true
)
on conflict (code)
do update
set
  name = excluded.name,
  location = excluded.location,
  active = true;


-- =========================================================
-- 2. GENERAL SERVICES
-- =========================================================


-- ---------------------------------------------------------
-- RUN AN ERRAND
-- ---------------------------------------------------------

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type,
  active
)
select
  u.id,
  'run-an-errand',
  'Run an Errand',
  'Errand',
  'Let Seekers Connect handle a personal, campus or local errand on your behalf.',
  'other',
  'general_errand',
  true
from public.universities u
where u.code = 'SC247'
on conflict (university_id, slug)
do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  category = excluded.category,
  form_type = excluded.form_type,
  active = true;


-- ---------------------------------------------------------
-- PICKUP & DELIVERY
-- ---------------------------------------------------------

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type,
  active
)
select
  u.id,
  'pickup-delivery',
  'Pickup & Delivery',
  'Delivery',
  'Request pickup and delivery of documents, books, packages and other permitted items.',
  'other',
  'pickup_delivery',
  true
from public.universities u
where u.code = 'SC247'
on conflict (university_id, slug)
do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  category = excluded.category,
  form_type = excluded.form_type,
  active = true;


-- ---------------------------------------------------------
-- DOCUMENT ERRANDS
-- ---------------------------------------------------------

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type,
  active
)
select
  u.id,
  'document-errands',
  'Document Errands',
  'Documents',
  'Let us submit, collect, pick up or deliver documents from institutions, offices and organizations.',
  'other',
  'document_errand',
  true
from public.universities u
where u.code = 'SC247'
on conflict (university_id, slug)
do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  category = excluded.category,
  form_type = excluded.form_type,
  active = true;


-- ---------------------------------------------------------
-- SHOP FOR ME
-- ---------------------------------------------------------

insert into public.services (
  university_id,
  slug,
  name,
  short_name,
  description,
  category,
  form_type,
  active
)
select
  u.id,
  'shop-for-me',
  'Shop For Me',
  'Shopping',
  'Send us your shopping list for groceries, books, stationery and other permitted everyday items.',
  'other',
  'shop_for_me',
  true
from public.universities u
where u.code = 'SC247'
on conflict (university_id, slug)
do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  category = excluded.category,
  form_type = excluded.form_type,
  active = true;


-- =========================================================
-- 3. RUN AN ERRAND FORM
-- =========================================================

with service_row as (
  select s.id
  from public.services s
  join public.universities u
    on u.id = s.university_id
  where
    u.code = 'SC247'
    and s.slug = 'run-an-errand'
)
insert into public.service_form_fields (
  service_id,
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order,
  active
)
select
  service_row.id,
  values_row.field_key,
  values_row.label,
  values_row.field_type,
  values_row.placeholder,
  values_row.required,
  values_row.options,
  values_row.sort_order,
  true
from service_row
cross join (
  values
  (
    'errand_type',
    'Type of Errand',
    'select',
    null,
    true,
    '[
      "General Errand",
      "Pickup",
      "Drop-off",
      "Queue on My Behalf",
      "Purchase an Item",
      "Make an Enquiry",
      "Submit Something",
      "Collect Something",
      "Other"
    ]'::jsonb,
    10
  ),
  (
    'task_description',
    'What Should We Do?',
    'textarea',
    'Describe the errand clearly and include any important instructions.',
    true,
    null,
    20
  ),
  (
    'errand_location',
    'Where Should We Go?',
    'text',
    'Enter the location, shop, office, campus area or landmark.',
    true,
    null,
    30
  ),
  (
    'destination',
    'Destination / Final Location',
    'text',
    'Where should the item or result of the errand be taken?',
    false,
    null,
    40
  ),
  (
    'contact_person',
    'Contact Person at Location',
    'text',
    'Name of the person we should contact, if applicable.',
    false,
    null,
    50
  ),
  (
    'contact_phone',
    'Contact Person Phone',
    'tel',
    'e.g. 0240000000',
    false,
    null,
    60
  ),
  (
    'preferred_date',
    'Preferred Date',
    'date',
    null,
    false,
    null,
    70
  ),
  (
    'preferred_time',
    'Preferred Time',
    'text',
    'e.g. 2:00 PM',
    false,
    null,
    80
  )
) as values_row(
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order
)
on conflict (
  service_id,
  field_key
)
do update
set
  label = excluded.label,
  field_type = excluded.field_type,
  placeholder = excluded.placeholder,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order,
  active = true;


-- =========================================================
-- 4. PICKUP & DELIVERY FORM
-- =========================================================

with service_row as (
  select s.id
  from public.services s
  join public.universities u
    on u.id = s.university_id
  where
    u.code = 'SC247'
    and s.slug = 'pickup-delivery'
)
insert into public.service_form_fields (
  service_id,
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order,
  active
)
select
  service_row.id,
  values_row.field_key,
  values_row.label,
  values_row.field_type,
  values_row.placeholder,
  values_row.required,
  values_row.options,
  values_row.sort_order,
  true
from service_row
cross join (
  values
  (
    'item_type',
    'What Are We Delivering?',
    'select',
    null,
    true,
    '[
      "Document",
      "Book",
      "Stationery",
      "Package",
      "Food",
      "Personal Item",
      "Other"
    ]'::jsonb,
    10
  ),
  (
    'item_description',
    'Item Description',
    'textarea',
    'Describe the item so our team knows what to collect.',
    true,
    null,
    20
  ),
  (
    'pickup_location',
    'Pickup Location',
    'text',
    'Enter the pickup location or landmark.',
    true,
    null,
    30
  ),
  (
    'pickup_contact_name',
    'Pickup Contact Name',
    'text',
    'Who should our runner meet?',
    true,
    null,
    40
  ),
  (
    'pickup_contact_phone',
    'Pickup Contact Phone',
    'tel',
    'e.g. 0240000000',
    true,
    null,
    50
  ),
  (
    'delivery_location',
    'Delivery Location',
    'text',
    'Enter the delivery location or landmark.',
    true,
    null,
    60
  ),
  (
    'recipient_name',
    'Recipient Name',
    'text',
    'Who should receive the item?',
    true,
    null,
    70
  ),
  (
    'recipient_phone',
    'Recipient Phone',
    'tel',
    'e.g. 0240000000',
    true,
    null,
    80
  ),
  (
    'preferred_date',
    'Preferred Pickup Date',
    'date',
    null,
    false,
    null,
    90
  ),
  (
    'special_instructions',
    'Special Instructions',
    'textarea',
    'Add any information our pickup or delivery team should know.',
    false,
    null,
    100
  )
) as values_row(
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order
)
on conflict (
  service_id,
  field_key
)
do update
set
  label = excluded.label,
  field_type = excluded.field_type,
  placeholder = excluded.placeholder,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order,
  active = true;


-- =========================================================
-- 5. DOCUMENT ERRANDS FORM
-- =========================================================

with service_row as (
  select s.id
  from public.services s
  join public.universities u
    on u.id = s.university_id
  where
    u.code = 'SC247'
    and s.slug = 'document-errands'
)
insert into public.service_form_fields (
  service_id,
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order,
  active
)
select
  service_row.id,
  values_row.field_key,
  values_row.label,
  values_row.field_type,
  values_row.placeholder,
  values_row.required,
  values_row.options,
  values_row.sort_order,
  true
from service_row
cross join (
  values
  (
    'document_task',
    'What Should We Do?',
    'select',
    null,
    true,
    '[
      "Submit Document",
      "Collect Document",
      "Pickup Document",
      "Deliver Document",
      "Make Document Enquiry",
      "Other"
    ]'::jsonb,
    10
  ),
  (
    'document_type',
    'Document Type',
    'text',
    'e.g. Transcript, application letter, certificate, form.',
    true,
    null,
    20
  ),
  (
    'institution_office',
    'Institution / Office',
    'text',
    'Enter the university, organization or office involved.',
    true,
    null,
    30
  ),
  (
    'institution_location',
    'Location',
    'text',
    'Enter the institution or office location.',
    true,
    null,
    40
  ),
  (
    'reference_number',
    'Reference / Student / Application Number',
    'text',
    'Enter any number we may need when handling the document.',
    false,
    null,
    50
  ),
  (
    'collection_person',
    'Contact Person',
    'text',
    'Enter a contact person if one is available.',
    false,
    null,
    60
  ),
  (
    'collection_phone',
    'Contact Phone',
    'tel',
    'e.g. 0240000000',
    false,
    null,
    70
  ),
  (
    'instructions',
    'Instructions',
    'textarea',
    'Tell us exactly what should be done with the document.',
    true,
    null,
    80
  )
) as values_row(
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order
)
on conflict (
  service_id,
  field_key
)
do update
set
  label = excluded.label,
  field_type = excluded.field_type,
  placeholder = excluded.placeholder,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order,
  active = true;


-- =========================================================
-- 6. SHOP FOR ME FORM
-- =========================================================

with service_row as (
  select s.id
  from public.services s
  join public.universities u
    on u.id = s.university_id
  where
    u.code = 'SC247'
    and s.slug = 'shop-for-me'
)
insert into public.service_form_fields (
  service_id,
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order,
  active
)
select
  service_row.id,
  values_row.field_key,
  values_row.label,
  values_row.field_type,
  values_row.placeholder,
  values_row.required,
  values_row.options,
  values_row.sort_order,
  true
from service_row
cross join (
  values
  (
    'shopping_category',
    'Shopping Category',
    'select',
    null,
    true,
    '[
      "Groceries",
      "Books",
      "Stationery",
      "Other"
    ]'::jsonb,
    10
  ),
  (
    'shopping_list',
    'Shopping List',
    'textarea',
    'List the items you want us to buy, including quantity and useful details.',
    true,
    null,
    20
  ),
  (
    'preferred_shop',
    'Preferred Shop / Seller',
    'text',
    'Optional. Leave blank if we may choose where to buy the items.',
    false,
    null,
    30
  ),
  (
    'budget',
    'Estimated Budget',
    'text',
    'e.g. GHS 300',
    false,
    null,
    40
  ),
  (
    'preferred_date',
    'Preferred Date',
    'date',
    null,
    false,
    null,
    50
  ),
  (
    'shopping_notes',
    'Additional Instructions',
    'textarea',
    'Add brands, book editions, colours, sizes or alternatives.',
    false,
    null,
    60
  )
) as values_row(
  field_key,
  label,
  field_type,
  placeholder,
  required,
  options,
  sort_order
)
on conflict (
  service_id,
  field_key
)
do update
set
  label = excluded.label,
  field_type = excluded.field_type,
  placeholder = excluded.placeholder,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order,
  active = true;