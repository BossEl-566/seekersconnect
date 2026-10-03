"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  CircleCheckBig,
  Loader2,
  PackageCheck,
  Send,
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
  Textarea,
} from "@/components/ui/textarea";

import {
  advanceDeliveryWorkflow,
} from "@/app/admin/(dashboard)/requests/actions";

import type {
  RequestStatus,
} from "@/constants/request-status";


type DeliveryAction = {
  title:
    string;

  description:
    string;

  buttonLabel:
    string;

  showTrackingInput:
    boolean;

  trackingRequired:
    boolean;

  trackingLabel:
    string;

  trackingPlaceholder:
    string;

  trackingHelp:
    string;
};


// =========================================================
// GET DELIVERY ACTION
// =========================================================

function getDeliveryAction(
  status:
    RequestStatus,

  deliveryRequired:
    boolean,

  isGeneralService:
    boolean,
): DeliveryAction | null {
  // -------------------------------------------------------
  // GENERAL SERVICES
  // -------------------------------------------------------

  if (
    isGeneralService
  ) {
    if (
      status ===
      "PREPARING_DELIVERY"
    ) {
      return {
        title:
          "Dispatch Delivery",

        description:
          "The request is ready for delivery. Continue once the item has left for the customer's destination.",

        buttonLabel:
          "Mark as In Transit",

        showTrackingInput:
          true,

        trackingRequired:
          false,

        trackingLabel:
          "Delivery Reference",

        trackingPlaceholder:
          "Optional rider, courier or delivery reference",

        trackingHelp:
          "Optional. Add a rider, courier or delivery reference if one is available.",
      };
    }


    if (
      status ===
      "IN_TRANSIT"
    ) {
      return {
        title:
          "Confirm Delivery",

        description:
          "Use this after confirming that the customer or recipient has received the item successfully.",

        buttonLabel:
          "Mark as Delivered",

        showTrackingInput:
          false,

        trackingRequired:
          false,

        trackingLabel:
          "",

        trackingPlaceholder:
          "",

        trackingHelp:
          "",
      };
    }


    if (
      status ===
      "DELIVERED"
    ) {
      return {
        title:
          "Complete Request",

        description:
          "Delivery has been completed. Close the request after confirming that no further action is required.",

        buttonLabel:
          "Complete Request",

        showTrackingInput:
          false,

        trackingRequired:
          false,

        trackingLabel:
          "",

        trackingPlaceholder:
          "",

        trackingHelp:
          "",
      };
    }


    return null;
  }


  // -------------------------------------------------------
  // ACADEMIC DOCUMENT DELIVERY
  // -------------------------------------------------------

  if (
    status ===
    "DOCUMENT_SCANNED"
  ) {
    if (
      deliveryRequired
    ) {
      return {
        title:
          "Prepare for Delivery",

        description:
          "The scanned document is ready. Begin preparing the physical document for EMS dispatch.",

        buttonLabel:
          "Start Delivery Preparation",

        showTrackingInput:
          false,

        trackingRequired:
          false,

        trackingLabel:
          "",

        trackingPlaceholder:
          "",

        trackingHelp:
          "",
      };
    }


    return {
      title:
        "Complete Request",

      description:
        "No physical delivery was requested. The scanned document is available to the customer and this request can now be completed.",

      buttonLabel:
        "Mark Request Completed",

      showTrackingInput:
        false,

      trackingRequired:
        false,

      trackingLabel:
        "",

      trackingPlaceholder:
        "",

      trackingHelp:
        "",
    };
  }


  if (
    status ===
    "PREPARING_DELIVERY"
  ) {
    return {
      title:
        "Hand Over to EMS",

      description:
        "Enter the EMS tracking number after the physical document has been handed over to EMS.",

      buttonLabel:
        "Mark as Handed to EMS",

      showTrackingInput:
        true,

      trackingRequired:
        true,

      trackingLabel:
        "EMS Tracking Number",

      trackingPlaceholder:
        "Enter EMS tracking number",

      trackingHelp:
        "Enter the official tracking number issued by EMS.",
    };
  }


  if (
    status ===
    "HANDED_TO_EMS"
  ) {
    return {
      title:
        "EMS Delivery Progress",

      description:
        "Mark the document as in transit once EMS has begun the delivery process.",

      buttonLabel:
        "Mark as In Transit",

      showTrackingInput:
        false,

      trackingRequired:
        false,

      trackingLabel:
        "",

      trackingPlaceholder:
        "",

      trackingHelp:
        "",
    };
  }


  if (
    status ===
    "IN_TRANSIT"
  ) {
    return {
      title:
        "Confirm Delivery",

      description:
        "Use this only after confirming that the customer's document has been delivered successfully.",

      buttonLabel:
        "Mark as Delivered",

      showTrackingInput:
        false,

      trackingRequired:
        false,

      trackingLabel:
        "",

      trackingPlaceholder:
        "",

      trackingHelp:
        "",
    };
  }


  if (
    status ===
    "DELIVERED"
  ) {
    return {
      title:
        "Complete Request",

      description:
        "Delivery has been completed. Close this request after confirming that no further action is required.",

      buttonLabel:
        "Complete Request",

      showTrackingInput:
        false,

      trackingRequired:
        false,

      trackingLabel:
        "",

      trackingPlaceholder:
        "",

      trackingHelp:
        "",
    };
  }


  return null;
}


// =========================================================
// COMPONENT
// =========================================================

export function RequestDeliveryActions({
  requestId,
  status,
  deliveryRequired,
  existingEmsTrackingNumber,
  isGeneralService,
}: {
  requestId:
    string;

  status:
    RequestStatus;

  deliveryRequired:
    boolean;

  existingEmsTrackingNumber:
    | string
    | null;

  isGeneralService:
    boolean;
}) {
  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const [
    trackingReference,
    setTrackingReference,
  ] =
    useState(
      existingEmsTrackingNumber ??
        "",
    );


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
    getDeliveryAction(
      status,
      deliveryRequired,
      isGeneralService,
    );


  if (
    !action
  ) {
    return null;
  }


  function handleAdvance() {
  setError("");
  setSuccess("");


  const currentAction =
    action;


  if (
    !currentAction
  ) {
    return;
  }


  if (
    currentAction.trackingRequired &&
    trackingReference
      .trim()
      .length <
      3
  ) {
    setError(
      isGeneralService
        ? "Enter the required delivery reference before continuing."
        : "Enter the EMS tracking number before continuing.",
    );

    return;
  }


  startTransition(
    async () => {
      const result =
        await advanceDeliveryWorkflow(
          requestId,
          trackingReference,
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
    <div className="rounded-[22px] border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          {status ===
          "DELIVERED" ? (
            <CircleCheckBig className="h-5 w-5" />
          ) : deliveryRequired ? (
            <Truck className="h-5 w-5" />
          ) : (
            <PackageCheck className="h-5 w-5" />
          )}
        </div>


        <div>
          <p className="font-semibold text-indigo-950">
            {
              action.title
            }
          </p>


          <p className="mt-1 text-sm leading-6 text-indigo-800">
            {
              action.description
            }
          </p>
        </div>
      </div>


      {action.showTrackingInput && (
        <div className="mt-5 space-y-2">
          <Label htmlFor="deliveryTrackingReference">
            {
              action.trackingLabel
            }

            {!action.trackingRequired && (
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            )}
          </Label>


          <Input
            id="deliveryTrackingReference"
            value={
              trackingReference
            }
            onChange={(
              event,
            ) =>
              setTrackingReference(
                event.target.value,
              )
            }
            placeholder={
              action.trackingPlaceholder
            }
            disabled={
              pending
            }
            className="bg-white"
          />


          <p className="text-xs leading-5 text-indigo-700">
            {
              action.trackingHelp
            }
          </p>
        </div>
      )}


      <div className="mt-5 space-y-2">
        <Label htmlFor="deliveryInternalNote">
          Internal Note

          <span className="ml-1 font-normal text-slate-400">
            {" "}
            (optional)
          </span>
        </Label>


        <Textarea
          id="deliveryInternalNote"
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
          placeholder="Add an internal note for other administrators..."
          disabled={
            pending
          }
          className="min-h-24 bg-white"
        />


        <p className="text-xs leading-5 text-indigo-700">
          Internal notes are visible only to administrators.
        </p>
      </div>


      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
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
        className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Updating...
          </>
        ) : (
          <>
            {status ===
            "PREPARING_DELIVERY" ? (
              <Send className="mr-2 h-4 w-4" />
            ) : status ===
              "IN_TRANSIT" ? (
              <PackageCheck className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}

            {
              action.buttonLabel
            }
          </>
        )}
      </Button>
    </div>
  );
}