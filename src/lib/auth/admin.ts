import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN";

export type CurrentAdmin = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("admin_profiles")
      .select("id, full_name, role, active")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    !profile.active
  ) {
    return null;
  }

  if (
    profile.role !== "SUPER_ADMIN" &&
    profile.role !== "OPERATIONS_ADMIN"
  ) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();

  if (admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return admin;
}