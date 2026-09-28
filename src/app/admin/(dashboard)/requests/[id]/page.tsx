import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
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
  other_names: string | null;
  surname: string;

  gender: string | null;

  phone: string;
  email: string;

  notes: string | null;

  tracking_number:
    | string
    | null;

  created_at: string;

  universities: {
    code: string;
    name: string;
  } | null;

  services: {
    name: string;
    short_name: string;
  } | null;
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

  const [
    requestResult,
    responsesResult,
    deliveryResult,
    paymentResult,
  ] = await Promise.all([
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
          short_name
        )
      `)
      .eq("id", id)
      .single(),

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

    supabase
      .from("deliveries")
      .select("*")
      .eq(
        "request_id",
        id,
      )
      .maybeSingle(),

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
  ]);

  if (
    requestResult.error ||
    !requestResult.data
  ) {
    notFound();
  }

  const request =
    requestResult.data as unknown as
      RequestDetail;

  const responses =
    responsesResult.data ?? [];

  const delivery =
    deliveryResult.data;

  const payment =
    paymentResult.data;

  let paymentProofUrl:
    | string
    | null = null;

  if (
    payment
      ?.proof_storage_path
  ) {
    const {
      data,
    } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(
        payment.proof_storage_path,
        60 * 10,
      );

    paymentProofUrl =
      data?.signedUrl ?? null;
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
      <Link
        href="/admin/payments"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to payments
      </Link>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {
                request.request_number
              }
            </h1>

            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              {request.status
                .replaceAll(
                  "_",
                  " ",
                )
                .toLowerCase()}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Submitted{" "}
            {new Date(
              request.created_at,
            ).toLocaleString(
              "en-GH",
              {
                dateStyle:
                  "long",
                timeStyle:
                  "short",
              },
            )}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* REQUEST OVERVIEW */}
          <SectionCard
            icon={FileText}
            title="Request Overview"
          >
            <InfoGrid
              rows={[
                [
                  "University",
                  request
                    .universities
                    ?.name ??
                    "—",
                ],

                [
                  "University Code",
                  request
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
                  request.status
                    .replaceAll(
                      "_",
                      " ",
                    )
                    .toLowerCase(),
                ],
              ]}
            />
          </SectionCard>

          {/* CUSTOMER */}
          <SectionCard
            icon={UserRound}
            title="Applicant"
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
          </SectionCard>

          {/* ACADEMIC INFO */}
          <SectionCard
            icon={Building2}
            title="Academic Information"
          >
            {responses.length ===
            0 ? (
              <p className="text-sm text-slate-400">
                No additional academic
                responses were recorded.
              </p>
            ) : (
              <InfoGrid
                rows={responses.map(
                  (item) => [
                    item.field_label,
                    item.value ||
                      "—",
                  ],
                )}
              />
            )}
          </SectionCard>

          {/* DELIVERY */}
          <SectionCard
            icon={Package}
            title="Delivery"
          >
            {!delivery ? (
              <p className="text-sm text-slate-400">
                No delivery record is
                available.
              </p>
            ) : delivery
                .physical_delivery_required ? (
              <InfoGrid
                rows={[
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
                    "Emergency Contact",
                    delivery.emergency_contact ??
                      "—",
                  ],
                ]}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Physical EMS delivery
                was not requested.
              </p>
            )}
          </SectionCard>

          {/* PAYMENT */}
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
                      new Date(
                        payment.created_at,
                      ).toLocaleString(
                        "en-GH",
                        {
                          dateStyle:
                            "medium",
                          timeStyle:
                            "short",
                        },
                      ),
                    ],
                  ]}
                />

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-sm font-semibold text-slate-800">
                    Payment Proof
                  </p>

                  {!paymentProofUrl ? (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Payment proof could
                      not be loaded.
                    </div>
                  ) : payment.proof_storage_path
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
                      {/* We use a signed external URL,
                          so a normal img is simplest here. */}
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
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-5">
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

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                {payment?.status ??
                  "Unknown"}
              </div>
            </div>
          )}

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">
              Customer Contact
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-4 w-4 text-blue-600" />
                {request.phone}
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="break-all">
                  {request.email}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
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

function InfoGrid({
  rows,
}: {
  rows: [string, React.ReactNode][];
}) {
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(
        ([label, value]) => (
          <div
            key={label}
            className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[190px_minmax(0,1fr)]"
          >
            <p className="text-sm text-slate-400">
              {label}
            </p>

            <div className="text-sm font-medium capitalize text-slate-800">
              {value}
            </div>
          </div>
        ),
      )}
    </div>
  );
}