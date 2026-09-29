import type {
  RequestStatus,
} from "@/constants/request-status";

export const PROCESSABLE_STATUSES: RequestStatus[] = [
  "PAYMENT_CONFIRMED",
  "PROCESSING_REQUEST",
  "SUBMITTED_TO_UNIVERSITY",
  "AWAITING_UNIVERSITY",
];

export function canAdvanceRequest(
  status: string,
) {
  return PROCESSABLE_STATUSES.includes(
    status as RequestStatus,
  );
}

export function getNextRequestAction(
  status: RequestStatus,
) {
  switch (status) {
    case "PAYMENT_CONFIRMED":
      return {
        nextStatus:
          "PROCESSING_REQUEST" as const,

        label:
          "Start Processing",

        description:
          "Begin preparing the customer request for submission to the university.",
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