"use server";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  changeAdminPasswordSchema,
  type ChangeAdminPasswordInput,
} from "@/lib/validation/admin-password";


export type ChangePasswordResult = {
  success:
    boolean;

  error:
    string;
};


export async function completeTemporaryPasswordChange(
  input:
    ChangeAdminPasswordInput,
): Promise<ChangePasswordResult> {
  // Deliberately use getCurrentAdmin(), not requireAdmin().
  // requireAdmin() redirects temporary-password users back
  // to this page.
  const admin =
    await getCurrentAdmin();


  if (
    !admin
  ) {
    return {
      success:
        false,

      error:
        "Your administrator session is no longer valid. Please sign in again.",
    };
  }


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
        "The password could not be changed.",
    };
  }


  const {
    currentPassword,
    newPassword,
  } =
    validation.data;


  const supabase =
    await createClient();


  // =======================================================
  // CHANGE THE AUTH PASSWORD
  //
  // current_password prevents possession of an old browser
  // session alone from being sufficient after a Super Admin
  // has issued a new temporary password.
  // =======================================================

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
      "Administrator password change failed:",
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


  const now =
    new Date()
      .toISOString();


  const {
    error:
      profileError,
  } =
    await adminClient
      .from(
        "admin_profiles",
      )
      .update({
        must_change_password:
          false,

        password_changed_at:
          now,
      })
      .eq(
        "id",
        admin.id,
      );


  if (
    profileError
  ) {
    console.error(
      "Password security profile update failed:",
      profileError,
    );


    return {
      success:
        false,

      error:
        "Your password was changed, but the account security state could not be updated. Please contact a Super Admin.",
    };
  }


  const {
    error:
      auditError,
  } =
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

          forced_change:
            admin.mustChangePassword,
        },
      });


  if (
    auditError
  ) {
    console.error(
      "Password change audit failed:",
      auditError,
    );
  }


  redirect(
    "/admin",
  );
}