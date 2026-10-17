-- =========================================================
-- SEEKERS CONNECT 247
-- PHASE 13J
--
-- BLOG + TESTIMONIALS
--
-- BLOG
--   - Draft / publish / archive
--   - Featured posts
--   - Cover + supporting images
--   - SEO metadata
--
-- TESTIMONIALS
--   - Admin-created or public-submitted
--   - Moderation
--   - Featured testimonials
--
-- PUBLIC MEDIA:
--   blog-media
--
-- Never store customer request documents in this bucket.
-- =========================================================


-- =========================================================
-- 1. BLOG POSTS
-- =========================================================

create table if not exists public.blog_posts (
  id uuid primary key
    default gen_random_uuid(),

  slug text not null unique,

  title text not null,

  excerpt text,

  content text not null,

  status text not null
    default 'DRAFT'
    check (
      status in (
        'DRAFT',
        'PUBLISHED',
        'ARCHIVED'
      )
    ),

  featured boolean not null
    default false,

  author_id uuid
    references public.admin_profiles(id)
    on delete set null,

  published_at timestamptz,

  seo_title text,

  seo_description text,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),


  constraint blog_posts_slug_check
  check (
    slug =
      lower(slug)

    and slug ~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'

    and length(slug)
      between 1 and 180
  ),


  constraint blog_posts_title_check
  check (
    length(
      btrim(
        title
      )
    ) between 1 and 250
  ),


  constraint blog_posts_excerpt_check
  check (
    excerpt is null

    or length(
      excerpt
    ) <=
    1000
  ),


  constraint blog_posts_content_check
  check (
    length(
      btrim(
        content
      )
    ) >=
    1
  ),


  constraint blog_posts_seo_title_check
  check (
    seo_title is null

    or length(
      seo_title
    ) <=
    250
  ),


  constraint blog_posts_seo_description_check
  check (
    seo_description is null

    or length(
      seo_description
    ) <=
    500
  )
);


-- =========================================================
-- 2. BLOG INDEXES
-- =========================================================

create index if not exists
  blog_posts_status_published_idx
on public.blog_posts (
  status,
  published_at desc
);


create index if not exists
  blog_posts_featured_idx
on public.blog_posts (
  featured,
  published_at desc
);


create index if not exists
  blog_posts_created_idx
on public.blog_posts (
  created_at desc
);


-- =========================================================
-- 3. BLOG POST MEDIA
-- =========================================================

create table if not exists public.blog_post_media (
  id uuid primary key
    default gen_random_uuid(),

  blog_post_id uuid not null
    references public.blog_posts(id)
    on delete cascade,

  media_kind text not null
    check (
      media_kind in (
        'COVER_IMAGE',
        'CONTENT_IMAGE'
      )
    ),

  title text,

  alt_text text,

  storage_bucket text not null
    default 'blog-media',

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


  constraint blog_post_media_type_check
  check (
    mime_type in (
      'image/jpeg',
      'image/png',
      'image/webp'
    )
  ),


  constraint blog_post_media_size_check
  check (
    size_bytes >
    0
  ),


  constraint blog_post_media_storage_path_check
  check (
    length(
      btrim(
        storage_path
      )
    ) between 1 and 1000
  ),


  constraint blog_post_media_filename_check
  check (
    length(
      btrim(
        original_filename
      )
    ) between 1 and 500
  ),


  constraint blog_post_media_title_check
  check (
    title is null

    or length(
      title
    ) <=
    250
  ),


  constraint blog_post_media_alt_check
  check (
    alt_text is null

    or length(
      alt_text
    ) <=
    300
  )
);


-- =========================================================
-- 4. BLOG MEDIA INDEXES
-- =========================================================

create unique index if not exists
  blog_post_media_storage_path_unique_idx
on public.blog_post_media (
  storage_bucket,
  storage_path
);


create index if not exists
  blog_post_media_post_idx
on public.blog_post_media (
  blog_post_id,
  active,
  display_order
);


-- =========================================================
-- 5. ONE COVER PER BLOG POST
-- =========================================================

create unique index if not exists
  blog_post_media_one_cover_idx
on public.blog_post_media (
  blog_post_id
)
where
  media_kind =
  'COVER_IMAGE';


-- =========================================================
-- 6. TESTIMONIALS
-- =========================================================

create table if not exists public.testimonials (
  id uuid primary key
    default gen_random_uuid(),

  customer_name text not null,

  customer_title text,

  organization text,

  testimonial text not null,

  rating integer
    check (
      rating is null

      or rating between 1 and 5
    ),

  source text not null
    default 'PUBLIC'
    check (
      source in (
        'PUBLIC',
        'ADMIN'
      )
    ),

  status text not null
    default 'PENDING'
    check (
      status in (
        'PENDING',
        'APPROVED',
        'REJECTED',
        'ARCHIVED'
      )
    ),

  featured boolean not null
    default false,

  -- -------------------------------------------------------
  -- Private contact details.
  --
  -- These are never intended for public display.
  -- They help administrators verify a public testimonial.
  -- -------------------------------------------------------

  customer_email text,

  customer_phone text,

  admin_note text,

  moderated_by uuid
    references public.admin_profiles(id)
    on delete set null,

  moderated_at timestamptz,

  created_by uuid
    references public.admin_profiles(id)
    on delete set null,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),


  constraint testimonials_customer_name_check
  check (
    length(
      btrim(
        customer_name
      )
    ) between 1 and 200
  ),


  constraint testimonials_customer_title_check
  check (
    customer_title is null

    or length(
      customer_title
    ) <=
    200
  ),


  constraint testimonials_organization_check
  check (
    organization is null

    or length(
      organization
    ) <=
    250
  ),


  constraint testimonials_content_check
  check (
    length(
      btrim(
        testimonial
      )
    ) between 10 and 3000
  ),


  constraint testimonials_email_check
  check (
    customer_email is null

    or length(
      customer_email
    ) <=
    250
  ),


  constraint testimonials_phone_check
  check (
    customer_phone is null

    or length(
      customer_phone
    ) <=
    40
  ),


  constraint testimonials_admin_note_check
  check (
    admin_note is null

    or length(
      admin_note
    ) <=
    2000
  )
);


-- =========================================================
-- 7. TESTIMONIAL INDEXES
-- =========================================================

create index if not exists
  testimonials_status_created_idx
on public.testimonials (
  status,
  created_at desc
);


create index if not exists
  testimonials_featured_idx
on public.testimonials (
  featured,
  created_at desc
);


-- =========================================================
-- 8. UPDATED_AT TRIGGERS
--
-- public.set_updated_at() already exists in the project.
-- =========================================================

drop trigger if exists
  blog_posts_set_updated_at
on public.blog_posts;


create trigger
  blog_posts_set_updated_at

before update
on public.blog_posts

for each row

execute function
public.set_updated_at();


drop trigger if exists
  blog_post_media_set_updated_at
on public.blog_post_media;


create trigger
  blog_post_media_set_updated_at

before update
on public.blog_post_media

for each row

execute function
public.set_updated_at();


drop trigger if exists
  testimonials_set_updated_at
on public.testimonials;


create trigger
  testimonials_set_updated_at

before update
on public.testimonials

for each row

execute function
public.set_updated_at();


-- =========================================================
-- 9. AUTOMATIC BLOG PUBLISHED_AT
--
-- When a post first becomes PUBLISHED, assign published_at.
--
-- Moving it back to draft does not erase the original date.
-- Admin code may explicitly replace published_at later if
-- required.
-- =========================================================

create or replace function
public.set_blog_published_at()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
begin

  if
    new.status =
      'PUBLISHED'

    and (
      old.status is distinct from
        'PUBLISHED'

      or new.published_at
        is null
    )
  then

    new.published_at :=
      coalesce(
        new.published_at,
        now()
      );

  end if;


  return new;

end;
$$;


drop trigger if exists
  blog_posts_set_published_at
on public.blog_posts;


create trigger
  blog_posts_set_published_at

before update
on public.blog_posts

for each row

execute function
public.set_blog_published_at();


-- =========================================================
-- 10. TESTIMONIAL MODERATION TIMESTAMP
-- =========================================================

create or replace function
public.set_testimonial_moderated_at()
returns trigger
language plpgsql
set search_path =
  public,
  pg_temp
as $$
begin

  if
    new.status is distinct from
      old.status

    and new.status in (
      'APPROVED',
      'REJECTED',
      'ARCHIVED'
    )
  then

    new.moderated_at :=
      now();

  end if;


  return new;

end;
$$;


drop trigger if exists
  testimonials_set_moderated_at
on public.testimonials;


create trigger
  testimonials_set_moderated_at

before update
on public.testimonials

for each row

execute function
public.set_testimonial_moderated_at();


-- =========================================================
-- 11. RLS
--
-- We deliberately expose no direct browser table policies.
--
-- Public blog/testimonial reads and testimonial submissions
-- will go through controlled Next.js server routes.
--
-- Admin management uses the server-side service-role client.
-- =========================================================

alter table public.blog_posts
enable row level security;


alter table public.blog_post_media
enable row level security;


alter table public.testimonials
enable row level security;


-- =========================================================
-- 12. BLOG MEDIA STORAGE BUCKET
--
-- Public because published blog images are public website
-- assets.
--
-- Only images are allowed.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'blog-media',

  'blog-media',

  true,

  10485760,

  array[
    'image/jpeg',
    'image/png',
    'image/webp'
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
-- 13. COMMENTS
-- =========================================================

comment on table
public.blog_posts
is
'Seekers Connect public blog posts managed by administrators.';


comment on table
public.blog_post_media
is
'Public images associated with Seekers Connect blog posts.';


comment on table
public.testimonials
is
'Customer testimonials submitted publicly or created by administrators and subject to moderation.';


comment on column
public.testimonials.customer_email
is
'Private verification/contact data. Never display publicly.';


comment on column
public.testimonials.customer_phone
is
'Private verification/contact data. Never display publicly.';


comment on column
public.testimonials.status
is
'Only APPROVED testimonials may be displayed publicly.';