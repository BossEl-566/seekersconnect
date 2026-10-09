import type {
  ElementType,
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  Package,
  Phone,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  PaymentReviewActions,
} from "@/components/admin/payment-review-actions";

import {
  RequestProcessingActions,
} from "@/components/admin/request-processing-actions";

import type {
  RequestStatus,
} from "@/constants/request-status";

import {
  RequestDocumentUpload,
} from "@/components/admin/request-document-upload";

import {
  RequestDeliveryActions,
} from "@/components/admin/request-delivery-actions";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


type RequestDetail = {
  id: string;

  request_number: string;

  status: string;

  first_name: string;

  other_names:
    | string
    | null;

  surname: string;

  gender:
    | string
    | null;

  phone: string;

  email: string;

  notes:
    | string
    | null;

  tracking_number:
    | string
    | null;

  created_at: string;

  universities:
    | {
        code: string;
        name: string;
      }
    | null;

    services:
    | {
        name:
          string;

        short_name:
          string;

        service_scope:
          "general"
          | "academic";

        service_categories:
          | {
              name:
                string;

              slug:
                string;
            }
          | {
              name:
                string;

              slug:
                string;
            }[]
          | null;
      }
    | null;
};


type RequestHistoryItem = {
  id: string;

  status: string;

  public_message:
    | string
    | null;

  internal_note:
    | string
    | null;

  created_at: string;

  admin_profiles:
    | {
        full_name: string;
      }
    | {
        full_name: string;
      }[]
    | null;
};


export default async function RequestDetailPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    id,
  } = await params;

  const supabase =
    createAdminClient();


  // =======================================================
  // LOAD REQUEST DATA
  // =======================================================

  const [
    requestResult,
    responsesResult,
    deliveryResult,
    paymentResult,
    historyResult,
  ] = await Promise.all([
    // -----------------------------------------------------
    // Main request
    // -----------------------------------------------------

    supabase
      .from("requests")
      .select(`
        id,
        request_number,
        status,

        first_name,
        other_names,
        surname,

        gender,
        phone,
        email,

        notes,
        tracking_number,

        created_at,

        universities (
          code,
          name
        ),

               services (
          name,
          short_name,
          service_scope,

          service_categories (
            name,
            slug
          )
        )
      `)
      .eq(
        "id",
        id,
      )
      .single(),


    // -----------------------------------------------------
    // Dynamic academic form responses
    // -----------------------------------------------------

    supabase
      .from(
        "request_form_responses",
      )
      .select(`
        id,
        field_key,
        field_label,
        value
      `)
      .eq(
        "request_id",
        id,
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      ),


    // -----------------------------------------------------
    // Delivery information
    // -----------------------------------------------------

    supabase
      .from("deliveries")
      .select("*")
      .eq(
        "request_id",
        id,
      )
      .maybeSingle(),


    // -----------------------------------------------------
    // Latest payment
    // -----------------------------------------------------

    supabase
      .from("payments")
      .select("*")
      .eq(
        "request_id",
        id,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle(),


    // -----------------------------------------------------
    // Complete operational/status history
    // -----------------------------------------------------

    supabase
      .from(
        "request_status_history",
      )
      .select(`
        id,
        status,
        public_message,
        internal_note,
        created_at,

        admin_profiles (
          full_name
        )
      `)
      .eq(
        "request_id",
        id,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),
  ]);


  // =======================================================
  // REQUEST MUST EXIST
  // =======================================================

  if (
    requestResult.error ||
    !requestResult.data
  ) {
    notFound();
  }


  if (responsesResult.error) {
    console.error(
      "Could not load request responses:",
      responsesResult.error,
    );
  }


  if (deliveryResult.error) {
    console.error(
      "Could not load delivery:",
      deliveryResult.error,
    );
  }


  if (paymentResult.error) {
    console.error(
      "Could not load payment:",
      paymentResult.error,
    );
  }


  if (historyResult.error) {
    console.error(
      "Could not load request history:",
      historyResult.error,
    );
  }


  // =======================================================
  // NORMALIZE DATA
  // =======================================================

  const request =
    requestResult.data as unknown as
      RequestDetail;


  const responses =
    responsesResult.data ?? [];


    const delivery =
    deliveryResult.data;


  const serviceScope =
    request
      .services
      ?.service_scope;


  if (
    serviceScope !==
      "general" &&
    serviceScope !==
      "academic"
  ) {
    notFound();
  }


  const isGeneralService =
    serviceScope ===
    "general";


  const serviceCategoryRelation =
    request
      .services
      ?.service_categories;


  const serviceCategoryName =
    Array.isArray(
      serviceCategoryRelation,
    )
      ? serviceCategoryRelation[0]
          ?.name ??
        "—"
      : serviceCategoryRelation
          ?.name ??
        "—";


  const deliveryRequired =
    Boolean(
      delivery
        ?.physical_delivery_required,
    );


  const payment =
    paymentResult.data;


  const history =
    (historyResult.data ??
      []) as unknown as
      RequestHistoryItem[];


  // =======================================================
  // PRIVATE PAYMENT PROOF
  // =======================================================

  let paymentProofUrl:
    | string
    | null = null;


  if (
    payment
      ?.proof_storage_path
  ) {
    const {
      data,
      error,
    } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(
        payment.proof_storage_path,
        60 * 10,
      );


    if (error) {
      console.error(
        "Payment proof signed URL failed:",
        error,
      );
    }


    paymentProofUrl =
      data?.signedUrl ??
      null;
  }


  const customerName = [
    request.first_name,
    request.other_names,
    request.surname,
  ]
    .filter(Boolean)
    .join(" ");


  return (
    <>
      {/* =================================================
          BACK
      ================================================= */}

      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to requests
      </Link>


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {request.request_number}
            </h1>

            <span
  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClasses(
    request.status,
  )}`}
>
  {readableStatus(
    request.status,
  )}
</span>


{isGeneralService && (
  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
    General Service
  </span>
)}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Submitted{" "}
            {formatDateTime(
              request.created_at,
            )}
          </p>

          {request.tracking_number && (
            <p className="mt-1 text-xs text-slate-400">
              Tracking:{" "}
              <span className="font-mono font-medium text-slate-600">
                {
                  request.tracking_number
                }
              </span>
            </p>
          )}
        </div>
      </div>


      {/* =================================================
          PAGE GRID
      ================================================= */}

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ===============================================
            LEFT COLUMN
        =============================================== */}

        <div className="space-y-6">
          {/* =============================================
              REQUEST OVERVIEW
          ============================================= */}

<SectionCard
  icon={FileText}
  title="Request Overview"
>
    <InfoGrid
    rows={[
      [
        isGeneralService
          ? "Service Category"
          : "University",

        isGeneralService
          ? serviceCategoryName
          : request
              .universities
              ?.name ??
            "—",
      ],

      [
        isGeneralService
          ? "Service Scope"
          : "University Code",

        isGeneralService
          ? "General Service"
          : request
              .universities
              ?.code ??
            "—",
      ],

      [
        "Service",

        request
          .services
          ?.name ??
          "—",
      ],

      [
        "Status",

        readableStatus(
          request.status,
        ),
      ],

      [
        "Request Number",

        request.request_number,
      ],

      [
        "Tracking Number",

        request.tracking_number ??
          "Not issued",
      ],
    ]}
  />
</SectionCard>


{/* =============================================
    CUSTOMER / APPLICANT
============================================= */}

<SectionCard
  icon={UserRound}
  title={
    isGeneralService
      ? "Customer"
      : "Applicant"
  }
>
  <InfoGrid
    rows={[
      [
        "Full Name",
        customerName,
      ],

      [
        "Gender",

        request.gender ??
          "—",
      ],

      [
        "Mobile",

        request.phone,
      ],

      [
        "Email",

        request.email,
      ],
    ]}
  />


  {request.notes && (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Customer Notes
      </p>


      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {
          request.notes
        }
      </p>
    </div>
  )}
</SectionCard>


{/* =============================================
    SERVICE / ACADEMIC INFORMATION
============================================= */}

<SectionCard
  icon={
    isGeneralService
      ? Package
      : Building2
  }
  title={
    isGeneralService
      ? "Service Details"
      : "Academic Information"
  }
>
  {responses.length ===
  0 ? (
    <p className="text-sm text-slate-400">
      {isGeneralService
        ? "No additional service details were recorded."
        : "No additional academic responses were recorded."}
    </p>
  ) : (
    <InfoGrid
      rows={responses.map(
        (
          item,
        ) => [
          item.field_label,

          item.value ||
            "—",
        ],
      )}
    />
  )}
</SectionCard>


{/* =============================================
    DELIVERY
============================================= */}

<SectionCard
  icon={Package}
  title={
    isGeneralService
      ? "Physical Delivery"
      : "Delivery"
  }
>
  {!delivery ? (
    <p className="text-sm text-slate-400">
      No delivery record is available.
    </p>
  ) : delivery
      .physical_delivery_required ? (
    <InfoGrid
      rows={[
        [
          "Delivery Method",

          isGeneralService
            ? "Physical Delivery"
            : "EMS Delivery",
        ],

        [
          "Recipient",

          delivery.full_name ??
            "—",
        ],

        [
          "House Number",

          delivery.house_number ??
            "—",
        ],

        [
          "Area / Town",

          delivery.area_town ??
            "—",
        ],

        [
          "City / District",

          delivery.city_district ??
            "—",
        ],

        [
          "Region",

          delivery.region ??
            "—",
        ],

        [
          "Digital Address",

          delivery.digital_address ??
            "—",
        ],

        [
          "Phone",

          delivery.phone ??
            "—",
        ],

        [
          "Email",

          delivery.email ??
            "—",
        ],

        [
          "Item Type",

          delivery.item_type ??
            "—",
        ],

        [
          "Emergency Contact",

          delivery.emergency_contact ??
            "—",
        ],

        [
          isGeneralService
            ? "Delivery Reference"
            : "EMS Tracking",

          delivery.ems_tracking_number ??
            "Not assigned",
        ],

        [
          "Dispatch Date",

          delivery.dispatch_date
            ? formatDateTime(
                delivery.dispatch_date,
              )
            : "Not dispatched",
        ],

        [
          "Delivered Date",

          delivery.delivered_date
            ? formatDateTime(
                delivery.delivered_date,
              )
            : "Not delivered",
        ],
      ]}
    />
  ) : (
    <div>
      <p className="text-sm font-medium text-slate-700">
        No Physical Delivery
      </p>


      <p className="mt-1 text-sm leading-6 text-slate-500">
        {isGeneralService
          ? "No additional physical delivery was requested for this service."
          : "Physical EMS delivery was not requested for this application."}
      </p>
    </div>
  )}
</SectionCard>


          {/* =============================================
              PAYMENT
          ============================================= */}

          <SectionCard
            icon={CreditCard}
            title="Payment"
          >
            {!payment ? (
              <p className="text-sm text-red-600">
                No payment record was
                found.
              </p>
            ) : (
              <>
                <InfoGrid
                  rows={[
                    [
                      "Method",

                      payment.payment_method ===
                      "momo"
                        ? "Mobile Money"
                        : "Bank Transfer",
                    ],

                    [
                      "Status",
                      payment.status,
                    ],

                    [
                      "Submitted",
                      formatDateTime(
                        payment.created_at,
                      ),
                    ],

                    [
                      "Verified",
                      payment.verified_at
                        ? formatDateTime(
                            payment.verified_at,
                          )
                        : "Not verified",
                    ],

                    [
                      "Amount",
                      payment.amount
                        ? `${payment.currency ?? "GHS"} ${Number(
                            payment.amount,
                          ).toFixed(
                            2,
                          )}`
                        : "Not recorded",
                    ],

                    ...(payment.rejection_reason
                      ? [
                          [
                            "Rejection Reason",
                            payment.rejection_reason,
                          ] as [
                            string,
                            ReactNode,
                          ],
                        ]
                      : []),
                  ]}
                />


                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-sm font-semibold text-slate-800">
                    Payment Proof
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Private payment
                    evidence submitted by
                    the customer.
                  </p>


                  {!paymentProofUrl ? (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Payment proof could
                      not be loaded.
                    </div>
                  ) : payment
                      .proof_storage_path
                      ?.toLowerCase()
                      .endsWith(
                        ".pdf",
                      ) ? (
                    <iframe
                      src={
                        paymentProofUrl
                      }
                      title="Payment proof"
                      className="mt-4 h-[600px] w-full rounded-2xl border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {/*
                        Signed Supabase URL.
                        We intentionally use
                        a normal img element.
                      */}

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          paymentProofUrl
                        }
                        alt="Customer payment proof"
                        className="max-h-[700px] w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </SectionCard>


          {/* =============================================
              OPERATIONS HISTORY
          ============================================= */}

          <SectionCard
            icon={Clock3}
            title="Operations History"
          >
            {history.length ===
            0 ? (
              <p className="text-sm text-slate-400">
                No workflow history is
                available.
              </p>
            ) : (
              <div className="space-y-0">
                {history.map(
                  (
                    item,
                    index,
                  ) => {
                    const adminName =
                      getHistoryAdminName(
                        item.admin_profiles,
                      );

                    return (
                      <div
                        key={
                          item.id
                        }
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index <
                          history.length -
                            1 && (
                          <div className="absolute left-[15px] top-8 h-[calc(100%-14px)] w-px bg-slate-200" />
                        )}


                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>


                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {readableStatus(
                                item.status,
                              )}
                            </p>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {
                                formatDateTime(
                                  item.created_at,
                                )
                              }
                            </span>
                          </div>


                          {item.public_message && (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                              {
                                item.public_message
                              }
                            </p>
                          )}


                          {item.internal_note && (
                            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                                Internal Note
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-900">
                                {
                                  item.internal_note
                                }
                              </p>
                            </div>
                          )}


                          <p className="mt-2 text-xs text-slate-400">
                            {adminName
                              ? `Updated by ${adminName}`
                              : "System update"}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </SectionCard>
        </div>


        {/* ===============================================
            RIGHT SIDEBAR
        =============================================== */}

        <aside className="space-y-5">
          {/* =============================================
              PAYMENT REVIEW
          ============================================= */}

          {payment?.status ===
          "PENDING" ? (
            <PaymentReviewActions
              requestId={
                request.id
              }
            />
          ) : (
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Payment Review
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This payment has already
                been reviewed.
              </p>

              <div
                className={`mt-4 rounded-xl px-3 py-3 text-sm font-medium ${
                  payment?.status ===
                  "CONFIRMED"
                    ? "bg-emerald-50 text-emerald-700"
                    : payment?.status ===
                        "REJECTED"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-50 text-slate-700"
                }`}
              >
                {payment?.status ??
                  "Unknown"}
              </div>

              {payment?.verified_at && (
                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Reviewed{" "}
                  {formatDateTime(
                    payment.verified_at,
                  )}
                </p>
              )}

              {payment
                ?.rejection_reason && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                    Rejection Reason
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-800">
                    {
                      payment.rejection_reason
                    }
                  </p>
                </div>
              )}
            </div>
          )}


          {/* =============================================
              REQUEST WORKFLOW ACTION
          ============================================= */}

          <RequestProcessingActions
  requestId={
    request.id
  }
  status={
    request.status as RequestStatus
  }
  isGeneralService={
    isGeneralService
  }
  deliveryRequired={
    deliveryRequired
  }
/>

  {!isGeneralService &&
  request.status ===
    "DOCUMENT_READY" && (
    <RequestDocumentUpload
      requestId={
        request.id
      }
    />
  )}
<RequestDeliveryActions
  requestId={
    request.id
  }
  status={
    request.status as RequestStatus
  }
  deliveryRequired={
    deliveryRequired
  }
  existingEmsTrackingNumber={
    delivery
      ?.ems_tracking_number ??
    null
  }
  isGeneralService={
    isGeneralService
  }
/>
          {/* =============================================
              CURRENT STATUS
          ============================================= */}

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Current Request Status
            </p>

            <div
              className={`mt-4 rounded-xl px-3 py-3 text-sm font-medium ${getStatusClasses(
                request.status,
              )}`}
            >
              {readableStatus(
                request.status,
              )}
            </div>

            {!isGeneralService &&
  request.status ===
    "DOCUMENT_READY" && (
  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-semibold text-blue-900">
                  Document upload is next
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  The next phase will
                  require the scanned
                  document to be uploaded
                  before the request can
                  move to Document
                  Scanned.
                </p>
              </div>
            )}
          </div>


          {/* =============================================
              CUSTOMER CONTACT
          ============================================= */}

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">
              Customer Contact
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <a
                href={`tel:${request.phone}`}
                className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
              >
                <Phone className="h-4 w-4 shrink-0 text-blue-600" />

                <span>
                  {request.phone}
                </span>
              </a>


              <a
                href={`mailto:${request.email}`}
                className="flex items-center gap-3 text-slate-600 transition hover:text-blue-600"
              >
                <Mail className="h-4 w-4 shrink-0 text-blue-600" />

                <span className="break-all">
                  {request.email}
                </span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}


// =========================================================
// SECTION CARD
// =========================================================

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>

        <h2 className="font-semibold text-slate-950">
          {title}
        </h2>
      </div>

      <div className="pt-5">
        {children}
      </div>
    </section>
  );
}


// =========================================================
// INFORMATION GRID
// =========================================================

function InfoGrid({
  rows,
}: {
  rows: [
    string,
    ReactNode,
  ][];
}) {
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(
        (
          [
            label,
            value,
          ],
          index,
        ) => (
          <div
            key={`${label}-${index}`}
            className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[190px_minmax(0,1fr)]"
          >
            <p className="text-sm text-slate-400">
              {label}
            </p>

            <div className="break-words text-sm font-medium text-slate-800">
              {value}
            </div>
          </div>
        ),
      )}
    </div>
  );
}


// =========================================================
// HISTORY ADMIN NAME
// =========================================================

function getHistoryAdminName(
  adminProfiles:
    | {
        full_name: string;
      }
    | {
        full_name: string;
      }[]
    | null,
) {
  if (!adminProfiles) {
    return null;
  }

  if (
    Array.isArray(
      adminProfiles,
    )
  ) {
    return (
      adminProfiles[0]
        ?.full_name ??
      null
    );
  }

  return (
    adminProfiles.full_name ??
    null
  );
}


// =========================================================
// READABLE STATUS
// =========================================================

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


// =========================================================
// STATUS COLORS
// =========================================================

function getStatusClasses(
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

    case "DOCUMENT_SCANNED":
      return "bg-sky-50 text-sky-700";

    case "PREPARING_DELIVERY":
      return "bg-orange-50 text-orange-700";

    case "HANDED_TO_EMS":
      return "bg-purple-50 text-purple-700";

    case "IN_TRANSIT":
      return "bg-yellow-50 text-yellow-700";

    case "DELIVERED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";

    case "PAYMENT_REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "MORE_INFORMATION_REQUIRED":
    case "ON_HOLD":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}


// =========================================================
// DATE FORMATTER
// =========================================================

function formatDateTime(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleString(
    "en-GH",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  );
}