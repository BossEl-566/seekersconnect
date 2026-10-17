import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  SitePageView,
} from "@/components/public/site-page-view";

import {
  getPublishedSitePage,
} from "@/lib/content/site-pages";


export async function generateMetadata():
  Promise<Metadata> {
  const page =
    await getPublishedSitePage(
      "about",
    );


  return {
    title:
      page?.seoTitle ||
      "About | Seekers Connect 247",

    description:
      page?.seoDescription ||
      page?.summary ||
      undefined,
  };
}


export default async function AboutPage() {
  const page =
    await getPublishedSitePage(
      "about",
    );


  if (
    !page
  ) {
    notFound();
  }


  return (
    <SitePageView
      page={
        page
      }
      showCeo
    />
  );
}