import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


// =========================================================
// PUBLIC BLOG TYPES
// =========================================================

export type PublicBlogMedia = {
  id:
    string;

  kind:
    "COVER_IMAGE"
    | "CONTENT_IMAGE";

  title:
    string | null;

  altText:
    string | null;

  url:
    string;

  originalFilename:
    string;

  displayOrder:
    number;
};


export type PublicBlogPost = {
  id:
    string;

  slug:
    string;

  title:
    string;

  excerpt:
    string | null;

  content:
    string;

  featured:
    boolean;

  publishedAt:
    string | null;

  createdAt:
    string;

  seoTitle:
    string | null;

  seoDescription:
    string | null;

  media:
    PublicBlogMedia[];
};


// =========================================================
// PUBLIC TESTIMONIAL TYPE
// =========================================================

export type PublicTestimonial = {
  id:
    string;

  customerName:
    string;

  customerTitle:
    string | null;

  organization:
    string | null;

  testimonial:
    string;

  rating:
    number | null;

  featured:
    boolean;

  createdAt:
    string;
};


// =========================================================
// DATABASE TYPES
// =========================================================

type BlogPostRow = {
  id:
    string;

  slug:
    string;

  title:
    string;

  excerpt:
    string | null;

  content:
    string;

  featured:
    boolean;

  published_at:
    string | null;

  created_at:
    string;

  seo_title:
    string | null;

  seo_description:
    string | null;
};


type BlogMediaRow = {
  id:
    string;

  blog_post_id:
    string;

  media_kind:
    "COVER_IMAGE"
    | "CONTENT_IMAGE";

  title:
    string | null;

  alt_text:
    string | null;

  storage_bucket:
    string;

  storage_path:
    string;

  original_filename:
    string;

  display_order:
    number;
};


type TestimonialRow = {
  id:
    string;

  customer_name:
    string;

  customer_title:
    string | null;

  organization:
    string | null;

  testimonial:
    string;

  rating:
    number | null;

  featured:
    boolean;

  created_at:
    string;
};


// =========================================================
// GET PUBLISHED BLOG POSTS
// =========================================================

export async function getPublishedBlogPosts(
  limit?:
    number,
): Promise<PublicBlogPost[]> {
  const supabase =
    createAdminClient();


  let query =
    supabase
      .from(
        "blog_posts",
      )
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        featured,
        published_at,
        created_at,
        seo_title,
        seo_description
      `)
      .eq(
        "status",
        "PUBLISHED",
      )
      .order(
        "featured",
        {
          ascending:
            false,
        },
      )
      .order(
        "published_at",
        {
          ascending:
            false,
          nullsFirst:
            false,
        },
      );


  if (
    limit &&
    limit >
      0
  ) {
    query =
      query.limit(
        limit,
      );
  }


  const {
    data,
    error,
  } =
    await query;


  if (
    error
  ) {
    console.error(
      "Public blog query failed:",
      error,
    );

    return [];
  }


  return buildPublicBlogPosts(
    (
      data ??
      []
    ) as BlogPostRow[],
  );
}


// =========================================================
// GET ONE PUBLISHED BLOG POST
// =========================================================

export async function getPublishedBlogPost(
  slug:
    string,
): Promise<PublicBlogPost | null> {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        featured,
        published_at,
        created_at,
        seo_title,
        seo_description
      `)
      .eq(
        "status",
        "PUBLISHED",
      )
      .eq(
        "slug",
        slug,
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "Public blog post query failed:",
      error,
    );

    return null;
  }


  if (
    !data
  ) {
    return null;
  }


  const posts =
    await buildPublicBlogPosts([
      data as BlogPostRow,
    ]);


  return (
    posts[0] ??
    null
  );
}


// =========================================================
// BUILD BLOG POSTS WITH MEDIA
// =========================================================

async function buildPublicBlogPosts(
  posts:
    BlogPostRow[],
): Promise<PublicBlogPost[]> {
  if (
    posts.length ===
    0
  ) {
    return [];
  }


  const supabase =
    createAdminClient();


  const postIds =
    posts.map(
      (
        post,
      ) =>
        post.id,
    );


  const {
    data:
      mediaData,

    error:
      mediaError,
  } =
    await supabase
      .from(
        "blog_post_media",
      )
      .select(`
        id,
        blog_post_id,
        media_kind,
        title,
        alt_text,
        storage_bucket,
        storage_path,
        original_filename,
        display_order
      `)
      .in(
        "blog_post_id",
        postIds,
      )
      .eq(
        "active",
        true,
      )
      .order(
        "display_order",
        {
          ascending:
            true,
        },
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        },
      );


  if (
    mediaError
  ) {
    console.error(
      "Public blog media query failed:",
      mediaError,
    );
  }


  const mediaByPost =
    new Map<
      string,
      PublicBlogMedia[]
    >();


  for (
    const media of
    (
      mediaData ??
      []
    ) as BlogMediaRow[]
  ) {
    const {
      data:
        publicUrlData,
    } =
      supabase.storage
        .from(
          media.storage_bucket,
        )
        .getPublicUrl(
          media.storage_path,
        );


    const item:
      PublicBlogMedia =
    {
      id:
        media.id,

      kind:
        media.media_kind,

      title:
        media.title,

      altText:
        media.alt_text,

      url:
        publicUrlData.publicUrl,

      originalFilename:
        media.original_filename,

      displayOrder:
        media.display_order,
    };


    const current =
      mediaByPost.get(
        media.blog_post_id,
      ) ??
      [];


    current.push(
      item,
    );


    mediaByPost.set(
      media.blog_post_id,
      current,
    );
  }


  return posts.map(
    (
      post,
    ) => ({
      id:
        post.id,

      slug:
        post.slug,

      title:
        post.title,

      excerpt:
        post.excerpt,

      content:
        post.content,

      featured:
        post.featured,

      publishedAt:
        post.published_at,

      createdAt:
        post.created_at,

      seoTitle:
        post.seo_title,

      seoDescription:
        post.seo_description,

      media:
        mediaByPost.get(
          post.id,
        ) ??
        [],
    }),
  );
}


// =========================================================
// GET APPROVED TESTIMONIALS
// =========================================================

export async function getApprovedTestimonials({
  limit,
  featuredOnly = false,
}: {
  limit?:
    number;

  featuredOnly?:
    boolean;
} = {}): Promise<PublicTestimonial[]> {
  const supabase =
    createAdminClient();


  let query =
    supabase
      .from(
        "testimonials",
      )
      .select(`
        id,
        customer_name,
        customer_title,
        organization,
        testimonial,
        rating,
        featured,
        created_at
      `)
      .eq(
        "status",
        "APPROVED",
      )
      .order(
        "featured",
        {
          ascending:
            false,
        },
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );


  if (
    featuredOnly
  ) {
    query =
      query.eq(
        "featured",
        true,
      );
  }


  if (
    limit &&
    limit >
      0
  ) {
    query =
      query.limit(
        limit,
      );
  }


  const {
    data,
    error,
  } =
    await query;


  if (
    error
  ) {
    console.error(
      "Public testimonials query failed:",
      error,
    );

    return [];
  }


  return (
    (
      data ??
      []
    ) as TestimonialRow[]
  ).map(
    (
      row,
    ) => ({
      id:
        row.id,

      customerName:
        row.customer_name,

      customerTitle:
        row.customer_title,

      organization:
        row.organization,

      testimonial:
        row.testimonial,

      rating:
        row.rating,

      featured:
        row.featured,

      createdAt:
        row.created_at,
    }),
  );
}


// =========================================================
// HOMEPAGE TESTIMONIALS
//
// Prefer featured testimonials.
// Fall back to latest approved testimonials if none have
// been marked as featured yet.
// =========================================================

export async function getHomepageTestimonials():
  Promise<PublicTestimonial[]> {
  const featured =
    await getApprovedTestimonials({
      limit:
        3,

      featuredOnly:
        true,
    });


  if (
    featured.length >
    0
  ) {
    return featured;
  }


  return getApprovedTestimonials({
    limit:
      3,
  });
}