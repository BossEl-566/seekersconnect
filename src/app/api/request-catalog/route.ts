import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  RequestCatalog,
  RequestCatalogFieldType,
} from "@/types/request-catalog";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


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

  university_id: string;

  slug: string;

  name: string;

  short_name: string;

  description:
    | string
    | null;

  category: string;

  form_type: string;

  active: boolean;
};


type RawUniversity = {
  id: string;

  code: string;

  name: string;

  location: string;

  active: boolean;
};


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


export async function GET() {
  try {
    const supabase =
      createAdminClient();


    // =====================================================
    // LOAD ACTIVE CATALOG DATA
    // =====================================================

    const [
      universitiesResult,
      servicesResult,
      fieldsResult,
    ] =
      await Promise.all([
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

        supabase
          .from("services")
          .select(`
            id,
            university_id,
            slug,
            name,
            short_name,
            description,
            category,
            form_type,
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


      return NextResponse.json(
        {
          message:
            "The request catalog could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }


    if (
      servicesResult.error
    ) {
      console.error(
        "Request catalog services failed:",
        servicesResult.error,
      );


      return NextResponse.json(
        {
          message:
            "The request catalog could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }


    if (
      fieldsResult.error
    ) {
      console.error(
        "Request catalog fields failed:",
        fieldsResult.error,
      );


      return NextResponse.json(
        {
          message:
            "The request catalog could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }


    // =====================================================
    // NORMALIZE DATA
    // =====================================================

    const universities =
      (universitiesResult.data ??
        []) as RawUniversity[];


    const services =
      (servicesResult.data ??
        []) as RawService[];


    const fields =
      (fieldsResult.data ??
        []) as RawField[];


    // =====================================================
    // ACTIVE UNIVERSITY IDS
    //
    // Even though the service itself may be active,
    // we never expose it if its university is disabled.
    // =====================================================

    const activeUniversityIds =
      new Set(
        universities.map(
          (university) =>
            university.id,
        ),
      );


    const validServices =
      services.filter(
        (service) =>
          activeUniversityIds.has(
            service.university_id,
          ),
      );


    const activeServiceIds =
      new Set(
        validServices.map(
          (service) =>
            service.id,
        ),
      );


    // =====================================================
    // GROUP FIELDS BY SERVICE
    // =====================================================

    const fieldsByService =
      new Map<
        string,
        RawField[]
      >();


    for (
      const field
      of fields
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
        ) ?? [];


      current.push(
        field,
      );


      fieldsByService.set(
        field.service_id,
        current,
      );
    }


    // =====================================================
    // GROUP SERVICES BY UNIVERSITY
    // =====================================================

    const servicesByUniversity =
      new Map<
        string,
        RawService[]
      >();


    for (
      const service
      of validServices
    ) {
      const current =
        servicesByUniversity.get(
          service.university_id,
        ) ?? [];


      current.push(
        service,
      );


      servicesByUniversity.set(
        service.university_id,
        current,
      );
    }


    // =====================================================
    // BUILD SAFE PUBLIC RESPONSE
    // =====================================================

    const catalog:
      RequestCatalog = {
        universities:
          universities.map(
            (
              university,
            ) => {
              const universityServices =
                servicesByUniversity.get(
                  university.id,
                ) ?? [];


              return {
                id:
                  university.id,

                code:
                  university.code,

                name:
                  university.name,

                location:
                  university.location,

                services:
                  universityServices.map(
                    (
                      service,
                    ) => {
                      const serviceFields =
                        fieldsByService.get(
                          service.id,
                        ) ?? [];


                      return {
                        id:
                          service.id,

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

                        formType:
                          service.form_type,

                        fields:
                          serviceFields
                            .sort(
                              (
                                a,
                                b,
                              ) =>
                                a.sort_order -
                                b.sort_order,
                            )
                            .map(
                              (
                                field,
                              ) => ({
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
                              }),
                            ),
                      };
                    },
                  ),
              };
            },
          ),
      };


    return NextResponse.json(
      {
        success: true,

        catalog,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Request catalog failed:",
      error,
    );


    return NextResponse.json(
      {
        message:
          "Something went wrong while loading the request catalog.",
      },
      {
        status: 500,
      },
    );
  }
}