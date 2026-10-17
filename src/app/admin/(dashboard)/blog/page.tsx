import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  BlogManager,
  type BlogMediaAdminItem,
  type BlogPostAdminItem,
} from "@/components/admin/blog-manager";


export default async function BlogAdminPage() {
  await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const [
    postsResult,
    mediaResult,
  ] =
    await Promise.all([
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
          status,
          featured,
          published_at,
          seo_title,
          seo_description,
          created_at,
          updated_at,

          admin_profiles (
            full_name
          )
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        ),


      supabase
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
          mime_type,
          size_bytes,
          display_order,
          active
        `)
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
        ),
    ]);


  if (
    postsResult.error
  ) {
    console.error(
      "Blog posts query failed:",
      postsResult.error,
    );
  }


  if (
    mediaResult.error
  ) {
    console.error(
      "Blog media query failed:",
      mediaResult.error,
    );
  }


  const mediaByPost =
    new Map<
      string,
      BlogMediaAdminItem[]
    >();


  for (
    const item of
    mediaResult.data ??
    []
  ) {
    const {
      data,
    } =
      supabase.storage
        .from(
          item.storage_bucket,
        )
        .getPublicUrl(
          item.storage_path,
        );


    const mediaItem:
      BlogMediaAdminItem =
    {
      id:
        item.id,

      media_kind:
        item.media_kind,

      title:
        item.title,

      alt_text:
        item.alt_text,

      storage_path:
        item.storage_path,

      original_filename:
        item.original_filename,

      mime_type:
        item.mime_type,

      size_bytes:
        Number(
          item.size_bytes,
        ),

      display_order:
        item.display_order,

      active:
        item.active,

      publicUrl:
        data.publicUrl,
    };


    const existing =
      mediaByPost.get(
        item.blog_post_id,
      ) ??
      [];


    existing.push(
      mediaItem,
    );


    mediaByPost.set(
      item.blog_post_id,
      existing,
    );
  }


  const posts:
    BlogPostAdminItem[] =
    (
      postsResult.data ??
      []
    ).map(
      (
        post,
      ) => {
        const relation =
          post.admin_profiles;


        const author =
          Array.isArray(
            relation,
          )
            ? relation[0] ??
              null
            : relation;


        return {
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

          status:
            post.status,

          featured:
            post.featured,

          published_at:
            post.published_at,

          seo_title:
            post.seo_title,

          seo_description:
            post.seo_description,

          created_at:
            post.created_at,

          updated_at:
            post.updated_at,

          authorName:
            author?.full_name ??
            null,

          media:
            mediaByPost.get(
              post.id,
            ) ??
            [],
        };
      },
    );


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Content
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Blog
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Create, publish and manage Seekers Connect news,
          announcements, guides and educational articles.
        </p>
      </div>


      <div className="mt-7">
        <BlogManager
          posts={
            posts
          }
        />
      </div>
    </>
  );
}