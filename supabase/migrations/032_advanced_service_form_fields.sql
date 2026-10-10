-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13C
-- ADVANCED DYNAMIC SERVICE FORM BUILDER
-- =========================================================


-- =========================================================
-- 1. ADD ADVANCED FIELD METADATA
-- =========================================================

alter table public.service_form_fields
  add column if not exists help_text text,

  add column if not exists allow_other boolean
    not null
    default false,

  add column if not exists other_label text,

  add column if not exists condition_field_id uuid
    references public.service_form_fields(id)
    on delete set null,

  add column if not exists condition_operator text,

  add column if not exists condition_value jsonb,

  add column if not exists validation_rules jsonb
    not null
    default '{}'::jsonb,

  add column if not exists updated_at timestamptz
    not null
    default now();


-- =========================================================
-- 2. REPLACE OLD FIELD TYPE CHECK
--
-- Original schema only allowed:
--
-- text
-- email
-- tel
-- number
-- date
-- textarea
-- select
--
-- We now support the generic form engine.
-- =========================================================

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select
      conname
    from pg_constraint
    where
      conrelid =
        'public.service_form_fields'::regclass

      and contype =
        'c'

      and pg_get_constraintdef(oid)
        ilike '%field_type%'
  loop
    execute format(
      'alter table public.service_form_fields drop constraint %I',
      constraint_record.conname
    );
  end loop;
end;
$$;


alter table public.service_form_fields
  add constraint service_form_fields_field_type_check
  check (
    field_type in (
      'text',
      'email',
      'tel',
      'number',
      'currency',
      'date',
      'textarea',

      'select',
      'radio',
      'checkbox',
      'multi_select',

      'file',
      'image',
      'document'
    )
  );


-- =========================================================
-- 3. CONDITIONAL OPERATORS
-- =========================================================

alter table public.service_form_fields
  drop constraint if exists
    service_form_fields_condition_operator_check;


alter table public.service_form_fields
  add constraint
    service_form_fields_condition_operator_check
  check (
    condition_operator is null

    or condition_operator in (
      'EQUALS',
      'NOT_EQUALS',

      'IN',
      'NOT_IN',

      'IS_CHECKED',
      'IS_NOT_CHECKED',

      'HAS_VALUE',
      'HAS_NO_VALUE'
    )
  );


-- =========================================================
-- 4. BASIC METADATA CHECKS
-- =========================================================

alter table public.service_form_fields
  drop constraint if exists
    service_form_fields_other_label_check;


alter table public.service_form_fields
  add constraint
    service_form_fields_other_label_check
  check (
    other_label is null

    or length(
      btrim(
        other_label
      )
    ) between 1 and 100
  );


alter table public.service_form_fields
  drop constraint if exists
    service_form_fields_help_text_check;


alter table public.service_form_fields
  add constraint
    service_form_fields_help_text_check
  check (
    help_text is null

    or length(
      help_text
    ) <= 1000
  );


-- =========================================================
-- 5. NORMALIZE / VALIDATE ADVANCED FIELD
-- =========================================================

create or replace function
public.normalize_service_form_field()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
declare
  parent_field record;

  option_item jsonb;

  option_text text;

  seen_options text[] :=
    array[]::text[];
begin

  -- -------------------------------------------------------
  -- NORMALIZE TEXT
  -- -------------------------------------------------------

  new.field_key :=
    lower(
      btrim(
        new.field_key
      )
    );


  new.field_key :=
    regexp_replace(
      new.field_key,
      '[^a-z0-9_]+',
      '_',
      'g'
    );


  new.field_key :=
    regexp_replace(
      new.field_key,
      '^_+|_+$',
      '',
      'g'
    );


  new.label :=
    btrim(
      new.label
    );


  new.placeholder :=
    nullif(
      btrim(
        coalesce(
          new.placeholder,
          ''
        )
      ),
      ''
    );


  new.help_text :=
    nullif(
      btrim(
        coalesce(
          new.help_text,
          ''
        )
      ),
      ''
    );


  new.other_label :=
    nullif(
      btrim(
        coalesce(
          new.other_label,
          ''
        )
      ),
      ''
    );


  new.condition_operator :=
    nullif(
      upper(
        btrim(
          coalesce(
            new.condition_operator,
            ''
          )
        )
      ),
      ''
    );


  new.updated_at :=
    now();


  -- -------------------------------------------------------
  -- REQUIRED BASIC DATA
  -- -------------------------------------------------------

  if
    new.field_key is null

    or new.field_key =
    ''
  then
    raise exception
      'Field key is required.';
  end if;


  if
    new.label is null

    or new.label =
    ''
  then
    raise exception
      'Field label is required.';
  end if;


  -- -------------------------------------------------------
  -- OPTIONS
  -- -------------------------------------------------------

  if
    new.field_type in (
      'select',
      'radio',
      'multi_select'
    )
  then

    if
      new.options is null

      or jsonb_typeof(
        new.options
      ) <>
      'array'
    then
      raise exception
        'This field type requires an options list.';
    end if;


    if
      jsonb_array_length(
        new.options
      ) =
      0
    then
      raise exception
        'Add at least one option.';
    end if;


    for option_item in

      select
        value

      from jsonb_array_elements(
        new.options
      )

    loop

      if
        jsonb_typeof(
          option_item
        ) <>
        'string'
      then
        raise exception
          'Field options must contain text values only.';
      end if;


      option_text :=
        btrim(
          option_item #>>
          '{}'
        );


      if
        option_text =
        ''
      then
        raise exception
          'Field options cannot contain blank values.';
      end if;


      if
        lower(
          option_text
        ) =
        any(
          seen_options
        )
      then
        raise exception
          'Field options cannot contain duplicates.';
      end if;


      seen_options :=
        array_append(
          seen_options,
          lower(
            option_text
          )
        );

    end loop;


  else

    new.options :=
      null;

  end if;


  -- -------------------------------------------------------
  -- OTHER OPTION
  -- -------------------------------------------------------

  if
    new.allow_other
  then

    if
      new.field_type not in (
        'select',
        'radio',
        'multi_select'
      )
    then
      raise exception
        '"Other" can only be enabled for select, radio or multi-select fields.';
    end if;


    if
      new.other_label is null
    then
      new.other_label :=
        'Other';
    end if;


  else

    new.other_label :=
      null;

  end if;


  -- -------------------------------------------------------
  -- CONDITIONAL FIELD
  -- -------------------------------------------------------

  if
    new.condition_field_id
    is null
  then

    new.condition_operator :=
      null;

    new.condition_value :=
      null;


  else

    if
      new.id is not null

      and

      new.condition_field_id =
      new.id
    then
      raise exception
        'A field cannot depend on itself.';
    end if;


    select
      id,
      service_id,
      field_type

    into
      parent_field

    from public.service_form_fields

    where
      id =
      new.condition_field_id

    limit 1;


    if
      not found
    then
      raise exception
        'Conditional parent field could not be found.';
    end if;


    if
      parent_field.service_id <>
      new.service_id
    then
      raise exception
        'Conditional fields must belong to the same service.';
    end if;


    if
      new.condition_operator
      is null
    then
      raise exception
        'Select a conditional operator.';
    end if;


    if
      new.condition_operator in (
        'EQUALS',
        'NOT_EQUALS',
        'IN',
        'NOT_IN'
      )

      and

      new.condition_value
      is null
    then
      raise exception
        'Conditional value is required.';
    end if;


    if
      new.condition_operator in (
        'IS_CHECKED',
        'IS_NOT_CHECKED',
        'HAS_VALUE',
        'HAS_NO_VALUE'
      )
    then
      new.condition_value :=
        null;
    end if;

  end if;


  -- -------------------------------------------------------
  -- VALIDATION RULES
  -- -------------------------------------------------------

  if
    new.validation_rules
    is null
  then
    new.validation_rules :=
      '{}'::jsonb;
  end if;


  if
    jsonb_typeof(
      new.validation_rules
    ) <>
    'object'
  then
    raise exception
      'Validation rules must be a JSON object.';
  end if;


  return new;
end;
$$;


drop trigger if exists
  normalize_service_form_field_trigger
on public.service_form_fields;


create trigger
  normalize_service_form_field_trigger
before insert or update
on public.service_form_fields
for each row
execute function
  public.normalize_service_form_field();


-- =========================================================
-- 6. INDEXES
-- =========================================================

create index if not exists
  service_form_fields_service_sort_idx
on public.service_form_fields (
  service_id,
  sort_order,
  created_at
);


create index if not exists
  service_form_fields_condition_idx
on public.service_form_fields (
  condition_field_id
)
where
  condition_field_id
  is not null;


-- =========================================================
-- 7. DOCUMENT FIELD CONFIGURATION
--
-- validation_rules will later support values such as:
--
-- {
--   "minLength": 3,
--   "maxLength": 100,
--   "min": 1,
--   "max": 1000,
--   "accept": ["application/pdf"],
--   "maxFiles": 3,
--   "maxFileSizeMb": 10
-- }
--
-- Actual file storage/upload handling belongs to Phase 13E.
-- =========================================================


-- =========================================================
-- 8. MIGRATE EXISTING OPTIONS
--
-- Existing select arrays remain valid.
-- All existing fields remain active and compatible.
-- =========================================================

update public.service_form_fields
set
  validation_rules =
    '{}'::jsonb
where
  validation_rules
  is null;


-- =========================================================
-- 9. COMMENTS
-- =========================================================

comment on column
public.service_form_fields.allow_other
is
'Allows a customer-defined Other value for select, radio and multi-select fields.';


comment on column
public.service_form_fields.condition_field_id
is
'Optional field whose response controls visibility of this field.';


comment on column
public.service_form_fields.condition_operator
is
'Operator used when evaluating conditional field visibility.';


comment on column
public.service_form_fields.condition_value
is
'JSON value used by conditional field operators such as EQUALS and IN.';


comment on column
public.service_form_fields.validation_rules
is
'Generic JSON validation configuration for dynamic service fields.';