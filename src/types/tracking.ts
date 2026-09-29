import type {
  RequestStatus,
} from "@/constants/request-status";


export type TrackingHistoryItem = {
  status: RequestStatus;

  message:
    | string
    | null;

  createdAt: string;
};


export type TrackingDocument = {
  id: string;

  documentType:
    | "SCANNED_TRANSCRIPT"
    | "ATTESTATION"
    | "PROFICIENCY_LETTER"
    | "OTHER";

  fileName:
    | string
    | null;

  mimeType:
    | string
    | null;

  sizeBytes:
    | number
    | null;

  createdAt: string;
};


export type TrackingResult = {
  requestNumber: string;

  trackingNumber: string;

  status: RequestStatus;

  submittedAt: string;

  trackingIssuedAt:
    | string
    | null;


  university: {
    code: string;

    name: string;
  };


  service: {
    name: string;

    shortName: string;
  };


  delivery: {
    required: boolean;

    emsTrackingNumber:
      | string
      | null;

    dispatchDate:
      | string
      | null;

    deliveredDate:
      | string
      | null;
  };


  history:
    TrackingHistoryItem[];


  documents:
    TrackingDocument[];
};