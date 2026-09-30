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
  createUniversitySchema,
  updateUniversitySchema,
  type CreateUniversityInput,
  type UpdateUniversityInput,
} from "@/lib/validation/university";


export type UniversityActionResult = {
  success: boolean;
  error: string;
};


// =========================================================
// CREATE UNIVERSITY
// =========================================================

export async function createUniversity(
  input: CreateUniversityInput,
): Promise<UniversityActionResult> {
  const admin =
    await requireSuperAdmin();

  const validation =
    createUniversitySchema.safeParse(
      input,
    );


  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid university information.",
    };
  }


  const {
    code,
    name,
    location,
  } = validation.data;


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } = await supabase
    .from("universities")
    .insert({
      code,
      name,
      location,
      active: true,
    })
    .select(`
      id,
      code,
      name,
      location,
      active
    `)
    .single();


  if (error) {
    console.error(
      "Create university failed:",
      error,
    );


    if (
      error.code ===
      "23505"
    ) {
      return {
        success: false,
        error:
          "A university with this code already exists.",
      };
    }


    return {
      success: false,
      error:
        "The university could not be created.",
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
        "UNIVERSITY_CREATED",

      entity_type:
        "university",

      entity_id:
        data.id,

      metadata: {
        code:
          data.code,

        name:
          data.name,

        location:
          data.location,
      },
    });


  if (logError) {
    console.error(
      "University audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/universities",
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// UPDATE UNIVERSITY
// =========================================================

export async function updateUniversity(
  universityId: string,
  input: UpdateUniversityInput,
): Promise<UniversityActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    updateUniversitySchema.safeParse(
      input,
    );


  if (!validation.success) {
    return {
      success: false,

      error:
        validation.error.issues[0]
          ?.message ??
        "Invalid university information.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data: university,
    error,
  } = await supabase
    .from("universities")
    .update({
      name:
        validation.data.name,

      location:
        validation.data.location,
    })
    .eq(
      "id",
      universityId,
    )
    .select(`
      id,
      code,
      name,
      location,
      active
    `)
    .single();


  if (
    error ||
    !university
  ) {
    console.error(
      "Update university failed:",
      error,
    );


    return {
      success: false,
      error:
        "The university could not be updated.",
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
        "UNIVERSITY_UPDATED",

      entity_type:
        "university",

      entity_id:
        universityId,

      metadata: {
        code:
          university.code,

        name:
          university.name,

        location:
          university.location,
      },
    });


  if (logError) {
    console.error(
      "University update audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/universities",
  );


  return {
    success: true,
    error: "",
  };
}


// =========================================================
// ACTIVATE / DISABLE UNIVERSITY
// =========================================================

export async function setUniversityActive(
  universityId: string,
  active: boolean,
): Promise<UniversityActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data: university,
    error,
  } = await supabase
    .from("universities")
    .update({
      active,
    })
    .eq(
      "id",
      universityId,
    )
    .select(`
      id,
      code,
      name,
      active
    `)
    .single();


  if (
    error ||
    !university
  ) {
    console.error(
      "University status update failed:",
      error,
    );


    return {
      success: false,

      error:
        "The university status could not be updated.",
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
          ? "UNIVERSITY_ENABLED"
          : "UNIVERSITY_DISABLED",

      entity_type:
        "university",

      entity_id:
        universityId,

      metadata: {
        code:
          university.code,

        name:
          university.name,

        active,
      },
    });


  if (logError) {
    console.error(
      "University status audit log failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/universities",
  );


  return {
    success: true,
    error: "",
  };
}