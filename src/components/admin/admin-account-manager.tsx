"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
  UserRound,
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
  changeOwnPassword,
  signOutOtherSessions,
  updateOwnProfile,
} from "@/app/admin/(dashboard)/account/actions";


export function AdminAccountManager({
  fullName: initialFullName,
  email,
  role,
}: {
  fullName:
    string;

  email:
    string;

  role:
    string;
}) {
  const [
    fullName,
    setFullName,
  ] =
    useState(
      initialFullName,
    );


  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");


  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");


  const [
    message,
    setMessage,
  ] =
    useState("");


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


  function saveProfile() {
    setError("");
    setMessage("");


    startTransition(
      async () => {
        const result =
          await updateOwnProfile(
            fullName,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setMessage(
          "Profile updated successfully.",
        );
      },
    );
  }


  function savePassword() {
    setError("");
    setMessage("");


    startTransition(
      async () => {
        const result =
          await changeOwnPassword({
            currentPassword,

            newPassword,

            confirmPassword,
          });


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setMessage(
          "Password changed successfully.",
        );
      },
    );
  }


  function logoutOthers() {
    setError("");
    setMessage("");


    startTransition(
      async () => {
        const result =
          await signOutOtherSessions();


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setMessage(
          "All other administrator sessions have been signed out.",
        );
      },
    );
  }


  return (
    <div className="space-y-6">
      {(message ||
        error) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ||
            message}
        </div>
      )}


      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the name displayed throughout the admin system.
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
            />
          </div>


          <div className="space-y-2">
            <Label>
              Email
            </Label>

            <Input
              value={
                email
              }
              disabled
              className="bg-slate-50"
            />
          </div>


          <div className="space-y-2">
            <Label>
              Role
            </Label>

            <Input
              value={
                role ===
                "SUPER_ADMIN"
                  ? "Super Admin"
                  : "Operations Admin"
              }
              disabled
              className="bg-slate-50"
            />
          </div>
        </div>


        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            disabled={
              pending ||
              !fullName.trim()
            }
            onClick={
              saveProfile
            }
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}

            Save Profile
          </Button>
        </div>
      </section>


      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use a unique password that is not shared with another
              service.
            </p>
          </div>
        </div>


        <div className="mt-6 grid gap-5">
          <PasswordField
            label="Current Password"
            value={
              currentPassword
            }
            onChange={
              setCurrentPassword
            }
          />

          <PasswordField
            label="New Password"
            value={
              newPassword
            }
            onChange={
              setNewPassword
            }
          />

          <PasswordField
            label="Confirm New Password"
            value={
              confirmPassword
            }
            onChange={
              setConfirmPassword
            }
          />
        </div>


        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            disabled={
              pending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            onClick={
              savePassword
            }
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />

            Change Password
          </Button>
        </div>
      </section>


      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <LogOut className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-slate-950">
              Other Sessions
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Sign out this administrator account from every other
              browser or device while keeping this session open.
            </p>
          </div>
        </div>


        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={
              pending
            }
            onClick={
              logoutOthers
            }
            className="rounded-xl"
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}

            Sign Out Other Sessions
          </Button>
        </div>
      </section>
    </div>
  );
}


function PasswordField({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
      </Label>

      <Input
        type="password"
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
      />
    </div>
  );
}