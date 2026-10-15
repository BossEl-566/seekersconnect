import type {
  RequestCatalogField,
} from "@/types/request-catalog";

import {
  isUploadFieldType,
} from "@/lib/request/dynamic-field-runtime";


// =========================================================
// GLOBAL LIMITS
// =========================================================

export const GLOBAL_REQUEST_UPLOAD_MAX_MB =
  10;


export const GLOBAL_REQUEST_UPLOAD_MAX_BYTES =
  GLOBAL_REQUEST_UPLOAD_MAX_MB *
  1024 *
  1024;


// =========================================================
// PLATFORM-SUPPORTED MIME TYPES
// =========================================================

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


const DOCUMENT_MIME_TYPES = [
  "application/pdf",

  "image/jpeg",
  "image/png",
  "image/webp",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];


const GENERIC_MIME_TYPES = [
  ...DOCUMENT_MIME_TYPES,

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];


// =========================================================
// TYPES
// =========================================================

export type RequestUploadFallback = {
  sent:
    boolean;

  reference:
    string;
};


export type RequestUploadFallbackMap =
  Record<
    string,
    RequestUploadFallback
  >;


export type RequestUploadMetadata = {
  fieldId:
    string;

  fieldKey:
    string;

  fieldLabel:
    string;

  source:
    | "UPLOAD"
    | "EMAIL_FALLBACK";

  storagePath:
    string | null;

  originalFilename:
    string | null;

  mimeType:
    string | null;

  sizeBytes:
    number | null;

  emailReference:
    string | null;
};


// =========================================================
// MAXIMUM FILE COUNT
// =========================================================

export function getUploadMaximumFiles(
  field:
    RequestCatalogField,
) {
  const configured =
    field.validationRules
      .maxFiles;


  if (
    configured ===
      null ||
    !Number.isFinite(
      configured,
    ) ||
    configured <
      1
  ) {
    return 1;
  }


  return Math.min(
    Math.floor(
      configured,
    ),
    20,
  );
}


// =========================================================
// MAXIMUM SIZE
// =========================================================

export function getUploadMaximumBytes(
  field:
    RequestCatalogField,
) {
  const configured =
    field.validationRules
      .maxFileSizeMb;


  if (
    configured ===
      null ||
    !Number.isFinite(
      configured,
    ) ||
    configured <=
      0
  ) {
    return GLOBAL_REQUEST_UPLOAD_MAX_BYTES;
  }


  return (
    Math.min(
      configured,
      GLOBAL_REQUEST_UPLOAD_MAX_MB,
    ) *
    1024 *
    1024
  );
}


export function getUploadMaximumMb(
  field:
    RequestCatalogField,
) {
  return (
    getUploadMaximumBytes(
      field,
    ) /
    1024 /
    1024
  );
}


// =========================================================
// DEFAULT TYPES FOR FIELD
// =========================================================

function defaultAcceptedTypes(
  field:
    RequestCatalogField,
) {
  if (
    field.type ===
    "image"
  ) {
    return IMAGE_MIME_TYPES;
  }


  if (
    field.type ===
    "document"
  ) {
    return DOCUMENT_MIME_TYPES;
  }


  return GENERIC_MIME_TYPES;
}


// =========================================================
// ADMIN-CONFIGURED ACCEPT RULES
// =========================================================

export function getAcceptedUploadTypes(
  field:
    RequestCatalogField,
) {
  const configured =
    field.validationRules
      .accept
      .map(
        (
          value,
        ) =>
          value
            .trim()
            .toLowerCase(),
      )
      .filter(
        Boolean,
      );


  if (
    configured.length >
    0
  ) {
    return configured;
  }


  return defaultAcceptedTypes(
    field,
  );
}


export function getUploadAcceptAttribute(
  field:
    RequestCatalogField,
) {
  return getAcceptedUploadTypes(
    field,
  ).join(
    ",",
  );
}


// =========================================================
// FILE TYPE MATCHING
// =========================================================

function fileMatchesAcceptedType(
  file:
    File,

  accepted:
    string[],
) {
  const mimeType =
    file.type
      .trim()
      .toLowerCase();


  const filename =
    file.name
      .trim()
      .toLowerCase();


  return accepted.some(
    (
      rule,
    ) => {
      const normalized =
        rule
          .trim()
          .toLowerCase();


      if (
        !normalized
      ) {
        return false;
      }


      if (
        normalized.startsWith(
          ".",
        )
      ) {
        return filename.endsWith(
          normalized,
        );
      }


      if (
        normalized.endsWith(
          "/*",
        )
      ) {
        return mimeType.startsWith(
          normalized.slice(
            0,
            -1,
          ),
        );
      }


      return (
        mimeType ===
        normalized
      );
    },
  );
}


// =========================================================
// FILE VALIDATION
// =========================================================

export function validateRequestUploadFile(
  field:
    RequestCatalogField,

  file:
    File,
):
  string | null {
  if (
    !isUploadFieldType(
      field.type,
    )
  ) {
    return "This field does not accept file uploads.";
  }


  if (
    file.size <=
    0
  ) {
    return `${file.name} is empty.`;
  }


  if (
    file.size >
    getUploadMaximumBytes(
      field,
    )
  ) {
    return (
      `${file.name} exceeds the ` +
      `${getUploadMaximumMb(field)} MB limit.`
    );
  }


  /*
   * First enforce the hard platform list for the particular
   * field type.
   */
  if (
    !fileMatchesAcceptedType(
      file,
      defaultAcceptedTypes(
        field,
      ),
    )
  ) {
    return `${file.name} is not a supported file type.`;
  }


  /*
   * Then apply the administrator's optional stricter list.
   */
  const configured =
    field.validationRules
      .accept;


  if (
    configured.length >
      0 &&
    !fileMatchesAcceptedType(
      file,
      configured,
    )
  ) {
    return `${file.name} is not an accepted file type for ${field.label}.`;
  }


  return null;
}


// =========================================================
// COMPLETE FIELD SELECTION VALIDATION
// =========================================================

export function validateRequestUploadSelection(
  field:
    RequestCatalogField,

  files:
    File[],

  fallback:
    RequestUploadFallback
    | undefined,
):
  string | null {
  const emailFallback =
    fallback ?? {
      sent:
        false,

      reference:
        "",
    };


  if (
    files.length >
      0 &&
    emailFallback.sent
  ) {
    return (
      `${field.label}: choose either direct upload ` +
      `or email fallback, not both.`
    );
  }


  const maximumFiles =
    getUploadMaximumFiles(
      field,
    );


  if (
    files.length >
    maximumFiles
  ) {
    return (
      `${field.label} allows a maximum of ` +
      `${maximumFiles} file${maximumFiles === 1 ? "" : "s"}.`
    );
  }


  for (
    const file of
    files
  ) {
    const error =
      validateRequestUploadFile(
        field,
        file,
      );


    if (
      error
    ) {
      return error;
    }
  }


  if (
    emailFallback.sent
  ) {
    if (
      emailFallback
        .reference
        .trim()
        .length <
      3
    ) {
      return (
        `Enter the email subject or reference used for ` +
        `${field.label}.`
      );
    }


    return null;
  }


  if (
    field.required &&
    files.length ===
      0
  ) {
    return `${field.label} is required.`;
  }


  return null;
}


// =========================================================
// STORAGE PATH
// =========================================================

export function createRequestUploadStoragePath(
  requestId:
    string,

  field:
    RequestCatalogField,

  file:
    File,

  uniqueId:
    string,
) {
  const extension =
    safeExtension(
      file.name,
    );


  const filename =
    extension
      ? `${uniqueId}.${extension}`
      : uniqueId;


  return (
    `requests/${requestId}/` +
    `${safePathSegment(field.key)}/` +
    filename
  );
}


// =========================================================
// SAFE PATH HELPERS
// =========================================================

function safePathSegment(
  value:
    string,
) {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );


  return normalized ||
    "field";
}


function safeExtension(
  filename:
    string,
) {
  const match =
    filename
      .trim()
      .toLowerCase()
      .match(
        /\.([a-z0-9]{1,10})$/,
      );


  return match?.[1] ??
    "";
}