"use server";

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

  newStatus?:
    string;

  currency?:
    string;

  amount?:
    number;
};


// =========================================================
// REVALIDATE
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
  // LOAD REQUEST FIRST
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
  // STARTING FROM FLOOR
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
  // FINALIZE
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
          result
            .finalized_amount,
        );


  revalidateRequest(
    requestId,
  );


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
  };
}