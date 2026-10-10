export type RequestDraft = {
  /**
   * Phase 13 service category.
   */
  categoryId:
    string;


  /**
   * UI selection identifier.
   *
   * General:
   * general:<service UUID>
   *
   * Academic:
   * academic:<service slug>
   */
  serviceKey:
    string;


  /**
   * Required only for academic services.
   */
  universityId:
    string;


  /**
   * Concrete services.id UUID.
   */
  serviceId:
    string;


  /**
   * Optional pricing option selected by the customer.
   *
   * Examples:
   * Black & White
   * Colour
   * Standard
   * Express
   *
   * This is temporarily optional so the existing wizard
   * continues compiling until 13B-6C3 wires the selector.
   */
  pricingOptionId:
    string;


  /**
   * Used by PER_UNIT pricing.
   *
   * Stored as a string in the browser because it is bound
   * directly to a number input.
   *
   * The server/database performs the authoritative
   * calculation.
   */
  pricingQuantity:
    string;


  applicant: {
    firstName:
      string;

    otherNames:
      string;

    surname:
      string;

    gender:
      string;

    phone:
      string;

    email:
      string;
  };


  responses: Record<
    string,
    string
  >;


  delivery: {
    required:
      boolean;

    fullName:
      string;

    houseNumber:
      string;

    areaTown:
      string;

    cityDistrict:
      string;

    region:
      string;

    digitalAddress:
      string;

    phone:
      string;

    email:
      string;

    itemType:
      string;

    emergencyContact:
      string;
  };


  /**
   * Payment is only required immediately for:
   *
   * FIXED
   * PER_UNIT
   */
  paymentMethod:
    | "momo"
    | "bank"
    | "";


  notes:
    string;
};