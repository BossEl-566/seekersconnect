import type {
  RequestStatus,
} from "@/constants/request-status";


// =========================================================
// ACADEMIC WORKFLOW
// =========================================================

export const ACADEMIC_PROCESSABLE_STATUSES:
  RequestStatus[] = [
    "PAYMENT_CONFIRMED",
    "PROCESSING_REQUEST",
    "SUBMITTED_TO_UNIVERSITY",
    "AWAITING_UNIVERSITY",
  ];


// =========================================================
// GENERAL SERVICE WORKFLOW
// =========================================================

export const GENERAL_PROCESSABLE_STATUSES:
  RequestStatus[] = [
    "PAYMENT_CONFIRMED",
    "PROCESSING_REQUEST",
  ];


// =========================================================
// CAN ADVANCE
// =========================================================

export function canAdvanceRequest(
  status:
    string,

  isGeneralService:
    boolean,
) {
  const statuses =
    isGeneralService
      ? GENERAL_PROCESSABLE_STATUSES
      : ACADEMIC_PROCESSABLE_STATUSES;


  return statuses.includes(
    status as RequestStatus,
  );
}


// =========================================================
// NEXT WORKFLOW ACTION
// =========================================================

export function getNextRequestAction(
  status:
    RequestStatus,

  isGeneralService:
    boolean,

  deliveryRequired:
    boolean,
) {
  // -------------------------------------------------------
  // GENERAL SERVICES
  // -------------------------------------------------------

  if (
    isGeneralService
  ) {
    switch (
      status
    ) {
      case "PAYMENT_CONFIRMED":
        return {
          nextStatus:
            "PROCESSING_REQUEST" as const,

          label:
            "Start Processing",

          description:
            "Begin working on this customer service request.",
        };


      case "PROCESSING_REQUEST":
        if (
          deliveryRequired
        ) {
          return {
            nextStatus:
              "PREPARING_DELIVERY" as const,

            label:
              "Mark Ready for Delivery",

            description:
              "Use this after the errand, shopping or service work has been completed and the item is ready to be delivered.",
          };
        }


        return {
          nextStatus:
            "COMPLETED" as const,

          label:
            "Complete Request",

          description:
            "No final physical delivery is required. Complete the request after confirming that the requested service has been finished.",
        };


      default:
        return null;
    }
  }


  // -------------------------------------------------------
  // ACADEMIC SERVICES
  // -------------------------------------------------------

  switch (
    status
  ) {
    case "PAYMENT_CONFIRMED":
      return {
        nextStatus:
          "PROCESSING_REQUEST" as const,

        label:
          "Start Processing",

        description:
          "Begin preparing the customer's academic request for submission to the university.",
      };


    case "PROCESSING_REQUEST":
      return {
        nextStatus:
          "SUBMITTED_TO_UNIVERSITY" as const,

        label:
          "Mark Submitted to University",

        description:
          "Use this after the request has actually been submitted to the university.",
      };


    case "SUBMITTED_TO_UNIVERSITY":
      return {
        nextStatus:
          "AWAITING_UNIVERSITY" as const,

        label:
          "Mark as Awaiting University",

        description:
          "The university now has the request and processing is pending.",
      };


    case "AWAITING_UNIVERSITY":
      return {
        nextStatus:
          "DOCUMENT_READY" as const,

        label:
          "Mark Document Ready",

        description:
          "Use this only after the university has completed the requested document.",
      };


    default:
      return null;
  }
}