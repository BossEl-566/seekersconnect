"use client";

import {
  useActionState,
} from "react";

import {
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  loginAdmin,
  type LoginState,
} from "@/app/admin/login/actions";

const initialState: LoginState = {
  error: "",
};

export function AdminLoginForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    loginAdmin,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address
        </Label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@seekersconnect247.com"
            className="h-11 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>

        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 pl-10"
            required
          />
        </div>
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}