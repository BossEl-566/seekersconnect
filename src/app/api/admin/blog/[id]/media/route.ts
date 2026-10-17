import {
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";


type RouteContext = {
  params:
    Promise<{
      id:
        string;
    }>;
};


type MediaKind =
  | "COVER_IMAGE"
  | "CONTENT_IMAGE";


const BLOG_MEDIA_BUCKET =
  "blog-media";


const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const ALLOWED_IMAGE_TYPES:
  Record<
    string,
    string
  > = {
    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",
  };


function errorResponse(
  message:
    string,

  status =
    400,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status,
    },
  );
}


function stringEntry(
  value:
    FormDataEntryValue
    | null,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


// =========================================================
// UPLOAD
// =========================================================

export async function POST(
  request:
    Request,

  context:
    RouteContext,
) {
  const admin =
    await requireSuperAdmin();


  const {
    id:
      postId,
  } =
    await context.params;


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
      .select(
        "id, title, slug",
      )
      .eq(
        "id",
        postId,
      )
      .maybeSingle();


  if (
    postError
  ) {
    console.error(
      "Blog media post lookup failed:",
      postError,
    );


    return errorResponse(
      "The blog post could not be checked.",
      500,
    );
  }


  if (
    !post
  ) {
    return errorResponse(
      "Blog post not found.",
      404,
    );
  }


  let formData:
    FormData;


  try {
    formData =
      await request.formData();
  } catch {
    return errorResponse(
      "Invalid upload request.",
    );
  }


  const mediaKind =
    stringEntry(
      formData.get(
        "mediaKind",
      ),
    ) as MediaKind;


  const title =
    stringEntry(
      formData.get(
        "title",
      ),
    );


  const altText =
    stringEntry(
      formData.get(
        "altText",
      ),
    );


  const orderText =
    stringEntry(
      formData.get(
        "displayOrder",
      ),
    );


  const fileValue =
    formData.get(
      "file",
    );


  if (
    mediaKind !==
      "COVER_IMAGE" &&
    mediaKind !==
      "CONTENT_IMAGE"
  ) {
    return errorResponse(
      "Select a valid blog image type.",
    );
  }


  if (
    !(fileValue instanceof
      File)
  ) {
    return errorResponse(
      "Select an image.",
    );
  }


  if (
    fileValue.size <=
    0
  ) {
    return errorResponse(
      "The selected image is empty.",
    );
  }


  if (
    fileValue.size >
    MAX_FILE_SIZE
  ) {
    return errorResponse(
      "Blog images must be 10 MB or smaller.",
    );
  }


  const extension =
    ALLOWED_IMAGE_TYPES[
      fileValue.type
    ];


  if (
    !extension
  ) {
    return errorResponse(
      "Blog images must be JPG, PNG or WEBP.",
    );
  }


  if (
    title.length >
    250 ||
    altText.length >
    300
  ) {
    return errorResponse(
      "The image title or alternative text is too long.",
    );
  }


  const parsedOrder =
    orderText
      ? Number(
          orderText,
        )
      : 0;


  if (
    !Number.isInteger(
      parsedOrder,
    ) ||
    parsedOrder <
      0
  ) {
    return errorResponse(
      "Display order must be a non-negative whole number.",
    );
  }


  const folder =
    mediaKind ===
    "COVER_IMAGE"
      ? "cover"
      : "content";


  const storagePath =
    `posts/${postId}/${folder}/${randomUUID()}.${extension}`;


  let buffer:
    ArrayBuffer;


  try {
    buffer =
      await fileValue.arrayBuffer();
  } catch {
    return errorResponse(
      "The image could not be read.",
      500,
    );
  }


  const {
    error:
      uploadError,
  } =
    await supabase.storage
      .from(
        BLOG_MEDIA_BUCKET,
      )
      .upload(
        storagePath,
        buffer,
        {
          contentType:
            fileValue.type,

          cacheControl:
            "3600",

          upsert:
            false,
        },
      );


  if (
    uploadError
  ) {
    console.error(
      "Blog media upload failed:",
      uploadError,
    );


    return errorResponse(
      "The blog image could not be uploaded.",
      500,
    );
  }


  // =======================================================
  // REPLACE COVER
  // =======================================================

  if (
    mediaKind ===
    "COVER_IMAGE"
  ) {
    const {
      data:
        existingCover,

      error:
        existingError,
    } =
      await supabase
        .from(
          "blog_post_media",
        )
        .select(`
          id,
          storage_bucket,
          storage_path
        `)
        .eq(
          "blog_post_id",
          postId,
        )
        .eq(
          "media_kind",
          "COVER_IMAGE",
        )
        .maybeSingle();


    if (
      existingError
    ) {
      await supabase.storage
        .from(
          BLOG_MEDIA_BUCKET,
        )
        .remove([
          storagePath,
        ]);


      return errorResponse(
        "The existing cover image could not be checked.",
        500,
      );
    }


    if (
      existingCover
    ) {
      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "blog_post_media",
          )
          .update({
            title:
              title ||
              null,

            alt_text:
              altText ||
              null,

            storage_bucket:
              BLOG_MEDIA_BUCKET,

            storage_path:
              storagePath,

            original_filename:
              fileValue.name,

            mime_type:
              fileValue.type,

            size_bytes:
              fileValue.size,

            display_order:
              parsedOrder,

            active:
              true,
          })
          .eq(
            "id",
            existingCover.id,
          );


      if (
        updateError
      ) {
        await supabase.storage
          .from(
            BLOG_MEDIA_BUCKET,
          )
          .remove([
            storagePath,
          ]);


        return errorResponse(
          "The cover image could not be replaced.",
          500,
        );
      }


      if (
        existingCover.storage_path !==
        storagePath
      ) {
        const {
          error:
            cleanupError,
        } =
          await supabase.storage
            .from(
              existingCover.storage_bucket ||
                BLOG_MEDIA_BUCKET,
            )
            .remove([
              existingCover.storage_path,
            ]);


        if (
          cleanupError
        ) {
          console.error(
            "Previous blog cover cleanup failed:",
            cleanupError,
          );
        }
      }


      await auditMedia({
        adminId:
          admin.id,

        postId,

        action:
          "BLOG_COVER_REPLACED",

        metadata: {
          storage_path:
            storagePath,

          title:
            title ||
            null,
        },
      });


      return NextResponse.json({
        success:
          true,

        message:
          "Cover image replaced successfully.",
      });
    }
  }


  // =======================================================
  // CREATE MEDIA RECORD
  // =======================================================

  const {
    data:
      created,

    error:
      insertError,
  } =
    await supabase
      .from(
        "blog_post_media",
      )
      .insert({
        blog_post_id:
          postId,

        media_kind:
          mediaKind,

        title:
          title ||
          null,

        alt_text:
          altText ||
          null,

        storage_bucket:
          BLOG_MEDIA_BUCKET,

        storage_path:
          storagePath,

        original_filename:
          fileValue.name,

        mime_type:
          fileValue.type,

        size_bytes:
          fileValue.size,

        display_order:
          parsedOrder,

        active:
          true,

        created_by:
          admin.id,
      })
      .select(
        "id",
      )
      .single();


  if (
    insertError ||
    !created
  ) {
    console.error(
      "Blog media DB insert failed:",
      insertError,
    );


    await supabase.storage
      .from(
        BLOG_MEDIA_BUCKET,
      )
      .remove([
        storagePath,
      ]);


    return errorResponse(
      "The blog image information could not be saved.",
      500,
    );
  }


  await auditMedia({
    adminId:
      admin.id,

    postId,

    action:
      "BLOG_MEDIA_CREATED",

    metadata: {
      media_id:
        created.id,

      media_kind:
        mediaKind,

      storage_path:
        storagePath,
    },
  });


  return NextResponse.json(
    {
      success:
        true,

      message:
        mediaKind ===
        "COVER_IMAGE"
          ? "Cover image uploaded successfully."
          : "Content image uploaded successfully.",
    },
    {
      status:
        201,
    },
  );
}


// =========================================================
// DELETE IMAGE
// =========================================================

export async function DELETE(
  request:
    Request,

  context:
    RouteContext,
) {
  const admin =
    await requireSuperAdmin();


  const {
    id:
      postId,
  } =
    await context.params;


  const mediaId =
    new URL(
      request.url,
    ).searchParams
      .get(
        "mediaId",
      )
      ?.trim() ??
    "";


  if (
    !mediaId
  ) {
    return errorResponse(
      "Media ID is required.",
    );
  }


  const supabase =
    createAdminClient();


  const {
    data:
      media,

    error:
      lookupError,
  } =
    await supabase
      .from(
        "blog_post_media",
      )
      .select(`
        id,
        media_kind,
        storage_bucket,
        storage_path
      `)
      .eq(
        "id",
        mediaId,
      )
      .eq(
        "blog_post_id",
        postId,
      )
      .maybeSingle();


  if (
    lookupError
  ) {
    return errorResponse(
      "The blog image could not be loaded.",
      500,
    );
  }


  if (
    !media
  ) {
    return errorResponse(
      "Blog image not found.",
      404,
    );
  }


  const {
    error:
      deleteError,
  } =
    await supabase
      .from(
        "blog_post_media",
      )
      .delete()
      .eq(
        "id",
        mediaId,
      );


  if (
    deleteError
  ) {
    return errorResponse(
      "The blog image could not be deleted.",
      500,
    );
  }


  const {
    error:
      storageError,
  } =
    await supabase.storage
      .from(
        media.storage_bucket ||
        BLOG_MEDIA_BUCKET,
      )
      .remove([
        media.storage_path,
      ]);


  if (
    storageError
  ) {
    console.error(
      "Blog media storage deletion failed:",
      storageError,
    );
  }


  await auditMedia({
    adminId:
      admin.id,

    postId,

    action:
      "BLOG_MEDIA_DELETED",

    metadata: {
      media_id:
        mediaId,

      media_kind:
        media.media_kind,

      storage_path:
        media.storage_path,
    },
  });


  return NextResponse.json({
    success:
      true,

    message:
      "Blog image deleted.",
  });
}


// =========================================================
// AUDIT
// =========================================================

async function auditMedia({
  adminId,
  postId,
  action,
  metadata,
}: {
  adminId:
    string;

  postId:
    string;

  action:
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
      "Blog media audit failed:",
      error,
    );
  }
}