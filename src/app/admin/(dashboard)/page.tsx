import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";

type RecentRequest = {
  id: string;
  request_number: string;
  first_name: string;
  surname: string;
  status: string;
  created_at: string;

  universities: {
    code: string;
  } | null;

  services: {
    short_name: string;
  } | null;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const admin =
    await requireAdmin();

  const supabase =
    await createClient();

  const [
    totalRequests,
    pendingPayments,
    processingRequests,
    deliveryRequests,
    recentRequestsResult,
  ] = await Promise.all([
    supabase
      .from("requests")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("requests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "status",
        "AWAITING_PAYMENT_VERIFICATION",
      ),

    supabase
      .from("requests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "PAYMENT_CONFIRMED",
        "PROCESSING_REQUEST",
        "SUBMITTED_TO_UNIVERSITY",
        "AWAITING_UNIVERSITY",
        "DOCUMENT_READY",
        "DOCUMENT_SCANNED",
      ]),

    supabase
      .from("requests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "PREPARING_DELIVERY",
        "HANDED_TO_EMS",
        "IN_TRANSIT",
      ]),

    supabase
      .from("requests")
      .select(`
        id,
        request_number,
        first_name,
        surname,
        status,
        created_at,
        universities (
          code
        ),
        services (
          short_name
        )
      `)
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(6),
  ]);

  const recentRequests =
  (recentRequestsResult.data ?? []) as unknown as RecentRequest[];

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome, {admin.fullName.split(" ")[0]}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what is happening with your academic
            document requests.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
          Live operations data
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={totalRequests.count ?? 0}
          description="All submitted requests"
          icon={FileText}
        />

        <StatCard
          label="Awaiting Payment"
          value={pendingPayments.count ?? 0}
          description="Require verification"
          icon={ReceiptText}
        />

        <StatCard
          label="In Processing"
          value={processingRequests.count ?? 0}
          description="Active university workflow"
          icon={Clock3}
        />

        <StatCard
          label="In Delivery"
          value={deliveryRequests.count ?? 0}
          description="Physical delivery workflow"
          icon={PackageCheck}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-950">
                Recent Requests
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest customer submissions
              </p>
            </div>

            <a
              href="/admin/requests"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">
                    Request
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-4 py-3 font-medium">
                    University
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Service
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentRequests.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-slate-400"
                    >
                      No requests have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map(
                    (request) => (
                      <tr
                        key={request.id}
                        className="text-sm"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">
                            {
                              request.request_number
                            }
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {request.first_name}{" "}
                          {request.surname}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
  {request.universities?.code ?? "—"}
</td>

                        <td className="px-4 py-4 text-slate-600">
  {request.services?.short_name ?? "—"}
</td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            {request.status
                              .replaceAll(
                                "_",
                                " ",
                              )
                              .toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              Needs Attention
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
                <div>
                  <p className="text-sm font-medium text-amber-950">
                    Payment verification
                  </p>

                  <p className="mt-0.5 text-xs text-amber-700">
                    Waiting for review
                  </p>
                </div>

                <span className="text-lg font-semibold text-amber-800">
                  {pendingPayments.count ??
                    0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                <div>
                  <p className="text-sm font-medium text-blue-950">
                    Active processing
                  </p>

                  <p className="mt-0.5 text-xs text-blue-700">
                    University workflow
                  </p>
                </div>

                <span className="text-lg font-semibold text-blue-800">
                  {processingRequests.count ??
                    0}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold">
              Operations workflow
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Payment verification is the next step before
              tracking details are issued to customers.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}