"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  Check,
  CheckCircle2,
  Clipboard,
  KeyRound,
  Loader2,
  Plus,
  Power,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  changeAdminRole,
  createAdminAccount,
  setAdminActive,
} from "@/app/admin/(dashboard)/admins/actions";

import type {
  AdminRole,
} from "@/lib/validation/admin-account";


export type AdminDirectoryItem = {
  id: string;

  email:
    | string
    | null;

  fullName:
    string;

  role:
    AdminRole;

  active:
    boolean;

  createdAt:
    string;

  lastSignInAt:
    | string
    | null;
};


export function AdminsManager({
  admins,
  currentAdminId,
}: {
  admins:
    AdminDirectoryItem[];

  currentAdminId:
    string;
}) {
  const [
    search,
    setSearch,
  ] =
    useState("");


  const filteredAdmins =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        if (
          !query
        ) {
          return admins;
        }


        return admins.filter(
          (
            admin,
          ) => {
            const searchable =
              [
                admin.fullName,
                admin.email,
                admin.role,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  " ",
                )
                .toLowerCase();


            return searchable.includes(
              query,
            );
          },
        );
      },
      [
        admins,
        search,
      ],
    );


  return (
    <div className="space-y-6">
      <CreateAdminCard />


      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search administrators..."
              className="pl-9"
            />
          </div>


          <p className="text-xs text-slate-400">
            {
              filteredAdmins.length
            }{" "}
            administrator
            {filteredAdmins.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>
      </div>


      <div className="grid gap-4">
        {filteredAdmins.map(
          (
            admin,
          ) => (
            <AdminCard
              key={
                admin.id
              }
              admin={
                admin
              }
              isCurrentAdmin={
                admin.id ===
                currentAdminId
              }
            />
          ),
        )}
      </div>
    </div>
  );
}


// =========================================================
// CREATE ADMIN
// =========================================================

function CreateAdminCard() {
  const [
    open,
    setOpen,
  ] =
    useState(false);


  const [
    fullName,
    setFullName,
  ] =
    useState("");


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    role,
    setRole,
  ] =
    useState<AdminRole>(
      "OPERATIONS_ADMIN",
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    temporaryPassword,
    setTemporaryPassword,
  ] =
    useState("");


  const [
    copied,
    setCopied,
  ] =
    useState(false);


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function handleCreate() {
    setError("");
    setTemporaryPassword("");
    setCopied(false);


    startTransition(
      async () => {
        const result =
          await createAdminAccount({
            fullName,
            email,
            role,
          });


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setTemporaryPassword(
          result.temporaryPassword ??
            "",
        );

        setFullName("");
        setEmail("");

        setRole(
          "OPERATIONS_ADMIN",
        );

        setOpen(false);
      },
    );
  }


  async function copyPassword() {
    if (
      !temporaryPassword
    ) {
      return;
    }


    await navigator.clipboard.writeText(
      temporaryPassword,
    );


    setCopied(
      true,
    );


    window.setTimeout(
      () =>
        setCopied(
          false,
        ),
      1800,
    );
  }


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-950">
            Administrator Accounts
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Create staff accounts and assign appropriate privileges.
          </p>
        </div>


        <Button
          type="button"
          onClick={() =>
            setOpen(
              (
                current,
              ) =>
                !current,
            )
          }
          className="rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          {open ? (
            <>
              <X className="mr-2 h-4 w-4" />

              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />

              Add Administrator
            </>
          )}
        </Button>
      </div>


      {temporaryPassword && (
        <div className="mx-5 mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:mx-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <KeyRound className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-950">
                Administrator created
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Copy this temporary password now. It is shown only
                after account creation.
              </p>


              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-mono text-sm font-semibold text-slate-900">
                  {
                    temporaryPassword
                  }
                </div>


                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    copyPassword
                  }
                  className="rounded-xl bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />

                      Copied
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 h-4 w-4" />

                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {open && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Full Name
              </Label>

              <Input
                value={
                  fullName
                }
                onChange={(
                  event,
                ) =>
                  setFullName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Ama Mensah"
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2">
              <Label>
                Email Address
              </Label>

              <Input
                type="email"
                value={
                  email
                }
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="admin@example.com"
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2 md:col-span-2">
              <Label>
                Role
              </Label>

              <select
                value={
                  role
                }
                onChange={(
                  event,
                ) =>
                  setRole(
                    event.target.value as
                      AdminRole,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="OPERATIONS_ADMIN">
                  Operations Admin
                </option>

                <option value="SUPER_ADMIN">
                  Super Admin
                </option>
              </select>


              <p className="text-xs leading-5 text-slate-400">
                Operations Admins manage requests and payments.
                Super Admins also manage system configuration and
                administrator accounts.
              </p>
            </div>
          </div>


          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {
                error
              }
            </div>
          )}


          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={
                pending ||
                !fullName.trim() ||
                !email.trim()
              }
              onClick={
                handleCreate
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />

                  Create Administrator
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


// =========================================================
// ADMIN CARD
// =========================================================

function AdminCard({
  admin,
  isCurrentAdmin,
}: {
  admin:
    AdminDirectoryItem;

  isCurrentAdmin:
    boolean;
}) {
  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState<AdminRole>(
      admin.role,
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function handleRoleChange(
    nextRole:
      AdminRole,
  ) {
    setError("");
    setSelectedRole(
      nextRole,
    );


    startTransition(
      async () => {
        const result =
          await changeAdminRole(
            admin.id,
            nextRole,
          );


        if (
          !result.success
        ) {
          setSelectedRole(
            admin.role,
          );

          setError(
            result.error,
          );
        }
      },
    );
  }


  function handleStatusToggle() {
    setError("");


    startTransition(
      async () => {
        const result =
          await setAdminActive(
            admin.id,
            !admin.active,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );
        }
      },
    );
  }


  return (
    <div
      className={`rounded-[24px] border bg-white p-5 shadow-sm sm:p-6 ${
        admin.active
          ? "border-slate-200"
          : "border-slate-200 opacity-70"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              admin.role ===
              "SUPER_ADMIN"
                ? "bg-violet-50 text-violet-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {admin.role ===
            "SUPER_ADMIN" ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <UserCog className="h-5 w-5" />
            )}
          </div>


          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">
                {
                  admin.fullName
                }
              </h3>


              {isCurrentAdmin && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-blue-700">
                  You
                </span>
              )}


              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                  admin.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {admin.active
                  ? "Active"
                  : "Disabled"}
              </span>
            </div>


            <p className="mt-1 text-sm text-slate-500">
              {
                admin.email ??
                "No email"
              }
            </p>


            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span>
                Created{" "}
                {
                  formatDate(
                    admin.createdAt,
                  )
                }
              </span>

              <span>
                Last sign-in{" "}
                {admin.lastSignInAt
                  ? formatDate(
                      admin.lastSignInAt,
                    )
                  : "Never"}
              </span>
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <select
              value={
                selectedRole
              }
              disabled={
                pending ||
                isCurrentAdmin ||
                !admin.active
              }
              onChange={(
                event,
              ) =>
                handleRoleChange(
                  event.target
                    .value as
                    AdminRole,
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="OPERATIONS_ADMIN">
                Operations Admin
              </option>

              <option value="SUPER_ADMIN">
                Super Admin
              </option>
            </select>
          </div>


          <Button
            type="button"
            variant="outline"
            disabled={
              pending ||
              isCurrentAdmin
            }
            onClick={
              handleStatusToggle
            }
            className={`rounded-xl ${
              admin.active
                ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}

            {admin.active
              ? "Disable"
              : "Enable"}
          </Button>
        </div>
      </div>


      {isCurrentAdmin && (
        <div className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />

          Your own role and status cannot be changed from this page.
        </div>
      )}


      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {
            error
          }
        </div>
      )}
    </div>
  );
}


// =========================================================
// DATE
// =========================================================

function formatDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}