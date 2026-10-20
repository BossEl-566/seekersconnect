"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  REQUEST_STATUSES,
} from "@/constants/request-status";

import type {
  TrackingResult,
} from "@/types/tracking";

import {
  useState,
  type FormEvent,
} from "react";


export function HomeTrackingCard() {
  const [
    trackingNumber,
    setTrackingNumber,
  ] =
    useState(
      "",
    );


  const [
    trackingPin,
    setTrackingPin,
  ] =
    useState(
      "",
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    result,
    setResult,
  ] =
    useState<TrackingResult | null>(
      null,
    );


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setError(
      "",
    );

    setLoading(
      true,
    );


    try {
      const response =
        await fetch(
          "/api/track",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                trackingNumber:
                  trackingNumber.trim(),

                trackingPin,
              }),
          },
        );


      const payload =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          payload.message ||
          "Unable to track request.",
        );
      }


      setResult(
        payload.tracking as
          TrackingResult,
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to track request.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  function reset() {
    setResult(
      null,
    );

    setError(
      "",
    );

    setTrackingPin(
      "",
    );
  }


  const currentStatus =
    result
      ? REQUEST_STATUSES[
          result.status
        ]
      : null;


  const latestHistory =
    result &&
    result.history.length >
      0
      ? result.history[
          result.history.length -
            1
        ]
      : null;


  return (
    <section
      id="track-request"
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="grid lg:grid-cols-[1.05fr_0.7fr_0.72fr]">
          {/* =============================================
              LOOKUP
          ============================================= */}

          <div className="p-6 sm:p-8 lg:p-10">
            {!result ? (
              <>
                <p className="text-sm font-semibold text-blue-600">
                  Track Your Request
                </p>


                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Know exactly where your request stands.
                </h2>


                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Enter the tracking number and six-digit PIN issued
                  to you after your tracking details were created.
                </p>


                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="mt-7"
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.7fr)]">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Tracking Number
                      </span>


                      <div className="relative mt-2">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                        <input
                          value={
                            trackingNumber
                          }
                          onChange={(
                            event,
                          ) =>
                            setTrackingNumber(
                              event.target
                                .value
                                .toUpperCase(),
                            )
                          }
                          placeholder="SC247-..."
                          autoComplete="off"
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                    </label>


                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Tracking PIN
                      </span>


                      <div className="relative mt-2">
                        <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />


                        <input
                          value={
                            trackingPin
                          }
                          onChange={(
                            event,
                          ) =>
                            setTrackingPin(
                              event.target
                                .value
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
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 font-mono text-base tracking-[0.2em] text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                    </label>
                  </div>


                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                      {
                        error
                      }
                    </div>
                  )}


                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !trackingNumber.trim() ||
                        trackingPin.length !==
                          6
                      }
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                          Checking...
                        </>
                      ) : (
                        <>
                          Track Request

                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>


                    <Link
                      href="/track"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Open Tracking Page
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>


                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                      Request Found
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                      {
                        result.service
                          .shortName ||
                        result.service.name
                      }
                    </h2>
                  </div>
                </div>


                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Tracking Number
                    </p>

                    <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-900">
                      {
                        result.trackingNumber
                      }
                    </p>
                  </div>


                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-500">
                      Current Status
                    </p>

                    <p className="mt-2 text-sm font-semibold text-blue-900">
                      {currentStatus
                        ?.label ||
                        result.status.replaceAll(
                          "_",
                          " ",
                        )}
                    </p>
                  </div>
                </div>


                {latestHistory
                  ?.message && (
                  <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Latest Update
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {
                        latestHistory.message
                      }
                    </p>
                  </div>
                )}


                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/track"
                    className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    View Full Tracking

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>


                  <button
                    type="button"
                    onClick={
                      reset
                    }
                    className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />

                    Track Another
                  </button>
                </div>
              </>
            )}
          </div>


          {/* =============================================
              PROGRESS PREVIEW
          ============================================= */}

          <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Request Progress
            </p>


            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              From submission to completion.
            </h3>


            <div className="mt-8 space-y-0">
              {[
                {
                  number:
                    "01",

                  title:
                    "Request received",

                  text:
                    "Your information enters our processing workflow.",
                },

                {
                  number:
                    "02",

                  title:
                    "Processing",

                  text:
                    "Our team handles the service requirements.",
                },

                {
                  number:
                    "03",

                  title:
                    "Delivery or completion",

                  text:
                    "The final result is delivered or marked complete.",
                },
              ].map(
                (
                  item,
                  index,
                ) => (
                  <div
                    key={
                      item.number
                    }
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    {index <
                      2 && (
                      <div className="absolute left-[17px] top-9 h-[calc(100%-18px)] w-px bg-blue-200" />
                    )}


                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                      {
                        item.number
                      }
                    </div>


                    <div>
                      <p className="font-semibold text-slate-900">
                        {
                          item.title
                        }
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          item.text
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>


          {/* =============================================
              IMAGE
          ============================================= */}

          <div className="relative min-h-[300px] overflow-hidden bg-slate-950 lg:min-h-full">
            <Image
              src="/seekers-delivery-flier.jpg"
              alt="Seekers Connect request delivery and tracking"
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
            />


            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />


            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="max-w-xs rounded-2xl border border-white/15 bg-slate-950/60 p-4 text-white backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-200">
                  Stay informed
                </p>

                <p className="mt-2 text-lg font-semibold">
                  Your request status stays within reach.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Keep your six-digit tracking PIN private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}