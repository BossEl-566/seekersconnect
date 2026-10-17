"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type SitePageStatus =
  | "DRAFT"
  | "PUBLISHED";


export type SitePageUpdateInput = {
  id:
    string;

  slug:
    string;

  title:
    string;

  eyebrow:
    string;

  summary:
    string;

  content:
    string;

  status:
    SitePageStatus;

  seoTitle:
    string;

  seoDescription:
    string;

  bumpTermsVersion:
    boolean;
};


export async function updateSitePage(
  input:
    SitePageUpdateInput,
) {
  const admin =
    await requireSuperAdmin();


  const title =
    input.title.trim();


  const content =
    input.content.trim();


  if (
    !title
  ) {
    return {
      success:
        false,

      error:
        "Page title is required.",
    };
  }


  if (
    !content
  ) {
    return {
      success:
        false,

      error:
        "Page content is required.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data:
      current,

    error:
      currentError,
  } =
    await supabase
      .from(
        "site_pages",
      )
      .select(`
        id,
        slug,
        version
      `)
      .eq(
        "id",
        input.id,
      )
      .maybeSingle();


  if (
    currentError ||
    !current
  ) {
    return {
      success:
        false,

      error:
        "The page could not be found.",
    };
  }


  const nextVersion =
    current.slug ===
      "terms" &&
    input.bumpTermsVersion
      ? current.version +
        1
      : current.version;


  const {
    error,
  } =
    await supabase
      .from(
        "site_pages",
      )
      .update({
        title,

        eyebrow:
          input.eyebrow
            .trim() ||
          null,

        summary:
          input.summary
            .trim() ||
          null,

        content,

        status:
          input.status,

        version:
          nextVersion,

        seo_title:
          input.seoTitle
            .trim() ||
          null,

        seo_description:
          input.seoDescription
            .trim() ||
          null,

        updated_by:
          admin.id,
      })
      .eq(
        "id",
        input.id,
      );


  if (
    error
  ) {
    console.error(
      "Site page update failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The page could not be saved.",
    };
  }


  await supabase
    .from(
      "activity_logs",
    )
    .insert({
      actor_id:
        admin.id,

      action:
        "SITE_PAGE_UPDATED",

      entity_type:
        "site_page",

      entity_id:
        input.id,

      metadata: {
        slug:
          current.slug,

        version:
          nextVersion,

        status:
          input.status,

        terms_version_bumped:
          current.slug ===
            "terms" &&
          input.bumpTermsVersion,
      },
    });


  revalidatePath(
    "/admin/pages",
  );

  revalidatePath(
    `/${current.slug}`,
  );

  revalidatePath(
    "/request",
  );


  return {
    success:
      true,

    error:
      "",

    version:
      nextVersion,
  };
}