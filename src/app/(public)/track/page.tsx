import {
  ShieldCheck,
} from "lucide-react";

import {
  TrackingLookup,
} from "@/components/public/tracking-lookup";

export default function TrackPage() {
  return (
    <section className="min-h-[80vh]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <p className="mt-5 text-sm font-medium text-blue-600">
            Secure Request Tracking
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Track your academic document request.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Enter the tracking number and
            six-digit PIN issued after your
            payment was confirmed.
          </p>
        </div>

        <TrackingLookup />
      </div>
    </section>
  );
}