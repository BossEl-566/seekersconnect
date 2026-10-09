"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  Play,
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
  finalizeVariableRequestPrice,
  startFreeRequestProcessing,
} from "@/app/admin/(dashboard)/requests/pricing-actions";


type RequestPriceActionsProps = {
  requestId:
    string;

  status:
    string;

  pricingMode:
    string;

  currency:
    string;

  startingAmount:
    number
    | null;
};


// =========================================================
// COMPONENT
// =========================================================

export function RequestPriceActions({
  requestId,
  status,
  pricingMode,
  currency,
  startingAmount,
}: RequestPriceActionsProps) {
  const router =
    useRouter();


  const [
    amount,
    setAmount,
  ] =
    useState(
      pricingMode ===
        "STARTING_FROM" &&
      startingAmount !==
        null
        ? String(
            startingAmount,
          )
        : "",
    );


  const [
    note,
    setNote,
  ] =
    useState(
      "",
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


  // =======================================================
  // FREE REQUEST
  // =======================================================

  const canStartFree =
    status ===
      "SUBMITTED" &&
    pricingMode ===
      "FREE";


  // =======================================================
  // VARIABLE PRICE
  // =======================================================

  const canFinalizePrice =
    status ===
      "AWAITING_QUOTE" &&
    [
      "QUOTE_REQUIRED",
      "STARTING_FROM",
      "MANUAL_PRICE",
    ].includes(
      pricingMode,
    );


  // =======================================================
  // NOTHING TO DO
  // =======================================================

  if (
    !canStartFree &&
    !canFinalizePrice
  ) {
    return null;
  }


  // =======================================================
  // FREE HANDLER
  // =======================================================

  function handleStartFree() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        const result =
          await startFreeRequestProcessing(
            requestId,
            note,
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
          "Free request moved to processing.",
        );


        setNote(
          "",
        );


        router.refresh();
      },
    );
  }


  // =======================================================
  // QUOTE HANDLER
  // =======================================================

  function handleFinalizePrice() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    const numericAmount =
      Number(
        amount,
      );


    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <=
        0
    ) {
      setError(
        "Enter a valid amount greater than zero.",
      );

      return;
    }


    if (
      pricingMode ===
        "STARTING_FROM" &&
      startingAmount !==
        null &&
      numericAmount <
        startingAmount
    ) {
      setError(
        `The final amount cannot be lower than ${currency} ${startingAmount.toFixed(
          2,
        )}.`,
      );

      return;
    }


    startTransition(
      async () => {
        const result =
          await finalizeVariableRequestPrice(
            requestId,
            amount,
            note,
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
          `Price finalized at ${
            result.currency ??
            currency
          } ${
            result.amount?.toFixed(
              2,
            ) ??
            numericAmount.toFixed(
              2,
            )
          }.`,
        );


        setNote(
          "",
        );


        router.refresh();
      },
    );
  }


  // =======================================================
  // FREE UI
  // =======================================================

  if (
    canStartFree
  ) {
    return (
      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Play className="h-5 w-5" />
          </div>


          <div>
            <p className="font-semibold text-emerald-950">
              Free Service Request
            </p>


            <p className="mt-1 text-sm leading-6 text-emerald-800">
              No payment is required for this request. You can begin
              processing it immediately.
            </p>
          </div>
        </div>


        <div className="mt-5 space-y-2">
          <Label htmlFor="freeRequestNote">
            Internal Note{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>
          </Label>


          <Textarea
            id="freeRequestNote"
            value={
              note
            }
            onChange={(
              event,
            ) =>
              setNote(
                event.target.value,
              )
            }
            disabled={
              pending
            }
            placeholder="Add an internal note before starting..."
            className="min-h-24 bg-white"
          />
        </div>


        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {
              error
            }
          </div>
        )}


        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />

            {
              success
            }
          </div>
        )}


        <Button
          type="button"
          disabled={
            pending
          }
          onClick={
            handleStartFree
          }
          className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />

              Start Processing
            </>
          )}
        </Button>
      </div>
    );
  }


  // =======================================================
  // QUOTE UI
  // =======================================================

  return (
    <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <CircleDollarSign className="h-5 w-5" />
        </div>


        <div>
          <p className="font-semibold text-amber-950">
            Finalize Customer Price
          </p>


          <p className="mt-1 text-sm leading-6 text-amber-800">
            Review the customer&apos;s request and enter the final
            amount that must be paid.
          </p>
        </div>
      </div>


      {pricingMode ===
        "STARTING_FROM" &&
        startingAmount !==
          null && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Advertised Starting Price
          </p>


          <p className="mt-1 text-lg font-semibold text-slate-950">
            {currency}{" "}
            {startingAmount.toFixed(
              2,
            )}
          </p>


          <p className="mt-1 text-xs text-slate-500">
            The final amount cannot be below this price.
          </p>
        </div>
      )}


      <div className="mt-5 space-y-2">
        <Label htmlFor="finalRequestAmount">
          Final Amount
        </Label>


        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            {
              currency
            }
          </span>


          <Input
            id="finalRequestAmount"
            type="number"
            min={
              startingAmount ??
              0.01
            }
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
            className="bg-white pl-14"
          />
        </div>
      </div>


      <div className="mt-5 space-y-2">
        <Label htmlFor="quoteInternalNote">
          Internal Note{" "}
          <span className="font-normal text-slate-400">
            (optional)
          </span>
        </Label>


        <Textarea
          id="quoteInternalNote"
          value={
            note
          }
          onChange={(
            event,
          ) =>
            setNote(
              event.target.value,
            )
          }
          disabled={
            pending
          }
          placeholder="Optional pricing or review note for administrators..."
          className="min-h-24 bg-white"
        />


        <p className="text-xs leading-5 text-amber-700">
          This internal note is not exposed on the public tracking
          page.
        </p>
      </div>


      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {
            error
          }
        </div>
      )}


      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />

          {
            success
          }
        </div>
      )}


      <Button
        type="button"
        disabled={
          pending ||
          !amount
        }
        onClick={
          handleFinalizePrice
        }
        className="mt-5 w-full rounded-xl bg-amber-600 hover:bg-amber-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Finalizing...
          </>
        ) : (
          <>
            <CircleDollarSign className="mr-2 h-4 w-4" />

            Confirm Final Price
          </>
        )}
      </Button>
    </div>
  );
}