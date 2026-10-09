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
   *
   * For an academic service this is resolved after the
   * customer selects the institution.
   */
  serviceId:
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


  paymentMethod:
    | "momo"
    | "bank"
    | "";


  notes:
    string;
};