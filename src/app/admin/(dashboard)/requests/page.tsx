import Link from "next/link";

import {
  ArrowRight,
  FileText,
  Search,
} from "lucide-react";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  Input,
} from "@/components/ui/input";


type PageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
};


type AdminRequest = {
  id: string;
  request_number: string;

  first_name: string;
  surname: string;

  phone: string;

  status: string;

  created_at: string;

  universities: {
    code: string;
  } | null;

  services: {
    short_name: string;
  } | null;
};


const filters = [
  {
    label: "All",
    value: "",
  },

  {
    label: "Payment Confirmed",
    value:
      "PAYMENT_CONFIRMED",
  },

  {
    label: "Processing",
    value:
      "PROCESSING_REQUEST",
  },

  {
    label: "Submitted",
    value:
      "SUBMITTED_TO_UNIVERSITY",
  },

  {
    label: "Awaiting University",
    value:
      "AWAITING_UNIVERSITY",
  },

  {
    label: "Document Ready",
    value:
      "DOCUMENT_READY",
  },
];


function readableStatus(
  status: string,
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}


function statusClasses(
  status: string,
) {
  switch (status) {
    case "AWAITING_PAYMENT_VERIFICATION":
      return "bg-amber-50 text-amber-700";

    case "PAYMENT_CONFIRMED":
      return "bg-emerald-50 text-emerald-700";

    case "PROCESSING_REQUEST":
      return "bg-blue-50 text-blue-700";

    case "SUBMITTED_TO_UNIVERSITY":
      return "bg-indigo-50 text-indigo-700";

    case "AWAITING_UNIVERSITY":
      return "bg-violet-50 text-violet-700";

    case "DOCUMENT_READY":
      return "bg-cyan-50 text-cyan-700";

    case "PAYMENT_REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


export default async function RequestsPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params =
    await searchParams;

  const status =
    params.status?.trim() ??
    "";

  const q =
    params.q?.trim() ??
    "";

  const supabase =
    await createClient();


  let query =
    supabase
      .from("requests")
      .select(`
        id,
        request_number,

        first_name,
        surname,

        phone,

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
      .limit(100);


  if (status) {
    query =
      query.eq(
        "status",
        status,
      );
  }


  if (q) {
    query =
      query.ilike(
        "request_number",
        `%${q}%`,
      );
  }


  const {
    data,
    error,
  } =
    await query;


  if (error) {
    console.error(
      "Requests query failed:",
      error,
    );
  }


  const requests =
    (data ?? []) as unknown as
      AdminRequest[];


  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Requests
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage academic document requests from payment
            confirmation through university processing and
            delivery.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
          {requests.length} request
          {requests.length === 1
            ? ""
            : "s"}{" "}
          shown
        </div>
      </div>


      {/* FILTERS */}
      <div className="mt-7 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <form
          method="GET"
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-wrap gap-2">
            {filters.map(
              (filter) => {
                const active =
                  status ===
                  filter.value;

                const href =
                  filter.value
                    ? `/admin/requests?status=${encodeURIComponent(
                        filter.value,
                      )}`
                    : "/admin/requests";

                return (
                  <Link
                    key={
                      filter.label
                    }
                    href={href}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {
                      filter.label
                    }
                  </Link>
                );
              },
            )}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              name="q"
              defaultValue={q}
              placeholder="Search request number..."
              className="pl-9"
            />
          </div>
        </form>
      </div>


      {/* REQUEST TABLE */}
      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {requests.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No requests found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try a different status filter or request number.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">
                    Request
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Applicant
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

                  <th className="px-4 py-3 font-medium">
                    Submitted
                  </th>

                  <th className="px-6 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {requests.map(
                  (request) => (
                    <tr
                      key={
                        request.id
                      }
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-semibold text-slate-800">
                          {
                            request.request_number
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            request.phone
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {
                          request.first_name
                        }{" "}
                        {
                          request.surname
                        }
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {request
                          .universities
                          ?.code ??
                          "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {request
                          .services
                          ?.short_name ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses(
                            request.status,
                          )}`}
                        >
                          {readableStatus(
                            request.status,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Date(
                          request.created_at,
                        ).toLocaleDateString(
                          "en-GH",
                          {
                            day:
                              "2-digit",

                            month:
                              "short",

                            year:
                              "numeric",
                          },
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Open

                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}