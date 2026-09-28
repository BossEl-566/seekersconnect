"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  Copy,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Label,
} from "@/components/ui/label";

import {
  confirmPayment,
  rejectPayment,
} from "@/app/admin/(dashboard)/payments/actions";

export function PaymentReviewActions({
  requestId,
}: {
  requestId: string;
}) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    tracking,
    setTracking,
  ] = useState<{
    number: string;
    pin: string;
  } | null>(null);

  function handleConfirm() {
    setError("");

    startTransition(
      async () => {
        const result =
          await confirmPayment(
            requestId,
          );

        if (!result.success) {
          setError(
            result.error,
          );

          return;
        }

        setTracking({
          number:
            result.trackingNumber!,
          pin:
            result.trackingPin!,
        });
      },
    );
  }

  function handleReject() {
    setError("");

    startTransition(
      async () => {
        const result =
          await rejectPayment(
            requestId,
            rejectionReason,
          );

        if (!result.success) {
          setError(
            result.error,
          );

          return;
        }

        window.location.reload();
      },
    );
  }

  async function copyTracking() {
    if (!tracking) return;

    await navigator.clipboard.writeText(
      `Tracking Number: ${tracking.number}\nTracking PIN: ${tracking.pin}`,
    );
  }

  if (tracking) {
    return (
      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-emerald-950">
              Payment confirmed
            </h3>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Tracking details have been generated.
              Copy them now and send them to the
              customer.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Tracking Number
            </p>

            <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-950">
              {tracking.number}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Tracking PIN
            </p>

            <p className="mt-2 font-mono text-xl font-semibold tracking-[0.22em] text-slate-950">
              {tracking.pin}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 rounded-xl bg-white"
          onClick={copyTracking}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Tracking Details
        </Button>

        <p className="mt-4 text-xs leading-5 text-emerald-800">
          The PIN is not stored in readable form.
          Make sure the customer receives it before
          leaving this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="font-semibold text-emerald-950">
          Confirm Payment
        </h3>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Confirm only after verifying that the
          payment was successfully received by
          Seekers Connect 247.
        </p>

        <Button
          type="button"
          disabled={isPending}
          onClick={handleConfirm}
          className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Payment
            </>
          )}
        </Button>
      </div>

      <div className="rounded-[22px] border border-red-200 bg-red-50 p-5">
        <h3 className="font-semibold text-red-950">
          Reject Payment
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-800">
          Use this when the payment cannot be
          verified or the proof supplied is invalid.
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="rejectionReason">
            Reason
          </Label>

          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(
                event.target.value,
              )
            }
            placeholder="e.g. Transaction could not be verified."
            className="min-h-24 bg-white"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={
            isPending ||
            rejectionReason.trim().length <
              3
          }
          onClick={handleReject}
          className="mt-4 w-full rounded-xl border-red-300 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject Payment
        </Button>
      </div>
    </div>
  );
}