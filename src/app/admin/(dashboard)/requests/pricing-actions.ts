"use server";

import {
  createHash,
  randomBytes,
} from "crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type RequestPricingActionResult = {
  success:
    boolean;

  error:
    string;

  warning?:
    string;

  newStatus?:
    string;

  currency?:
    string;

  amount?:
    number;

  paymentToken?:
    string;
};


// =========================================================
// REVALIDATION
// =========================================================

function revalidateRequest(
  requestId:
    string,
) {
  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/requests",
  );

  revalidatePath(
    `/admin/requests/${requestId}`,
  );
}


// =========================================================
// TOKEN
// =========================================================

function createPaymentAccessToken() {
  const token =
    randomBytes(
      32,
    ).toString(
      "hex",
    );


  const hash =
    createHash(
      "sha256",
    )
      .update(
        token,
      )
      .digest(
        "hex",
      );


  return {
    token,
    hash,
  };
}


// =========================================================
// ISSUE PAYMENT ACCESS
// =========================================================

async function issuePaymentAccess(
  requestId:
    string,

  adminId:
    string,
) {
  const supabase =
    createAdminClient();


  const {
    token,
    hash,
  } =
    createPaymentAccessToken();


  const {
    error,
  } =
    await supabase.rpc(
      "issue_request_payment_access",
      {
        p_request_id:
          requestId,

        p_admin_id:
          adminId,

        p_token_hash:
          hash,
      },
    );


  if (
    error
  ) {
    console.error(
      "Issue request payment access failed:",
      error,
    );


    return {
      success:
        false as const,

      error:
        error.message ||
        "The secure payment link could not be generated.",
    };
  }


  return {
    success:
      true as const,

    token,
  };
}


// =========================================================
// GENERATE / REGENERATE PAYMENT LINK
// =========================================================

export async function generateRequestPaymentAccess(
  requestId:
    string,
): Promise<RequestPricingActionResult> {
  const admin =
    await requireAdmin();


  const result =
    await issuePaymentAccess(
      requestId,
      admin.id,
    );


  if (
    !result.success
  ) {
    return {
      success:
        false,

      error:
        result.error,
    };
  }


  revalidateRequest(
    requestId,
  );


  return {
    success:
      true,

    error:
      "",

    paymentToken:
      result.token,
  };
}


// =========================================================
// START FREE REQUEST
// =========================================================

export async function startFreeRequestProcessing(
  requestId:
    string,

  internalNote:
    string,
): Promise<RequestPricingActionResult> {
  const admin =
    await requireAdmin();


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "start_free_request_processing",
      {
        p_request_id:
          requestId,

        p_admin_id:
          admin.id,

        p_internal_note:
          internalNote.trim() ||
          null,
      },
    );


  if (
    error
  ) {
    console.error(
      "Start free request processing failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error.message ||
        "The free request could not be started.",
    };
  }


  const result =
    Array.isArray(
      data,
    )
      ? data[0]
      : data;


  revalidateRequest(
    requestId,
  );


  return {
    success:
      true,

    error:
      "",

    newStatus:
      (
        result as {
          new_status?:
            string;
        } | null
      )
        ?.new_status ??
      "PROCESSING_REQUEST",
  };
}


// =========================================================
// FINALIZE VARIABLE PRICE
// =========================================================

export async function finalizeVariableRequestPrice(
  requestId:
    string,

  amount:
    string,

  internalNote:
    string,
): Promise<RequestPricingActionResult> {
  const admin =
    await requireAdmin();


  const normalizedAmount =
    Number(
      amount,
    );


  if (
    !Number.isFinite(
      normalizedAmount,
    ) ||
    normalizedAmount <=
      0
  ) {
    return {
      success:
        false,

      error:
        "Enter a valid amount greater than zero.",
    };
  }


  const supabase =
    createAdminClient();


  // =======================================================
  // REQUEST
  // =======================================================

  const {
    data:
      request,

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
        pricing_mode_snapshot,
        pricing_currency_snapshot,
        pricing_unit_amount_snapshot
      `)
      .eq(
        "id",
        requestId,
      )
      .maybeSingle();


  if (
    requestError ||
    !request
  ) {
    return {
      success:
        false,

      error:
        "The request could not be found.",
    };
  }


  if (
    request.status !==
    "AWAITING_QUOTE"
  ) {
    return {
      success:
        false,

      error:
        "This request is not awaiting a price confirmation.",
    };
  }


  if (
    ![
      "QUOTE_REQUIRED",
      "STARTING_FROM",
      "MANUAL_PRICE",
    ].includes(
      request.pricing_mode_snapshot ??
        "",
    )
  ) {
    return {
      success:
        false,

      error:
        "This request does not use variable pricing.",
    };
  }


  // =======================================================
  // STARTING PRICE FLOOR
  // =======================================================

  if (
    request.pricing_mode_snapshot ===
      "STARTING_FROM" &&
    request.pricing_unit_amount_snapshot !==
      null
  ) {
    const startingAmount =
      Number(
        request.pricing_unit_amount_snapshot,
      );


    if (
      Number.isFinite(
        startingAmount,
      ) &&
      normalizedAmount <
        startingAmount
    ) {
      return {
        success:
          false,

        error:
          `Final amount cannot be lower than the starting price of ${
            request.pricing_currency_snapshot ??
            "GHS"
          } ${startingAmount.toFixed(
            2,
          )}.`,
      };
    }
  }


  // =======================================================
  // FINALIZE PRICE
  // =======================================================

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "finalize_request_price",
      {
        p_request_id:
          requestId,

        p_admin_id:
          admin.id,

        p_amount:
          normalizedAmount,

        p_internal_note:
          internalNote.trim() ||
          null,
      },
    );


  if (
    error
  ) {
    console.error(
      "Finalize request price failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error.message ||
        "The request price could not be finalized.",
    };
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
          new_status?:
            string;

          currency?:
            string;

          finalized_amount?:
            string
            | number;
        }
      | null;


  const finalAmount =
    result
      ?.finalized_amount ===
        undefined
      ? normalizedAmount
      : Number(
          result.finalized_amount,
        );


  // =======================================================
  // CREATE SECURE CUSTOMER PAYMENT LINK
  // =======================================================

  const paymentAccess =
    await issuePaymentAccess(
      requestId,
      admin.id,
    );


  revalidateRequest(
    requestId,
  );


  if (
    !paymentAccess.success
  ) {
    /*
     * Price finalization itself succeeded.
     *
     * The administrator can regenerate the payment link from
     * the AWAITING_PAYMENT screen.
     */
    return {
      success:
        true,

      error:
        "",

      warning:
        "The price was finalized, but the secure payment link could not be created. Refresh the request and generate a new payment link.",

      newStatus:
        "AWAITING_PAYMENT",

      currency:
        result
          ?.currency ??
        request
          .pricing_currency_snapshot ??
        "GHS",

      amount:
        Number.isFinite(
          finalAmount,
        )
          ? finalAmount
          : normalizedAmount,
    };
  }


  return {
    success:
      true,

    error:
      "",

    newStatus:
      result
        ?.new_status ??
      "AWAITING_PAYMENT",

    currency:
      result
        ?.currency ??
      request
        .pricing_currency_snapshot ??
      "GHS",

    amount:
      Number.isFinite(
        finalAmount,
      )
        ? finalAmount
        : normalizedAmount,

    paymentToken:
      paymentAccess.token,
  };
}