export type RequestDraft = {
  /**
   * Supabase universities.id UUID.
   */
  universityId: string;


  /**
   * Supabase services.id UUID.
   */
  serviceId: string;


  applicant: {
    firstName: string;

    otherNames: string;

    surname: string;

    gender: string;

    phone: string;

    email: string;
  };


  /**
   * Responses to the active service_form_fields
   * associated with the selected service.
   *
   * Key = service_form_fields.field_key
   */
  responses: Record<
    string,
    string
  >;


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


  paymentMethod:
    | "momo"
    | "bank"
    | "";


  notes: string;
};