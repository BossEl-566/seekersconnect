"use server";

import {
  randomBytes,
  randomInt,
} from "crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

function createTrackingNumber(
  universityCode: string,
) {
  const suffix = randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `SC247-${universityCode}-${suffix}`;
}

function createTrackingPin() {
  return randomInt(
    100000,
    1000000,
  ).toString();
}

export type PaymentReviewState = {
  success: boolean;
  error: string;

  trackingNumber?: string;
  trackingPin?: string;
};

export async function confirmPayment(
  requestId: string,
): Promise<PaymentReviewState> {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();

  // Get university code first
  const {
    data: requestRecord,
    error: requestError,
  } = await supabase
    .from("requests")
    .select(`
      id,
      request_number,
      university_id,
      universities (
        code
      )
    `)
    .eq("id", requestId)
    .single();

  if (
    requestError ||
    !requestRecord
  ) {
    return {
      success: false,
      error:
        "The request could not be found.",
    };
  }

  const universityRelation =
    requestRecord.universities as unknown as
      | {
          code: string;
        }
      | null;

  const universityCode =
    universityRelation?.code;

  if (!universityCode) {
    return {
      success: false,
      error:
        "The request university could not be determined.",
    };
  }

  const trackingNumber =
    createTrackingNumber(
      universityCode,
    );

  const trackingPin =
    createTrackingPin();

  const {
    error,
  } = await supabase.rpc(
    "review_request_payment",
    {
      p_request_id: requestId,
      p_admin_id: admin.id,
      p_action: "CONFIRM",

      p_rejection_reason: null,

      p_tracking_number:
        trackingNumber,

      p_tracking_pin:
        trackingPin,
    },
  );

  if (error) {
    console.error(
      "Payment confirmation failed:",
      error,
    );

    return {
      success: false,
      error:
        "Payment could not be confirmed. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath(
    `/admin/requests/${requestId}`,
  );

  return {
    success: true,
    error: "",
    trackingNumber,
    trackingPin,
  };
}

export async function rejectPayment(
  requestId: string,
  reason: string,
): Promise<PaymentReviewState> {
  const admin =
    await requireAdmin();

  const cleanedReason =
    reason.trim();

  if (
    cleanedReason.length < 3
  ) {
    return {
      success: false,
      error:
        "Enter a reason for rejecting the payment.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase.rpc(
    "review_request_payment",
    {
      p_request_id: requestId,
      p_admin_id: admin.id,
      p_action: "REJECT",

      p_rejection_reason:
        cleanedReason,

      p_tracking_number: null,
      p_tracking_pin: null,
    },
  );

  if (error) {
    console.error(
      "Payment rejection failed:",
      error,
    );

    return {
      success: false,
      error:
        "Payment could not be rejected. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath(
    `/admin/requests/${requestId}`,
  );

  return {
    success: true,
    error: "",
  };
}