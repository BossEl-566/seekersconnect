import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  ReceiptText,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireAdmin,
} from "@/lib/auth/admin";

type PendingPayment = {
  id: string;

  request_id: string;

  payment_method:
    | "momo"
    | "bank";

  status: string;

  created_at: string;

  requests: {
    request_number: string;

    first_name: string;
    surname: string;

    phone: string;
    email: string;

    universities: {
      code: string;
    } | null;

    services: {
      short_name: string;
    } | null;
  } | null;
};

export default async function PaymentsPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("payments")
    .select(`
      id,
      request_id,
      payment_method,
      status,
      created_at,

      requests (
        request_number,
        first_name,
        surname,
        phone,
        email,

        universities (
          code
        ),

        services (
          short_name
        )
      )
    `)
    .eq("status", "PENDING")
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    console.error(
      "Pending payments query failed:",
      error,
    );
  }

  const payments =
    (data ?? []) as unknown as
      PendingPayment[];

  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Payments
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Payment Verification
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review submitted payment proofs before
          requests enter the processing workflow.
        </p>
      </div>

      <div className="mt-7 rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold">
              Awaiting Verification
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Oldest submissions appear first.
            </p>
          </div>

          <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-amber-50 px-3 text-sm font-semibold text-amber-700">
            {payments.length}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ReceiptText className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No payments are waiting
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              New customer payment proofs will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map(
              (payment) => {
                const request =
                  payment.requests;

                if (!request) {
                  return null;
                }

                return (
                  <div
                    key={payment.id}
                    className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_160px_180px_130px] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {
                            request.request_number
                          }
                        </p>

                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Pending
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {
                          request.first_name
                        }{" "}
                        {
                          request.surname
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          request
                            .universities
                            ?.code
                        }{" "}
                        ·{" "}
                        {
                          request
                            .services
                            ?.short_name
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Payment Method
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                        {payment.payment_method ===
                        "momo"
                          ? "Mobile Money"
                          : "Bank Transfer"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Submitted
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock3 className="h-3.5 w-3.5" />

                        {new Date(
                          payment.created_at,
                        ).toLocaleString(
                          "en-GH",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          },
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/admin/requests/${payment.request_id}`}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </>
  );
}