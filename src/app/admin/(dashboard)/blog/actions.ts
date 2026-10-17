"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type BlogStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";


export type BlogPostInput = {
  id?:
    string;

  title:
    string;

  slug:
    string;

  excerpt:
    string;

  content:
    string;

  status:
    BlogStatus;

  featured:
    boolean;

  seoTitle:
    string;

  seoDescription:
    string;
};


export type BlogActionResult = {
  success:
    boolean;

  error:
    string;

  id?:
    string;
};


// =========================================================
// VALIDATION
// =========================================================

function normalizeSlug(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


function validateInput(
  input:
    BlogPostInput,
) {
  const title =
    input.title.trim();


  const slug =
    normalizeSlug(
      input.slug,
    );


  const excerpt =
    input.excerpt.trim();


  const content =
    input.content.trim();


  const seoTitle =
    input.seoTitle.trim();


  const seoDescription =
    input.seoDescription.trim();


  if (
    !title
  ) {
    return {
      error:
        "Blog title is required.",
    };
  }


  if (
    title.length >
    250
  ) {
    return {
      error:
        "Blog title must be 250 characters or fewer.",
    };
  }


  if (
    !slug ||
    slug.length >
      180
  ) {
    return {
      error:
        "Enter a valid blog slug.",
    };
  }


  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    return {
      error:
        "The blog slug contains unsupported characters.",
    };
  }


  if (
    !content
  ) {
    return {
      error:
        "Blog content is required.",
    };
  }


  if (
    excerpt.length >
    1000
  ) {
    return {
      error:
        "Excerpt must be 1,000 characters or fewer.",
    };
  }


  if (
    seoTitle.length >
    250
  ) {
    return {
      error:
        "SEO title must be 250 characters or fewer.",
    };
  }


  if (
    seoDescription.length >
    500
  ) {
    return {
      error:
        "SEO description must be 500 characters or fewer.",
    };
  }


  if (
    ![
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
    ].includes(
      input.status,
    )
  ) {
    return {
      error:
        "Invalid blog status.",
    };
  }


  return {
    error:
      "",

    data: {
      title,
      slug,
      excerpt:
        excerpt ||
        null,

      content,

      status:
        input.status,

      featured:
        input.featured,

      seo_title:
        seoTitle ||
        null,

      seo_description:
        seoDescription ||
        null,
    },
  };
}


// =========================================================
// CREATE BLOG POST
// =========================================================

export async function createBlogPost(
  input:
    BlogPostInput,
): Promise<BlogActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    validateInput(
      input,
    );


  if (
    validation.error ||
    !validation.data
  ) {
    return {
      success:
        false,

      error:
        validation.error,
    };
  }


  const supabase =
    createAdminClient();


  const publishedAt =
    validation.data.status ===
    "PUBLISHED"
      ? new Date()
          .toISOString()
      : null;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .insert({
        ...validation.data,

        author_id:
          admin.id,

        published_at:
          publishedAt,
      })
      .select(
        "id, title, slug",
      )
      .single();


  if (
    error ||
    !data
  ) {
    console.error(
      "Blog post creation failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error?.code ===
        "23505"
          ? "A blog post already uses this slug."
          : "The blog post could not be created.",
    };
  }


  await writeBlogAuditLog({
    adminId:
      admin.id,

    action:
      "BLOG_POST_CREATED",

    postId:
      data.id,

    metadata: {
      title:
        data.title,

      slug:
        data.slug,

      status:
        validation.data.status,
    },
  });


  revalidateBlog();


  return {
    success:
      true,

    error:
      "",

    id:
      data.id,
  };
}


// =========================================================
// UPDATE BLOG POST
// =========================================================

export async function updateBlogPost(
  input:
    BlogPostInput,
): Promise<BlogActionResult> {
  const admin =
    await requireSuperAdmin();


  if (
    !input.id
  ) {
    return {
      success:
        false,

      error:
        "Blog post identifier is missing.",
    };
  }


  const validation =
    validateInput(
      input,
    );


  if (
    validation.error ||
    !validation.data
  ) {
    return {
      success:
        false,

      error:
        validation.error,
    };
  }


  const supabase =
    createAdminClient();


  const {
    data:
      existing,

    error:
      existingError,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .select(`
        id,
        status,
        published_at
      `)
      .eq(
        "id",
        input.id,
      )
      .maybeSingle();


  if (
    existingError ||
    !existing
  ) {
    return {
      success:
        false,

      error:
        "The blog post could not be found.",
    };
  }


  const updatePayload: Record<
    string,
    unknown
  > = {
    ...validation.data,
  };


  if (
    validation.data.status ===
      "PUBLISHED" &&
    !existing.published_at
  ) {
    updatePayload.published_at =
      new Date()
        .toISOString();
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .update(
        updatePayload,
      )
      .eq(
        "id",
        input.id,
      )
      .select(
        "id, title, slug, status",
      )
      .single();


  if (
    error ||
    !data
  ) {
    console.error(
      "Blog post update failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error?.code ===
        "23505"
          ? "A blog post already uses this slug."
          : "The blog post could not be updated.",
    };
  }


  await writeBlogAuditLog({
    adminId:
      admin.id,

    action:
      "BLOG_POST_UPDATED",

    postId:
      data.id,

    metadata: {
      title:
        data.title,

      slug:
        data.slug,

      status:
        data.status,
    },
  });


  revalidateBlog();


  return {
    success:
      true,

    error:
      "",

    id:
      data.id,
  };
}


// =========================================================
// DELETE BLOG POST
// =========================================================

export async function deleteBlogPost(
  postId:
    string,
): Promise<BlogActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data:
      post,

    error:
      postError,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .select(`
        id,
        title,
        slug
      `)
      .eq(
        "id",
        postId,
      )
      .maybeSingle();


  if (
    postError ||
    !post
  ) {
    return {
      success:
        false,

      error:
        "The blog post could not be found.",
    };
  }


  const {
    data:
      media,
  } =
    await supabase
      .from(
        "blog_post_media",
      )
      .select(`
        storage_bucket,
        storage_path
      `)
      .eq(
        "blog_post_id",
        postId,
      );


  const {
    error:
      deleteError,
  } =
    await supabase
      .from(
        "blog_posts",
      )
      .delete()
      .eq(
        "id",
        postId,
      );


  if (
    deleteError
  ) {
    console.error(
      "Blog post deletion failed:",
      deleteError,
    );


    return {
      success:
        false,

      error:
        "The blog post could not be deleted.",
    };
  }


  // =======================================================
  // REMOVE STORAGE OBJECTS
  // =======================================================

  const mediaByBucket =
    new Map<
      string,
      string[]
    >();


  for (
    const item of
    media ??
    []
  ) {
    const bucket =
      item.storage_bucket ||
      "blog-media";


    const paths =
      mediaByBucket.get(
        bucket,
      ) ??
      [];


    paths.push(
      item.storage_path,
    );


    mediaByBucket.set(
      bucket,
      paths,
    );
  }


  for (
    const [
      bucket,
      paths,
    ] of
    mediaByBucket
  ) {
    if (
      paths.length ===
      0
    ) {
      continue;
    }


    const {
      error:
        storageError,
    } =
      await supabase.storage
        .from(
          bucket,
        )
        .remove(
          paths,
        );


    if (
      storageError
    ) {
      console.error(
        "Blog media cleanup failed:",
        storageError,
      );
    }
  }


  await writeBlogAuditLog({
    adminId:
      admin.id,

    action:
      "BLOG_POST_DELETED",

    postId,

    metadata: {
      title:
        post.title,

      slug:
        post.slug,
    },
  });


  revalidateBlog();


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// AUDIT
// =========================================================

async function writeBlogAuditLog({
  adminId,
  action,
  postId,
  metadata,
}: {
  adminId:
    string;

  action:
    string;

  postId:
    string;

  metadata:
    Record<
      string,
      unknown
    >;
}) {
  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase
      .from(
        "activity_logs",
      )
      .insert({
        actor_id:
          adminId,

        action,

        entity_type:
          "blog_post",

        entity_id:
          postId,

        metadata,
      });


  if (
    error
  ) {
    console.error(
      "Blog audit log failed:",
      error,
    );
  }
}


// =========================================================
// REVALIDATION
// =========================================================

function revalidateBlog() {
  revalidatePath(
    "/admin/blog",
  );

  revalidatePath(
    "/blog",
  );

  revalidatePath(
    "/",
  );
} 