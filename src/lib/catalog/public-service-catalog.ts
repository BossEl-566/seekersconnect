import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type PublicServiceSummary = {
  id:
    string;

  slug:
    string;

  name:
    string;

  shortName:
    string;

  description:
    string | null;

  category:
    string;

  formType:
    string;

  serviceScope:
    "general"
    | "academic";

  serviceCategoryId:
    string | null;

  serviceCategorySlug:
    string | null;

  serviceCategoryName:
    string | null;

  displayOrder:
    number;

  featured:
    boolean;

  imageUrl:
    string | null;
};


export type PublicServiceUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;

  location:
    string | null;

  services:
    PublicServiceSummary[];
};


type RawService = {
  id:
    string;

  university_id:
    string | null;

  service_category_id:
    string | null;

  service_scope:
    "general"
    | "academic";

  slug:
    string;

  name:
    string;

  short_name:
    string;

  description:
    string | null;

  category:
    string;

  form_type:
    string;

  display_order:
    number;

  featured:
    boolean;

  image_url:
    string | null;
};


type RawUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;

  location:
    string | null;
};


type RawCategory = {
  id:
    string;

  slug:
    string;

  name:
    string;

  display_order:
    number;
};


// =========================================================
// PUBLIC SERVICE CATALOG
//
// IMPORTANT:
//
// General services do NOT need a university anymore.
//
// This helper creates one synthetic SC247 provider containing
// every active service whose service_scope = "general".
//
// Academic services continue to be grouped by university.
// =========================================================

export async function getPublicServiceCatalog():
  Promise<PublicServiceUniversity[]> {
  const supabase =
    createAdminClient();


  const [
    universitiesResult,
    categoriesResult,
    servicesResult,
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
          location
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
          "service_categories",
        )
        .select(`
          id,
          slug,
          name,
          display_order
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
        ),


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
          image_url
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
    ]);


  if (
    universitiesResult.error
  ) {
    console.error(
      "Public service catalog universities query failed:",
      universitiesResult.error,
    );

    return [];
  }


  if (
    categoriesResult.error
  ) {
    console.error(
      "Public service catalog categories query failed:",
      categoriesResult.error,
    );

    return [];
  }


  if (
    servicesResult.error
  ) {
    console.error(
      "Public service catalog services query failed:",
      servicesResult.error,
    );

    return [];
  }


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


  const categoryById =
    new Map(
      categories.map(
        (
          category,
        ) => [
          category.id,
          category,
        ],
      ),
    );


  function normalizeService(
    service:
      RawService,
  ): PublicServiceSummary {
    const serviceCategory =
      service.service_category_id
        ? categoryById.get(
            service.service_category_id,
          ) ??
          null
        : null;


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

      serviceScope:
        service.service_scope,

      serviceCategoryId:
        service.service_category_id,

      serviceCategorySlug:
        serviceCategory?.slug ??
        null,

      serviceCategoryName:
        serviceCategory?.name ??
        null,

      displayOrder:
        service.display_order,

      featured:
        service.featured,

      imageUrl:
        service.image_url,
    };
  }


  // =======================================================
  // GENERAL SERVICES
  // =======================================================

  const generalServices =
    services
      .filter(
        (
          service,
        ) =>
          service.service_scope ===
          "general",
      )
      .map(
        normalizeService,
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


  const result:
    PublicServiceUniversity[] =
    [];


  if (
    generalServices.length >
    0
  ) {
    result.push({
      id:
        "seekers-connect-general-services",

      code:
        "SC247",

      name:
        "Seekers Connect 247",

      location:
        "Ghana",

      services:
        generalServices,
    });
  }


  // =======================================================
  // ACADEMIC SERVICES BY UNIVERSITY
  // =======================================================

  const academicByUniversity =
    new Map<
      string,
      PublicServiceSummary[]
    >();


  for (
    const service of
    services
  ) {
    if (
      service.service_scope !==
        "academic" ||
      !service.university_id
    ) {
      continue;
    }


    const current =
      academicByUniversity.get(
        service.university_id,
      ) ??
      [];


    current.push(
      normalizeService(
        service,
      ),
    );


    academicByUniversity.set(
      service.university_id,
      current,
    );
  }


  for (
    const university of
    universities
  ) {
    if (
      university.code
        .trim()
        .toUpperCase() ===
      "SC247"
    ) {
      continue;
    }


    const universityServices =
      academicByUniversity.get(
        university.id,
      ) ??
      [];


    if (
      universityServices.length ===
      0
    ) {
      continue;
    }


    universityServices.sort(
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


    result.push({
      id:
        university.id,

      code:
        university.code,

      name:
        university.name,

      location:
        university.location,

      services:
        universityServices,
    });
  }


  return result;
}