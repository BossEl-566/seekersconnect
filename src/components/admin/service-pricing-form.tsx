"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  BadgeDollarSign,
  CheckCircle2,
  Info,
  Loader2,
  Save,
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
  Textarea,
} from "@/components/ui/textarea";

import {
  updateServicePricing,
} from "@/app/admin/(dashboard)/services/[id]/pricing/actions";

import type {
  ServicePricingCurrency,
  ServicePricingMode,
} from "@/lib/validation/service-pricing";


// =========================================================
// TYPES
// =========================================================

export type ServicePricingRecord = {
  id:
    string | null;

  service_id:
    string;

  pricing_mode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  amount:
    number | null;

  unit_label:
    string | null;

  minimum_quantity:
    number | null;

  maximum_quantity:
    number | null;

  display_note:
    string | null;

  active:
    boolean;
};


type ServicePricingFormProps = {
  serviceId:
    string;

  pricing:
    ServicePricingRecord;
};


// =========================================================
// MODE LABELS
// =========================================================

const pricingModes: {
  value:
    ServicePricingMode;

  label:
    string;

  description:
    string;
}[] = [
  {
    value:
      "FIXED",

    label:
      "Fixed Price",

    description:
      "The service has one exact price.",
  },

  {
    value:
      "PER_UNIT",

    label:
      "Per Unit",

    description:
      "The final amount depends on quantity, such as pages or copies.",
  },

  {
    value:
      "STARTING_FROM",

    label:
      "Starting From",

    description:
      "Show customers the minimum starting price.",
  },

  {
    value:
      "QUOTE_REQUIRED",

    label:
      "Quote Required",

    description:
      "The amount is determined after reviewing the customer's request.",
  },

  {
    value:
      "FREE",

    label:
      "Free / No Charge",

    description:
      "No service payment is required.",
  },

  {
    value:
      "MANUAL_PRICE",

    label:
      "Manual Price",

    description:
      "The administrator communicates the amount manually.",
  },
];


// =========================================================
// COMPONENT
// =========================================================

export function ServicePricingForm({
  serviceId,
  pricing,
}: ServicePricingFormProps) {
  const router =
    useRouter();


  const [
    pricingMode,
    setPricingMode,
  ] =
    useState<ServicePricingMode>(
      pricing.pricing_mode,
    );


  const [
    currency,
    setCurrency,
  ] =
    useState<ServicePricingCurrency>(
      pricing.currency,
    );


  const [
    amount,
    setAmount,
  ] =
    useState(
      pricing.amount ===
      null
        ? ""
        : String(
            pricing.amount,
          ),
    );


  const [
    unitLabel,
    setUnitLabel,
  ] =
    useState(
      pricing.unit_label ??
        "",
    );


  const [
    minimumQuantity,
    setMinimumQuantity,
  ] =
    useState(
      pricing.minimum_quantity ===
      null
        ? ""
        : String(
            pricing.minimum_quantity,
          ),
    );


  const [
    maximumQuantity,
    setMaximumQuantity,
  ] =
    useState(
      pricing.maximum_quantity ===
      null
        ? ""
        : String(
            pricing.maximum_quantity,
          ),
    );


  const [
    displayNote,
    setDisplayNote,
  ] =
    useState(
      pricing.display_note ??
        "",
    );


  const [
    active,
    setActive,
  ] =
    useState(
      pricing.active,
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    success,
    setSuccess,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const amountRequired =
    pricingMode ===
      "FIXED" ||
    pricingMode ===
      "PER_UNIT" ||
    pricingMode ===
      "STARTING_FROM";


  const perUnit =
    pricingMode ===
    "PER_UNIT";


  const free =
    pricingMode ===
    "FREE";


  // =======================================================
  // SAVE
  // =======================================================

  function handleSave() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        const result =
          await updateServicePricing(
            serviceId,
            {
              pricingMode,

              currency,

              amount:
                toNullableNumber(
                  amount,
                ),

              unitLabel,

              minimumQuantity:
                perUnit
                  ? toNullableNumber(
                      minimumQuantity,
                    )
                  : null,

              maximumQuantity:
                perUnit
                  ? toNullableNumber(
                      maximumQuantity,
                    )
                  : null,

              displayNote,

              active,
            },
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setSuccess(
          "Pricing updated successfully.",
        );


        router.refresh();
      },
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="space-y-6">
      {/* ===============================================
          CURRENT PREVIEW
      =============================================== */}

      <div className="rounded-[24px] border border-blue-100 bg-blue-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BadgeDollarSign className="h-5 w-5" />
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Customer Price Preview
            </p>


            <p className="mt-2 text-2xl font-semibold tracking-tight text-blue-950">
              {formatPricingPreview({
                pricingMode,
                currency,
                amount,
                unitLabel,
              })}
            </p>


            {displayNote && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-800">
                {
                  displayNote
                }
              </p>
            )}
          </div>
        </div>
      </div>


      {/* ===============================================
          PRICING CONFIGURATION
      =============================================== */}

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Pricing Configuration
          </h2>


          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Configure how this service should be priced. Pricing
            changes apply to future requests; request snapshots will
            preserve the price that applied when a request was made.
          </p>
        </div>


        {/* =============================================
            PRICING MODE
        ============================================= */}

        <div className="mt-7 space-y-2">
          <Label htmlFor="pricingMode">
            Pricing Mode
          </Label>


          <select
            id="pricingMode"
            value={
              pricingMode
            }
            onChange={(
              event,
            ) =>
              setPricingMode(
                event.target
                  .value as ServicePricingMode,
              )
            }
            disabled={
              pending
            }
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {pricingModes.map(
              (
                mode,
              ) => (
                <option
                  key={
                    mode.value
                  }
                  value={
                    mode.value
                  }
                >
                  {
                    mode.label
                  }
                </option>
              ),
            )}
          </select>


          <p className="text-xs leading-5 text-slate-400">
            {
              pricingModes.find(
                (
                  mode,
                ) =>
                  mode.value ===
                  pricingMode,
              )?.description
            }
          </p>
        </div>


        {/* =============================================
            CURRENCY + AMOUNT
        ============================================= */}

        {!free && (
          <div
            className={`mt-6 grid gap-5 ${
              amountRequired
                ? "md:grid-cols-2"
                : ""
            }`}
          >
            <div className="space-y-2">
              <Label htmlFor="pricingCurrency">
                Currency
              </Label>


              <select
                id="pricingCurrency"
                value={
                  currency
                }
                onChange={(
                  event,
                ) =>
                  setCurrency(
                    event.target
                      .value as ServicePricingCurrency,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="GHS">
                  GHS — Ghana Cedi
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>
              </select>


              {(pricingMode ===
                "QUOTE_REQUIRED" ||
                pricingMode ===
                  "MANUAL_PRICE") && (
                <p className="text-xs leading-5 text-slate-400">
                  This is the currency in which the eventual amount
                  will normally be quoted or communicated.
                </p>
              )}
            </div>


            {amountRequired && (
              <div className="space-y-2">
                <Label htmlFor="pricingAmount">
                  {pricingMode ===
                  "PER_UNIT"
                    ? "Price Per Unit"
                    : pricingMode ===
                        "STARTING_FROM"
                      ? "Starting Amount"
                      : "Amount"}
                </Label>


                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    {
                      currency
                    }
                  </span>


                  <Input
                    id="pricingAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      amount
                    }
                    onChange={(
                      event,
                    ) =>
                      setAmount(
                        event.target.value,
                      )
                    }
                    disabled={
                      pending
                    }
                    placeholder="0.00"
                    className="pl-14"
                  />
                </div>
              </div>
            )}
          </div>
        )}


        {/* =============================================
            FREE
        ============================================= */}

        {free && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-900">
              Free Service
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              The amount will automatically be stored as zero and the
              customer will not be charged a service fee once the
              public payment workflow is connected to the pricing
              engine.
            </p>
          </div>
        )}


        {/* =============================================
            PER UNIT
        ============================================= */}

        {perUnit && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="font-semibold text-slate-900">
              Per-Unit Configuration
            </h3>


            <p className="mt-1 text-sm leading-6 text-slate-500">
              Define what one unit represents and optionally constrain
              the supported quantity range.
            </p>


            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pricingUnit">
                  Unit
                </Label>


                <Input
                  id="pricingUnit"
                  value={
                    unitLabel
                  }
                  onChange={(
                    event,
                  ) =>
                    setUnitLabel(
                      event.target.value,
                    )
                  }
                  disabled={
                    pending
                  }
                  placeholder="page, copy, item..."
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="minimumQuantity">
                  Minimum Quantity
                </Label>


                <Input
                  id="minimumQuantity"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    minimumQuantity
                  }
                  onChange={(
                    event,
                  ) =>
                    setMinimumQuantity(
                      event.target.value,
                    )
                  }
                  disabled={
                    pending
                  }
                  placeholder="Optional"
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="maximumQuantity">
                  Maximum Quantity
                </Label>


                <Input
                  id="maximumQuantity"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    maximumQuantity
                  }
                  onChange={(
                    event,
                  ) =>
                    setMaximumQuantity(
                      event.target.value,
                    )
                  }
                  disabled={
                    pending
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        )}


        {/* =============================================
            DISPLAY NOTE
        ============================================= */}

        <div className="mt-6 space-y-2">
          <Label htmlFor="pricingDisplayNote">
            Customer-Facing Pricing Note
          </Label>


          <Textarea
            id="pricingDisplayNote"
            value={
              displayNote
            }
            onChange={(
              event,
            ) =>
              setDisplayNote(
                event.target.value,
              )
            }
            disabled={
              pending
            }
            placeholder="Optional note about what the price includes, exclusions, conditions or quantity rules..."
            className="min-h-24"
          />


          <p className="text-xs leading-5 text-slate-400">
            Keep this concise. This text can later be shown beside the
            price in the public request flow.
          </p>
        </div>


        {/* =============================================
            ACTIVE
        ============================================= */}

        <div className="mt-6 space-y-2">
          <Label>
            Pricing Status
          </Label>


          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={
                active
              }
              onChange={(
                event,
              ) =>
                setActive(
                  event.target.checked,
                )
              }
              disabled={
                pending
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />


            <div>
              <p className="text-sm font-medium text-slate-800">
                Pricing configuration active
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Disable this only when pricing for this service should
                temporarily not be published.
              </p>
            </div>
          </label>
        </div>


        {/* =============================================
            INFORMATION
        ============================================= */}

        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />


          <p className="text-sm leading-6 text-amber-800">
            Updating this configuration does not retroactively change
            prices stored on existing customer requests. The request
            pricing snapshot will preserve historical pricing once the
            public pricing workflow is activated.
          </p>
        </div>


        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {
              error
            }
          </div>
        )}


        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />

            {
              success
            }
          </div>
        )}


        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              pending
            }
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />

                Save Pricing
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


// =========================================================
// HELPERS
// =========================================================

function toNullableNumber(
  value:
    string,
) {
  const trimmed =
    value.trim();


  if (
    !trimmed
  ) {
    return null;
  }


  return Number(
    trimmed,
  );
}


function formatPricingPreview({
  pricingMode,
  currency,
  amount,
  unitLabel,
}: {
  pricingMode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  amount:
    string;

  unitLabel:
    string;
}) {
  const numericAmount =
    Number(
      amount,
    );


  const formattedAmount =
    Number.isFinite(
      numericAmount,
    ) &&
    amount.trim()
      ? `${currency} ${numericAmount.toFixed(2)}`
      : `${currency} —`;


  switch (
    pricingMode
  ) {
    case "FIXED":
      return formattedAmount;


    case "PER_UNIT":
      return `${formattedAmount} per ${
        unitLabel.trim() ||
        "unit"
      }`;


    case "STARTING_FROM":
      return `From ${formattedAmount}`;


    case "QUOTE_REQUIRED":
      return `Quote required · ${currency}`;


    case "FREE":
      return "Free";


    case "MANUAL_PRICE":
      return `Price confirmed manually · ${currency}`;


    default:
      return "Pricing not configured";
  }
}