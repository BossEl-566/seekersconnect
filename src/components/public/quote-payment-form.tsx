"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Label,
} from "@/components/ui/label";

import {
  getAvailablePaymentMethods,
  getCurrencyPaymentDestination,
  isPaymentMethodAvailable,
} from "@/lib/payment/payment-destinations";

import type {
  SystemSettings,
} from "@/lib/validation/system-settings";


type QuotePayment = {
  requestNumber:
    string;

  serviceName:
    string;

  serviceShortName:
    string;

  pricingMode:
    string;

  currency:
    string;

  totalAmount:
    number;

  displayNote:
    string
    | null;
};


type LookupResponse = {
  success?:
    boolean;

  payment?:
    QuotePayment;

  message?:
    string;
};


type SettingsResponse = {
  success?:
    boolean;

  settings?:
    SystemSettings;

  message?:
    string;
};


export function QuotePaymentForm({
  token,
}: {
  token:
    string;
}) {
  const [
    payment,
    setPayment,
  ] =
    useState<
      QuotePayment
      | null
    >(
      null,
    );


  const [
    settings,
    setSettings,
  ] =
    useState<
      SystemSettings
      | null
    >(
      null,
    );


  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<
      "momo"
      | "bank"
      | ""
    >(
      "",
    );


  const [
    proof,
    setProof,
  ] =
    useState<
      File
      | null
    >(
      null,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    submitting,
    setSubmitting,
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
    submitted,
    setSubmitted,
  ] =
    useState(
      false,
    );


  // =======================================================
  // LOAD REQUEST + SETTINGS
  // =======================================================

  useEffect(
    () => {
      let cancelled =
        false;


      async function load() {
        setLoading(
          true,
        );

        setError(
          "",
        );


        try {
          const [
            paymentResponse,
            settingsResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/request-payment/lookup",
                {
                  method:
                    "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body:
                    JSON.stringify({
                      token,
                    }),

                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/public-settings",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);


          const paymentResult =
            (
              await paymentResponse.json()
            ) as LookupResponse;


          const settingsResult =
            (
              await settingsResponse.json()
            ) as SettingsResponse;


          if (
            !paymentResponse.ok ||
            !paymentResult.success ||
            !paymentResult.payment
          ) {
            throw new Error(
              paymentResult.message ||
              "This payment link is unavailable.",
            );
          }


          if (
            !settingsResponse.ok ||
            !settingsResult.success ||
            !settingsResult.settings
          ) {
            throw new Error(
              settingsResult.message ||
              "Payment instructions could not be loaded.",
            );
          }


          if (
            cancelled
          ) {
            return;
          }


          setPayment(
            paymentResult.payment,
          );


          setSettings(
            settingsResult.settings,
          );
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return;
          }


          setError(
            error instanceof
              Error
              ? error.message
              : "This payment link could not be loaded.",
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false,
            );
          }
        }
      }


      load();


      return () => {
        cancelled =
          true;
      };
    },
    [
      token,
    ],
  );


  // =======================================================
  // CURRENCY DESTINATION
  // =======================================================

  const paymentDestination =
    payment &&
    settings
      ? getCurrencyPaymentDestination(
          settings.payment,
          payment.currency,
        )
      : null;


  const availableMethods =
    payment &&
    settings
      ? getAvailablePaymentMethods(
          settings.payment,
          payment.currency,
        )
      : [];


  const momoAvailable =
    availableMethods.includes(
      "momo",
    );


  const bankAvailable =
    availableMethods.includes(
      "bank",
    );


  // =======================================================
  // SUBMIT
  // =======================================================

  async function handleSubmit() {
    if (
      !payment ||
      !settings
    ) {
      return;
    }


    setError(
      "",
    );


    if (
      !paymentMethod
    ) {
      setError(
        "Select a payment method.",
      );

      return;
    }


    if (
      !isPaymentMethodAvailable(
        settings.payment,
        payment.currency,
        paymentMethod,
      )
    ) {
      setError(
        `The selected payment method is not available for ${payment.currency}.`,
      );

      return;
    }


    if (
      !proof
    ) {
      setError(
        "Upload proof of payment before continuing.",
      );

      return;
    }


    setSubmitting(
      true,
    );


    try {
      const formData =
        new FormData();


      formData.append(
        "token",
        token,
      );


      formData.append(
        "paymentMethod",
        paymentMethod,
      );


      formData.append(
        "paymentProof",
        proof,
      );


      const response =
        await fetch(
          "/api/request-payment/submit",
          {
            method:
              "POST",

            body:
              formData,
          },
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result.message ||
          "Your payment proof could not be submitted.",
        );
      }


      setSubmitted(
        true,
      );
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Your payment proof could not be submitted.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />


          <p className="mt-3 text-sm text-slate-500">
            Loading your payment request...
          </p>
        </div>
      </div>
    );
  }


  // =======================================================
  // INVALID LINK
  // =======================================================

  if (
    error &&
    !payment
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <ShieldCheck className="mx-auto h-9 w-9 text-red-500" />


        <h1 className="mt-5 text-2xl font-semibold text-slate-950">
          Payment link unavailable
        </h1>


        <p className="mt-3 text-sm leading-6 text-slate-500">
          {
            error
          }
        </p>


        <p className="mt-4 text-xs leading-5 text-slate-400">
          Contact Seekers Connect 247 if you believe you received this
          message in error.
        </p>
      </div>
    );
  }


  // =======================================================
  // SUCCESS
  // =======================================================

  if (
    submitted &&
    payment
  ) {
    return (
      <div className="mx-auto max-w-xl rounded-[28px] border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>


        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Payment Submitted
        </p>


        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Your payment proof has been received.
        </h1>


        <p className="mt-4 text-sm leading-7 text-slate-500">
          Seekers Connect 247 will verify the payment before processing
          continues.
        </p>


        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Request Number
          </p>


          <p className="mt-2 font-semibold text-slate-950">
            {
              payment.requestNumber
            }
          </p>
        </div>


        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
          <p className="font-semibold text-blue-950">
            What happens next?
          </p>


          <p className="mt-2 text-sm leading-6 text-blue-800">
            Once payment is confirmed, your secure tracking number and
            6-digit tracking PIN can be issued for monitoring the
            request.
          </p>
        </div>
      </div>
    );
  }


  if (
    !payment ||
    !settings
  ) {
    return null;
  }


  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-6 w-6" />
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Secure Payment
            </p>


            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Complete payment for your request.
            </h1>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review the confirmed amount carefully before making
              payment.
            </p>
          </div>
        </div>


        {/* ===============================================
            REQUEST
        =============================================== */}

        <div className="mt-8 rounded-2xl border border-slate-200 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                Request Number
              </p>


              <p className="mt-1 font-semibold text-slate-950">
                {
                  payment.requestNumber
                }
              </p>
            </div>


            <div>
              <p className="text-xs text-slate-400">
                Service
              </p>


              <p className="mt-1 font-semibold text-slate-950">
                {
                  payment.serviceName
                }
              </p>
            </div>
          </div>
        </div>


        {/* ===============================================
            AMOUNT
        =============================================== */}

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Confirmed Amount Due
          </p>


          <p className="mt-2 text-4xl font-semibold tracking-tight text-blue-950">
            {
              payment.currency
            }{" "}
            {payment.totalAmount.toFixed(
              2,
            )}
          </p>


          {payment.displayNote && (
            <p className="mt-3 text-sm leading-6 text-blue-800">
              {
                payment.displayNote
              }
            </p>
          )}


          <p className="mt-4 text-xs leading-5 text-blue-700">
            Pay the exact amount in{" "}
            <strong>
              {
                payment.currency
              }
            </strong>
            . The platform does not automatically convert currencies.
          </p>
        </div>


        {/* ===============================================
            PAYMENT METHODS
        =============================================== */}

        <div className="mt-8">
          <h2 className="font-semibold text-slate-950">
            Select Payment Method
          </h2>


          <p className="mt-1 text-sm leading-6 text-slate-500">
            {
              settings
                .request
                .paymentInstructions
            }
          </p>


          {availableMethods.length ===
          0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-950">
                No{" "}
                {
                  payment.currency
                }{" "}
                payment destination is currently available.
              </p>


              <p className="mt-2 text-sm leading-6 text-amber-800">
                Please contact Seekers Connect 247 before sending
                payment. Do not send a different currency unless our
                team confirms the correct payment arrangement.
              </p>
            </div>
          ) : (
            <div
              className={`mt-5 grid gap-4 ${
                momoAvailable &&
                bankAvailable
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-1"
              }`}
            >
              {momoAvailable &&
                paymentDestination && (
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "momo",
                    )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod ===
                    "momo"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-blue-600" />


                  <p className="mt-4 font-semibold text-slate-950">
                    Mobile Money
                  </p>


                  <p className="mt-2 text-xs font-semibold text-blue-600">
                    {
                      payment.currency
                    }{" "}
                    payment
                  </p>


                  <p className="mt-3 text-xs text-slate-400">
                    Number
                  </p>


                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      paymentDestination
                        .momo
                        .number
                    }
                  </p>


                  <p className="mt-3 text-xs text-slate-400">
                    Account Name
                  </p>


                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      paymentDestination
                        .momo
                        .accountName
                    }
                  </p>
                </button>
              )}


              {bankAvailable &&
                paymentDestination && (
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "bank",
                    )
                  }
                  className={`rounded-2xl border p-5 text-left transition ${
                    paymentMethod ===
                    "bank"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <Building2 className="h-5 w-5 text-blue-600" />


                  <p className="mt-4 font-semibold text-slate-950">
                    {
                      paymentDestination
                        .bank
                        .bankName
                    }
                  </p>


                  <p className="mt-2 text-xs font-semibold text-blue-600">
                    {
                      payment.currency
                    }{" "}
                    account
                  </p>


                  <p className="mt-3 text-xs text-slate-400">
                    Account Number
                  </p>


                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {
                      paymentDestination
                        .bank
                        .accountNumber
                    }
                  </p>


                  <p className="mt-3 text-xs text-slate-400">
                    Account Name
                  </p>


                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      paymentDestination
                        .bank
                        .accountName
                    }
                  </p>


                  {paymentDestination
                    .bank
                    .branch && (
                    <>
                      <p className="mt-3 text-xs text-slate-400">
                        Branch
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {
                          paymentDestination
                            .bank
                            .branch
                        }
                      </p>
                    </>
                  )}


                  {paymentDestination
                    .bank
                    .swiftBic && (
                    <>
                      <p className="mt-3 text-xs text-slate-400">
                        SWIFT / BIC
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {
                          paymentDestination
                            .bank
                            .swiftBic
                        }
                      </p>
                    </>
                  )}


                  {paymentDestination
                    .bank
                    .instructions && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs leading-5 text-slate-600">
                        {
                          paymentDestination
                            .bank
                            .instructions
                        }
                      </p>
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>


        {/* ===============================================
            PROOF
        =============================================== */}

        {availableMethods.length >
          0 && (
          <>
            <div className="mt-8">
              <Label>
                Proof of Payment{" "}
                <span className="text-red-500">
                  *
                </span>
              </Label>


              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Upload className="h-5 w-5" />
                </div>


                {proof ? (
                  <>
                    <p className="mt-4 break-all text-sm font-semibold text-slate-900">
                      {
                        proof.name
                      }
                    </p>


                    <p className="mt-1 text-xs text-slate-500">
                      {(
                        proof.size /
                        1024 /
                        1024
                      ).toFixed(
                        2,
                      )}{" "}
                      MB
                    </p>


                    <p className="mt-3 text-xs font-medium text-blue-600">
                      Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      Upload payment screenshot
                    </p>


                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      JPG, PNG, WEBP or PDF · Maximum 5 MB
                    </p>
                  </>
                )}


                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(
                    event,
                  ) =>
                    setProof(
                      event.target
                        .files?.[0] ??
                      null,
                    )
                  }
                />
              </label>
            </div>


            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-800">
                {
                  settings
                    .request
                    .paymentProofNotice
                }
              </p>
            </div>
          </>
        )}


        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {
              error
            }
          </div>
        )}


        {availableMethods.length >
          0 && (
          <Button
            type="button"
            disabled={
              submitting ||
              !paymentMethod ||
              !proof
            }
            onClick={
              handleSubmit
            }
            className="mt-7 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Submitting Payment...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />

                Submit Payment Proof
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}