"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  advanceRequest,
} from "@/app/admin/(dashboard)/requests/actions";

import {
  getNextRequestAction,
} from "@/lib/request-status";

import type {
  RequestStatus,
} from "@/constants/request-status";


export function RequestProcessingActions({
  requestId,
  status,
  isGeneralService,
  deliveryRequired,
}: {
  requestId:
    string;

  status:
    RequestStatus;

  isGeneralService:
    boolean;

  deliveryRequired:
    boolean;
}) {
  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const [
    note,
    setNote,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const action =
    getNextRequestAction(
      status,
      isGeneralService,
      deliveryRequired,
    );


  if (
    !action
  ) {
    return null;
  }


  function handleAdvance() {
    setError("");
    setSuccess("");


    startTransition(
      async () => {
        const result =
          await advanceRequest(
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


        setNote("");


        setSuccess(
          "Request status updated successfully.",
        );
      },
    );
  }


  return (
    <div className="rounded-[22px] border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <ArrowRight className="h-5 w-5" />
        </div>


        <div>
          <p className="font-semibold text-blue-950">
            {isGeneralService
              ? "Next Service Action"
              : "Next Workflow Action"}
          </p>


          <p className="mt-1 text-sm leading-6 text-blue-800">
            {
              action.description
            }
          </p>
        </div>
      </div>


      <div className="mt-5 space-y-2">
        <Label htmlFor="internalNote">
          Internal Note

          <span className="ml-1 font-normal text-slate-400">
            {" "}
            (optional)
          </span>
        </Label>


        <Textarea
          id="internalNote"
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
          placeholder="Add an internal note for other admins..."
          className="min-h-24 bg-white"
        />


        <p className="text-xs leading-5 text-blue-700">
          Internal notes are visible to admins only and will never
          appear on the public tracking page.
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
          pending
        }
        onClick={
          handleAdvance
        }
        className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Updating...
          </>
        ) : (
          <>
            {
              action.label
            }

            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}