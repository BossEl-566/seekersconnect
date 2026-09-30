-- =========================================================
-- SERVICE FORM FIELD REORDERING
-- =========================================================

create index if not exists
idx_service_form_fields_service_sort
on public.service_form_fields (
  service_id,
  sort_order
);


create or replace function public.move_service_form_field(
  p_field_id uuid,
  p_admin_id uuid,
  p_direction text
)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_field public.service_form_fields%rowtype;
  v_adjacent public.service_form_fields%rowtype;
  v_old_order integer;
begin

  -- =======================================================
  -- VALIDATE SUPER ADMIN
  -- =======================================================

  if not exists (
    select 1
    from public.admin_profiles ap
    where ap.id = p_admin_id
      and ap.active = true
      and ap.role = 'SUPER_ADMIN'
  ) then
    raise exception 'Unauthorized administrator';
  end if;


  -- =======================================================
  -- VALIDATE DIRECTION
  -- =======================================================

  if p_direction not in (
    'UP',
    'DOWN'
  ) then
    raise exception 'Invalid direction';
  end if;


  -- =======================================================
  -- LOCK CURRENT FIELD
  -- =======================================================

  select sff.*
  into v_field
  from public.service_form_fields sff
  where sff.id = p_field_id
  for update;

  if not found then
    raise exception 'Form field not found';
  end if;


  -- =======================================================
  -- FIND ADJACENT FIELD
  -- =======================================================

  if p_direction = 'UP' then

    select sff.*
    into v_adjacent
    from public.service_form_fields sff
    where sff.service_id = v_field.service_id
      and sff.sort_order < v_field.sort_order
    order by
      sff.sort_order desc,
      sff.created_at desc
    limit 1
    for update;

  else

    select sff.*
    into v_adjacent
    from public.service_form_fields sff
    where sff.service_id = v_field.service_id
      and sff.sort_order > v_field.sort_order
    order by
      sff.sort_order asc,
      sff.created_at asc
    limit 1
    for update;

  end if;


  -- Already first/last
  if not found then
    return;
  end if;


  -- =======================================================
  -- SWAP SORT ORDERS
  -- =======================================================

  v_old_order :=
    v_field.sort_order;


  update public.service_form_fields
  set
    sort_order =
      v_adjacent.sort_order
  where id =
    v_field.id;


  update public.service_form_fields
  set
    sort_order =
      v_old_order
  where id =
    v_adjacent.id;


  -- =======================================================
  -- AUDIT
  -- =======================================================

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_admin_id,
    'SERVICE_FORM_FIELD_REORDERED',
    'service_form_field',
    v_field.id,
    jsonb_build_object(
      'service_id',
        v_field.service_id,

      'direction',
        p_direction,

      'previous_order',
        v_old_order,

      'new_order',
        v_adjacent.sort_order
    )
  );

end;
$$;


revoke all
on function public.move_service_form_field(
  uuid,
  uuid,
  text
)
from public, anon, authenticated;


grant execute
on function public.move_service_form_field(
  uuid,
  uuid,
  text
)
to service_role;