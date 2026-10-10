import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  RequestCatalog,
  RequestCatalogCategory,
  RequestCatalogField,
  RequestCatalogFieldType,
  RequestCatalogPricing,
  RequestCatalogPricingMode,
  RequestCatalogPricingOption,
  RequestCatalogPricingTier,
  RequestCatalogService,
  RequestCatalogServiceCategorySummary,
  RequestCatalogUniversity,
} from "@/types/request-catalog";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


// =========================================================
// RAW DATABASE TYPES
// =========================================================

type RawField = {
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

  active:
    boolean;
};


type RawService = {
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

  description:
    | string
    | null;

  category:
    string;

  form_type:
    string;

  display_order:
    number;

  featured:
    boolean;

  image_url:
    | string
    | null;

  active:
    boolean;
};


type RawUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;

  location:
    | string
    | null;

  active:
    boolean;
};


type RawCategory = {
  id:
    string;

  slug:
    string;

  name:
    string;

  description:
    | string
    | null;

  icon_key:
    | string
    | null;

  display_order:
    number;

  active:
    boolean;
};


type RawPricing = {
  id:
    string;

  service_id:
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


type RawPricingOption = {
  id:
    string;

  service_pricing_id:
    string;

  code:
    string;

  label:
    string;

  description:
    | string
    | null;

  unit_label:
    | string
    | null;

  display_order:
    number;

  active:
    boolean;
};


type RawPricingTier = {
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


// =========================================================
// SUPPORTED FIELD TYPES
// =========================================================

const allowedFieldTypes =
  new Set<RequestCatalogFieldType>([
    "text",
    "email",
    "tel",
    "number",
    "date",
    "textarea",
    "select",
  ]);


// =========================================================
// SUPPORTED PRICING MODES
// =========================================================

const allowedPricingModes =
  new Set<RequestCatalogPricingMode>([
    "FIXED",
    "PER_UNIT",
    "STARTING_FROM",
    "QUOTE_REQUIRED",
    "FREE",
    "MANUAL_PRICE",
  ]);


// =========================================================
// NORMALIZE FIELD OPTIONS
// =========================================================

function normalizeOptions(
  value:
    unknown,
): string[] {
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
// NORMALIZE FIELD TYPE
// =========================================================

function normalizeFieldType(
  value:
    string,
): RequestCatalogFieldType {
  if (
    allowedFieldTypes.has(
      value as RequestCatalogFieldType,
    )
  ) {
    return value as RequestCatalogFieldType;
  }


  return "text";
}


// =========================================================
// BUILD FIELD
// =========================================================

function buildField(
  field:
    RawField,
): RequestCatalogField {
  return {
    id:
      field.id,

    key:
      field.field_key,

    label:
      field.label,

    type:
      normalizeFieldType(
        field.field_type,
      ),

    placeholder:
      field.placeholder,

    required:
      field.required,

    options:
      normalizeOptions(
        field.options,
      ),

    sortOrder:
      field.sort_order,
  };
}


// =========================================================
// NUMBER HELPERS
// =========================================================

function nullableNumber(
  value:
    string
    | number
    | null,
):
  number | null {
  if (
    value ===
    null
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
    | number,
):
  number | null {
  const number =
    Number(
      value,
    );


  if (
    !Number.isFinite(
      number,
    ) ||
    number <=
      0
  ) {
    return null;
  }


  return number;
}


// =========================================================
// BUILD PUBLIC PRICING TIER
// =========================================================

function buildPricingTier(
  tier:
    RawPricingTier,
):
  RequestCatalogPricingTier
  | null {
  if (
    !tier.active
  ) {
    return null;
  }


  const amount =
    positiveNumber(
      tier.amount,
    );


  if (
    amount ===
    null
  ) {
    return null;
  }


  return {
    id:
      tier.id,

    label:
      tier.label,

    amount,

    minimumQuantity:
      nullableNumber(
        tier.minimum_quantity,
      ),

    maximumQuantity:
      nullableNumber(
        tier.maximum_quantity,
      ),

    displayOrder:
      tier.display_order,
  };
}


// =========================================================
// BUILD PUBLIC PRICING OPTION
// =========================================================

function buildPricingOption(
  option:
    RawPricingOption,

  tiers:
    RawPricingTier[],
):
  RequestCatalogPricingOption
  | null {
  if (
    !option.active
  ) {
    return null;
  }


  const publicTiers =
    tiers
      .map(
        buildPricingTier,
      )
      .filter(
        (
          tier,
        ): tier is RequestCatalogPricingTier =>
          tier !==
          null,
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.displayOrder -
            second.displayOrder ||
          first.id.localeCompare(
            second.id,
          ),
      );


  /*
   * An incomplete option must not be exposed.
   *
   * This lets an administrator prepare an option without
   * breaking the public customer workflow.
   */
  if (
    publicTiers.length ===
    0
  ) {
    return null;
  }


  return {
    id:
      option.id,

    code:
      option.code,

    label:
      option.label,

    description:
      option.description,

    unitLabel:
      option.unit_label,

    displayOrder:
      option.display_order,

    tiers:
      publicTiers,
  };
}


// =========================================================
// BUILD PRICING
// =========================================================

function buildPricing(
  pricing:
    RawPricing
    | undefined,

  publicOptions:
    RequestCatalogPricingOption[],
):
  RequestCatalogPricing
  | null {
  if (
    !pricing ||
    !pricing.active
  ) {
    return null;
  }


  if (
    !allowedPricingModes.has(
      pricing.pricing_mode as RequestCatalogPricingMode,
    )
  ) {
    return null;
  }


  const mode =
    pricing.pricing_mode as RequestCatalogPricingMode;


  /*
   * Migration 030 permits options only for these modes.
   * Keeping the same rule here prevents accidental public
   * exposure if inconsistent data somehow enters the DB.
   */
  const options =
    (
      mode ===
        "FIXED" ||
      mode ===
        "PER_UNIT" ||
      mode ===
        "STARTING_FROM"
    )
      ? publicOptions
      : [];


  return {
    mode,

    currency:
      pricing.currency
        .trim()
        .toUpperCase(),

    amount:
      nullableNumber(
        pricing.amount,
      ),

    unitLabel:
      pricing.unit_label,

    minimumQuantity:
      nullableNumber(
        pricing.minimum_quantity,
      ),

    maximumQuantity:
      nullableNumber(
        pricing.maximum_quantity,
      ),

    displayNote:
      pricing.display_note,

    options,
  };
}


// =========================================================
// STANDARD ERROR
// =========================================================

function catalogErrorResponse() {
  return NextResponse.json(
    {
      success:
        false,

      message:
        "The request catalog could not be loaded.",
    },
    {
      status:
        500,
    },
  );
}


// =========================================================
// GET REQUEST CATALOG
// =========================================================

export async function GET() {
  try {
    const supabase =
      createAdminClient();


    // =====================================================
    // LOAD CATALOG
    // =====================================================

    const [
      universitiesResult,
      categoriesResult,
      servicesResult,
      fieldsResult,
      pricingResult,
      pricingOptionsResult,
      pricingTiersResult,
    ] =
      await Promise.all([
        // -------------------------------------------------
        // UNIVERSITIES
        // -------------------------------------------------

        supabase
          .from(
            "universities",
          )
          .select(`
            id,
            code,
            name,
            location,
            active
          `)
          .eq(
            "active",
            true,
          )
          .order(
            "name",
            {
              ascending:
                true,
            },
          ),


        // -------------------------------------------------
        // CATEGORIES
        // -------------------------------------------------

        supabase
          .from(
            "service_categories",
          )
          .select(`
            id,
            slug,
            name,
            description,
            icon_key,
            display_order,
            active
          `)
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
          )
          .order(
            "name",
            {
              ascending:
                true,
            },
          ),


        // -------------------------------------------------
        // SERVICES
        // -------------------------------------------------

        supabase
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
            short_name,
            description,
            category,
            form_type,
            display_order,
            featured,
            image_url,
            active
          `)
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
          )
          .order(
            "name",
            {
              ascending:
                true,
            },
          ),


        // -------------------------------------------------
        // FORM FIELDS
        // -------------------------------------------------

        supabase
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
            sort_order,
            active
          `)
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
          ),


        // -------------------------------------------------
        // SERVICE PRICING
        // -------------------------------------------------

        supabase
          .from(
            "service_pricing",
          )
          .select(`
            id,
            service_id,
            pricing_mode,
            currency,
            amount,
            unit_label,
            minimum_quantity,
            maximum_quantity,
            display_note,
            active
          `),


        // -------------------------------------------------
        // ACTIVE PRICING OPTIONS
        // -------------------------------------------------

        supabase
          .from(
            "service_pricing_options",
          )
          .select(`
            id,
            service_pricing_id,
            code,
            label,
            description,
            unit_label,
            display_order,
            active
          `)
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
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            },
          ),


        // -------------------------------------------------
        // ACTIVE PRICING TIERS
        // -------------------------------------------------

        supabase
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
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            },
          ),
      ]);


    // =====================================================
    // DATABASE ERRORS
    // =====================================================

    if (
      universitiesResult.error
    ) {
      console.error(
        "Request catalog universities failed:",
        universitiesResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      categoriesResult.error
    ) {
      console.error(
        "Request catalog categories failed:",
        categoriesResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      servicesResult.error
    ) {
      console.error(
        "Request catalog services failed:",
        servicesResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      fieldsResult.error
    ) {
      console.error(
        "Request catalog fields failed:",
        fieldsResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      pricingResult.error
    ) {
      console.error(
        "Request catalog pricing failed:",
        pricingResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      pricingOptionsResult.error
    ) {
      console.error(
        "Request catalog pricing options failed:",
        pricingOptionsResult.error,
      );

      return catalogErrorResponse();
    }


    if (
      pricingTiersResult.error
    ) {
      console.error(
        "Request catalog pricing tiers failed:",
        pricingTiersResult.error,
      );

      return catalogErrorResponse();
    }


    // =====================================================
    // NORMALIZE RESULTS
    // =====================================================

    const universities =
      (
        universitiesResult.data ??
        []
      ) as RawUniversity[];


    const categories =
      (
        categoriesResult.data ??
        []
      ) as RawCategory[];


    const services =
      (
        servicesResult.data ??
        []
      ) as RawService[];


    const fields =
      (
        fieldsResult.data ??
        []
      ) as RawField[];


    const pricingRows =
      (
        pricingResult.data ??
        []
      ) as RawPricing[];


    const pricingOptions =
      (
        pricingOptionsResult.data ??
        []
      ) as RawPricingOption[];


    const pricingTiers =
      (
        pricingTiersResult.data ??
        []
      ) as RawPricingTier[];


    // =====================================================
    // CORE LOOKUPS
    // =====================================================

    const universityById =
      new Map<
        string,
        RawUniversity
      >(
        universities.map(
          (
            university,
          ) => [
            university.id,
            university,
          ],
        ),
      );


    const categoryById =
      new Map<
        string,
        RawCategory
      >(
        categories.map(
          (
            category,
          ) => [
            category.id,
            category,
          ],
        ),
      );


    const pricingByServiceId =
      new Map<
        string,
        RawPricing
      >(
        pricingRows.map(
          (
            pricing,
          ) => [
            pricing.service_id,
            pricing,
          ],
        ),
      );


    // =====================================================
    // TIERS BY OPTION
    // =====================================================

    const tiersByOptionId =
      new Map<
        string,
        RawPricingTier[]
      >();


    for (
      const tier of
      pricingTiers
    ) {
      const current =
        tiersByOptionId.get(
          tier.pricing_option_id,
        ) ??
        [];


      current.push(
        tier,
      );


      tiersByOptionId.set(
        tier.pricing_option_id,
        current,
      );
    }


    // =====================================================
    // PUBLIC OPTIONS BY PARENT PRICING
    //
    // Only usable options are stored here.
    // =====================================================

    const optionsByPricingId =
      new Map<
        string,
        RequestCatalogPricingOption[]
      >();


    for (
      const option of
      pricingOptions
    ) {
      const publicOption =
        buildPricingOption(
          option,

          tiersByOptionId.get(
            option.id,
          ) ??
          [],
        );


      if (
        !publicOption
      ) {
        continue;
      }


      const current =
        optionsByPricingId.get(
          option.service_pricing_id,
        ) ??
        [];


      current.push(
        publicOption,
      );


      optionsByPricingId.set(
        option.service_pricing_id,
        current,
      );
    }


    for (
      const [
        pricingId,
        options,
      ] of
      optionsByPricingId
    ) {
      options.sort(
        (
          first,
          second,
        ) =>
          first.displayOrder -
            second.displayOrder ||
          first.label.localeCompare(
            second.label,
          ),
      );


      optionsByPricingId.set(
        pricingId,
        options,
      );
    }


    // =====================================================
    // VALID SERVICES
    //
    // general  -> university_id NULL
    // academic -> active real institution
    // =====================================================

    const validServices =
      services.filter(
        (
          service,
        ) => {
          const category =
            categoryById.get(
              service.service_category_id,
            );


          if (
            !category
          ) {
            return false;
          }


          if (
            service.service_scope ===
            "general"
          ) {
            return (
              service.university_id ===
              null
            );
          }


          if (
            service.service_scope ===
            "academic"
          ) {
            if (
              !service.university_id
            ) {
              return false;
            }


            const institution =
              universityById.get(
                service.university_id,
              );


            if (
              !institution
            ) {
              return false;
            }


            return (
              institution.code
                .toUpperCase() !==
              "SC247"
            );
          }


          return false;
        },
      );


    const activeServiceIds =
      new Set(
        validServices.map(
          (
            service,
          ) =>
            service.id,
        ),
      );


    // =====================================================
    // FIELDS BY SERVICE
    // =====================================================

    const fieldsByService =
      new Map<
        string,
        RawField[]
      >();


    for (
      const field of
      fields
    ) {
      if (
        !activeServiceIds.has(
          field.service_id,
        )
      ) {
        continue;
      }


      const current =
        fieldsByService.get(
          field.service_id,
        ) ??
        [];


      current.push(
        field,
      );


      fieldsByService.set(
        field.service_id,
        current,
      );
    }


    // =====================================================
    // BUILD SERVICE
    // =====================================================

    function buildService(
      service:
        RawService,
    ): RequestCatalogService {
      const category =
        categoryById.get(
          service.service_category_id,
        );


      if (
        !category
      ) {
        throw new Error(
          `Category missing for service ${service.id}`,
        );
      }


      const serviceCategory:
        RequestCatalogServiceCategorySummary =
      {
        id:
          category.id,

        slug:
          category.slug,

        name:
          category.name,

        description:
          category.description,

        iconKey:
          category.icon_key,

        displayOrder:
          category.display_order,
      };


      const serviceFields =
        [
          ...(
            fieldsByService.get(
              service.id,
            ) ??
            []
          ),
        ]
          .sort(
            (
              first,
              second,
            ) =>
              first.sort_order -
              second.sort_order,
          )
          .map(
            buildField,
          );


      const pricing =
        pricingByServiceId.get(
          service.id,
        );


      const publicPricing =
        buildPricing(
          pricing,

          pricing
            ? optionsByPricingId.get(
                pricing.id,
              ) ??
              []
            : [],
        );


      return {
        id:
          service.id,

        universityId:
          service.university_id,

        serviceCategoryId:
          service.service_category_id,

        serviceScope:
          service.service_scope,

        slug:
          service.slug,

        name:
          service.name,

        shortName:
          service.short_name,

        description:
          service.description,

        category:
          service.category,

        serviceCategory,

        formType:
          service.form_type,

        displayOrder:
          service.display_order,

        featured:
          service.featured,

        imageUrl:
          service.image_url,

        pricing:
          publicPricing,

        fields:
          serviceFields,
      };
    }


    // =====================================================
    // PUBLIC SERVICES
    // =====================================================

    const publicServices =
      validServices.map(
        buildService,
      );


    // =====================================================
    // GENERAL SERVICES
    // =====================================================

    const generalServices =
      publicServices
        .filter(
          (
            service,
          ) =>
            service.serviceScope ===
            "general",
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.displayOrder -
              second.displayOrder ||
            first.name.localeCompare(
              second.name,
            ),
        );


    // =====================================================
    // ACADEMIC SERVICES BY UNIVERSITY
    // =====================================================

    const academicServicesByUniversity =
      new Map<
        string,
        RequestCatalogService[]
      >();


    for (
      const service of
      publicServices
    ) {
      if (
        service.serviceScope !==
          "academic" ||
        !service.universityId
      ) {
        continue;
      }


      const current =
        academicServicesByUniversity.get(
          service.universityId,
        ) ??
        [];


      current.push(
        service,
      );


      academicServicesByUniversity.set(
        service.universityId,
        current,
      );
    }


    // =====================================================
    // PUBLIC UNIVERSITIES
    // =====================================================

    const publicUniversities:
      RequestCatalogUniversity[] =
      universities
        .filter(
          (
            university,
          ) =>
            university.code
              .toUpperCase() !==
            "SC247",
        )
        .map(
          (
            university,
          ) => {
            const servicesForUniversity =
              academicServicesByUniversity.get(
                university.id,
              ) ??
              [];


            return {
              id:
                university.id,

              code:
                university.code,

              name:
                university.name,

              location:
                university.location ??
                "",

              services:
                [
                  ...servicesForUniversity,
                ].sort(
                  (
                    first,
                    second,
                  ) =>
                    first.displayOrder -
                      second.displayOrder ||
                    first.name.localeCompare(
                      second.name,
                    ),
                ),
            };
          },
        )
        .filter(
          (
            university,
          ) =>
            university.services
              .length >
            0,
        );


    // =====================================================
    // CATEGORIES
    // =====================================================

    const publicCategories:
      RequestCatalogCategory[] =
      categories
        .map(
          (
            category,
          ) => {
            const categoryGeneralServices =
              generalServices.filter(
                (
                  service,
                ) =>
                  service.serviceCategoryId ===
                  category.id,
              );


            const academicServiceCount =
              publicServices.filter(
                (
                  service,
                ) =>
                  service.serviceScope ===
                    "academic" &&
                  service.serviceCategoryId ===
                    category.id,
              ).length;


            return {
              id:
                category.id,

              slug:
                category.slug,

              name:
                category.name,

              description:
                category.description,

              iconKey:
                category.icon_key,

              displayOrder:
                category.display_order,

              generalServices:
                categoryGeneralServices,

              academicServiceCount,
            };
          },
        )
        .filter(
          (
            category,
          ) =>
            category
              .generalServices
              .length >
              0 ||
            category
              .academicServiceCount >
              0,
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.displayOrder -
              second.displayOrder ||
            first.name.localeCompare(
              second.name,
            ),
        );


    // =====================================================
    // RESPONSE
    // =====================================================

    const catalog:
      RequestCatalog =
    {
      categories:
        publicCategories,

      generalServices,

      universities:
        publicUniversities,
    };


    return NextResponse.json(
      {
        success:
          true,

        catalog,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Request catalog failed:",
      error,
    );


    return NextResponse.json(
      {
        success:
          false,

        message:
          "Something went wrong while loading the request catalog.",
      },
      {
        status:
          500,
      },
    );
  }
}