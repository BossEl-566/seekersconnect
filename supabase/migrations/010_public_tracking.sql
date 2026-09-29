-- =========================================================
-- PUBLIC REQUEST TRACKING
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
begin

  -- -------------------------------------------------------
  -- Locate request using the public tracking number
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
  -- Use the same generic failure for invalid number/PIN
  -- -------------------------------------------------------

  if not found then
    return null;
  end if;


  if v_request.tracking_pin_digest is null then
    return null;
  end if;


  if v_request.tracking_pin_digest <>
     crypt(
       trim(p_tracking_pin),
       v_request.tracking_pin_digest
     )
  then
    return null;
  end if;


  -- -------------------------------------------------------
  -- Public status history only
  --
  -- IMPORTANT:
  -- internal_note is intentionally NOT returned.
  -- changed_by is intentionally NOT returned.
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
  -- Sanitized customer response
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
      v_history

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