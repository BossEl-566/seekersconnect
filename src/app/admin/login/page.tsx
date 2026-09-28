import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdmin } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  const admin =
    await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.85fr]">
        <section className="relative hidden overflow-hidden bg-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-blue-400/30 blur-3xl" />

          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
              <Image
                src="/seekersconnect-logo.jpg"
                alt="Seekers Connect 247"
                width={46}
                height={46}
                className="rounded-xl object-contain"
              />
            </div>

            <p className="mt-4 text-lg font-semibold">
              Seekers Connect 247
            </p>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-100">
              Operations Platform
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
              Manage every academic request from one place.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">
              Verify payments, process university requests,
              manage documents and coordinate delivery through
              one secure workflow.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck className="h-5 w-5" />

                <p className="mt-3 text-sm font-semibold">
                  Controlled Access
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-100">
                  Role-aware access for administration and
                  operations.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <Workflow className="h-5 w-5" />

                <p className="mt-3 text-sm font-semibold">
                  Request Workflow
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-100">
                  Track requests from payment confirmation to
                  delivery.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-blue-200">
            Authorized personnel only.
          </p>
        </section>

        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Image
                src="/seekersconnect-logo.jpg"
                alt="Seekers Connect 247"
                width={48}
                height={48}
                className="rounded-xl border object-contain"
              />

              <div>
                <p className="font-semibold">
                  Seekers Connect 247
                </p>

                <p className="text-xs text-slate-500">
                  Administration
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-blue-600">
              Administration
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with your authorized Seekers Connect
              administration account.
            </p>

            <AdminLoginForm />

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Access to this system is restricted to authorized
              Seekers Connect 247 personnel.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}