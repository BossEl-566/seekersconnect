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
  type ServiceFormFieldConditionOperator,
  type ServiceFormFieldType,
  type ServiceFormFieldValidationRules,
  type UpdateServiceFormFieldInput,
} from "@/lib/validation/service-form-field";


export type FormFieldActionResult = {
  success:
    boolean;

  error:
    string;
};


// =========================================================
// HELPERS
// =========================================================

const optionFieldTypes =
  new Set<ServiceFormFieldType>([
    "select",
    "radio",
    "multi_select",
  ]);


const fileFieldTypes =
  new Set<ServiceFormFieldType>([
    "file",
    "image",
    "document",
  ]);


function normalizeOptions(
  values:
    string[],
) {
  const seen =
    new Set<string>();

  const result:
    string[] =
    [];


  for (
    const raw of
    values
  ) {
    const value =
      raw.trim();


    if (
      !value
    ) {
      continue;
    }


    const key =
      value.toLowerCase();


    if (
      seen.has(
        key,
      )
    ) {
      continue;
    }


    seen.add(
      key,
    );

    result.push(
      value,
    );
  }


  return result;
}


function parseConditionList(
  value:
    string,
) {
  return normalizeOptions(
    value.split(
      /[\n,]+/,
    ),
  );
}


function normalizeConditionValue(
  operator:
    ""
    | ServiceFormFieldConditionOperator,

  value:
    string,
):
  unknown {
  if (
    !operator
  ) {
    return null;
  }


  if (
    operator ===
      "IN" ||
    operator ===
      "NOT_IN"
  ) {
    return parseConditionList(
      value,
    );
  }


  if (
    operator ===
      "EQUALS" ||
    operator ===
      "NOT_EQUALS"
  ) {
    return value.trim();
  }


  return null;
}


function normalizeValidationRules(
  fieldType:
    ServiceFormFieldType,

  rules:
    ServiceFormFieldValidationRules,
) {
  const result:
    Record<
      string,
      unknown
    > =
    {};


  if (
    [
      "text",
      "email",
      "tel",
      "textarea",
    ].includes(
      fieldType,
    )
  ) {
    if (
      rules.minLength !==
      null
    ) {
      result.minLength =
        rules.minLength;
    }


    if (
      rules.maxLength !==
      null
    ) {
      result.maxLength =
        rules.maxLength;
    }
  }


  if (
    fieldType ===
      "number" ||
    fieldType ===
      "currency"
  ) {
    if (
      rules.min !==
      null
    ) {
      result.min =
        rules.min;
    }


    if (
      rules.max !==
      null
    ) {
      result.max =
        rules.max;
    }
  }


  if (
    fileFieldTypes.has(
      fieldType,
    )
  ) {
    if (
      rules.maxFiles !==
      null
    ) {
      result.maxFiles =
        rules.maxFiles;
    }


    if (
      rules.maxFileSizeMb !==
      null
    ) {
      result.maxFileSizeMb =
        rules.maxFileSizeMb;
    }


    if (
      rules.accept.length >
      0
    ) {
      result.accept =
        normalizeOptions(
          rules.accept,
        );
    }
  }


  return result;
}


async function verifyConditionField(
  serviceId:
    string,

  conditionFieldId:
    string,
) {
  if (
    !conditionFieldId
  ) {
    return {
      success:
        true,

      error:
        "",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .select(`
        id,
        service_id
      `)
      .eq(
        "id",
        conditionFieldId,
      )
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    return {
      success:
        false,

      error:
        "The conditional parent field could not be found.",
    };
  }


  return {
    success:
      true,

    error:
      "",
  };
}


async function wouldCreateConditionCycle(
  serviceId:
    string,

  fieldId:
    string,

  conditionFieldId:
    string,
) {
  if (
    !conditionFieldId
  ) {
    return false;
  }


  if (
    fieldId ===
    conditionFieldId
  ) {
    return true;
  }


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .select(`
        id,
        condition_field_id
      `)
      .eq(
        "service_id",
        serviceId,
      );


  if (
    error
  ) {
    console.error(
      "Could not verify conditional field graph:",
      error,
    );

    return true;
  }


  const parentById =
    new Map<
      string,
      string | null
    >();


  for (
    const item of
    data ?? []
  ) {
    parentById.set(
      item.id,

      item.condition_field_id ??
      null,
    );
  }


  parentById.set(
    fieldId,
    conditionFieldId,
  );


  const visited =
    new Set<string>();


  let current:
    string | null =
    conditionFieldId;


  while (
    current
  ) {
    if (
      current ===
      fieldId
    ) {
      return true;
    }


    if (
      visited.has(
        current,
      )
    ) {
      return true;
    }


    visited.add(
      current,
    );


    current =
      parentById.get(
        current,
      ) ??
      null;
  }


  return false;
}


function revalidateServiceFieldPaths(
  serviceId:
    string,
) {
  revalidatePath(
    `/admin/services/${serviceId}/fields`,
  );

  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    "/request",
  );

  revalidatePath(
    "/services",
  );
}


// =========================================================
// CREATE
// =========================================================

export async function createServiceFormField(
  serviceId:
    string,

  input:
    CreateServiceFormFieldInput,
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
      success:
        false,

      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid form field.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data:
      service,

    error:
      serviceError,
  } =
    await supabase
      .from(
        "services",
      )
      .select(`
        id,
        name,
        slug
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
      success:
        false,

      error:
        "The service could not be found.",
    };
  }


  const {
    data:
      lastField,

    error:
      lastFieldError,
  } =
    await supabase
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
          ascending:
            false,
        },
      )
      .limit(
        1,
      )
      .maybeSingle();


  if (
    lastFieldError
  ) {
    console.error(
      "Could not determine field order:",
      lastFieldError,
    );


    return {
      success:
        false,

      error:
        "The form field could not be created.",
    };
  }


  const nextSortOrder =
    (
      lastField
        ?.sort_order ??
      0
    ) +
    10;


  const value =
    validation.data;


  const conditionCheck =
    await verifyConditionField(
      serviceId,
      value.conditionFieldId,
    );


  if (
    !conditionCheck.success
  ) {
    return conditionCheck;
  }


  const normalizedOptions =
    optionFieldTypes.has(
      value.fieldType,
    )
      ? normalizeOptions(
          value.options,
        )
      : null;


  const {
    data:
      field,

    error,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .insert({
        service_id:
          serviceId,

        field_key:
          value.fieldKey,

        label:
          value.label,

        field_type:
          value.fieldType,

        placeholder:
          value.placeholder ||
          null,

        help_text:
          value.helpText ||
          null,

        required:
          value.required,

        options:
          normalizedOptions,

        allow_other:
          optionFieldTypes.has(
            value.fieldType,
          )
            ? value.allowOther
            : false,

        other_label:
          value.allowOther
            ? (
                value.otherLabel ||
                "Other"
              )
            : null,

        condition_field_id:
          value.conditionFieldId ||
          null,

        condition_operator:
          value.conditionOperator ||
          null,

        condition_value:
          normalizeConditionValue(
            value.conditionOperator,
            value.conditionValue,
          ),

        validation_rules:
          normalizeValidationRules(
            value.fieldType,
            value.validationRules,
          ),

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
        success:
          false,

        error:
          "A field with this key already exists for this service.",
      };
    }


    return {
      success:
        false,

      error:
        error?.message ||
        "The form field could not be created.",
    };
  }


  const {
    error:
      logError,
  } =
    await supabase
      .from(
        "activity_logs",
      )
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

          conditional:
            Boolean(
              value.conditionFieldId,
            ),

          allow_other:
            value.allowOther,
        },
      });


  if (
    logError
  ) {
    console.error(
      "Form field audit log failed:",
      logError,
    );
  }


  revalidateServiceFieldPaths(
    serviceId,
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// UPDATE
// =========================================================

export async function updateServiceFormField(
  serviceId:
    string,

  fieldId:
    string,

  input:
    UpdateServiceFormFieldInput,
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
      success:
        false,

      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid form field.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data:
      existingField,

    error:
      existingError,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .select(`
        id,
        service_id,
        field_key
      `)
      .eq(
        "id",
        fieldId,
      )
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    existingError ||
    !existingField
  ) {
    return {
      success:
        false,

      error:
        "The form field could not be found.",
    };
  }


  const value =
    validation.data;


  const conditionCheck =
    await verifyConditionField(
      serviceId,
      value.conditionFieldId,
    );


  if (
    !conditionCheck.success
  ) {
    return conditionCheck;
  }


  if (
    await wouldCreateConditionCycle(
      serviceId,
      fieldId,
      value.conditionFieldId,
    )
  ) {
    return {
      success:
        false,

      error:
        "This condition would create a circular dependency between fields.",
    };
  }


  const normalizedOptions =
    optionFieldTypes.has(
      value.fieldType,
    )
      ? normalizeOptions(
          value.options,
        )
      : null;


  const {
    data:
      field,

    error,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .update({
        label:
          value.label,

        field_type:
          value.fieldType,

        placeholder:
          value.placeholder ||
          null,

        help_text:
          value.helpText ||
          null,

        required:
          value.required,

        options:
          normalizedOptions,

        allow_other:
          optionFieldTypes.has(
            value.fieldType,
          )
            ? value.allowOther
            : false,

        other_label:
          value.allowOther
            ? (
                value.otherLabel ||
                "Other"
              )
            : null,

        condition_field_id:
          value.conditionFieldId ||
          null,

        condition_operator:
          value.conditionOperator ||
          null,

        condition_value:
          normalizeConditionValue(
            value.conditionOperator,
            value.conditionValue,
          ),

        validation_rules:
          normalizeValidationRules(
            value.fieldType,
            value.validationRules,
          ),
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
      success:
        false,

      error:
        error?.message ||
        "The form field could not be updated.",
    };
  }


  const {
    error:
      logError,
  } =
    await supabase
      .from(
        "activity_logs",
      )
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

          conditional:
            Boolean(
              value.conditionFieldId,
            ),

          allow_other:
            value.allowOther,
        },
      });


  if (
    logError
  ) {
    console.error(
      "Form field update audit log failed:",
      logError,
    );
  }


  revalidateServiceFieldPaths(
    serviceId,
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// ENABLE / DISABLE
// =========================================================

export async function setServiceFormFieldActive(
  serviceId:
    string,

  fieldId:
    string,

  active:
    boolean,
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  if (
    !active
  ) {
    const {
      data:
        dependants,

      error:
        dependantError,
    } =
      await supabase
        .from(
          "service_form_fields",
        )
        .select(`
          id,
          label
        `)
        .eq(
          "service_id",
          serviceId,
        )
        .eq(
          "condition_field_id",
          fieldId,
        )
        .eq(
          "active",
          true,
        )
        .limit(
          1,
        );


    if (
      dependantError
    ) {
      console.error(
        "Conditional dependency lookup failed:",
        dependantError,
      );
    }


    if (
      dependants &&
      dependants.length >
      0
    ) {
      return {
        success:
          false,

        error:
          `This field controls "${dependants[0].label}". Remove that condition before disabling it.`,
      };
    }
  }


  const {
    data:
      currentField,

    error:
      currentError,
  } =
    await supabase
      .from(
        "service_form_fields",
      )
      .select(`
        id,
        condition_field_id
      `)
      .eq(
        "id",
        fieldId,
      )
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    currentError ||
    !currentField
  ) {
    return {
      success:
        false,

      error:
        "The form field could not be found.",
    };
  }


  if (
    active &&
    currentField.condition_field_id
  ) {
    const {
      data:
        parent,
    } =
      await supabase
        .from(
          "service_form_fields",
        )
        .select(`
          id,
          active
        `)
        .eq(
          "id",
          currentField.condition_field_id,
        )
        .maybeSingle();


    if (
      !parent?.active
    ) {
      return {
        success:
          false,

        error:
          "Enable the field controlling this condition first.",
      };
    }
  }


  const {
    data:
      field,

    error,
  } =
    await supabase
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
    return {
      success:
        false,

      error:
        "The field status could not be updated.",
    };
  }


  await supabase
    .from(
      "activity_logs",
    )
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


  revalidateServiceFieldPaths(
    serviceId,
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// MOVE
// =========================================================

export async function moveServiceFormField(
  serviceId:
    string,

  fieldId:
    string,

  direction:
    | "UP"
    | "DOWN",
): Promise<FormFieldActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data:
      field,

    error:
      fieldError,
  } =
    await supabase
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
      success:
        false,

      error:
        "The form field could not be found.",
    };
  }


  const {
    error,
  } =
    await supabase.rpc(
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


  if (
    error
  ) {
    console.error(
      "Move service form field failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The form field could not be moved.",
    };
  }


  revalidateServiceFieldPaths(
    serviceId,
  );


  return {
    success:
      true,

    error:
      "",
  };
}