"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
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
  rejectPayment,
} from "@/app/admin/(dashboard)/payments/actions";

export function PaymentReviewActions({
  requestId,
}: {
  requestId: string;
}) {
    const router = useRouter();

const [copied, setCopied] =
  useState(false);
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
      try {
        const response =
          await fetch(
            `/api/admin/payments/${requestId}/confirm`,
            {
              method: "POST",
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          setError(
            result.message ||
              "Payment could not be confirmed.",
          );

          return;
        }

        setTracking({
          number:
            result.tracking.number,

          pin:
            result.tracking.pin,
        });
      } catch (error) {
        console.error(
          "Payment confirmation failed:",
          error,
        );

        setError(
          "Payment could not be confirmed. Please try again.",
        );
      }
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
    `Seekers Connect 247 Tracking Details

Tracking Number: ${tracking.number}
Tracking PIN: ${tracking.pin}

Track your request at:
https://seekersconnect247.com/track

Please keep your tracking PIN private.`,
  );

  setCopied(true);

  window.setTimeout(() => {
    setCopied(false);
  }, 2500);
}

  if (tracking) {
  const whatsappMessage =
    `Hello, your payment has been confirmed by Seekers Connect 247.%0A%0A` +
    `Tracking Number: ${encodeURIComponent(tracking.number)}%0A` +
    `Tracking PIN: ${encodeURIComponent(tracking.pin)}%0A%0A` +
    `Track your request at:%0A` +
    `https://seekersconnect247.com/track%0A%0A` +
    `Please keep your tracking PIN private.`;

  return (
    <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-semibold text-emerald-950">
            Payment confirmed successfully
          </h3>

          <p className="mt-1 text-sm leading-6 text-emerald-800">
            The customer&apos;s tracking details have been generated.
            These details will remain on this screen until you finish.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-950">
          Important — copy the PIN now
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          The tracking PIN is stored securely as a hash and cannot
          be retrieved in readable form after you leave this screen.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tracking Number
          </p>

          <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-950">
            {tracking.number}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tracking PIN
          </p>

          <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.3em] text-slate-950">
            {tracking.pin}
          </p>
        </div>
      </div>

      <Button
        type="button"
        className="mt-4 w-full rounded-xl bg-emerald-700 hover:bg-emerald-800"
        onClick={copyTracking}
      >
        <Copy className="mr-2 h-4 w-4" />

        {copied
          ? "Copied!"
          : "Copy Tracking Details"}
      </Button>

      <a
        href={`https://wa.me/?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Send via WhatsApp
      </a>

      <div className="mt-5 border-t border-emerald-200 pt-5">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl bg-white"
          onClick={() => {
            router.push("/admin/payments");
            router.refresh();
          }}
        >
          I&apos;ve copied/sent the details
        </Button>

        <p className="mt-3 text-center text-xs leading-5 text-emerald-800">
          Only continue after the customer&apos;s tracking number
          and PIN have been copied or sent.
        </p>
      </div>
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