"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Check,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Play,
  RefreshCw,
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
  generateRequestPaymentAccess,
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
    warning,
    setWarning,
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
    paymentUrl,
    setPaymentUrl,
  ] =
    useState(
      "",
    );


  const [
    copied,
    setCopied,
  ] =
    useState(
      false,
    );


  const [
    finalized,
    setFinalized,
  ] =
    useState(
      false,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const canStartFree =
    status ===
      "SUBMITTED" &&
    pricingMode ===
      "FREE";


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


  const canGeneratePaymentLink =
    status ===
    "AWAITING_PAYMENT";


  function tokenToUrl(
    token:
      string,
  ) {
    return `${window.location.origin}/pay/${token}`;
  }


  function handleStartFree() {
    setError(
      "",
    );

    setWarning(
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


  function handleFinalizePrice() {
    setError(
      "",
    );

    setWarning(
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


        setFinalized(
          true,
        );


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


        if (
          result.warning
        ) {
          setWarning(
            result.warning,
          );
        }


        if (
          result.paymentToken
        ) {
          setPaymentUrl(
            tokenToUrl(
              result.paymentToken,
            ),
          );
        }


        setNote(
          "",
        );
      },
    );
  }


  function handleGeneratePaymentLink() {
    setError(
      "",
    );

    setWarning(
      "",
    );

    setSuccess(
      "",
    );

    setCopied(
      false,
    );


    startTransition(
      async () => {
        const result =
          await generateRequestPaymentAccess(
            requestId,
          );


        if (
          !result.success ||
          !result.paymentToken
        ) {
          setError(
            result.error ||
            "The payment link could not be generated.",
          );

          return;
        }


        setPaymentUrl(
          tokenToUrl(
            result.paymentToken,
          ),
        );


        setSuccess(
          "Secure customer payment link generated.",
        );
      },
    );
  }


  async function handleCopyPaymentLink() {
    if (
      !paymentUrl
    ) {
      return;
    }


    await navigator.clipboard.writeText(
      paymentUrl,
    );


    setCopied(
      true,
    );


    window.setTimeout(
      () =>
        setCopied(
          false,
        ),
      2000,
    );
  }


  if (
    finalized
  ) {
    return (
      <PaymentLinkPanel
        paymentUrl={
          paymentUrl
        }
        pending={
          pending
        }
        copied={
          copied
        }
        success={
          success
        }
        warning={
          warning
        }
        error={
          error
        }
        onGenerate={
          handleGeneratePaymentLink
        }
        onCopy={
          handleCopyPaymentLink
        }
        onRefresh={() =>
          router.refresh()
        }
      />
    );
  }


  if (
    canGeneratePaymentLink
  ) {
    return (
      <PaymentLinkPanel
        paymentUrl={
          paymentUrl
        }
        pending={
          pending
        }
        copied={
          copied
        }
        success={
          success
        }
        warning={
          warning
        }
        error={
          error
        }
        onGenerate={
          handleGeneratePaymentLink
        }
        onCopy={
          handleCopyPaymentLink
        }
        onRefresh={() =>
          router.refresh()
        }
      />
    );
  }


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
          <Message
            type="error"
            text={
              error
            }
          />
        )}


        {success && (
          <Message
            type="success"
            text={
              success
            }
          />
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


  if (
    canFinalizePrice
  ) {
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
              Review the request and enter the final amount the
              customer must pay.
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
            placeholder="Optional pricing or review note..."
            className="min-h-24 bg-white"
          />
        </div>


        {error && (
          <Message
            type="error"
            text={
              error
            }
          />
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


  return null;
}


// =========================================================
// PAYMENT LINK PANEL
// =========================================================

function PaymentLinkPanel({
  paymentUrl,
  pending,
  copied,
  success,
  warning,
  error,
  onGenerate,
  onCopy,
  onRefresh,
}: {
  paymentUrl:
    string;

  pending:
    boolean;

  copied:
    boolean;

  success:
    string;

  warning:
    string;

  error:
    string;

  onGenerate:
    () => void;

  onCopy:
    () => void;

  onRefresh:
    () => void;
}) {
  return (
    <div className="rounded-[22px] border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Link2 className="h-5 w-5" />
        </div>


        <div>
          <p className="font-semibold text-blue-950">
            Customer Payment Link
          </p>


          <p className="mt-1 text-sm leading-6 text-blue-800">
            Generate a secure link and send it directly to the
            customer by WhatsApp, email or another trusted channel.
          </p>
        </div>
      </div>


      {paymentUrl && (
        <div className="mt-5 rounded-xl border border-blue-200 bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            Secure Payment URL
          </p>


          <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-700">
            {
              paymentUrl
            }
          </p>


          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={
                onCopy
              }
              className="rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />

                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />

                  Copy Link
                </>
              )}
            </Button>


            <a
              href={
                paymentUrl
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />

              Open Link
            </a>
          </div>
        </div>
      )}


      {warning && (
        <Message
          type="warning"
          text={
            warning
          }
        />
      )}


      {error && (
        <Message
          type="error"
          text={
            error
          }
        />
      )}


      {success && (
        <Message
          type="success"
          text={
            success
          }
        />
      )}


      <Button
        type="button"
        disabled={
          pending
        }
        onClick={
          onGenerate
        }
        className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Generating...
          </>
        ) : (
          <>
            <Link2 className="mr-2 h-4 w-4" />

            {paymentUrl
              ? "Regenerate Payment Link"
              : "Generate Payment Link"}
          </>
        )}
      </Button>


      <Button
        type="button"
        variant="outline"
        onClick={
          onRefresh
        }
        className="mt-2 w-full rounded-xl bg-white"
      >
        <RefreshCw className="mr-2 h-4 w-4" />

        Refresh Request
      </Button>


      <p className="mt-4 text-xs leading-5 text-blue-700">
        Regenerating the link immediately invalidates the previous
        payment link.
      </p>
    </div>
  );
}


// =========================================================
// MESSAGE
// =========================================================

function Message({
  type,
  text,
}: {
  type:
    "success"
    | "warning"
    | "error";

  text:
    string;
}) {
  const classes =
    type ===
    "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : type ===
          "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";


  return (
    <div
      className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${classes}`}
    >
      {type ===
        "success" && (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}


      {
        text
      }
    </div>
  );
}