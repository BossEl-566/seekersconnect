export const REQUEST_STATUSES = {
  SUBMITTED: {
    label: "Request Submitted",
    description: "Your request has been received.",
  },

  AWAITING_PAYMENT_VERIFICATION: {
    label: "Payment Verification",
    description: "Your payment proof is being reviewed.",
  },

  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    description: "Your payment has been successfully confirmed.",
  },

  PROCESSING_REQUEST: {
    label: "Processing Request",
    description: "We are preparing your request for submission.",
  },

  SUBMITTED_TO_UNIVERSITY: {
    label: "Submitted to University",
    description: "Your request has been submitted to the university.",
  },

  AWAITING_UNIVERSITY: {
    label: "Awaiting University",
    description: "We are waiting for the university to process your request.",
  },

  DOCUMENT_READY: {
    label: "Document Ready",
    description: "Your requested document is ready.",
  },

  DOCUMENT_SCANNED: {
    label: "Document Scanned",
    description: "A scanned copy of your document has been prepared.",
  },

  PREPARING_DELIVERY: {
    label: "Preparing Delivery",
    description: "Your document is being prepared for delivery.",
  },

  HANDED_TO_EMS: {
    label: "Handed to EMS",
    description: "Your document has been handed over to EMS.",
  },

  IN_TRANSIT: {
    label: "In Transit",
    description: "Your document is on its way to you.",
  },

  DELIVERED: {
    label: "Delivered",
    description: "Your document has been delivered.",
  },

  COMPLETED: {
    label: "Completed",
    description: "Your request has been completed.",
  },

  PAYMENT_REJECTED: {
    label: "Payment Requires Attention",
    description: "There is an issue with the submitted payment proof.",
  },

  MORE_INFORMATION_REQUIRED: {
    label: "Information Required",
    description: "Additional information is required to continue your request.",
  },

  ON_HOLD: {
    label: "On Hold",
    description: "Your request is temporarily on hold.",
  },

  CANCELLED: {
    label: "Cancelled",
    description: "This request has been cancelled.",
  },
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUSES;