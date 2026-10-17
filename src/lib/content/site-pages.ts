import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export type PublicSitePage = {
  id:
    string;

  slug:
    string;

  title:
    string;

  eyebrow:
    string | null;

  summary:
    string | null;

  content:
    string;

  metadata:
    Record<
      string,
      unknown
    >;

  version:
    number;

  seoTitle:
    string | null;

  seoDescription:
    string | null;

  updatedAt:
    string;
};


type SitePageRow = {
  id:
    string;

  slug:
    string;

  title:
    string;

  eyebrow:
    string | null;

  summary:
    string | null;

  content:
    string;

  metadata:
    unknown;

  version:
    number;

  seo_title:
    string | null;

  seo_description:
    string | null;

  updated_at:
    string;
};


export async function getPublishedSitePage(
  slug:
    string,
): Promise<PublicSitePage | null> {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_pages",
      )
      .select(`
        id,
        slug,
        title,
        eyebrow,
        summary,
        content,
        metadata,
        version,
        seo_title,
        seo_description,
        updated_at
      `)
      .eq(
        "slug",
        slug,
      )
      .eq(
        "status",
        "PUBLISHED",
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "Public site page query failed:",
      error,
    );

    return null;
  }


  if (
    !data
  ) {
    return null;
  }


  const row =
    data as SitePageRow;


  return {
    id:
      row.id,

    slug:
      row.slug,

    title:
      row.title,

    eyebrow:
      row.eyebrow,

    summary:
      row.summary,

    content:
      row.content,

    metadata:
      row.metadata &&
      typeof row.metadata ===
        "object" &&
      !Array.isArray(
        row.metadata,
      )
        ? row.metadata as
            Record<
              string,
              unknown
            >
        : {},

    version:
      row.version,

    seoTitle:
      row.seo_title,

    seoDescription:
      row.seo_description,

    updatedAt:
      row.updated_at,
  };
}