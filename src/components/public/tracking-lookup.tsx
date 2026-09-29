"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  Loader2,
  LockKeyhole,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  REQUEST_STATUSES,
  type RequestStatus,
} from "@/constants/request-status";

import type {
  TrackingResult,
} from "@/types/tracking";

const standardPipeline: {
  status: RequestStatus;
  label: string;
}[] = [
  {
    status:
      "AWAITING_PAYMENT_VERIFICATION",
    label:
      "Payment Verification",
  },

  {
    status:
      "PAYMENT_CONFIRMED",
    label:
      "Payment Confirmed",
  },

  {
    status:
      "PROCESSING_REQUEST",
    label:
      "Request Processing",
  },

  {
    status:
      "SUBMITTED_TO_UNIVERSITY",
    label:
      "Submitted to University",
  },

  {
    status:
      "AWAITING_UNIVERSITY",
    label:
      "University Processing",
  },

  {
    status:
      "DOCUMENT_READY",
    label:
      "Document Ready",
  },

  {
    status:
      "DOCUMENT_SCANNED",
    label:
      "Document Scanned",
  },

  {
    status:
      "PREPARING_DELIVERY",
    label:
      "Preparing Delivery",
  },

  {
    status:
      "HANDED_TO_EMS",
    label:
      "Handed to EMS",
  },

  {
    status:
      "IN_TRANSIT",
    label:
      "In Transit",
  },

  {
    status:
      "DELIVERED",
    label:
      "Delivered",
  },
];

const specialStatuses:
  RequestStatus[] = [
    "PAYMENT_REJECTED",
    "MORE_INFORMATION_REQUIRED",
    "ON_HOLD",
    "CANCELLED",
  ];

export function TrackingLookup() {
  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState("");

  const [
    trackingPin,
    setTrackingPin,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    result,
    setResult,
  ] =
    useState<TrackingResult | null>(
      null,
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/track",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              trackingNumber,
              trackingPin,
            }),
          },
        );

      const payload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message ||
            "Unable to track request.",
        );
      }

      setResult(
        payload.tracking,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to track request.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetLookup() {
    setResult(null);
    setError("");
    setTrackingPin("");
  }

  if (result) {
    return (
      <TrackingDetails
        result={result}
        onReset={resetLookup}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Search className="h-5 w-5" />
        </div>

        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
          Enter your tracking details
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your tracking number and PIN
          are issued after your payment
          has been confirmed.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div className="space-y-2">
            <Label
              htmlFor="trackingNumber"
            >
              Tracking Number
            </Label>

            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value,
                )
              }
              placeholder="SC247-UCC-XXXXXXXXXX"
              autoComplete="off"
              className="h-12 font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="trackingPin"
            >
              6-Digit Tracking PIN
            </Label>

            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="trackingPin"
                value={trackingPin}
                onChange={(event) =>
                  setTrackingPin(
                    event.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        6,
                      ),
                  )
                }
                placeholder="000000"
                inputMode="numeric"
                autoComplete="off"
                className="h-12 pl-10 font-mono text-lg tracking-[0.25em]"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              loading ||
              !trackingNumber.trim() ||
              trackingPin.length !==
                6
            }
            className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Track Request
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs leading-5 text-slate-400">
            Keep your tracking PIN
            private. Seekers Connect
            support may ask for your
            request number, but you
            should avoid sharing your
            tracking PIN unnecessarily.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrackingDetails({
  result,
  onReset,
}: {
  result: TrackingResult;
  onReset: () => void;
}) {
  const currentStatus =
    REQUEST_STATUSES[
      result.status
    ];

  const isSpecialStatus =
    specialStatuses.includes(
      result.status,
    );

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={onReset}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Track another request
      </button>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                Request Tracking
              </p>

              <h2 className="mt-3 break-all text-2xl font-semibold sm:text-3xl">
                {
                  result.trackingNumber
                }
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Request{" "}
                {result.requestNumber}
              </p>
            </div>

            <StatusBadge
              status={
                result.status
              }
            />
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div
              className={`rounded-2xl border p-5 ${
                isSpecialStatus
                  ? "border-amber-200 bg-amber-50"
                  : "border-blue-100 bg-blue-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Current Status
              </p>

              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {
                  currentStatus
                    ?.label
                }
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  currentStatus
                    ?.description
                }
              </p>
            </div>

            {!isSpecialStatus && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-slate-950">
                  Request Progress
                </p>

                <div className="mt-6">
                  <TrackingPipeline
                    status={
                      result.status
                    }
                    deliveryRequired={
                      result.delivery
                        .required
                    }
                  />
                </div>
              </div>
            )}

            <div className="mt-9">
              <p className="text-sm font-semibold text-slate-950">
                Status History
              </p>

              <div className="mt-5 space-y-0">
                {result.history.map(
                  (
                    item,
                    index,
                  ) => (
                    <HistoryItem
                      key={`${item.status}-${item.createdAt}`}
                      status={
                        item.status
                      }
                      message={
                        item.message
                      }
                      createdAt={
                        item.createdAt
                      }
                      last={
                        index ===
                        result
                          .history
                          .length -
                          1
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <SummaryCard
              title="University"
              icon={
                Building2
              }
            >
              <p className="font-semibold text-slate-900">
                {
                  result
                    .university
                    .code
                }
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {
                  result
                    .university
                    .name
                }
              </p>
            </SummaryCard>

            <SummaryCard
              title="Service"
              icon={
                FileText
              }
            >
              <p className="font-semibold text-slate-900">
                {
                  result.service
                    .shortName
                }
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {
                  result.service
                    .name
                }
              </p>
            </SummaryCard>

            {result.delivery
              .required && (
              <SummaryCard
                title="EMS Delivery"
                icon={Truck}
              >
                {result.delivery
                  .emsTrackingNumber ? (
                  <>
                    <p className="text-xs text-slate-400">
                      EMS Tracking
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                      {
                        result
                          .delivery
                          .emsTrackingNumber
                      }
                    </p>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    EMS tracking will
                    appear here once
                    the document has
                    been dispatched.
                  </p>
                )}
              </SummaryCard>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Submitted
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatDate(
                  result.submittedAt,
                )}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TrackingPipeline({
  status,
  deliveryRequired,
}: {
  status: RequestStatus;
  deliveryRequired: boolean;
}) {
  const pipeline =
    deliveryRequired
      ? standardPipeline
      : standardPipeline.filter(
          (item) =>
            ![
              "PREPARING_DELIVERY",
              "HANDED_TO_EMS",
              "IN_TRANSIT",
              "DELIVERED",
            ].includes(
              item.status,
            ),
        );

  const normalizedStatus =
    status === "COMPLETED"
      ? deliveryRequired
        ? "DELIVERED"
        : "DOCUMENT_SCANNED"
      : status;

  const currentIndex =
    pipeline.findIndex(
      (item) =>
        item.status ===
        normalizedStatus,
    );

  return (
    <div>
      {pipeline.map(
        (
          item,
          index,
        ) => {
          const completed =
            currentIndex >
            index;

          const current =
            currentIndex ===
            index;

          return (
            <div
              key={item.status}
              className="relative flex gap-4 pb-7 last:pb-0"
            >
              {index <
                pipeline.length -
                  1 && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-18px)] w-px ${
                    completed
                      ? "bg-blue-500"
                      : "bg-slate-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  completed
                    ? "border-blue-600 bg-blue-600 text-white"
                    : current
                      ? "border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-50"
                      : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {completed ? (
                  <Check className="h-4 w-4" />
                ) : current ? (
                  <Clock3 className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              <div className="pt-1">
                <p
                  className={`text-sm font-medium ${
                    current
                      ? "text-blue-700"
                      : completed
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {item.label}
                </p>

                {current && (
                  <p className="mt-1 text-xs text-slate-500">
                    Current stage
                  </p>
                )}
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

function HistoryItem({
  status,
  message,
  createdAt,
  last,
}: {
  status: RequestStatus;
  message: string | null;
  createdAt: string;
  last: boolean;
}) {
  const statusInfo =
    REQUEST_STATUSES[status];

  return (
    <div className="relative flex gap-4 pb-7 last:pb-0">
      {!last && (
        <div className="absolute left-[15px] top-8 h-[calc(100%-14px)] w-px bg-slate-200" />
      )}

      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">
          {statusInfo?.label ??
            status.replaceAll(
              "_",
              " ",
            )}
        </p>

        {message && (
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            {message}
          </p>
        )}

        <p className="mt-2 text-xs text-slate-400">
          {formatDate(
            createdAt,
          )}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  const dangerStatuses:
    RequestStatus[] = [
      "PAYMENT_REJECTED",
      "CANCELLED",
    ];

  const warningStatuses:
    RequestStatus[] = [
      "MORE_INFORMATION_REQUIRED",
      "ON_HOLD",
    ];

  const completedStatuses:
    RequestStatus[] = [
      "DELIVERED",
      "COMPLETED",
    ];

  let classes =
    "bg-blue-500/15 text-blue-200";

  if (
    dangerStatuses.includes(
      status,
    )
  ) {
    classes =
      "bg-red-500/15 text-red-200";
  }

  if (
    warningStatuses.includes(
      status,
    )
  ) {
    classes =
      "bg-amber-500/15 text-amber-200";
  }

  if (
    completedStatuses.includes(
      status,
    )
  ) {
    classes =
      "bg-emerald-500/15 text-emerald-200";
  }

  return (
    <span
      className={`inline-flex self-start rounded-full px-3 py-1.5 text-xs font-semibold ${classes}`}
    >
      {REQUEST_STATUSES[
        status
      ]?.label ??
        status.replaceAll(
          "_",
          " ",
        )}
    </span>
  );
}

function SummaryCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon className="h-4 w-4 text-blue-600" />
        {title}
      </div>

      <div className="mt-3">
        {children}
      </div>
    </div>
  );
}

function formatDate(
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