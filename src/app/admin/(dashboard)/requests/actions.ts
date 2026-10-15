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

type ServiceRelation =
  | {
      service_scope:
        "general"
        | "academic";
    }
  | {
      service_scope:
        "general"
        | "academic";
    }[]
  | null;


type RequestWorkflowRow = {
  id:
    string;

  status:
    string;

  services:
    ServiceRelation;
};


export type AdvanceRequestState = {
  success:
    boolean;

  error:
    string;

  newStatus?:
    string;
};


export type DeliveryWorkflowState = {
  success:
    boolean;

  error:
    string;

  newStatus?:
    string;
};


// =========================================================
// SERVICE SCOPE
// =========================================================

function getServiceScope(
  relation:
    ServiceRelation,
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
        ?.service_scope ??
      null
    );
  }


  return (
    relation.service_scope ??
    null
  );
}


// =========================================================
// LOAD REQUEST WORKFLOW CONTEXT
// =========================================================

async function getRequestWorkflowRow(
  requestId:
    string,
) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "requests",
      )
      .select(`
        id,
        status,

        services (
          service_scope
        )
      `)
      .eq(
        "id",
        requestId,
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    return {
      request:
        null,

      error:
        "The request could not be found.",
    };
  }


  return {
    request:
      data as unknown as
        RequestWorkflowRow,

    error:
      "",
  };
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


  const {
    request,
    error:
      requestError,
  } =
    await getRequestWorkflowRow(
      requestId,
    );


  if (
    !request
  ) {
    return {
      success:
        false,

      error:
        requestError,
    };
  }


  const serviceScope =
    getServiceScope(
      request.services,
    );


  if (
    !serviceScope
  ) {
    return {
      success:
        false,

      error:
        "The service type for this request could not be determined.",
    };
  }


  const isGeneralService =
    serviceScope ===
    "general";


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


  const {
    request,
    error:
      requestError,
  } =
    await getRequestWorkflowRow(
      requestId,
    );


  if (
    !request
  ) {
    return {
      success:
        false,

      error:
        requestError,
    };
  }


  const serviceScope =
    getServiceScope(
      request.services,
    );


  if (
    !serviceScope
  ) {
    return {
      success:
        false,

      error:
        "The service type for this request could not be determined.",
    };
  }


  const isGeneralService =
    serviceScope ===
    "general";


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