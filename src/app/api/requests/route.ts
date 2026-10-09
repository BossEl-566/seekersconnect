import {
  randomBytes,
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  requestSubmissionSchema,
} from "@/lib/validation/request-submission";


export const runtime =
  "nodejs";


// =========================================================
// PAYMENT PROOF
//
// This remains 5 MB.
//
// The future 10 MB service-document limit is separate from
// payment-proof uploads.
// =========================================================

const MAX_FILE_SIZE =
  5 * 1024 * 1024;


const ALLOWED_FILES = {
  "image/jpeg":
    "jpg",

  "image/png":
    "png",

  "image/webp":
    "webp",

  "application/pdf":
    "pdf",
} as const;


// =========================================================
// DYNAMIC FIELD TYPES
// =========================================================

const SUPPORTED_FIELD_TYPES =
  new Set([
    "text",
    "email",
    "tel",
    "number",
    "date",
    "textarea",
    "select",
  ]);


// =========================================================
// DATABASE TYPES
// =========================================================

type DatabaseUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;
};


type DatabaseService = {
  id:
    string;

  university_id:
    | string
    | null;

  service_category_id:
    string;

  service_scope:
    "general"
    | "academic";

  slug:
    string;

  name:
    string;

  short_name:
    string;
};


type DatabaseFormField = {
  id:
    string;

  service_id:
    string;

  field_key:
    string;

  label:
    string;

  field_type:
    string;

  placeholder:
    | string
    | null;

  required:
    boolean;

  options:
    unknown;

  sort_order:
    number;
};


// =========================================================
// REQUEST NUMBER
// =========================================================

function generateRequestNumber(
  prefix:
    string,
) {
  const now =
    new Date();


  const date =
    `${now.getUTCFullYear()}` +
    `${String(
      now.getUTCMonth() +
        1,
    ).padStart(
      2,
      "0",
    )}` +
    `${String(
      now.getUTCDate(),
    ).padStart(
      2,
      "0",
    )}`;


  const suffix =
    randomBytes(5)
      .toString(
        "hex",
      )
      .toUpperCase();


  return (
    `SC247-${prefix}-${date}-${suffix}`
  );
}


// =========================================================
// JSONB SELECT OPTIONS
// =========================================================

function normalizeOptions(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }


  return value.filter(
    (
      option,
    ): option is string =>
      typeof option ===
        "string" &&
      option.trim().length >
        0,
  );
}


// =========================================================
// DYNAMIC VALUE VALIDATION
// =========================================================

function validateDynamicValue(
  field:
    DatabaseFormField,

  value:
    string,
):
  | string
  | null {
  const trimmed =
    value.trim();


  if (
    !trimmed
  ) {
    return null;
  }


  if (
    !SUPPORTED_FIELD_TYPES.has(
      field.field_type,
    )
  ) {
    return (
      `${field.label} has an unsupported field type.`
    );
  }


  // -------------------------------------------------------
  // SELECT
  // -------------------------------------------------------

  if (
    field.field_type ===
    "select"
  ) {
    const options =
      normalizeOptions(
        field.options,
      );


    if (
      !options.includes(
        trimmed,
      )
    ) {
      return (
        `${field.label} contains an invalid selection.`
      );
    }
  }


  // -------------------------------------------------------
  // EMAIL
  // -------------------------------------------------------

  if (
    field.field_type ===
    "email"
  ) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        trimmed,
      )
    ) {
      return (
        `${field.label} must contain a valid email address.`
      );
    }
  }


  // -------------------------------------------------------
  // NUMBER
  // -------------------------------------------------------

  if (
    field.field_type ===
    "number"
  ) {
    const number =
      Number(
        trimmed,
      );


    if (
      !Number.isFinite(
        number,
      )
    ) {
      return (
        `${field.label} must contain a valid number.`
      );
    }
  }


  // -------------------------------------------------------
  // DATE
  // -------------------------------------------------------

  if (
    field.field_type ===
    "date"
  ) {
    const datePattern =
      /^\d{4}-\d{2}-\d{2}$/;


    if (
      !datePattern.test(
        trimmed,
      )
    ) {
      return (
        `${field.label} must contain a valid date.`
      );
    }
  }


  return null;
}


// =========================================================
// POST REQUEST
// =========================================================

export async function POST(
  request:
    Request,
) {
  let uploadedPath:
    | string
    | null =
    null;


  try {
    // =====================================================
    // READ MULTIPART REQUEST
    // =====================================================

    const formData =
      await request.formData();


    const draftValue =
      formData.get(
        "draft",
      );


    const paymentProofValue =
      formData.get(
        "paymentProof",
      );


    if (
      typeof draftValue !==
      "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Request information is missing.",
        },
        {
          status:
            400,
        },
      );
    }


    if (
      !(
        paymentProofValue instanceof
        File
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Please upload proof of payment.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // PARSE DRAFT
    // =====================================================

    let parsedJson:
      unknown;


    try {
      parsedJson =
        JSON.parse(
          draftValue,
        );
    } catch {
      return NextResponse.json(
        {
          message:
            "The submitted request information is invalid.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // STRUCTURAL VALIDATION
    // =====================================================

    const validation =
      requestSubmissionSchema.safeParse(
        parsedJson,
      );


    if (
      !validation.success
    ) {
      return NextResponse.json(
        {
          message:
            "Some request information is invalid.",

          issues:
            validation.error.flatten(),
        },
        {
          status:
            400,
        },
      );
    }


    const draft =
      validation.data;


    const supabase =
      createAdminClient();


    // =====================================================
    // RESOLVE ACTIVE SERVICE FIRST
    //
    // This is the architectural change.
    //
    // The browser no longer determines whether a university
    // is required.
    //
    // services.service_scope determines it.
    // =====================================================

    const {
      data:
        serviceData,

      error:
        serviceError,
    } =
      await supabase
        .from(
          "services",
        )
        .select(`
          id,
          university_id,
          service_category_id,
          service_scope,
          slug,
          name,
          short_name
        `)
        .eq(
          "id",
          draft.serviceId,
        )
        .eq(
          "active",
          true,
        )
        .maybeSingle();


    if (
      serviceError
    ) {
      console.error(
        "Service validation failed:",
        serviceError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate the selected service.",
        },
        {
          status:
            500,
        },
      );
    }


    if (
      !serviceData
    ) {
      return NextResponse.json(
        {
          message:
            "The selected service is unavailable.",
        },
        {
          status:
            400,
        },
      );
    }


    const service =
      serviceData as
        DatabaseService;


    // =====================================================
    // ACADEMIC SERVICE
    //
    // Academic services require an institution.
    // =====================================================

    let university:
      DatabaseUniversity
      | null =
      null;


    if (
      service.service_scope ===
      "academic"
    ) {
      if (
        !service.university_id
      ) {
        console.error(
          "Academic service missing university:",
          service.id,
        );


        return NextResponse.json(
          {
            message:
              "The selected academic service is not configured correctly.",
          },
          {
            status:
              500,
          },
        );
      }


      if (
        !draft.universityId
      ) {
        return NextResponse.json(
          {
            message:
              "Please select the institution for this academic service.",
          },
          {
            status:
              400,
          },
        );
      }


      // Prevent a browser from combining a service belonging
      // to one institution with another institution.

      if (
        draft.universityId !==
        service.university_id
      ) {
        return NextResponse.json(
          {
            message:
              "The selected service does not belong to the selected institution.",
          },
          {
            status:
              400,
          },
        );
      }


      const {
        data:
          universityData,

        error:
          universityError,
      } =
        await supabase
          .from(
            "universities",
          )
          .select(`
            id,
            code,
            name
          `)
          .eq(
            "id",
            service.university_id,
          )
          .eq(
            "active",
            true,
          )
          .maybeSingle();


      if (
        universityError
      ) {
        console.error(
          "Institution validation failed:",
          universityError,
        );


        return NextResponse.json(
          {
            message:
              "We could not validate the selected institution.",
          },
          {
            status:
              500,
          },
        );
      }


      if (
        !universityData
      ) {
        return NextResponse.json(
          {
            message:
              "The selected institution is unavailable.",
          },
          {
            status:
              400,
          },
        );
      }


      university =
        universityData as
          DatabaseUniversity;
    }


    // =====================================================
    // GENERAL SERVICE
    //
    // universityId from the browser is intentionally ignored.
    //
    // This supports:
    //
    // - legacy SC247 services
    // - normalized university_id = NULL services
    // =====================================================

    if (
      service.service_scope !==
        "general" &&
      service.service_scope !==
        "academic"
    ) {
      return NextResponse.json(
        {
          message:
            "The selected service type is not supported.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // LOAD ACTIVE SERVICE FIELDS
    // =====================================================

    const {
      data:
        fieldsData,

      error:
        fieldsError,
    } =
      await supabase
        .from(
          "service_form_fields",
        )
        .select(`
          id,
          service_id,
          field_key,
          label,
          field_type,
          placeholder,
          required,
          options,
          sort_order
        `)
        .eq(
          "service_id",
          service.id,
        )
        .eq(
          "active",
          true,
        )
        .order(
          "sort_order",
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
      fieldsError
    ) {
      console.error(
        "Service form field validation failed:",
        fieldsError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate the information required for this service.",
        },
        {
          status:
            500,
        },
      );
    }


    const fields =
      (
        fieldsData ??
        []
      ) as
        DatabaseFormField[];


    // =====================================================
    // REJECT UNKNOWN RESPONSES
    // =====================================================

    const allowedFieldKeys =
      new Set(
        fields.map(
          (
            field,
          ) =>
            field.field_key,
        ),
      );


    const unexpectedFields =
      Object.entries(
        draft.responses,
      )
        .filter(
          ([
            key,
            value,
          ]) =>
            value.trim() !==
              "" &&
            !allowedFieldKeys.has(
              key,
            ),
        )
        .map(
          ([
            key,
          ]) =>
            key,
        );


    if (
      unexpectedFields.length >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "The submitted information does not match the selected service.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // REQUIRED FIELD VALIDATION
    // =====================================================

    const missingFields =
      fields.filter(
        (
          field,
        ) =>
          field.required &&
          !draft.responses[
            field.field_key
          ]?.trim(),
      );


    if (
      missingFields.length >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Required service information is missing.",

          fields:
            missingFields.map(
              (
                field,
              ) =>
                field.label,
            ),
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // FIELD TYPE VALIDATION
    // =====================================================

    for (
      const field of
      fields
    ) {
      const value =
        draft.responses[
          field.field_key
        ] ??
        "";


      const fieldError =
        validateDynamicValue(
          field,
          value,
        );


      if (
        fieldError
      ) {
        return NextResponse.json(
          {
            message:
              fieldError,
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // DELIVERY VALIDATION
    // =====================================================

    if (
      draft.delivery.required
    ) {
      const deliveryComplete =
        draft.delivery.fullName.trim() &&
        draft.delivery.areaTown.trim() &&
        draft.delivery.cityDistrict.trim() &&
        draft.delivery.region.trim() &&
        draft.delivery.phone.trim() &&
        draft.delivery.emergencyContact.trim();


      if (
        !deliveryComplete
      ) {
        return NextResponse.json(
          {
            message:
              "Please complete the required physical delivery information.",
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // PAYMENT PROOF VALIDATION
    // =====================================================

    if (
      paymentProofValue.size <=
      0
    ) {
      return NextResponse.json(
        {
          message:
            "The uploaded payment proof is empty.",
        },
        {
          status:
            400,
        },
      );
    }


    if (
      paymentProofValue.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          message:
            "Payment proof must be 5 MB or smaller.",
        },
        {
          status:
            400,
        },
      );
    }


    const extension =
      ALLOWED_FILES[
        paymentProofValue.type as keyof typeof ALLOWED_FILES
      ];


    if (
      !extension
    ) {
      return NextResponse.json(
        {
          message:
            "Payment proof must be a JPG, PNG, WEBP or PDF file.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // REQUEST IDENTIFIERS
    // =====================================================

    const requestId =
      randomUUID();


    const requestPrefix =
      service.service_scope ===
        "academic"
        ? university?.code ??
          "ACADEMIC"
        : "SC247";


    const requestNumber =
      generateRequestNumber(
        requestPrefix,
      );


    const storagePath =
      `requests/${requestId}/` +
      `payment-proof.${extension}`;


    // =====================================================
    // UPLOAD PRIVATE PAYMENT PROOF
    // =====================================================

    const fileBuffer =
      await paymentProofValue.arrayBuffer();


    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          "payment-proofs",
        )
        .upload(
          storagePath,
          fileBuffer,
          {
            contentType:
              paymentProofValue.type,

            upsert:
              false,
          },
        );


    if (
      uploadError
    ) {
      console.error(
        "Payment proof upload failed:",
        uploadError,
      );


      return NextResponse.json(
        {
          message:
            "We could not upload the payment proof. Please try again.",
        },
        {
          status:
            500,
        },
      );
    }


    uploadedPath =
      storagePath;


    // =====================================================
    // IMMUTABLE RESPONSE SNAPSHOT
    // =====================================================

    const responses =
      fields
        .map(
          (
            field,
          ) => ({
            fieldKey:
              field.field_key,

            label:
              field.label,

            value:
              draft.responses[
                field.field_key
              ] ??
              "",
          }),
        )
        .filter(
          (
            item,
          ) =>
            item.value.trim() !==
            "",
        );


    // =====================================================
    // CREATE REQUEST
    //
    // V2 resolves service scope inside PostgreSQL as well.
    // The API and database therefore both enforce the same
    // service-driven architecture.
    // =====================================================

    const {
      data,

      error:
        databaseError,
    } =
      await supabase.rpc(
        "create_request_submission_v2",
        {
          p_request_id:
            requestId,

          p_request_number:
            requestNumber,

          p_service_id:
            service.id,

          p_first_name:
            draft.applicant.firstName,

          p_other_names:
            draft.applicant.otherNames,

          p_surname:
            draft.applicant.surname,

          p_gender:
            draft.applicant.gender,

          p_phone:
            draft.applicant.phone,

          p_email:
            draft.applicant.email,

          p_notes:
            draft.notes,

          p_responses:
            responses,

          p_delivery:
            draft.delivery,

          p_payment_method:
            draft.paymentMethod,

          p_proof_storage_path:
            storagePath,
        },
      );


    if (
      databaseError
    ) {
      console.error(
        "Request transaction failed:",
        databaseError,
      );


      // Prevent orphaned payment proofs.

      await supabase.storage
        .from(
          "payment-proofs",
        )
        .remove([
          storagePath,
        ]);


      uploadedPath =
        null;


      return NextResponse.json(
        {
          message:
            "We could not save the request. Please try again.",
        },
        {
          status:
            500,
        },
      );
    }


    const created =
      Array.isArray(
        data,
      )
        ? data[0]
        : data;


    return NextResponse.json(
      {
        success:
          true,

        request: {
          id:
            created
              ?.request_id ??
            requestId,

          requestNumber:
            created
              ?.request_number ??
            requestNumber,

          status:
            "AWAITING_PAYMENT_VERIFICATION",
        },
      },
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Request submission failed:",
      error,
    );


    // =====================================================
    // BEST-EFFORT FILE CLEANUP
    // =====================================================

    if (
      uploadedPath
    ) {
      try {
        const supabase =
          createAdminClient();


        await supabase.storage
          .from(
            "payment-proofs",
          )
          .remove([
            uploadedPath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "Payment proof cleanup failed:",
          cleanupError,
        );
      }
    }


    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting your request.",
      },
      {
        status:
          500,
      },
    );
  }
}