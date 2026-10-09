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
  id: string;

  service_id: string;

  field_key: string;

  label: string;

  field_type: string;

  placeholder:
    | string
    | null;

  required: boolean;

  options: unknown;

  sort_order: number;

  active: boolean;
};


type RawService = {
  id: string;

  university_id:
    | string
    | null;

  service_category_id: string;

  service_scope:
    | "general"
    | "academic";

  slug: string;

  name: string;

  short_name: string;

  description:
    | string
    | null;

  /**
   * Legacy services.category column.
   *
   * Retained temporarily for compatibility with older
   * application code.
   */
  category: string;

  form_type: string;

  display_order: number;

  featured: boolean;

  image_url:
    | string
    | null;

  active: boolean;
};


type RawUniversity = {
  id: string;

  code: string;

  name: string;

  location:
    | string
    | null;

  active: boolean;
};


type RawCategory = {
  id: string;

  slug: string;

  name: string;

  description:
    | string
    | null;

  icon_key:
    | string
    | null;

  display_order: number;

  active: boolean;
};


// =========================================================
// SUPPORTED DYNAMIC FIELD TYPES
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
// NORMALIZE FIELD OPTIONS
// =========================================================

function normalizeOptions(
  value: unknown,
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
  value: string,
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
// BUILD PUBLIC FIELD
// =========================================================

function buildField(
  field: RawField,
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
// STANDARD ERROR RESPONSE
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
// GET PUBLIC REQUEST CATALOG
// =========================================================

export async function GET() {
  try {
    const supabase =
      createAdminClient();


    // =====================================================
    // LOAD ACTIVE DATA
    // =====================================================

    const [
      universitiesResult,
      categoriesResult,
      servicesResult,
      fieldsResult,
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
        // SERVICE CATEGORIES
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
        // DYNAMIC FORM FIELDS
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


    // =====================================================
    // NORMALIZE DATABASE RESULTS
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


    // =====================================================
    // LOOKUP MAPS
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


    // =====================================================
    // VALID SERVICES
    //
    // NORMALIZED PHASE 13 RULES
    //
    // GENERAL:
    //
    // service_scope = general
    // university_id = NULL
    //
    // ACADEMIC:
    //
    // service_scope = academic
    // university_id = active real institution
    //
    // SC247 is no longer used as an active service provider.
    // =====================================================

    const validServices =
      services.filter(
        (
          service,
        ) => {
          // Every public service must belong to an active
          // service category.

          const category =
            categoryById.get(
              service.service_category_id,
            );


          if (
            !category
          ) {
            return false;
          }


          // -----------------------------------------------
          // GENERAL SERVICES
          // -----------------------------------------------

          if (
            service.service_scope ===
            "general"
          ) {
            return (
              service.university_id ===
              null
            );
          }


          // -----------------------------------------------
          // ACADEMIC SERVICES
          // -----------------------------------------------

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


            // SC247 remains historical compatibility data.
            // It must not be exposed as an academic
            // institution.

            return (
              institution.code
                .toUpperCase() !==
              "SC247"
            );
          }


          return false;
        },
      );


    // =====================================================
    // ACTIVE SERVICE IDS
    // =====================================================

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
    // GROUP FORM FIELDS BY SERVICE
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
      // Ignore fields belonging to inactive / invalid
      // services.

      if (
        !activeServiceIds.has(
          field.service_id,
        )
      ) {
        continue;
      }


      const currentFields =
        fieldsByService.get(
          field.service_id,
        ) ??
        [];


      currentFields.push(
        field,
      );


      fieldsByService.set(
        field.service_id,
        currentFields,
      );
    }


    // =====================================================
    // BUILD PUBLIC SERVICE
    // =====================================================

    function buildService(
      service: RawService,
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

        /**
         * Legacy compatibility field.
         *
         * Keep until the remaining legacy services.category
         * architecture is removed in a later phase.
         */
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

        fields:
          serviceFields,
      };
    }


    // =====================================================
    // BUILD PUBLIC SERVICE OBJECTS
    // =====================================================

    const publicServices =
      validServices.map(
        buildService,
      );


    // =====================================================
    // GENERAL SERVICES
    //
    // Every service in this array is now guaranteed to be:
    //
    // service_scope = general
    // university_id = NULL
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
    // ACADEMIC SERVICES GROUPED BY UNIVERSITY
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


      const currentServices =
        academicServicesByUniversity.get(
          service.universityId,
        ) ??
        [];


      currentServices.push(
        service,
      );


      academicServicesByUniversity.set(
        service.universityId,
        currentServices,
      );
    }


    // =====================================================
    // PUBLIC ACADEMIC UNIVERSITY CATALOG
    //
    // SC247 no longer participates in the active catalog.
    //
    // Universities returned here are real institutions with
    // at least one active academic service.
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
    // PUBLIC CATEGORY CATALOG
    //
    // Categories become the first-level customer-facing
    // service grouping.
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

        // Do not expose empty categories.

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
    // FINAL PUBLIC CATALOG
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


    // =====================================================
    // RESPONSE
    // =====================================================

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