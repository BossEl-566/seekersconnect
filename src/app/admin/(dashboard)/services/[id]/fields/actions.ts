"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createServiceFormFieldSchema,
  updateServiceFormFieldSchema,
  type CreateServiceFormFieldInput,
  type UpdateServiceFormFieldInput,
} from "@/lib/validation/service-form-field";


export type FormFieldActionResult = {
  success: boolean;

  error: string;
};


// =========================================================
// CREATE FORM FIELD
// =========================================================

export async function createServiceFormField(
  serviceId: string,
  input: CreateServiceFormFieldInput,
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    createServiceFormFieldSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success: false,

      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid form field.",
    };
  }


  const supabase =
    createAdminClient();


  // -------------------------------------------------------
  // Verify service
  // -------------------------------------------------------

  const {
    data: service,
    error:
      serviceError,
  } = await supabase
    .from("services")
    .select(`
      id,
      name,
      slug,
      university_id
    `)
    .eq(
      "id",
      serviceId,
    )
    .single();


  if (
    serviceError ||
    !service
  ) {
    return {
      success: false,

      error:
        "The service could not be found.",
    };
  }


  // -------------------------------------------------------
  // Calculate the next sort position.
  //
  // We leave gaps of 10 so manual ordering remains easy.
  // -------------------------------------------------------

  const {
    data: lastField,
    error:
      lastFieldError,
  } = await supabase
    .from(
      "service_form_fields",
    )
    .select(
      "sort_order",
    )
    .eq(
      "service_id",
      serviceId,
    )
    .order(
      "sort_order",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();


  if (
    lastFieldError
  ) {
    console.error(
      "Could not determine field order:",
      lastFieldError,
    );


    return {
      success: false,

      error:
        "The form field could not be created.",
    };
  }


  const nextSortOrder =
    (lastField
      ?.sort_order ??
      0) + 10;


  const {
    fieldKey,
    label,
    fieldType,
    placeholder,
    required,
    options,
  } =
    validation.data;


  const normalizedOptions =
    fieldType ===
    "select"
      ? Array.from(
          new Set(
            options
              .map(
                (option) =>
                  option.trim(),
              )
              .filter(Boolean),
          ),
        )
      : null;


  // -------------------------------------------------------
  // Insert field
  // -------------------------------------------------------

  const {
    data: field,
    error,
  } = await supabase
    .from(
      "service_form_fields",
    )
    .insert({
      service_id:
        serviceId,

      field_key:
        fieldKey,

      label,

      field_type:
        fieldType,

      placeholder:
        placeholder ||
        null,

      required,

      options:
        normalizedOptions,

      sort_order:
        nextSortOrder,

      active:
        true,
    })
    .select(`
      id,
      field_key,
      label,
      field_type,
      sort_order
    `)
    .single();


  if (
    error ||
    !field
  ) {
    console.error(
      "Create service form field failed:",
      error,
    );


    if (
      error?.code ===
      "23505"
    ) {
      return {
        success: false,

        error:
          "A field with this key already exists for this service.",
      };
    }


    return {
      success: false,

      error:
        "The form field could not be created.",
    };
  }


  // -------------------------------------------------------
  // Audit
  // -------------------------------------------------------

  const {
    error: logError,
  } = await supabase
    .from("activity_logs")
    .insert({
      actor_id:
        admin.id,

      action:
        "SERVICE_FORM_FIELD_CREATED",

      entity_type:
        "service_form_field",

      entity_id:
        field.id,

      metadata: {
        service_id:
          serviceId,

        service_name:
          service.name,

        field_key:
          field.field_key,

        label:
          field.label,

        field_type:
          field.field_type,

        sort_order:
          field.sort_order,
      },
    });


  if (logError) {
    console.error(
      "Form field audit log failed:",
      logError,
    );
  }


  revalidatePath(
    `/admin/services/${serviceId}/fields`,
  );

  revalidatePath(
    "/admin/services",
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// UPDATE FIELD
// =========================================================

export async function updateServiceFormField(
  serviceId: string,
  fieldId: string,
  input: UpdateServiceFormFieldInput,
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    updateServiceFormFieldSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success: false,

      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid form field.",
    };
  }


  const {
    label,
    fieldType,
    placeholder,
    required,
    options,
  } =
    validation.data;


  const normalizedOptions =
    fieldType ===
    "select"
      ? Array.from(
          new Set(
            options
              .map(
                (option) =>
                  option.trim(),
              )
              .filter(Boolean),
          ),
        )
      : null;


  const supabase =
    createAdminClient();


  const {
    data: field,
    error,
  } = await supabase
    .from(
      "service_form_fields",
    )
    .update({
      label,

      field_type:
        fieldType,

      placeholder:
        placeholder ||
        null,

      required,

      options:
        normalizedOptions,
    })
    .eq(
      "id",
      fieldId,
    )
    .eq(
      "service_id",
      serviceId,
    )
    .select(`
      id,
      field_key,
      label,
      field_type
    `)
    .single();


  if (
    error ||
    !field
  ) {
    console.error(
      "Update service form field failed:",
      error,
    );


    return {
      success: false,

      error:
        "The form field could not be updated.",
    };
  }


  const {
    error: logError,
  } = await supabase
    .from("activity_logs")
    .insert({
      actor_id:
        admin.id,

      action:
        "SERVICE_FORM_FIELD_UPDATED",

      entity_type:
        "service_form_field",

      entity_id:
        fieldId,

      metadata: {
        service_id:
          serviceId,

        field_key:
          field.field_key,

        label:
          field.label,

        field_type:
          field.field_type,
      },
    });


  if (logError) {
    console.error(
      "Form field update audit log failed:",
      logError,
    );
  }


  revalidatePath(
    `/admin/services/${serviceId}/fields`,
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// ENABLE / DISABLE FIELD
// =========================================================

export async function setServiceFormFieldActive(
  serviceId: string,
  fieldId: string,
  active: boolean,
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data: field,
    error,
  } = await supabase
    .from(
      "service_form_fields",
    )
    .update({
      active,
    })
    .eq(
      "id",
      fieldId,
    )
    .eq(
      "service_id",
      serviceId,
    )
    .select(`
      id,
      field_key,
      label,
      active
    `)
    .single();


  if (
    error ||
    !field
  ) {
    console.error(
      "Form field status update failed:",
      error,
    );


    return {
      success: false,

      error:
        "The field status could not be updated.",
    };
  }


  const {
    error: logError,
  } = await supabase
    .from("activity_logs")
    .insert({
      actor_id:
        admin.id,

      action:
        active
          ? "SERVICE_FORM_FIELD_ENABLED"
          : "SERVICE_FORM_FIELD_DISABLED",

      entity_type:
        "service_form_field",

      entity_id:
        fieldId,

      metadata: {
        service_id:
          serviceId,

        field_key:
          field.field_key,

        label:
          field.label,

        active,
      },
    });


  if (logError) {
    console.error(
      "Form field status audit log failed:",
      logError,
    );
  }


  revalidatePath(
    `/admin/services/${serviceId}/fields`,
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// MOVE FIELD
// =========================================================

export async function moveServiceFormField(
  serviceId: string,
  fieldId: string,
  direction:
    | "UP"
    | "DOWN",
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  // Verify the field belongs to the service.
  const {
    data: field,
    error:
      fieldError,
  } = await supabase
    .from(
      "service_form_fields",
    )
    .select(`
      id,
      service_id
    `)
    .eq(
      "id",
      fieldId,
    )
    .eq(
      "service_id",
      serviceId,
    )
    .single();


  if (
    fieldError ||
    !field
  ) {
    return {
      success: false,

      error:
        "The form field could not be found.",
    };
  }


  const {
    error,
  } = await supabase.rpc(
    "move_service_form_field",
    {
      p_field_id:
        fieldId,

      p_admin_id:
        admin.id,

      p_direction:
        direction,
    },
  );


  if (error) {
    console.error(
      "Move service form field failed:",
      error,
    );


    return {
      success: false,

      error:
        "The form field could not be moved.",
    };
  }


  revalidatePath(
    `/admin/services/${serviceId}/fields`,
  );


  return {
    success: true,
    error: "",
  };
}