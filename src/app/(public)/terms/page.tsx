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


export const metadata:
  Metadata =
{
  title:
    "Terms and Conditions | Seekers Connect 247",
};


export default async function TermsPage() {
  const page =
    await getPublishedSitePage(
      "terms",
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
    />
  );
}