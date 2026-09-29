-- =========================================================
-- REQUEST DOCUMENT STORAGE + DOCUMENT WORKFLOW
-- =========================================================


-- =========================================================
-- PRIVATE DOCUMENT STORAGE BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'request-documents',
  'request-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id)
do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;



-- =========================================================
-- REGISTER SCANNED DOCUMENT
-- =========================================================

create or replace function public.register_scanned_document(
  p_request_id uuid,
  p_admin_id uuid,
  p_document_type text,
  p_storage_path text,
  p_original_filename text,
  p_mime_type text,
  p_size_bytes bigint
)
returns table (
  document_id uuid,
  request_id uuid,
  new_status text
)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_request public.requests%rowtype;
  v_document_id uuid;
begin

  -- -------------------------------------------------------
  -- Validate administrator
  -- -------------------------------------------------------

  if not exists (
    select 1
    from public.admin_profiles ap
    where ap.id = p_admin_id
      and ap.active = true
  ) then
    raise exception 'Unauthorized administrator';
  end if;


  -- -------------------------------------------------------
  -- Lock request
  -- -------------------------------------------------------

  select r.*
  into v_request
  from public.requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;


  -- -------------------------------------------------------
  -- The document can only be uploaded at DOCUMENT_READY
  -- -------------------------------------------------------

  if v_request.status <> 'DOCUMENT_READY' then
    raise exception
      'A scanned document cannot be uploaded while request status is %',
      v_request.status;
  end if;


  -- -------------------------------------------------------
  -- Validate supported document type
  -- -------------------------------------------------------

  if p_document_type not in (
    'SCANNED_TRANSCRIPT',
    'ATTESTATION',
    'PROFICIENCY_LETTER',
    'OTHER'
  ) then
    raise exception 'Invalid scanned document type';
  end if;


  -- -------------------------------------------------------
  -- Insert document metadata
  -- -------------------------------------------------------

  insert into public.request_documents (
    request_id,
    document_type,
    storage_path,
    original_filename,
    mime_type,
    size_bytes,
    visible_to_customer,
    uploaded_by
  )
  values (
    p_request_id,
    p_document_type,
    p_storage_path,
    p_original_filename,
    p_mime_type,
    p_size_bytes,
    true,
    p_admin_id
  )
  returning id
  into v_document_id;


  -- -------------------------------------------------------
  -- Move workflow forward
  -- -------------------------------------------------------

  update public.requests r
  set
    status = 'DOCUMENT_SCANNED'
  where r.id = p_request_id;


  -- -------------------------------------------------------
  -- Public/customer history
  -- -------------------------------------------------------

  insert into public.request_status_history (
    request_id,
    status,
    public_message,
    internal_note,
    changed_by
  )
  values (
    p_request_id,
    'DOCUMENT_SCANNED',
    'A scanned copy of your document is now available.',
    'Scanned document uploaded and made available to the customer.',
    p_admin_id
  );


  -- -------------------------------------------------------
  -- Audit log
  -- -------------------------------------------------------

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_id,
    'SCANNED_DOCUMENT_UPLOADED',
    'request',
    p_request_id,
    jsonb_build_object(
      'request_number',
        v_request.request_number,

      'document_id',
        v_document_id,

      'document_type',
        p_document_type,

      'original_filename',
        p_original_filename
    )
  );


  return query
  select
    v_document_id,
    p_request_id,
    'DOCUMENT_SCANNED'::text;

end;
$$;


revoke all
on function public.register_scanned_document(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  bigint
)
from public, anon, authenticated;


grant execute
on function public.register_scanned_document(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  bigint
)
to service_role;



-- =========================================================
-- UPDATE PUBLIC TRACKING FUNCTION
--
-- Customers receive document METADATA only.
-- Storage paths are NOT exposed.
-- =========================================================

create or replace function public.verify_request_tracking(
  p_tracking_number text,
  p_tracking_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_request record;
  v_history jsonb;
  v_documents jsonb;
begin

  -- -------------------------------------------------------
  -- Locate request
  -- -------------------------------------------------------

  select
    r.id,
    r.request_number,
    r.tracking_number,
    r.tracking_pin_digest,
    r.status,
    r.created_at,
    r.tracking_issued_at,

    u.code as university_code,
    u.name as university_name,

    s.name as service_name,
    s.short_name as service_short_name,

    d.physical_delivery_required,
    d.ems_tracking_number,
    d.dispatch_date,
    d.delivered_date

  into v_request

  from public.requests r

  join public.universities u
    on u.id = r.university_id

  join public.services s
    on s.id = r.service_id

  left join public.deliveries d
    on d.request_id = r.id

  where upper(r.tracking_number) =
        upper(trim(p_tracking_number))

  limit 1;


  -- -------------------------------------------------------
  -- Generic failure
  -- -------------------------------------------------------

  if not found then
    return null;
  end if;


  if v_request.tracking_pin_digest is null then
    return null;
  end if;


  -- -------------------------------------------------------
  -- Verify PIN hash
  -- -------------------------------------------------------

  if v_request.tracking_pin_digest <>
     crypt(
       trim(p_tracking_pin),
       v_request.tracking_pin_digest
     )
  then
    return null;
  end if;


  -- -------------------------------------------------------
  -- Public status history
  -- -------------------------------------------------------

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'status',
            h.status,

          'message',
            h.public_message,

          'createdAt',
            h.created_at
        )
        order by h.created_at asc
      ),
      '[]'::jsonb
    )

  into v_history

  from public.request_status_history h

  where h.request_id =
        v_request.id;


  -- -------------------------------------------------------
  -- Customer-visible documents
  --
  -- IMPORTANT:
  -- storage_path is NOT exposed.
  -- uploaded_by is NOT exposed.
  -- -------------------------------------------------------

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id',
            rd.id,

          'documentType',
            rd.document_type,

          'fileName',
            rd.original_filename,

          'mimeType',
            rd.mime_type,

          'sizeBytes',
            rd.size_bytes,

          'createdAt',
            rd.created_at
        )
        order by rd.created_at desc
      ),
      '[]'::jsonb
    )

  into v_documents

  from public.request_documents rd

  where rd.request_id =
        v_request.id

    and rd.visible_to_customer =
        true

    and rd.document_type in (
      'SCANNED_TRANSCRIPT',
      'ATTESTATION',
      'PROFICIENCY_LETTER',
      'OTHER'
    );


  -- -------------------------------------------------------
  -- Sanitized result
  -- -------------------------------------------------------

  return jsonb_build_object(

    'requestNumber',
      v_request.request_number,

    'trackingNumber',
      v_request.tracking_number,

    'status',
      v_request.status,

    'submittedAt',
      v_request.created_at,

    'trackingIssuedAt',
      v_request.tracking_issued_at,


    'university',
      jsonb_build_object(
        'code',
          v_request.university_code,

        'name',
          v_request.university_name
      ),


    'service',
      jsonb_build_object(
        'name',
          v_request.service_name,

        'shortName',
          v_request.service_short_name
      ),


    'delivery',
      jsonb_build_object(
        'required',
          coalesce(
            v_request.physical_delivery_required,
            false
          ),

        'emsTrackingNumber',
          v_request.ems_tracking_number,

        'dispatchDate',
          v_request.dispatch_date,

        'deliveredDate',
          v_request.delivered_date
      ),


    'history',
      v_history,


    'documents',
      v_documents

  );

end;
$$;


revoke all
on function public.verify_request_tracking(
  text,
  text
)
from public, anon, authenticated;


grant execute
on function public.verify_request_tracking(
  text,
  text
)
to service_role;