export type RequestDraft = {
  /**
   * Supabase universities.id UUID.
   *
   * For the current compatibility wizard this is still used.
   * In the next phase it will become optional for general
   * services.
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
   * Responses to active service_form_fields.
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