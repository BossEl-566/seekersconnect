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

import {
  canAdvanceRequest,
} from "@/lib/request-status";


export type AdvanceRequestState = {
  success: boolean;
  error: string;
  newStatus?: string;
};


export async function advanceRequest(
  requestId: string,
  internalNote: string,
): Promise<AdvanceRequestState> {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();


  // -------------------------------------------------------
  // Check current request first
  // -------------------------------------------------------

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("requests")
    .select("id, status")
    .eq("id", requestId)
    .single();


  if (
    requestError ||
    !request
  ) {
    return {
      success: false,
      error:
        "The request could not be found.",
    };
  }


  if (
    !canAdvanceRequest(
      request.status,
    )
  ) {
    return {
      success: false,
      error:
        "This request cannot be advanced from its current status.",
    };
  }


  // -------------------------------------------------------
  // Advance transaction
  // -------------------------------------------------------

  const {
    data,
    error,
  } = await supabase.rpc(
    "advance_request_processing",
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


  if (error) {
    console.error(
      "Request advancement failed:",
      error,
    );

    return {
      success: false,
      error:
        "The request status could not be updated. Please try again.",
    };
  }


  const result =
    Array.isArray(data)
      ? data[0]
      : data;


  revalidatePath("/admin");
  revalidatePath(
    "/admin/requests",
  );

  revalidatePath(
    `/admin/requests/${requestId}`,
  );


  return {
    success: true,
    error: "",
    newStatus:
      result?.new_status,
  };
}
export type DeliveryWorkflowState = {
  success: boolean;
  error: string;
  newStatus?: string;
};


export async function advanceDeliveryWorkflow(
  requestId: string,
  emsTrackingNumber: string,
  internalNote: string,
): Promise<DeliveryWorkflowState> {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();


  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("requests")
    .select(`
      id,
      status
    `)
    .eq(
      "id",
      requestId,
    )
    .single();


  if (
    requestError ||
    !request
  ) {
    return {
      success: false,

      error:
        "The request could not be found.",
    };
  }


  const allowedStatuses =
    new Set([
      "DOCUMENT_SCANNED",
      "PREPARING_DELIVERY",
      "HANDED_TO_EMS",
      "IN_TRANSIT",
      "DELIVERED",
    ]);


  if (
    !allowedStatuses.has(
      request.status,
    )
  ) {
    return {
      success: false,

      error:
        "This request cannot be advanced through the delivery workflow.",
    };
  }


  const {
    data,
    error,
  } = await supabase.rpc(
    "advance_delivery_workflow",
    {
      p_request_id:
        requestId,

      p_admin_id:
        admin.id,

      p_ems_tracking_number:
        emsTrackingNumber.trim() ||
        null,

      p_internal_note:
        internalNote.trim() ||
        null,
    },
  );


  if (error) {
    console.error(
      "Delivery workflow update failed:",
      error,
    );


    return {
      success: false,

      error:
        error.message ||
        "The delivery status could not be updated.",
    };
  }


  const result =
    Array.isArray(data)
      ? data[0]
      : data;


  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/requests",
  );

  revalidatePath(
    "/admin/deliveries",
  );

  revalidatePath(
    `/admin/requests/${requestId}`,
  );


  return {
    success: true,

    error: "",

    newStatus:
      result?.new_status,
  };
}