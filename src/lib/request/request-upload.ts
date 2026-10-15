import {
  randomUUID,
} from "crypto";

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
// DEFAULT MIME TYPES
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
    "UPLOAD"
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
// CONFIG
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
// ACCEPTED FILE TYPES
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
          item,
        ) =>
          item.trim()
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
// HTML ACCEPT
// =========================================================

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


  const maximumBytes =
    getUploadMaximumBytes(
      field,
    );


  if (
    file.size >
    maximumBytes
  ) {
    return (
      `${file.name} exceeds the ` +
      `${getUploadMaximumMb(field)} MB limit.`
    );
  }


  const accepted =
    getAcceptedUploadTypes(
      field,
    );


  if (
    !fileMatchesAcceptedType(
      file,
      accepted,
    )
  ) {
    return `${file.name} is not an accepted file type.`;
  }


  return null;
}


// =========================================================
// FILE-TYPE MATCHING
// =========================================================

function fileMatchesAcceptedType(
  file:
    File,

  accepted:
    string[],
) {
  const mime =
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
        return mime.startsWith(
          normalized.slice(
            0,
            -1,
          ),
        );
      }


      return (
        mime ===
        normalized
      );
    },
  );
}


// =========================================================
// STORAGE FILE NAME
// =========================================================

export function createRequestUploadStoragePath(
  requestId:
    string,

  field:
    RequestCatalogField,

  file:
    File,
) {
  const extension =
    safeExtension(
      file.name,
    );


  const filename =
    extension
      ? `${randomUUID()}.${extension}`
      : randomUUID();


  return (
    `requests/${requestId}/` +
    `${safePathSegment(field.key)}/` +
    filename
  );
}


// =========================================================
// SAFE PATH
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