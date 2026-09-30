"use server";

import {
  randomBytes,
} from "crypto";

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
  createAdminAccountSchema,
  updateAdminRoleSchema,
  type AdminRole,
  type CreateAdminAccountInput,
} from "@/lib/validation/admin-account";


export type AdminActionResult = {
  success: boolean;

  error: string;

  temporaryPassword?:
    string;
};


// =========================================================
// TEMPORARY PASSWORD
// =========================================================

function generateTemporaryPassword() {
  return (
    `SC247!` +
    randomBytes(12)
      .toString(
        "base64url",
      )
  );
}


// =========================================================
// COUNT ACTIVE SUPER ADMINS
// =========================================================

async function countActiveSuperAdmins() {
  const supabase =
    createAdminClient();


  const {
    count,
    error,
  } = await supabase
    .from(
      "admin_profiles",
    )
    .select(
      "id",
      {
        count:
          "exact",

        head:
          true,
      },
    )
    .eq(
      "role",
      "SUPER_ADMIN",
    )
    .eq(
      "active",
      true,
    );


  if (error) {
    throw error;
  }


  return (
    count ??
    0
  );
}


// =========================================================
// CREATE ADMIN
// =========================================================

export async function createAdminAccount(
  input:
    CreateAdminAccountInput,
): Promise<AdminActionResult> {
  const currentAdmin =
    await requireSuperAdmin();


  const validation =
    createAdminAccountSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation.error
          .issues[0]
          ?.message ??
        "Invalid administrator information.",
    };
  }


  const {
    fullName,
    email,
    role,
  } =
    validation.data;


  const supabase =
    createAdminClient();


  // =======================================================
  // CREATE AUTH USER
  // =======================================================

  const temporaryPassword =
    generateTemporaryPassword();


  const {
    data:
      authResult,

    error:
      authError,
  } =
    await supabase.auth.admin.createUser({
      email,

      password:
        temporaryPassword,

      email_confirm:
        true,

      user_metadata: {
        full_name:
          fullName,
      },
    });


  if (
    authError ||
    !authResult.user
  ) {
    console.error(
      "Create admin auth user failed:",
      authError,
    );


    const message =
      authError
        ?.message
        ?.toLowerCase() ??
      "";


    if (
      message.includes(
        "already",
      )
    ) {
      return {
        success:
          false,

        error:
          "An account with this email already exists.",
      };
    }


    return {
      success:
        false,

      error:
        "The administrator account could not be created.",
    };
  }


  const userId =
    authResult.user.id;


  // =======================================================
  // CREATE ADMIN PROFILE
  // =======================================================

  const {
  error:
    profileError,
} = await supabase
  .from(
    "admin_profiles",
  )
  .insert({
    id:
      userId,

    full_name:
      fullName,

    role,

    active:
      true,
  });


  if (
    profileError
  ) {
    console.error(
      "Create admin profile failed:",
      profileError,
    );


    // Prevent an orphan auth account.
    const {
      error:
        cleanupError,
    } =
      await supabase.auth.admin.deleteUser(
        userId,
      );


    if (
      cleanupError
    ) {
      console.error(
        "Admin auth cleanup failed:",
        cleanupError,
      );
    }


    return {
      success:
        false,

      error:
        "The administrator profile could not be created.",
    };
  }


  // =======================================================
  // AUDIT LOG
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
        currentAdmin.id,

      action:
        "ADMIN_CREATED",

      entity_type:
        "admin",

      entity_id:
        userId,

      metadata: {
        email,

        full_name:
          fullName,

        role,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Admin creation audit failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/admins",
  );


  return {
    success:
      true,

    error:
      "",

    temporaryPassword,
  };
}


// =========================================================
// CHANGE ADMIN ROLE
// =========================================================

export async function changeAdminRole(
  targetAdminId:
    string,

  role:
    AdminRole,
): Promise<AdminActionResult> {
  const currentAdmin =
    await requireSuperAdmin();


  if (
    targetAdminId ===
    currentAdmin.id
  ) {
    return {
      success:
        false,

      error:
        "You cannot change your own administrator role.",
    };
  }


  const validation =
    updateAdminRoleSchema.safeParse({
      role,
    });


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        "Invalid administrator role.",
    };
  }


  const supabase =
    createAdminClient();


  // =======================================================
  // LOAD CURRENT PROFILE
  // =======================================================

  const {
    data:
      targetAdmin,

    error:
      targetError,
  } = await supabase
    .from(
      "admin_profiles",
    )
    .select(`
      id,
      role,
      active
    `)
    .eq(
      "id",
      targetAdminId,
    )
    .maybeSingle();


  if (
    targetError
  ) {
    console.error(
      "Load target admin failed:",
      targetError,
    );


    return {
      success:
        false,

      error:
        "The administrator could not be loaded.",
    };
  }


  if (
    !targetAdmin
  ) {
    return {
      success:
        false,

      error:
        "Administrator not found.",
    };
  }


  // =======================================================
  // PROTECT LAST ACTIVE SUPER ADMIN
  // =======================================================

  if (
    targetAdmin.role ===
      "SUPER_ADMIN" &&
    targetAdmin.active &&
    role !==
      "SUPER_ADMIN"
  ) {
    try {
      const superAdminCount =
        await countActiveSuperAdmins();


      if (
        superAdminCount <=
        1
      ) {
        return {
          success:
            false,

          error:
            "The final active Super Admin cannot be demoted.",
        };
      }
    } catch (
      error
    ) {
      console.error(
        "Super Admin count failed:",
        error,
      );


      return {
        success:
          false,

        error:
          "The administrator role could not be changed safely.",
      };
    }
  }


  // =======================================================
  // UPDATE ROLE
  // =======================================================

  const {
    error:
      updateError,
  } = await supabase
    .from(
      "admin_profiles",
    )
    .update({
      role,
    })
    .eq(
      "id",
      targetAdminId,
    );


  if (
    updateError
  ) {
    console.error(
      "Admin role update failed:",
      updateError,
    );


    return {
      success:
        false,

      error:
        "The administrator role could not be changed.",
    };
  }


  const {
    data:
      authUser,
  } =
    await supabase.auth.admin.getUserById(
      targetAdminId,
    );


  const {
    error:
      logError,
  } = await supabase
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        currentAdmin.id,

      action:
        "ADMIN_ROLE_CHANGED",

      entity_type:
        "admin",

      entity_id:
        targetAdminId,

      metadata: {
        email:
          authUser.user
            ?.email ??
          null,

        previous_role:
          targetAdmin.role,

        new_role:
          role,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Admin role audit failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/admins",
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// ENABLE / DISABLE ADMIN
// =========================================================

export async function setAdminActive(
  targetAdminId:
    string,

  active:
    boolean,
): Promise<AdminActionResult> {
  const currentAdmin =
    await requireSuperAdmin();


  if (
    targetAdminId ===
    currentAdmin.id
  ) {
    return {
      success:
        false,

      error:
        "You cannot disable your own administrator account.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data:
      targetAdmin,

    error:
      targetError,
  } = await supabase
    .from(
      "admin_profiles",
    )
    .select(`
      id,
      role,
      active
    `)
    .eq(
      "id",
      targetAdminId,
    )
    .maybeSingle();


  if (
    targetError
  ) {
    console.error(
      "Load target admin failed:",
      targetError,
    );


    return {
      success:
        false,

      error:
        "The administrator could not be loaded.",
    };
  }


  if (
    !targetAdmin
  ) {
    return {
      success:
        false,

      error:
        "Administrator not found.",
    };
  }


  // Nothing to change.
  if (
    targetAdmin.active ===
    active
  ) {
    return {
      success:
        true,

      error:
        "",
    };
  }


  // =======================================================
  // PROTECT LAST ACTIVE SUPER ADMIN
  // =======================================================

  if (
    !active &&
    targetAdmin.role ===
      "SUPER_ADMIN" &&
    targetAdmin.active
  ) {
    try {
      const superAdminCount =
        await countActiveSuperAdmins();


      if (
        superAdminCount <=
        1
      ) {
        return {
          success:
            false,

          error:
            "The final active Super Admin cannot be disabled.",
        };
      }
    } catch (
      error
    ) {
      console.error(
        "Super Admin count failed:",
        error,
      );


      return {
        success:
          false,

        error:
          "The administrator could not be disabled safely.",
      };
    }
  }


  const {
    error:
      updateError,
  } = await supabase
    .from(
      "admin_profiles",
    )
    .update({
      active,
    })
    .eq(
      "id",
      targetAdminId,
    );


  if (
    updateError
  ) {
    console.error(
      "Admin status update failed:",
      updateError,
    );


    return {
      success:
        false,

      error:
        "The administrator status could not be updated.",
    };
  }


  const {
    data:
      authUser,
  } =
    await supabase.auth.admin.getUserById(
      targetAdminId,
    );


  const {
    error:
      logError,
  } = await supabase
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        currentAdmin.id,

      action:
        active
          ? "ADMIN_ENABLED"
          : "ADMIN_DISABLED",

      entity_type:
        "admin",

      entity_id:
        targetAdminId,

      metadata: {
        email:
          authUser.user
            ?.email ??
          null,

        role:
          targetAdmin.role,

        active,
      },
    });


  if (
    logError
  ) {
    console.error(
      "Admin status audit failed:",
      logError,
    );
  }


  revalidatePath(
    "/admin/admins",
  );


  return {
    success:
      true,

    error:
      "",
  };
}