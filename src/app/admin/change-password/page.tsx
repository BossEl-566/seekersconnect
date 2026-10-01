import {
  redirect,
} from "next/navigation";

import {
  getCurrentAdmin,
} from "@/lib/auth/admin";

import {
  ChangePasswordForm,
} from "@/components/admin/change-password-form";


export default async function ChangePasswordPage() {
  const admin =
    await getCurrentAdmin();


  if (
    !admin
  ) {
    redirect(
      "/admin/login",
    );
  }


  // Someone manually visiting this route after completing
  // their temporary password setup should use the normal
  // account page instead.
  if (
    !admin.mustChangePassword
  ) {
    redirect(
      "/admin/account",
    );
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <ChangePasswordForm
        email={
          admin.email
        }
      />
    </main>
  );
}