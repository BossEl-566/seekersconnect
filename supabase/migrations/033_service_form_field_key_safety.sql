-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13C
-- FIELD KEY IMMUTABILITY SAFETY FIX
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

  -- =======================================================
  -- FIELD KEY
  --
  -- Field keys identify stored request answers.
  -- Once created, they must never silently change.
  -- =======================================================

  if
    tg_op =
    'INSERT'
  then

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

  else

    new.field_key :=
      old.field_key;

  end if;


  -- =======================================================
  -- NORMALIZE TEXT
  -- =======================================================

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


  -- =======================================================
  -- REQUIRED VALUES
  -- =======================================================

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


  -- =======================================================
  -- OPTION-BASED FIELD TYPES
  -- =======================================================

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

      select value

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


  -- =======================================================
  -- OTHER OPTION
  -- =======================================================

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
      new.other_label
      is null
    then
      new.other_label :=
        'Other';
    end if;

  else

    new.other_label :=
      null;

  end if;


  -- =======================================================
  -- CONDITIONAL VISIBILITY
  -- =======================================================

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
      tg_op =
      'UPDATE'

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


  -- =======================================================
  -- VALIDATION RULES
  -- =======================================================

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