import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type PublicUniversitySummary = {
  id: string;

  code: string;

  name: string;

  location:
    | string
    | null;
};


/**
 * Returns active universities that currently have
 * at least one active request service.
 *
 * This keeps public university displays aligned with
 * the actual request catalog.
 */
export async function getPublicUniversities():
  Promise<PublicUniversitySummary[]> {
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
        .select(
          "university_id",
        )
        .eq(
          "active",
          true,
        ),
    ]);


  if (
    universitiesResult.error
  ) {
    console.error(
      "Public universities query failed:",
      universitiesResult.error,
    );

    return [];
  }


  if (
    servicesResult.error
  ) {
    console.error(
      "Public university services query failed:",
      servicesResult.error,
    );

    return [];
  }


  const universityIdsWithServices =
    new Set(
      (
        servicesResult.data ??
        []
      ).map(
        (
          service,
        ) =>
          service.university_id,
      ),
    );


 return (universitiesResult.data ?? [])
  .filter(
    (university) =>
      university.code !==
        "SC247" &&
      universityIdsWithServices.has(
        university.id,
      ),
  )
  .map((university) => ({
    id: university.id,
    code: university.code,
    name: university.name,
    location:
      university.location,
  }));
}