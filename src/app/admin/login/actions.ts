"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string;
};

export async function loginAdmin(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email =
    formData.get("email");

  const password =
    formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return {
      error:
        "Enter your email address and password.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (
    error ||
    !data.user
  ) {
    return {
      error:
        "The email address or password is incorrect.",
    };
  }

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("admin_profiles")
      .select("role, active")
      .eq("id", data.user.id)
      .single();

  if (
    profileError ||
    !profile ||
    !profile.active
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "This account does not have access to the administration system.",
    };
  }

  if (
    profile.role !== "SUPER_ADMIN" &&
    profile.role !== "OPERATIONS_ADMIN"
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "This account does not have a valid administration role.",
    };
  }

  redirect("/admin");
}