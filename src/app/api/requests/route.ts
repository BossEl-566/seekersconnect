import {
  randomBytes,
  randomUUID,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  requestSubmissionSchema,
} from "@/lib/validation/request-submission";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  isPaymentMethodAvailable,
} from "@/lib/payment/payment-destinations";


export const runtime =
  "nodejs";


// =========================================================
// PAYMENT PROOF
// =========================================================

const MAX_FILE_SIZE =
  5 * 1024 * 1024;


const ALLOWED_FILES = {
  "image/jpeg":
    "jpg",

  "image/png":
    "png",

  "image/webp":
    "webp",

  "application/pdf":
    "pdf",
} as const;


// =========================================================
// FIELD TYPES
// =========================================================

const SUPPORTED_FIELD_TYPES =
  new Set([
    "text",
    "email",
    "tel",
    "number",
    "date",
    "textarea",
    "select",
  ]);


// =========================================================
// PRICING MODES
// =========================================================

type PricingMode =
  | "FIXED"
  | "PER_UNIT"
  | "STARTING_FROM"
  | "QUOTE_REQUIRED"
  | "FREE"
  | "MANUAL_PRICE";


const PRICING_MODES =
  new Set<PricingMode>([
    "FIXED",
    "PER_UNIT",
    "STARTING_FROM",
    "QUOTE_REQUIRED",
    "FREE",
    "MANUAL_PRICE",
  ]);


// =========================================================
// DATABASE TYPES
// =========================================================

type DatabaseUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;
};


type DatabaseService = {
  id:
    string;

  university_id:
    | string
    | null;

  service_category_id:
    string;

  service_scope:
    | "general"
    | "academic";

  slug:
    string;

  name:
    string;

  short_name:
    string;
};


type DatabaseFormField = {
  id:
    string;

  service_id:
    string;

  field_key:
    string;

  label:
    string;

  field_type:
    string;

  placeholder:
    | string
    | null;

  required:
    boolean;

  options:
    unknown;

  sort_order:
    number;
};


type DatabasePricing = {
  id:
    string;

  pricing_mode:
    string;

  currency:
    string;

  amount:
    string
    | number
    | null;

  unit_label:
    | string
    | null;

  minimum_quantity:
    string
    | number
    | null;

  maximum_quantity:
    string
    | number
    | null;

  display_note:
    | string
    | null;

  active:
    boolean;
};


type DatabasePricingOption = {
  id:
    string;

  service_pricing_id:
    string;

  code:
    string;

  label:
    string;

  unit_label:
    | string
    | null;

  display_order:
    number;

  active:
    boolean;
};


type DatabasePricingTier = {
  id:
    string;

  pricing_option_id:
    string;

  label:
    | string
    | null;

  amount:
    string
    | number;

  minimum_quantity:
    string
    | number
    | null;

  maximum_quantity:
    string
    | number
    | null;

  display_order:
    number;

  active:
    boolean;
};


type UsablePricingOption = {
  option:
    DatabasePricingOption;

  tiers:
    DatabasePricingTier[];
};


// =========================================================
// REQUEST NUMBER
// =========================================================

function generateRequestNumber(
  prefix:
    string,
) {
  const now =
    new Date();


  const date =
    `${now.getUTCFullYear()}` +
    `${String(
      now.getUTCMonth() +
        1,
    ).padStart(
      2,
      "0",
    )}` +
    `${String(
      now.getUTCDate(),
    ).padStart(
      2,
      "0",
    )}`;


  const suffix =
    randomBytes(
      5,
    )
      .toString(
        "hex",
      )
      .toUpperCase();


  return (
    `SC247-${prefix}-${date}-${suffix}`
  );
}


// =========================================================
// NUMBER HELPERS
// =========================================================

function nullableNumber(
  value:
    | string
    | number
    | null
    | undefined,
):
  number | null {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return null;
  }


  const number =
    Number(
      value,
    );


  return Number.isFinite(
    number,
  )
    ? number
    : null;
}


function positiveNumber(
  value:
    string
    | number
    | null
    | undefined,
):
  number | null {
  const number =
    nullableNumber(
      value,
    );


  if (
    number ===
      null ||
    number <=
      0
  ) {
    return null;
  }


  return number;
}


// =========================================================
// OPTIONS
// =========================================================

function normalizeOptions(
  value:
    unknown,
):
  string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }


  return value.filter(
    (
      option,
    ): option is string =>
      typeof option ===
        "string" &&
      option.trim().length >
        0,
  );
}


// =========================================================
// DYNAMIC VALUE VALIDATION
// =========================================================

function validateDynamicValue(
  field:
    DatabaseFormField,

  value:
    string,
):
  | string
  | null {
  const trimmed =
    value.trim();


  if (
    !trimmed
  ) {
    return null;
  }


  if (
    !SUPPORTED_FIELD_TYPES.has(
      field.field_type,
    )
  ) {
    return (
      `${field.label} has an unsupported field type.`
    );
  }


  if (
    field.field_type ===
    "select"
  ) {
    const options =
      normalizeOptions(
        field.options,
      );


    if (
      !options.includes(
        trimmed,
      )
    ) {
      return (
        `${field.label} contains an invalid selection.`
      );
    }
  }


  if (
    field.field_type ===
    "email"
  ) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        trimmed,
      )
    ) {
      return (
        `${field.label} must contain a valid email address.`
      );
    }
  }


  if (
    field.field_type ===
    "number"
  ) {
    const number =
      Number(
        trimmed,
      );


    if (
      !Number.isFinite(
        number,
      )
    ) {
      return (
        `${field.label} must contain a valid number.`
      );
    }
  }


  if (
    field.field_type ===
    "date"
  ) {
    const datePattern =
      /^\d{4}-\d{2}-\d{2}$/;


    if (
      !datePattern.test(
        trimmed,
      )
    ) {
      return (
        `${field.label} must contain a valid date.`
      );
    }
  }


  return null;
}


// =========================================================
// DATABASE RPC ERROR STATUS
// =========================================================

function rpcErrorStatus(
  code:
    string
    | undefined,
) {
  /*
   * PostgreSQL RAISE EXCEPTION normally reaches Supabase
   * with code P0001.
   *
   * Those are customer/request validation failures rather
   * than infrastructure errors.
   */
  return code ===
    "P0001"
    ? 400
    : 500;
}


// =========================================================
// POST REQUEST
// =========================================================

export async function POST(
  request:
    Request,
) {
  let uploadedPath:
    | string
    | null =
    null;


  try {
    // =====================================================
    // READ MULTIPART
    // =====================================================

    const formData =
      await request.formData();


    const draftValue =
      formData.get(
        "draft",
      );


    const paymentProofValue =
      formData.get(
        "paymentProof",
      );


    const paymentProof =
      paymentProofValue instanceof
        File
        ? paymentProofValue
        : null;


    if (
      typeof draftValue !==
      "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Request information is missing.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // PARSE
    // =====================================================

    let parsedJson:
      unknown;


    try {
      parsedJson =
        JSON.parse(
          draftValue,
        );
    } catch {
      return NextResponse.json(
        {
          message:
            "The submitted request information is invalid.",
        },
        {
          status:
            400,
        },
      );
    }


    const validation =
      requestSubmissionSchema.safeParse(
        parsedJson,
      );


    if (
      !validation.success
    ) {
      return NextResponse.json(
        {
          message:
            "Some request information is invalid.",

          issues:
            validation.error.flatten(),
        },
        {
          status:
            400,
        },
      );
    }


    const draft =
      validation.data;


    const supabase =
      createAdminClient();


    // =====================================================
    // AUTHORITATIVE SERVICE
    // =====================================================

    const {
      data:
        serviceData,

      error:
        serviceError,
    } =
      await supabase
        .from(
          "services",
        )
        .select(`
          id,
          university_id,
          service_category_id,
          service_scope,
          slug,
          name,
          short_name
        `)
        .eq(
          "id",
          draft.serviceId,
        )
        .eq(
          "active",
          true,
        )
        .maybeSingle();


    if (
      serviceError
    ) {
      console.error(
        "Service validation failed:",
        serviceError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate the selected service.",
        },
        {
          status:
            500,
        },
      );
    }


    if (
      !serviceData
    ) {
      return NextResponse.json(
        {
          message:
            "The selected service is unavailable.",
        },
        {
          status:
            400,
        },
      );
    }


    const service =
      serviceData as
        DatabaseService;


    // =====================================================
    // SERVICE SCOPE
    // =====================================================

    let university:
      DatabaseUniversity
      | null =
      null;


    if (
      service.service_scope ===
      "academic"
    ) {
      if (
        !service.university_id
      ) {
        console.error(
          "Academic service missing institution:",
          service.id,
        );


        return NextResponse.json(
          {
            message:
              "The selected academic service is not configured correctly.",
          },
          {
            status:
              500,
          },
        );
      }


      if (
        !draft.universityId
      ) {
        return NextResponse.json(
          {
            message:
              "Please select the institution for this academic service.",
          },
          {
            status:
              400,
          },
        );
      }


      if (
        draft.universityId !==
        service.university_id
      ) {
        return NextResponse.json(
          {
            message:
              "The selected service does not belong to the selected institution.",
          },
          {
            status:
              400,
          },
        );
      }


      const {
        data:
          universityData,

        error:
          universityError,
      } =
        await supabase
          .from(
            "universities",
          )
          .select(`
            id,
            code,
            name
          `)
          .eq(
            "id",
            service.university_id,
          )
          .eq(
            "active",
            true,
          )
          .maybeSingle();


      if (
        universityError
      ) {
        console.error(
          "Institution validation failed:",
          universityError,
        );


        return NextResponse.json(
          {
            message:
              "We could not validate the selected institution.",
          },
          {
            status:
              500,
          },
        );
      }


      if (
        !universityData
      ) {
        return NextResponse.json(
          {
            message:
              "The selected institution is unavailable.",
          },
          {
            status:
              400,
          },
        );
      }


      if (
        universityData.code
          .toUpperCase() ===
        "SC247"
      ) {
        return NextResponse.json(
          {
            message:
              "The selected institution is unavailable.",
          },
          {
            status:
              400,
          },
        );
      }


      university =
        universityData as
          DatabaseUniversity;
    } else if (
      service.service_scope ===
      "general"
    ) {
      if (
        service.university_id !==
        null
      ) {
        console.error(
          "General service still has university:",
          service.id,
        );


        return NextResponse.json(
          {
            message:
              "The selected service is not configured correctly.",
          },
          {
            status:
              500,
          },
        );
      }
    } else {
      return NextResponse.json(
        {
          message:
            "The selected service type is not supported.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // AUTHORITATIVE CURRENT PRICING
    // =====================================================

    const {
      data:
        pricingData,

      error:
        pricingError,
    } =
      await supabase
        .from(
          "service_pricing",
        )
        .select(`
          id,
          pricing_mode,
          currency,
          amount,
          unit_label,
          minimum_quantity,
          maximum_quantity,
          display_note,
          active
        `)
        .eq(
          "service_id",
          service.id,
        )
        .maybeSingle();


    if (
      pricingError
    ) {
      console.error(
        "Service pricing validation failed:",
        pricingError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate the pricing for this service.",
        },
        {
          status:
            500,
        },
      );
    }


    const pricing =
      pricingData as
        DatabasePricing
        | null;


    let pricingMode:
      PricingMode =
      "MANUAL_PRICE";


    let pricingCurrency =
      "GHS";


    let unitAmount:
      number | null =
      null;


    let minimumQuantity:
      number | null =
      null;


    let maximumQuantity:
      number | null =
      null;


    if (
      pricing &&
      pricing.active
    ) {
      if (
        !PRICING_MODES.has(
          pricing.pricing_mode as
            PricingMode,
        )
      ) {
        return NextResponse.json(
          {
            message:
              "The selected service has an invalid pricing configuration.",
          },
          {
            status:
              500,
          },
        );
      }


      pricingMode =
        pricing.pricing_mode as
          PricingMode;


      pricingCurrency =
        pricing.currency
          .trim()
          .toUpperCase() ||
        "GHS";


      unitAmount =
        nullableNumber(
          pricing.amount,
        );


      minimumQuantity =
        nullableNumber(
          pricing.minimum_quantity,
        );


      maximumQuantity =
        nullableNumber(
          pricing.maximum_quantity,
        );
    }


    // =====================================================
    // LOAD ACTIVE PRICING OPTIONS
    //
    // We mirror the public-catalog rule here:
    //
    // active option + at least one active tier = usable.
    //
    // PostgreSQL still performs the final authoritative
    // validation inside create_pricing_request_submission_v2.
    // =====================================================

    let usablePricingOptions:
      UsablePricingOption[] =
      [];


    const pricingSupportsOptions =
      pricing !==
        null &&
      pricing.active &&
      (
        pricingMode ===
          "FIXED" ||
        pricingMode ===
          "PER_UNIT" ||
        pricingMode ===
          "STARTING_FROM"
      );


    if (
      pricingSupportsOptions &&
      pricing
    ) {
      const {
        data:
          optionData,

        error:
          optionError,
      } =
        await supabase
          .from(
            "service_pricing_options",
          )
          .select(`
            id,
            service_pricing_id,
            code,
            label,
            unit_label,
            display_order,
            active
          `)
          .eq(
            "service_pricing_id",
            pricing.id,
          )
          .eq(
            "active",
            true,
          )
          .order(
            "display_order",
            {
              ascending:
                true,
            },
          );


      if (
        optionError
      ) {
        console.error(
          "Pricing option validation failed:",
          optionError,
        );


        return NextResponse.json(
          {
            message:
              "We could not validate the pricing options for this service.",
          },
          {
            status:
              500,
          },
        );
      }


      const options =
        (
          optionData ??
          []
        ) as DatabasePricingOption[];


      const optionIds =
        options.map(
          (
            option,
          ) =>
            option.id,
        );


      let tiers:
        DatabasePricingTier[] =
        [];


      if (
        optionIds.length >
        0
      ) {
        const {
          data:
            tierData,

          error:
            tierError,
        } =
          await supabase
            .from(
              "service_pricing_tiers",
            )
            .select(`
              id,
              pricing_option_id,
              label,
              amount,
              minimum_quantity,
              maximum_quantity,
              display_order,
              active
            `)
            .in(
              "pricing_option_id",
              optionIds,
            )
            .eq(
              "active",
              true,
            )
            .order(
              "display_order",
              {
                ascending:
                  true,
              },
            );


        if (
          tierError
        ) {
          console.error(
            "Pricing tier validation failed:",
            tierError,
          );


          return NextResponse.json(
            {
              message:
                "We could not validate the price tiers for this service.",
            },
            {
              status:
                500,
            },
          );
        }


        tiers =
          (
            tierData ??
            []
          ) as DatabasePricingTier[];
      }


      usablePricingOptions =
        options
          .map(
            (
              option,
            ) => ({
              option,

              tiers:
                tiers
                  .filter(
                    (
                      tier,
                    ) =>
                      tier.pricing_option_id ===
                      option.id,
                  )
                  .sort(
                    (
                      first,
                      second,
                    ) =>
                      first.display_order -
                        second.display_order ||
                      first.id.localeCompare(
                        second.id,
                      ),
                  ),
            }),
          )
          .filter(
            (
              entry,
            ) =>
              entry.tiers.length >
              0,
          );
    }


    // =====================================================
    // SELECTED PRICING OPTION
    // =====================================================

    const submittedPricingOptionId =
      draft.pricingOptionId ||
      null;


    let selectedPricingOption:
      UsablePricingOption
      | null =
      null;


    if (
      usablePricingOptions.length >
      0
    ) {
      if (
        !submittedPricingOptionId
      ) {
        return NextResponse.json(
          {
            message:
              "Select a pricing option for this service.",
          },
          {
            status:
              400,
          },
        );
      }


      selectedPricingOption =
        usablePricingOptions.find(
          (
            entry,
          ) =>
            entry.option.id ===
            submittedPricingOptionId,
        ) ??
        null;


      if (
        !selectedPricingOption
      ) {
        return NextResponse.json(
          {
            message:
              "The selected pricing option is no longer available.",
          },
          {
            status:
              400,
          },
        );
      }
    } else if (
      submittedPricingOptionId
    ) {
      return NextResponse.json(
        {
          message:
            "The selected pricing option is no longer available.",
        },
        {
          status:
            400,
        },
      );
    }


    // =====================================================
    // PAYMENT REQUIREMENT
    // =====================================================

    const paymentRequiredNow =
      pricingMode ===
        "FIXED" ||
      pricingMode ===
        "PER_UNIT";


    // =====================================================
    // PRICING MODE VALIDATION
    //
    // This validation gives the customer a useful API error
    // before a proof file is uploaded.
    //
    // PostgreSQL V2 repeats the important checks and remains
    // the final authority.
    // =====================================================

    let pricingQuantity:
      number | null =
      null;


    let previewTier:
      DatabasePricingTier
      | null =
      null;


    // -----------------------------------------------------
    // FIXED
    // -----------------------------------------------------

    if (
      pricingMode ===
      "FIXED"
    ) {
      if (
        selectedPricingOption
      ) {
        previewTier =
          selectedPricingOption
            .tiers[0] ??
          null;


        if (
          !previewTier ||
          positiveNumber(
            previewTier.amount,
          ) ===
            null
        ) {
          return NextResponse.json(
            {
              message:
                "The selected pricing option does not currently have a valid price.",
            },
            {
              status:
                400,
            },
          );
        }
      } else if (
        unitAmount ===
          null ||
        unitAmount <=
          0
      ) {
        return NextResponse.json(
          {
            message:
              "This service does not currently have a valid fixed price.",
          },
          {
            status:
              400,
          },
        );
      }
    }


    // -----------------------------------------------------
    // PER UNIT
    // -----------------------------------------------------

    if (
      pricingMode ===
      "PER_UNIT"
    ) {
      pricingQuantity =
        Number(
          draft.pricingQuantity,
        );


      if (
        !Number.isFinite(
          pricingQuantity,
        ) ||
        pricingQuantity <=
          0
      ) {
        return NextResponse.json(
          {
            message:
              "Enter a valid quantity for this service.",
          },
          {
            status:
              400,
          },
        );
      }


      if (
        selectedPricingOption
      ) {
        previewTier =
          selectedPricingOption
            .tiers
            .find(
              (
                tier,
              ) => {
                const minimum =
                  nullableNumber(
                    tier.minimum_quantity,
                  );


                const maximum =
                  nullableNumber(
                    tier.maximum_quantity,
                  );


                if (
                  minimum ===
                  null
                ) {
                  return false;
                }


                return (
                  pricingQuantity !==
                    null &&
                  pricingQuantity >=
                    minimum &&
                  (
                    maximum ===
                      null ||
                    pricingQuantity <=
                      maximum
                  )
                );
              },
            ) ??
          null;


        if (
          !previewTier
        ) {
          return NextResponse.json(
            {
              message:
                "The entered quantity does not match an active price tier for the selected option.",
            },
            {
              status:
                400,
            },
          );
        }


        if (
          positiveNumber(
            previewTier.amount,
          ) ===
          null
        ) {
          return NextResponse.json(
            {
              message:
                "The selected price tier is not configured correctly.",
            },
            {
              status:
                400,
            },
          );
        }
      } else {
        if (
          unitAmount ===
            null ||
          unitAmount <=
            0
        ) {
          return NextResponse.json(
            {
              message:
                "This service does not currently have a valid unit price.",
            },
            {
              status:
                400,
            },
          );
        }


        if (
          minimumQuantity !==
            null &&
          pricingQuantity <
            minimumQuantity
        ) {
          return NextResponse.json(
            {
              message:
                `The minimum quantity for this service is ${minimumQuantity}.`,
            },
            {
              status:
                400,
            },
          );
        }


        if (
          maximumQuantity !==
            null &&
          pricingQuantity >
            maximumQuantity
        ) {
          return NextResponse.json(
            {
              message:
                `The maximum quantity for this service is ${maximumQuantity}.`,
            },
            {
              status:
                400,
            },
          );
        }
      }
    }


    // -----------------------------------------------------
    // STARTING FROM
    // -----------------------------------------------------

    if (
      pricingMode ===
      "STARTING_FROM"
    ) {
      if (
        selectedPricingOption
      ) {
        previewTier =
          selectedPricingOption
            .tiers[0] ??
          null;


        if (
          !previewTier ||
          positiveNumber(
            previewTier.amount,
          ) ===
            null
        ) {
          return NextResponse.json(
            {
              message:
                "The selected pricing option does not currently have a valid starting price.",
            },
            {
              status:
                400,
            },
          );
        }
      } else if (
        unitAmount ===
          null ||
        unitAmount <=
          0
      ) {
        return NextResponse.json(
          {
            message:
              "This service does not currently have a valid starting price.",
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // SERVICE FORM FIELDS
    // =====================================================

    const {
      data:
        fieldsData,

      error:
        fieldsError,
    } =
      await supabase
        .from(
          "service_form_fields",
        )
        .select(`
          id,
          service_id,
          field_key,
          label,
          field_type,
          placeholder,
          required,
          options,
          sort_order
        `)
        .eq(
          "service_id",
          service.id,
        )
        .eq(
          "active",
          true,
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        );


    if (
      fieldsError
    ) {
      console.error(
        "Service form field validation failed:",
        fieldsError,
      );


      return NextResponse.json(
        {
          message:
            "We could not validate the information required for this service.",
        },
        {
          status:
            500,
        },
      );
    }


    const fields =
      (
        fieldsData ??
        []
      ) as DatabaseFormField[];


    const allowedFieldKeys =
      new Set(
        fields.map(
          (
            field,
          ) =>
            field.field_key,
        ),
      );


    const unexpectedFields =
      Object.entries(
        draft.responses,
      )
        .filter(
          ([
            key,
            value,
          ]) =>
            value.trim() !==
              "" &&
            !allowedFieldKeys.has(
              key,
            ),
        )
        .map(
          ([
            key,
          ]) =>
            key,
        );


    if (
      unexpectedFields.length >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "The submitted information does not match the selected service.",
        },
        {
          status:
            400,
        },
      );
    }


    const missingFields =
      fields.filter(
        (
          field,
        ) =>
          field.required &&
          !draft.responses[
            field.field_key
          ]?.trim(),
      );


    if (
      missingFields.length >
      0
    ) {
      return NextResponse.json(
        {
          message:
            "Required service information is missing.",

          fields:
            missingFields.map(
              (
                field,
              ) =>
                field.label,
            ),
        },
        {
          status:
            400,
        },
      );
    }


    for (
      const field of
      fields
    ) {
      const value =
        draft.responses[
          field.field_key
        ] ??
        "";


      const fieldError =
        validateDynamicValue(
          field,
          value,
        );


      if (
        fieldError
      ) {
        return NextResponse.json(
          {
            message:
              fieldError,
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // DELIVERY
    // =====================================================

    if (
      draft.delivery.required
    ) {
      const deliveryComplete =
        draft.delivery
          .fullName
          .trim() &&
        draft.delivery
          .areaTown
          .trim() &&
        draft.delivery
          .cityDistrict
          .trim() &&
        draft.delivery
          .region
          .trim() &&
        draft.delivery
          .phone
          .trim() &&
        draft.delivery
          .emergencyContact
          .trim();


      if (
        !deliveryComplete
      ) {
        return NextResponse.json(
          {
            message:
              "Please complete the required physical delivery information.",
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // PAYMENT
    //
    // Only FIXED and PER_UNIT require payment immediately.
    // =====================================================

    let extension:
      string | null =
      null;


    if (
      paymentRequiredNow
    ) {
      if (
        !draft.paymentMethod
      ) {
        return NextResponse.json(
          {
            message:
              "Select a payment method.",
          },
          {
            status:
              400,
          },
        );
      }


      const systemSettings =
        await getSystemSettings();


      if (
        !isPaymentMethodAvailable(
          systemSettings.payment,
          pricingCurrency,
          draft.paymentMethod,
        )
      ) {
        return NextResponse.json(
          {
            message:
              `The selected payment method is not available for ${pricingCurrency}.`,
          },
          {
            status:
              400,
          },
        );
      }


      if (
        !paymentProof
      ) {
        return NextResponse.json(
          {
            message:
              "Please upload proof of payment.",
          },
          {
            status:
              400,
          },
        );
      }


      if (
        paymentProof.size <=
        0
      ) {
        return NextResponse.json(
          {
            message:
              "The uploaded payment proof is empty.",
          },
          {
            status:
              400,
          },
        );
      }


      if (
        paymentProof.size >
        MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            message:
              "Payment proof must be 5 MB or smaller.",
          },
          {
            status:
              400,
          },
        );
      }


      extension =
        ALLOWED_FILES[
          paymentProof.type as
            keyof typeof ALLOWED_FILES
        ] ??
        null;


      if (
        !extension
      ) {
        return NextResponse.json(
          {
            message:
              "Payment proof must be a JPG, PNG, WEBP or PDF file.",
          },
          {
            status:
              400,
          },
        );
      }
    }


    // =====================================================
    // IDENTIFIERS
    // =====================================================

    const requestId =
      randomUUID();


    const requestPrefix =
      service.service_scope ===
        "academic"
        ? university?.code ??
          "ACADEMIC"
        : "SC247";


    const requestNumber =
      generateRequestNumber(
        requestPrefix,
      );


    // =====================================================
    // PAYMENT PROOF UPLOAD
    // =====================================================

    let storagePath:
      string | null =
      null;


    if (
      paymentRequiredNow &&
      paymentProof &&
      extension
    ) {
      storagePath =
        `requests/${requestId}/` +
        `payment-proof.${extension}`;


      const fileBuffer =
        await paymentProof
          .arrayBuffer();


      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "payment-proofs",
          )
          .upload(
            storagePath,
            fileBuffer,
            {
              contentType:
                paymentProof.type,

              upsert:
                false,
            },
          );


      if (
        uploadError
      ) {
        console.error(
          "Payment proof upload failed:",
          uploadError,
        );


        return NextResponse.json(
          {
            message:
              "We could not upload the payment proof. Please try again.",
          },
          {
            status:
              500,
          },
        );
      }


      uploadedPath =
        storagePath;
    }


    // =====================================================
    // IMMUTABLE RESPONSE SNAPSHOT
    // =====================================================

    const responses =
      fields
        .map(
          (
            field,
          ) => ({
            fieldKey:
              field.field_key,

            label:
              field.label,

            value:
              draft.responses[
                field.field_key
              ] ??
              "",
          }),
        )
        .filter(
          (
            item,
          ) =>
            item.value
              .trim() !==
            "",
        );


    // =====================================================
    // CREATE REQUEST
    //
    // IMPORTANT:
    //
    // We pass only:
    // - selected option ID
    // - quantity
    // - payment evidence
    //
    // We DO NOT pass an amount calculated by the browser.
    //
    // PostgreSQL V2 independently resolves the option/tier
    // and calculates the authoritative price snapshot.
    // =====================================================

    const {
      data,

      error:
        databaseError,
    } =
      await supabase.rpc(
        "create_pricing_request_submission_v2",
        {
          p_request_id:
            requestId,

          p_request_number:
            requestNumber,

          p_service_id:
            service.id,

          p_first_name:
            draft.applicant
              .firstName,

          p_other_names:
            draft.applicant
              .otherNames,

          p_surname:
            draft.applicant
              .surname,

          p_gender:
            draft.applicant
              .gender,

          p_phone:
            draft.applicant
              .phone,

          p_email:
            draft.applicant
              .email,

          p_notes:
            draft.notes,

          p_responses:
            responses,

          p_delivery:
            draft.delivery,

          p_pricing_option_id:
            submittedPricingOptionId,

          p_pricing_quantity:
            pricingQuantity,

          p_payment_method:
            paymentRequiredNow
              ? draft.paymentMethod
              : null,

          p_proof_storage_path:
            paymentRequiredNow
              ? storagePath
              : null,
        },
      );


    // =====================================================
    // DATABASE FAILURE + UPLOAD ROLLBACK
    // =====================================================

    if (
      databaseError
    ) {
      console.error(
        "Pricing-option-aware request transaction failed:",
        databaseError,
      );


      if (
        uploadedPath
      ) {
        await supabase.storage
          .from(
            "payment-proofs",
          )
          .remove([
            uploadedPath,
          ]);


        uploadedPath =
          null;
      }


      return NextResponse.json(
        {
          message:
            databaseError.message ||
            "We could not save the request. Please try again.",
        },
        {
          status:
            rpcErrorStatus(
              databaseError.code,
            ),
        },
      );
    }


    // =====================================================
    // RESULT
    // =====================================================

    const created =
      Array.isArray(
        data,
      )
        ? data[0]
        : data;


    const newStatus =
      created?.new_status ??
      (
        paymentRequiredNow
          ? "AWAITING_PAYMENT_VERIFICATION"
          : pricingMode ===
              "FREE"
            ? "SUBMITTED"
            : "AWAITING_QUOTE"
      );


    /*
     * Pricing could theoretically change between the API
     * validation query and the PostgreSQL transaction.
     *
     * If PostgreSQL ultimately decides that payment was not
     * required, remove a proof uploaded during that race.
     */
    if (
      uploadedPath &&
      newStatus !==
        "AWAITING_PAYMENT_VERIFICATION"
    ) {
      await supabase.storage
        .from(
          "payment-proofs",
        )
        .remove([
          uploadedPath,
        ]);


      uploadedPath =
        null;
    }


    const totalAmount =
      created?.total_amount ===
        null ||
      created?.total_amount ===
        undefined
        ? null
        : Number(
            created.total_amount,
          );


    return NextResponse.json(
      {
        success:
          true,

        request: {
          id:
            created?.request_id ??
            requestId,

          requestNumber:
            created?.request_number ??
            requestNumber,

          status:
            newStatus,

          pricingMode:
            created?.pricing_mode ??
            pricingMode,

          currency:
            created?.currency ??
            pricingCurrency,

          totalAmount:
            Number.isFinite(
              totalAmount,
            )
              ? totalAmount
              : null,

          pricingOptionId:
            created
              ?.pricing_option_id ??
            null,

          pricingOptionLabel:
            created
              ?.pricing_option_label ??
            null,

          pricingTierId:
            created
              ?.pricing_tier_id ??
            null,

          pricingTierLabel:
            created
              ?.pricing_tier_label ??
            null,
        },
      },
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Request submission failed:",
      error,
    );


    // =====================================================
    // SAFETY CLEANUP
    // =====================================================

    if (
      uploadedPath
    ) {
      try {
        const supabase =
          createAdminClient();


        await supabase.storage
          .from(
            "payment-proofs",
          )
          .remove([
            uploadedPath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "Payment proof cleanup failed:",
          cleanupError,
        );
      }
    }


    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting your request.",
      },
      {
        status:
          500,
      },
    );
  }
}