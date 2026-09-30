import {
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  AdminsManager,
  type AdminDirectoryItem,
} from "@/components/admin/admins-manager";

import type {
  AdminRole,
} from "@/lib/validation/admin-account";


type AdminProfileRow = {
  id:
    string;

  full_name:
    string;

  role:
    AdminRole;

  active:
    boolean;
};


export default async function AdminsPage() {
  const currentAdmin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const [
    profilesResult,
    usersResult,
  ] =
    await Promise.all([
      supabase
        .from(
  "admin_profiles",
)
.select(`
  id,
  full_name,
  role,
  active
`),

      supabase.auth.admin.listUsers({
        page:
          1,

        perPage:
          1000,
      }),
    ]);


  if (
    profilesResult.error
  ) {
    console.error(
      "Admin profiles query failed:",
      profilesResult.error,
    );
  }


  if (
    usersResult.error
  ) {
    console.error(
      "Auth users query failed:",
      usersResult.error,
    );
  }


  const profiles =
    (
      profilesResult.data ??
      []
    ) as AdminProfileRow[];


  const authUsers =
    usersResult.data
      ?.users ??
    [];


  const authUsersById =
    new Map(
      authUsers.map(
        (
          user,
        ) => [
          user.id,
          user,
        ],
      ),
    );


  const admins:
    AdminDirectoryItem[] =
    profiles
      .map(
        (
          profile,
        ) => {
          const authUser =
            authUsersById.get(
              profile.id,
            );


          const fullName =
  profile.full_name ||
  authUser?.email ||
  "Administrator";


          return {
            id:
              profile.id,

            email:
              authUser
                ?.email ??
              null,

            fullName,

            role:
              profile.role,

            active:
              profile.active,

            createdAt:
              authUser
                ?.created_at ??
              "",

            lastSignInAt:
              authUser
                ?.last_sign_in_at ??
              null,
          };
        },
      )
      .sort(
        (
          a,
          b,
        ) => {
          if (
            a.active !==
            b.active
          ) {
            return a.active
              ? -1
              : 1;
          }


          if (
            a.role !==
            b.role
          ) {
            return a.role ===
              "SUPER_ADMIN"
              ? -1
              : 1;
          }


          return a.fullName.localeCompare(
            b.fullName,
          );
        },
      );


  const activeCount =
    admins.filter(
      (
        admin,
      ) =>
        admin.active,
    ).length;


  const superAdminCount =
    admins.filter(
      (
        admin,
      ) =>
        admin.active &&
        admin.role ===
          "SUPER_ADMIN",
    ).length;


  const operationsCount =
    admins.filter(
      (
        admin,
      ) =>
        admin.active &&
        admin.role ===
          "OPERATIONS_ADMIN",
    ).length;


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Super Admin
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Administrators
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage staff access to the Seekers Connect 247 operations
          dashboard.
        </p>
      </div>


      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            Users
          }
          label="Active Admins"
          value={
            activeCount
          }
        />

        <SummaryCard
          icon={
            ShieldCheck
          }
          label="Super Admins"
          value={
            superAdminCount
          }
        />

        <SummaryCard
          icon={
            UserCog
          }
          label="Operations Admins"
          value={
            operationsCount
          }
        />
      </div>


      <div className="mt-6">
        <AdminsManager
          admins={
            admins
          }
          currentAdminId={
            currentAdmin.id
          }
        />
      </div>
    </>
  );
}


function SummaryCard({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}