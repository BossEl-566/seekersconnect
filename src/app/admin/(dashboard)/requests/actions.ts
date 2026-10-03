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


// =========================================================
// TYPES
// =========================================================

type ProviderRelation =
  | {
      code:
        string;
    }
  | {
      code:
        string;
    }[]
  | null;


type RequestWorkflowRow = {
  id:
    string;

  status:
    string;

  universities:
    ProviderRelation;
};


export type AdvanceRequestState = {
  success:
    boolean;

  error:
    string;

  newStatus?:
    string;
};


// =========================================================
// HELPERS
// =========================================================

function getProviderCode(
  relation:
    ProviderRelation,
) {
  if (
    !relation
  ) {
    return null;
  }


  if (
    Array.isArray(
      relation,
    )
  ) {
    return (
      relation[0]
        ?.code ??
      null
    );
  }


  return (
    relation.code ??
    null
  );
}


// =========================================================
// ADVANCE PROCESSING WORKFLOW
// =========================================================

export async function advanceRequest(
  requestId:
    string,

  internalNote:
    string,
): Promise<AdvanceRequestState> {
  const admin =
    await requireAdmin();


  const supabase =
    createAdminClient();


  // -------------------------------------------------------
  // Load request and provider
  // -------------------------------------------------------

  const {
    data:
      requestData,

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

        universities (
          code
        )
      `)
      .eq(
        "id",
        requestId,
      )
      .single();


  if (
    requestError ||
    !requestData
  ) {
    return {
      success:
        false,

      error:
        "The request could not be found.",
    };
  }


  const request =
    requestData as unknown as
      RequestWorkflowRow;


  const providerCode =
    getProviderCode(
      request.universities,
    );


  const isGeneralService =
    providerCode ===
    "SC247";


  if (
    !canAdvanceRequest(
      request.status,
      isGeneralService,
    )
  ) {
    return {
      success:
        false,

      error:
        "This request cannot be advanced from its current status.",
    };
  }


  // -------------------------------------------------------
  // Use the appropriate workflow
  // -------------------------------------------------------

  let data:
    unknown;

  let error:
    {
      message?:
        string;
    } | null =
    null;


  if (
    isGeneralService
  ) {
    const result =
      await supabase.rpc(
        "advance_general_request_processing",
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


    data =
      result.data;

    error =
      result.error;
  } else {
    const result =
      await supabase.rpc(
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


    data =
      result.data;

    error =
      result.error;
  }


  if (
    error
  ) {
    console.error(
      "Request advancement failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error.message ||
        "The request status could not be updated. Please try again.",
    };
  }


  const result =
    Array.isArray(
      data,
    )
      ? data[0]
      : data;


  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/requests",
  );

  revalidatePath(
    `/admin/requests/${requestId}`,
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
        ?.new_status,
  };
}


// =========================================================
// DELIVERY TYPES
// =========================================================

export type DeliveryWorkflowState = {
  success:
    boolean;

  error:
    string;

  newStatus?:
    string;
};


// =========================================================
// ADVANCE DELIVERY WORKFLOW
// =========================================================

export async function advanceDeliveryWorkflow(
  requestId:
    string,

  trackingReference:
    string,

  internalNote:
    string,
): Promise<DeliveryWorkflowState> {
  const admin =
    await requireAdmin();


  const supabase =
    createAdminClient();


  // -------------------------------------------------------
  // Load request + provider
  // -------------------------------------------------------

  const {
    data:
      requestData,

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

        universities (
          code
        )
      `)
      .eq(
        "id",
        requestId,
      )
      .single();


  if (
    requestError ||
    !requestData
  ) {
    return {
      success:
        false,

      error:
        "The request could not be found.",
    };
  }


  const request =
    requestData as unknown as
      RequestWorkflowRow;


  const providerCode =
    getProviderCode(
      request.universities,
    );


  const isGeneralService =
    providerCode ===
    "SC247";


  // -------------------------------------------------------
  // Validate allowed status
  // -------------------------------------------------------

  const allowedStatuses =
    isGeneralService
      ? new Set([
          "PREPARING_DELIVERY",
          "IN_TRANSIT",
          "DELIVERED",
        ])
      : new Set([
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
      success:
        false,

      error:
        "This request cannot be advanced through the delivery workflow.",
    };
  }


  // -------------------------------------------------------
  // General delivery workflow
  // -------------------------------------------------------

  let data:
    unknown;

  let error:
    {
      message?:
        string;
    } | null =
    null;


  if (
    isGeneralService
  ) {
    const result =
      await supabase.rpc(
        "advance_general_delivery_workflow",
        {
          p_request_id:
            requestId,

          p_admin_id:
            admin.id,

          p_delivery_reference:
            trackingReference.trim() ||
            null,

          p_internal_note:
            internalNote.trim() ||
            null,
        },
      );


    data =
      result.data;

    error =
      result.error;
  } else {
    const result =
      await supabase.rpc(
        "advance_delivery_workflow",
        {
          p_request_id:
            requestId,

          p_admin_id:
            admin.id,

          p_ems_tracking_number:
            trackingReference.trim() ||
            null,

          p_internal_note:
            internalNote.trim() ||
            null,
        },
      );


    data =
      result.data;

    error =
      result.error;
  }


  if (
    error
  ) {
    console.error(
      "Delivery workflow update failed:",
      error,
    );


    return {
      success:
        false,

      error:
        error.message ||
        "The delivery status could not be updated.",
    };
  }


  const result =
    Array.isArray(
      data,
    )
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
        ?.new_status,
  };
}