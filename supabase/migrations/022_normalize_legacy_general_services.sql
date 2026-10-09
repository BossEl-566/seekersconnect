-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13A-4A
-- NORMALIZE LEGACY GENERAL SERVICES
--
-- PURPOSE
--
-- Existing Phase 12 general services were attached to the
-- pseudo-provider university code SC247.
--
-- Phase 13 uses services.service_scope as the source of truth.
--
-- This migration detaches those general services from SC247:
--
-- university_id = NULL
--
-- Historical requests are NOT changed.
-- The SC247 university row is NOT deleted.
-- =========================================================


do $$
declare
  v_sc247_id uuid;

  v_conflict_count integer;
begin

  -- =======================================================
  -- LOCATE LEGACY SC247 PROVIDER
  -- =======================================================

  select
    u.id
  into
    v_sc247_id
  from public.universities u
  where upper(u.code) = 'SC247'
  limit 1;


  if v_sc247_id is null then
    raise exception
      'SC247 legacy provider could not be found.';
  end if;


  -- =======================================================
  -- SAFETY CHECK
  --
  -- SC247 must not contain academic services.
  -- =======================================================

  if exists (
    select 1
    from public.services s
    where
      s.university_id = v_sc247_id
      and s.service_scope <> 'general'
  ) then
    raise exception
      'SC247 contains a non-general service. Migration stopped.';
  end if;


  -- =======================================================
  -- CHECK NULL-UNIVERSITY SLUG COLLISIONS
  --
  -- Migration 020 added a unique partial index for general /
  -- university-less service slugs.
  --
  -- Therefore, before moving the old services to NULL,
  -- confirm that no existing NULL-university service already
  -- uses the same slug.
  -- =======================================================

  select
    count(*)
  into
    v_conflict_count
  from public.services legacy_service

  join public.services normalized_service
    on normalized_service.slug =
       legacy_service.slug

  where
    legacy_service.university_id =
      v_sc247_id

    and legacy_service.service_scope =
      'general'

    and normalized_service.university_id
      is null

    and normalized_service.id <>
      legacy_service.id;


  if v_conflict_count > 0 then
    raise exception
      'One or more SC247 service slugs conflict with existing university-less services. Resolve the conflicts before continuing.';
  end if;


  -- =======================================================
  -- NORMALIZE LEGACY SERVICES
  -- =======================================================

  update public.services
  set
    university_id =
      null,

    service_scope =
      'general',

    updated_at =
      now()

  where
    university_id =
      v_sc247_id

    and service_scope =
      'general';


  -- =======================================================
  -- AUDIT
  -- =======================================================

  insert into public.activity_logs (
    action,
    entity_type,
    metadata
  )
  values (
    'LEGACY_GENERAL_SERVICES_NORMALIZED',

    'service',

    jsonb_build_object(
      'legacy_provider_code',
        'SC247',

      'normalized_at',
        now()
    )
  );

end;
$$;


-- =========================================================
-- POST-MIGRATION INVARIANT
--
-- No active general service should depend on SC247.
-- =========================================================

do $$
declare
  v_remaining_count integer;
begin

  select
    count(*)
  into
    v_remaining_count

  from public.services s

  join public.universities u
    on u.id =
      s.university_id

  where
    upper(u.code) =
      'SC247'

    and s.service_scope =
      'general';


  if v_remaining_count > 0 then
    raise exception
      'SC247 general services remain attached after normalization.';
  end if;

end;
$$;