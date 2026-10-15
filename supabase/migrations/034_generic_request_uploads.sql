-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13E
-- GENERIC REQUEST UPLOAD SYSTEM
-- =========================================================


-- =========================================================
-- 1. REQUEST UPLOAD RECORDS
-- =========================================================

create table if not exists public.request_uploads (
  id uuid primary key
    default gen_random_uuid(),

  request_id uuid not null
    references public.requests(id)
    on delete cascade,

  -- Snapshot only.
  --
  -- Do not FK this to service_form_fields because historical
  -- request evidence must remain valid if the form definition
  -- later changes.
  field_id_snapshot uuid,

  field_key text not null,
  field_label text not null,

  source text not null
    check (
      source in (
        'UPLOAD',
        'EMAIL_FALLBACK'
      )
    ),

  storage_path text,

  original_filename text,

  mime_type text,

  size_bytes bigint,

  email_reference text,

  created_at timestamptz not null
    default now(),


  constraint request_uploads_field_key_check
  check (
    length(
      btrim(
        field_key
      )
    ) between 1 and 100
  ),


  constraint request_uploads_field_label_check
  check (
    length(
      btrim(
        field_label
      )
    ) between 1 and 200
  ),


  constraint request_uploads_source_payload_check
  check (
    (
      source =
      'UPLOAD'

      and storage_path is not null

      and original_filename is not null

      and size_bytes is not null

      and size_bytes >
      0

      and email_reference is null
    )

    or

    (
      source =
      'EMAIL_FALLBACK'

      and storage_path is null

      and nullif(
        btrim(
          coalesce(
            email_reference,
            ''
          )
        ),
        ''
      ) is not null
    )
  )
);


-- =========================================================
-- 2. INDEXES
-- =========================================================

create index if not exists
  request_uploads_request_idx
on public.request_uploads (
  request_id,
  created_at
);


create index if not exists
  request_uploads_field_idx
on public.request_uploads (
  request_id,
  field_key
);


-- Only one email fallback declaration is needed for a
-- particular request field.
create unique index if not exists
  request_uploads_email_fallback_unique_idx
on public.request_uploads (
  request_id,
  field_key
)
where
  source =
  'EMAIL_FALLBACK';


-- =========================================================
-- 3. RLS
-- =========================================================

alter table public.request_uploads
enable row level security;


/*
 * No anon/authenticated policies are added.
 *
 * Public customers submit through the server API.
 * Admin/server access uses service_role.
 */


-- =========================================================
-- 4. PRIVATE STORAGE BUCKET
--
-- 10 MB is the platform-level hard maximum.
-- Individual fields may request a smaller maximum.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'request-uploads',

  'request-uploads',

  false,

  10485760,

  array[
    'application/pdf',

    'image/jpeg',
    'image/png',
    'image/webp',

    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (
  id
)
do update
set
  public =
    false,

  file_size_limit =
    10485760,

  allowed_mime_types =
    excluded.allowed_mime_types;


-- =========================================================
-- 5. ATTACH UPLOAD METADATA
--
-- Request creation remains handled by the Phase 13B
-- pricing-aware RPC.
--
-- Storage objects are uploaded first. After the request is
-- successfully created, this RPC attaches their metadata.
--
-- If this call fails the API will remove the storage objects
-- and delete the just-created request.
-- =========================================================

create or replace function
public.attach_request_uploads(
  p_request_id uuid,
  p_uploads jsonb
)
returns void
language plpgsql
security definer
set search_path =
  public,
  pg_temp
as $$
declare
  v_item jsonb;

  v_request_exists boolean;
begin

  select exists (
    select
      1

    from public.requests

    where
      id =
      p_request_id
  )
  into
    v_request_exists;


  if
    not v_request_exists
  then
    raise exception
      'Request could not be found.';
  end if;


  if
    p_uploads is null
  then
    return;
  end if;


  if
    jsonb_typeof(
      p_uploads
    ) <>
    'array'
  then
    raise exception
      'Upload metadata must be an array.';
  end if;


  for v_item in

    select
      value

    from jsonb_array_elements(
      p_uploads
    )

  loop

    if
      nullif(
        btrim(
          coalesce(
            v_item ->>
            'fieldKey',

            ''
          )
        ),
        ''
      ) is null
    then
      raise exception
        'Upload field key is required.';
    end if;


    if
      nullif(
        btrim(
          coalesce(
            v_item ->>
            'fieldLabel',

            ''
          )
        ),
        ''
      ) is null
    then
      raise exception
        'Upload field label is required.';
    end if;


    insert into public.request_uploads (
      request_id,

      field_id_snapshot,

      field_key,
      field_label,

      source,

      storage_path,

      original_filename,

      mime_type,

      size_bytes,

      email_reference
    )
    values (
      p_request_id,

      nullif(
        v_item ->>
        'fieldId',
        ''
      )::uuid,

      btrim(
        v_item ->>
        'fieldKey'
      ),

      btrim(
        v_item ->>
        'fieldLabel'
      ),

      upper(
        btrim(
          v_item ->>
          'source'
        )
      ),

      nullif(
        btrim(
          coalesce(
            v_item ->>
            'storagePath',
            ''
          )
        ),
        ''
      ),

      nullif(
        btrim(
          coalesce(
            v_item ->>
            'originalFilename',
            ''
          )
        ),
        ''
      ),

      nullif(
        btrim(
          coalesce(
            v_item ->>
            'mimeType',
            ''
          )
        ),
        ''
      ),

      case
        when
          nullif(
            v_item ->>
            'sizeBytes',
            ''
          ) is null
        then
          null

        else
          (
            v_item ->>
            'sizeBytes'
          )::bigint
      end,

      nullif(
        btrim(
          coalesce(
            v_item ->>
            'emailReference',
            ''
          )
        ),
        ''
      )
    );

  end loop;
end;
$$;


revoke all
on function
public.attach_request_uploads(
  uuid,
  jsonb
)
from
  public,
  anon,
  authenticated;


grant execute
on function
public.attach_request_uploads(
  uuid,
  jsonb
)
to
  service_role;


-- =========================================================
-- 6. COMMENTS
-- =========================================================

comment on table
public.request_uploads
is
'Private customer uploads and email-fallback declarations associated with dynamic request fields.';


comment on column
public.request_uploads.field_id_snapshot
is
'Historical service_form_fields ID snapshot. Deliberately has no foreign key.';


comment on column
public.request_uploads.email_reference
is
'Customer-provided reference when a required document was sent through the configured support email instead of direct upload.';