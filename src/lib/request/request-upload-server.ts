import "server-only";

import {
  randomUUID,
} from "crypto";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  RequestCatalogField,
} from "@/types/request-catalog";

import {
  isUploadFieldType,
} from "@/lib/request/dynamic-field-runtime";

import {
  createRequestUploadStoragePath,
  validateRequestUploadSelection,
  type RequestUploadFallbackMap,
  type RequestUploadMetadata,
} from "@/lib/request/request-upload";


// =========================================================
// ERROR
// =========================================================

export class RequestUploadValidationError
  extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "RequestUploadValidationError";
  }
}


// =========================================================
// RESULT
// =========================================================

export type UploadedRequestFilesResult = {
  metadata:
    RequestUploadMetadata[];

  storagePaths:
    string[];
};


// =========================================================
// PARSE EMAIL FALLBACKS
// =========================================================

function parseFallbacks(
  formData:
    FormData,
):
  RequestUploadFallbackMap {
  const value =
    formData.get(
      "requestUploadFallbacks",
    );


  if (
    value ===
    null
  ) {
    return {};
  }


  if (
    typeof value !==
    "string"
  ) {
    throw new RequestUploadValidationError(
      "The upload fallback information is invalid.",
    );
  }


  if (
    value.length >
    50000
  ) {
    throw new RequestUploadValidationError(
      "The upload fallback information is too large.",
    );
  }


  let parsed:
    unknown;


  try {
    parsed =
      JSON.parse(
        value,
      );
  } catch {
    throw new RequestUploadValidationError(
      "The upload fallback information is invalid.",
    );
  }


  if (
    !parsed ||
    typeof parsed !==
      "object" ||
    Array.isArray(
      parsed,
    )
  ) {
    throw new RequestUploadValidationError(
      "The upload fallback information is invalid.",
    );
  }


  const result:
    RequestUploadFallbackMap =
    {};


  for (
    const [
      key,
      item,
    ] of
    Object.entries(
      parsed,
    )
  ) {
    if (
      !item ||
      typeof item !==
        "object" ||
      Array.isArray(
        item,
      )
    ) {
      throw new RequestUploadValidationError(
        "The upload fallback information is invalid.",
      );
    }


    const record =
      item as
        Record<
          string,
          unknown
        >;


    result[
      key
    ] = {
      sent:
        record.sent ===
        true,

      reference:
        typeof record.reference ===
        "string"
          ? record.reference.trim()
          : "",
    };
  }


  return result;
}


// =========================================================
// CLEANUP
// =========================================================

export async function cleanupUploadedRequestFiles(
  paths:
    string[],
) {
  if (
    paths.length ===
    0
  ) {
    return;
  }


  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase.storage
      .from(
        "request-uploads",
      )
      .remove(
        paths,
      );


  if (
    error
  ) {
    console.error(
      "Request upload cleanup failed:",
      error,
    );
  }
}


// =========================================================
// VALIDATE + UPLOAD
// =========================================================

export async function uploadDynamicRequestFiles({
  formData,
  visibleFields,
  requestId,
}: {
  formData:
    FormData;

  visibleFields:
    RequestCatalogField[];

  requestId:
    string;
}):
  Promise<UploadedRequestFilesResult> {
  const uploadFields =
    visibleFields.filter(
      (
        field,
      ) =>
        isUploadFieldType(
          field.type,
        ),
    );


  const uploadFieldIds =
    new Set(
      uploadFields.map(
        (
          field,
        ) =>
          field.id,
      ),
    );


  const uploadFieldKeys =
    new Set(
      uploadFields.map(
        (
          field,
        ) =>
          field.key,
      ),
    );


  const fallbacks =
    parseFallbacks(
      formData,
    );


  // =======================================================
  // REJECT FALLBACKS FOR UNKNOWN / HIDDEN FIELDS
  // =======================================================

  for (
    const [
      key,
      fallback,
    ] of
    Object.entries(
      fallbacks,
    )
  ) {
    if (
      (
        fallback.sent ||
        fallback
          .reference
          .trim()
      ) &&
      !uploadFieldKeys.has(
        key,
      )
    ) {
      throw new RequestUploadValidationError(
        "The submitted upload information does not match the selected service.",
      );
    }
  }


  // =======================================================
  // REJECT FILES FOR UNKNOWN / HIDDEN FIELDS
  // =======================================================

  for (
    const key of
    formData.keys()
  ) {
    if (
      !key.startsWith(
        "requestUpload:",
      )
    ) {
      continue;
    }


    const fieldId =
      key.slice(
        "requestUpload:".length,
      );


    if (
      !uploadFieldIds.has(
        fieldId,
      )
    ) {
      throw new RequestUploadValidationError(
        "The submitted file does not match the selected service.",
      );
    }
  }


  // =======================================================
  // VALIDATE EVERYTHING BEFORE STORAGE
  // =======================================================

  const prepared =
    uploadFields.map(
      (
        field,
      ) => {
        const entries =
          formData.getAll(
            `requestUpload:${field.id}`,
          );


        const files:
          File[] =
          [];


        for (
          const entry of
          entries
        ) {
          if (
            !(entry instanceof File)
          ) {
            throw new RequestUploadValidationError(
              `${field.label} contains invalid upload data.`,
            );
          }


          files.push(
            entry,
          );
        }


        const fallback =
          fallbacks[
            field.key
          ];


        const error =
          validateRequestUploadSelection(
            field,
            files,
            fallback,
          );


        if (
          error
        ) {
          throw new RequestUploadValidationError(
            error,
          );
        }


        return {
          field,
          files,

          fallback:
            fallback ?? {
              sent:
                false,

              reference:
                "",
            },
        };
      },
    );


  // =======================================================
  // STORAGE
  // =======================================================

  const supabase =
    createAdminClient();


  const metadata:
    RequestUploadMetadata[] =
    [];


  const storagePaths:
    string[] =
    [];


  try {
    for (
      const item of
      prepared
    ) {
      const {
        field,
        files,
        fallback,
      } =
        item;


      // ---------------------------------------------------
      // EMAIL FALLBACK
      // ---------------------------------------------------

      if (
        fallback.sent
      ) {
        metadata.push({
          fieldId:
            field.id,

          fieldKey:
            field.key,

          fieldLabel:
            field.label,

          source:
            "EMAIL_FALLBACK",

          storagePath:
            null,

          originalFilename:
            null,

          mimeType:
            null,

          sizeBytes:
            null,

          emailReference:
            fallback
              .reference
              .trim(),
        });


        continue;
      }


      // ---------------------------------------------------
      // DIRECT UPLOAD
      // ---------------------------------------------------

      for (
        const file of
        files
      ) {
        const storagePath =
          createRequestUploadStoragePath(
            requestId,
            field,
            file,
            randomUUID(),
          );


        const buffer =
          await file
            .arrayBuffer();


        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "request-uploads",
            )
            .upload(
              storagePath,
              buffer,
              {
                contentType:
                  file.type,

                upsert:
                  false,
              },
            );


        if (
          uploadError
        ) {
          console.error(
            "Dynamic request upload failed:",
            uploadError,
          );


          throw new Error(
            `We could not upload ${file.name}.`,
          );
        }


        storagePaths.push(
          storagePath,
        );


        metadata.push({
          fieldId:
            field.id,

          fieldKey:
            field.key,

          fieldLabel:
            field.label,

          source:
            "UPLOAD",

          storagePath,

          originalFilename:
            file.name,

          mimeType:
            file.type ||
            null,

          sizeBytes:
            file.size,

          emailReference:
            null,
        });
      }
    }


    return {
      metadata,
      storagePaths,
    };
  } catch (
    error
  ) {
    await cleanupUploadedRequestFiles(
      storagePaths,
    );


    throw error;
  }
}