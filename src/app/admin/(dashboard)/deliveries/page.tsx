import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";


type DeliveryRequest = {
  id: string;

  request_number: string;

  status: string;

  first_name: string;

  surname: string;

  phone: string;

  created_at: string;

  universities:
    | {
        code: string;
      }
    | null;

  services:
    | {
        short_name: string;
      }
    | null;

  deliveries:
    | {
        physical_delivery_required: boolean;

        full_name:
          | string
          | null;

        region:
          | string
          | null;

        city_district:
          | string
          | null;

        ems_tracking_number:
          | string
          | null;

        dispatch_date:
          | string
          | null;

        delivered_date:
          | string
          | null;
      }
    | null;
};


const deliveryStatuses = [
  "PREPARING_DELIVERY",
  "HANDED_TO_EMS",
  "IN_TRANSIT",
  "DELIVERED",
];


function readableStatus(
  status: string,
) {
  return status
    .replaceAll(
      "_",
      " ",
    )
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
    case "PREPARING_DELIVERY":
      return "bg-orange-50 text-orange-700";

    case "HANDED_TO_EMS":
      return "bg-purple-50 text-purple-700";

    case "IN_TRANSIT":
      return "bg-blue-50 text-blue-700";

    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


export default async function DeliveriesPage() {
  await requireAdmin();


  const supabase =
    await createClient();


  const {
    data,
    error,
  } = await supabase
    .from("requests")
    .select(`
      id,
      request_number,
      status,

      first_name,
      surname,
      phone,

      created_at,

      universities (
        code
      ),

      services (
        short_name
      ),

      deliveries (
        physical_delivery_required,
        full_name,
        region,
        city_district,
        ems_tracking_number,
        dispatch_date,
        delivered_date
      )
    `)
    .in(
      "status",
      deliveryStatuses,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    );


  if (error) {
    console.error(
      "Delivery queue query failed:",
      error,
    );
  }


  const requests =
    (data ?? []) as unknown as
      DeliveryRequest[];


  const preparingCount =
    requests.filter(
      (request) =>
        request.status ===
        "PREPARING_DELIVERY",
    ).length;


  const inTransitCount =
    requests.filter(
      (request) =>
        request.status ===
          "HANDED_TO_EMS" ||
        request.status ===
          "IN_TRANSIT",
    ).length;


  const deliveredCount =
    requests.filter(
      (request) =>
        request.status ===
        "DELIVERED",
    ).length;


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Operations
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Deliveries
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage physical document delivery from preparation through
          final EMS delivery.
        </p>
      </div>


      {/* SUMMARY */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            Package
          }
          label="Preparing"
          value={
            preparingCount
          }
        />

        <SummaryCard
          icon={
            Truck
          }
          label="With EMS"
          value={
            inTransitCount
          }
        />

        <SummaryCard
          icon={
            CheckCircle2
          }
          label="Delivered"
          value={
            deliveredCount
          }
        />
      </div>


      {/* TABLE */}
      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="font-semibold text-slate-950">
            Delivery Queue
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Requests currently moving through physical delivery.
          </p>
        </div>


        {requests.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Truck className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No active deliveries
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Requests requiring EMS delivery will appear here after
              their documents have been processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
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
                    Destination
                  </th>

                  <th className="px-4 py-3 font-medium">
                    EMS Tracking
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-3" />
                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100">
                {requests.map(
                  (request) => {
                    const delivery =
                      request.deliveries;

                    return (
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
                              request
                                .services
                                ?.short_name ??
                              "—"
                            }
                          </p>
                        </td>


                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {
                              request.first_name
                            }{" "}
                            {
                              request.surname
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              request.phone
                            }
                          </p>
                        </td>


                        <td className="px-4 py-4 text-sm text-slate-600">
                          {
                            request
                              .universities
                              ?.code ??
                            "—"
                          }
                        </td>


                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-700">
                            {
                              delivery
                                ?.city_district ??
                              "—"
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              delivery
                                ?.region ??
                              ""
                            }
                          </p>
                        </td>


                        <td className="px-4 py-4">
                          {delivery
                            ?.ems_tracking_number ? (
                            <span className="font-mono text-xs font-medium text-slate-700">
                              {
                                delivery.ems_tracking_number
                              }
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Not assigned
                            </span>
                          )}
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
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}


function SummaryCard({
  icon: Icon,
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