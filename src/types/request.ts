export type UniversityId = "ucc" | "uew" | "ug" | "knust";

export type RequestFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select";

export type RequestField = {
  key: string;
  label: string;
  type: RequestFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type RequestService = {
  id: string;
  slug: string;

  universityId: UniversityId;

  name: string;
  shortName: string;
  description: string;

  category:
    | "transcript"
    | "attestation"
    | "proficiency"
    | "other";

  formType:
    | "ucc-degree"
    | "ucc-distance"
    | "ucc-college"
    | "generic";

  active: boolean;
};

export type RequestDraft = {
  universityId: string;
  serviceId: string;

  applicant: {
    firstName: string;
    otherNames: string;
    surname: string;
    gender: string;
    phone: string;
    email: string;
  };

  responses: Record<string, string>;

  delivery: {
    required: boolean;
    fullName: string;
    houseNumber: string;
    areaTown: string;
    cityDistrict: string;
    region: string;
    digitalAddress: string;
    phone: string;
    email: string;
    itemType: string;
    emergencyContact: string;
  };

  paymentMethod: "momo" | "bank" | "";

  notes: string;
};