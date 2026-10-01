import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type PublicServiceSummary = {
  id: string;

  slug: string;

  name: string;

  shortName: string;

  description:
    | string
    | null;

  category: string;

  formType: string;
};


export type PublicServiceUniversity = {
  id: string;

  code: string;

  name: string;

  location:
    | string
    | null;

  services:
    PublicServiceSummary[];
};


// =========================================================
// PUBLIC SERVICE CATALOG
// =========================================================

export async function getPublicServiceCatalog():
  Promise<PublicServiceUniversity[]> {
  const supabase =
    createAdminClient();


  const [
    universitiesResult,
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
          "services",
        )
        .select(`
          id,
          university_id,
          slug,
          name,
          short_name,
          description,
          category,
          form_type
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
    servicesResult.error
  ) {
    console.error(
      "Public service catalog services query failed:",
      servicesResult.error,
    );

    return [];
  }


  const servicesByUniversity =
    new Map<
      string,
      PublicServiceSummary[]
    >();


  for (
    const service of
      servicesResult.data ??
      []
  ) {
    const existing =
      servicesByUniversity.get(
        service.university_id,
      ) ??
      [];


    existing.push({
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
    });


    servicesByUniversity.set(
      service.university_id,
      existing,
    );
  }


  return (
    universitiesResult.data ??
    []
  )
    .map(
      (
        university,
      ) => ({
        id:
          university.id,

        code:
          university.code,

        name:
          university.name,

        location:
          university.location,

        services:
          servicesByUniversity.get(
            university.id,
          ) ??
          [],
      }),
    )
    .filter(
      (
        university,
      ) =>
        university.services.length >
        0,
    );
}