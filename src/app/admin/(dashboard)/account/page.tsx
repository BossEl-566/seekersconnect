import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  AdminAccountManager,
} from "@/components/admin/admin-account-manager";


export default async function AdminAccountPage() {
  const admin =
    await requireAdmin();


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          My Account
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your administrator profile, password and active
          sessions.
        </p>
      </div>


      <div className="mt-7 max-w-3xl">
        <AdminAccountManager
          fullName={
            admin.fullName
          }
          email={
            admin.email
          }
          role={
            admin.role
          }
        />
      </div>
    </>
  );
}