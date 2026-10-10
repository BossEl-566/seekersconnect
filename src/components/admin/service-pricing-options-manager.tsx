"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
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
  createPricingOption,
  createPricingTier,
  deletePricingOption,
  deletePricingTier,
  setPricingOptionActive,
  setPricingTierActive,
  updatePricingOption,
  updatePricingTier,
} from "@/app/admin/(dashboard)/services/[id]/pricing/option-actions";

import type {
  ServicePricingCurrency,
  ServicePricingMode,
} from "@/lib/validation/service-pricing";


// =========================================================
// TYPES
// =========================================================

export type ServicePricingTierRecord = {
  id:
    string;

  pricing_option_id:
    string;

  label:
    string | null;

  amount:
    number;

  minimum_quantity:
    number | null;

  maximum_quantity:
    number | null;

  display_order:
    number;

  active:
    boolean;
};


export type ServicePricingOptionRecord = {
  id:
    string;

  service_pricing_id:
    string;

  code:
    string;

  label:
    string;

  description:
    string | null;

  unit_label:
    string | null;

  display_order:
    number;

  active:
    boolean;

  tiers:
    ServicePricingTierRecord[];
};


type Props = {
  serviceId:
    string;

  servicePricingId:
    string | null;

  pricingMode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  parentUnitLabel:
    string | null;

  options:
    ServicePricingOptionRecord[];
};


// =========================================================
// MANAGER
// =========================================================

export function ServicePricingOptionsManager({
  serviceId,
  servicePricingId,
  pricingMode,
  currency,
  parentUnitLabel,
  options,
}: Props) {
  const [
    addingOption,
    setAddingOption,
  ] =
    useState(
      false,
    );


  const supportsOptions =
    pricingMode ===
      "FIXED" ||
    pricingMode ===
      "PER_UNIT" ||
    pricingMode ===
      "STARTING_FROM";


  const nextDisplayOrder =
    options.length ===
      0
      ? 0
      : Math.max(
          ...options.map(
            (
              option,
            ) =>
              option.display_order,
          ),
        ) +
        10;


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers3 className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-semibold text-slate-950">
              Pricing Options & Tiers
            </h2>
          </div>


          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Add selectable pricing variants and, for per-unit
            services, quantity-based price bands.
          </p>
        </div>


        {supportsOptions &&
          servicePricingId && (
          <Button
            type="button"
            onClick={() =>
              setAddingOption(
                true,
              )
            }
            disabled={
              addingOption
            }
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />

            Add Pricing Option
          </Button>
        )}
      </div>


      {!servicePricingId && (
        <Notice>
          Save the main pricing configuration first. Once the pricing
          record exists, pricing options can be created.
        </Notice>
      )}


      {servicePricingId &&
        !supportsOptions && (
        <Notice>
          Pricing options are only available for Fixed Price, Per Unit
          and Starting From pricing modes.
        </Notice>
      )}


      {supportsOptions &&
        servicePricingId && (
        <>
          {addingOption && (
            <div className="mt-6">
              <AddOptionForm
                serviceId={
                  serviceId
                }
                pricingMode={
                  pricingMode
                }
                parentUnitLabel={
                  parentUnitLabel
                }
                defaultDisplayOrder={
                  nextDisplayOrder
                }
                onCancel={() =>
                  setAddingOption(
                    false,
                  )
                }
              />
            </div>
          )}


          <div className="mt-6 space-y-5">
            {options.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <Layers3 className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-4 font-semibold text-slate-800">
                  No pricing options yet
                </p>


                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  The service will continue using its existing default
                  price until you add pricing options.
                </p>
              </div>
            ) : (
              options.map(
                (
                  option,
                ) => (
                  <PricingOptionCard
                    key={
                      option.id
                    }
                    serviceId={
                      serviceId
                    }
                    option={
                      option
                    }
                    pricingMode={
                      pricingMode
                    }
                    currency={
                      currency
                    }
                    parentUnitLabel={
                      parentUnitLabel
                    }
                  />
                ),
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}


// =========================================================
// ADD OPTION
// =========================================================

function AddOptionForm({
  serviceId,
  pricingMode,
  parentUnitLabel,
  defaultDisplayOrder,
  onCancel,
}: {
  serviceId:
    string;

  pricingMode:
    ServicePricingMode;

  parentUnitLabel:
    string | null;

  defaultDisplayOrder:
    number;

  onCancel:
    () => void;
}) {
  const router =
    useRouter();


  const [
    label,
    setLabel,
  ] =
    useState(
      "",
    );


  const [
    code,
    setCode,
  ] =
    useState(
      "",
    );


  const [
    description,
    setDescription,
  ] =
    useState(
      "",
    );


  const [
    unitLabel,
    setUnitLabel,
  ] =
    useState(
      parentUnitLabel ??
      "",
    );


  const [
    displayOrder,
    setDisplayOrder,
  ] =
    useState(
      String(
        defaultDisplayOrder,
      ),
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function save() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await createPricingOption(
            serviceId,
            {
              label,

              code,

              description,

              unitLabel:
                pricingMode ===
                "PER_UNIT"
                  ? unitLabel
                  : "",

              displayOrder:
                toInteger(
                  displayOrder,
                  0,
                ),

              active:
                true,
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


        onCancel();

        router.refresh();
      },
    );
  }


  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-blue-950">
            New Pricing Option
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Examples: Black & White, Colour, Standard, Express.
          </p>
        </div>


        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={
            onCancel
          }
          disabled={
            pending
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </div>


      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field
          label="Option Name"
          value={
            label
          }
          onChange={
            setLabel
          }
          placeholder="Black & White"
        />


        <Field
          label="Option Code"
          value={
            code
          }
          onChange={
            setCode
          }
          placeholder="Leave blank to generate automatically"
        />


        {pricingMode ===
          "PER_UNIT" && (
          <Field
            label="Unit"
            value={
              unitLabel
            }
            onChange={
              setUnitLabel
            }
            placeholder="page"
          />
        )}


        <Field
          label="Display Order"
          type="number"
          value={
            displayOrder
          }
          onChange={
            setDisplayOrder
          }
          placeholder="0"
        />
      </div>


      <div className="mt-4 space-y-2">
        <Label>
          Description
        </Label>

        <Textarea
          value={
            description
          }
          onChange={(
            event,
          ) =>
            setDescription(
              event.target.value,
            )
          }
          placeholder="Optional customer-facing explanation..."
          className="min-h-20 bg-white"
        />
      </div>


      {error && (
        <ErrorBox
          message={
            error
          }
        />
      )}


      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={
            onCancel
          }
          disabled={
            pending
          }
        >
          Cancel
        </Button>


        <Button
          type="button"
          onClick={
            save
          }
          disabled={
            pending ||
            !label.trim()
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}

          Create Option
        </Button>
      </div>
    </div>
  );
}


// =========================================================
// OPTION CARD
// =========================================================

function PricingOptionCard({
  serviceId,
  option,
  pricingMode,
  currency,
  parentUnitLabel,
}: {
  serviceId:
    string;

  option:
    ServicePricingOptionRecord;

  pricingMode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  parentUnitLabel:
    string | null;
}) {
  const router =
    useRouter();


  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );


  const [
    addingTier,
    setAddingTier,
  ] =
    useState(
      false,
    );


  const [
    label,
    setLabel,
  ] =
    useState(
      option.label,
    );


  const [
    code,
    setCode,
  ] =
    useState(
      option.code,
    );


  const [
    description,
    setDescription,
  ] =
    useState(
      option.description ??
      "",
    );


  const [
    unitLabel,
    setUnitLabel,
  ] =
    useState(
      option.unit_label ??
      parentUnitLabel ??
      "",
    );


  const [
    displayOrder,
    setDisplayOrder,
  ] =
    useState(
      String(
        option.display_order,
      ),
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const nextTierDisplayOrder =
    option.tiers.length ===
      0
      ? 0
      : Math.max(
          ...option.tiers.map(
            (
              tier,
            ) =>
              tier.display_order,
          ),
        ) +
        10;


  function saveOption() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await updatePricingOption(
            serviceId,
            option.id,
            {
              label,

              code,

              description,

              unitLabel:
                pricingMode ===
                "PER_UNIT"
                  ? unitLabel
                  : "",

              displayOrder:
                toInteger(
                  displayOrder,
                  option.display_order,
                ),

              active:
                option.active,
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


        setEditing(
          false,
        );

        router.refresh();
      },
    );
  }


  function toggleActive() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await setPricingOptionActive(
            serviceId,
            option.id,
            !option.active,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  function removeOption() {
    if (
      !window.confirm(
        `Delete "${option.label}" and all of its pricing tiers? Existing request snapshots will not be deleted.`,
      )
    ) {
      return;
    }


    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await deletePricingOption(
            serviceId,
            option.id,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  return (
    <div
      className={`rounded-2xl border p-5 ${
        option.active
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-75"
      }`}
    >
      {editing ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Option Name"
              value={
                label
              }
              onChange={
                setLabel
              }
            />


            <Field
              label="Option Code"
              value={
                code
              }
              onChange={
                setCode
              }
            />


            {pricingMode ===
              "PER_UNIT" && (
              <Field
                label="Unit"
                value={
                  unitLabel
                }
                onChange={
                  setUnitLabel
                }
              />
            )}


            <Field
              label="Display Order"
              type="number"
              value={
                displayOrder
              }
              onChange={
                setDisplayOrder
              }
            />
          </div>


          <div className="mt-4 space-y-2">
            <Label>
              Description
            </Label>

            <Textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              className="min-h-20"
            />
          </div>


          {error && (
            <ErrorBox
              message={
                error
              }
            />
          )}


          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setEditing(
                  false,
                )
              }
              disabled={
                pending
              }
            >
              Cancel
            </Button>


            <Button
              type="button"
              onClick={
                saveOption
              }
              disabled={
                pending ||
                !label.trim()
              }
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              Save Option
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-950">
                  {
                    option.label
                  }
                </h3>


                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    option.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {option.active
                    ? "Active"
                    : "Disabled"}
                </span>


                <span className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-500">
                  {
                    option.code
                  }
                </span>
              </div>


              {option.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {
                    option.description
                  }
                </p>
              )}


              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                {pricingMode ===
                  "PER_UNIT" && (
                  <span>
                    Unit:{" "}
                    <strong className="text-slate-600">
                      {
                        option.unit_label ??
                        parentUnitLabel ??
                        "unit"
                      }
                    </strong>
                  </span>
                )}


                <span>
                  Order:{" "}
                  <strong className="text-slate-600">
                    {
                      option.display_order
                    }
                  </strong>
                </span>


                <span>
                  {
                    option.tiers.length
                  }{" "}
                  {option.tiers.length ===
                  1
                    ? "tier"
                    : "tiers"}
                </span>
              </div>
            </div>


            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditing(
                    true,
                  )
                }
                disabled={
                  pending
                }
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />

                Edit
              </Button>


              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                  toggleActive
                }
                disabled={
                  pending
                }
              >
                {pending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Power className="mr-2 h-3.5 w-3.5" />
                )}

                {option.active
                  ? "Disable"
                  : "Enable"}
              </Button>


              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                  removeOption
                }
                disabled={
                  pending
                }
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />

                Delete
              </Button>
            </div>
          </div>


          {error && (
            <ErrorBox
              message={
                error
              }
            />
          )}


          {/* TIERS */}

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Price Tiers
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {pricingMode ===
                  "PER_UNIT"
                    ? "Quantity ranges must not overlap."
                    : "Only one active price is allowed for this option."}
                </p>
              </div>


              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddingTier(
                    true,
                  )
                }
                disabled={
                  addingTier
                }
              >
                <Plus className="mr-2 h-3.5 w-3.5" />

                Add Tier
              </Button>
            </div>


            {addingTier && (
              <div className="mt-4">
                <AddTierForm
                  serviceId={
                    serviceId
                  }
                  optionId={
                    option.id
                  }
                  pricingMode={
                    pricingMode
                  }
                  currency={
                    currency
                  }
                  unitLabel={
                    option.unit_label ??
                    parentUnitLabel
                  }
                  defaultDisplayOrder={
                    nextTierDisplayOrder
                  }
                  onCancel={() =>
                    setAddingTier(
                      false,
                    )
                  }
                />
              </div>
            )}


            <div className="mt-4 space-y-3">
              {option.tiers.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No price tiers have been added.
                </div>
              ) : (
                option.tiers.map(
                  (
                    tier,
                  ) => (
                    <PricingTierCard
                      key={
                        tier.id
                      }
                      serviceId={
                        serviceId
                      }
                      optionId={
                        option.id
                      }
                      tier={
                        tier
                      }
                      pricingMode={
                        pricingMode
                      }
                      currency={
                        currency
                      }
                      unitLabel={
                        option.unit_label ??
                        parentUnitLabel
                      }
                    />
                  ),
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// =========================================================
// ADD TIER
// =========================================================

function AddTierForm({
  serviceId,
  optionId,
  pricingMode,
  currency,
  unitLabel,
  defaultDisplayOrder,
  onCancel,
}: {
  serviceId:
    string;

  optionId:
    string;

  pricingMode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  unitLabel:
    string | null;

  defaultDisplayOrder:
    number;

  onCancel:
    () => void;
}) {
  const router =
    useRouter();


  const [
    label,
    setLabel,
  ] =
    useState(
      "",
    );


  const [
    amount,
    setAmount,
  ] =
    useState(
      "",
    );


  const [
    minimum,
    setMinimum,
  ] =
    useState(
      pricingMode ===
      "PER_UNIT"
        ? "1"
        : "",
    );


  const [
    maximum,
    setMaximum,
  ] =
    useState(
      "",
    );


  const [
    order,
    setOrder,
  ] =
    useState(
      String(
        defaultDisplayOrder,
      ),
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function save() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await createPricingTier(
            serviceId,
            optionId,
            {
              label,

              amount:
                Number(
                  amount,
                ),

              minimumQuantity:
                pricingMode ===
                "PER_UNIT"
                  ? toNullableNumber(
                      minimum,
                    )
                  : null,

              maximumQuantity:
                pricingMode ===
                "PER_UNIT"
                  ? toNullableNumber(
                      maximum,
                    )
                  : null,

              displayOrder:
                toInteger(
                  order,
                  0,
                ),

              active:
                true,
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


        onCancel();

        router.refresh();
      },
    );
  }


  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-blue-950">
          New Price Tier
        </p>


        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={
            onCancel
          }
          disabled={
            pending
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </div>


      <div
        className={`mt-4 grid gap-4 ${
          pricingMode ===
          "PER_UNIT"
            ? "md:grid-cols-2 xl:grid-cols-4"
            : "md:grid-cols-3"
        }`}
      >
        <Field
          label="Tier Name"
          value={
            label
          }
          onChange={
            setLabel
          }
          placeholder={
            pricingMode ===
            "PER_UNIT"
              ? "Standard / Bulk"
              : "Optional"
          }
        />


        <Field
          label={`Price (${currency})`}
          type="number"
          value={
            amount
          }
          onChange={
            setAmount
          }
          placeholder="0.00"
        />


        {pricingMode ===
          "PER_UNIT" && (
          <>
            <Field
              label="Minimum Quantity"
              type="number"
              value={
                minimum
              }
              onChange={
                setMinimum
              }
              placeholder="1"
            />


            <Field
              label="Maximum Quantity"
              type="number"
              value={
                maximum
              }
              onChange={
                setMaximum
              }
              placeholder="Blank = no maximum"
            />
          </>
        )}


        <Field
          label="Display Order"
          type="number"
          value={
            order
          }
          onChange={
            setOrder
          }
        />
      </div>


      {pricingMode ===
        "PER_UNIT" && (
        <p className="mt-3 text-xs text-blue-700">
          Amount is charged per{" "}
          {
            unitLabel ||
            "unit"
          }
          .
        </p>
      )}


      {error && (
        <ErrorBox
          message={
            error
          }
        />
      )}


      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={
            onCancel
          }
          disabled={
            pending
          }
        >
          Cancel
        </Button>


        <Button
          type="button"
          onClick={
            save
          }
          disabled={
            pending ||
            !amount.trim()
          }
          className="bg-blue-600 hover:bg-blue-700"
        >
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}

          Add Tier
        </Button>
      </div>
    </div>
  );
}


// =========================================================
// TIER CARD
// =========================================================

function PricingTierCard({
  serviceId,
  optionId,
  tier,
  pricingMode,
  currency,
  unitLabel,
}: {
  serviceId:
    string;

  optionId:
    string;

  tier:
    ServicePricingTierRecord;

  pricingMode:
    ServicePricingMode;

  currency:
    ServicePricingCurrency;

  unitLabel:
    string | null;
}) {
  const router =
    useRouter();


  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );


  const [
    label,
    setLabel,
  ] =
    useState(
      tier.label ??
      "",
    );


  const [
    amount,
    setAmount,
  ] =
    useState(
      String(
        tier.amount,
      ),
    );


  const [
    minimum,
    setMinimum,
  ] =
    useState(
      tier.minimum_quantity ===
      null
        ? ""
        : String(
            tier.minimum_quantity,
          ),
    );


  const [
    maximum,
    setMaximum,
  ] =
    useState(
      tier.maximum_quantity ===
      null
        ? ""
        : String(
            tier.maximum_quantity,
          ),
    );


  const [
    order,
    setOrder,
  ] =
    useState(
      String(
        tier.display_order,
      ),
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function save() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await updatePricingTier(
            serviceId,
            optionId,
            tier.id,
            {
              label,

              amount:
                Number(
                  amount,
                ),

              minimumQuantity:
                pricingMode ===
                "PER_UNIT"
                  ? toNullableNumber(
                      minimum,
                    )
                  : null,

              maximumQuantity:
                pricingMode ===
                "PER_UNIT"
                  ? toNullableNumber(
                      maximum,
                    )
                  : null,

              displayOrder:
                toInteger(
                  order,
                  tier.display_order,
                ),

              active:
                tier.active,
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


        setEditing(
          false,
        );

        router.refresh();
      },
    );
  }


  function toggleActive() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await setPricingTierActive(
            serviceId,
            optionId,
            tier.id,
            !tier.active,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  function remove() {
    if (
      !window.confirm(
        "Delete this pricing tier?",
      )
    ) {
      return;
    }


    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await deletePricingTier(
            serviceId,
            optionId,
            tier.id,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  if (
    editing
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div
          className={`grid gap-4 ${
            pricingMode ===
            "PER_UNIT"
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-3"
          }`}
        >
          <Field
            label="Tier Name"
            value={
              label
            }
            onChange={
              setLabel
            }
          />


          <Field
            label={`Price (${currency})`}
            type="number"
            value={
              amount
            }
            onChange={
              setAmount
            }
          />


          {pricingMode ===
            "PER_UNIT" && (
            <>
              <Field
                label="Minimum Quantity"
                type="number"
                value={
                  minimum
                }
                onChange={
                  setMinimum
                }
              />


              <Field
                label="Maximum Quantity"
                type="number"
                value={
                  maximum
                }
                onChange={
                  setMaximum
                }
                placeholder="Blank = no maximum"
              />
            </>
          )}


          <Field
            label="Display Order"
            type="number"
            value={
              order
            }
            onChange={
              setOrder
            }
          />
        </div>


        {error && (
          <ErrorBox
            message={
              error
            }
          />
        )}


        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setEditing(
                false,
              )
            }
            disabled={
              pending
            }
          >
            Cancel
          </Button>


          <Button
            type="button"
            size="sm"
            onClick={
              save
            }
            disabled={
              pending ||
              !amount.trim()
            }
          >
            {pending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}

            Save
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        tier.active
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {
                tier.label ||
                defaultTierLabel(
                  pricingMode,
                  tier,
                )
              }
            </p>


            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                tier.active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tier.active
                ? "Active"
                : "Disabled"}
            </span>
          </div>


          <p className="mt-1 text-sm font-semibold text-blue-700">
            {currency}{" "}
            {tier.amount.toFixed(
              2,
            )}

            {pricingMode ===
              "PER_UNIT" && (
              <>
                {" "}
                per{" "}
                {
                  unitLabel ||
                  "unit"
                }
              </>
            )}
          </p>


          {pricingMode ===
            "PER_UNIT" && (
            <p className="mt-1 text-xs text-slate-500">
              Quantity:{" "}
              {
                formatQuantityRange(
                  tier.minimum_quantity,
                  tier.maximum_quantity,
                )
              }
            </p>
          )}


          <p className="mt-1 text-[11px] text-slate-400">
            Display order:{" "}
            {
              tier.display_order
            }
          </p>
        </div>


        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setEditing(
                true,
              )
            }
            disabled={
              pending
            }
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />

            Edit
          </Button>


          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={
              toggleActive
            }
            disabled={
              pending
            }
          >
            {pending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Power className="mr-2 h-3.5 w-3.5" />
            )}

            {tier.active
              ? "Disable"
              : "Enable"}
          </Button>


          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={
              remove
            }
            disabled={
              pending
            }
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />

            Delete
          </Button>
        </div>
      </div>


      {error && (
        <ErrorBox
          message={
            error
          }
        />
      )}
    </div>
  );
}


// =========================================================
// SMALL COMPONENTS
// =========================================================

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label:
    string;

  type?:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;

  placeholder?:
    string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {
          label
        }
      </Label>


      <Input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
      />
    </div>
  );
}


function Notice({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
      {
        children
      }
    </div>
  );
}


function ErrorBox({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {
        message
      }
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


  const number =
    Number(
      trimmed,
    );


  return Number.isFinite(
    number,
  )
    ? number
    : null;
}


function toInteger(
  value:
    string,

  fallback:
    number,
) {
  const number =
    Number(
      value,
    );


  return Number.isInteger(
    number,
  )
    ? number
    : fallback;
}


function formatQuantityRange(
  minimum:
    number | null,

  maximum:
    number | null,
) {
  if (
    minimum ===
      null &&
    maximum ===
      null
  ) {
    return "All quantities";
  }


  if (
    minimum !==
      null &&
    maximum ===
      null
  ) {
    return `${minimum}+`;
  }


  if (
    minimum ===
      null &&
    maximum !==
      null
  ) {
    return `Up to ${maximum}`;
  }


  return `${minimum} - ${maximum}`;
}


function defaultTierLabel(
  mode:
    ServicePricingMode,

  tier:
    ServicePricingTierRecord,
) {
  if (
    mode ===
    "PER_UNIT"
  ) {
    return formatQuantityRange(
      tier.minimum_quantity,
      tier.maximum_quantity,
    );
  }


  if (
    mode ===
    "STARTING_FROM"
  ) {
    return "Starting Price";
  }


  return "Price";
}