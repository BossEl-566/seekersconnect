"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
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
  completeTemporaryPasswordChange,
} from "@/app/admin/change-password/actions";


export function ChangePasswordForm({
  email,
}: {
  email:
    string;
}) {
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
    showPasswords,
    setShowPasswords,
  ] =
    useState(false);


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


  function handleSubmit() {
    setError("");


    startTransition(
      async () => {
        const result =
          await completeTemporaryPasswordChange({
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
        }
      },
    );
  }


  return (
    <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <KeyRound className="h-5 w-5" />
      </div>


      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
        Account Security
      </p>


      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        Choose your own password
      </h1>


      <p className="mt-3 text-sm leading-6 text-slate-500">
        Your account was created or reset with a temporary password.
        Replace it before accessing the administration dashboard.
      </p>


      <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        Signed in as{" "}
        <span className="font-semibold text-slate-800">
          {email}
        </span>
      </div>


      <div className="mt-7 space-y-5">
        <PasswordInput
          label="Current / Temporary Password"
          value={
            currentPassword
          }
          show={
            showPasswords
          }
          onChange={
            setCurrentPassword
          }
        />


        <PasswordInput
          label="New Password"
          value={
            newPassword
          }
          show={
            showPasswords
          }
          onChange={
            setNewPassword
          }
        />


        <PasswordInput
          label="Confirm New Password"
          value={
            confirmPassword
          }
          show={
            showPasswords
          }
          onChange={
            setConfirmPassword
          }
        />


        <button
          type="button"
          onClick={() =>
            setShowPasswords(
              (
                value,
              ) =>
                !value,
            )
          }
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          {showPasswords ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}

          {showPasswords
            ? "Hide passwords"
            : "Show passwords"}
        </button>
      </div>


      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

          <p className="text-xs leading-5 text-blue-800">
            Use at least 10 characters with uppercase and lowercase
            letters, a number and a symbol.
          </p>
        </div>
      </div>


      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <Button
        type="button"
        disabled={
          pending ||
          !currentPassword ||
          !newPassword ||
          !confirmPassword
        }
        onClick={
          handleSubmit
        }
        className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Updating password...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" />

            Set New Password
          </>
        )}
      </Button>
    </div>
  );
}


function PasswordInput({
  label,
  value,
  show,
  onChange,
}: {
  label:
    string;

  value:
    string;

  show:
    boolean;

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
        type={
          show
            ? "text"
            : "password"
        }
        autoComplete="new-password"
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