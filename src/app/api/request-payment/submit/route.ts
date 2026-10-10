import {
  createHash,
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  isPaymentMethodAvailable,
} from "@/lib/payment/payment-destinations";


export const runtime =
  "nodejs";


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


function hashToken(
  token:
    string,
) {
  return createHash(
    "sha256",
  )
    .update(
      token,
    )
    .digest(
      "hex",
    );
}


function validToken(
  value:
    string,
) {
  return /^[0-9a-f]{64}$/i.test(
    value,
  );
}


export async function POST(
  request:
    Request,
) {
  let uploadedPath:
    | string
    | null =
    null;


  try {
    const formData =
      await request.formData();


    const tokenValue =
      formData.get(
        "token",
      );


    const methodValue =
      formData.get(
        "paymentMethod",
      );


    const proofValue =
      formData.get(
        "paymentProof",
      );


    const token =
      typeof tokenValue ===
        "string"
        ? tokenValue
        : "";


    const paymentMethod =
      typeof methodValue ===
        "string"
        ? methodValue
        : "";


    const paymentProof =
      proofValue instanceof
        File
        ? proofValue
        : null;


    if (
      !validToken(
        token,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "This payment link is invalid or no longer available.",
        },
        {
          status:
            404,
        },
      );
    }


    if (
      paymentMethod !==
        "momo" &&
      paymentMethod !==
        "bank"
    ) {
      return NextResponse.json(
        {
          message:
            "Select a valid payment method.",
        },
        {
          status:
            400,
        },
      );
    }


    if (
      !paymentProof
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


    if (
      paymentProof.size <=
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
      paymentProof.size >
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
        paymentProof.type as
          keyof typeof ALLOWED_FILES
      ] ??
      null;


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


    const tokenHash =
      hashToken(
        token,
      );


    const supabase =
      createAdminClient();


    // =====================================================
    // RESOLVE REQUEST BEFORE UPLOAD
    // =====================================================

    const {
      data:
        paymentRequest,

      error:
        requestError,
    } =
      await supabase
        .from(
          "requests",
        )
        .select(`
  id,
  status,
  pricing_currency_snapshot,
  payment_access_used_at
`)
        .eq(
          "payment_access_token_hash",
          tokenHash,
        )
        .eq(
          "status",
          "AWAITING_PAYMENT",
        )
        .is(
          "payment_access_used_at",
          null,
        )
        .maybeSingle();


    if (
      requestError
    ) {
      console.error(
        "Quoted payment request lookup failed:",
        requestError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate this payment request.",
        },
        {
          status:
            500,
        },
      );
    }


    if (
      !paymentRequest
    ) {
      return NextResponse.json(
        {
          message:
            "This payment link is invalid, expired or has already been used.",
        },
        {
          status:
            404,
        },
      );
    }

        const paymentCurrency =
      paymentRequest
        .pricing_currency_snapshot ??
      "GHS";


    const systemSettings =
      await getSystemSettings();


    if (
      !isPaymentMethodAvailable(
        systemSettings.payment,
        paymentCurrency,
        paymentMethod,
      )
    ) {
      return NextResponse.json(
        {
          message:
            `The selected payment method is not available for ${paymentCurrency}.`,
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // UPLOAD PROOF
    // =====================================================

    const storagePath =
      `quoted-payments/${paymentRequest.id}/` +
      `${randomUUID()}.${extension}`;


    const fileBuffer =
      await paymentProof.arrayBuffer();


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
              paymentProof.type,

            upsert:
              false,
          },
        );


    if (
      uploadError
    ) {
      console.error(
        "Quoted payment proof upload failed:",
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
    // DATABASE TRANSACTION
    // =====================================================

    const {
      data,
      error:
        databaseError,
    } =
      await supabase.rpc(
        "submit_quoted_request_payment",
        {
          p_token_hash:
            tokenHash,

          p_payment_method:
            paymentMethod,

          p_proof_storage_path:
            storagePath,
        },
      );


    if (
      databaseError
    ) {
      console.error(
        "Quoted payment transaction failed:",
        databaseError,
      );


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
            databaseError.message ||
            "We could not submit your payment proof.",
        },
        {
          status:
            400,
        },
      );
    }


    const result =
      (
        Array.isArray(
          data,
        )
          ? data[0]
          : data
      ) as
        | {
            request_number?:
              string;

            new_status?:
              string;

            currency?:
              string;

            total_amount?:
              string
              | number;
          }
        | null;


    uploadedPath =
      null;


    return NextResponse.json(
      {
        success:
          true,

        request: {
          requestNumber:
            result
              ?.request_number ??
            "",

          status:
            result
              ?.new_status ??
            "AWAITING_PAYMENT_VERIFICATION",

          currency:
            result
              ?.currency ??
            "GHS",

          totalAmount:
            result
              ?.total_amount ===
                undefined
              ? null
              : Number(
                  result.total_amount,
                ),
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
      "Quoted payment submission failed:",
      error,
    );


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
          "Quoted payment proof cleanup failed:",
          cleanupError,
        );
      }
    }


    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting the payment.",
      },
      {
        status:
          500,
      },
    );
  }
}