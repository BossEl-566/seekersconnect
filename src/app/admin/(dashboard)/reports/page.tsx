import Link from "next/link";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createClient,
} from "@/lib/supabase/server";


// =========================================================
// TYPES
// =========================================================

type ReportsPageProps = {
  searchParams:
    Promise<{
      range?:
        string
        | string[];
    }>;
};


type RangeKey =
  | "30"
  | "90"
  | "365"
  | "all";


type StatCardProps = {
  label:
    string;

  value:
    string
    | number;

  description:
    string;

  icon:
    React.ElementType;

  tone?:
    "blue"
    | "green"
    | "amber"
    | "red"
    | "slate";
};


// =========================================================
// CONSTANTS
// =========================================================

const RANGE_OPTIONS: {
  value:
    RangeKey;

  label:
    string;
}[] = [
  {
    value:
      "30",

    label:
      "30 days",
  },

  {
    value:
      "90",

    label:
      "90 days",
  },

  {
    value:
      "365",

    label:
      "12 months",
  },

  {
    value:
      "all",

    label:
      "All time",
  },
];


const PROCESSING_STATUSES = [
  "PAYMENT_CONFIRMED",
  "PROCESSING_REQUEST",
  "SUBMITTED_TO_UNIVERSITY",
  "AWAITING_UNIVERSITY",
  "DOCUMENT_READY",
  "DOCUMENT_SCANNED",
];


const DELIVERY_STATUSES = [
  "PREPARING_DELIVERY",
  "HANDED_TO_EMS",
  "IN_TRANSIT",
];


const ATTENTION_STATUSES = [
  "PAYMENT_REJECTED",
  "MORE_INFORMATION_REQUIRED",
  "ON_HOLD",
];


// =========================================================
// PAGE
// =========================================================

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  const admin =
    await requireAdmin();


  // Reports are intended for Super Administrators.
  if (
    admin.role !==
    "SUPER_ADMIN"
  ) {
    redirect(
      "/admin",
    );
  }


  const params =
    await searchParams;


  const requestedRange =
    Array.isArray(
      params.range,
    )
      ? params.range[0]
      : params.range;


  const range:
    RangeKey =
      isRangeKey(
        requestedRange,
      )
        ? requestedRange
        : "30";


  const startDate =
    getRangeStartDate(
      range,
    );


  const startIso =
    startDate
      ? startDate.toISOString()
      : null;


  const supabase =
    await createClient();


  // =======================================================
  // COUNT HELPERS
  // =======================================================

  async function countRequests(
    statuses?:
      string[],
  ) {
    let query =
      supabase
        .from(
          "requests",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        );


    if (
      statuses &&
      statuses.length ===
        1
    ) {
      query =
        query.eq(
          "status",
          statuses[0],
        );
    }


    if (
      statuses &&
      statuses.length >
        1
    ) {
      query =
        query.in(
          "status",
          statuses,
        );
    }


    if (
      startIso
    ) {
      query =
        query.gte(
          "created_at",
          startIso,
        );
    }


    const {
      count,
      error,
    } =
      await query;


    if (
      error
    ) {
      console.error(
        "Reports request count failed:",
        error,
      );

      return 0;
    }


    return (
      count ??
      0
    );
  }


  async function countPayments(
    statuses?:
      string[],
  ) {
    let query =
      supabase
        .from(
          "payments",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        );


    if (
      statuses &&
      statuses.length ===
        1
    ) {
      query =
        query.eq(
          "status",
          statuses[0],
        );
    }


    if (
      statuses &&
      statuses.length >
        1
    ) {
      query =
        query.in(
          "status",
          statuses,
        );
    }


    if (
      startIso
    ) {
      query =
        query.gte(
          "created_at",
          startIso,
        );
    }


    const {
      count,
      error,
    } =
      await query;


    if (
      error
    ) {
      console.error(
        "Reports payment count failed:",
        error,
      );

      return 0;
    }


    return (
      count ??
      0
    );
  }


  // =======================================================
  // REPORT QUERIES
  // =======================================================

  const [
    totalRequests,
    awaitingPayment,
    processingRequests,
    deliveryRequests,
    completedRequests,
    cancelledRequests,
    attentionRequests,

    totalPayments,
    confirmedPayments,
    pendingPayments,
    rejectedPayments,
  ] =
    await Promise.all([
      countRequests(),

      countRequests([
        "AWAITING_PAYMENT_VERIFICATION",
      ]),

      countRequests(
        PROCESSING_STATUSES,
      ),

      countRequests(
        DELIVERY_STATUSES,
      ),

      countRequests([
        "COMPLETED",
      ]),

      countRequests([
        "CANCELLED",
      ]),

      countRequests(
        ATTENTION_STATUSES,
      ),


      countPayments(),

      countPayments([
        "CONFIRMED",
      ]),

      countPayments([
        "PENDING",
      ]),

      countPayments([
        "REJECTED",
      ]),
    ]);


  // =======================================================
  // DERIVED METRICS
  // =======================================================

  const completionRate =
    percentage(
      completedRequests,
      totalRequests,
    );


  const paymentConfirmationRate =
    percentage(
      confirmedPayments,
      totalPayments,
    );


  const outstandingRequests =
    Math.max(
      totalRequests -
        completedRequests -
        cancelledRequests,
      0,
    );


  const selectedRange =
    RANGE_OPTIONS.find(
      (
        option,
      ) =>
        option.value ===
        range,
    ) ??
    RANGE_OPTIONS[0];


  return (
    <>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Reports & Analytics
          </p>


          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Business performance overview
          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review request activity, operational workload and payment
            performance across Seekers Connect 247.
          </p>
        </div>


        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
          <Activity className="h-4 w-4 text-emerald-500" />

          Live operational data
        </div>
      </div>


      {/* ===================================================
          DATE RANGE FILTER
      =================================================== */}

      <section className="mt-7 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Reporting period
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Showing data for{" "}
              {
                selectedRange.label
              }.
            </p>
          </div>


          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map(
              (
                option,
              ) => {
                const active =
                  option.value ===
                  range;


                return (
                  <Link
                    key={
                      option.value
                    }
                    href={`/admin/reports?range=${option.value}`}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {
                      option.label
                    }
                  </Link>
                );
              },
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          PRIMARY KPIs
      =================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={
            totalRequests
          }
          description="Requests submitted in this period"
          icon={
            FileText
          }
        />


        <StatCard
          label="Completed"
          value={
            completedRequests
          }
          description={`${completionRate}% completion rate`}
          icon={
            CheckCircle2
          }
          tone="green"
        />


        <StatCard
          label="Outstanding"
          value={
            outstandingRequests
          }
          description="Requests not yet completed"
          icon={
            Clock3
          }
          tone="amber"
        />


        <StatCard
          label="Needs Attention"
          value={
            attentionRequests
          }
          description="Rejected, on hold or awaiting information"
          icon={
            TriangleAlert
          }
          tone="red"
        />
      </div>


      {/* ===================================================
          OPERATIONS + PAYMENTS
      =================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        {/* REQUEST WORKFLOW */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Request workflow
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Current request workload by operational stage
              </p>
            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>


          <div className="mt-6 space-y-5">
            <ProgressMetric
              label="Awaiting payment verification"
              value={
                awaitingPayment
              }
              total={
                totalRequests
              }
              description="Payment proof awaiting review"
              tone="amber"
            />


            <ProgressMetric
              label="In processing"
              value={
                processingRequests
              }
              total={
                totalRequests
              }
              description="Active university workflow"
              tone="blue"
            />


            <ProgressMetric
              label="In delivery"
              value={
                deliveryRequests
              }
              total={
                totalRequests
              }
              description="Preparing or moving through delivery"
              tone="slate"
            />


            <ProgressMetric
              label="Completed"
              value={
                completedRequests
              }
              total={
                totalRequests
              }
              description="Successfully completed requests"
              tone="green"
            />


            <ProgressMetric
              label="Cancelled"
              value={
                cancelledRequests
              }
              total={
                totalRequests
              }
              description="Cancelled requests"
              tone="red"
            />
          </div>
        </section>


        {/* PAYMENT PERFORMANCE */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Payment performance
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Verification outcomes for submitted payments
              </p>
            </div>


            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>


          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Confirmation rate
                </p>

                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                  {
                    paymentConfirmationRate
                  }
                  %
                </p>
              </div>


              <p className="text-right text-xs leading-5 text-slate-400">
                {
                  confirmedPayments
                }{" "}
                of{" "}
                {
                  totalPayments
                }{" "}
                payment
                {totalPayments ===
                1
                  ? ""
                  : "s"}{" "}
                confirmed
              </p>
            </div>
          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SmallMetric
              label="Confirmed"
              value={
                confirmedPayments
              }
              icon={
                CheckCircle2
              }
              tone="green"
            />


            <SmallMetric
              label="Pending"
              value={
                pendingPayments
              }
              icon={
                ReceiptText
              }
              tone="amber"
            />


            <SmallMetric
              label="Rejected"
              value={
                rejectedPayments
              }
              icon={
                XCircle
              }
              tone="red"
            />
          </div>
        </section>
      </div>


      {/* ===================================================
          SECONDARY KPIs
      =================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting Payment"
          value={
            awaitingPayment
          }
          description="Require payment verification"
          icon={
            ReceiptText
          }
          tone="amber"
        />


        <StatCard
          label="Active Processing"
          value={
            processingRequests
          }
          description="University processing workflow"
          icon={
            RotateCcw
          }
        />


        <StatCard
          label="In Delivery"
          value={
            deliveryRequests
          }
          description="Physical delivery workflow"
          icon={
            PackageCheck
          }
          tone="slate"
        />


        <StatCard
          label="Cancelled"
          value={
            cancelledRequests
          }
          description="Requests cancelled in this period"
          icon={
            XCircle
          }
          tone="red"
        />
      </div>


      {/* ===================================================
          NEXT ANALYTICS SECTION
      =================================================== */}

      <section className="mt-6 overflow-hidden rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-950">
              Reporting foundation is active
            </p>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              These metrics are calculated directly from live request
              and payment records. The next analytics layer will add
              request trends, university distribution, service
              distribution and status charts.
            </p>
          </div>


          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  description,
  icon:
    Icon,
  tone =
    "blue",
}: StatCardProps) {
  const styles =
    getToneStyles(
      tone,
    );


  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {
              label
            }
          </p>


          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {
              value
            }
          </p>


          <p className="mt-2 text-xs leading-5 text-slate-400">
            {
              description
            }
          </p>
        </div>


        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


// =========================================================
// SMALL METRIC
// =========================================================

function SmallMetric({
  label,
  value,
  icon:
    Icon,
  tone,
}: {
  label:
    string;

  value:
    number;

  icon:
    React.ElementType;

  tone:
    "green"
    | "amber"
    | "red";
}) {
  const styles =
    getToneStyles(
      tone,
    );


  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <Icon className="h-4 w-4" />
      </div>


      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
        {
          value
        }
      </p>


      <p className="mt-1 text-xs text-slate-500">
        {
          label
        }
      </p>
    </div>
  );
}


// =========================================================
// PROGRESS METRIC
// =========================================================

function ProgressMetric({
  label,
  value,
  total,
  description,
  tone,
}: {
  label:
    string;

  value:
    number;

  total:
    number;

  description:
    string;

  tone:
    "blue"
    | "green"
    | "amber"
    | "red"
    | "slate";
}) {
  const percent =
    percentage(
      value,
      total,
    );


  const barStyle =
    getBarStyle(
      tone,
    );


  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {
              label
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {
              description
            }
          </p>
        </div>


        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            {
              value
            }
          </p>

          <p className="text-[10px] text-slate-400">
            {
              percent
            }
            %
          </p>
        </div>
      </div>


      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barStyle}`}
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}


// =========================================================
// RANGE HELPERS
// =========================================================

function isRangeKey(
  value:
    string
    | undefined,
): value is RangeKey {
  return (
    value ===
      "30" ||
    value ===
      "90" ||
    value ===
      "365" ||
    value ===
      "all"
  );
}


function getRangeStartDate(
  range:
    RangeKey,
) {
  if (
    range ===
    "all"
  ) {
    return null;
  }


  const days =
    Number(
      range,
    );


  const date =
    new Date();


  date.setUTCDate(
    date.getUTCDate() -
      days,
  );


  return date;
}


// =========================================================
// METRIC HELPERS
// =========================================================

function percentage(
  value:
    number,

  total:
    number,
) {
  if (
    total <=
    0
  ) {
    return 0;
  }


  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (
          value /
          total
        ) *
          100,
      ),
    ),
  );
}


// =========================================================
// COLOUR HELPERS
// =========================================================

function getToneStyles(
  tone:
    "blue"
    | "green"
    | "amber"
    | "red"
    | "slate",
) {
  switch (
    tone
  ) {
    case "green":
      return {
        icon:
          "bg-emerald-50 text-emerald-600",
      };


    case "amber":
      return {
        icon:
          "bg-amber-50 text-amber-600",
      };


    case "red":
      return {
        icon:
          "bg-red-50 text-red-600",
      };


    case "slate":
      return {
        icon:
          "bg-slate-100 text-slate-600",
      };


    default:
      return {
        icon:
          "bg-blue-50 text-blue-600",
      };
  }
}


function getBarStyle(
  tone:
    "blue"
    | "green"
    | "amber"
    | "red"
    | "slate",
) {
  switch (
    tone
  ) {
    case "green":
      return "bg-emerald-500";


    case "amber":
      return "bg-amber-500";


    case "red":
      return "bg-red-500";


    case "slate":
      return "bg-slate-500";


    default:
      return "bg-blue-600";
  }
}