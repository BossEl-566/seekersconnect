-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13K-2
--
-- IMMUTABLE REQUEST TERMS ACCEPTANCE
-- =========================================================


-- =========================================================
-- 1. PROTECT ACCEPTANCE SNAPSHOT
--
-- NULL -> value is allowed once.
-- Once recorded, the terms version and acceptance timestamp
-- cannot be changed.
-- =========================================================

create or replace function
public.protect_request_terms_acceptance()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
begin

  if
    old.terms_version is not null

    and (
      new.terms_version is distinct from
        old.terms_version

      or new.terms_accepted_at is distinct from
        old.terms_accepted_at
    )
  then
    raise exception
      'Request Terms acceptance cannot be changed once recorded.';
  end if;


  return new;

end;
$$;


drop trigger if exists
  requests_protect_terms_acceptance
on public.requests;


create trigger
  requests_protect_terms_acceptance

before update
of
  terms_version,
  terms_accepted_at
on public.requests

for each row

execute function
public.protect_request_terms_acceptance();


-- =========================================================
-- 2. RECORD TERMS ACCEPTANCE
--
-- Server-only RPC.
--
-- It checks that:
-- - the submitted version is valid
-- - a published Terms page exists
-- - the accepted version is still the CURRENT published
--   version
-- - the request exists
-- - acceptance has not already been recorded
-- =========================================================

create or replace function
public.record_request_terms_acceptance(
  p_request_id uuid,
  p_terms_version integer
)
returns table (
  request_id uuid,
  terms_version integer,
  terms_accepted_at timestamptz
)
language plpgsql
security definer
set search_path =
  public,
  pg_temp
as $$
declare

  v_current_terms_version integer;

  v_existing_version integer;

  v_existing_accepted_at timestamptz;

  v_accepted_at timestamptz;

begin

  if
    p_request_id is null
  then
    raise exception
      'Request identifier is required.';
  end if;


  if
    p_terms_version is null
    or p_terms_version < 1
  then
    raise exception
      'A valid Terms version is required.';
  end if;


  -- =======================================================
  -- CURRENT PUBLISHED TERMS
  -- =======================================================

  select
    sp.version
  into
    v_current_terms_version
  from public.site_pages sp
  where
    sp.slug =
      'terms'

    and sp.status =
      'PUBLISHED'
  limit 1;


  if
    v_current_terms_version is null
  then
    raise exception
      'Published Terms and Conditions are not currently available.';
  end if;


  if
    p_terms_version <>
    v_current_terms_version
  then
    raise exception
      'The Terms and Conditions have changed. Please review the latest version before submitting.';
  end if;


  -- =======================================================
  -- LOCK REQUEST
  -- =======================================================

  select
    r.terms_version,
    r.terms_accepted_at
  into
    v_existing_version,
    v_existing_accepted_at
  from public.requests r
  where
    r.id =
      p_request_id
  for update;


  if not found then
    raise exception
      'Request not found.';
  end if;


  -- =======================================================
  -- IDEMPOTENT SAME-VERSION RESULT
  -- =======================================================

  if
    v_existing_version is not null
  then

    if
      v_existing_version <>
      p_terms_version
    then
      raise exception
        'Terms acceptance has already been recorded for this request.';
    end if;


    return query
    select
      p_request_id,
      v_existing_version,
      v_existing_accepted_at;


    return;

  end if;


  -- =======================================================
  -- SNAPSHOT
  -- =======================================================

  v_accepted_at :=
    now();


  update public.requests
  set
    terms_version =
      p_terms_version,

    terms_accepted_at =
      v_accepted_at

  where
    id =
      p_request_id;


  insert into public.activity_logs (
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    'REQUEST_TERMS_ACCEPTED',

    'request',

    p_request_id,

    jsonb_build_object(
      'terms_version',
        p_terms_version,

      'accepted_at',
        v_accepted_at
    )
  );


  return query
  select
    p_request_id,
    p_terms_version,
    v_accepted_at;

end;
$$;


revoke all
on function
public.record_request_terms_acceptance(
  uuid,
  integer
)
from
  public,
  anon,
  authenticated;


grant execute
on function
public.record_request_terms_acceptance(
  uuid,
  integer
)
to
  service_role;


comment on function
public.record_request_terms_acceptance(
  uuid,
  integer
)
is
'Records the current published Terms version and acceptance timestamp exactly once for a submitted request.';