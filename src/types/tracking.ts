import type {
  RequestStatus,
} from "@/constants/request-status";


export type TrackingHistoryItem = {
  status:
    RequestStatus;

  message:
    | string
    | null;

  createdAt:
    string;
};


export type TrackingDocument = {
  id:
    string;

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

  createdAt:
    string;
};


export type TrackingResult = {
  requestNumber:
    string;

  trackingNumber:
    string;

  status:
    RequestStatus;

  submittedAt:
    string;

  trackingIssuedAt:
    | string
    | null;


  /**
   * Academic institution.
   *
   * Migration 021 temporarily continues returning an SC247
   * compatibility object for historical general requests,
   * but application logic must NOT use this to determine
   * service type.
   */
  university: {
    code:
      string;

    name:
      string;
  };


  /**
   * Service is now authoritative for request classification.
   */
  service: {
    id:
      string;

    name:
      string;

    shortName:
      string;

    scope:
      "general"
      | "academic";

    category: {
      slug:
        | string
        | null;

      name:
        | string
        | null;
    };
  };


  /**
   * Convenience metadata returned by the Phase 13 tracking
   * function.
   */
  serviceArea: {
    scope:
      "general"
      | "academic";

    categorySlug:
      | string
      | null;

    categoryName:
      | string
      | null;

    institutionRequired:
      boolean;
  };


  delivery: {
    required:
      boolean;

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