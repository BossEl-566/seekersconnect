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
  success:
    boolean;

  error:
    string;
};


// =========================================================
// VALIDATE FORM TYPE
//
// form_type remains temporarily for backwards compatibility.
// The dynamic field builder will eventually replace this
// dependency.
// =========================================================

async function validateFormType(
  formType:
    string,
) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } = await supabase
    .from(
      "services",
    )
    .select(
      "form_type",
    )
    .eq(
      "form_type",
      formType,
    )
    .limit(1);


  if (
    error
  ) {
    console.error(
      "Could not validate form type:",
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
  input:
    CreateServiceInput,
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
      success:
        false,

      error:
        validation
          .error
          .issues[0]
          ?.message ??
        "Invalid service information.",
    };
  }


  const {
    serviceScope,
    universityId,
    serviceCategoryId,
    slug,
    name,
    shortName,
    description,
    formType,
    displayOrder,
    featured,
  } =
    validation.data;


  const supabase =
    createAdminClient();


  // =======================================================
  // CATEGORY MUST EXIST
  // =======================================================

  const {
    data:
      serviceCategory,
    error:
      categoryError,
  } = await supabase
    .from(
      "service_categories",
    )
    .select(`
      id,
      slug,
      name,
      active
    `)
    .eq(
      "id",
      serviceCategoryId,
    )
    .single();


  if (
    categoryError ||
    !serviceCategory
  ) {
    return {
      success:
        false,

      error:
        "The selected service category could not be found.",
    };
  }


  if (
    !serviceCategory.active
  ) {
    return {
      success:
        false,

      error:
        "The selected service category is disabled.",
    };
  }


  // =======================================================
  // ACADEMIC SERVICE REQUIRES A REAL INSTITUTION
  // =======================================================

  let university:
    | {
        id:
          string;

        code:
          string;

        name:
          string;

        active:
          boolean;
      }
    | null =
    null;


  if (
    serviceScope ===
    "academic"
  ) {
    if (
      !universityId
    ) {
      return {
        success:
          false,

        error:
          "Select an institution for this academic service.",
      };
    }


    const {
      data,
      error,
    } = await supabase
      .from(
        "universities",
      )
      .select(`
        id,
        code,
        name,
        active
      `)
      .eq(
        "id",
        universityId,
      )
      .single();


    if (
      error ||
      !data
    ) {
      return {
        success:
          false,

        error:
          "The selected institution could not be found.",
      };
    }


    if (
      data.code ===
      "SC247"
    ) {
      return {
        success:
          false,

        error:
          "SC247 is a legacy compatibility provider and cannot be used for new academic services.",
      };
    }


    if (
      !data.active
    ) {
      return {
        success:
          false,

        error:
          "The selected institution is disabled.",
      };
    }


    university =
      data;
  }


  // =======================================================
  // FORM TYPE
  // =======================================================

  const formTypeValid =
    await validateFormType(
      formType,
    );


  if (
    !formTypeValid
  ) {
    return {
      success:
        false,

      error:
        "The selected form type is not supported.",
    };
  }


  // =======================================================
  // CREATE SERVICE
  //
  // The legacy category column remains because older parts
  // of the application still reference it.
  //
  // New category architecture uses service_category_id.
  // =======================================================

  const {
    data:
      service,
    error,
  } = await supabase
    .from(
      "services",
    )
    .insert({
      university_id:
        serviceScope ===
        "academic"
          ? universityId
          : null,

      service_category_id:
        serviceCategoryId,

      service_scope:
        serviceScope,

      slug,

      name,

      short_name:
        shortName,

      description:
        description ||
        null,

      // Compatibility value.
      category:
        "other",

      form_type:
        formType,

      display_order:
        displayOrder,

      featured,

      active:
        true,
    })
    .select(`
      id,
      university_id,
      service_category_id,
      service_scope,
      slug,
      name,
      short_name,
      category,
      form_type,
      display_order,
      featured,
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
        success:
          false,

        error:
          serviceScope ===
          "general"
            ? "A general service with this slug already exists."
            : "A service with this slug already exists for this institution.",
      };
    }


    return {
      success:
        false,

      error:
        "The service could not be created.",
    };
  }


  // =======================================================
  // AUDIT
  // =======================================================

  const {
    error:
      logError,
  } = await supabase
    .from(
      "activity_logs",
    )
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
        service_scope:
          serviceScope,

        university_id:
          service.university_id,

        university_code:
          university?.code ??
          null,

        category_id:
          serviceCategoryId,

        category_slug:
          serviceCategory.slug,

        category_name:
          serviceCategory.name,

        slug:
          service.slug,

        name:
          service.name,

        form_type:
          service.form_type,

        display_order:
          service.display_order,

        featured:
          service.featured,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Service creation audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    "/services",
  );

  revalidatePath(
    "/request",
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// UPDATE SERVICE
// =========================================================

export async function updateService(
  serviceId:
    string,

  input:
    UpdateServiceInput,
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
      success:
        false,

      error:
        validation
          .error
          .issues[0]
          ?.message ??
        "Invalid service information.",
    };
  }


  const {
    name,
    shortName,
    description,
    serviceCategoryId,
    formType,
    displayOrder,
    featured,
  } =
    validation.data;


  const supabase =
    createAdminClient();


  // =======================================================
  // CATEGORY
  // =======================================================

  const {
    data:
      serviceCategory,
    error:
      categoryError,
  } = await supabase
    .from(
      "service_categories",
    )
    .select(`
      id,
      slug,
      name
    `)
    .eq(
      "id",
      serviceCategoryId,
    )
    .single();


  if (
    categoryError ||
    !serviceCategory
  ) {
    return {
      success:
        false,

      error:
        "The selected service category could not be found.",
    };
  }


  // =======================================================
  // FORM TYPE
  // =======================================================

  const formTypeValid =
    await validateFormType(
      formType,
    );


  if (
    !formTypeValid
  ) {
    return {
      success:
        false,

      error:
        "The selected form type is not supported.",
    };
  }


  // =======================================================
  // UPDATE
  // =======================================================

  const {
    data:
      service,
    error,
  } = await supabase
    .from(
      "services",
    )
    .update({
      name,

      short_name:
        shortName,

      description:
        description ||
        null,

      service_category_id:
        serviceCategoryId,

      form_type:
        formType,

      display_order:
        displayOrder,

      featured,
    })
    .eq(
      "id",
      serviceId,
    )
    .select(`
      id,
      university_id,
      service_category_id,
      service_scope,
      slug,
      name,
      short_name,
      form_type,
      display_order,
      featured,
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
      success:
        false,

      error:
        "The service could not be updated.",
    };
  }


  // =======================================================
  // AUDIT
  // =======================================================

  const {
    error:
      logError,
  } = await supabase
    .from(
      "activity_logs",
    )
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

        service_scope:
          service.service_scope,

        category_id:
          service.service_category_id,

        category_slug:
          serviceCategory.slug,

        category_name:
          serviceCategory.name,

        slug:
          service.slug,

        name:
          service.name,

        short_name:
          service.short_name,

        form_type:
          service.form_type,

        display_order:
          service.display_order,

        featured:
          service.featured,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Service update audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    "/services",
  );

  revalidatePath(
    "/request",
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// ENABLE / DISABLE SERVICE
// =========================================================

export async function setServiceActive(
  serviceId:
    string,

  active:
    boolean,
): Promise<ServiceActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data:
      service,
    error,
  } = await supabase
    .from(
      "services",
    )
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
      service_category_id,
      service_scope,
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
      success:
        false,

      error:
        "The service status could not be updated.",
    };
  }


  const {
    error:
      logError,
  } = await supabase
    .from(
      "activity_logs",
    )
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

        service_scope:
          service.service_scope,

        category_id:
          service.service_category_id,

        slug:
          service.slug,

        name:
          service.name,

        active,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Service status audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    "/services",
  );

  revalidatePath(
    "/request",
  );


  return {
    success:
      true,

    error:
      "",
  };
}