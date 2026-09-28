import { randomBytes, randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  requestSubmissionSchema,
} from "@/lib/validation/request-submission";

import { REQUEST_SERVICES } from "@/constants/request-services";
import { REQUEST_FIELDS } from "@/constants/request-fields";
import { UNIVERSITIES } from "@/constants/universities";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

function generateRequestNumber(
  universityCode: string,
) {
  const now = new Date();

  const date =
    `${now.getUTCFullYear()}` +
    `${String(now.getUTCMonth() + 1).padStart(2, "0")}` +
    `${String(now.getUTCDate()).padStart(2, "0")}`;

  const suffix = randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `SC247-${universityCode}-${date}-${suffix}`;
}

export async function POST(request: Request) {
  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();

    const draftValue = formData.get("draft");
    const paymentProofValue =
      formData.get("paymentProof");

    if (typeof draftValue !== "string") {
      return NextResponse.json(
        {
          message:
            "Request information is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (!(paymentProofValue instanceof File)) {
      return NextResponse.json(
        {
          message:
            "Please upload proof of payment.",
        },
        {
          status: 400,
        },
      );
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(draftValue);
    } catch {
      return NextResponse.json(
        {
          message:
            "The submitted request information is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const validation =
      requestSubmissionSchema.safeParse(
        parsedJson,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            "Some request information is invalid.",
          issues:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const draft = validation.data;

    // -----------------------------------------------------
    // Verify university against our server-side registry
    // -----------------------------------------------------

    const university =
      UNIVERSITIES.find(
        (item) =>
          item.id === draft.universityId,
      );

    if (!university) {
      return NextResponse.json(
        {
          message:
            "The selected university is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------------------
    // Verify service and university relationship
    // -----------------------------------------------------

    const service =
      REQUEST_SERVICES.find(
        (item) =>
          item.id === draft.serviceId &&
          item.active,
      );

    if (
      !service ||
      service.universityId !==
        draft.universityId
    ) {
      return NextResponse.json(
        {
          message:
            "The selected service is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------------------
    // Verify required dynamic academic fields
    // -----------------------------------------------------

    const fields =
      REQUEST_FIELDS[service.formType];

    const missingFields =
      fields.filter(
        (field) =>
          field.required &&
          !draft.responses[
            field.key
          ]?.trim(),
      );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message:
            "Required academic information is missing.",

          fields:
            missingFields.map(
              (field) => field.label,
            ),
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------------------
    // Delivery validation
    // -----------------------------------------------------

    if (draft.delivery.required) {
      const deliveryComplete =
        draft.delivery.fullName.trim() &&
        draft.delivery.areaTown.trim() &&
        draft.delivery.cityDistrict.trim() &&
        draft.delivery.region.trim() &&
        draft.delivery.phone.trim() &&
        draft.delivery.emergencyContact.trim();

      if (!deliveryComplete) {
        return NextResponse.json(
          {
            message:
              "Please complete the required EMS delivery information.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // -----------------------------------------------------
    // File validation
    // -----------------------------------------------------

    if (
      paymentProofValue.size <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "The uploaded payment proof is empty.",
        },
        {
          status: 400,
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
          status: 400,
        },
      );
    }

    const extension =
      ALLOWED_FILES[
        paymentProofValue.type as keyof typeof ALLOWED_FILES
      ];

    if (!extension) {
      return NextResponse.json(
        {
          message:
            "Payment proof must be a JPG, PNG, WEBP or PDF file.",
        },
        {
          status: 400,
        },
      );
    }

    const requestId = randomUUID();

    const requestNumber =
      generateRequestNumber(
        university.shortName,
      );

    const storagePath =
      `requests/${requestId}/` +
      `payment-proof.${extension}`;

    const supabase =
      createAdminClient();

    // -----------------------------------------------------
    // Upload PRIVATE payment proof
    // -----------------------------------------------------

    const fileBuffer =
      await paymentProofValue.arrayBuffer();

    const {
      error: uploadError,
    } = await supabase.storage
      .from("payment-proofs")
      .upload(
        storagePath,
        fileBuffer,
        {
          contentType:
            paymentProofValue.type,

          upsert: false,
        },
      );

    if (uploadError) {
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
          status: 500,
        },
      );
    }

    uploadedPath = storagePath;

    // -----------------------------------------------------
    // Convert dynamic responses into immutable snapshots
    // -----------------------------------------------------

    const responses =
      fields
        .map((field) => ({
          fieldKey: field.key,
          label: field.label,
          value:
            draft.responses[
              field.key
            ] ?? "",
        }))
        .filter(
          (item) =>
            item.value.trim() !== "",
        );

    // -----------------------------------------------------
    // Database transaction through PostgreSQL function
    // -----------------------------------------------------

    const {
      data,
      error: databaseError,
    } = await supabase.rpc(
      "create_request_submission",
      {
        p_request_id: requestId,

        p_request_number:
          requestNumber,

        p_university_code:
          university.shortName,

        p_service_slug:
          service.slug,

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

    if (databaseError) {
      console.error(
        "Request transaction failed:",
        databaseError,
      );

      // Prevent orphan payment screenshots.
      await supabase.storage
        .from("payment-proofs")
        .remove([storagePath]);

      uploadedPath = null;

      return NextResponse.json(
        {
          message:
            "We could not save the request. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    const created =
      Array.isArray(data)
        ? data[0]
        : data;

    return NextResponse.json(
      {
        success: true,

        request: {
          id:
            created?.request_id ??
            requestId,

          requestNumber:
            created?.request_number ??
            requestNumber,

          status:
            "AWAITING_PAYMENT_VERIFICATION",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Request submission failed:",
      error,
    );

    if (uploadedPath) {
      try {
        const supabase =
          createAdminClient();

        await supabase.storage
          .from("payment-proofs")
          .remove([uploadedPath]);
      } catch (cleanupError) {
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
        status: 500,
      },
    );
  }
}