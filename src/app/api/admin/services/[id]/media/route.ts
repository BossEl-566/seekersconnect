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


// =========================================================
// TYPES
// =========================================================

type RouteContext = {
  params:
    Promise<{
      id:
        string;
    }>;
};


type MediaKind =
  | "HERO_IMAGE"
  | "GALLERY_IMAGE"
  | "DOWNLOAD";


type ServiceMediaRow = {
  id:
    string;

  service_id:
    string;

  media_kind:
    MediaKind;

  storage_bucket:
    string;

  storage_path:
    string;
};


// =========================================================
// CONSTANTS
// =========================================================

const SERVICE_MEDIA_BUCKET =
  "service-media";


const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const DOWNLOAD_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",

    "application/pdf",

    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);


const EXTENSION_BY_MIME:
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

    "application/pdf":
      "pdf",

    "application/msword":
      "doc",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",

    "application/vnd.ms-excel":
      "xls",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "xlsx",
  };


// =========================================================
// RESPONSE HELPERS
// =========================================================

function badRequest(
  message:
    string,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status:
        400,
    },
  );
}


function serverError(
  message:
    string,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status:
        500,
    },
  );
}


// =========================================================
// STRING HELPERS
// =========================================================

function textValue(
  value:
    FormDataEntryValue
    | null,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function validMediaKind(
  value:
    string,
):
  value is MediaKind {
  return (
    value ===
      "HERO_IMAGE" ||
    value ===
      "GALLERY_IMAGE" ||
    value ===
      "DOWNLOAD"
  );
}


function folderForMediaKind(
  mediaKind:
    MediaKind,
) {
  switch (
    mediaKind
  ) {
    case "HERO_IMAGE":
      return "hero";

    case "GALLERY_IMAGE":
      return "gallery";

    case "DOWNLOAD":
      return "downloads";
  }
}


// =========================================================
// REVALIDATION-FRIENDLY PUBLIC URL
// =========================================================

function publicMediaUrl(
  supabase:
    ReturnType<
      typeof createAdminClient
    >,

  path:
    string,
) {
  const {
    data,
  } =
    supabase.storage
      .from(
        SERVICE_MEDIA_BUCKET,
      )
      .getPublicUrl(
        path,
      );


  return data.publicUrl;
}


// =========================================================
// POST — UPLOAD MEDIA
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
      serviceId,
  } =
    await context.params;


  const supabase =
    createAdminClient();


  // =======================================================
  // VERIFY SERVICE
  // =======================================================

  const {
    data:
      service,

    error:
      serviceError,
  } =
    await supabase
      .from(
        "services",
      )
      .select(`
        id,
        slug,
        name
      `)
      .eq(
        "id",
        serviceId,
      )
      .maybeSingle();


  if (
    serviceError
  ) {
    console.error(
      "Service media service lookup failed:",
      serviceError,
    );


    return serverError(
      "The service could not be validated.",
    );
  }


  if (
    !service
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Service not found.",
      },
      {
        status:
          404,
      },
    );
  }


  // =======================================================
  // READ MULTIPART
  // =======================================================

  let formData:
    FormData;


  try {
    formData =
      await request.formData();
  } catch (
    error
  ) {
    console.error(
      "Service media multipart parsing failed:",
      error,
    );


    return badRequest(
      "The uploaded media information is invalid.",
    );
  }


  const mediaKind =
    textValue(
      formData.get(
        "mediaKind",
      ),
    );


  const title =
    textValue(
      formData.get(
        "title",
      ),
    );


  const description =
    textValue(
      formData.get(
        "description",
      ),
    );


  const altText =
    textValue(
      formData.get(
        "altText",
      ),
    );


  const displayOrderValue =
    textValue(
      formData.get(
        "displayOrder",
      ),
    );


  const fileValue =
    formData.get(
      "file",
    );


  // =======================================================
  // VALIDATE MEDIA KIND
  // =======================================================

  if (
    !validMediaKind(
      mediaKind,
    )
  ) {
    return badRequest(
      "Select a valid media type.",
    );
  }


  // =======================================================
  // VALIDATE TITLE
  // =======================================================

  if (
    !title
  ) {
    return badRequest(
      "Enter a title for the media item.",
    );
  }


  if (
    title.length >
    200
  ) {
    return badRequest(
      "The media title must be 200 characters or fewer.",
    );
  }


  if (
    description.length >
    2000
  ) {
    return badRequest(
      "The description must be 2,000 characters or fewer.",
    );
  }


  if (
    altText.length >
    300
  ) {
    return badRequest(
      "Alternative text must be 300 characters or fewer.",
    );
  }


  // =======================================================
  // DISPLAY ORDER
  // =======================================================

  let displayOrder =
    0;


  if (
    displayOrderValue
  ) {
    const parsed =
      Number(
        displayOrderValue,
      );


    if (
      !Number.isInteger(
        parsed,
      ) ||
      parsed <
        0 ||
      parsed >
        100000
    ) {
      return badRequest(
        "Display order must be a whole number between 0 and 100000.",
      );
    }


    displayOrder =
      parsed;
  }


  // =======================================================
  // FILE VALIDATION
  // =======================================================

  if (
    !(fileValue instanceof
      File)
  ) {
    return badRequest(
      "Select a file to upload.",
    );
  }


  const file =
    fileValue;


  if (
    file.size <=
    0
  ) {
    return badRequest(
      "The selected file is empty.",
    );
  }


  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    return badRequest(
      "Service media must be 10 MB or smaller.",
    );
  }


  const allowedTypes =
    mediaKind ===
      "DOWNLOAD"
      ? DOWNLOAD_TYPES
      : IMAGE_TYPES;


  if (
    !allowedTypes.has(
      file.type,
    )
  ) {
    return badRequest(
      mediaKind ===
        "DOWNLOAD"
        ? "Downloads must be PDF, Word, Excel, JPG, PNG or WEBP files."
        : "Service images must be JPG, PNG or WEBP files.",
    );
  }


  const extension =
    EXTENSION_BY_MIME[
      file.type
    ];


  if (
    !extension
  ) {
    return badRequest(
      "The selected file type is not supported.",
    );
  }


  // =======================================================
  // STORAGE PATH
  // =======================================================

  const folder =
    folderForMediaKind(
      mediaKind,
    );


  const storagePath =
    `services/${serviceId}/${folder}/${randomUUID()}.${extension}`;


  // =======================================================
  // UPLOAD OBJECT FIRST
  // =======================================================

  let buffer:
    ArrayBuffer;


  try {
    buffer =
      await file.arrayBuffer();
  } catch (
    error
  ) {
    console.error(
      "Service media file read failed:",
      error,
    );


    return serverError(
      "The selected file could not be read.",
    );
  }


  const {
    error:
      uploadError,
  } =
    await supabase.storage
      .from(
        SERVICE_MEDIA_BUCKET,
      )
      .upload(
        storagePath,
        buffer,
        {
          contentType:
            file.type,

          upsert:
            false,

          cacheControl:
            "3600",
        },
      );


  if (
    uploadError
  ) {
    console.error(
      "Service media upload failed:",
      uploadError,
    );


    return serverError(
      "The media file could not be uploaded.",
    );
  }


  // =======================================================
  // HERO IMAGE
  //
  // Hero images are replaced atomically at the DB level:
  //
  // 1. upload new object
  // 2. update existing hero row OR insert new hero row
  // 3. only after DB success remove previous object
  // =======================================================

  if (
    mediaKind ===
    "HERO_IMAGE"
  ) {
    const {
      data:
        existingHero,

      error:
        existingHeroError,
    } =
      await supabase
        .from(
          "service_media",
        )
        .select(`
          id,
          service_id,
          media_kind,
          storage_bucket,
          storage_path
        `)
        .eq(
          "service_id",
          serviceId,
        )
        .eq(
          "media_kind",
          "HERO_IMAGE",
        )
        .maybeSingle();


    if (
      existingHeroError
    ) {
      console.error(
        "Existing service hero lookup failed:",
        existingHeroError,
      );


      await supabase.storage
        .from(
          SERVICE_MEDIA_BUCKET,
        )
        .remove([
          storagePath,
        ]);


      return serverError(
        "The existing service image could not be checked.",
      );
    }


    if (
      existingHero
    ) {
      const oldHero =
        existingHero as
          ServiceMediaRow;


      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "service_media",
          )
          .update({
            title,

            description:
              description ||
              null,

            alt_text:
              altText ||
              null,

            storage_bucket:
              SERVICE_MEDIA_BUCKET,

            storage_path:
              storagePath,

            original_filename:
              file.name,

            mime_type:
              file.type,

            size_bytes:
              file.size,

            display_order:
              displayOrder,

            active:
              true,
          })
          .eq(
            "id",
            oldHero.id,
          )
          .eq(
            "service_id",
            serviceId,
          );


      if (
        updateError
      ) {
        console.error(
          "Service hero replacement failed:",
          updateError,
        );


        await supabase.storage
          .from(
            SERVICE_MEDIA_BUCKET,
          )
          .remove([
            storagePath,
          ]);


        return serverError(
          "The service hero image could not be replaced.",
        );
      }


      // ---------------------------------------------------
      // BACKWARDS-COMPATIBLE SERVICE IMAGE URL
      // ---------------------------------------------------

      const heroPublicUrl =
        publicMediaUrl(
          supabase,
          storagePath,
        );


      const {
        error:
          serviceImageError,
      } =
        await supabase
          .from(
            "services",
          )
          .update({
            image_url:
              heroPublicUrl,
          })
          .eq(
            "id",
            serviceId,
          );


      if (
        serviceImageError
      ) {
        console.error(
          "Service image_url synchronization failed:",
          serviceImageError,
        );
      }


      // ---------------------------------------------------
      // DELETE OLD HERO OBJECT
      // ---------------------------------------------------

      if (
        oldHero.storage_path &&
        oldHero.storage_path !==
          storagePath
      ) {
        const {
          error:
            oldObjectError,
        } =
          await supabase.storage
            .from(
              oldHero.storage_bucket ||
                SERVICE_MEDIA_BUCKET,
            )
            .remove([
              oldHero.storage_path,
            ]);


        if (
          oldObjectError
        ) {
          console.error(
            "Previous service hero cleanup failed:",
            oldObjectError,
          );
        }
      }


      await writeAuditLog({
        supabase,

        adminId:
          admin.id,

        serviceId,

        action:
          "SERVICE_HERO_REPLACED",

        metadata: {
          service_name:
            service.name,

          service_slug:
            service.slug,

          media_kind:
            mediaKind,

          title,

          storage_path:
            storagePath,
        },
      });


      return NextResponse.json(
        {
          success:
            true,

          message:
            "Service hero image replaced successfully.",
        },
        {
          status:
            200,
        },
      );
    }
  }


  // =======================================================
  // CREATE NEW MEDIA RECORD
  // =======================================================

  const {
    data:
      media,

    error:
      insertError,
  } =
    await supabase
      .from(
        "service_media",
      )
      .insert({
        service_id:
          serviceId,

        media_kind:
          mediaKind,

        title,

        description:
          description ||
          null,

        alt_text:
          altText ||
          null,

        storage_bucket:
          SERVICE_MEDIA_BUCKET,

        storage_path:
          storagePath,

        original_filename:
          file.name,

        mime_type:
          file.type,

        size_bytes:
          file.size,

        display_order:
          displayOrder,

        active:
          true,

        created_by:
          admin.id,
      })
      .select(`
        id
      `)
      .single();


  if (
    insertError ||
    !media
  ) {
    console.error(
      "Service media database insert failed:",
      insertError,
    );


    await supabase.storage
      .from(
        SERVICE_MEDIA_BUCKET,
      )
      .remove([
        storagePath,
      ]);


    return serverError(
      "The media information could not be saved.",
    );
  }


  // =======================================================
  // SYNC HERO WITH services.image_url
  // =======================================================

  if (
    mediaKind ===
    "HERO_IMAGE"
  ) {
    const heroPublicUrl =
      publicMediaUrl(
        supabase,
        storagePath,
      );


    const {
      error:
        serviceImageError,
    } =
      await supabase
        .from(
          "services",
        )
        .update({
          image_url:
            heroPublicUrl,
        })
        .eq(
          "id",
          serviceId,
        );


    if (
      serviceImageError
    ) {
      console.error(
        "Service image_url synchronization failed:",
        serviceImageError,
      );
    }
  }


  // =======================================================
  // AUDIT
  // =======================================================

  await writeAuditLog({
    supabase,

    adminId:
      admin.id,

    serviceId,

    action:
      "SERVICE_MEDIA_CREATED",

    metadata: {
      media_id:
        media.id,

      service_name:
        service.name,

      service_slug:
        service.slug,

      media_kind:
        mediaKind,

      title,

      storage_path:
        storagePath,

      original_filename:
        file.name,

      mime_type:
        file.type,

      size_bytes:
        file.size,
    },
  });


  return NextResponse.json(
    {
      success:
        true,

      message:
        mediaKind ===
        "HERO_IMAGE"
          ? "Service hero image uploaded successfully."
          : mediaKind ===
              "GALLERY_IMAGE"
            ? "Gallery image uploaded successfully."
            : "Downloadable file uploaded successfully.",
    },
    {
      status:
        201,
    },
  );
}


// =========================================================
// PATCH — ENABLE / DISABLE
// =========================================================

export async function PATCH(
  request:
    Request,

  context:
    RouteContext,
) {
  const admin =
    await requireSuperAdmin();


  const {
    id:
      serviceId,
  } =
    await context.params;


  let body:
    unknown;


  try {
    body =
      await request.json();
  } catch {
    return badRequest(
      "Invalid media update.",
    );
  }


  if (
    !body ||
    typeof body !==
      "object" ||
    Array.isArray(
      body,
    )
  ) {
    return badRequest(
      "Invalid media update.",
    );
  }


  const record =
    body as
      Record<
        string,
        unknown
      >;


  const mediaId =
    typeof record.mediaId ===
      "string"
      ? record.mediaId
          .trim()
      : "";


  const active =
    record.active;


  if (
    !mediaId ||
    typeof active !==
      "boolean"
  ) {
    return badRequest(
      "Invalid media update.",
    );
  }


  const supabase =
    createAdminClient();


  const {
    data:
      media,

    error:
      mediaError,
  } =
    await supabase
      .from(
        "service_media",
      )
      .select(`
        id,
        service_id,
        media_kind,
        storage_bucket,
        storage_path
      `)
      .eq(
        "id",
        mediaId,
      )
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    mediaError
  ) {
    console.error(
      "Service media lookup failed:",
      mediaError,
    );


    return serverError(
      "The media item could not be loaded.",
    );
  }


  if (
    !media
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Media item not found.",
      },
      {
        status:
          404,
      },
    );
  }


  const typedMedia =
    media as
      ServiceMediaRow;


  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "service_media",
      )
      .update({
        active,
      })
      .eq(
        "id",
        mediaId,
      )
      .eq(
        "service_id",
        serviceId,
      );


  if (
    updateError
  ) {
    console.error(
      "Service media status update failed:",
      updateError,
    );


    return serverError(
      "The media status could not be updated.",
    );
  }


  // =======================================================
  // HERO IMAGE BACKWARDS COMPATIBILITY
  // =======================================================

  if (
    typedMedia.media_kind ===
    "HERO_IMAGE"
  ) {
    const imageUrl =
      active
        ? publicMediaUrl(
            supabase,
            typedMedia.storage_path,
          )
        : null;


    const {
      error:
        serviceImageError,
    } =
      await supabase
        .from(
          "services",
        )
        .update({
          image_url:
            imageUrl,
        })
        .eq(
          "id",
          serviceId,
        );


    if (
      serviceImageError
    ) {
      console.error(
        "Service image_url status synchronization failed:",
        serviceImageError,
      );
    }
  }


  await writeAuditLog({
    supabase,

    adminId:
      admin.id,

    serviceId,

    action:
      active
        ? "SERVICE_MEDIA_ENABLED"
        : "SERVICE_MEDIA_DISABLED",

    metadata: {
      media_id:
        mediaId,

      media_kind:
        typedMedia.media_kind,

      active,
    },
  });


  return NextResponse.json({
    success:
      true,

    message:
      active
        ? "Media item enabled."
        : "Media item disabled.",
  });
}


// =========================================================
// DELETE — REMOVE MEDIA
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
      serviceId,
  } =
    await context.params;


  const url =
    new URL(
      request.url,
    );


  const mediaId =
    url.searchParams
      .get(
        "mediaId",
      )
      ?.trim() ??
    "";


  if (
    !mediaId
  ) {
    return badRequest(
      "Media ID is required.",
    );
  }


  const supabase =
    createAdminClient();


  // =======================================================
  // LOAD MEDIA FIRST
  // =======================================================

  const {
    data:
      media,

    error:
      mediaError,
  } =
    await supabase
      .from(
        "service_media",
      )
      .select(`
        id,
        service_id,
        media_kind,
        storage_bucket,
        storage_path,
        title
      `)
      .eq(
        "id",
        mediaId,
      )
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    mediaError
  ) {
    console.error(
      "Service media deletion lookup failed:",
      mediaError,
    );


    return serverError(
      "The media item could not be loaded.",
    );
  }


  if (
    !media
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Media item not found.",
      },
      {
        status:
          404,
      },
    );
  }


  // =======================================================
  // DELETE DATABASE ROW FIRST
  //
  // If storage cleanup subsequently fails, the result is an
  // orphaned object rather than a public DB row pointing to
  // a missing file.
  // =======================================================

  const {
    error:
      deleteError,
  } =
    await supabase
      .from(
        "service_media",
      )
      .delete()
      .eq(
        "id",
        mediaId,
      )
      .eq(
        "service_id",
        serviceId,
      );


  if (
    deleteError
  ) {
    console.error(
      "Service media database deletion failed:",
      deleteError,
    );


    return serverError(
      "The media item could not be deleted.",
    );
  }


  // =======================================================
  // HERO URL
  // =======================================================

  if (
    media.media_kind ===
    "HERO_IMAGE"
  ) {
    const {
      error:
        serviceImageError,
    } =
      await supabase
        .from(
          "services",
        )
        .update({
          image_url:
            null,
        })
        .eq(
          "id",
          serviceId,
        );


    if (
      serviceImageError
    ) {
      console.error(
        "Service image_url cleanup failed:",
        serviceImageError,
      );
    }
  }


  // =======================================================
  // STORAGE CLEANUP
  // =======================================================

  const {
    error:
      storageDeleteError,
  } =
    await supabase.storage
      .from(
        media.storage_bucket ||
          SERVICE_MEDIA_BUCKET,
      )
      .remove([
        media.storage_path,
      ]);


  if (
    storageDeleteError
  ) {
    /*
     * DB deletion succeeded, so there is no broken media
     * record. Log the object orphan for later cleanup.
     */
    console.error(
      "Service media storage cleanup failed:",
      storageDeleteError,
    );
  }


  // =======================================================
  // AUDIT
  // =======================================================

  await writeAuditLog({
    supabase,

    adminId:
      admin.id,

    serviceId,

    action:
      "SERVICE_MEDIA_DELETED",

    metadata: {
      media_id:
        mediaId,

      media_kind:
        media.media_kind,

      title:
        media.title,

      storage_path:
        media.storage_path,
    },
  });


  return NextResponse.json({
    success:
      true,

    message:
      "Media item deleted.",
  });
}


// =========================================================
// AUDIT LOG
// =========================================================

async function writeAuditLog({
  supabase,
  adminId,
  serviceId,
  action,
  metadata,
}: {
  supabase:
    ReturnType<
      typeof createAdminClient
    >;

  adminId:
    string;

  serviceId:
    string;

  action:
    string;

  metadata:
    Record<
      string,
      unknown
    >;
}) {
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
          "service",

        entity_id:
          serviceId,

        metadata,
      });


  if (
    error
  ) {
    console.error(
      "Service media audit log failed:",
      error,
    );
  }
}