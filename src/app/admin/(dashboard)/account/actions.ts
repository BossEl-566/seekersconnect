"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  changeAdminPasswordSchema,
  updateAdminProfileSchema,
  type ChangeAdminPasswordInput,
} from "@/lib/validation/admin-password";


export type AccountActionResult = {
  success:
    boolean;

  error:
    string;
};


// =========================================================
// UPDATE OWN NAME
// =========================================================

export async function updateOwnProfile(
  fullName:
    string,
): Promise<AccountActionResult> {
  const admin =
    await requireAdmin();


  const validation =
    updateAdminProfileSchema.safeParse({
      fullName,
    });


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
        "Invalid profile information.",
    };
  }


  const normalizedName =
    validation.data.fullName;


  const adminClient =
    createAdminClient();


  const {
    error:
      profileError,
  } =
    await adminClient
      .from(
        "admin_profiles",
      )
      .update({
        full_name:
          normalizedName,
      })
      .eq(
        "id",
        admin.id,
      );


  if (
    profileError
  ) {
    console.error(
      "Update admin profile failed:",
      profileError,
    );


    return {
      success:
        false,

      error:
        "Your profile could not be updated.",
    };
  }


  // Keep Auth metadata synchronized for administrative tools
  // that may display it.
  const {
    error:
      metadataError,
  } =
    await adminClient.auth.admin.updateUserById(
      admin.id,
      {
        user_metadata: {
          full_name:
            normalizedName,
        },
      },
    );


  if (
    metadataError
  ) {
    console.error(
      "Update auth metadata failed:",
      metadataError,
    );
  }


  await adminClient
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        admin.id,

      action:
        "ADMIN_PROFILE_UPDATED",

      entity_type:
        "admin",

      entity_id:
        admin.id,

      metadata: {
        previous_full_name:
          admin.fullName,

        full_name:
          normalizedName,
      },
    });


  revalidatePath(
    "/admin/account",
  );

  revalidatePath(
    "/admin",
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// CHANGE OWN PASSWORD
// =========================================================

export async function changeOwnPassword(
  input:
    ChangeAdminPasswordInput,
): Promise<AccountActionResult> {
  const admin =
    await requireAdmin();


  const validation =
    changeAdminPasswordSchema.safeParse(
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
        "Invalid password.",
    };
  }


  const {
    currentPassword,
    newPassword,
  } =
    validation.data;


  const supabase =
    await createClient();


  const {
    error:
      passwordError,
  } =
    await supabase.auth.updateUser({
      password:
        newPassword,

      current_password:
        currentPassword,
    });


  if (
    passwordError
  ) {
    console.error(
      "Change own password failed:",
      passwordError,
    );


    return {
      success:
        false,

      error:
        "The current password is incorrect or the new password does not meet the security requirements.",
    };
  }


  const adminClient =
    createAdminClient();


  await adminClient
    .from(
      "admin_profiles",
    )
    .update({
      password_changed_at:
        new Date()
          .toISOString(),

      must_change_password:
        false,
    })
    .eq(
      "id",
      admin.id,
    );


  await adminClient
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        admin.id,

      action:
        "ADMIN_PASSWORD_CHANGED",

      entity_type:
        "admin",

      entity_id:
        admin.id,

      metadata: {
        self_service:
          true,
      },
    });


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// SIGN OUT OTHER SESSIONS
// =========================================================

export async function signOutOtherSessions():
  Promise<AccountActionResult> {
  const admin =
    await requireAdmin();


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.auth.signOut({
      scope:
        "others",
    });


  if (
    error
  ) {
    console.error(
      "Sign out other sessions failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "Other sessions could not be signed out.",
    };
  }


  const adminClient =
    createAdminClient();


  await adminClient
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        admin.id,

      action:
        "ADMIN_OTHER_SESSIONS_SIGNED_OUT",

      entity_type:
        "admin",

      entity_id:
        admin.id,

      metadata:
        {},
    });


  return {
    success:
      true,

    error:
      "",
  };
}