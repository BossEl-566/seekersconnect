-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13I
-- SERVICE MEDIA
--
-- PUBLIC MEDIA ONLY:
--
--   HERO_IMAGE
--   GALLERY_IMAGE
--   DOWNLOAD
--
-- Customer/request files must NEVER be stored here.
-- Those remain in the private request-uploads bucket.
-- =========================================================


-- =========================================================
-- 1. SERVICE MEDIA TABLE
-- =========================================================

create table if not exists public.service_media (
  id uuid primary key
    default gen_random_uuid(),

  service_id uuid not null
    references public.services(id)
    on delete cascade,

  media_kind text not null
    check (
      media_kind in (
        'HERO_IMAGE',
        'GALLERY_IMAGE',
        'DOWNLOAD'
      )
    ),

  title text not null,

  description text,

  alt_text text,

  storage_bucket text not null
    default 'service-media',

  storage_path text not null,

  original_filename text not null,

  mime_type text not null,

  size_bytes bigint not null,

  display_order integer not null
    default 0,

  active boolean not null
    default true,

  created_by uuid
    references public.admin_profiles(id)
    on delete set null,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),


  constraint service_media_title_check
  check (
    length(
      btrim(
        title
      )
    ) between 1 and 200
  ),


  constraint service_media_storage_path_check
  check (
    length(
      btrim(
        storage_path
      )
    ) between 1 and 1000
  ),


  constraint service_media_original_filename_check
  check (
    length(
      btrim(
        original_filename
      )
    ) between 1 and 500
  ),


  constraint service_media_size_check
  check (
    size_bytes >
    0
  ),


  constraint service_media_description_check
  check (
    description is null
    or length(
      description
    ) <=
    2000
  ),


  constraint service_media_alt_text_check
  check (
    alt_text is null
    or length(
      alt_text
    ) <=
    300
  ),


  constraint service_media_image_type_check
  check (
    media_kind not in (
      'HERO_IMAGE',
      'GALLERY_IMAGE'
    )

    or mime_type in (
      'image/jpeg',
      'image/png',
      'image/webp'
    )
  )
);


-- =========================================================
-- 2. STORAGE PATH MUST BE UNIQUE
-- =========================================================

create unique index if not exists
  service_media_storage_path_unique_idx
on public.service_media (
  storage_bucket,
  storage_path
);


-- =========================================================
-- 3. SERVICE LOOKUP
-- =========================================================

create index if not exists
  service_media_service_idx
on public.service_media (
  service_id,
  active,
  display_order,
  created_at
);


-- =========================================================
-- 4. MEDIA KIND LOOKUP
-- =========================================================

create index if not exists
  service_media_kind_idx
on public.service_media (
  service_id,
  media_kind,
  active,
  display_order
);


-- =========================================================
-- 5. ONE HERO IMAGE PER SERVICE
--
-- A service may have many gallery images/downloads but only
-- one HERO_IMAGE record.
-- =========================================================

create unique index if not exists
  service_media_one_hero_per_service_idx
on public.service_media (
  service_id
)
where
  media_kind =
  'HERO_IMAGE';


-- =========================================================
-- 6. UPDATED_AT
-- =========================================================

create or replace function
public.touch_service_media_updated_at()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
begin

  new.updated_at :=
    now();

  return new;

end;
$$;


drop trigger if exists
  service_media_touch_updated_at
on public.service_media;


create trigger
  service_media_touch_updated_at

before update
on public.service_media

for each row

execute function
public.touch_service_media_updated_at();


-- =========================================================
-- 7. ROW LEVEL SECURITY
--
-- No browser writes.
--
-- Public website data is retrieved through the application's
-- server-side catalog/API.
--
-- Admin mutations use the authenticated server layer.
-- =========================================================

alter table public.service_media
enable row level security;


-- =========================================================
-- 8. PUBLIC SERVICE MEDIA STORAGE BUCKET
--
-- 10 MB hard limit per object.
--
-- This bucket is PUBLIC because these files are intended
-- for website visitors:
--
--   service artwork
--   service gallery
--   practicum forms
--   public templates
--
-- Never use this bucket for customer documents.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'service-media',

  'service-media',

  true,

  10485760,

  array[
    'image/jpeg',
    'image/png',
    'image/webp',

    'application/pdf',

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
    true,

  file_size_limit =
    10485760,

  allowed_mime_types =
    excluded.allowed_mime_types;


-- =========================================================
-- 9. COMMENTS
-- =========================================================

comment on table
public.service_media
is
'Administrator-managed public images and downloadable resources associated with services.';


comment on column
public.service_media.media_kind
is
'HERO_IMAGE for service cover artwork, GALLERY_IMAGE for supporting imagery, DOWNLOAD for public files such as practicum forms.';


comment on column
public.service_media.storage_path
is
'Object path inside the public service-media Supabase Storage bucket.';


comment on column
public.service_media.alt_text
is
'Accessible alternative text for service images.';


comment on column
public.service_media.created_by
is
'Administrator who originally uploaded the media item.';