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
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/lib/validation/service";


export type ServiceActionResult = {
  success: boolean;
  error: string;
};


// =========================================================
// HELPER
// =========================================================

async function validateExistingOption(
  field:
    | "category"
    | "form_type",
  value: string,
) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } = await supabase
    .from("services")
    .select(field)
    .eq(
      field,
      value,
    )
    .limit(1);


  if (error) {
    console.error(
      `Could not validate service ${field}:`,
      error,
    );

    return false;
  }


  return Boolean(
    data &&
      data.length >
        0,
  );
}


// =========================================================
// CREATE SERVICE
// =========================================================

export async function createService(
  input: CreateServiceInput,
): Promise<ServiceActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    createServiceSchema.safeParse(
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
        "Invalid service information.",
    };
  }


  const {
    universityId,
    slug,
    name,
    shortName,
    description,
    category,
    formType,
  } =
    validation.data;


  const supabase =
    createAdminClient();


  // -------------------------------------------------------
  // Ensure university exists
  // -------------------------------------------------------

  const {
    data: university,
    error:
      universityError,
  } = await supabase
    .from("universities")
    .select(`
      id,
      code,
      name
    `)
    .eq(
      "id",
      universityId,
    )
    .single();


  if (
    universityError ||
    !university
  ) {
    return {
      success: false,

      error:
        "The selected university could not be found.",
    };
  }


  // -------------------------------------------------------
  // We currently reuse values already accepted by the
  // database schema.
  //
  // Later, when we complete the fully dynamic field builder,
  // form_type will no longer be relied upon by the wizard.
  // -------------------------------------------------------

  const [
    categoryValid,
    formTypeValid,
  ] =
    await Promise.all([
      validateExistingOption(
        "category",
        category,
      ),

      validateExistingOption(
        "form_type",
        formType,
      ),
    ]);


  if (
    !categoryValid
  ) {
    return {
      success: false,

      error:
        "The selected service category is not supported.",
    };
  }


  if (
    !formTypeValid
  ) {
    return {
      success: false,

      error:
        "The selected form type is not supported.",
    };
  }


  // -------------------------------------------------------
  // Create service
  // -------------------------------------------------------

  const {
    data: service,
    error,
  } = await supabase
    .from("services")
    .insert({
      university_id:
        universityId,

      slug,

      name,

      short_name:
        shortName,

      description:
        description ||
        null,

      category,

      form_type:
        formType,

      active:
        true,
    })
    .select(`
      id,
      slug,
      name,
      short_name,
      category,
      form_type,
      active
    `)
    .single();


  if (
    error ||
    !service
  ) {
    console.error(
      "Create service failed:",
      error,
    );


    if (
      error?.code ===
      "23505"
    ) {
      return {
        success: false,

        error:
          "A service with this slug already exists for this university.",
      };
    }


    return {
      success: false,

      error:
        "The service could not be created.",
    };
  }


  // -------------------------------------------------------
  // Audit log
  // -------------------------------------------------------

  const {
    error: logError,
  } = await supabase
    .from("activity_logs")
    .insert({
      actor_id:
        admin.id,

      action:
        "SERVICE_CREATED",

      entity_type:
        "service",

      entity_id:
        service.id,

      metadata: {
        university_id:
          universityId,

        university_code:
          university.code,

        slug:
          service.slug,

        name:
          service.name,

        category:
          service.category,

        form_type:
          service.form_type,
      },
    });


  if (logError) {
    console.error(
      "Service creation audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// UPDATE SERVICE
// =========================================================

export async function updateService(
  serviceId: string,
  input: UpdateServiceInput,
): Promise<ServiceActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    updateServiceSchema.safeParse(
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
        "Invalid service information.",
    };
  }


  const {
    name,
    shortName,
    description,
    category,
    formType,
  } =
    validation.data;


  const [
    categoryValid,
    formTypeValid,
  ] =
    await Promise.all([
      validateExistingOption(
        "category",
        category,
      ),

      validateExistingOption(
        "form_type",
        formType,
      ),
    ]);


  if (
    !categoryValid
  ) {
    return {
      success: false,

      error:
        "The selected service category is not supported.",
    };
  }


  if (
    !formTypeValid
  ) {
    return {
      success: false,

      error:
        "The selected form type is not supported.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data: service,
    error,
  } = await supabase
    .from("services")
    .update({
      name,

      short_name:
        shortName,

      description:
        description ||
        null,

      category,

      form_type:
        formType,
    })
    .eq(
      "id",
      serviceId,
    )
    .select(`
      id,
      university_id,
      slug,
      name,
      short_name,
      category,
      form_type,
      active
    `)
    .single();


  if (
    error ||
    !service
  ) {
    console.error(
      "Update service failed:",
      error,
    );


    return {
      success: false,

      error:
        "The service could not be updated.",
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
        "SERVICE_UPDATED",

      entity_type:
        "service",

      entity_id:
        serviceId,

      metadata: {
        university_id:
          service.university_id,

        slug:
          service.slug,

        name:
          service.name,

        short_name:
          service.short_name,

        category:
          service.category,

        form_type:
          service.form_type,
      },
    });


  if (logError) {
    console.error(
      "Service update audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// ENABLE / DISABLE SERVICE
// =========================================================

export async function setServiceActive(
  serviceId: string,
  active: boolean,
): Promise<ServiceActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data: service,
    error,
  } = await supabase
    .from("services")
    .update({
      active,
    })
    .eq(
      "id",
      serviceId,
    )
    .select(`
      id,
      university_id,
      slug,
      name,
      active
    `)
    .single();


  if (
    error ||
    !service
  ) {
    console.error(
      "Service status update failed:",
      error,
    );


    return {
      success: false,

      error:
        "The service status could not be updated.",
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
          ? "SERVICE_ENABLED"
          : "SERVICE_DISABLED",

      entity_type:
        "service",

      entity_id:
        serviceId,

      metadata: {
        university_id:
          service.university_id,

        slug:
          service.slug,

        name:
          service.name,

        active,
      },
    });


  if (logError) {
    console.error(
      "Service status audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );


  return {
    success: true,
    error: "",
  };
}